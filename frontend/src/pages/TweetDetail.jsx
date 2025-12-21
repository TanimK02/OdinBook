import { useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useInfiniteQuery, useQuery } from '@tanstack/react-query';
import { tweetAPI } from '../api.js';
import TweetCard from '../components/TweetCard';
import ComposeTweet from '../components/ComposeTweet';
import { IoArrowBack } from 'react-icons/io5';
import './TweetDetail.css';
import { useAuth } from '../AuthProvider.jsx';
import toast from 'react-hot-toast';

function TweetDetail() {
    const { user } = useAuth();
    const { tweetId } = useParams();
    const navigate = useNavigate();

    const { data: tweet, isError: tweetError } = useQuery({
        queryKey: ['tweet', tweetId],
        queryFn: () => tweetAPI.getTweet(tweetId),
        enabled: !!tweetId,
        onError: (error) => {
            toast.error(error.response?.data?.error || 'Failed to load tweet', { style: { background: 'black', color: '#fff', borderColor: '#2f3336', borderWidth: '1px', borderStyle: 'solid' } });
        },
    });

    const {
        data,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
        isLoading,
        isError: repliesError,
    } = useInfiniteQuery({
        queryKey: ['replies', tweetId],
        queryFn: ({ pageParam = null }) => tweetAPI.getReplies(tweetId, pageParam),
        getNextPageParam: (lastPage) => lastPage.nextCursor || null,
        enabled: !!tweetId,
        onError: (error) => {
            toast.error(error.response?.data?.error || 'Failed to load replies', { style: { background: 'black', color: '#fff', borderColor: '#2f3336', borderWidth: '1px', borderStyle: 'solid' } });
        },
    });

    const replies = data ? data.pages.flatMap(page => page.replies) : [];
    const loading = isLoading || isFetchingNextPage;
    const hasMore = Boolean(hasNextPage);

    const observer = useRef();
    const lastReplyRef = useCallback(node => {
        if (loading) return;
        if (observer.current) observer.current.disconnect();
        observer.current = new IntersectionObserver(entries => {
            if (entries[0].isIntersecting && hasMore) {
                fetchNextPage();
            }
        });
        if (node) observer.current.observe(node);
    }, [loading, hasMore, fetchNextPage]);

    if (tweetError) {
        return (
            <div className="tweet-detail">
                <div className="tweet-detail-header">
                    <button className="back-btn" onClick={() => navigate(-1)}>
                        <IoArrowBack size={20} />
                    </button>
                    <h1>Post</h1>
                </div>
                <div className="error-message">Failed to load tweet. Please try again.</div>
            </div>
        );
    }

    if (!tweet) {
        return (
            <div className="tweet-detail">
                <div className="tweet-detail-header">
                    <button className="back-btn" onClick={() => navigate(-1)}>
                        <IoArrowBack size={20} />
                    </button>
                    <h1>Post</h1>
                </div>
                <div className="loading">Loading tweet...</div>
            </div>
        );
    }

    return (
        <div className="tweet-detail">
            <div className="tweet-detail-header">
                <button className="back-btn" onClick={() => navigate(-1)}>
                    <IoArrowBack size={20} />
                </button>
                <h1>Post</h1>
            </div>

            <TweetCard tweet={tweet} isDetail={true} likedByCurrentUser={tweet.userLiked} />

            <div className="reply-section">
                <ComposeTweet
                    user={user}
                    parentTweetId={tweetId}
                    placeholder="Post your reply"
                />
            </div>

            <div className="replies-list">
                {repliesError && <div className="error-message">Failed to load replies. Please try again.</div>}
                {replies.map((reply, index) => {
                    if (replies.length === index + 1) {
                        return (
                            <div ref={lastReplyRef} key={reply.id}>
                                <TweetCard tweet={reply} likedByCurrentUser={reply.userLiked} />
                            </div>
                        );
                    } else {
                        return <TweetCard key={reply.id} tweet={reply} likedByCurrentUser={reply.userLiked} />;
                    }
                })}
                {loading && <div className="loading">Loading replies...</div>}
                {!hasMore && replies.length > 0 && !repliesError && <div className="end-message">No more replies</div>}
                {replies.length === 0 && !loading && !repliesError && (
                    <div className="end-message">No replies yet. Be the first to reply!</div>
                )}
            </div>
        </div>
    );
}

export default TweetDetail;
