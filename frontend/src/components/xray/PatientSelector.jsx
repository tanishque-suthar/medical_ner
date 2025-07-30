import React, { useState } from 'react';
import './PatientSelector.css';

const PatientSelector = ({ patients, selectedPatient, onPatientSelect }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);

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

    const handlePatientSelect = (patient) => {
        onPatientSelect(patient);
        setIsDropdownOpen(false);
        setSearchTerm('');
    };

    const handleSearchChange = (e) => {
        setSearchTerm(e.target.value);
        setIsDropdownOpen(true);
    };

    const toggleDropdown = () => {
        setIsDropdownOpen(!isDropdownOpen);
    };

    const clearSelection = () => {
        onPatientSelect(null);
        setSearchTerm('');
        setIsDropdownOpen(false);
    };

    return (
        <div className="patient-selector">
            <div className="patient-selector-header">
                <h3>Select Patient</h3>
                {selectedPatient && (
                    <button
                        onClick={clearSelection}
                        className="btn btn-sm btn-outline"
                        title="Clear selection"
                    >
                        Clear
                    </button>
                )}
            </div>

            {selectedPatient ? (
                <div className="selected-patient-card">
                    <div className="patient-info">
                        <h4>{selectedPatient.name}</h4>
                        <div className="patient-details">
                            <span>ID: {selectedPatient.id}</span>
                            <span>Age: {selectedPatient.age}</span>
                            <span>Gender: {selectedPatient.gender}</span>
                        </div>
                        <div className="patient-reports">
                            {selectedPatient.reports?.length || 0} existing reports
                        </div>
                    </div>
                </div>
            ) : (
                <div className="patient-search-container">
                    <div className="search-input-container">
                        <div className="search-icon">🔍</div>
                        <input
                            type="text"
                            placeholder="Search patients by name, ID, age, or gender..."
                            value={searchTerm}
                            onChange={handleSearchChange}
                            onFocus={() => setIsDropdownOpen(true)}
                            className="patient-search-input"
                        />
                        <button
                            onClick={toggleDropdown}
                            className="dropdown-toggle"
                            title={isDropdownOpen ? "Hide patients" : "Show all patients"}
                        >
                            {isDropdownOpen ? '▲' : '▼'}
                        </button>
                    </div>

                    {isDropdownOpen && (
                        <div className="patients-dropdown">
                            {filteredPatients.length > 0 ? (
                                <div className="patients-list">
                                    {filteredPatients.map(patient => (
                                        <div
                                            key={patient.id}
                                            className="patient-option"
                                            onClick={() => handlePatientSelect(patient)}
                                        >
                                            <div className="patient-option-main">
                                                <span className="patient-name">{patient.name}</span>
                                                <span className="patient-id">#{patient.id}</span>
                                            </div>
                                            <div className="patient-option-details">
                                                <span>{patient.age}y, {patient.gender}</span>
                                                <span>{patient.reports?.length || 0} reports</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="no-patients-found">
                                    <p>No patients found matching "{searchTerm}"</p>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default PatientSelector;
