import TweetCard from '../components/TweetCard';
import styles from './Search.module.css';
import { useParams, useNavigate } from 'react-router-dom';
import { useSearchTweetsAndUsers, useSearchTweets, useSearchUsers } from '../hooks/useSearchMutations';
import { IoIosSearch } from "react-icons/io";
import { useState, useEffect, useRef, useCallback } from 'react';

function Search() {
    const { query: urlQuery } = useParams();
    const navigate = useNavigate();
    const [query, setQuery] = useState(urlQuery || "");
    const [activeTab, setActiveTab] = useState("all");
    const inputRef = useRef(null);

    const { mutate: searchAll, data: allData, isLoading: allLoading } = useSearchTweetsAndUsers();
    const { mutate: searchTweets, data: tweetsData, isLoading: tweetsLoading } = useSearchTweets();
    const { mutate: searchUsers, data: usersData, isLoading: usersLoading } = useSearchUsers();

    const [tweetsCursor, setTweetsCursor] = useState(null);
    const [usersCursor, setUsersCursor] = useState(null);
    const [allTweets, setAllTweets] = useState([]);
    const [allUsers, setAllUsers] = useState([]);

    const lastTweetRef = useRef(null);
    const lastUserRef = useRef(null);

    useEffect(() => {
        if (query && query.trim()) {
            // Reset state when query changes
            setAllTweets([]);
            setAllUsers([]);
            setTweetsCursor(null);
            setUsersCursor(null);

            if (activeTab === "all") {
                searchAll(query);
            } else if (activeTab === "tweets") {
                searchTweets({ query });
            } else if (activeTab === "users") {
                searchUsers({ query });
            }
        }
    }, [query, activeTab, searchAll, searchTweets, searchUsers]);

    // Handle tweets data
    useEffect(() => {
        if (tweetsData) {
            setAllTweets(prev => tweetsCursor ? [...prev, ...tweetsData.tweets] : tweetsData.tweets);
            setTweetsCursor(tweetsData.nextCursor);
        }
    }, [tweetsData]);

    // Handle users data
    useEffect(() => {
        if (usersData) {
            setAllUsers(prev => usersCursor ? [...prev, ...usersData.users] : usersData.users);
            setUsersCursor(usersData.nextCursor);
        }
    }, [usersData]);

    // Handle all data
    useEffect(() => {
        if (allData) {
            setAllTweets(allData.tweets || []);
            setAllUsers(allData.users || []);
        }
    }, [allData]);

    const handleSearch = (e) => {
        e.preventDefault();
        if (query && query.trim()) {
            navigate(`/search/${encodeURIComponent(query)}`);
        }
    };

    const loadMoreTweets = useCallback(() => {
        if (tweetsCursor && !tweetsLoading && query) {
            searchTweets({ query, cursor: tweetsCursor });
        }
    }, [tweetsCursor, tweetsLoading, query, searchTweets]);

    const loadMoreUsers = useCallback(() => {
        if (usersCursor && !usersLoading && query) {
            searchUsers({ query, cursor: usersCursor });
        }
    }, [usersCursor, usersLoading, query, searchUsers]);

    // Intersection observer for infinite scroll
    useEffect(() => {
        if (!lastTweetRef.current) return;

        const observer = new IntersectionObserver(
            entries => {
                if (entries[0].isIntersecting && activeTab === "tweets") {
                    loadMoreTweets();
                }
            },
            { threshold: 0.1 }
        );

        observer.observe(lastTweetRef.current);
        return () => observer.disconnect();
    }, [loadMoreTweets, activeTab]);

    useEffect(() => {
        if (!lastUserRef.current) return;

        const observer = new IntersectionObserver(
            entries => {
                if (entries[0].isIntersecting && activeTab === "users") {
                    loadMoreUsers();
                }
            },
            { threshold: 0.1 }
        );

        observer.observe(lastUserRef.current);
        return () => observer.disconnect();
    }, [loadMoreUsers, activeTab]);

    const isLoading = activeTab === "all" ? allLoading : (activeTab === "tweets" ? tweetsLoading : usersLoading);
    const tweets = activeTab === "all" ? (allData?.tweets || []) : allTweets;
    const users = activeTab === "all" ? (allData?.users || []) : allUsers;

    return (
        <div className={styles.searchPage}>
            <div className={styles.searchHeader}>
                <h1>Search</h1>
                <form onSubmit={handleSearch} className={styles.searchBarContainer}>
                    <div className={styles.searchBar}>
                        <input
                            ref={inputRef}
                            type="text"
                            placeholder="Search..."
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                        />
                        <div className={styles.searchIcon}><IoIosSearch /></div>
                    </div>
                </form>
            </div>

            <div className={styles.searchTabs}>
                <button
                    className={activeTab === "all" ? styles.active : ""}
                    onClick={() => setActiveTab("all")}
                >
                    All
                </button>
                <button
                    className={activeTab === "tweets" ? styles.active : ""}
                    onClick={() => setActiveTab("tweets")}
                >
                    Tweets
                </button>
                <button
                    className={activeTab === "users" ? styles.active : ""}
                    onClick={() => setActiveTab("users")}
                >
                    Users
                </button>
            </div>

            <div className={styles.searchResults}>
                {isLoading && <div className={styles.loading}>Searching...</div>}

                {!isLoading && !query && (
                    <div className={styles.noQuery}>Try searching for people or tweets</div>
                )}

                {!isLoading && query && (activeTab === "all" || activeTab === "users") && users.length > 0 && (
                    <div className={styles.usersList}>
                        {activeTab === "all" && (
                            <div className={styles.sectionHeader}>Users</div>
                        )}
                        {users.map((user, index) => (
                            <div
                                key={user.id}
                                className={styles.userItem}
                                ref={index === users.length - 1 ? lastUserRef : null}
                                onClick={() => navigate(`/profile/${user.id}`)}
                            >
                                {user.profile?.avatarUrl ? (
                                    <img src={user.profile.avatarUrl} alt={user.username} className={styles.userAvatar} />
                                ) : (
                                    <div className={`${styles.userAvatar} ${styles.placeholder}`}>
                                        {user.username.charAt(0).toUpperCase()}
                                    </div>
                                )}
                                <div className={styles.userInfo}>
                                    <div className={styles.userDisplayName}>{user.displayName || user.username}</div>
                                    <div className={styles.userUsername}>@{user.username}</div>
                                    {user.profile?.bio && <div className={styles.userBio}>{user.profile.bio}</div>}
                                </div>
                            </div>
                        ))}
                        {activeTab === "all" && users.length > 0 && (
                            <div className={styles.loadMore} onClick={() => setActiveTab("users")}>
                                Load more users
                            </div>
                        )}
                    </div>
                )}

                {!isLoading && query && (activeTab === "all" || activeTab === "tweets") && tweets.length > 0 && (
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
                            <div className={styles.loadMore} onClick={() => setActiveTab("tweets")}>
                                Load more tweets
                            </div>
                        )}
                    </div>
                )}

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
