import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaRegComment, FaRegHeart, FaHeart, FaTrash } from 'react-icons/fa';
import { formatDistanceToNow } from 'date-fns';
import './TweetCard.css';
import { useAuth } from '../AuthProvider.jsx';
import { useToggleLike, useDeleteTweet } from '../hooks/useTweetMutations.js';
import toast from 'react-hot-toast';
function TweetCard({ tweet, isDetail = false, likedByCurrentUser = false }) {
    const { user: currentUser } = useAuth();
    const [isLiked, setIsLiked] = useState(likedByCurrentUser);
    const navigate = useNavigate();
    const toggleLikeMutation = useToggleLike();
    const deleteTweetMutation = useDeleteTweet();

    const handleLike = async (e) => {
        e.stopPropagation();
        try {
            await toggleLikeMutation.mutateAsync(tweet.id);
            setIsLiked(!isLiked);
        } catch (error) {
            console.error('Error liking tweet:', error);
            toast.error(error.response?.data?.error || 'Failed to like post', { style: { background: 'black', color: '#fff', borderColor: '#2f3336', borderWidth: '1px', borderStyle: 'solid' } });
        }
    };

    const handleDelete = async (e) => {
        e.stopPropagation();
        if (!window.confirm('Delete this post?')) return;

        try {
            await deleteTweetMutation.mutateAsync(tweet.id);
        } catch (error) {
            console.error('Error deleting tweet:', error);
            toast.error(error.response?.data?.error || 'Failed to delete post', { style: { background: 'black', color: '#fff', borderColor: '#2f3336', borderWidth: '1px', borderStyle: 'solid' } });
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
                        likedByCurrentUser={tweet.parentTweet.userLiked}
                    />
                    <div className="reply-line"></div>
                </div>
            )}
            <div className={`tweet-card ${isDetail ? 'detail' : ''} ${tweet.parentTweet ? 'is-reply' : ''}`} >
                <div className="tweet-avatar" onClick={handleProfileClick}>
                    {tweet.author?.profile?.avatarUrl ? (
                        <img src={tweet.author.profile.avatarUrl} alt={tweet.author.username} />
                    ) : (
                        tweet.author.username[0].toUpperCase()
                    )}
                </div>

                <div className="tweet-content" onClick={handleClick}>
                    {tweet.parentTweet && (
                        <div className="replying-to">
                            Replying to <span className="mention" onClick={(e) => {
                                e.stopPropagation();
                                navigate(`/profile/${tweet.parentTweet.author.id}`)
                            }}>@{tweet.parentTweet.author.username}</span>
                        </div>
                    )}
                    <div className="tweet-header">
                        <div className="tweet-author" onClick={handleProfileClick}>
                            <span className="author-name">{tweet.author.username}</span>
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
