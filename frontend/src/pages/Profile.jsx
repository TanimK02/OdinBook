import { useRef, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { useInfiniteQuery, useQuery } from '@tanstack/react-query';
import { tweetAPI, userAPI } from '../api.js';
import TweetCard from '../components/tweet/TweetCard';
import './Profile.css';
import toast from 'react-hot-toast';

function Profile() {
    const { userId } = useParams();

    const { data: profile, isError: profileError } = useQuery({
        queryKey: ['user', userId],
        queryFn: () => userAPI.getOtherUserInfo(userId),
        enabled: !!userId,
        onError: (error) => {
            toast.error(error.response?.data?.error || 'Failed to load profile', { style: { background: 'black', color: '#fff', borderColor: '#2f3336', borderWidth: '1px', borderStyle: 'solid' } });
        },
    });

    const {
        data,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
        isLoading,
        isError: tweetsError,
    } = useInfiniteQuery({
        queryKey: ['userTweets', userId],
        queryFn: ({ pageParam = null }) => tweetAPI.getUserTweets(userId, pageParam),
        getNextPageParam: (lastPage) => lastPage.nextCursor || null,
        enabled: !!userId,
        onError: (error) => {
            toast.error(error.response?.data?.error || 'Failed to load tweets', { style: { background: 'black', color: '#fff', borderColor: '#2f3336', borderWidth: '1px', borderStyle: 'solid' } });
        },
    });

    const tweets = data ? data.pages.flatMap(page => page.tweets) : [];
    const loading = isLoading || isFetchingNextPage;
    const hasMore = Boolean(hasNextPage);

    const observer = useRef();
    const lastTweetRef = useCallback(node => {
        if (loading) return;
        if (observer.current) observer.current.disconnect();
        observer.current = new IntersectionObserver(entries => {
            if (entries[0].isIntersecting && hasMore) {
                fetchNextPage();
            }
        });
        if (node) observer.current.observe(node);
    }, [loading, hasMore, fetchNextPage]);

    if (profileError) {
        return (
            <div className="profile">
                <div className="profile-header">
                    <h1>Profile</h1>
                </div>
                <div className="error-message">Failed to load profile. Please try again.</div>
            </div>
        );
    }

    if (!profile) {
        return (
            <div className="profile">
                <div className="profile-header">
                    <h1>Profile</h1>
                </div>
                <div className="loading">Loading profile...</div>
            </div>
        );
    }

    return (
        <div className="profile">
            <div className="profile-header">
                <h1>{profile.username}</h1>
            </div>

            <div className="profile-info">
                <div className="profile-avatar" style={{ background: `${profile.profile?.avatarUrl ? "black" : "linear-gradient(135deg, #1d9bf0, #0c7abf)"}` }}>
                    {profile.profile?.avatarUrl ? (
                        <img src={profile.profile.avatarUrl} alt={profile.username} />
                    ) : (
                        profile.username[0].toUpperCase()
                    )}
                </div>
                <div className="profile-details">
                    <h2>{profile.username}</h2>
                    <p className="profile-bio">{profile.profile?.bio || 'No bio yet'}</p>
                </div>
            </div>

            <div className="tweets-list">
                {tweetsError && <div className="error-message">Failed to load tweets. Please try again.</div>}
                {tweets.map((tweet, index) => {
                    if (index === tweets.length - 1) {
                        return (
                            <div ref={lastTweetRef} key={tweet.id}>
                                <TweetCard tweet={tweet} likedByCurrentUser={tweet.userLiked} />
                            </div>
                        );
                    } else {
                        return <TweetCard key={tweet.id} tweet={tweet} likedByCurrentUser={tweet.userLiked} />;
                    }
                })}
                {loading && <div className="loading">Loading more tweets...</div>}
                {!hasMore && tweets.length > 0 && !tweetsError && <div className="end-message">No more posts</div>}
                {tweets.length === 0 && !loading && !tweetsError && <div className="end-message">No posts yet</div>}
            </div>
        </div>
    );
}

export default Profile;
