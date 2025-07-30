import React, { useState } from 'react';
import './PathologyList.css';

const PathologyList = ({ pathologies }) => {
    const [sortBy, setSortBy] = useState('probability'); // 'name', 'probability', 'detected'
    const [filterBy, setFilterBy] = useState('all'); // 'all', 'detected', 'not-detected'

    const getPathologyDescription = (name) => {
        const descriptions = {
            'Atelectasis': 'Collapse or closure of a lung resulting in reduced or absent gas exchange',
            'Cardiomegaly': 'Enlargement of the heart, often indicating heart disease',
            'Effusion': 'Accumulation of fluid in the pleural space around the lungs',
            'Infiltration': 'Abnormal accumulation of substances in lung tissue',
            'Mass': 'Abnormal growth or tumor in lung tissue',
            'Nodule': 'Small, round growth in the lungs that may be benign or malignant',
            'Pneumonia': 'Infection that inflames air sacs in one or both lungs',
            'Pneumothorax': 'Collapsed lung due to air leaking into the chest cavity',
            'Consolidation': 'Lung tissue filled with liquid instead of air',
            'Edema': 'Fluid accumulation in lung tissue',
            'Emphysema': 'Condition where air sacs in lungs are damaged',
            'Fibrosis': 'Scarring and thickening of lung tissue',
            'Pleural_Thickening': 'Thickening of the pleural lining around the lungs',
            'Hernia': 'Protrusion of an organ through the wall that contains it'
        };
        return descriptions[name] || 'No description available';
    };

    const getSeverityLevel = (probability) => {
        if (probability >= 0.8) return 'high';
        if (probability >= 0.6) return 'moderate';
        if (probability >= 0.4) return 'low';
        return 'minimal';
    };

    const getSeverityLabel = (probability) => {
        const level = getSeverityLevel(probability);
        const labels = {
            'high': 'High Confidence',
            'moderate': 'Moderate Confidence',
            'low': 'Low Confidence',
            'minimal': 'Minimal Confidence'
        };
        return labels[level];
    };

    // Sort pathologies
    const sortedPathologies = [...pathologies].sort((a, b) => {
        switch (sortBy) {
            case 'name':
                return a.name.localeCompare(b.name);
            case 'probability':
                return b.probability - a.probability;
            case 'detected':
                if (a.detected === b.detected) return b.probability - a.probability;
                return b.detected - a.detected;
            default:
                return 0;
        }
    });

    // Filter pathologies
    const filteredPathologies = sortedPathologies.filter(pathology => {
        switch (filterBy) {
            case 'detected':
                return pathology.detected;
            case 'not-detected':
                return !pathology.detected;
            default:
                return true;
        }
    });

    const detectedCount = pathologies.filter(p => p.detected).length;
    const totalCount = pathologies.length;

    return (
        <div className="pathology-list">
            <div className="pathology-header">
                <div className="pathology-summary">
                    <h4>Pathology Detection Results</h4>
                    <div className="summary-stats">
                        <span className="stat detected-stat">
                            <strong>{detectedCount}</strong> detected
                        </span>
                        <span className="stat total-stat">
                            <strong>{totalCount - detectedCount}</strong> not detected
                        </span>
                        <span className="stat total-stat">
                            <strong>{totalCount}</strong> total analyzed
                        </span>
                    </div>
                </div>

                <div className="pathology-controls">
                    <div className="control-group">
                        <label htmlFor="sort-select">Sort by:</label>
                        <select
                            id="sort-select"
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value)}
                            className="control-select"
                        >
                            <option value="probability">Confidence</option>
                            <option value="detected">Detection Status</option>
                            <option value="name">Name</option>
                        </select>
                    </div>

                    <div className="control-group">
                        <label htmlFor="filter-select">Filter:</label>
                        <select
                            id="filter-select"
                            value={filterBy}
                            onChange={(e) => setFilterBy(e.target.value)}
                            className="control-select"
                        >
                            <option value="all">All ({totalCount})</option>
                            <option value="detected">Detected ({detectedCount})</option>
                            <option value="not-detected">Not Detected ({totalCount - detectedCount})</option>
                        </select>
                    </div>
                </div>
            </div>

            <div className="pathologies-container">
                {filteredPathologies.length > 0 ? (
                    <div className="pathologies-grid">
                        {filteredPathologies.map((pathology, index) => (
                            <div
                                key={index}
                                className={`pathology-card ${pathology.detected ? 'detected' : 'not-detected'} ${getSeverityLevel(pathology.probability)}`}
                            >
                                <div className="pathology-card-header">
                                    <div className="pathology-name">
                                        <h5>{pathology.name.replace('_', ' ')}</h5>
                                        <span className={`detection-status ${pathology.detected ? 'detected' : 'not-detected'}`}>
                                            {pathology.detected ? '✓ Detected' : '✗ Not Detected'}
                                        </span>
                                    </div>
                                    <div className="confidence-score">
                                        <div className="confidence-percentage">
                                            {(pathology.probability * 100).toFixed(1)}%
                                        </div>
                                        <div className="confidence-label">
                                            {getSeverityLabel(pathology.probability)}
                                        </div>
                                    </div>
                                </div>

                                <div className="confidence-bar">
                                    <div
                                        className={`confidence-fill ${getSeverityLevel(pathology.probability)}`}
                                        style={{ width: `${pathology.probability * 100}%` }}
                                    ></div>
                                </div>

                                <div className="pathology-description">
                                    <p>{getPathologyDescription(pathology.name)}</p>
                                </div>

                                {pathology.detected && (
                                    <div className="detection-warning">
                                        <div className="warning-icon">⚠️</div>
                                        <span>Requires medical review</span>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="no-pathologies">
                        <p>No pathologies match the current filter criteria.</p>
                    </div>
                )}
            </div>

            <div className="pathology-footer">
                <div className="disclaimer">
                    <h5>Important Disclaimer</h5>
                    <p>
                        <strong>This analysis is AI-assisted and for reference only.</strong>
                        All results should be interpreted and validated by a qualified radiologist
                        or healthcare professional. Do not make medical decisions based solely on
                        this automated analysis.
                    </p>
                </div>

                <div className="confidence-guide">
                    <h5>Confidence Level Guide</h5>
                    <div className="confidence-legend">
                        <div className="legend-item">
                            <div className="legend-bar high"></div>
                            <span>High (80%+): Strong indication</span>
                        </div>
                        <div className="legend-item">
                            <div className="legend-bar moderate"></div>
                            <span>Moderate (60-79%): Possible finding</span>
                        </div>
                        <div className="legend-item">
                            <div className="legend-bar low"></div>
                            <span>Low (40-59%): Weak indication</span>
                        </div>
                        <div className="legend-item">
                            <div className="legend-bar minimal"></div>
                            <span>Minimal (&lt;40%): Unlikely</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PathologyList;
