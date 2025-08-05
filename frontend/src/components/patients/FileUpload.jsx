import React, { useState, useRef } from 'react';
import axios from 'axios';
import './FileUpload.css';

const FileUpload = ({ patientId, onSuccess, onCancel }) => {
    const [selectedFile, setSelectedFile] = useState(null);
    const [isDragging, setIsDragging] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [error, setError] = useState('');
    const [processingStatus, setProcessingStatus] = useState('');
    const [uploadProgress, setUploadProgress] = useState(0);
    const [showProgress, setShowProgress] = useState(false);
    const fileInputRef = useRef(null);

    const handleFileSelect = (file) => {
        if (file) {
            // For now, only support PDF files (medical reports)
            const allowedTypes = ['application/pdf'];

            if (!allowedTypes.includes(file.type)) {
                setError('Please select a PDF file for medical reports. X-ray analysis coming soon.');
                return;
            }

            setSelectedFile(file);
            setError('');
        }
    };

    const handleDragOver = (e) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = (e) => {
        e.preventDefault();
        setIsDragging(false);
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setIsDragging(false);

        const files = e.dataTransfer.files;
        if (files.length > 0) {
            handleFileSelect(files[0]);
        }
    };

    const handleFileInputChange = (e) => {
        if (e.target.files.length > 0) {
            handleFileSelect(e.target.files[0]);
        }
    };

    const handleUpload = async () => {
        if (!selectedFile) {
            setError('Please select a file first');
            return;
        }

        setIsProcessing(true);
        setError('');
        setUploadProgress(0);
        setShowProgress(true);

        try {
            console.log('=== UPLOAD DEBUG INFO ===');
            console.log('Patient ID received:', patientId);
            console.log('Selected file:', selectedFile.name, selectedFile.type);

            const formData = new FormData();
            formData.append('file', selectedFile);

            setProcessingStatus('Uploading file...');

            // Only support PDF files (medical reports) for now
            if (selectedFile.type !== 'application/pdf') {
                throw new Error('Only PDF files are supported currently. X-ray analysis coming soon.');
            }

            // Build endpoint with patient_id as query parameter
            let endpoint = '/api/patients/upload-report';
            if (patientId) {
                endpoint += `?patient_id=${patientId}`;
                console.log('Added patient_id as query parameter:', patientId);
            } else {
                console.log('WARNING: No patient ID provided!');
            }

            console.log('Using endpoint with query params:', endpoint);
            
            const response = await axios.post(endpoint, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
                onUploadProgress: (progressEvent) => {
                    const percentCompleted = Math.round(
                        (progressEvent.loaded * 100) / progressEvent.total
                    );
                    setUploadProgress(percentCompleted);
                    
                    if (percentCompleted < 100) {
                        setProcessingStatus(`Uploading file... ${percentCompleted}%`);
                    } else {
                        setProcessingStatus('Processing medical report with NER...');
                    }
                },
            });

            console.log('Upload successful:', response.data);
            console.log('=== END DEBUG INFO ===');
            setProcessingStatus('Analysis complete!');
            setUploadProgress(100);

            // Wait a moment to show completion message
            setTimeout(() => {
                onSuccess(response.data);
            }, 1000);

        } catch (error) {
            console.error('=== UPLOAD ERROR DEBUG ===');
            console.error('Upload failed:', error);
            console.error('Error response:', error.response?.data);
            console.error('Error status:', error.response?.status);
            console.error('=== END ERROR DEBUG ===');
            setError(error.response?.data?.detail || 'Upload failed');
            setIsProcessing(false);
            setProcessingStatus('');
            setShowProgress(false);
            setUploadProgress(0);
        } finally {
            // Reset progress after a delay if successful
            if (!error) {
                setTimeout(() => {
                    setShowProgress(false);
                    setUploadProgress(0);
                }, 2000);
            }
        }
    };

    const removeFile = () => {
        setSelectedFile(null);
        setError('');
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    return (
        <div className="file-upload-overlay">
            <div className="file-upload-modal">
                <div className="modal-header">
                    <h3>Upload Medical Report</h3>
                    <button onClick={onCancel} className="close-button" disabled={isProcessing}>
                        ×
                    </button>
                </div>

                <div className="file-upload-content">
                    {error && (
                        <div className="error-message">
                            {error}
                        </div>
                    )}

                    {!isProcessing ? (
                        <>
                            <div
                                className={`file-drop-zone ${isDragging ? 'dragging' : ''} ${selectedFile ? 'has-file' : ''}`}
                                onDragOver={handleDragOver}
                                onDragLeave={handleDragLeave}
                                onDrop={handleDrop}
                                onClick={() => fileInputRef.current?.click()}
                            >
                                {selectedFile ? (
                                    <div className="selected-file">
                                        <div className="file-icon">📄</div>
                                        <div className="file-info">
                                            <p className="file-name">{selectedFile.name}</p>
                                            <p className="file-size">
                                                {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                                            </p>
                                        </div>
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                removeFile();
                                            }}
                                            className="remove-file-button"
                                        >
                                            ×
                                        </button>
                                    </div>
                                ) : (
                                    <div className="drop-zone-content">
                                        <div className="upload-icon">📤</div>
                                        <p className="drop-text">
                                            Drag & drop your PDF file here, or <span className="browse-text">browse</span>
                                        </p>
                                        <p className="file-types">
                                            PDF files for medical reports (X-ray analysis coming soon)
                                        </p>
                                    </div>
                                )}
                            </div>

                            <input
                                ref={fileInputRef}
                                type="file"
                                accept=".pdf"
                                onChange={handleFileInputChange}
                                className="file-input-hidden"
                            />

                            <div className="upload-actions">
                                <button
                                    onClick={onCancel}
                                    className="btn btn-secondary"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleUpload}
                                    className="btn btn-primary"
                                    disabled={!selectedFile}
                                >
                                    Upload & Analyze
                                </button>
                            </div>
                        </>
                    ) : (
                        <div className="processing-state">
                            <div className="processing-spinner"></div>
                            <h4>Processing Report...</h4>
                            <p className="processing-status">{processingStatus}</p>
                            
                            {/* Upload Progress Bar */}
                            {showProgress && (
                                <div className="upload-progress">
                                    <div className="progress-bar-container">
                                        <div 
                                            className="progress-bar"
                                            style={{ width: `${uploadProgress}%` }}
                                        ></div>
                                    </div>
                                    <div className="progress-text">
                                        {uploadProgress < 100 ? `${uploadProgress}%` : 'Processing...'}
                                    </div>
                                </div>
                            )}
                            
                            <div className="processing-info">
                                <p>Our AI is analyzing your file. This may take a few moments.</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default FileUpload;
