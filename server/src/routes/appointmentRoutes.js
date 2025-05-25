const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/authMiddleware');
const {
    bookAppointment,
    getAppointments,
    getDoctorQueue,
    updateAppointmentStatus,
    cancelAppointment
} = require('../controllers/appointmentController');
const Appointment = require('../models/Appointment');
const { io } = require('../socket');

// Debug and error handling middleware
router.use((req, res, next) => {
    console.log('Appointment route accessed:', {
        path: req.path,
        method: req.method,
        query: req.query,
        auth: req.headers.authorization,
        user: req.user ? {
            id: req.user._id,
            role: req.user.role
        } : 'No user'
    });

    // Add error handler specific to this route
    res.handleError = (error) => {
        console.error('Appointment route error:', {
            message: error.message,
            stack: error.stack,
            path: req.path,
            method: req.method
        });

        if (error.name === 'ValidationError') {
            return res.status(400).json({
                message: 'Validation error',
                errors: Object.values(error.errors).map(err => err.message)
            });
        }

        if (error.name === 'CastError') {
            return res.status(400).json({
                message: 'Invalid ID format'
            });
        }

        res.status(error.status || 500).json({
            message: error.message || 'Internal server error',
            error: process.env.NODE_ENV === 'development' ? error : undefined
        });
    };

    next();
});

// Get appointments with filters
router.get('/', protect, getAppointments);

// Create new appointment request
router.post('/', protect, bookAppointment);

// Get doctor's queue
router.get('/queue/:doctorId', protect, getDoctorQueue);

// Update appointment status
router.patch('/:id/status', protect, updateAppointmentStatus);

// Update appointment approval status
router.patch('/:id/approve', protect, authorize('doctor', 'staff'), async (req, res) => {
    try {
        const { status, message } = req.body;
        const validStatuses = ['approved', 'rejected'];

        if (!validStatuses.includes(status)) {
            return res.status(400).json({ 
                message: `Invalid status. Must be one of: ${validStatuses.join(', ')}` 
            });
        }

        const appointment = await Appointment.findById(req.params.id)
            .populate('patient', 'firstName lastName email')
            .populate('doctor', 'firstName lastName')
            .populate('hospital', 'name');

        if (!appointment) {
            return res.status(404).json({ message: 'Appointment not found' });
        }

        // Verify user has permission to approve this appointment
        const user = req.user;
        if (user.role === 'doctor' && user._id.toString() !== appointment.doctor._id.toString()) {
            return res.status(403).json({ message: 'Not authorized to approve this appointment' });
        }

        // Update appointment status
        appointment.approvalStatus = status;
        appointment.status = status === 'approved' ? 'approved' : 'rejected';
        appointment.approvalMessage = message || '';
        appointment.approvedBy = user._id;
        appointment.approvedAt = new Date();

        // Add approval message
        await appointment.addMessage(
            user._id,
            `Appointment ${status}${message ? `: ${message}` : ''}`
        );

        await appointment.save();

        // Notify patient about appointment status
        if (io) {
            io.to(`patient:${appointment.patient._id}`).emit('appointment:update', appointment);
        }

        res.json(appointment);
    } catch (err) {
        console.error('Error updating appointment approval:', err);
        res.status(500).json({ 
            message: 'Error updating appointment approval',
            error: process.env.NODE_ENV === 'development' ? err.message : undefined
        });
    }
});

// Add message to appointment
router.post('/:id/messages', protect, async (req, res) => {
    try {
        const { message } = req.body;
        if (!message) {
            return res.status(400).json({ message: 'Message is required' });
        }

        const appointment = await Appointment.findById(req.params.id)
            .populate('patient', 'firstName lastName email')
            .populate('doctor', 'firstName lastName')
            .populate('messages.sender', 'firstName lastName role');

        if (!appointment) {
            return res.status(404).json({ message: 'Appointment not found' });
        }

        // Verify user is either the patient or the doctor
        const user = req.user;
        if (user._id.toString() !== appointment.patient._id.toString() && 
            user._id.toString() !== appointment.doctor._id.toString()) {
            return res.status(403).json({ message: 'Not authorized to message this appointment' });
        }

        // Add message
        await appointment.addMessage(user._id, message);
        await appointment.populate('messages.sender', 'firstName lastName role');

        // Notify other party about new message
        const recipientId = user._id.toString() === appointment.patient._id.toString() 
            ? appointment.doctor._id 
            : appointment.patient._id;

        if (io) {
            io.to(`user:${recipientId}`).emit('appointment:message', {
                appointmentId: appointment._id,
                message: appointment.messages[appointment.messages.length - 1]
            });
        }

        res.json(appointment);
    } catch (err) {
        console.error('Error adding message:', err);
        res.status(500).json({ 
            message: 'Error adding message',
            error: process.env.NODE_ENV === 'development' ? err.message : undefined
        });
    }
});

// Mark messages as read
router.patch('/:id/messages/read', protect, async (req, res) => {
    try {
        const appointment = await Appointment.findById(req.params.id);
        if (!appointment) {
            return res.status(404).json({ message: 'Appointment not found' });
        }

        // Verify user is either the patient or the doctor
        const user = req.user;
        if (user._id.toString() !== appointment.patient._id.toString() && 
            user._id.toString() !== appointment.doctor._id.toString()) {
            return res.status(403).json({ message: 'Not authorized to update this appointment' });
        }

        await appointment.markMessagesAsRead(user._id);
        res.json(appointment);
    } catch (err) {
        console.error('Error marking messages as read:', err);
        res.status(500).json({ 
            message: 'Error marking messages as read',
            error: process.env.NODE_ENV === 'development' ? err.message : undefined
        });
    }
});

// Cancel appointment
router.delete('/:id', protect, cancelAppointment);

// Global error handler for this router
router.use((err, req, res, next) => {
    if (res.headersSent) {
        return next(err);
    }
    res.handleError(err);
});

module.exports = router;