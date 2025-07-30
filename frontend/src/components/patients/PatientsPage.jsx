import React, { useState } from 'react';
import PatientsList from './PatientsList';
import PatientDetails from './PatientDetails';
import AddPatient from './AddPatient';

const PatientsPage = () => {
    const [currentView, setCurrentView] = useState('list'); // 'list', 'details', 'add'
    const [selectedPatient, setSelectedPatient] = useState(null);

    const handleSelectPatient = (patient) => {
        setSelectedPatient(patient);
        setCurrentView('details');
    };

    const handleAddPatient = () => {
        setCurrentView('add');
    };

    const handleAddPatientSuccess = (newPatient) => {
        setSelectedPatient(newPatient);
        setCurrentView('details');
    };

    const handleBack = () => {
        setCurrentView('list');
        setSelectedPatient(null);
    };

    const handleCancel = () => {
        setCurrentView('list');
    };

    return (
        <div className="patients-page">
            {currentView === 'list' && (
                <PatientsList
                    onSelectPatient={handleSelectPatient}
                    onAddPatient={handleAddPatient}
                />
            )}

            {currentView === 'details' && selectedPatient && (
                <PatientDetails
                    patient={selectedPatient}
                    onBack={handleBack}
                />
            )}

            {currentView === 'add' && (
                <AddPatient
                    onSuccess={handleAddPatientSuccess}
                    onCancel={handleCancel}
                />
            )}
        </div>
    );
};

export default PatientsPage;
