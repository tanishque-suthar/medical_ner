import React, { useState } from 'react';
import axios from 'axios';
import XRayUpload from './XRayUpload';
import XRayResults from './XRayResults';
import './XRayAnalysis.css';

const XRayAnalysis = ({ patient }) => {
    const [selectedFile, setSelectedFile] = useState(null);
    const [analyzing, setAnalyzing] = useState(false);
    const [results, setResults] = useState(null);
    const [error, setError] = useState('');
    const [uploadProgress, setUploadProgress] = useState(0);
    const [showProgress, setShowProgress] = useState(false);

    const handleFileSelect = (file) => {
        setSelectedFile(file);
        setResults(null);
        setError('');
    };

    const handleAnalyze = async () => {
        if (!patient || !selectedFile) return;

        setAnalyzing(true);
        setError('');
        setUploadProgress(0);
        setShowProgress(true);

        const formData = new FormData();
        formData.append('file', selectedFile);

        try {
            const response = await axios.post(
                `/api/patients/analyze-xray/${patient.id}`,
                formData,
                {
                    headers: {
                        'Content-Type': 'multipart/form-data'
                    },
                    timeout: 90000, // 90 seconds timeout for AI processing
                    onUploadProgress: (progressEvent) => {
                        const percentCompleted = Math.round(
                            (progressEvent.loaded * 100) / progressEvent.total
                        );
                        setUploadProgress(percentCompleted);
                    },
                }
            );

            setResults(response.data);
        } catch (error) {
            console.error('X-ray analysis failed:', error);
            if (error.response?.status === 503) {
                setError('X-ray analysis service is currently unavailable. Please try again later.');
            } else if (error.response?.status === 404) {
                setError('Patient not found. Please select a different patient.');
            } else if (error.code === 'ECONNABORTED') {
                setError('Analysis is taking longer than expected. Please try again.');
            } else {
                setError('Failed to analyze X-ray. Please check your image and try again.');
            }
        } finally {
            setAnalyzing(false);
            setTimeout(() => {
                setShowProgress(false);
                setUploadProgress(0);
            }, 2000);
        }
    };

    const handleClearResults = () => {
        setResults(null);
        setSelectedFile(null);
        setError('');
    };

    const isAnalyzeDisabled = !patient || !selectedFile || analyzing;

    return (
        <div className="xray-analysis">
            <div className="analysis-header">
                <h3>X-Ray Analysis for {patient.name}</h3>
                <p className="analysis-subtitle">
                    Upload a chest X-ray image for AI-powered pathology detection
                </p>
            </div>

            <div className="analysis-content">
                <div className="upload-section">
                    <XRayUpload
                        onFileSelect={handleFileSelect}
                        selectedFile={selectedFile}
                        disabled={analyzing}
                    />
                </div>

                <div className="analysis-controls">
                    <button
                        onClick={handleAnalyze}
                        disabled={isAnalyzeDisabled}
                        className={`btn ${analyzing ? 'btn-secondary' : 'btn-primary'} analyze-btn`}
                    >
                        {analyzing ? (
                            <>
                                <div className="btn-spinner"></div>
                                Analyzing X-Ray...
                            </>
                        ) : (
                            'Analyze X-Ray'
                        )}
                    </button>

                    {results && (
                        <button
                            onClick={handleClearResults}
                            className="btn btn-outline clear-btn"
                        >
                            Clear Results
                        </button>
                    )}
                </div>

                {error && (
                    <div className="analysis-error">
                        <div className="error-icon">Warning</div>
                        <div className="error-content">
                            <h4>Analysis Failed</h4>
                            <p>{error}</p>
                        </div>
                    </div>
                )}

                {analyzing && (
                    <div className="analysis-progress">
                        <div className="progress-content">
                            <div className="progress-icon">AI</div>
                            <h4>AI Analysis in Progress</h4>
                            <p>Processing your X-ray image using advanced pathology detection models...</p>
                            <div className="progress-steps">
                                <div className="progress-step active">
                                    <span className="step-number">1</span>
                                    <span className="step-text">Image Processing</span>
                                </div>
                                <div className="progress-step active">
                                    <span className="step-number">2</span>
                                    <span className="step-text">Pathology Detection</span>
                                </div>
                                <div className="progress-step">
                                    <span className="step-number">3</span>
                                    <span className="step-text">Report Generation</span>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {results && !analyzing && (
                    <div className="results-section">
                        <XRayResults
                            results={results}
                            patient={patient}
                            originalFile={selectedFile}
                        />
                    </div>
                )}
            </div>
        </div>
    );
};

export default XRayAnalysis;
