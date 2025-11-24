import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { API_URL } from '../config';
import { FaRegComment, FaRegHeart, FaHeart, FaTrash } from 'react-icons/fa';
import { formatDistanceToNow } from 'date-fns';
import './TweetCard.css';

function TweetCard({ tweet, currentUser, isDetail = false, onDelete, onLike, onUnlike }) {
    const [isLiked, setIsLiked] = useState(false);
    const navigate = useNavigate();

    const handleLike = async (e) => {
        e.stopPropagation();
        try {
            const token = localStorage.getItem('token');
            await axios.post(`${API_URL}/api/interactions/like`,
                { tweetId: tweet.id },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            if (isLiked) {
                setIsLiked(false);
                onUnlike?.(tweet.id);
            } else {
                setIsLiked(true);
                onLike?.(tweet.id);
            }
        } catch (error) {
            console.error('Error liking tweet:', error);
        }
    };

    const handleDelete = async (e) => {
        e.stopPropagation();
        if (!window.confirm('Delete this post?')) return;

        try {
            const token = localStorage.getItem('token');
            await axios.delete(`${API_URL}/api/tweets/tweet/${tweet.id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            onDelete?.(tweet.id);
        } catch (error) {
            console.error('Error deleting tweet:', error);
        }
    };

    const handleClick = () => {
        if (!isDetail) {
            navigate(`/tweet/${tweet.id}`);
        }
    };

    const handleProfileClick = (e) => {
        e.stopPropagation();
        navigate(`/profile/${tweet.author.id}`);
    };

    const timeAgo = formatDistanceToNow(new Date(tweet.createdAt), { addSuffix: true });

    return (
        <>
            {tweet.parentTweet && (
                <div className="parent-tweet-container">
                    <TweetCard
                        tweet={tweet.parentTweet}
                        currentUser={currentUser}
                        onDelete={onDelete}
                        onLike={onLike}
                        onUnlike={onUnlike}
                    />
                    <div className="reply-line"></div>
                </div>
            )}
            <div className={`tweet-card ${isDetail ? 'detail' : ''} ${tweet.parentTweet ? 'is-reply' : ''}`} onClick={handleClick}>
                <div className="tweet-avatar" onClick={handleProfileClick}>
                    {tweet.author?.profile?.avatarUrl ? (
                        <img src={tweet.author.profile.avatarUrl} alt={tweet.author.username} />
                    ) : (
                        tweet.author.username[0].toUpperCase()
                    )}
                </div>

                <div className="tweet-content">
                    {tweet.parentTweet && (
                        <div className="replying-to">
                            Replying to <span className="mention">@{tweet.parentTweet.author.username}</span>
                        </div>
                    )}
                    <div className="tweet-header">
                        <div className="tweet-author" onClick={handleProfileClick}>
                            <span className="author-name">{tweet.author.username}</span>
                            <span className="author-handle">@{tweet.author.username}</span>
                            <span className="tweet-time">· {timeAgo}</span>
                        </div>
                        {currentUser?.id === tweet.author.id && (
                            <button className="delete-btn" onClick={handleDelete}>
                                <FaTrash size={14} />
                            </button>
                        )}
                    </div>

                    <div className="tweet-text">{tweet.content}</div>

                    {tweet.images && tweet.images.length > 0 && (
                        <div className={`tweet-images grid-${Math.min(tweet.images.length, 4)}`}>
                            {tweet.images.map((image, idx) => (
                                <img key={idx} src={image.url} alt="" />
                            ))}
                        </div>
                    )}

                    <div className="tweet-actions">
                        <button className="action-btn" onClick={(e) => { e.stopPropagation(); navigate(`/tweet/${tweet.id}`); }}>
                            <FaRegComment size={18} />
                        </button>

                        <button className={`action-btn ${isLiked ? 'liked' : ''}`} onClick={handleLike}>
                            {isLiked ? <FaHeart size={18} /> : <FaRegHeart size={18} />}
                            {tweet._count?.likes > 0 && <span>{tweet._count.likes}</span>}
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
}

export default TweetCard;
