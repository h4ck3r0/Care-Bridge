import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';

const Dashboard = () => {
    const { user } = useAuth();

    const renderDashboardContent = () => {
        switch (user.role) {
            case 'patient':
                return (
                    <div className="space-y-6">
                        <h2 className="text-2xl font-bold text-gray-900">Patient Dashboard</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            <Link
                                to="/appointments"
                                className="block p-6 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow"
                            >
                                <h3 className="text-lg font-semibold text-gray-900 mb-2">My Appointments</h3>
                                <p className="text-gray-600">View and manage your upcoming appointments.</p>
                            </Link>
                            <Link
                                to="/join-queue"
                                className="block p-6 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow"
                            >
                                <h3 className="text-lg font-semibold text-gray-900 mb-2">Join Queue</h3>
                                <p className="text-gray-600">Find and join queues at nearby hospitals.</p>
                            </Link>
                            <Link
                                to="/doctors/search"
                                className="block p-6 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow"
                            >
                                <h3 className="text-lg font-semibold text-gray-900 mb-2">Find Doctors</h3>
                                <p className="text-gray-600">Search for doctors and book appointments.</p>
                            </Link>
                            <Link
                                to="/disease-prediction"
                                className="block p-6 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow"
                            >
                                <h3 className="text-lg font-semibold text-gray-900 mb-2">Disease Prediction</h3>
                                <p className="text-gray-600">Get insights about possible conditions based on your symptoms.</p>
                            </Link>
                        </div>
                    </div>
                );

            case 'doctor':
                return (
                    <div className="space-y-6">
                        <h2 className="text-2xl font-bold text-gray-900">Doctor Dashboard</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            <Link
                                to="/doctor/dashboard"
                                className="block p-6 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow"
                            >
                                <h3 className="text-lg font-semibold text-gray-900 mb-2">My Dashboard</h3>
                                <p className="text-gray-600">View and manage your appointments and patient queue.</p>
                            </Link>
                            <Link
                                to="/doctor/profile"
                                className="block p-6 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow"
                            >
                                <h3 className="text-lg font-semibold text-gray-900 mb-2">My Profile</h3>
                                <p className="text-gray-600">Update your profile information and availability.</p>
                            </Link>
                            <Link
                                to="/appointments"
                                className="block p-6 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow"
                            >
                                <h3 className="text-lg font-semibold text-gray-900 mb-2">Appointments</h3>
                                <p className="text-gray-600">View and manage your appointments.</p>
                            </Link>
                        </div>
                    </div>
                );

            case 'hospital':
                return (
                    <div className="space-y-6">
                        <h2 className="text-2xl font-bold text-gray-900">Hospital Dashboard</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            <Link
                                to="/hospital/profile"
                                className="block p-6 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow"
                            >
                                <h3 className="text-lg font-semibold text-gray-900 mb-2">Hospital Profile</h3>
                                <p className="text-gray-600">Update your hospital information and services.</p>
                            </Link>
                            <Link
                                to="/hospital/doctors"
                                className="block p-6 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow"
                            >
                                <h3 className="text-lg font-semibold text-gray-900 mb-2">Manage Doctors</h3>
                                <p className="text-gray-600">View and manage doctors in your hospital.</p>
                            </Link>
                            <Link
                                to="/appointments"
                                className="block p-6 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow"
                            >
                                <h3 className="text-lg font-semibold text-gray-900 mb-2">Appointments</h3>
                                <p className="text-gray-600">View and manage hospital appointments.</p>
                            </Link>
                        </div>
                    </div>
                );

            default:
                return (
                    <div className="text-center">
                        <h2 className="text-2xl font-bold text-gray-900">Welcome to CareBridge</h2>
                        <p className="mt-2 text-gray-600">Please select your role to continue.</p>
                    </div>
                );
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {renderDashboardContent()}
            </div>
        </div>
    );
};

export default Dashboard; 