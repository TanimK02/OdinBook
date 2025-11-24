import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { API_URL } from '../config';
import './Auth.css';

function Login({ onLogin }) {
    const [identifier, setIdentifier] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const response = await axios.post(`${API_URL}/api/users/login`, {
                identifier,
                password
            });

            const { token, userId } = response.data;

            const userResponse = await axios.get(`${API_URL}/api/users/userinfo`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            onLogin(token, userResponse.data.user);
            navigate('/');
        } catch (error) {
            setError(error.response?.data?.error || 'Login failed');
        } finally {
            setLoading(false);
        }
    };

    const handleGuestLogin = async () => {
        setError('');
        setLoading(true);

        try {
            const response = await axios.post(`${API_URL}/api/users/login`, {
                identifier: 'guest',
                password: 'password123'
            });

            const { token, userId } = response.data;

            const userResponse = await axios.get(`${API_URL}/api/users/userinfo`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            onLogin(token, userResponse.data.user);
            navigate('/');
        } catch (error) {
            setError(error.response?.data?.error || 'Guest login failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-container">
            <div className="auth-box">
                <div className="auth-logo">
                    <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <text x="50%" y="50%" dominantBaseline="middle" textAnchor="middle" fill="#1d9bf0" fontSize="24" fontWeight="bold" fontFamily="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif">TC</text>
                    </svg>
                </div>
                <h1>Sign in to TC</h1>                {error && <div className="error-message">{error}</div>}

                <form onSubmit={handleSubmit}>
                    <input
                        type="text"
                        placeholder="Username or Email"
                        value={identifier}
                        onChange={(e) => setIdentifier(e.target.value)}
                        required
                    />
                    <input
                        type="password"
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                    <button type="submit" disabled={loading}>
                        {loading ? 'Signing in...' : 'Sign in'}
                    </button>
                </form>

                <button
                    className="guest-btn"
                    onClick={handleGuestLogin}
                    disabled={loading}
                >
                    {loading ? 'Signing in...' : 'Continue as Guest'}
                </button>

                <div className="auth-link">
                    Don't have an account? <Link to="/register">Sign up</Link>
                </div>
            </div>
        </div>
    );
}

export default Login;
