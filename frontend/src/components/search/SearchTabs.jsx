import styles from './SearchTabs.module.css';

function SearchTabs({ activeTab, onTabChange }) {
    return (
        <div className={styles.searchTabs}>
            <button
                className={activeTab === "all" ? styles.active : ""}
                onClick={() => onTabChange("all")}
            >
                All
            </button>
            <button
                className={activeTab === "tweets" ? styles.active : ""}
                onClick={() => onTabChange("tweets")}
            >
                Tweets
            </button>
            <button
                className={activeTab === "users" ? styles.active : ""}
                onClick={() => onTabChange("users")}
            >
                Users
            </button>
        </div>
    );
}

export default SearchTabs;