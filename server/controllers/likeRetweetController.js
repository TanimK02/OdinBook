import { toggleLike, toggleRetweet } from "../services/likeRetweetService.js";

export const likeController = async (req, res) => {
    const { tweetId } = req.body;
    const userId = req.user.id;

    try {
        const result = await toggleLike(userId, tweetId);

        if (result.action === 'unliked') {
            return res.status(200).json({ message: "Tweet unliked" });
        } else {
            return res.status(201).json({ message: "Tweet liked" });
        }
    } catch (error) {
        console.error("Error liking/unliking tweet:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
}

export const retweetController = async (req, res) => {
    const { tweetId } = req.body;
    const userId = req.user.id;

    try {
        const result = await toggleRetweet(userId, tweetId);

        if (result.action === 'unretweeted') {
            return res.status(200).json({ message: "Tweet unretweeted" });
        } else {
            return res.status(201).json({ message: "Tweet retweeted" });
        }
    } catch (error) {
        console.error("Error retweeting/unretweeting tweet:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
}
