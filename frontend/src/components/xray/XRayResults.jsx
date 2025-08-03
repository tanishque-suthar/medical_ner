import React, { useState } from 'react';
import PathologyList from './PathologyList';
import './XRayResults.css';

const XRayResults = ({ results, patient, originalFile }) => {
    const [activeTab, setActiveTab] = useState('pathologies');

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

    const getDetectedPathologiesCount = () => {
        if (!results?.results?.pathologies) return 0;
        return results.results.pathologies.filter(p => p.detected).length;
    };

    const getHighestConfidencePathology = () => {
        if (!results?.results?.pathologies) return null;
        const detected = results.results.pathologies.filter(p => p.detected);
        if (detected.length === 0) return null;
        return detected.reduce((prev, current) =>
            prev.probability > current.probability ? prev : current
        );
    };

    const handlePrintReport = () => {
        const printContent = document.getElementById('printable-report');
        const printWindow = window.open('', '_blank');
        printWindow.document.write(`
            <html>
                <head>
                    <title>X-Ray Analysis Report - ${patient.name}</title>
                    <style>
                        body { font-family: Arial, sans-serif; margin: 20px; }
                        .report-header { border-bottom: 2px solid #333; padding-bottom: 10px; margin-bottom: 20px; }
                        .pathology-item { margin: 10px 0; padding: 10px; border: 1px solid #ddd; }
                        .detected { background-color: #fff2f0; }
                        .report-text { line-height: 1.6; }
                    </style>
                </head>
                <body>
                    ${printContent.innerHTML}
                </body>
            </html>
        `);
        printWindow.document.close();
        printWindow.print();
    };

    const detectedCount = getDetectedPathologiesCount();
    const highestConfidence = getHighestConfidencePathology();

    return (
        <div className="xray-results">
            <div className="results-header">
                <div className="results-title">
                    <h3>Analysis Results</h3>
                    <div className="results-summary">
                        <span className="summary-item">
                            <strong>{detectedCount}</strong> pathologies detected
                        </span>
                        <span className="summary-item">
                            Report ID: <strong>#{results.id}</strong>
                        </span>
                        <span className="summary-item">
                            Analyzed: <strong>{formatDate(results.created_at)}</strong>
                        </span>
                    </div>
                </div>
                <div className="results-actions">
                    <button
                        onClick={handlePrintReport}
                        className="btn btn-outline btn-sm"
                    >
                        Print Report
                    </button>
                </div>
            </div>

            {detectedCount > 0 && (
                <div className="results-alert">
                    <div className="alert-icon">Warning</div>
                    <div className="alert-content">
                        <h4>Pathologies Detected</h4>
                        <p>
                            {detectedCount} potential patholog{detectedCount === 1 ? 'y' : 'ies'} detected.
                            {highestConfidence && (
                                <> Highest confidence: <strong>{highestConfidence.name}</strong> ({(highestConfidence.probability * 100).toFixed(1)}%)</>
                            )}
                        </p>
                        <p className="disclaimer">
                            <em>This is AI-assisted analysis and should be reviewed by a qualified radiologist.</em>
                        </p>
                    </div>
                </div>
            )}

            <div className="results-tabs">
                <button
                    onClick={() => setActiveTab('pathologies')}
                    className={`tab-button ${activeTab === 'pathologies' ? 'active' : ''}`}
                >
                    Pathology Detection
                </button>
                <button
                    onClick={() => setActiveTab('report')}
                    className={`tab-button ${activeTab === 'report' ? 'active' : ''}`}
                >
                    Generated Report
                </button>
                <button
                    onClick={() => setActiveTab('details')}
                    className={`tab-button ${activeTab === 'details' ? 'active' : ''}`}
                >
                    Analysis Details
                </button>
            </div>

            <div className="results-content">
                {activeTab === 'pathologies' && (
                    <div className="pathologies-tab">
                        <PathologyList pathologies={results.results.pathologies} />
                    </div>
                )}

                {activeTab === 'report' && (
                    <div className="report-tab">
                        <div className="generated-report">
                            <h4>AI-Generated Medical Report</h4>
                            <div className="report-text">
                                {results.results.generated_report || 'No report generated.'}
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'details' && (
                    <div className="details-tab">
                        <div className="analysis-details">
                            <h4>Analysis Information</h4>
                            <div className="details-grid">
                                <div className="detail-item">
                                    <span className="detail-label">Patient:</span>
                                    <span className="detail-value">{patient.name}</span>
                                </div>
                                <div className="detail-item">
                                    <span className="detail-label">Patient ID:</span>
                                    <span className="detail-value">#{patient.id}</span>
                                </div>
                                <div className="detail-item">
                                    <span className="detail-label">Age:</span>
                                    <span className="detail-value">{patient.age} years</span>
                                </div>
                                <div className="detail-item">
                                    <span className="detail-label">Gender:</span>
                                    <span className="detail-value">{patient.gender}</span>
                                </div>
                                <div className="detail-item">
                                    <span className="detail-label">Image File:</span>
                                    <span className="detail-value">{originalFile?.name || results.filename}</span>
                                </div>
                                <div className="detail-item">
                                    <span className="detail-label">Analysis Date:</span>
                                    <span className="detail-value">{formatDate(results.created_at)}</span>
                                </div>
                                <div className="detail-item">
                                    <span className="detail-label">Report Type:</span>
                                    <span className="detail-value">X-Ray Analysis</span>
                                </div>
                                <div className="detail-item">
                                    <span className="detail-label">AI Model:</span>
                                    <span className="detail-value">ChexNet + BiomedCLIP</span>
                                </div>
                            </div>
                        </div>

                        {originalFile && (
                            <div className="image-details">
                                <h4>Image Information</h4>
                                <div className="image-preview-container">
                                    <img
                                        src={URL.createObjectURL(originalFile)}
                                        alt="Analyzed X-ray"
                                        className="analysis-image-preview"
                                    />
                                    <div className="image-info">
                                        <p><strong>File Size:</strong> {(originalFile.size / 1024 / 1024).toFixed(2)} MB</p>
                                        <p><strong>File Type:</strong> {originalFile.type}</p>
                                        <p><strong>Last Modified:</strong> {new Date(originalFile.lastModified).toLocaleString()}</p>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Hidden printable content */}
            <div id="printable-report" style={{ display: 'none' }}>
                <div className="report-header">
                    <h1>X-Ray Analysis Report</h1>
                    <p><strong>Patient:</strong> {patient.name} (ID: {patient.id})</p>
                    <p><strong>Age:</strong> {patient.age} | <strong>Gender:</strong> {patient.gender}</p>
                    <p><strong>Analysis Date:</strong> {formatDate(results.created_at)}</p>
                    <p><strong>Report ID:</strong> #{results.id}</p>
                </div>

                <h2>Pathology Detection Results</h2>
                {results.results.pathologies.map((pathology, index) => (
                    <div key={index} className={`pathology-item ${pathology.detected ? 'detected' : ''}`}>
                        <strong>{pathology.name}:</strong> {pathology.detected ? 'DETECTED' : 'Not Detected'}
                        (Confidence: {(pathology.probability * 100).toFixed(1)}%)
                    </div>
                ))}

                <h2>Generated Report</h2>
                <div className="report-text">
                    {results.results.generated_report || 'No report generated.'}
                </div>

                <p><em>This analysis was generated using AI assistance and should be reviewed by a qualified radiologist.</em></p>
            </div>
        </div>
    );
};

export default XRayResults;
