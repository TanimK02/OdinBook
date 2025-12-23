import styles from './TweetsList.module.css';
import TweetCard from '../tweet/TweetCard.jsx';

function TweetsList({
    tweets,
    activeTab,
    query,
    isLoading,
    lastTweetRef,
    isFetchingNextTweets,
    onLoadMoreTweets
}) {
    // Don't render anything if there's no query or if loading or if no tweets to show
    if (!query || isLoading || !tweets.length) {
        return null;
    }

    // Only show if activeTab is "all" or "tweets"
    if (activeTab !== "all" && activeTab !== "tweets") {
        return null;
    }

    return (
        <div className={styles.tweetsList}>
            {activeTab === "all" && (
                <div className={styles.sectionHeader}>Tweets</div>
            )}
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
            {activeTab === "all" && tweets.length > 0 && (
                <div className={styles.loadMore} onClick={onLoadMoreTweets}>
                    Load more tweets
                </div>
            )}
            {activeTab === "tweets" && isFetchingNextTweets && (
                <div className={styles.loading}>Loading more...</div>
            )}
        </div>
    );
}

export default TweetsList;