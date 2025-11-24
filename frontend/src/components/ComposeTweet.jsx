import { useState, useRef } from 'react';
import axios from 'axios';
import { API_URL } from '../config';
import { FaImage, FaTimes } from 'react-icons/fa';
import './ComposeTweet.css';

function ComposeTweet({ user, onTweetCreated, parentTweetId = null, placeholder = "What's happening?" }) {
    const [content, setContent] = useState('');
    const [images, setImages] = useState([]);
    const [previews, setPreviews] = useState([]);
    const [loading, setLoading] = useState(false);
    const fileInputRef = useRef();

    const handleImageSelect = (e) => {
        const files = Array.from(e.target.files);
        if (images.length + files.length > 4) {
            alert('Maximum 4 images allowed');
            return;
        }

        setImages(prev => [...prev, ...files]);

        const newPreviews = files.map(file => URL.createObjectURL(file));
        setPreviews(prev => [...prev, ...newPreviews]);
    };

    const removeImage = (index) => {
        URL.revokeObjectURL(previews[index]);
        setImages(prev => prev.filter((_, i) => i !== index));
        setPreviews(prev => prev.filter((_, i) => i !== index));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!content.trim() && images.length === 0) return;

        setLoading(true);
        try {
            const formData = new FormData();
            formData.append('content', content);
            if (parentTweetId) {
                formData.append('parentTweetId', parentTweetId);
            }
            images.forEach(image => {
                formData.append('tweetPics', image);
            });

            const token = localStorage.getItem('token');
            const response = await axios.post(`${API_URL}/api/tweets/tweet`, formData, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data'
                }
            });

            onTweetCreated(response.data.tweet);
            setContent('');
            setImages([]);
            previews.forEach(preview => URL.revokeObjectURL(preview));
            setPreviews([]);
        } catch (error) {
            console.error('Error creating tweet:', error);
            alert(error.response?.data?.error || 'Failed to post');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="compose-tweet">
            <div className="compose-avatar">
                {user?.profile?.avatarUrl ? (
                    <img src={user.profile.avatarUrl} alt={user.username} />
                ) : (
                    user?.username?.[0]?.toUpperCase() || 'U'
                )}
            </div>

            <form onSubmit={handleSubmit} className="compose-form">
                <textarea
                    placeholder={placeholder}
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    maxLength={280}
                    rows={3}
                />

                {previews.length > 0 && (
                    <div className={`image-previews grid-${Math.min(previews.length, 4)}`}>
                        {previews.map((preview, index) => (
                            <div key={index} className="image-preview">
                                <img src={preview} alt="" />
                                <button
                                    type="button"
                                    className="remove-image"
                                    onClick={() => removeImage(index)}
                                >
                                    <FaTimes />
                                </button>
                            </div>
                        ))}
                    </div>
                )}

                <div className="compose-actions">
                    <button
                        type="button"
                        className="media-btn"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={images.length >= 4}
                    >
                        <FaImage size={20} />
                    </button>
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={handleImageSelect}
                        style={{ display: 'none' }}
                    />

                    <div className="compose-right">
                        {content.length > 0 && (
                            <span className={`char-count ${content.length > 260 ? 'warning' : ''}`}>
                                {280 - content.length}
                            </span>
                        )}
                        <button
                            type="submit"
                            className="post-btn"
                            disabled={loading || (!content.trim() && images.length === 0)}
                        >
                            {loading ? 'Posting...' : 'Post'}
                        </button>
                    </div>
                </div>
            </form>
        </div>
    );
}

export default ComposeTweet;
