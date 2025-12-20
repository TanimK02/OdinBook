import axios from 'axios';

const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';

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

    getTweets: async (page = 1) => {
        const response = await axios.get(`${API_URL}/api/tweets/tweets/page/${page}`);
        return response.data.tweets;
    },

    getTweet: async (tweetId) => {
        const response = await axios.get(`${API_URL}/api/tweets/tweet/${tweetId}`);
        return response.data.tweet;
    },

    getUserTweets: async (userId, page = 1) => {
        const response = await axios.get(`${API_URL}/api/tweets/tweets/user/${userId}/page/${page}`);
        return response.data.tweets;
    },

    getReplies: async (tweetId, page = 1) => {
        const response = await axios.get(`${API_URL}/api/tweets/tweets/replies/${tweetId}/page/${page}`);
        return response.data.replies;
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