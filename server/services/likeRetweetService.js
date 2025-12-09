import prisma from '../config/prisma.js';

export const toggleLike = async (userId, tweetId) => {
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
            return { action: 'unliked' };
        } else {
            await prisma.like.create({
                data: {
                    userId,
                    tweetId,
                },
            });
            return { action: 'liked' };
        }
    } catch (error) {
        throw error;
    }
}

export const toggleRetweet = async (userId, tweetId) => {
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
            return { action: 'unretweeted' };
        } else {
            await prisma.retweet.create({
                data: {
                    userId,
                    tweetId,
                },
            });
            return { action: 'retweeted' };
        }
    } catch (error) {
        throw error;
    }
}
