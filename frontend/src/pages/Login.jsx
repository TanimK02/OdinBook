import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Auth.css';
import { useLogin } from '../hooks/useUserMutations.js';
import toast from 'react-hot-toast';
function Login() {
    const [identifier, setIdentifier] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();
    const { mutateAsync: login, isLoading: loading } = useLogin();
    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await login({ identifier, password });
            navigate('/');
        } catch (error) {
            toast.error(error.response?.data?.error || 'Login failed', { style: { background: 'black', color: '#fff', borderColor: '#2f3336', borderWidth: '1px', borderStyle: 'solid' } });
        }
    };

    const handleGuestLogin = async () => {
        try {
            await login({ identifier: 'guest', password: 'password123' });
            navigate('/');
        } catch (error) {
            toast.error(error.response?.data?.error || 'Guest login failed', { style: { background: 'black', color: '#fff', borderColor: '#2f3336', borderWidth: '1px', borderStyle: 'solid' } });
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
                <h1>Sign in to TC</h1>

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
