import { searchTweetsByContent, searchUsersAndTweets, searchUsersByUsername } from "../services/searchService.js";

export const searchUsers = async (req, res) => {
    const { query, cursor, limit } = req.query;

    if (!query || query.trim() === "") {
        return res.status(400).json({ error: "Query parameter is required" });
    }

    try {
        const pageSize = limit ? parseInt(limit) : 10;
        const users = await searchUsersByUsername(query, pageSize, cursor);

        const hasMore = users.length > pageSize;
        const results = hasMore ? users.slice(0, pageSize) : users;
        const nextCursor = hasMore ? results[results.length - 1].createdAt.toISOString() : null;

        return res.status(200).json({
            users: results,
            nextCursor,
            hasMore
        });
    } catch (error) {
        console.error("Error searching users:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
}

export const searchTweets = async (req, res) => {
    const { query, cursor, limit } = req.query;
    const { id } = req.user;

    if (!query || query.trim() === "") {
        return res.status(400).json({ error: "Query parameter is required" });
    }

    try {
        const pageSize = limit ? parseInt(limit) : 10;
        const tweets = await searchTweetsByContent(query, pageSize, id, cursor);

        const hasMore = tweets.length > pageSize;
        const results = hasMore ? tweets.slice(0, pageSize) : tweets;
        const nextCursor = hasMore ? results[results.length - 1].createdAt.toISOString() : null;

        return res.status(200).json({
            tweets: results,
            nextCursor,
            hasMore
        });
    } catch (error) {
        console.error("Error searching tweets:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
};

export const searchTweetsAndUsers = async (req, res) => {
    const { query, userLimit, tweetLimit } = req.query;
    const { id } = req.user;

    if (!query || query.trim() === "") {
        return res.status(400).json({ error: "Query parameter is required" });
    }

    try {
        const userPageSize = userLimit ? parseInt(userLimit) : 5;
        const tweetPageSize = tweetLimit ? parseInt(tweetLimit) : 5;
        const result = await searchUsersAndTweets(query, userPageSize, tweetPageSize, id);
        return res.status(200).json(result);
    } catch (error) {
        console.error("Error searching tweets and users:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
}