# Server.js Improvements Plan

## Overview
This document outlines the planned improvements for combining and optimizing the server.js file, removing socket.io integration, and enhancing core functionality.

## Key Changes

### 1. Environment Variables
```javascript
// Simplified environment checks
const requiredEnvVars = {
    MONGODB_URI: 'MongoDB connection string',
    JWT_SECRET: 'JWT secret key for authentication'
};

// Optional OpenAI integration
const API_KEY = process.env.OPENAI_API_KEY;
const API_BASE_URL = 'https://api.openai.com/v1';
```

### 2. Express Setup
```javascript
const app = express();
const server = http.createServer(app);

// Middleware configuration
app.use(express.json({ limit: '10mb' }));
app.use(cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Origin", "X-Requested-With", "Content-Type", "Accept", "Authorization"],
    credentials: true
}));
```

### 3. API Routes
```javascript
// Chat endpoint with feature checks
apiRouter.post('/chat', async (req, res) => {
    if (!API_KEY) {
        return res.status(503).json({ 
            error: 'Chat feature unavailable - OpenAI API key not configured' 
        });
    }
    // ... rest of chat implementation
});

// Image analysis with improved error handling
apiRouter.post('/analyze-image', async (req, res) => {
    if (!API_KEY) {
        return res.status(503).json({ 
            error: 'Image analysis unavailable - OpenAI API key not configured' 
        });
    }
    // ... rest of image analysis implementation
});
```

### 4. Database Connection
```javascript
mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then(() => {
    console.log('MongoDB connected successfully');
    const PORT = process.env.PORT || 5000;
    server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
})
.catch(err => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
});
```

### 5. Error Handling
```javascript
// Global error handler
app.use((err, req, res, next) => {
    console.error('Error details:', {
        message: err.message,
        stack: err.stack,
        path: req.path,
        method: req.method
    });
    
    res.status(err.status || 500).json({
        message: err.message || 'Something went wrong!',
        error: process.env.NODE_ENV === 'development' ? err : {}
    });
});

// Process error handlers
process.on('unhandledRejection', (err) => {
    console.error('Unhandled Promise Rejection:', err);
});

process.on('uncaughtException', (err) => {
    console.error('Uncaught Exception:', err);
    process.exit(1);
});
```

## Implementation Steps

1. Create backup of current server.js
2. Remove all socket.io related code and dependencies
3. Implement environment variable checks
4. Set up Express and middleware
5. Configure API routes with feature checks
6. Add improved error handling
7. Set up MongoDB connection with proper error handling
8. Test all endpoints and functionality

## Next Steps

After reviewing this plan, we should:

1. Switch to Code mode to implement these changes
2. Test the server functionality
3. Update any client code that was depending on socket.io
4. Document the API endpoints for the development team

Would you like to proceed with implementing these changes?