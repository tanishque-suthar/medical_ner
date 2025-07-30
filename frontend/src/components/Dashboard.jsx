import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import './Dashboard.css';

const Dashboard = () => {
    const { user, logout } = useAuth();

    const handleLogout = () => {
        logout();
    };

    return (
        <div className="dashboard">
            {/* Header */}
            <header className="dashboard-header">
                <div className="container">
                    <div className="header-content">
                        <div className="header-title">
                            <h1>Medical Analyzer</h1>
                        </div>

                        <div className="header-user">
                            <div className="user-info">
                                <span className="user-welcome">👤 Welcome, {user?.username}</span>
                                <span className="user-role">{user?.role}</span>
                            </div>

                            <button onClick={handleLogout} className="btn btn-logout">
                                Logout
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="dashboard-main">
                <div className="container">
                    <div className="dashboard-grid">
                        {/* Patient Management Card */}
                        <div className="dashboard-card">
                            <div className="card-header">
                                <h3>Patient Management</h3>
                                <div className="card-icon">👥</div>
                            </div>
                            <p className="card-description">
                                Manage patient records and view medical histories
                            </p>
                            <button className="btn btn-primary card-button">
                                Access Patients
                            </button>
                        </div>

                        {/* Medical Reports Card */}
                        <div className="dashboard-card">
                            <div className="card-header">
                                <h3>Medical Reports</h3>
                                <div className="card-icon">📋</div>
                            </div>
                            <p className="card-description">
                                Analyze medical reports with AI-powered NER
                            </p>
                            <button className="btn btn-primary card-button">
                                Analyze Reports
                            </button>
                        </div>

                        {/* X-Ray Analysis Card */}
                        <div className="dashboard-card">
                            <div className="card-header">
                                <h3>X-Ray Analysis</h3>
                                <div className="card-icon">🩻</div>
                            </div>
                            <p className="card-description">
                                AI-powered X-ray analysis and pathology detection
                            </p>
                            <button className="btn btn-primary card-button">
                                Analyze X-Rays
                            </button>
                        </div>
                    </div>

                    {/* Quick Stats */}
                    <div className="stats-section">
                        <h3>Quick Stats</h3>
                        <div className="stats-grid">
                            <div className="stat-item">
                                <div className="stat-value">--</div>
                                <div className="stat-label">Total Patients</div>
                            </div>
                            <div className="stat-item">
                                <div className="stat-value">--</div>
                                <div className="stat-label">Reports Analyzed</div>
                            </div>
                            <div className="stat-item">
                                <div className="stat-value">--</div>
                                <div className="stat-label">X-Rays Processed</div>
                            </div>
                            <div className="stat-item">
                                <div className="stat-value active">Active</div>
                                <div className="stat-label">System Status</div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default Dashboard;
