import { Link, useLocation } from 'react-router-dom';
import { useState } from 'react';
import { FaHome, FaUser } from 'react-icons/fa';
import EditProfileModal from '../modals/EditProfileModal.jsx';
import AccountSettingsModal from '../modals/AccountSettingsModal.jsx';
import './Sidebar.css';
import { useAuth } from '../../AuthProvider.jsx';
import { useLogout } from '../../hooks/useUserMutations.js';
import { useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';

export default function Sidebar() {
    const navigate = useNavigate();
    const { user } = useAuth();
    const queryClient = useQueryClient();
    const onUserUpdate = () => {
        queryClient.invalidateQueries(['user']);
    };
    const { mutateAsync: logout } = useLogout();
    const onLogout = async () => {
        await logout();
        navigate('/login');
    };
    const location = useLocation();
    const [showEditModal, setShowEditModal] = useState(false);
    const [showSettingsModal, setShowSettingsModal] = useState(false);

    return (
        <>
            <div className="sidebar">
                <div className="sidebar-content">
                    <Link to="/" className="logo">
                        <svg width="30" height="30" viewBox="0 0 30 30" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <text x="50%" y="50%" dominantBaseline="middle" textAnchor="middle" fill="#e7e9ea" fontSize="18" fontWeight="bold" fontFamily="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif">TC</text>
                        </svg>
                    </Link>                <nav className="nav-menu">
                        <Link to="/" className={`nav-item ${location.pathname === '/' ? 'active' : ''}`}>
                            <FaHome size={26} />
                            <span>Home</span>
                        </Link>

                        <Link to={`/profile/${user?.id}`} className={`nav-item ${location.pathname.includes('/profile') ? 'active' : ''}`}>
                            <FaUser size={24} />
                            <span>Profile</span>
                        </Link>
                        <Link to="/search/" className={`nav-item ${location.pathname.includes('/search') ? 'active' : ''}`}>
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M15.7955 15.8111L21 21M18 10.5C18 14.6421 14.6421 18 10.5 18C6.35786 18 3 14.6421 3 10.5C3 6.35786 6.35786 3 10.5 3C14.6421 3 18 6.35786 18 10.5Z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                            <span>Search</span>
                        </Link>
                    </nav>
                    <div className='bottomSettings'>
                        <button className="settings-btn" onClick={() => setShowSettingsModal(true)}>
                            <svg width="26px" height="26px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path fillRule="evenodd" clipRule="evenodd" d="M12.7848 0.449982C13.8239 0.449982 14.7167 1.16546 14.9122 2.15495L14.9991 2.59495C15.3408 4.32442 17.1859 5.35722 18.9016 4.7794L19.3383 4.63233C20.3199 4.30175 21.4054 4.69358 21.9249 5.56605L22.7097 6.88386C23.2293 7.75636 23.0365 8.86366 22.2504 9.52253L21.9008 9.81555C20.5267 10.9672 20.5267 13.0328 21.9008 14.1844L22.2504 14.4774C23.0365 15.1363 23.2293 16.2436 22.7097 17.1161L21.925 18.4339C21.4054 19.3064 20.3199 19.6982 19.3382 19.3676L18.9017 19.2205C17.1859 18.6426 15.3408 19.6754 14.9991 21.405L14.9122 21.845C14.7167 22.8345 13.8239 23.55 12.7848 23.55H11.2152C10.1761 23.55 9.28331 22.8345 9.08781 21.8451L9.00082 21.4048C8.65909 19.6754 6.81395 18.6426 5.09822 19.2205L4.66179 19.3675C3.68016 19.6982 2.59465 19.3063 2.07505 18.4338L1.2903 17.1161C0.770719 16.2436 0.963446 15.1363 1.74956 14.4774L2.09922 14.1844C3.47324 13.0327 3.47324 10.9672 2.09922 9.8156L1.74956 9.52254C0.963446 8.86366 0.77072 7.75638 1.2903 6.8839L2.07508 5.56608C2.59466 4.69359 3.68014 4.30176 4.66176 4.63236L5.09831 4.77939C6.81401 5.35722 8.65909 4.32449 9.00082 2.59506L9.0878 2.15487C9.28331 1.16542 10.176 0.449982 11.2152 0.449982H12.7848ZM12 15.3C13.8225 15.3 15.3 13.8225 15.3 12C15.3 10.1774 13.8225 8.69998 12 8.69998C10.1774 8.69998 8.69997 10.1774 8.69997 12C8.69997 13.8225 10.1774 15.3 12 15.3Z" fill="white" />
                            </svg>
                            <span>Settings</span>
                        </button>

                        <button className="logout-btn" onClick={onLogout}>
                            <svg width="26px" height="26px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path fillRule="evenodd" clipRule="evenodd" d="M16.125 12C16.125 11.5858 15.7892 11.25 15.375 11.25L4.40244 11.25L6.36309 9.56944C6.67759 9.29988 6.71401 8.8264 6.44444 8.51191C6.17488 8.19741 5.7014 8.16099 5.38691 8.43056L1.88691 11.4306C1.72067 11.573 1.625 11.7811 1.625 12C1.625 12.2189 1.72067 12.427 1.88691 12.5694L5.38691 15.5694C5.7014 15.839 6.17488 15.8026 6.44444 15.4881C6.71401 15.1736 6.67759 14.7001 6.36309 14.4306L4.40244 12.75L15.375 12.75C15.7892 12.75 16.125 12.4142 16.125 12Z" fill="white" />
                                <path d="M9.375 8C9.375 8.70219 9.375 9.05329 9.54351 9.3055C9.61648 9.41471 9.71025 9.50848 9.81946 9.58145C10.0717 9.74996 10.4228 9.74996 11.125 9.74996L15.375 9.74996C16.6176 9.74996 17.625 10.7573 17.625 12C17.625 13.2426 16.6176 14.25 15.375 14.25L11.125 14.25C10.4228 14.25 10.0716 14.25 9.8194 14.4185C9.71023 14.4915 9.6165 14.5852 9.54355 14.6944C9.375 14.9466 9.375 15.2977 9.375 16C9.375 18.8284 9.375 20.2426 10.2537 21.1213C11.1324 22 12.5464 22 15.3748 22L16.3748 22C19.2032 22 20.6174 22 21.4961 21.1213C22.3748 20.2426 22.3748 18.8284 22.3748 16L22.3748 8C22.3748 5.17158 22.3748 3.75736 21.4961 2.87868C20.6174 2 19.2032 2 16.3748 2L15.3748 2C12.5464 2 11.1324 2 10.2537 2.87868C9.375 3.75736 9.375 5.17157 9.375 8Z" fill="white" />
                            </svg>
                            <span>Logout</span>
                        </button>
                    </div>

                    <div className="user-info" onClick={() => setShowEditModal(true)}>
                        <div className="user-avatar" style={{ background: `${user.profile.avatarUrl ? "black" : "linear-gradient(135deg, #1d9bf0, #0c7abf)"}` }}>
                            {user?.profile?.avatarUrl ? (
                                <img src={user.profile.avatarUrl} alt={user.username} />
                            ) : (
                                user?.username?.[0]?.toUpperCase() || 'U'
                            )}
                        </div>
                        <div className="user-details">
                            <div className="username">{user?.username}</div>
                            <div className="user-bio">{user?.profile?.bio || 'No bio yet'}</div>
                        </div>
                    </div>
                </div>
            </div>

            {showEditModal && (
                <EditProfileModal
                    user={user}
                    onClose={() => setShowEditModal(false)}
                    onUpdate={onUserUpdate}
                />
            )}

            {showSettingsModal && (
                <AccountSettingsModal
                    user={user}
                    onClose={() => setShowSettingsModal(false)}
                    onUpdate={onUserUpdate}
                />
            )}
        </>
    );
}

