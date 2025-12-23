import styles from './Search.module.css';
import { useParams } from 'react-router-dom';
import { useSearchTweetsAndUsers, useSearchTweets, useSearchUsers } from '../hooks/useSearchMutations';
import { useState, useEffect, useRef } from 'react';
import SearchHeader from '../components/search/SearchHeader';
import SearchTabs from '../components/search/SearchTabs';
import UsersList from '../components/search/UsersList';
import TweetsList from '../components/search/TweetsList';

function Search() {
    const { query: urlQuery } = useParams();
    const [query, setQuery] = useState(urlQuery || "");
    const [activeTab, setActiveTab] = useState("all");

    const lastTweetRef = useRef(null);
    const lastUserRef = useRef(null);

    const { mutate: searchAll, data: allData, isLoading: allLoading } = useSearchTweetsAndUsers();

    const {
        data: tweetsData,
        isLoading: tweetsLoading,
        fetchNextPage: fetchNextTweets,
        hasNextPage: hasNextTweets,
        isFetchingNextPage: isFetchingNextTweets
    } = useSearchTweets({ query, enabled: activeTab === "tweets" });

    const {
        data: usersData,
        isLoading: usersLoading,
        fetchNextPage: fetchNextUsers,
        hasNextPage: hasNextUsers,
        isFetchingNextPage: isFetchingNextUsers
    } = useSearchUsers({ query, enabled: activeTab === "users" });

    useEffect(() => {
        if (query && query.trim() && activeTab === "all") {
            searchAll(query);
        }
    }, [query, activeTab, searchAll]);

    // Intersection observer for infinite scroll - tweets
    useEffect(() => {
        if (!lastTweetRef.current || activeTab !== "tweets") return;

        const observer = new IntersectionObserver(
            entries => {
                if (entries[0].isIntersecting && hasNextTweets && !isFetchingNextTweets) {
                    fetchNextTweets();
                }
            },
            { threshold: 0.1 }
        );

        observer.observe(lastTweetRef.current);
        return () => observer.disconnect();
    }, [activeTab, hasNextTweets, isFetchingNextTweets, fetchNextTweets]);

    // Intersection observer for infinite scroll - users
    useEffect(() => {
        if (!lastUserRef.current || activeTab !== "users") return;

        const observer = new IntersectionObserver(
            entries => {
                if (entries[0].isIntersecting && hasNextUsers && !isFetchingNextUsers) {
                    fetchNextUsers();
                }
            },
            { threshold: 0.1 }
        );

        observer.observe(lastUserRef.current);
        return () => observer.disconnect();
    }, [activeTab, hasNextUsers, isFetchingNextUsers, fetchNextUsers]);

    const isLoading = activeTab === "all" ? allLoading : (activeTab === "tweets" ? tweetsLoading : usersLoading);

    const tweets = activeTab === "all"
        ? (allData?.tweets || [])
        : (tweetsData?.pages.flatMap(page => page.tweets) || []);

    const users = activeTab === "all"
        ? (allData?.users || [])
        : (usersData?.pages.flatMap(page => page.users) || []);

    return (
        <div className={styles.searchPage}>
            <SearchHeader
                query={query}
                setQuery={setQuery}
            />

            <SearchTabs
                activeTab={activeTab}
                onTabChange={setActiveTab}
            />

            <div className={styles.searchResults}>
                {isLoading && <div className={styles.loading}>Searching...</div>}

                {!isLoading && !query && (
                    <div className={styles.noQuery}>Try searching for people or tweets</div>
                )}

                <UsersList
                    users={users}
                    activeTab={activeTab}
                    isLoading={isLoading}
                    query={query}
                    lastUserRef={lastUserRef}
                    isFetchingNextUsers={isFetchingNextUsers}
                    onLoadMoreUsers={() => setActiveTab("users")}
                />

                <TweetsList
                    tweets={tweets}
                    activeTab={activeTab}
                    isLoading={isLoading}
                    query={query}
                    lastTweetRef={lastTweetRef}
                    isFetchingNextTweets={isFetchingNextTweets}
                    onLoadMoreTweets={() => setActiveTab("tweets")}
                />

                {!isLoading && query && activeTab === "users" && users.length === 0 && (
                    <div className={styles.noResults}>No users found for "{query}"</div>
                )}

                {!isLoading && query && activeTab === "tweets" && tweets.length === 0 && (
                    <div className={styles.noResults}>No tweets found for "{query}"</div>
                )}

                {!isLoading && query && activeTab === "all" && users.length === 0 && tweets.length === 0 && (
                    <div className={styles.noResults}>No results found for "{query}"</div>
                )}
            </div>
        </div>
    );
}

export default Search;
