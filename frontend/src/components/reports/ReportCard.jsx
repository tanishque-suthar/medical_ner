import React from 'react';
import './ReportCard.css';

const ReportCard = ({ report, onViewReport }) => {
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
        return reportType || 'Unknown';
    }
  };

  const getEntityCount = (report) => {
    if (!report.results || !report.results.entities) return 0;
    return report.results.entities.length;
  };

  const getXrayInfo = (report) => {
    if (!report.results) return null;

    if (report.report_type === 'XRAY_ANALYSIS') {
      const pathologies = report.results.pathologies || [];
      const detectedCount = pathologies.filter(p => p.detected).length;
      return { type: 'pathologies', detected: detectedCount, total: pathologies.length };
    }

    if (report.report_type === 'XRAY_COMPARISON') {
      return { type: 'comparison', hasReport: !!report.results.comparison_report };
    }

    return null;
  };

  const isXrayReport = (reportType) => {
    return reportType === 'XRAY_ANALYSIS' || reportType === 'XRAY_COMPARISON';
  };

  return (
    <div className="report-card">
      <div className="report-card-header">
        <div className="report-card-title">
          <h4>{report.filename}</h4>
          <span className="report-card-id">ID: {report.id}</span>
        </div>
        <span className={`report-type-badge ${report.report_type}`}>
          {getReportTypeDisplay(report.report_type)}
        </span>
      </div>

      <div className="report-card-content">
        <div className="report-card-row">
          <span className="label">Patient:</span>
          <span className="value">
            {report.patient_name}
            {report.patient_age && ` (${report.patient_age}y, ${report.patient_gender})`}
          </span>
        </div>

        <div className="report-card-row">
          <span className="label">Report ID:</span>
          <span className="value">#{report.id}</span>
        </div>

        {isXrayReport(report.report_type) ? (
          <div className="report-card-row">
            <span className="label">
              {report.report_type === 'XRAY_ANALYSIS' ? 'Pathologies:' : 'Analysis:'}
            </span>
            <span className="value reports-xray-info">
              {(() => {
                const xrayInfo = getXrayInfo(report);
                if (!xrayInfo) return 'No data';

                if (xrayInfo.type === 'pathologies') {
                  return (
                    <>
                      <span className="reports-pathology-count detected">{xrayInfo.detected}</span>
                      <span className="reports-pathology-separator">/</span>
                      <span className="reports-pathology-count total">{xrayInfo.total}</span>
                      <span className="reports-pathology-label">detected</span>
                    </>
                  );
                }

                if (xrayInfo.type === 'comparison') {
                  return xrayInfo.hasReport ? 'Comparison complete' : 'No comparison data';
                }

                return 'No data';
              })()}
            </span>
          </div>
        ) : (
          <div className="report-card-row">
            <span className="label">Entities Found:</span>
            <span className="value entities-count">
              <span className="entities-number">{getEntityCount(report)}</span>
              <span className="entities-label">entities</span>
            </span>
          </div>
        )}

        <div className="report-card-row">
          <span className="label">Uploaded:</span>
          <span className="value reports-upload-time">
            {formatDate(report.created_at)}
          </span>
        </div>
      </div>

      <div className="report-card-actions">
        <button
          onClick={() => onViewReport(report)}
          className="btn btn-primary"
        >
          View Results
        </button>
      </div>
    </div>
  );
};

export default ReportCard;
