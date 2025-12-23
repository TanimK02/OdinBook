import styles from './userBar.module.css';
import { useGetRandomUsers } from '../../hooks/useUserMutations';
import { useNavigate } from 'react-router-dom';

function UserBar() {
    const navigate = useNavigate();
    const { data: users, isLoading } = useGetRandomUsers(6);

    if (isLoading) {
        return (
            <div className={styles.userBar}>
                <h2 className={styles.title}>Check out these profiles</h2>
                <div className={styles.loading}>Loading...</div>
            </div>
        );
    }

    if (!users || users.length === 0) {
        return null;
    }

    return (
        <div className={styles.userBar}>
            <h2 className={styles.title}>Check Out These Profiles</h2>
            <div className={styles.userList}>
                {users.map(user => (
                    <div
                        key={user.id}
                        className={styles.userItem}
                        onClick={() => navigate(`/profile/${user.id}`)}
                    >
                        {user.profile?.avatarUrl ? (
                            <img
                                src={user.profile.avatarUrl}
                                alt={user.username}
                                className={styles.avatar}
                            />
                        ) : (
                            <div className={styles.avatarPlaceholder}>
                                {user.username.charAt(0).toUpperCase()}
                            </div>
                        )}
                        <div className={styles.userInfo}>
                            <div className={styles.username}>{user.username}</div>
                            {user.profile?.bio && (
                                <div className={styles.bio}>{user.profile.bio}</div>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default UserBar;

