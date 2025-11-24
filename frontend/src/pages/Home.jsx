import { useState, useEffect, useCallback, useRef } from 'react';
import axios from 'axios';
import { API_URL } from '../config';
import TweetCard from '../components/TweetCard';
import ComposeTweet from '../components/ComposeTweet';
import './Home.css';

function Home({ user }) {
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
        loadTweets();
    }, [page]);

    const loadTweets = async () => {
        if (loading) return;
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`${API_URL}/api/tweets/tweets/page/${page}`, {
                headers: { Authorization: `Bearer ${token}` }
            });

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

    const handleTweetCreated = (newTweet) => {
        if (!seenTweetIds.current.has(newTweet.id)) {
            seenTweetIds.current.add(newTweet.id);
            setTweets(prev => [newTweet, ...prev]);
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
                    _count: {
                        ...tweet._count,
                        likes: tweet._count.likes + 1
                    }
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
                    _count: {
                        ...tweet._count,
                        likes: Math.max(0, tweet._count.likes - 1)
                    }
                };
            }
            return tweet;
        }));
    };

    return (
        <div className="home">
            <div className="home-header">
                <h1>Home</h1>
            </div>

            <ComposeTweet user={user} onTweetCreated={handleTweetCreated} />

            <div className="tweets-list">
                {tweets.map((tweet, index) => {
                    if (tweets.length === index + 1) {
                        return (
                            <div ref={lastTweetRef} key={tweet.id}>
                                <TweetCard
                                    tweet={tweet}
                                    currentUser={user}
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
                                currentUser={user}
                                onDelete={handleTweetDeleted}
                                onLike={handleTweetLiked}
                                onUnlike={handleTweetUnliked}
                            />
                        );
                    }
                })}
                {loading && <div className="loading">Loading more tweets...</div>}
                {!hasMore && tweets.length > 0 && <div className="end-message">You've reached the end!</div>}
            </div>
        </div>
    );
}

export default Home;
