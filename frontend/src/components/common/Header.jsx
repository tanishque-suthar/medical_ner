import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import './Header.css';

const Header = ({ currentPage, onNavigate }) => {
    const { user, logout } = useAuth();

    const handleLogout = () => {
        logout();
    };

    const navItems = [
        { key: 'dashboard', label: 'Dashboard' },
        { key: 'patients', label: 'Patients' },
        { key: 'reports', label: 'Reports' },
        { key: 'xray', label: 'X-Ray Analysis' }
    ];

    return (
        <header className="app-header">
            <div className="header-container">
                <div className="header-left">
                    <h1 className="app-title">Medical Analyzer</h1>
                    <nav className="main-nav">
                        {navItems.map(item => (
                            <button
                                key={item.key}
                                className={`nav-button ${currentPage === item.key ? 'active' : ''}`}
                                onClick={() => onNavigate(item.key)}
                            >
                                {item.label}
                            </button>
                        ))}
                    </nav>
                </div>

                <div className="header-right">
                    <div className="user-info">
                        <span className="user-role">{user?.role}</span>
                    </div>

                    <button onClick={handleLogout} className="logout-button">
                        Logout
                    </button>
                </div>
            </div>
        </header>
    );
};

export default Header;
