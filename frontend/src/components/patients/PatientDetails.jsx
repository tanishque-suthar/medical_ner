import React, { useState, useEffect } from 'react';
import axios from 'axios';
import FileUpload from './FileUpload';
import ReportResults from './ReportResults';
import './PatientDetails.css';

const PatientDetails = ({ patient, onBack }) => {
    const [patientData, setPatientData] = useState(patient);
    const [showUpload, setShowUpload] = useState(false);
    const [showReportResults, setShowReportResults] = useState(false);
    const [selectedReport, setSelectedReport] = useState(null);
    const [loading, setLoading] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    // Refresh patient data to get updated reports
    const refreshPatientData = async () => {
        try {
            setLoading(true);
            const response = await axios.get(`/api/patients/get-patient/${patient.id}`);
            setPatientData(response.data);
        } catch (error) {
            console.error('Failed to refresh patient data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleUploadSuccess = () => {
        setShowUpload(false);
        refreshPatientData();
    };

    const handleViewResults = (report) => {
        setSelectedReport(report);
        setShowReportResults(true);
    };

    const handleCloseResults = () => {
        setShowReportResults(false);
        setSelectedReport(null);
    };

    const handleDeleteReport = async (reportId, reportFilename) => {
        if (!window.confirm(`Are you sure you want to delete the report "${reportFilename}"? This action cannot be undone.`)) {
            return;
        }

        try {
            await axios.delete(`/api/patients/delete-report/${reportId}`);
            alert('Report deleted successfully');
            refreshPatientData(); // Refresh to show updated list
        } catch (error) {
            console.error('Failed to delete report:', error);
            if (error.response?.status === 403) {
                alert('You do not have permission to delete reports. Only Admins and Doctors can delete reports.');
            } else if (error.response?.status === 404) {
                alert('Report not found');
            } else {
                alert('Failed to delete report. Please try again.');
            }
        }
    };

    const handleDeletePatient = async () => {
        if (!window.confirm(`Are you sure you want to delete patient "${patientData.name}"? This action cannot be undone and will delete all associated reports.`)) {
            return;
        }

        try {
            setIsDeleting(true);
            await axios.delete(`/api/patients/delete-patient/${patientData.id}`);
            alert('Patient deleted successfully');
            onBack(); // Navigate back to patients list
        } catch (error) {
            console.error('Failed to delete patient:', error);
            if (error.response?.status === 403) {
                alert('You do not have permission to delete patients. Only Admins and Doctors can delete patients.');
            } else if (error.response?.status === 404) {
                alert('Patient not found');
            } else {
                alert('Failed to delete patient. Please try again.');
            }
        } finally {
            setIsDeleting(false);
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString('en-GB', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            timeZone: 'Asia/Kolkata'
        });
    };

    const getReportTypeDisplay = (reportType) => {
        switch (reportType) {
            case 'PDF_NER':
                return 'Medical Report (PDF NER)';
            case 'XRAY_ANALYSIS':
                return 'X-Ray Analysis';
            case 'XRAY_COMPARISON':
                return 'X-Ray Comparison';
            default:
                return reportType;
        }
    };

    return (
        <div className="patient-details">
            <div className="patient-details-header">
                <button onClick={onBack} className="back-button">
                    ← Back to Patients
                </button>
                <div className="patient-info-header">
                    <h2>{patientData.name}</h2>
                    <div className="header-actions">
                        <button
                            onClick={() => setShowUpload(true)}
                            className="btn btn-primary"
                        >
                            Upload Report
                        </button>
                        <button
                            onClick={handleDeletePatient}
                            disabled={isDeleting}
                            className="btn btn-danger"
                        >
                            {isDeleting ? 'Deleting...' : 'Delete Patient'}
                        </button>
                    </div>
                </div>
            </div>
            <div className="patient-content">
                <div className="patient-info-card">
                    <h3>Patient Information</h3>
                    <div className="patient-info-grid">
                        <div className="info-item">
                            <span className="info-label">ID:</span>
                            <span className="info-value">{patientData.id}</span>
                        </div>
                        <div className="info-item">
                            <span className="info-label">Name:</span>
                            <span className="info-value">{patientData.name}</span>
                        </div>
                        <div className="info-item">
                            <span className="info-label">Age:</span>
                            <span className="info-value">{patientData.age}</span>
                        </div>
                        <div className="info-item">
                            <span className="info-label">Gender:</span>
                            <span className="info-value">{patientData.gender}</span>
                        </div>
                    </div>
                </div>

                <div className="reports-section">
                    <div className="reports-header">
                        <h3>Medical Reports ({patientData.reports?.length || 0})</h3>
                        {loading && <div className="loading-spinner-sm"></div>}
                    </div>

                    {patientData.reports && patientData.reports.length > 0 ? (
                        <div className="reports-list">
                            {patientData.reports.map(report => (
                                <div key={report.id} className="report-card">
                                    <div className="report-info">
                                        <h4 className="report-filename">{report.filename}</h4>
                                        <div className="report-meta">
                                            <span className="report-type">
                                                {getReportTypeDisplay(report.report_type)}
                                            </span>
                                            <span className="report-date">
                                                {formatDate(report.created_at)}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="report-actions">
                                        <button
                                            className="btn btn-sm btn-outline"
                                            onClick={() => handleViewResults(report)}
                                        >
                                            View Results
                                        </button>
                                        <button
                                            className="btn btn-sm btn-danger"
                                            onClick={() => handleDeleteReport(report.id, report.filename)}
                                            title="Delete Report"
                                        >
                                            Delete
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="no-reports">
                            <p>No reports uploaded yet</p>
                            <button
                                onClick={() => setShowUpload(true)}
                                className="btn btn-secondary"
                            >
                                Upload First Report
                            </button>
                        </div>
                    )}
                </div>
            </div>
            {showUpload && (
                <FileUpload
                    patientId={patientData.id}
                    onSuccess={handleUploadSuccess}
                    onCancel={() => setShowUpload(false)}
                />
            )}

            {showReportResults && selectedReport && (
                <ReportResults
                    report={selectedReport}
                    onClose={handleCloseResults}
                />
            )}
        </div>
    );
};

export default PatientDetails;
