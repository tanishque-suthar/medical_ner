import React, { useState, useEffect } from 'react';
import axios from 'axios';
import ReportsList from './ReportsList';
import ReportFilters from './ReportFilters';
import ReportDetails from './ReportDetails';
import './ReportsPage.css';

const ReportsPage = () => {
  const [reports, setReports] = useState([]);
  const [filteredReports, setFilteredReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedReport, setSelectedReport] = useState(null);
  const [showReportDetails, setShowReportDetails] = useState(false);
  const [filters, setFilters] = useState({
    searchTerm: '',
    patientName: '',
    reportType: '',
    dateRange: 'all',
    startDate: '',
    endDate: ''
  });

  useEffect(() => {
    fetchAllReports();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [reports, filters]);

  const fetchAllReports = async () => {
    try {
      setLoading(true);
      setError('');
      
      // Get all patients with their reports using the correct endpoint
      const patientsResponse = await axios.get('/api/patients/get-all-patients');
      const patients = patientsResponse.data;
      
      // Flatten all reports with patient information
      const allReports = [];
      patients.forEach(patient => {
        if (patient.reports && patient.reports.length > 0) {
          patient.reports.forEach(report => {
            allReports.push({
              ...report,
              patient_name: patient.name,
              patient_id: patient.id,
              patient_age: patient.age,
              patient_gender: patient.gender
            });
          });
        }
      });

      // Sort by report ID (newest first, assuming higher ID = newer)
      allReports.sort((a, b) => b.id - a.id);
      
      setReports(allReports);
    } catch (error) {
      console.error('Failed to fetch reports:', error);
      setError('Failed to load reports. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...reports];

    // Search term filter (filename or patient name)
    if (filters.searchTerm) {
      const searchLower = filters.searchTerm.toLowerCase();
      filtered = filtered.filter(report => 
        report.filename.toLowerCase().includes(searchLower) ||
        report.patient_name.toLowerCase().includes(searchLower)
      );
    }

    // Patient name filter
    if (filters.patientName) {
      const patientLower = filters.patientName.toLowerCase();
      filtered = filtered.filter(report => 
        report.patient_name.toLowerCase().includes(patientLower)
      );
    }

    // Report type filter
    if (filters.reportType) {
      filtered = filtered.filter(report => report.report_type === filters.reportType);
    }

    // Date range filter - Skip for now since reports don't have timestamps
    // TODO: Add created_at field to Report model in backend
    if (filters.dateRange !== 'all') {
      console.warn('Date filtering not implemented - reports lack timestamp field');
    }

    setFilteredReports(filtered);
  };

  const handleFilterChange = (newFilters) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  };

  const handleViewReport = (report) => {
    setSelectedReport(report);
    setShowReportDetails(true);
  };

  const handleCloseReport = () => {
    setShowReportDetails(false);
    setSelectedReport(null);
  };

  const getReportStats = () => {
    const stats = {
      total: reports.length,
      today: 0, // Not available without timestamps
      thisWeek: 0, // Not available without timestamps  
      thisMonth: 0, // Not available without timestamps
      medicalReports: 0,
      xrayReports: 0
    };

    reports.forEach(report => {
      if (report.report_type === 'PDF_NER') stats.medicalReports++;
      if (report.report_type === 'XRAY_ANALYSIS' || report.report_type === 'XRAY_COMPARISON') stats.xrayReports++;
    });

    return stats;
  };

  const stats = getReportStats();

  return (
    <div className="reports-page">
      <div className="reports-header">
        <div className="reports-title">
          <h2>Medical Reports</h2>
          <p>View and analyze all patient reports</p>
        </div>
        
        {/* Quick Stats */}
        <div className="reports-stats">
          <div className="stat-card">
            <span className="stat-number">{stats.total}</span>
            <span className="stat-label">Total Reports</span>
          </div>
          <div className="stat-card">
            <span className="stat-number">{stats.medicalReports}</span>
            <span className="stat-label">Medical Reports</span>
          </div>
          <div className="stat-card">
            <span className="stat-number">{stats.xrayReports}</span>
            <span className="stat-label">X-Ray Reports</span>
          </div>
        </div>
      </div>

      {/* Filters */}
      <ReportFilters 
        filters={filters}
        onFilterChange={handleFilterChange}
        totalReports={reports.length}
        filteredCount={filteredReports.length}
      />

      {/* Main Content */}
      {loading ? (
        <div className="reports-loading">
          <div className="loading-spinner"></div>
          <p>Loading reports...</p>
        </div>
      ) : error ? (
        <div className="reports-error">
          <p>{error}</p>
          <button onClick={fetchAllReports} className="btn btn-primary">
            Try Again
          </button>
        </div>
      ) : (
        <ReportsList 
          reports={filteredReports}
          onViewReport={handleViewReport}
          loading={loading}
        />
      )}

      {/* Report Details Modal */}
      {showReportDetails && selectedReport && (
        <ReportDetails
          report={selectedReport}
          onClose={handleCloseReport}
        />
      )}
    </div>
  );
};

export default ReportsPage;
