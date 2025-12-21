import { useState } from 'react';
import { FaTimes } from 'react-icons/fa';
import './EditProfileModal.css';
import { useUpdateUsername, useUpdateEmail, useChangePassword } from '../hooks/useUserMutations';
import toast from 'react-hot-toast';

function AccountSettingsModal({ user, onClose, onUpdate }) {
    const [activeTab, setActiveTab] = useState('username');
    const [newUsername, setNewUsername] = useState('');
    const [newEmail, setNewEmail] = useState('');
    const [oldPassword, setOldPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    const updateUsernameMutation = useUpdateUsername();
    const updateEmailMutation = useUpdateEmail();
    const changePasswordMutation = useChangePassword();

    const handleUsernameUpdate = async (e) => {
        e.preventDefault();

        if (newUsername.length < 3) {
            const errorMsg = 'Username must be at least 3 characters';
            toast.error(errorMsg, { style: { background: 'black', color: '#fff', borderColor: '#2f3336', borderWidth: '1px', borderStyle: 'solid' } });
            return;
        }

        try {
            await updateUsernameMutation.mutateAsync({ newUsername });
            const successMsg = 'Username updated successfully!';
            toast.success(successMsg, { style: { background: 'black', color: '#fff', borderColor: '#2f3336', borderWidth: '1px', borderStyle: 'solid' } });
            setNewUsername('');
            onUpdate({ ...user, username: newUsername });
        } catch (error) {
            const errorMsg = error.response?.data?.error || 'Failed to update username';
            toast.error(errorMsg, { style: { background: 'black', color: '#fff', borderColor: '#2f3336', borderWidth: '1px', borderStyle: 'solid' } });
        }
    };

    const handleEmailUpdate = async (e) => {
        e.preventDefault();

        try {
            await updateEmailMutation.mutateAsync({ newEmail });
            const successMsg = 'Email updated successfully!';
            toast.success(successMsg, { style: { background: 'black', color: '#fff', borderColor: '#2f3336', borderWidth: '1px', borderStyle: 'solid' } });
            setNewEmail('');
            onUpdate({ ...user, email: newEmail });
        } catch (error) {
            const errorMsg = error.response?.data?.error || 'Failed to update email';
            toast.error(errorMsg, { style: { background: 'black', color: '#fff', borderColor: '#2f3336', borderWidth: '1px', borderStyle: 'solid' } });
        }
    };

    const handlePasswordUpdate = async (e) => {
        e.preventDefault();

        if (newPassword !== confirmPassword) {
            const errorMsg = 'Passwords do not match';
            toast.error(errorMsg, { style: { background: 'black', color: '#fff', borderColor: '#2f3336', borderWidth: '1px', borderStyle: 'solid' } });
            return;
        }

        if (newPassword.length < 6) {
            const errorMsg = 'Password must be at least 6 characters';
            toast.error(errorMsg, { style: { background: 'black', color: '#fff', borderColor: '#2f3336', borderWidth: '1px', borderStyle: 'solid' } });
            return;
        }

        try {
            await changePasswordMutation.mutateAsync({ oldPassword, newPassword });
            const successMsg = 'Password changed successfully!';
            toast.success(successMsg, { style: { background: 'black', color: '#fff', borderColor: '#2f3336', borderWidth: '1px', borderStyle: 'solid' } });
            setOldPassword('');
            setNewPassword('');
            setConfirmPassword('');
        } catch (error) {
            const errorMsg = error.response?.data?.error || 'Failed to change password';
            toast.error(errorMsg, { style: { background: 'black', color: '#fff', borderColor: '#2f3336', borderWidth: '1px', borderStyle: 'solid' } });
        }
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>Account Settings</h2>
                    <button className="close-btn" onClick={onClose}>
                        <FaTimes size={20} />
                    </button>
                </div>

                <div className="settings-tabs">
                    <button
                        className={`tab-btn ${activeTab === 'username' ? 'active' : ''}`}
                        onClick={() => setActiveTab('username')}
                    >
                        Username
                    </button>
                    <button
                        className={`tab-btn ${activeTab === 'email' ? 'active' : ''}`}
                        onClick={() => setActiveTab('email')}
                    >
                        Email
                    </button>
                    <button
                        className={`tab-btn ${activeTab === 'password' ? 'active' : ''}`}
                        onClick={() => setActiveTab('password')}
                    >
                        Password
                    </button>
                </div>

                <div className="settings-content">
                    {activeTab === 'username' && (
                        <form onSubmit={handleUsernameUpdate}>
                            <div className="form-group">
                                <label>Current Username</label>
                                <input type="text" value={user?.username || ''} disabled />
                            </div>
                            <div className="form-group">
                                <label>New Username</label>
                                <input
                                    type="text"
                                    value={newUsername}
                                    onChange={(e) => setNewUsername(e.target.value)}
                                    placeholder="Enter new username"
                                    minLength={3}
                                    required
                                />
                            </div>
                            <div className="modal-actions">
                                <button type="submit" className="save-btn" disabled={updateUsernameMutation.isLoading}>
                                    {updateUsernameMutation.isLoading ? 'Updating...' : 'Update Username'}
                                </button>
                            </div>
                        </form>
                    )}

                    {activeTab === 'email' && (
                        <form onSubmit={handleEmailUpdate}>
                            <div className="form-group">
                                <label>Current Email</label>
                                <input type="email" value={user?.email || ''} disabled />
                            </div>
                            <div className="form-group">
                                <label>New Email</label>
                                <input
                                    type="email"
                                    value={newEmail}
                                    onChange={(e) => setNewEmail(e.target.value)}
                                    placeholder="Enter new email"
                                    required
                                />
                            </div>
                            <div className="modal-actions">
                                <button type="submit" className="save-btn" disabled={updateEmailMutation.isLoading}>
                                    {updateEmailMutation.isLoading ? 'Updating...' : 'Update Email'}
                                </button>
                            </div>
                        </form>
                    )}

                    {activeTab === 'password' && (
                        <form onSubmit={handlePasswordUpdate}>
                            <div className="form-group">
                                <label>Old Password</label>
                                <input
                                    type="password"
                                    value={oldPassword}
                                    onChange={(e) => setOldPassword(e.target.value)}
                                    placeholder="Enter old password"
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label>New Password</label>
                                <input
                                    type="password"
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    placeholder="Enter new password"
                                    minLength={6}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label>Confirm New Password</label>
                                <input
                                    type="password"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    placeholder="Confirm new password"
                                    minLength={6}
                                    required
                                />
                            </div>
                            <div className="modal-actions">
                                <button type="submit" className="save-btn" disabled={changePasswordMutation.isLoading}>
                                    {changePasswordMutation.isLoading ? 'Changing...' : 'Change Password'}
                                </button>
                            </div>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
}

export default AccountSettingsModal;
