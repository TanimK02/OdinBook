import axios from 'axios';

export const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

const axiosConfig = {
    withCredentials: true
};

// User APIs
export const userAPI = {
    register: async (username, email, password) => {
        const response = await axios.post(`${API_URL}/api/users/register`,
            { username, email, password },
            axiosConfig
        );
        return response.data;
    },

    login: async (identifier, password) => {
        const response = await axios.post(`${API_URL}/api/users/login`,
            { identifier, password },
            axiosConfig
        );
        return response.data;
    },

    logout: async () => {
        const response = await axios.post(`${API_URL}/api/users/logout`, {}, axiosConfig);
        return response.data;
    },

    getUserInfo: async () => {
        const response = await axios.get(`${API_URL}/api/users/userinfo`, axiosConfig);
        return response.data.user;
    },

    updateProfile: async (bio, avatarFile) => {
        const formData = new FormData();
        formData.append('bio', bio);
        if (avatarFile) formData.append('avatar', avatarFile);
        const response = await axios.post(`${API_URL}/api/users/profile`, formData, axiosConfig);
        return response.data.profile;
    },

    getProfile: async () => {
        const response = await axios.get(`${API_URL}/api/users/profile`, axiosConfig);
        return response.data.profile;
    },

    changePassword: async (oldPassword, newPassword) => {
        const response = await axios.put(`${API_URL}/api/users/change-password`,
            { oldPassword, newPassword },
            axiosConfig
        );
        return response.data;
    },

    updateEmail: async (newEmail) => {
        const response = await axios.put(`${API_URL}/api/users/update-email`,
            { newEmail },
            axiosConfig
        );
        return response.data;
    },

    updateUsername: async (newUsername) => {
        const response = await axios.put(`${API_URL}/api/users/update-username`,
            { newUsername },
            axiosConfig
        );
        return response.data;
    },

    deleteAccount: async () => {
        const response = await axios.delete(`${API_URL}/api/users/delete-account`, axiosConfig);
        return response.data;
    },

    getOtherUserInfo: async (username) => {
        const response = await axios.get(`${API_URL}/api/users/user/${username}`, axiosConfig);
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
        const response = await axios.post(`${API_URL}/api/tweets/tweet`, formData, axiosConfig);
        return response.data.tweet;
    },

    getTweets: async (cursor = null) => {
        const response = await axios.get(`${API_URL}/api/tweets/tweets`, {
            ...axiosConfig,
            params: cursor ? { cursor } : {}
        });
        return { tweets: response.data.tweets, nextCursor: response.data.nextCursor };
    },

    getTweet: async (tweetId) => {
        const response = await axios.get(`${API_URL}/api/tweets/tweet/${tweetId}`, axiosConfig);
        return response.data.tweet;
    },

    getUserTweets: async (userId, cursor = null) => {
        const response = await axios.get(`${API_URL}/api/tweets/tweets/user/${userId}`, {
            ...axiosConfig,
            params: cursor ? { cursor } : {}
        });
        return { tweets: response.data.tweets, nextCursor: response.data.nextCursor };
    },

    getReplies: async (tweetId, cursor = null) => {
        const response = await axios.get(`${API_URL}/api/tweets/tweets/replies/${tweetId}`, {
            ...axiosConfig,
            params: cursor ? { cursor } : {}
        });
        return { replies: response.data.replies, nextCursor: response.data.nextCursor };
    },

    updateTweet: async (tweetId, content, newImages = []) => {
        const formData = new FormData();
        formData.append('content', content);
        newImages.forEach(img => formData.append('tweetPics', img));
        const response = await axios.put(`${API_URL}/api/tweets/tweet/${tweetId}`, formData, axiosConfig);
        return response.data.tweet;
    },

    deleteTweet: async (tweetId) => {
        const response = await axios.delete(`${API_URL}/api/tweets/tweet/${tweetId}`, axiosConfig);
        return response.data;
    }
};

// Interaction APIs
export const interactionAPI = {
    toggleLike: async (tweetId) => {
        const response = await axios.post(`${API_URL}/api/interactions/like`,
            { tweetId },
            axiosConfig
        );
        return response.data;
    },

    toggleRetweet: async (tweetId) => {
        const response = await axios.post(`${API_URL}/api/interactions/retweet`,
            { tweetId },
            axiosConfig
        );
        return response.data;
    }
};

export const searchAPI = {
    searchUsers: async (query, cursor) => {
        const response = await axios.get(`${API_URL}/api/search/users`, {
            ...axiosConfig,
            params: { query, cursor }
        });
        return { users: response.data.users, nextCursor: response.data.nextCursor };
    },
    searchTweets: async (query, cursor) => {
        const response = await axios.get(`${API_URL}/api/search/tweets`, {
            ...axiosConfig,
            params: { query, cursor }
        });
        return { tweets: response.data.tweets, nextCursor: response.data.nextCursor };
    },
    searchTweetsAndUsers: async (query) => {
        const response = await axios.get(`${API_URL}/api/search/all`, {
            ...axiosConfig,
            params: { query }
        });
        return {
            users: response.data.users,
            tweets: response.data.tweets
        };
    }
}