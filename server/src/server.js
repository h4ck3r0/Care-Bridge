const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const { initializeSocket } = require('./socket');
require('dotenv').config();

const app = express();

// Debug middleware to log all requests
app.use((req, res, next) => {
    console.log(`${req.method} ${req.url}`, {
        body: req.body,
        query: req.query,
        headers: req.headers
    });
    next();
});

// Middleware
app.use(cors({
    origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/carebridge')
    .then(() => console.log('Connected to MongoDB'))
    .catch(err => console.error('MongoDB connection error:', err));

// Import routes
const authRoutes = require('./routes/authRoutes');
const doctorRoutes = require('./routes/doctorRoutes');
const appointmentRoutes = require('./routes/appointmentRoutes');
const queueRoutes = require('./routes/queueRoutes');
const hospitalRoutes = require('./routes/hospitalRoutes');


// Register base API path
app.use('/api', (req, res, next) => {
    console.log('API Request:', {
        method: req.method,
        path: req.path,
        query: req.query,
        body: req.body,
        auth: req.headers.authorization
    });
    next();
});

// Express routers
const appointmentsRouter = express.Router();
appointmentsRouter.use((req, res, next) => {
    console.log('Appointments route hit:', {
        path: req.path,
        method: req.method,
        query: req.query,
        auth: req.headers.authorization
    });
    next();
});

// Apply middleware to appointmentRoutes
appointmentRoutes.use(appointmentsRouter);

// Register routes with detailed logging
app.use('/api/auth', authRoutes);

// Register appointments routes with proper logging and error handling
app.use('/api/appointments', (req, res, next) => {
    console.log('[Appointments Route]:', {
        method: req.method,
        url: req.url,
        query: req.query,
        params: req.params,
        body: req.body,
        auth: req.headers.authorization
    });
    next();
}, appointmentRoutes);

app.use('/api/doctors', (req, res, next) => {
    console.log('[Doctors Route] Request:', req.method, req.url);
    next();
}, doctorRoutes);

// Debug endpoint to list all registered routes
app.get('/api/debug/routes', (req, res) => {
    const routes = app._router.stack
        .filter(r => r.route)
        .map(r => ({
            path: r.route.path,
            methods: Object.keys(r.route.methods)
        }));
    res.json(routes);
});
// Register remaining routes
app.use('/api/queues', queueRoutes);
app.use('/api/hospitals', hospitalRoutes);

// Add route verification endpoint
app.get('/api/verify/routes', (req, res) => {
    console.log('Registered routes:', {
        appointments: app._router.stack.some(r => r.regexp?.test('/api/appointments')),
        doctors: app._router.stack.some(r => r.regexp?.test('/api/doctors')),
        queues: app._router.stack.some(r => r.regexp?.test('/api/queues')),
        hospitals: app._router.stack.some(r => r.regexp?.test('/api/hospitals'))
    });
    res.json({
        message: 'Routes verified',
        routes: app._router.stack
            .filter(r => r.route || r.regexp)
            .map(r => ({
                path: r.route?.path || r.regexp?.source,
                methods: r.route ? Object.keys(r.route.methods) : 'middleware'
            }))
    });
});


// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Error middleware:', err.stack);
    res.status(500).json({
        message: 'Internal server error',
        error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
});

// 404 handler - must be last
app.use((req, res) => {
    console.error('404 Not Found:', req.method, req.url);
    res.status(404).json({
        message: `Cannot ${req.method} ${req.url}`,
        availableRoutes: app._router.stack
            .filter(r => r.route)
            .map(r => ({
                path: r.route.path,
                methods: Object.keys(r.route.methods)
            }))
    });
});

// Start server
const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

// Initialize socket.io
initializeSocket(server);

module.exports = { app, server }; 