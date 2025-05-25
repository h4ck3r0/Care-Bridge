const Queue = require('../models/Queue');
const User = require('../models/User');
const logger = require('../utils/logger');

/**
 * Generates queues for all active doctors for the current day
 * @returns {Promise<void>}
 */
const generateDailyQueues = async () => {
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        // Get all active doctors
        const activeDoctors = await User.find({
            role: 'doctor',
            isActive: true,
            hospitalId: { $exists: true }
        }).populate('hospitalId');

        if (!activeDoctors.length) {
            logger.info('No active doctors found for queue generation');
            return;
        }

        // Create queues for each doctor
        for (const doctor of activeDoctors) {
            try {
                // Check if queue already exists for today
                const existingQueue = await Queue.findOne({
                    doctor: doctor._id,
                    date: {
                        $gte: today,
                        $lt: tomorrow
                    }
                });

                if (existingQueue) {
                    logger.info(`Queue already exists for doctor ${doctor._id} on ${today}`);
                    continue;
                }

                // Create new queue
                const newQueue = await Queue.create({
                    hospital: doctor.hospitalId._id, // Using hospital instead of hospitalId
                    doctor: doctor._id,
                    date: today,
                    status: 'active',
                    maxPatients: 20,
                    averageWaitTime: 30,
                    patients: []
                });

                logger.info(`Created queue ${newQueue._id} for doctor ${doctor._id} at hospital ${doctor.hospitalId._id}`);
            } catch (error) {
                logger.error(`Error creating queue for doctor ${doctor._id}:`, error);
                // Continue with next doctor even if one fails
                continue;
            }
        }

        logger.info('Daily queue generation completed');
    } catch (error) {
        logger.error('Error in daily queue generation:', error);
        throw error;
    }
};

module.exports = {
    generateDailyQueues
};