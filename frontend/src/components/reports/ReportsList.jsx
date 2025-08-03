import React from 'react';
import ReportCard from './ReportCard';
import './ReportsList.css';

const ReportsList = ({ reports, onViewReport, loading }) => {
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

  const getReportId = (report) => {
    return `#${report.id}`;
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
        return reportType || 'Unknown';
    }
  };

  const getEntityCount = (report) => {
    if (!report.results || !report.results.entities) return 0;
    return report.results.entities.length;
  };

  if (loading) {
    return (
      <div className="reports-list-loading">
        <div className="loading-spinner"></div>
        <p>Loading reports...</p>
      </div>
    );
  }

  if (reports.length === 0) {
    return (
      <div className="no-reports">
        <div className="no-reports-icon">📋</div>
        <h3>No reports found</h3>
        <p>No reports match your current filters.</p>
      </div>
    );
  }

  return (
    <div className="reports-list">
      <div className="reports-table-container">
        <table className="reports-table">
          <thead>
            <tr>
              <th>Report Details</th>
              <th>Patient</th>
              <th>Type</th>
              <th>Report ID</th>
              <th>Entities</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {reports.map(report => (
              <tr key={`${report.id}-${report.patient_id}`} className="report-row">
                <td>
                  <div className="report-details">
                    <div className="report-filename">{report.filename}</div>
                    <div className="report-id">ID: {report.id}</div>
                  </div>
                </td>
                <td>
                  <div className="patient-info">
                    <div className="patient-name">{report.patient_name}</div>
                    <div className="patient-meta">
                      {report.patient_age && `${report.patient_age}y`}
                      {report.patient_age && report.patient_gender && ', '}
                      {report.patient_gender}
                    </div>
                  </div>
                </td>
                <td>
                  <span className={`report-type-badge ${report.report_type}`}>
                    {getReportTypeDisplay(report.report_type)}
                  </span>
                </td>
                <td>
                  <div className="report-id">
                    {getReportId(report)}
                  </div>
                </td>
                <td>
                  <div className="entities-count">
                    <span className="entities-number">{getEntityCount(report)}</span>
                    <span className="entities-label">entities</span>
                  </div>
                </td>
                <td>
                  <div className="report-actions">
                    <button
                      onClick={() => onViewReport(report)}
                      className="btn btn-primary btn-sm"
                    >
                      View Results
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Alternative Card View for Mobile */}
      <div className="reports-cards-mobile">
        {reports.map(report => (
          <ReportCard
            key={`${report.id}-${report.patient_id}`}
            report={report}
            onViewReport={onViewReport}
          />
        ))}
      </div>
    </div>
  );
};

export default ReportsList;
