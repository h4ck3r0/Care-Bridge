import { io } from 'socket.io-client';

const SOCKET_URL = 'wss://care-bridge-onz4.onrender.com';
let socket = null;

export const initializeSocket = (token) => {
    if (!socket) {
        socket = io(SOCKET_URL, {
            auth: {
                token
            },
            transports: ['websocket'],
            reconnection: true,
            reconnectionAttempts: 5,
            reconnectionDelay: 1000
        });

        socket.on('connect', () => {
            console.log('Socket connected successfully');
        });

        socket.on('connect_error', (error) => {
            console.error('Socket connection error:', error.message);
        });

        socket.on('disconnect', (reason) => {
            console.log('Socket disconnected:', reason);
            if (reason === 'io server disconnect') {
                socket.connect();
            }
        });

        socket.on('error', (error) => {
            console.error('Socket error:', error);
        });
    }
    return socket;
};

export const getSocket = () => {
    if (!socket) {
        throw new Error('Socket not initialized. Call initializeSocket first.');
    }
    return socket;
};

export const disconnectSocket = () => {
    if (socket) {
        socket.disconnect();
        socket = null;
    }
};

export const subscribeToQueueUpdates = (hospitalId, callback) => {
    const socket = getSocket();
    const eventName = `queue_update:${hospitalId}`;
    socket.off(eventName);
    socket.on(eventName, callback);
    return () => socket.off(eventName);
};

export const subscribeToPatientUpdates = (patientId, callback) => {
    const socket = getSocket();
    const eventName = `patient_update:${patientId}`;
    socket.off(eventName);
    socket.on(eventName, callback);
    return () => socket.off(eventName);
};