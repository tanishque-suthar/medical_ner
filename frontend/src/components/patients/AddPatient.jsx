import React, { useState } from 'react';
import axios from 'axios';
import './AddPatient.css';

const AddPatient = ({ onSuccess, onCancel }) => {
    const [formData, setFormData] = useState({
        name: '',
        age: '',
        gender: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const patientData = {
                ...formData,
                age: parseInt(formData.age)
            };

            const response = await axios.post('/api/patients/add-patient', patientData);
            console.log('Patient created:', response.data);
            onSuccess(response.data);
        } catch (error) {
            console.error('Failed to create patient:', error);
            setError(error.response?.data?.detail || 'Failed to create patient');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="add-patient-overlay">
            <div className="add-patient-modal">
                <div className="modal-header">
                    <h3>Add New Patient</h3>
                    <button onClick={onCancel} className="close-button">×</button>
                </div>

                <form onSubmit={handleSubmit} className="add-patient-form">
                    {error && (
                        <div className="error-message">
                            {error}
                        </div>
                    )}

                    <div className="form-group">
                        <label htmlFor="name" className="form-label">
                            Full Name *
                        </label>
                        <input
                            type="text"
                            id="name"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            className="form-input"
                            placeholder="Enter patient's full name"
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="age" className="form-label">
                            Age *
                        </label>
                        <input
                            type="number"
                            id="age"
                            name="age"
                            value={formData.age}
                            onChange={handleChange}
                            className="form-input"
                            placeholder="Enter age"
                            min="1"
                            max="150"
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="gender" className="form-label">
                            Gender *
                        </label>
                        <select
                            id="gender"
                            name="gender"
                            value={formData.gender}
                            onChange={handleChange}
                            className="form-input"
                            required
                        >
                            <option value="">Select gender</option>
                            <option value="Male">Male</option>
                            <option value="Female">Female</option>
                            <option value="Other">Other</option>
                        </select>
                    </div>

                    <div className="form-actions">
                        <button
                            type="button"
                            onClick={onCancel}
                            className="btn btn-secondary"
                            disabled={loading}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="btn btn-primary"
                            disabled={loading}
                        >
                            {loading ? (
                                <>
                                    <div className="loading-spinner-sm"></div>
                                    Creating...
                                </>
                            ) : (
                                'Create Patient'
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddPatient;
