import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './PatientsList.css';

const PatientsList = ({ onSelectPatient, onAddPatient }) => {
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

    if (loading) {
        return (
            <div className="patients-loading">
                <div className="loading-spinner"></div>
                <p>Loading patients...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="patients-error">
                <p>{error}</p>
                <button onClick={fetchPatients} className="btn btn-primary">
                    Retry
                </button>
            </div>
        );
    }

    return (
        <div className="patients-list">
            <div className="patients-header">
                <h2>Patients</h2>
                <button onClick={onAddPatient} className="btn btn-primary">
                    Add New Patient
                </button>
            </div>

            {patients.length === 0 ? (
                <div className="no-patients">
                    <p>No patients found</p>
                    <button onClick={onAddPatient} className="btn btn-secondary">
                        Add First Patient
                    </button>
                </div>
            ) : (
                <div className="patients-table-container">
                    <table className="patients-table">
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Name</th>
                                <th>Age</th>
                                <th>Gender</th>
                                <th>Reports</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {patients.map(patient => (
                                <tr key={patient.id} className="patient-row">
                                    <td>{patient.id}</td>
                                    <td className="patient-name">{patient.name}</td>
                                    <td>{patient.age}</td>
                                    <td>{patient.gender}</td>
                                    <td>{patient.reports?.length || 0}</td>
                                    <td>
                                        <button
                                            onClick={() => onSelectPatient(patient)}
                                            className="btn btn-sm btn-outline"
                                        >
                                            View Details
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default PatientsList;
