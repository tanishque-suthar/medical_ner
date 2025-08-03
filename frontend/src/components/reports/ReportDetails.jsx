import React, { useState, useEffect } from 'react';
import './ReportDetails.css';

const ReportDetails = ({ report, onClose }) => {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate a small loading time for smooth UX
    const timer = setTimeout(() => {
      setLoading(false);
    }, 300);

    return () => clearTimeout(timer);
  }, []);

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleString('en-GB', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      timeZone: 'Asia/Kolkata'
    });
  };

  const getEntityTypeColor = (entityType) => {
    const colors = {
      'CONDITION': '#ef4444',   // Red - Medical conditions, diseases
      'MEDICATION': '#10b981',  // Green - Drug names, prescriptions
      'SYMPTOM': '#8b5cf6',     // Purple - Symptoms reported
      'BODY_PART': '#06b6d4',   // Cyan - Anatomical references
      'PROCEDURE': '#ec4899',   // Pink - Medical procedures
      'TEST': '#84cc16',        // Lime - Medical tests
      'DOSAGE': '#f59e0b',      // Amber - Medication dosages
      'TREATMENT': '#0ea5e9',   // Sky blue - Treatments
      'DIAGNOSIS': '#dc2626',   // Dark red - Diagnoses
      'default': '#6b7280'      // Gray
    };
    return colors[entityType] || colors.default;
  };

  const isNonMedicalEntity = (entityType) => {
    // Blacklist non-medical entity types
    const nonMedicalTypes = [
      'PERSON', 'DATE', 'TIME', 'AGE', 'NAME', 'LOCATION', 'ADDRESS',
      'PHONE', 'EMAIL', 'ID', 'NUMBER', 'QUANTITY', 'MONEY', 'PERCENT',
      'ORDINAL', 'CARDINAL', 'GPE', 'ORG', 'FAC', 'EVENT', 'WORK_OF_ART',
      'LAW', 'LANGUAGE', 'NORP', 'MISC', 'OTHER'
    ];

    return nonMedicalTypes.includes(entityType.toUpperCase());
  };

  const groupEntitiesByType = (entities) => {
    if (!entities || !Array.isArray(entities)) return {};

    // Filter out non-medical entities (blacklist approach)
    const medicalEntities = entities.filter(entity => {
      const type = entity.label || entity.entity_type || entity.type || 'OTHER';
      return !isNonMedicalEntity(type);
    });

    return medicalEntities.reduce((groups, entity) => {
      const type = entity.label || entity.entity_type || entity.type || 'OTHER';
      if (!groups[type]) {
        groups[type] = [];
      }
      groups[type].push(entity);
      return groups;
    }, {});
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

  const isXrayReport = (reportType) => {
    return reportType === 'XRAY_ANALYSIS' || reportType === 'XRAY_COMPARISON';
  };

  const renderXrayResults = (reportResults, reportType) => {
    if (reportType === 'XRAY_ANALYSIS') {
      const pathologies = reportResults.pathologies || [];
      const generatedReport = reportResults.generated_report || '';

      return (
        <div className="reports-xray-analysis-section">
          <h4>X-Ray Analysis Results</h4>

          {/* Pathology Detection */}
          <div className="reports-xray-pathologies">
            <h5>Detected Pathologies</h5>
            {pathologies.length > 0 ? (
              <div className="reports-pathology-grid">
                {pathologies.map((pathology, index) => (
                  <div
                    key={index}
                    className={`reports-pathology-item ${pathology.detected ? 'detected' : 'not-detected'}`}
                  >
                    <div className="reports-pathology-header">
                      <span className="reports-pathology-name">{pathology.name}</span>
                      <span className={`reports-pathology-status ${pathology.detected ? 'positive' : 'negative'}`}>
                        {pathology.detected ? 'Detected' : 'Not Detected'}
                      </span>
                    </div>
                    <div className="reports-pathology-confidence">
                      <div className="reports-confidence-bar">
                        <div
                          className="reports-confidence-fill"
                          style={{
                            width: `${(pathology.probability * 100)}%`,
                            backgroundColor: pathology.detected ? '#ef4444' : '#10b981'
                          }}
                        />
                      </div>
                      <span className="reports-confidence-text">
                        {(pathology.probability * 100).toFixed(1)}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="reports-no-pathologies">No pathology data available.</p>
            )}
          </div>

          {/* Generated Report */}
          {generatedReport && (
            <div className="reports-xray-generated-report">
              <h5>AI Generated Report</h5>
              <div className="reports-generated-report-content">
                <p>{generatedReport}</p>
              </div>
            </div>
          )}
        </div>
      );
    }

    if (reportType === 'XRAY_COMPARISON') {
      const comparisonReport = reportResults.comparison_report || '';

      return (
        <div className="reports-xray-comparison-section">
          <h4>X-Ray Comparison Results</h4>

          {comparisonReport ? (
            <div className="reports-comparison-report">
              <h5>Comparison Analysis</h5>
              <div className="reports-comparison-content">
                <p>{comparisonReport}</p>
              </div>
            </div>
          ) : (
            <p className="reports-no-comparison">No comparison data available.</p>
          )}
        </div>
      );
    }

    return null;
  };

  if (loading) {
    return (
      <div className="report-details-overlay">
        <div className="report-details-modal">
          <div className="modal-header">
            <h3>Loading Report Details...</h3>
            <button onClick={onClose} className="close-button">×</button>
          </div>
          <div className="loading-content">
            <div className="loading-spinner"></div>
            <p>Preparing analysis results...</p>
          </div>
        </div>
      </div>
    );
  }

  // Extract entities from report results
  const reportResults = report.results || {};
  const entities = reportResults.entities || [];
  const groupedEntities = groupEntitiesByType(entities);
  const medicalEntitiesCount = Object.values(groupedEntities).reduce((total, group) => total + group.length, 0);

  return (
    <div className="report-details-overlay">
      <div className="report-details-modal">
        <div className="modal-header">
          <div className="modal-title-section">
            <h3>Report Analysis - {report.filename}</h3>
            <p className="modal-subtitle">Patient: {report.patient_name}</p>
          </div>
          <button onClick={onClose} className="close-button">×</button>
        </div>

        <div className="report-details-content">
          {/* Report Summary */}
          <div className="report-summary">
            <div className="summary-grid">
              <div className="summary-item">
                <span className="summary-label">Patient:</span>
                <span className="summary-value">
                  {report.patient_name}
                  {report.patient_age && ` (${report.patient_age}y, ${report.patient_gender})`}
                </span>
              </div>
              <div className="summary-item">
                <span className="summary-label">Report Type:</span>
                <span className="summary-value">
                  {getReportTypeDisplay(report.report_type)}
                </span>
              </div>
              <div className="summary-item">
                <span className="summary-label">Report ID:</span>
                <span className="summary-value">#{report.id}</span>
              </div>
              <div className="summary-item">
                <span className="summary-label">Upload Date:</span>
                <span className="summary-value">
                  {formatDate(report.created_at)}
                </span>
              </div>
              {!isXrayReport(report.report_type) && (
                <>
                  <div className="summary-item">
                    <span className="summary-label">Medical Entities:</span>
                    <span className="summary-value">{medicalEntitiesCount}</span>
                  </div>
                  <div className="summary-item">
                    <span className="summary-label">Total Entities:</span>
                    <span className="summary-value">{entities.length || 0}</span>
                  </div>
                </>
              )}
              <div className="summary-item">
                <span className="summary-label">Status:</span>
                <span className={`summary-value status-processed`}>
                  Processed
                </span>
              </div>
            </div>
          </div>

          {/* X-Ray Results */}
          {isXrayReport(report.report_type) && renderXrayResults(reportResults, report.report_type)}

          {/* Extracted Medical Entities - Only for NER reports */}
          {!isXrayReport(report.report_type) && (
            <div className="entities-section">
              <h4>Extracted Medical Entities</h4>

              {Object.keys(groupedEntities).length > 0 ? (
                <div className="entities-groups">
                  {Object.entries(groupedEntities).map(([entityType, entities]) => (
                    <div key={entityType} className="entity-group">
                      <div
                        className="entity-group-header"
                        style={{ borderLeftColor: getEntityTypeColor(entityType) }}
                      >
                        <h5>{entityType.replace('_', ' ')}</h5>
                        <span className="entity-count">{entities.length}</span>
                      </div>
                      <div className="entity-items">
                        {entities.map((entity, index) => (
                          <div key={index} className="entity-item">
                            <span className="entity-text">{entity.text || entity.value}</span>
                            {entity.confidence && (
                              <span className="entity-confidence">
                                {(entity.confidence * 100).toFixed(1)}%
                              </span>
                            )}
                            {entity.start_pos !== undefined && entity.end_pos !== undefined && (
                              <span className="entity-position">
                                pos: {entity.start_pos}-{entity.end_pos}
                              </span>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="no-entities">
                  <p>No medical entities were extracted from this report.</p>
                  <p className="no-entities-subtitle">
                    Non-medical entities like dates, names, ages, and locations are filtered out to focus on medical terms.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Raw Analysis Data (for debugging) */}
          {reportResults && Object.keys(reportResults).length > 0 && (
            <div className="raw-analysis-section">
              <details>
                <summary>Raw Analysis Data</summary>
                <pre className="raw-analysis-content">
                  {JSON.stringify(reportResults, null, 2)}
                </pre>
              </details>
            </div>
          )}
        </div>

        <div className="modal-footer">
          <button onClick={onClose} className="btn btn-primary">
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReportDetails;
