import React, { useState, useEffect } from 'react';
import axios from 'axios';
import FileUpload from './FileUpload';
import './PatientDetails.css';

const PatientDetails = ({ patient, onBack }) => {
  const [patientData, setPatientData] = useState(patient);
  const [showUpload, setShowUpload] = useState(false);
  const [loading, setLoading] = useState(false);

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

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString();
  };

  const getReportTypeDisplay = (reportType) => {
    switch (reportType) {
      case 'medical_text':
        return 'Medical Text (NER)';
      case 'xray':
        return 'X-Ray Analysis';
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
          <button
            onClick={() => setShowUpload(true)}
            className="btn btn-primary"
          >
            Upload Report
          </button>
        </div>
      </div>

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
                  <button className="btn btn-sm btn-outline">
                    View Results
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

      {showUpload && (
        <FileUpload
          patientId={patientData.id}
          onSuccess={handleUploadSuccess}
          onCancel={() => setShowUpload(false)}
        />
      )}
    </div>
  );
};

export default PatientDetails;
