import { useRef, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { useInfiniteQuery, useQuery } from '@tanstack/react-query';
import { tweetAPI, userAPI } from '../api.js';
import TweetCard from '../components/TweetCard';
import './Profile.css';

function Profile() {
    const { userId } = useParams();

    const { data: profile } = useQuery({
        queryKey: ['user', userId],
        queryFn: () => userAPI.getOtherUserInfo(userId),
        enabled: !!userId
    });

    const {
        data,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
        isLoading,
    } = useInfiniteQuery({
        queryKey: ['userTweets', userId],
        queryFn: ({ pageParam = null }) => tweetAPI.getUserTweets(userId, pageParam),
        getNextPageParam: (lastPage) => lastPage.nextCursor || null,
        enabled: !!userId
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
                <div className="profile-avatar">
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
                {!hasMore && tweets.length > 0 && <div className="end-message">No more posts</div>}
                {tweets.length === 0 && !loading && <div className="end-message">No posts yet</div>}
            </div>
        </div>
    );
}

export default Profile;
