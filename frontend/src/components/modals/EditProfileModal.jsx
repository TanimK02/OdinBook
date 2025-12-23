import { useState, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { FaTimes, FaCamera } from 'react-icons/fa';
import './EditProfileModal.css';
import { useUpdateProfile } from '../../hooks/useUserMutations.js';
import { userAPI } from '../../api.js';
import toast from 'react-hot-toast';

function EditProfileModal({ user, onClose, onUpdate }) {
    const [bio, setBio] = useState('');
    const [avatarFile, setAvatarFile] = useState(null);
    const [avatarPreview, setAvatarPreview] = useState(null);
    const fileInputRef = useRef();

    const updateProfileMutation = useUpdateProfile();

    const { isLoading: loadingProfile } = useQuery({
        queryKey: ['profile'],
        queryFn: userAPI.getProfile,
        onSuccess: (data) => {
            setBio(data.bio || '');
            if (data.avatarUrl) {
                setAvatarPreview(data.avatarUrl);
            }
        },
        onError: () => {
            console.log('No profile yet');
        },
        retry: false
    });

    const handleAvatarSelect = (e) => {
        const file = e.target.files[0];
        if (file) {
            setAvatarFile(file);
            setAvatarPreview(URL.createObjectURL(file));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        toast.promise(
            updateProfileMutation.mutateAsync({ bio, avatarFile }),
            {
                loading: 'Updating profile...',
                success: () => {
                    onUpdate();
                    onClose();
                    console.log('Profile updated successfully');
                    return 'Profile updated';
                },
                error: (err) => {
                    console.log(err.response?.data?.error || 'Failed to update profile');
                    return 'Failed to update profile';
                },
            },
            {
                style: {
                    background: 'black',
                    color: '#fff',
                    border: '1px solid #2f3336',
                },
            }
        );
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

                <form onSubmit={handleSubmit}>
                    <div className="avatar-upload-section">
                        <div className="avatar-preview" onClick={() => fileInputRef.current?.click()} style={{ background: `${user?.profile?.avatarUrl || avatarPreview ? "black" : "linear-gradient(135deg, #1d9bf0, #0c7abf);"}` }} >
                            {avatarPreview || user?.profile?.avatarUrl ? (
                                <img src={avatarPreview || user?.profile?.avatarUrl} alt="Avatar" />
                            ) : (
                                <div className="avatar-placeholder" style={{ background: `${user?.profile?.avatarUrl ? "black" : "linear-gradient(135deg, #1d9bf0, #0c7abf);"}` }}>
                                    {user.username[0].toUpperCase()}

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
                        <button type="submit" className="save-btn" disabled={updateProfileMutation.isLoading}>
                            {updateProfileMutation.isLoading ? 'Saving...' : 'Save'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default EditProfileModal;
