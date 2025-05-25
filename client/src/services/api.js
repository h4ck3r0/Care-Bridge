import axios from 'axios';

const BASE_URL = 'https://care-bridge-onz4.onrender.com';
const API_URL = `${BASE_URL}/api`;

// Create axios instance with default config
const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json'
    }
});

// Add request interceptor to add auth token and log requests
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        const user = JSON.parse(localStorage.getItem('user') || 'null');
        
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Add response interceptor to handle common errors
api.interceptors.response.use(
    (response) => response.data,
    (error) => {
        if (error.response?.status === 401) {
            if (!window.location.pathname.includes('/login')) {
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                window.location.href = '/login';
            }
            return Promise.reject(new Error(error.response?.data?.message || 'Authentication failed'));
        }
        return Promise.reject(error);
    }
);

// Auth services
const authService = {
    register: async (userData) => {
        const data = await api.post('/auth/register', userData);
        if (data.token) {
            localStorage.setItem('token', data.token);
            localStorage.setItem('user', JSON.stringify(data));
        }
        return data;
    },
    login: async (credentials) => {
        const data = await api.post('/auth/login', credentials);
        if (data.token) {
            localStorage.setItem('token', data.token);
            localStorage.setItem('user', JSON.stringify(data));
        }
        return data;
    },
    logout: () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
    },
    getCurrentUser: () => {
        const userStr = localStorage.getItem('user');
        if (!userStr) return null;
        try {
            return JSON.parse(userStr);
        } catch (error) {
            localStorage.removeItem('user');
            localStorage.removeItem('token');
            return null;
        }
    }
};

// Doctor services
const doctorService = {
    getProfile: () => api.get('/doctors/profile'),
    updateProfile: (profileData) => api.put('/doctors/profile', profileData),
    updateAvailability: (day, availability) => api.put(`/doctors/profile/availability/${day}`, availability),
    addQualification: (qualification) => api.post('/doctors/profile/qualifications', qualification),
    addAchievement: (achievement) => api.post('/doctors/profile/achievements', achievement),
    findNearbyDoctors: (params) => api.get('/doctors/near', { params }),
    getDoctorAvailability: (doctorId, date) => api.get(`/doctors/${doctorId}/availability${date ? `?date=${date}` : ''}`),
    searchDoctors: (filters) => api.get('/doctors/search', { params: filters })
};

// Hospital services
const hospitalService = {
    getHospitalDoctors: (hospitalId) => api.get(`/hospitals/${hospitalId}/doctors`),
    findNearbyHospitals: ({ latitude, longitude, maxDistance }) => 
        api.get('/hospitals/near', { params: { latitude, longitude, maxDistance } })
};

// Queue services
const queueService = {
    getHospitalQueues: (hospitalId) => api.get(`/queues/hospital/${hospitalId}`),
    getQueueById: (queueId) => api.get(`/queues/${queueId}`),
    addPatientToQueue: (queueId, patientData) => api.post(`/queues/${queueId}/patients`, patientData),
    updatePatientStatus: (queueId, patientId, status) => api.put(`/queues/${queueId}/patients/${patientId}`, { status }),
    getPatientQueue: (patientId) => api.get(`/queues/patient/${patientId}`),
    getDoctorQueue: (doctorId) => api.get(`/queues/doctor/${doctorId}`),
};

// Appointment Service
const appointmentService = {
    getAppointments: (filters = {}) => {
        const cleanFilters = Object.fromEntries(
            Object.entries(filters).filter(([_, value]) => value !== undefined)
        );
        const queryParams = new URLSearchParams(cleanFilters);
        return api.get(`/appointments?${queryParams.toString()}`);
    },
    getPatientAppointments: (patientId) => api.get(`/appointments?patient=${patientId}`),
    bookAppointment: (appointmentData) => api.post('/appointments', appointmentData),
    updateAppointmentApproval: (appointmentId, data) => 
        api.patch(`/appointments/${appointmentId}/approval`, data),
    updateAppointmentStatus: (appointmentId, status) => 
        api.patch(`/appointments/${appointmentId}/status`, { status }),
    cancelAppointment: (appointmentId, reason) => 
        api.delete(`/appointments/${appointmentId}`, { data: { reason } }),
    getAppointmentDetails: (appointmentId) => api.get(`/appointments/${appointmentId}`)
};

export {
    authService,
    doctorService,
    hospitalService,
    queueService,
    appointmentService
};

export default api;