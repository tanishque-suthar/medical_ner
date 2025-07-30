import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import './DashboardNew.css';

const Dashboard = ({ onNavigate }) => {
    const { user } = useAuth();

    const handleCardClick = (page) => {
        if (onNavigate) {
            onNavigate(page);
        }
    };

    return (
        <div className="dashboard">
            {/* Welcome Section */}
            <div className="dashboard-welcome">
                <h1>Welcome to Medical Analyzer</h1>
                <p>Manage patients, analyze medical reports, and process X-ray images with AI-powered tools</p>
            </div>

            {/* Main Content */}
            <div className="dashboard-content">
                <div className="dashboard-cards">
                    {/* Patient Management Card */}
                    <div className="dashboard-card" onClick={() => handleCardClick('patients')}>
                        <div className="card-header">
                            <h3>Patient Management</h3>
                            <div className="card-icon patient-icon">👥</div>
                        </div>
                        <p>Manage patient records and view medical histories</p>
                        <button className="card-button">
                            Access Patients
                        </button>
                    </div>

                    {/* Medical Reports Card */}
                    <div className="dashboard-card" onClick={() => handleCardClick('reports')}>
                        <div className="card-header">
                            <h3>Medical Reports</h3>
                            <div className="card-icon reports-icon">📋</div>
                        </div>
                        <p>Analyze medical reports with AI-powered NER</p>
                        <button className="card-button">
                            Analyze Reports
                        </button>
                    </div>

                    {/* X-Ray Analysis Card */}
                    <div className="dashboard-card" onClick={() => handleCardClick('xray')}>
                        <div className="card-header">
                            <h3>X-Ray Analysis</h3>
                            <div className="card-icon xray-icon">🩻</div>
                        </div>
                        <p>AI-powered X-ray analysis and pathology detection</p>
                        <button className="card-button">
                            Analyze X-Rays
                        </button>
                    </div>
                </div>

                {/* Quick Stats */}
                <div className="dashboard-stats">
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
                            <div className="stat-value status-active">Active</div>
                            <div className="stat-label">System Status</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
