import { searchTweetsByContent, searchUsersAndTweets, searchUsersByUsername } from "../services/searchService.js";

export const searchUsers = async (req, res) => {
    const { query } = req.query;

    if (!query || query.trim() === "") {
        return res.status(400).json({ error: "Query parameter is required" });
    }

    try {
        const users = await searchUsersByUsername(query, 10);
        return res.status(200).json({ users });
    } catch (error) {
        console.error("Error searching users:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
}

export const searchTweets = async (req, res) => {
    const { query } = req.query;
    const { id } = req.user;

    if (!query || query.trim() === "") {
        return res.status(400).json({ error: "Query parameter is required" });
    }

    try {
        const tweets = await searchTweetsByContent(query, 10, id);
        return res.status(200).json({ tweets });
    } catch (error) {
        console.error("Error searching tweets:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
};

export const searchTweetsAndUsers = async (req, res) => {
    const { query } = req.query;
    const { id } = req.user;

    if (!query || query.trim() === "") {
        return res.status(400).json({ error: "Query parameter is required" });
    }

    try {
        const result = await searchUsersAndTweets(query, 5, 5, id);
        return res.status(200).json(result);
    } catch (error) {
        console.error("Error searching tweets and users:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
}