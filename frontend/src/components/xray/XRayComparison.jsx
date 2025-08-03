import React, { useState } from 'react';
import axios from 'axios';
import './XRayComparison.css';

const XRayComparison = ({ patient }) => {
    const [previousXray, setPreviousXray] = useState(null);
    const [currentXray, setCurrentXray] = useState(null);
    const [comparing, setComparing] = useState(false);
    const [comparisonResult, setComparisonResult] = useState(null);
    const [error, setError] = useState('');
    const [dragStates, setDragStates] = useState({
        previous: false,
        current: false
    });

    const handleFileSelect = (file, type) => {
        if (!file) return;

        // Validate file type - only images
        const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/bmp', 'image/tiff'];
        if (!allowedTypes.includes(file.type)) {
            setError('Please select a valid image file (JPEG, PNG, BMP, TIFF)');
            return;
        }

        // Validate file size (max 10MB)
        if (file.size > 10 * 1024 * 1024) {
            setError('File size must be less than 10MB');
            return;
        }

        if (type === 'previous') {
            setPreviousXray(file);
        } else {
            setCurrentXray(file);
        }
        setError('');
        setComparisonResult(null);
    };

    const handleDragOver = (e, type) => {
        e.preventDefault();
        setDragStates(prev => ({ ...prev, [type]: true }));
    };

    const handleDragLeave = (e, type) => {
        e.preventDefault();
        setDragStates(prev => ({ ...prev, [type]: false }));
    };

    const handleDrop = (e, type) => {
        e.preventDefault();
        setDragStates(prev => ({ ...prev, [type]: false }));

        const files = e.dataTransfer.files;
        if (files.length > 0) {
            handleFileSelect(files[0], type);
        }
    };

    const handleFileInputChange = (e, type) => {
        if (e.target.files.length > 0) {
            handleFileSelect(e.target.files[0], type);
        }
    };

    const handleCompare = async () => {
        if (!patient || !previousXray || !currentXray) return;

        setComparing(true);
        setError('');

        const formData = new FormData();
        formData.append('previous_xray', previousXray);
        formData.append('current_xray', currentXray);

        try {
            const response = await axios.post(
                `/api/patients/compare-xrays/${patient.id}`,
                formData,
                {
                    headers: {
                        'Content-Type': 'multipart/form-data'
                    },
                    timeout: 120000 // 2 minutes timeout for comparison
                }
            );

            setComparisonResult(response.data);
        } catch (error) {
            console.error('X-ray comparison failed:', error);
            if (error.response?.status === 503) {
                setError('X-ray comparison service is currently unavailable. Please try again later.');
            } else if (error.response?.status === 404) {
                setError('Patient not found. Please select a different patient.');
            } else if (error.code === 'ECONNABORTED') {
                setError('Comparison is taking longer than expected. Please try again.');
            } else {
                setError('Failed to compare X-rays. Please check your images and try again.');
            }
        } finally {
            setComparing(false);
        }
    };

    const handleClear = () => {
        setPreviousXray(null);
        setCurrentXray(null);
        setComparisonResult(null);
        setError('');
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

    const isCompareDisabled = !patient || !previousXray || !currentXray || comparing;

    return (
        <div className="xray-comparison">
            <div className="comparison-header">
                <h3>X-Ray Comparison for {patient.name}</h3>
                <p className="comparison-subtitle">
                    Compare two X-ray images to analyze changes and progression over time
                </p>
            </div>

            <div className="comparison-content">
                <div className="upload-section">
                    <div className="upload-grid">
                        {/* Previous X-ray Upload */}
                        <div className="upload-area">
                            <h4>Previous X-ray</h4>
                            <div
                                className={`file-drop-zone ${dragStates.previous ? 'drag-over' : ''} ${previousXray ? 'has-file' : ''}`}
                                onDragOver={(e) => handleDragOver(e, 'previous')}
                                onDragLeave={(e) => handleDragLeave(e, 'previous')}
                                onDrop={(e) => handleDrop(e, 'previous')}
                                onClick={() => document.getElementById('previous-file-input').click()}
                            >
                                {previousXray ? (
                                    <div className="file-preview">
                                        <img
                                            src={URL.createObjectURL(previousXray)}
                                            alt="Previous X-ray"
                                            className="xray-preview"
                                        />
                                        <div className="file-info">
                                            <p className="file-name">{previousXray.name}</p>
                                            <p className="file-size">
                                                {(previousXray.size / 1024 / 1024).toFixed(2)} MB
                                            </p>
                                        </div>
                                        <button
                                            className="remove-file-btn"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setPreviousXray(null);
                                            }}
                                        >
                                            ✕
                                        </button>
                                    </div>
                                ) : (
                                    <div className="upload-placeholder">
                                        <div className="upload-icon">Image</div>
                                        <p>Drop previous X-ray here or click to select</p>
                                        <p className="upload-hint">JPEG, PNG, BMP, TIFF (max 10MB)</p>
                                    </div>
                                )}
                            </div>
                            <input
                                id="previous-file-input"
                                type="file"
                                accept="image/*"
                                onChange={(e) => handleFileInputChange(e, 'previous')}
                                style={{ display: 'none' }}
                                disabled={comparing}
                            />
                        </div>

                        {/* Current X-ray Upload */}
                        <div className="upload-area">
                            <h4>Current X-ray</h4>
                            <div
                                className={`file-drop-zone ${dragStates.current ? 'drag-over' : ''} ${currentXray ? 'has-file' : ''}`}
                                onDragOver={(e) => handleDragOver(e, 'current')}
                                onDragLeave={(e) => handleDragLeave(e, 'current')}
                                onDrop={(e) => handleDrop(e, 'current')}
                                onClick={() => document.getElementById('current-file-input').click()}
                            >
                                {currentXray ? (
                                    <div className="file-preview">
                                        <img
                                            src={URL.createObjectURL(currentXray)}
                                            alt="Current X-ray"
                                            className="xray-preview"
                                        />
                                        <div className="file-info">
                                            <p className="file-name">{currentXray.name}</p>
                                            <p className="file-size">
                                                {(currentXray.size / 1024 / 1024).toFixed(2)} MB
                                            </p>
                                        </div>
                                        <button
                                            className="remove-file-btn"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setCurrentXray(null);
                                            }}
                                        >
                                            ✕
                                        </button>
                                    </div>
                                ) : (
                                    <div className="upload-placeholder">
                                        <div className="upload-icon">Image</div>
                                        <p>Drop current X-ray here or click to select</p>
                                        <p className="upload-hint">JPEG, PNG, BMP, TIFF (max 10MB)</p>
                                    </div>
                                )}
                            </div>
                            <input
                                id="current-file-input"
                                type="file"
                                accept="image/*"
                                onChange={(e) => handleFileInputChange(e, 'current')}
                                style={{ display: 'none' }}
                                disabled={comparing}
                            />
                        </div>
                    </div>
                </div>

                <div className="comparison-controls">
                    <button
                        onClick={handleCompare}
                        disabled={isCompareDisabled}
                        className={`btn ${comparing ? 'btn-secondary' : 'btn-primary'} compare-btn`}
                    >
                        {comparing ? (
                            <>
                                <div className="btn-spinner"></div>
                                Comparing X-Rays...
                            </>
                        ) : (
                            'Compare X-Rays'
                        )}
                    </button>

                    {(previousXray || currentXray || comparisonResult) && (
                        <button
                            onClick={handleClear}
                            className="btn btn-outline clear-btn"
                            disabled={comparing}
                        >
                            Clear All
                        </button>
                    )}
                </div>

                {error && (
                    <div className="comparison-error">
                        <div className="error-icon">Warning</div>
                        <div className="error-content">
                            <h4>Comparison Failed</h4>
                            <p>{error}</p>
                        </div>
                    </div>
                )}

                {comparing && (
                    <div className="comparison-progress">
                        <div className="progress-content">
                            <div className="progress-icon">AI</div>
                            <h4>AI Comparison in Progress</h4>
                            <p>Analyzing both X-ray images and generating comparison report...</p>
                            <div className="progress-steps">
                                <div className="progress-step active">
                                    <span className="step-number">1</span>
                                    <span className="step-text">Processing Images</span>
                                </div>
                                <div className="progress-step active">
                                    <span className="step-number">2</span>
                                    <span className="step-text">Analyzing Changes</span>
                                </div>
                                <div className="progress-step">
                                    <span className="step-number">3</span>
                                    <span className="step-text">Generating Report</span>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {comparisonResult && !comparing && (
                    <div className="comparison-results">
                        <div className="results-header">
                            <h3>Comparison Results</h3>
                            <div className="results-meta">
                                <span className="meta-item">
                                    Report ID: <strong>#{comparisonResult.id}</strong>
                                </span>
                                <span className="meta-item">
                                    Generated: <strong>{formatDate(comparisonResult.created_at)}</strong>
                                </span>
                            </div>
                        </div>

                        <div className="side-by-side-images">
                            <div className="image-container">
                                <h4>Previous X-ray</h4>
                                <img
                                    src={URL.createObjectURL(previousXray)}
                                    alt="Previous X-ray"
                                    className="comparison-image"
                                />
                                <p className="image-label">{previousXray.name}</p>
                            </div>
                            <div className="comparison-arrow">
                                <span>vs</span>
                            </div>
                            <div className="image-container">
                                <h4>Current X-ray</h4>
                                <img
                                    src={URL.createObjectURL(currentXray)}
                                    alt="Current X-ray"
                                    className="comparison-image"
                                />
                                <p className="image-label">{currentXray.name}</p>
                            </div>
                        </div>

                        <div className="comparison-report">
                            <h4>AI-Generated Comparison Report</h4>
                            <div className="report-content">
                                <div className="report-text">
                                    {comparisonResult.results?.comparison_report || 'No comparison report generated.'}
                                </div>
                            </div>
                            <div className="report-disclaimer">
                                <p>
                                    <em>This comparison analysis was generated using AI assistance and should be reviewed by a qualified radiologist.</em>
                                </p>
                            </div>
                        </div>

                        <div className="comparison-actions">
                            <button
                                onClick={() => {
                                    const printContent = document.getElementById('printable-comparison');
                                    const printWindow = window.open('', '_blank');
                                    printWindow.document.write(`
                                        <html>
                                            <head>
                                                <title>X-Ray Comparison Report - ${patient.name}</title>
                                                <style>
                                                    body { font-family: Arial, sans-serif; margin: 20px; }
                                                    .report-header { border-bottom: 2px solid #333; padding-bottom: 10px; margin-bottom: 20px; }
                                                    .comparison-images { display: flex; gap: 20px; margin: 20px 0; }
                                                    .comparison-images img { max-width: 300px; border: 1px solid #ddd; }
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
                                }}
                                className="btn btn-outline btn-sm"
                            >
                                Print Report
                            </button>
                        </div>

                        {/* Hidden printable content */}
                        <div id="printable-comparison" style={{ display: 'none' }}>
                            <div className="report-header">
                                <h1>X-Ray Comparison Report</h1>
                                <p><strong>Patient:</strong> {patient.name} (ID: {patient.id})</p>
                                <p><strong>Age:</strong> {patient.age} | <strong>Gender:</strong> {patient.gender}</p>
                                <p><strong>Comparison Date:</strong> {formatDate(comparisonResult.created_at)}</p>
                                <p><strong>Report ID:</strong> #{comparisonResult.id}</p>
                            </div>

                            <h2>Comparison Analysis</h2>
                            <div className="report-text">
                                {comparisonResult.results?.comparison_report || 'No comparison report generated.'}
                            </div>

                            <p><em>This comparison analysis was generated using AI assistance and should be reviewed by a qualified radiologist.</em></p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default XRayComparison;
