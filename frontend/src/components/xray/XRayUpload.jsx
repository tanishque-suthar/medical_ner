import React, { useState, useRef } from 'react';
import './XRayUpload.css';

const XRayUpload = ({ onFileSelect, selectedFile, disabled }) => {
    const [dragActive, setDragActive] = useState(false);
    const [error, setError] = useState('');
    const fileInputRef = useRef(null);

    const validImageTypes = ['image/jpeg', 'image/jpg', 'image/png'];
    const maxFileSize = 10 * 1024 * 1024; // 10MB

    const validateFile = (file) => {
        if (!validImageTypes.includes(file.type)) {
            return 'Please upload a valid image file (JPEG, JPG, or PNG)';
        }
        if (file.size > maxFileSize) {
            return 'File size must be less than 10MB';
        }
        return null;
    };

    const handleFileSelection = (file) => {
        setError('');

        const validationError = validateFile(file);
        if (validationError) {
            setError(validationError);
            return;
        }

        onFileSelect(file);
    };

    const handleDrag = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === 'dragenter' || e.type === 'dragover') {
            setDragActive(true);
        } else if (e.type === 'dragleave') {
            setDragActive(false);
        }
    };

    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);

        if (disabled) return;

        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            handleFileSelection(e.dataTransfer.files[0]);
        }
    };

    const handleInputChange = (e) => {
        if (disabled) return;

        if (e.target.files && e.target.files[0]) {
            handleFileSelection(e.target.files[0]);
        }
    };

    const openFileDialog = () => {
        if (!disabled && fileInputRef.current) {
            fileInputRef.current.click();
        }
    };

    const removeFile = () => {
        if (!disabled) {
            onFileSelect(null);
            setError('');
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        }
    };

    const formatFileSize = (bytes) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    return (
        <div className="xray-upload">
            <div className="upload-header">
                <h4>Upload X-Ray Image</h4>
                <p>Supported formats: JPEG, PNG • Max size: 10MB</p>
            </div>

            {!selectedFile ? (
                <div
                    className={`upload-dropzone ${dragActive ? 'drag-active' : ''} ${disabled ? 'disabled' : ''}`}
                    onDragEnter={handleDrag}
                    onDragLeave={handleDrag}
                    onDragOver={handleDrag}
                    onDrop={handleDrop}
                    onClick={openFileDialog}
                >
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/jpeg,image/jpg,image/png"
                        onChange={handleInputChange}
                        style={{ display: 'none' }}
                        disabled={disabled}
                    />

                    <div className="upload-content">
                        <h3>Drop X-ray image here</h3>
                        <p>or click to browse files</p>
                        <div className="upload-formats">
                            <span className="format-badge">JPEG</span>
                            <span className="format-badge">PNG</span>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="uploaded-file">
                    <div className="file-preview">
                        <img
                            src={URL.createObjectURL(selectedFile)}
                            alt="X-ray preview"
                            className="xray-preview"
                        />
                    </div>
                    <div className="file-info">
                        <div className="file-details">
                            <h4 className="file-name">{selectedFile.name}</h4>
                            <p className="file-size">{formatFileSize(selectedFile.size)}</p>
                            <p className="file-type">{selectedFile.type}</p>
                        </div>
                        <div className="file-actions">
                            <button
                                onClick={openFileDialog}
                                className="btn btn-sm btn-outline"
                                disabled={disabled}
                            >
                                Change Image
                            </button>
                            <button
                                onClick={removeFile}
                                className="btn btn-sm btn-secondary"
                                disabled={disabled}
                            >
                                Remove
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {error && (
                <div className="upload-error">
                    <div className="error-icon">⚠️</div>
                    <span>{error}</span>
                </div>
            )}

            <div className="upload-requirements">
                <h5>Image Requirements:</h5>
                <ul>
                    <li>Chest X-ray images work best</li>
                    <li>Clear, high-contrast images preferred</li>
                    <li>Front-facing (PA or AP) views recommended</li>
                    <li>Avoid screenshots or photos of printed X-rays</li>
                </ul>
            </div>
        </div>
    );
};

export default XRayUpload;
