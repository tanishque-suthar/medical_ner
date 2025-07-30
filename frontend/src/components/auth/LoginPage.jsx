import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import './LoginPage.css';

const LoginPage = () => {
    const [credentials, setCredentials] = useState({
        username: '',
        password: ''
    });
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const { login } = useAuth();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        const result = await login(credentials.username, credentials.password);

        if (!result.success) {
            setError(result.error);
        }
        setIsLoading(false);
    };

    const handleInputChange = (e) => {
        setCredentials({
            ...credentials,
            [e.target.name]: e.target.value
        });
    };

    return (
        <div className="login-page">
            <div className="login-container">
                {/* Header */}
                <div className="login-header">
                    <h2>Medical Analyzer</h2>
                    <p>Hospital Staff Access Portal</p>
                </div>

                {/* Login Form */}
                <div className="login-form-container">
                    <form className="login-form" onSubmit={handleSubmit}>
                        {error && (
                            <div className="error-message">
                                {error}
                            </div>
                        )}

                        <div className="form-group">
                            <label htmlFor="username" className="form-label">
                                Username
                            </label>
                            <input
                                id="username"
                                name="username"
                                type="text"
                                required
                                value={credentials.username}
                                onChange={handleInputChange}
                                className="form-input"
                                placeholder="Enter your username"
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="password" className="form-label">
                                Password
                            </label>
                            <input
                                id="password"
                                name="password"
                                type="password"
                                required
                                value={credentials.password}
                                onChange={handleInputChange}
                                className="form-input"
                                placeholder="Enter your password"
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="btn btn-primary login-button"
                        >
                            {isLoading ? (
                                <div className="loading-spinner"></div>
                            ) : (
                                'Sign In'
                            )}
                        </button>
                    </form>

                    <div className="login-footer">
                        <p>Authorized hospital staff only</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;
