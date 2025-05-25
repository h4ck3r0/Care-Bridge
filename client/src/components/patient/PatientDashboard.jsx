import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { appointmentService, doctorService } from '../../services/api';
import DiseasePrediction from './DiseasePrediction';
import JoinQueue from '../appointment/JoinQueue';
import { useNavigate } from 'react-router-dom';

const PatientDashboard = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [appointments, setAppointments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [activeTab, setActiveTab] = useState('appointments');  
    const [selectedDoctor, setSelectedDoctor] = useState(null);
    const [selectedDate, setSelectedDate] = useState('');
    const [formData, setFormData] = useState({
        specialization: '',
        date: '',
        reason: ''
    });

    useEffect(() => {
        fetchPatientData();
    }, []);

    const fetchPatientData = async () => {
        try {
            setLoading(true);
            const appointmentsResponse = await appointmentService.getPatientAppointments(user._id);
            console.log('Fetched appointments:', appointmentsResponse);
            setAppointments(appointmentsResponse.data || []);
        } catch (err) {
            console.error('Error fetching appointments:', err);
            setError(err.response?.data?.message || 'Failed to fetch appointments');
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSearchDoctors = async (e) => {
        e.preventDefault();
        try {
            setError('');
            const response = await doctorService.searchDoctors({
                specialization: formData.specialization,
                date: formData.date
            });
            setSelectedDoctor(response.data[0]); // For simplicity, selecting first doctor
            setError('Doctor found. Please select a time slot to book appointment.');
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to search doctors');
        }
    };

    const handleBookAppointment = async (timeSlot) => {
        try {
            setError('');
            await doctorService.bookAppointment(selectedDoctor._id, {
                patientId: user._id,
                date: formData.date,
                timeSlot,
                reason: formData.reason
            });
            await fetchPatientData();
            setFormData(prev => ({
                ...prev,
                specialization: '',
                date: '',
                reason: ''
            }));
            setSelectedDoctor(null);
            setError('Appointment booked successfully');
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to book appointment');
        }
    };

    const handleNavigateToSearch = (e) => {
        e.preventDefault();
        navigate('/doctors/search');
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="bg-white shadow rounded-lg">
                {/* Dashboard Header */}
                <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
                    <h3 className="text-lg leading-6 font-medium text-gray-900">
                        Patient Dashboard
                    </h3>
                    <p className="mt-1 max-w-2xl text-sm text-gray-500">
                        Manage your appointments and queue status
                    </p>
                </div>

                {/* Navigation Tabs */}
                <div className="border-b border-gray-200">
                    <nav className="-mb-px flex">
                        {[
                            { id: 'appointments', label: 'Appointments' },
                            { id: 'queues', label: 'Join Queue' },
                            { id: 'find-doctors', label: 'Find Doctors' },
                            { id: 'prediction', label: 'Disease Prediction' }
                        ].map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`${
                                    activeTab === tab.id
                                        ? 'border-blue-500 text-blue-600'
                                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                } whitespace-nowrap py-4 px-6 border-b-2 font-medium text-sm`}
                            >
                                {tab.label}
                            </button>
                        ))}
                    </nav>
                </div>

                {/* Error/Success Message */}
                {error && (
                    <div className={`p-4 ${
                        error.includes('successfully') ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
                    }`}>
                        <div className="flex">
                            {error.includes('successfully') ? (
                                <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                </svg>
                            ) : (
                                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                </svg>
                            )}
                            <div className="ml-3">
                                <p className="text-sm">{error}</p>
                            </div>
                            <div className="ml-auto pl-3">
                                <div className="-mx-1.5 -my-1.5">
                                    <button
                                        onClick={() => setError('')}
                                        className={`inline-flex rounded-md p-1.5 focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                                            error.includes('successfully') ?
                                            'text-green-500 hover:bg-green-100 focus:ring-green-600' :
                                            'text-red-500 hover:bg-red-100 focus:ring-red-600'
                                        }`}
                                    >
                                        <span className="sr-only">Dismiss</span>
                                        <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                                        </svg>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Appointments Tab */}
                {activeTab === 'appointments' && (
                    <div className="p-6">
                        {/* Book Appointment Form */}
                        {!selectedDoctor ? (
                            <form onSubmit={handleSearchDoctors} className="mb-8">
                                <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">
                                            Specialization
                                        </label>
                                        <input
                                            type="text"
                                            name="specialization"
                                            value={formData.specialization}
                                            onChange={handleInputChange}
                                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                            placeholder="Enter specialization"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">
                                            Preferred Date
                                        </label>
                                        <input
                                            type="date"
                                            name="date"
                                            value={formData.date}
                                            onChange={handleInputChange}
                                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                        />
                                    </div>
                                    <div className="flex items-end">
                                        <button
                                            type="submit"
                                            className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                                        >
                                            Search Doctors
                                        </button>
                                    </div>
                                </div>
                            </form>
                        ) : (
                            <div className="mb-8">
                                <div className="bg-white shadow overflow-hidden sm:rounded-lg">
                                    <div className="px-4 py-5 sm:px-6">
                                        <h4 className="text-lg font-medium text-gray-900">
                                            Book Appointment with Dr. {selectedDoctor.firstName} {selectedDoctor.lastName}
                                        </h4>
                                        <p className="mt-1 text-sm text-gray-500">
                                            {selectedDoctor.specialization}
                                        </p>
                                    </div>
                                    <div className="border-t border-gray-200 px-4 py-5 sm:px-6">
                                        <div className="mb-4">
                                            <label className="block text-sm font-medium text-gray-700">
                                                Reason for Visit
                                            </label>
                                            <textarea
                                                name="reason"
                                                rows={3}
                                                value={formData.reason}
                                                onChange={handleInputChange}
                                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                            />
                                        </div>
                                        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                                            {selectedDoctor.availability?.timeSlots?.map((slot) => (
                                                <button
                                                    key={slot}
                                                    onClick={() => handleBookAppointment(slot)}
                                                    className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                                                >
                                                    {slot}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Appointments List */}
                        <div className="mt-8">
                            <h4 className="text-lg font-medium text-gray-900 mb-4">Your Appointments</h4>
                            {loading ? (
                                <div className="flex items-center justify-center py-6">
                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                                </div>
                            ) : appointments.length === 0 ? (
                                <div className="bg-white shadow overflow-hidden sm:rounded-md p-6 text-center">
                                    <p className="text-gray-500">No appointments found</p>
                                </div>
                            ) : (
                                <div className="bg-white shadow overflow-hidden sm:rounded-md">
                                    <ul className="divide-y divide-gray-200">
                                        {appointments.map((appointment) => (
                                        <li key={appointment._id} className="px-6 py-4">
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <div>
                                                        <p className="text-sm font-medium text-gray-900">
                                                            Dr. {appointment.doctor.firstName} {appointment.doctor.lastName}
                                                        </p>
                                                        <p className="text-sm text-gray-500">
                                                            {new Date(appointment.date).toLocaleDateString()} at {appointment.startTime}
                                                        </p>
                                                        <p className="text-sm text-gray-500">
                                                            Reason: {appointment.reason}
                                                        </p>
                                                        {appointment.timeUntil > 0 && appointment.status !== 'completed' && (
                                                            <p className="text-sm text-blue-600 mt-1">
                                                                Time until appointment: {Math.floor(appointment.timeUntil / 60)}h {appointment.timeUntil % 60}m
                                                                {appointment.status === 'pending' && (
                                                                    <span className="ml-2 text-yellow-600">(Pending approval)</span>
                                                                )}
                                                            </p>
                                                        )}
                                                        {appointment.prescription && (
                                                            <div className="mt-2 p-2 bg-gray-50 rounded">
                                                                <p className="text-sm font-medium text-gray-700">Prescription:</p>
                                                                <p className="text-sm text-gray-600">{appointment.prescription}</p>
                                                            </div>
                                                        )}
                                                        {appointment.followUpDate && (
                                                            <p className="text-sm text-indigo-600 mt-1">
                                                                Follow-up scheduled for: {new Date(appointment.followUpDate).toLocaleDateString()}
                                                            </p>
                                                        )}
                                                    </div>
                                                </div>
                                                <div className="flex flex-col items-end">
                                                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                                        appointment.status === 'completed'
                                                            ? 'bg-green-100 text-green-800'
                                                            : appointment.status === 'pending'
                                                            ? 'bg-yellow-100 text-yellow-800'
                                                            : appointment.status === 'in_progress'
                                                            ? 'bg-blue-100 text-blue-800'
                                                            : 'bg-red-100 text-red-800'
                                                    }`}>
                                                        {appointment.status.replace('_', ' ')}
                                                    </span>
                                                    {appointment.approvalStatus && (
                                                        <span className="mt-1 text-xs text-gray-500">
                                                            Approval: {appointment.approvalStatus}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Disease Prediction Tab */}
                {activeTab === 'prediction' && (
                    <div className="p-6">
                        <DiseasePrediction />
                    </div>
                )}

                {/* Additional Tabs */}
                {activeTab === 'queues' && (
                    <div className="p-6">
                        <JoinQueue />
                    </div>
                )}

                {activeTab === 'find-doctors' && (
                    <div className="p-6">
                        <div className="bg-white rounded-lg shadow-sm p-6">
                            <div className="space-y-4">
                                <h3 className="text-lg font-medium text-gray-900">Find Doctors</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <button
                                        onClick={handleNavigateToSearch}
                                        className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                                    >
                                        Find Nearby Doctors
                                    </button>
                                    <button
                                        onClick={handleNavigateToSearch}
                                        className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                                    >
                                        Search by Specialization
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default PatientDashboard;