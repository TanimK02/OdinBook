import { createTweet, deleteTweet, getExistingImagesCount, getRepliesPaginated, getTweetById, getTweetsPaginated, getUserTweetsPaginated, updateTweet, uploadTweetImages, validateParentTweet } from "../services/tweetService.js";

export const postTweet = async (req, res) => {
    try {
        const { content, parentTweetId } = req.body;
        const tweetPics = (req.files && req.files['tweetPics']) ? req.files['tweetPics'] : [];

        // Validate parent tweet exists if provided
        if (parentTweetId) {
            const parentTweet = await validateParentTweet(parentTweetId);
            if (!parentTweet) {
                return res.status(404).json({ error: "Parent tweet not found" });
            }
        }

        const imageUrls = await uploadTweetImages(tweetPics);
        const newTweet = await createTweet(content, req.user.id, imageUrls, parentTweetId);

        return res.status(201).json({ tweet: newTweet });
    } catch (error) {
        console.error("Error creating tweet:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
}

export const getTweets = async (req, res) => {
    const cursor = req.query.cursor;
    const lastCursor = cursor || null;
    const pageSize = 10;
    const { id } = req.user;
    try {
        const tweets = await getTweetsPaginated(lastCursor, pageSize, id);
        let nextCursor = null;
        if (tweets.length > pageSize) {
            nextCursor = tweets[pageSize - 1].createdAt.toISOString();
            tweets.pop();
            return res.status(200).json({ tweets, nextCursor });
        }
        return res.status(200).json({ tweets, nextCursor });
    } catch (error) {
        console.error("Error fetching tweets:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
}

export const getTweet = async (req, res) => {
    const tweetId = req.params.id;
    const { id } = req.user;
    try {
        const tweet = await getTweetById(tweetId, id);

        if (!tweet) {
            return res.status(404).json({ error: "Tweet not found" });
        }

        return res.status(200).json({ tweet });
    } catch (error) {
        console.error("Error fetching tweet:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
}

export const getUserTweets = async (req, res) => {
    const userId = req.params.userId;
    const cursor = req.query.cursor;
    const lastCursor = cursor || null;
    const pageSize = 10;
    const { id } = req.user;
    try {
        const tweets = await getUserTweetsPaginated(userId, lastCursor, pageSize, id);
        let nextCursor = null;
        if (tweets.length > pageSize) {
            nextCursor = tweets[pageSize - 1].createdAt.toISOString();
            tweets.pop();
            return res.status(200).json({ tweets, nextCursor });
        }
        return res.status(200).json({ tweets, nextCursor });
    } catch (error) {
        console.error("Error fetching user's tweets:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
}

export const deleteTweetController = async (req, res) => {
    const tweetId = req.params.id;

    try {
        const tweet = await getTweetById(tweetId);

        if (!tweet) {
            return res.status(404).json({ error: "Tweet not found" });
        }

        if (tweet.authorId !== req.user.id) {
            return res.status(403).json({ error: "Unauthorized to delete this tweet" });
        }

        await deleteTweet(tweetId);

        return res.status(200).json({ message: "Tweet deleted successfully" });
    } catch (error) {
        console.error("Error deleting tweet:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
}

export const getReplies = async (req, res) => {
    const parentTweetId = req.params.parentTweetId;
    const cursor = req.query.cursor;
    const lastCursor = cursor || null;
    const pageSize = 10;
    const { id } = req.user;
    try {
        const replies = await getRepliesPaginated(parentTweetId, lastCursor, pageSize, id);
        let nextCursor = null;
        if (replies.length > pageSize) {
            nextCursor = replies[pageSize - 1].createdAt.toISOString();
            replies.pop();
            return res.status(200).json({ replies, nextCursor });
        }
        return res.status(200).json({ replies, nextCursor });
    } catch (error) {
        console.error("Error fetching tweet replies:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
}

export const updateTweetController = async (req, res) => {
    const tweetId = req.params.id;

    try {
        const tweet = await getTweetById(tweetId);

        if (!tweet) {
            return res.status(404).json({ error: "Tweet not found" });
        }

        if (tweet.authorId !== req.user.id) {
            return res.status(403).json({ error: "Unauthorized to edit this tweet" });
        }

        const { content } = req.body;
        const tweetPics = req.files['tweetPics'] || [];

        const existingImagesCount = await getExistingImagesCount(tweetId);

        if (existingImagesCount + tweetPics.length > 4) {
            return res.status(400).json({
                error: `Cannot add ${tweetPics.length} image(s). Tweet already has ${existingImagesCount} image(s). Maximum is 4 images per tweet.`
            });
        }

        const imageUrls = await uploadTweetImages(tweetPics);
        const updatedTweet = await updateTweet(tweetId, content, imageUrls);

        return res.status(200).json({ tweet: updatedTweet });
    } catch (error) {
        console.error("Error updating tweet:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
}
