import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import LoginPage from './components/auth/LoginPage';
import Dashboard from './components/DashboardNew';
import PatientsPage from './components/patients/PatientsPage';
import ProtectedRoute from './components/auth/ProtectedRoute';
import Header from './components/common/Header';
import './App.css';

function AppContent() {
  const { isAuthenticated } = useAuth();
  const [currentPage, setCurrentPage] = useState('dashboard');

  const handleNavigate = (page) => {
    setCurrentPage(page);
  };

  if (!isAuthenticated) {
    return <LoginPage />;
  }

  const renderCurrentPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <Dashboard onNavigate={handleNavigate} />;
      case 'patients':
        return <PatientsPage />;
      case 'reports':
        return <div style={{ padding: '2rem', textAlign: 'center' }}>
          <h2>Reports Page</h2>
          <p>Coming soon...</p>
        </div>;
      case 'xray':
        return <div style={{ padding: '2rem', textAlign: 'center' }}>
          <h2>X-Ray Analysis Page</h2>
          <p>Coming soon...</p>
        </div>;
      default:
        return <Dashboard onNavigate={handleNavigate} />;
    }
  };

  return (
    <div className="app-layout">
      <Header currentPage={currentPage} onNavigate={handleNavigate} />
      <main className="main-content">
        {renderCurrentPage()}
      </main>
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <div className="App">
        <AppContent />
      </div>
    </AuthProvider>
  );
}

export default App;
