import { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { API_URL } from '../config';
import TweetCard from '../components/TweetCard';
import ComposeTweet from '../components/ComposeTweet';
import { IoArrowBack } from 'react-icons/io5';
import './TweetDetail.css';

function TweetDetail({ user }) {
    const { tweetId } = useParams();
    const navigate = useNavigate();
    const [tweet, setTweet] = useState(null);
    const [replies, setReplies] = useState([]);
    const [page, setPage] = useState(1);
    const [loading, setLoading] = useState(false);
    const [hasMore, setHasMore] = useState(true);
    const observer = useRef();
    const seenReplyIds = useRef(new Set());

    const lastReplyRef = useCallback(node => {
        if (loading) return;
        if (observer.current) observer.current.disconnect();
        observer.current = new IntersectionObserver(entries => {
            if (entries[0].isIntersecting && hasMore) {
                setPage(prevPage => prevPage + 1);
            }
        });
        if (node) observer.current.observe(node);
    }, [loading, hasMore]);

    useEffect(() => {
        loadTweet();
        setReplies([]);
        setPage(1);
        setHasMore(true);
        seenReplyIds.current.clear();
    }, [tweetId]);

    useEffect(() => {
        if (page > 1) {
            loadReplies();
        }
    }, [page]);

    useEffect(() => {
        if (tweet) {
            loadReplies();
        }
    }, [tweet]);

    const loadTweet = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`${API_URL}/api/tweets/tweet/${tweetId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setTweet(response.data.tweet);
        } catch (error) {
            console.error('Error loading tweet:', error);
        }
    };

    const loadReplies = async () => {
        if (loading) return;
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(
                `${API_URL}/api/tweets/tweets/replies/${tweetId}/page/${page}`,
                { headers: { Authorization: `Bearer ${token}` } }
            );

            const newReplies = response.data.replies.filter(reply => !seenReplyIds.current.has(reply.id));
            newReplies.forEach(reply => seenReplyIds.current.add(reply.id));

            if (newReplies.length === 0) {
                setHasMore(false);
            } else {
                setReplies(prev => [...prev, ...newReplies]);
            }
        } catch (error) {
            console.error('Error loading replies:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleReplyCreated = (newReply) => {
        if (!seenReplyIds.current.has(newReply.id)) {
            seenReplyIds.current.add(newReply.id);
            setReplies(prev => [newReply, ...prev]);
        }
    };

    const handleTweetDeleted = () => {
        navigate('/');
    };

    const handleReplyDeleted = (replyId) => {
        setReplies(prev => prev.filter(reply => reply.id !== replyId));
        seenReplyIds.current.delete(replyId);
    };

    const handleTweetLiked = (likedTweetId) => {
        if (tweet && tweet.id === likedTweetId) {
            setTweet(prev => ({
                ...prev,
                _count: { ...prev._count, likes: prev._count.likes + 1 }
            }));
        }
        setReplies(prev => prev.map(reply => {
            if (reply.id === likedTweetId) {
                return {
                    ...reply,
                    _count: { ...reply._count, likes: reply._count.likes + 1 }
                };
            }
            return reply;
        }));
    };

    const handleTweetUnliked = (unlikedTweetId) => {
        if (tweet && tweet.id === unlikedTweetId) {
            setTweet(prev => ({
                ...prev,
                _count: { ...prev._count, likes: Math.max(0, prev._count.likes - 1) }
            }));
        }
        setReplies(prev => prev.map(reply => {
            if (reply.id === unlikedTweetId) {
                return {
                    ...reply,
                    _count: { ...reply._count, likes: Math.max(0, reply._count.likes - 1) }
                };
            }
            return reply;
        }));
    };

    if (!tweet) {
        return <div className="loading">Loading tweet...</div>;
    }

    return (
        <div className="tweet-detail">
            <div className="tweet-detail-header">
                <button className="back-btn" onClick={() => navigate(-1)}>
                    <IoArrowBack size={20} />
                </button>
                <h1>Post</h1>
            </div>

            <TweetCard
                tweet={tweet}
                currentUser={user}
                isDetail={true}
                onDelete={handleTweetDeleted}
                onLike={handleTweetLiked}
                onUnlike={handleTweetUnliked}
            />

            <div className="reply-section">
                <ComposeTweet
                    user={user}
                    onTweetCreated={handleReplyCreated}
                    parentTweetId={tweetId}
                    placeholder="Post your reply"
                />
            </div>

            <div className="replies-list">
                {replies.map((reply, index) => {
                    if (replies.length === index + 1) {
                        return (
                            <div ref={lastReplyRef} key={reply.id}>
                                <TweetCard
                                    tweet={reply}
                                    currentUser={user}
                                    onDelete={handleReplyDeleted}
                                    onLike={handleTweetLiked}
                                    onUnlike={handleTweetUnliked}
                                />
                            </div>
                        );
                    } else {
                        return (
                            <TweetCard
                                key={reply.id}
                                tweet={reply}
                                currentUser={user}
                                onDelete={handleReplyDeleted}
                                onLike={handleTweetLiked}
                                onUnlike={handleTweetUnliked}
                            />
                        );
                    }
                })}
                {loading && <div className="loading">Loading replies...</div>}
                {!hasMore && replies.length > 0 && <div className="end-message">No more replies</div>}
                {replies.length === 0 && !loading && (
                    <div className="end-message">No replies yet. Be the first to reply!</div>
                )}
            </div>
        </div>
    );
}

export default TweetDetail;
