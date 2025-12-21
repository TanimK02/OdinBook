import axios from 'axios';

export const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

axios.defaults.withCredentials = true;

// User APIs
export const userAPI = {
    register: async (username, email, password) => {
        const response = await axios.post(`${API_URL}/api/users/register`, {
            username, email, password
        });
        return response.data;
    },

    login: async (identifier, password) => {
        const response = await axios.post(`${API_URL}/api/users/login`, {
            identifier, password
        });
        return response.data;
    },

    logout: async () => {
        const response = await axios.post(`${API_URL}/api/users/logout`);
        return response.data;
    },

    getUserInfo: async () => {
        const response = await axios.get(`${API_URL}/api/users/userinfo`);
        return response.data.user;
    },

    updateProfile: async (bio, avatarFile) => {
        const formData = new FormData();
        formData.append('bio', bio);
        if (avatarFile) formData.append('avatar', avatarFile);
        const response = await axios.post(`${API_URL}/api/users/profile`, formData);
        return response.data.profile;
    },

    getProfile: async () => {
        const response = await axios.get(`${API_URL}/api/users/profile`);
        return response.data.profile;
    },

    changePassword: async (oldPassword, newPassword) => {
        const response = await axios.put(`${API_URL}/api/users/change-password`, {
            oldPassword, newPassword
        });
        return response.data;
    },

    updateEmail: async (newEmail) => {
        const response = await axios.put(`${API_URL}/api/users/update-email`, { newEmail });
        return response.data;
    },

    updateUsername: async (newUsername) => {
        const response = await axios.put(`${API_URL}/api/users/update-username`, { newUsername });
        return response.data;
    },

    deleteAccount: async () => {
        const response = await axios.delete(`${API_URL}/api/users/delete-account`);
        return response.data;
    },
    getOtherUserInfo: async (username) => {
        const response = await axios.get(`${API_URL}/api/users/user/${username}`);
        return response.data.user;
    }
};

// Tweet APIs
export const tweetAPI = {
    createTweet: async (content, images = [], parentTweetId = null) => {
        const formData = new FormData();
        formData.append('content', content);
        if (parentTweetId) formData.append('parentTweetId', parentTweetId);
        images.forEach(img => formData.append('tweetPics', img));
        const response = await axios.post(`${API_URL}/api/tweets/tweet`, formData);
        return response.data.tweet;
    },

    getTweets: async (cursor = null) => {
        const response = await axios.get(`${API_URL}/api/tweets/tweets`, {
            params: { cursor }
        });
        return { tweets: response.data.tweets, nextCursor: response.data.nextCursor };
    },

    getTweet: async (tweetId) => {
        const response = await axios.get(`${API_URL}/api/tweets/tweet/${tweetId}`);
        return response.data.tweet;
    },

    getUserTweets: async (userId, cursor = null) => {
        const response = await axios.get(`${API_URL}/api/tweets/tweets/user/${userId}`, {
            params: { cursor }
        });
        return { tweets: response.data.tweets, nextCursor: response.data.nextCursor };
    },

    getReplies: async (tweetId, cursor = null) => {
        const response = await axios.get(`${API_URL}/api/tweets/tweets/replies/${tweetId}`, {
            params: { cursor }
        });
        return { replies: response.data.replies, nextCursor: response.data.nextCursor };
    },

    updateTweet: async (tweetId, content, newImages = []) => {
        const formData = new FormData();
        formData.append('content', content);
        newImages.forEach(img => formData.append('tweetPics', img));
        const response = await axios.put(`${API_URL}/api/tweets/tweet/${tweetId}`, formData);
        return response.data.tweet;
    },

    deleteTweet: async (tweetId) => {
        const response = await axios.delete(`${API_URL}/api/tweets/tweet/${tweetId}`);
        return response.data;
    }
};

// Interaction APIs
export const interactionAPI = {
    toggleLike: async (tweetId) => {
        const response = await axios.post(`${API_URL}/api/interactions/like`, { tweetId });
        return response.data;
    },

    toggleRetweet: async (tweetId) => {
        const response = await axios.post(`${API_URL}/api/interactions/retweet`, { tweetId });
        return response.data;
    }
};