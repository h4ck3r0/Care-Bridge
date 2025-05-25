# Queue System Implementation Plan

## Current Issues
1. Queues are not being created automatically
2. Field name inconsistency (hospital vs hospitalId)
3. Missing Queue model import in controller
4. No automated system for daily queue creation

## Implementation Plan

### 1. Fix Core Issues

```js
// In queueController.js - Add missing import
const Queue = require('../models/Queue');

// Fix field name consistency throughout the codebase
// Change all hospitalId references to hospital to match the model
```

### 2. Create Automated Queue Generation

Create a new service that will:
- Run on a schedule (daily at midnight)
- Create queues for all active doctors
- Set initial queue status as 'active'
- Handle edge cases (existing queues, inactive doctors)

```js
// Create new file: server/src/services/queueGenerationService.js

const generateDailyQueues = async () => {
    // 1. Get all active doctors
    // 2. Create new queues for each doctor
    // 3. Set queue status to active
    // 4. Handle any existing queues
};
```

### 3. Integration with Server

Add to server.js:
```js
const cron = require('node-cron');
const { generateDailyQueues } = require('./services/queueGenerationService');

// Schedule daily queue generation
cron.schedule('0 0 * * *', generateDailyQueues);

// Also run on server startup to ensure queues exist
generateDailyQueues();
```

### 4. Queue Status Management

Queues will have the following states:
- 'active' - Default state when created
- 'paused' - Doctor temporarily unavailable
- 'closed' - Queue closed for the day

### 5. Data Requirements

Each queue must include:
- hospital (ObjectId, ref: 'Hospital')
- doctor (ObjectId, ref: 'Doctor')
- date (Date, default: today)
- status (String: active/paused/closed)
- patients (Array of patient objects)
- maxPatients (Number)
- averageWaitTime (Number)

## Implementation Steps

1. Create queue generation service
2. Implement daily scheduling
3. Add queue existence checks in JoinQueue component
4. Add error handling and logging
5. Add monitoring for queue creation process

## Migration Plan

1. Create a migration script to:
   - Update existing queue documents to use consistent field names
   - Create missing queues for active doctors
   - Clean up any inconsistent data

2. Add validation to ensure future consistency:
   - Add field validation in Queue model
   - Add request validation in routes
   - Add response validation in frontend

## Testing Steps

1. Verify daily queue creation
2. Test queue joining process
3. Verify real-time updates
4. Test edge cases:
   - Server restart
   - Failed queue creation
   - Multiple queues for same doctor