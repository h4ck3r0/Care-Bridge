const mongoose = require('mongoose');
const Appointment = require('../models/Appointment');
const User = require('../models/User');
const DoctorProfile = require('../models/DoctorProfile');
const Hospital = require('../models/Hospital');
require('dotenv').config();

const seedAppointments = async () => {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        // Get a test patient, doctor, and hospital
        const patient = await User.findOne({ role: 'patient' });
        const doctor = await User.findOne({ role: 'doctor' });
        const doctorProfile = await DoctorProfile.findOne({ user: doctor._id });
        const hospital = await Hospital.findOne();

        if (!patient || !doctor || !doctorProfile || !hospital) {
            console.error('Test data not found');
            process.exit(1);
        }

        // Create test appointments
        const now = new Date();
        const appointments = [
            {
                patient: patient._id,
                doctor: doctor._id,
                hospital: hospital._id,
                appointmentTime: now,
                reason: 'Regular checkup',
                status: 'pending',
                approvalStatus: 'pending',
                notes: 'Fever and cough'
            },
            {
                patient: patient._id,
                doctor: doctor._id,
                hospital: hospital._id,
                appointmentTime: new Date(now.getTime() + 86400000), // Tomorrow
                reason: 'Follow-up visit',
                status: 'approved',
                approvalStatus: 'approved',
                approvalMessage: 'Appointment confirmed',
                approvedBy: doctor._id,
                approvedAt: now,
                notes: 'Post-treatment check'
            },
            {
                patient: patient._id,
                doctor: doctor._id,
                hospital: hospital._id,
                appointmentTime: new Date(now.getTime() - 86400000), // Yesterday
                reason: 'Initial consultation',
                status: 'completed',
                approvalStatus: 'approved',
                notes: 'First visit',
                prescription: 'Paracetamol 500mg',
                followUpDate: new Date(now.getTime() + 7 * 86400000) // 7 days from now
            },
            {
                patient: patient._id,
                doctor: doctor._id,
                hospital: hospital._id,
                appointmentTime: new Date(now.getTime() + 2 * 86400000), // Day after tomorrow
                reason: 'Emergency consultation',
                status: 'approved',
                approvalStatus: 'approved',
                approvalMessage: 'Emergency case - approved',
                approvedBy: doctor._id,
                approvedAt: now,
                notes: 'Severe pain in lower back'
            },
            {
                patient: patient._id,
                doctor: doctor._id,
                hospital: hospital._id,
                appointmentTime: new Date(now.getTime() + 3 * 86400000),
                reason: 'Regular checkup',
                status: 'rejected',
                approvalStatus: 'rejected',
                approvalMessage: 'Doctor unavailable on this date',
                notes: 'Annual checkup'
            }
        ];

        // Clear existing appointments
        await Appointment.deleteMany({});
        console.log('Cleared existing appointments');

        // Insert new appointments
        const createdAppointments = await Appointment.insertMany(appointments);
        console.log(`Created ${createdAppointments.length} test appointments`);

        process.exit(0);
    } catch (error) {
        console.error('Error seeding appointments:', error);
        process.exit(1);
    }
};

seedAppointments(); 