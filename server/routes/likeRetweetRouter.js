import { Router } from "express";
import prisma from "../config/prisma.js";
import passport from "passport";
const requireJwt = passport.authenticate("jwt", { session: false });
const likeRetweetRouter = Router();

likeRetweetRouter.post("/like", requireJwt, async (req, res) => {
    const { tweetId } = req.body;
    const userId = req.user.id;

    try {
        const existingLike = await prisma.like.findUnique({
            where: {
                userId_tweetId: {
                    userId,
                    tweetId,
                },
            },
        });

        if (existingLike) {
            await prisma.like.delete({
                where: {
                    id: existingLike.id,
                },
            });
            return res.status(200).json({ message: "Tweet unliked" });
        } else {
            await prisma.like.create({
                data: {
                    userId,
                    tweetId,
                },
            });
            return res.status(201).json({ message: "Tweet liked" });
        }
    } catch (error) {
        console.error("Error liking/unliking tweet:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
});

likeRetweetRouter.post("/retweet", requireJwt, async (req, res) => {
    const { tweetId } = req.body;
    const userId = req.user.id;

    try {
        const existingRetweet = await prisma.retweet.findUnique({
            where: {
                userId_tweetId: {
                    userId,
                    tweetId,
                },
            },
        });

        if (existingRetweet) {
            await prisma.retweet.delete({
                where: {
                    id: existingRetweet.id,
                },
            });
            return res.status(200).json({ message: "Tweet unretweeted" });
        } else {
            await prisma.retweet.create({
                data: {
                    userId,
                    tweetId,
                },
            });
            return res.status(201).json({ message: "Tweet retweeted" });
        }
    } catch (error) {
        console.error("Error retweeting/unretweeting tweet:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
});

export { likeRetweetRouter };