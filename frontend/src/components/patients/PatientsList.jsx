import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './PatientsList.css';

const PatientsList = ({ onSelectPatient, onAddPatient }) => {
    const [patients, setPatients] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [searchTerm, setSearchTerm] = useState('');

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

    // Filter patients based on search term
    const filteredPatients = patients.filter(patient => {
        if (!searchTerm) return true;

        const searchLower = searchTerm.toLowerCase();
        return (
            patient.name.toLowerCase().includes(searchLower) ||
            patient.id.toString().includes(searchLower) ||
            patient.age.toString().includes(searchLower) ||
            patient.gender.toLowerCase().includes(searchLower)
        );
    });

    const handleSearchChange = (e) => {
        setSearchTerm(e.target.value);
    };

    const clearSearch = () => {
        setSearchTerm('');
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

            {/* Search Section */}
            <div className="patients-search">
                <div className="search-input-container">
                    <input
                        type="text"
                        placeholder="Search patients by name, ID, age, or gender..."
                        value={searchTerm}
                        onChange={handleSearchChange}
                        className="search-input"
                    />
                    {searchTerm && (
                        <button
                            onClick={clearSearch}
                            className="clear-search-btn"
                            title="Clear search"
                        >
                            ×
                        </button>
                    )}
                </div>
                {searchTerm && (
                    <div className="search-results-info">
                        Found {filteredPatients.length} of {patients.length} patients
                    </div>
                )}
            </div>

            {patients.length === 0 ? (
                <div className="no-patients">
                    <p>No patients found</p>
                    <button onClick={onAddPatient} className="btn btn-secondary">
                        Add First Patient
                    </button>
                </div>
            ) : filteredPatients.length === 0 ? (
                <div className="no-patients">
                    <p>No patients found matching "{searchTerm}"</p>
                    <button onClick={clearSearch} className="btn btn-secondary">
                        Clear Search
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
                            {filteredPatients.map(patient => (
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
