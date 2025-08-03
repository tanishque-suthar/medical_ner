import React, { useState, useEffect } from 'react';
import './ReportResults.css';

const ReportResults = ({ report, onClose }) => {
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Simulate a small loading time for smooth UX
        const timer = setTimeout(() => {
            setLoading(false);
        }, 500);

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
            'PERSON',
            'DATE',
            'TIME',
            'AGE',
            'NAME',
            'LOCATION',
            'ADDRESS',
            'PHONE',
            'EMAIL',
            'ID',
            'NUMBER',
            'QUANTITY',
            'MONEY',
            'PERCENT',
            'ORDINAL',
            'CARDINAL',
            'GPE', // Geopolitical entity
            'ORG', // Organization
            'FAC', // Facility
            'EVENT',
            'WORK_OF_ART',
            'LAW',
            'LANGUAGE',
            'NORP', // Nationalities, religious groups
            'MISC',
            'OTHER'
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

    if (loading) {
        return (
            <div className="report-results-overlay">
                <div className="report-results-modal">
                    <div className="modal-header">
                        <h3>Loading Report Results...</h3>
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

    const getReportTypeDisplay = (reportType) => {
        switch (reportType) {
            case 'PDF_NER':
                return 'Medical Report (PDF NER)';
            case 'XRAY_ANALYSIS':
                return 'X-Ray Analysis';
            case 'XRAY_COMPARISON':
                return 'X-Ray Comparison';
            case 'medical_text':
                return 'Medical Report (NER)';
            default:
                return reportType;
        }
    };

    const isXRayReport = (reportType) => {
        return reportType === 'XRAY_ANALYSIS' || reportType === 'XRAY_COMPARISON';
    };

    const renderXRayResults = () => {
        const results = report.results || {};

        if (report.report_type === 'XRAY_ANALYSIS') {
            const pathologies = results.pathologies || [];
            const detectedPathologies = pathologies.filter(p => p.detected);

            return (
                <div className="xray-results-section">
                    <div className="pathologies-summary">
                        <h4>Pathology Detection Results</h4>
                        <div className="pathology-stats">
                            <div className="stat-item">
                                <span className="stat-number">{detectedPathologies.length}</span>
                                <span className="stat-label">Detected Pathologies</span>
                            </div>
                            <div className="stat-item">
                                <span className="stat-number">{pathologies.length}</span>
                                <span className="stat-label">Total Analyzed</span>
                            </div>
                        </div>
                    </div>

                    {detectedPathologies.length > 0 && (
                        <div className="detected-pathologies">
                            <h5>Detected Pathologies</h5>
                            <div className="pathology-list">
                                {detectedPathologies.map((pathology, index) => (
                                    <div key={index} className="pathology-item detected">
                                        <div className="pathology-info">
                                            <span className="pathology-name">{pathology.name}</span>
                                            <span className="pathology-confidence">
                                                {(pathology.probability * 100).toFixed(1)}% confidence
                                            </span>
                                        </div>
                                        <div className="pathology-status detected">DETECTED</div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    <div className="all-pathologies">
                        <h5>Complete Analysis</h5>
                        <div className="pathology-list">
                            {pathologies.map((pathology, index) => (
                                <div key={index} className={`pathology-item ${pathology.detected ? 'detected' : 'not-detected'}`}>
                                    <div className="pathology-info">
                                        <span className="pathology-name">{pathology.name}</span>
                                        <span className="pathology-confidence">
                                            {(pathology.probability * 100).toFixed(1)}% confidence
                                        </span>
                                    </div>
                                    <div className={`pathology-status ${pathology.detected ? 'detected' : 'not-detected'}`}>
                                        {pathology.detected ? 'DETECTED' : 'NOT DETECTED'}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {results.generated_report && (
                        <div className="generated-report">
                            <h5>AI-Generated Report</h5>
                            <div className="report-text">
                                {results.generated_report}
                            </div>
                        </div>
                    )}
                </div>
            );
        } else if (report.report_type === 'XRAY_COMPARISON') {
            return (
                <div className="xray-comparison-results">
                    <h4>X-Ray Comparison Analysis</h4>
                    <div className="comparison-report">
                        <div className="report-text">
                            {results.comparison_report || 'No comparison report available.'}
                        </div>
                    </div>
                </div>
            );
        }

        return null;
    };

    // Extract entities from report results
    const reportResults = report.results || {};
    const entities = reportResults.entities || [];
    const groupedEntities = groupEntitiesByType(entities);
    const medicalEntitiesCount = Object.values(groupedEntities).reduce((total, group) => total + group.length, 0);

    return (
        <div className="report-results-overlay">
            <div className="report-results-modal">
                <div className="modal-header">
                    <h3>Analysis Results - {report.filename}</h3>
                    <button onClick={onClose} className="close-button">×</button>
                </div>

                <div className="report-results-content">
                    {/* Report Summary */}
                    <div className="report-summary">
                        <div className="summary-grid">
                            <div className="summary-item">
                                <span className="summary-label">Report Type:</span>
                                <span className="summary-value">
                                    {getReportTypeDisplay(report.report_type)}
                                </span>
                            </div>
                            <div className="summary-item">
                                <span className="summary-label">Processed:</span>
                                <span className="summary-value">{formatDate(report.created_at || new Date())}</span>
                            </div>
                            {!isXRayReport(report.report_type) && (
                                <>
                                    <div className="summary-item">
                                        <span className="summary-label">Medical Entities Found:</span>
                                        <span className="summary-value">{medicalEntitiesCount}</span>
                                    </div>
                                    <div className="summary-item">
                                        <span className="summary-label">Total Entities Processed:</span>
                                        <span className="summary-value">{entities.length || 0}</span>
                                    </div>
                                </>
                            )}
                            {isXRayReport(report.report_type) && (
                                <div className="summary-item">
                                    <span className="summary-label">Analysis Type:</span>
                                    <span className="summary-value">
                                        {report.report_type === 'XRAY_ANALYSIS' ? 'Pathology Detection' : 'Comparison Analysis'}
                                    </span>
                                </div>
                            )}
                            <div className="summary-item">
                                <span className="summary-label">Status:</span>
                                <span className={`summary-value status-processed`}>
                                    Processed
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* X-Ray Results or NER Results */}
                    {isXRayReport(report.report_type) ? (
                        renderXRayResults()
                    ) : (
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

                    {/* Extracted Medical Entities */}
                    <div className="entities-section" style={{ display: 'none' }}>
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

export default ReportResults;
