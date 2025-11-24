import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { API_URL } from '../config';
import { FaTimes, FaCamera } from 'react-icons/fa';
import './EditProfileModal.css';

function EditProfileModal({ user, onClose, onUpdate }) {
    const [bio, setBio] = useState('');
    const [avatarFile, setAvatarFile] = useState(null);
    const [avatarPreview, setAvatarPreview] = useState(null);
    const [loading, setLoading] = useState(false);
    const [loadingProfile, setLoadingProfile] = useState(true);
    const [error, setError] = useState('');
    const fileInputRef = useRef();

    useEffect(() => {
        loadProfile();
    }, []);

    const loadProfile = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`${API_URL}/api/users/profile`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setBio(response.data.profile.bio || '');
            if (response.data.profile.avatarUrl) {
                setAvatarPreview(response.data.profile.avatarUrl);
            }
        } catch (error) {
            // Profile doesn't exist yet, that's okay
            console.log('No profile yet');
        } finally {
            setLoadingProfile(false);
        }
    };

    const handleAvatarSelect = (e) => {
        const file = e.target.files[0];
        if (file) {
            setAvatarFile(file);
            setAvatarPreview(URL.createObjectURL(file));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const token = localStorage.getItem('token');
            const formData = new FormData();
            formData.append('bio', bio);
            if (avatarFile) {
                formData.append('avatar', avatarFile);
            }

            await axios.post(`${API_URL}/api/users/profile`,
                formData,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'multipart/form-data'
                    }
                }
            );

            onUpdate({ ...user });
            onClose();
        } catch (error) {
            setError(error.response?.data?.error || 'Failed to update profile');
        } finally {
            setLoading(false);
        }
    };

    if (loadingProfile) {
        return (
            <div className="modal-overlay" onClick={onClose}>
                <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                    <div className="modal-header">
                        <h2>Edit Profile</h2>
                        <button className="close-btn" onClick={onClose}>
                            <FaTimes size={20} />
                        </button>
                    </div>
                    <div style={{ padding: '20px', textAlign: 'center', color: '#71767b' }}>
                        Loading...
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>Edit Profile</h2>
                    <button className="close-btn" onClick={onClose}>
                        <FaTimes size={20} />
                    </button>
                </div>

                {error && <div className="error-message">{error}</div>}

                <form onSubmit={handleSubmit}>
                    <div className="avatar-upload-section">
                        <div className="avatar-preview" onClick={() => fileInputRef.current?.click()}>
                            {avatarPreview ? (
                                <img src={avatarPreview} alt="Avatar" />
                            ) : (
                                <div className="avatar-placeholder">
                                    {user?.username?.[0]?.toUpperCase() || 'U'}
                                </div>
                            )}
                            <div className="avatar-overlay">
                                <FaCamera size={24} />
                            </div>
                        </div>
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            onChange={handleAvatarSelect}
                            style={{ display: 'none' }}
                        />
                    </div>

                    <div className="form-group">
                        <label>Bio</label>
                        <textarea
                            value={bio}
                            onChange={(e) => setBio(e.target.value)}
                            placeholder="Tell us about yourself"
                            maxLength={160}
                            rows={3}
                        />
                        <span className="char-count">{bio.length}/160</span>
                    </div>

                    <div className="modal-actions">
                        <button type="button" className="cancel-btn" onClick={onClose}>
                            Cancel
                        </button>
                        <button type="submit" className="save-btn" disabled={loading}>
                            {loading ? 'Saving...' : 'Save'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default EditProfileModal;
