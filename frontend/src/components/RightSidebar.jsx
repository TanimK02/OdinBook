import './RightSidebar.css';
import { IoIosSearch } from "react-icons/io";
import { useSearchUsers } from '../hooks/useSearchMutations';
import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
function RightSidebar() {
    const navigate = useNavigate();
    const [query, setQuery] = useState("");
    const [debouncedQuery, setDebouncedQuery] = useState("");
    const { mutate, data, isLoading } = useSearchUsers();
    const tweetSearchRef = useRef(null);
    const [isFocused, setIsFocused] = useState(false);
    const inputRef = useRef(null);
    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedQuery(query);
            tweetSearchRef.current && (tweetSearchRef.current.textContent = `Search tweets by "${query}"`);
        }, 500);

        return () => clearTimeout(handler);
    }, [query]);

    useEffect(() => {
        if (debouncedQuery) {
            mutate({ query: debouncedQuery });
        }
    }, [debouncedQuery, mutate]);

    const users = data?.users || [];

    return (
        <div className="right-sidebar">
            <div className='searchBarContainer'>
                <div className='searchBar'>
                    <input
                        ref={inputRef}
                        type="text"
                        placeholder="Search..."
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        onFocus={() => setIsFocused(true)}
                        onBlur={() => setIsFocused(false)}
                        className={(!query || !isFocused) ? 'fullRadius' : ''}
                    />
                    <div className='searchIcon'><IoIosSearch /></div>
                </div>

                {query && isFocused && (
                    <div className='searchDropdown'>
                        {isLoading && <div className='loading'>Searching...</div>}

                        {!isLoading && users && users.length > 0 && (
                            <>
                                <div className='searchResults'>
                                    {users.map(user => (
                                        <div key={user.id} className='searchResultItem' onMouseDown={() => {
                                            navigate(`/profile/${user.id}`);
                                            setQuery("");
                                            inputRef.current.blur();
                                        }}>
                                            {user.profile.avatarUrl ? (
                                                <div className='avatarWrapper'>
                                                    <img src={user.profile.avatarUrl} alt={`${user.username}'s avatar`} className='avatar' />
                                                </div>
                                            ) : (
                                                <div className='avatar placeholder'>{user.username.charAt(0).toUpperCase()}</div>
                                            )}

                                            <div className='userInfo'>
                                                <div className='displayName'>{user.displayName || user.username}</div>
                                                <div className='username'>@{user.username}</div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                <div onMouseDown={() => {
                                    navigate(`/search/${debouncedQuery}`)
                                    setQuery("");
                                    inputRef.current.blur();
                                }}
                                    className='searchTweetPrompt'>
                                    <div className='promptIcon'><IoIosSearch /></div>
                                    <span ref={tweetSearchRef}>Search tweets by "{query}"</span>
                                </div>
                            </>
                        )}

                        {!isLoading && debouncedQuery && (!users || users.length === 0) && (
                            <div className='noResults'>No users found for "{query}"</div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}

export default RightSidebar;
