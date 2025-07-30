import React, { useState, useEffect } from 'react';
import axios from 'axios';
import PatientSelector from './PatientSelector';
import XRayAnalysis from './XRayAnalysis';
import './XRayPage.css';

const XRayPage = () => {
    const [selectedPatient, setSelectedPatient] = useState(null);
    const [patients, setPatients] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchPatients();
    }, []);

    const fetchPatients = async () => {
        try {
            setLoading(true);
            const response = await axios.get('/api/patients/get-all-patients');
            setPatients(response.data);
        } catch (error) {
            console.error('Failed to fetch patients:', error);
            setError('Failed to load patients');
        } finally {
            setLoading(false);
        }
    };

    const handlePatientSelect = (patient) => {
        setSelectedPatient(patient);
    };

    if (loading) {
        return (
            <div className="xray-page">
                <div className="xray-loading">
                    <div className="loading-spinner"></div>
                    <p>Loading patients...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="xray-page">
                <div className="xray-error">
                    <p>{error}</p>
                    <button onClick={fetchPatients} className="btn btn-primary">
                        Retry
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="xray-page">
            <div className="xray-header">
                <h2>X-Ray Analysis</h2>
                <p className="xray-subtitle">
                    AI-powered chest X-ray analysis for pathology detection and medical reporting
                </p>
            </div>

            <div className="xray-content">
                <div className="xray-patient-section">
                    <PatientSelector
                        patients={patients}
                        selectedPatient={selectedPatient}
                        onPatientSelect={handlePatientSelect}
                    />
                </div>

                <div className="xray-analysis-section">
                    {selectedPatient ? (
                        <XRayAnalysis patient={selectedPatient} />
                    ) : (
                        <div className="no-patient-selected">
                            <div className="no-patient-icon">🩻</div>
                            <h3>Select a Patient</h3>
                            <p>Choose a patient from the list above to begin X-ray analysis</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default XRayPage;
