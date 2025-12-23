import styles from './SearchHeader.module.css';
import { IoIosSearch } from "react-icons/io";
import { useRef } from 'react';
import { useNavigate } from 'react-router-dom';

function SearchHeader({ query, setQuery }) {
    const inputRef = useRef(null);
    const navigate = useNavigate();

    const handleSearch = (e) => {
        e.preventDefault();
        if (query && query.trim()) {
            navigate(`/search/${encodeURIComponent(query)}`);
        }
    };

    return (
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
    );
}

export default SearchHeader;