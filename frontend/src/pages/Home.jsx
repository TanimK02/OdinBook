import { useRef } from 'react';
import ComposeTweet from '../components/ComposeTweet';
import TweetCard from '../components/TweetCard';
import './Home.css';
import { useAuth } from '../AuthProvider.jsx';
import { useInfiniteQuery } from '@tanstack/react-query';
import { tweetAPI } from '../api.js';
function Home() {
    const { user } = useAuth();
    const {
        data,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
        isLoading,
    } = useInfiniteQuery({
        queryKey: ['tweets'],
        queryFn: ({ pageParam = null }) => tweetAPI.getTweets(pageParam),
        getNextPageParam: (lastPage) => lastPage.nextCursor || null,
    });

    const tweets = data ? data.pages.flatMap(page => page.tweets) : [];
    const loading = isLoading || isFetchingNextPage;
    const hasMore = Boolean(hasNextPage);

    const observer = useRef();
    const lastTweetRef = (node) => {
        if (loading) return;
        if (observer.current) observer.current.disconnect();
        observer.current = new IntersectionObserver(entries => {
            if (entries[0].isIntersecting && hasMore) {
                fetchNextPage();
            }
        });
        if (node) observer.current.observe(node);
    };

    return (
        <div className="home">
            <div className="home-header">
                <h1>Home</h1>
            </div>

            <ComposeTweet user={user} />

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
                {isLoading && <div className="loading">Loading more tweets...</div>}
                {!hasNextPage && <div className="end-message">You've reached the end!</div>}
            </div>
        </div>
    );
}

export default Home;
