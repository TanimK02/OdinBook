export const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

// User APIs
export const userAPI = {
    register: async (username, email, password) => {
        const response = await fetch(`${API_URL}/api/users/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({ username, email, password })
        });
        return await response.json();
    },

    login: async (identifier, password) => {
        const response = await fetch(`${API_URL}/api/users/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({ identifier, password })
        });
        return await response.json();
    },

    logout: async () => {
        const response = await fetch(`${API_URL}/api/users/logout`, {
            method: 'POST',
            credentials: 'include'
        });
        return await response.json();
    },

    getUserInfo: async () => {
        const response = await fetch(`${API_URL}/api/users/userinfo`, {
            credentials: 'include'
        });
        const data = await response.json();
        return data.user;
    },

    updateProfile: async (bio, avatarFile) => {
        const formData = new FormData();
        formData.append('bio', bio);
        if (avatarFile) formData.append('avatar', avatarFile);
        const response = await fetch(`${API_URL}/api/users/profile`, {
            method: 'POST',
            credentials: 'include',
            body: formData
        });
        const data = await response.json();
        return data.profile;
    },

    getProfile: async () => {
        const response = await fetch(`${API_URL}/api/users/profile`, {
            credentials: 'include'
        });
        const data = await response.json();
        return data.profile;
    },

    changePassword: async (oldPassword, newPassword) => {
        const response = await fetch(`${API_URL}/api/users/change-password`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({ oldPassword, newPassword })
        });
        return await response.json();
    },

    updateEmail: async (newEmail) => {
        const response = await fetch(`${API_URL}/api/users/update-email`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({ newEmail })
        });
        return await response.json();
    },

    updateUsername: async (newUsername) => {
        const response = await fetch(`${API_URL}/api/users/update-username`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({ newUsername })
        });
        return await response.json();
    },

    deleteAccount: async () => {
        const response = await fetch(`${API_URL}/api/users/delete-account`, {
            method: 'DELETE',
            credentials: 'include'
        });
        return await response.json();
    },

    getOtherUserInfo: async (username) => {
        const response = await fetch(`${API_URL}/api/users/user/${username}`, {
            credentials: 'include'
        });
        const data = await response.json();
        return data.user;
    }
};

// Tweet APIs
export const tweetAPI = {
    createTweet: async (content, images = [], parentTweetId = null) => {
        const formData = new FormData();
        formData.append('content', content);
        if (parentTweetId) formData.append('parentTweetId', parentTweetId);
        images.forEach(img => formData.append('tweetPics', img));
        const response = await fetch(`${API_URL}/api/tweets/tweet`, {
            method: 'POST',
            credentials: 'include',
            body: formData
        });
        const data = await response.json();
        return data.tweet;
    },

    getTweets: async (cursor = null) => {
        const url = new URL(`${API_URL}/api/tweets/tweets`);
        if (cursor) url.searchParams.append('cursor', cursor);
        const response = await fetch(url, { credentials: 'include' });
        const data = await response.json();
        return { tweets: data.tweets, nextCursor: data.nextCursor };
    },

    getTweet: async (tweetId) => {
        const response = await fetch(`${API_URL}/api/tweets/tweet/${tweetId}`, {
            credentials: 'include'
        });
        const data = await response.json();
        return data.tweet;
    },

    getUserTweets: async (userId, cursor = null) => {
        const url = new URL(`${API_URL}/api/tweets/tweets/user/${userId}`);
        if (cursor) url.searchParams.append('cursor', cursor);
        const response = await fetch(url, { credentials: 'include' });
        const data = await response.json();
        return { tweets: data.tweets, nextCursor: data.nextCursor };
    },

    getReplies: async (tweetId, cursor = null) => {
        const url = new URL(`${API_URL}/api/tweets/tweets/replies/${tweetId}`);
        if (cursor) url.searchParams.append('cursor', cursor);
        const response = await fetch(url, { credentials: 'include' });
        const data = await response.json();
        return { replies: data.replies, nextCursor: data.nextCursor };
    },

    updateTweet: async (tweetId, content, newImages = []) => {
        const formData = new FormData();
        formData.append('content', content);
        newImages.forEach(img => formData.append('tweetPics', img));
        const response = await fetch(`${API_URL}/api/tweets/tweet/${tweetId}`, {
            method: 'PUT',
            credentials: 'include',
            body: formData
        });
        const data = await response.json();
        return data.tweet;
    },

    deleteTweet: async (tweetId) => {
        const response = await fetch(`${API_URL}/api/tweets/tweet/${tweetId}`, {
            method: 'DELETE',
            credentials: 'include'
        });
        return await response.json();
    }
};

// Interaction APIs
export const interactionAPI = {
    toggleLike: async (tweetId) => {
        const response = await fetch(`${API_URL}/api/interactions/like`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({ tweetId })
        });
        return await response.json();
    },

    toggleRetweet: async (tweetId) => {
        const response = await fetch(`${API_URL}/api/interactions/retweet`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({ tweetId })
        });
        return await response.json();
    }
};