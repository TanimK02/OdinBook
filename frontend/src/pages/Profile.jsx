import { useState, useEffect, useCallback, useRef } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { API_URL } from '../config';
import TweetCard from '../components/TweetCard';
import './Profile.css';

function Profile({ currentUser }) {
    const { userId } = useParams();
    const [profile, setProfile] = useState(null);
    const [tweets, setTweets] = useState([]);
    const [page, setPage] = useState(1);
    const [loading, setLoading] = useState(false);
    const [hasMore, setHasMore] = useState(true);
    const observer = useRef();
    const seenTweetIds = useRef(new Set());

    const lastTweetRef = useCallback(node => {
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
        setTweets([]);
        setPage(1);
        setHasMore(true);
        seenTweetIds.current.clear();
        loadProfile();
    }, [userId]);

    useEffect(() => {
        loadTweets();
    }, [page, userId]);

    const loadProfile = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`${API_URL}/api/users/userinfo`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setProfile(response.data.user);
        } catch (error) {
            console.error('Error loading profile:', error);
        }
    };

    const loadTweets = async () => {
        if (loading) return;
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(
                `${API_URL}/api/tweets/tweets/user/${userId}/page/${page}`,
                { headers: { Authorization: `Bearer ${token}` } }
            );

            const newTweets = response.data.tweets.filter(tweet => !seenTweetIds.current.has(tweet.id));
            newTweets.forEach(tweet => seenTweetIds.current.add(tweet.id));

            if (newTweets.length === 0) {
                setHasMore(false);
            } else {
                setTweets(prev => [...prev, ...newTweets]);
            }
        } catch (error) {
            console.error('Error loading tweets:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleTweetDeleted = (tweetId) => {
        setTweets(prev => prev.filter(tweet => tweet.id !== tweetId));
        seenTweetIds.current.delete(tweetId);
    };

    const handleTweetLiked = (tweetId) => {
        setTweets(prev => prev.map(tweet => {
            if (tweet.id === tweetId) {
                return {
                    ...tweet,
                    _count: { ...tweet._count, likes: tweet._count.likes + 1 }
                };
            }
            return tweet;
        }));
    };

    const handleTweetUnliked = (tweetId) => {
        setTweets(prev => prev.map(tweet => {
            if (tweet.id === tweetId) {
                return {
                    ...tweet,
                    _count: { ...tweet._count, likes: Math.max(0, tweet._count.likes - 1) }
                };
            }
            return tweet;
        }));
    };

    if (!profile) {
        return <div className="loading">Loading profile...</div>;
    }

    return (
        <div className="profile">
            <div className="profile-header">
                <h1>{profile.username}</h1>
                <div className="tweet-count">{tweets.length} Posts</div>
            </div>

            <div className="profile-info">
                <div className="profile-banner"></div>
                <div className="profile-details">
                    <div className="profile-avatar">
                        {profile.profile?.avatarUrl ? (
                            <img src={profile.profile.avatarUrl} alt={profile.username} />
                        ) : (
                            profile.username[0].toUpperCase()
                        )}
                    </div>
                    <h2>{profile.username}</h2>
                    <div className="profile-handle">@{profile.username}</div>
                    {profile.profile?.bio && (
                        <div className="profile-bio">{profile.profile.bio}</div>
                    )}
                </div>
            </div>

            <div className="profile-tabs">
                <div className="tab active">Posts</div>
            </div>

            <div className="tweets-list">
                {tweets.map((tweet, index) => {
                    if (tweets.length === index + 1) {
                        return (
                            <div ref={lastTweetRef} key={tweet.id}>
                                <TweetCard
                                    tweet={tweet}
                                    currentUser={currentUser}
                                    onDelete={handleTweetDeleted}
                                    onLike={handleTweetLiked}
                                    onUnlike={handleTweetUnliked}
                                />
                            </div>
                        );
                    } else {
                        return (
                            <TweetCard
                                key={tweet.id}
                                tweet={tweet}
                                currentUser={currentUser}
                                onDelete={handleTweetDeleted}
                                onLike={handleTweetLiked}
                                onUnlike={handleTweetUnliked}
                            />
                        );
                    }
                })}
                {loading && <div className="loading">Loading more tweets...</div>}
                {!hasMore && tweets.length > 0 && <div className="end-message">No more posts</div>}
                {tweets.length === 0 && !loading && <div className="end-message">No posts yet</div>}
            </div>
        </div>
    );
}

export default Profile;
