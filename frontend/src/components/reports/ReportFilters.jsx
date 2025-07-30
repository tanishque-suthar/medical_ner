import React from 'react';
import './ReportFilters.css';

const ReportFilters = ({ filters, onFilterChange, totalReports, filteredCount }) => {
  const handleInputChange = (field, value) => {
    onFilterChange({ [field]: value });
  };

  const clearFilters = () => {
    onFilterChange({
      searchTerm: '',
      patientName: '',
      reportType: '',
      dateRange: 'all',
      startDate: '',
      endDate: ''
    });
  };

  const hasActiveFilters = () => {
    return filters.searchTerm || 
           filters.patientName || 
           filters.reportType || 
           filters.dateRange !== 'all' ||
           filters.startDate || 
           filters.endDate;
  };

  return (
    <div className="report-filters">
      <div className="filters-container">
        <div className="filter-row">
          {/* Search Term */}
          <div className="filter-group">
            <label htmlFor="searchTerm">Search</label>
            <input
              id="searchTerm"
              type="text"
              placeholder="Search reports or patients..."
              value={filters.searchTerm}
              onChange={(e) => handleInputChange('searchTerm', e.target.value)}
              className="filter-input"
            />
          </div>

          {/* Patient Name */}
          <div className="filter-group">
            <label htmlFor="patientName">Patient</label>
            <input
              id="patientName"
              type="text"
              placeholder="Filter by patient name..."
              value={filters.patientName}
              onChange={(e) => handleInputChange('patientName', e.target.value)}
              className="filter-input"
            />
          </div>

          {/* Report Type */}
          <div className="filter-group">
            <label htmlFor="reportType">Type</label>
            <select
              id="reportType"
              value={filters.reportType}
              onChange={(e) => handleInputChange('reportType', e.target.value)}
              className="filter-select"
            >
              <option value="">All Types</option>
              <option value="PDF_NER">Medical Report (PDF NER)</option>
              <option value="XRAY_ANALYSIS">X-Ray Analysis</option>
              <option value="XRAY_COMPARISON">X-Ray Comparison</option>
            </select>
          </div>
        </div>

        {/* Filter Actions */}
        <div className="filter-actions">
          <div className="results-count">
            Showing {filteredCount} of {totalReports} reports
          </div>
          {hasActiveFilters() && (
            <button 
              onClick={clearFilters}
              className="btn btn-secondary btn-sm clear-filters"
            >
              Clear Filters
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ReportFilters;
