import styles from './UsersList.module.css';
import { useNavigate } from 'react-router-dom';

function UsersList({
    users,
    activeTab,
    query,
    isLoading,
    lastUserRef,
    isFetchingNextUsers,
    onLoadMoreUsers
}) {
    const navigate = useNavigate();

    // Don't render anything if there's no query or if loading or if no users to show
    if (!query || isLoading || !users.length) {
        return null;
    }

    // Only show if activeTab is "all" or "users"
    if (activeTab !== "all" && activeTab !== "users") {
        return null;
    }

    return (
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
                <div className={styles.loadMore} onClick={onLoadMoreUsers}>
                    Load more users
                </div>
            )}
            {activeTab === "users" && isFetchingNextUsers && (
                <div className={styles.loading}>Loading more...</div>
            )}
        </div>
    );
}

export default UsersList;