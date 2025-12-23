import prisma from '../config/prisma.js';

export const searchUsersByUsername = async (query, limit = 10, cursor = null) => {
    try {
        const whereClause = {
            username: {
                contains: query,
                mode: "insensitive",
            },
            ...(cursor && { createdAt: { lt: new Date(cursor) } })
        };

        const users = await prisma.user.findMany({
            where: whereClause,
            select: {
                id: true,
                username: true,
                email: true,
                createdAt: true,
                profile: {
                    select: {
                        bio: true,
                        avatarUrl: true,
                    },
                },
            },
            take: limit + 1,
            orderBy: {
                createdAt: "desc",
            },
        });
        return users;
    } catch (error) {
        throw error;
    }
};

export const searchTweetsByContent = async (query, limit = 10, reqUserId, cursor = null) => {
    try {
        const whereClause = {
            content: {
                contains: query,
                mode: "insensitive",
            },
            ...(cursor && { createdAt: { lt: new Date(cursor) } })
        };

        const tweets = await prisma.tweet.findMany({
            where: whereClause,
            include: {
                images: true,
                author: {
                    select: {
                        id: true,
                        username: true,
                        email: true,
                        profile: {
                            select: {
                                bio: true,
                                avatarUrl: true
                            }
                        }
                    }
                },
                parentTweet: {
                    include: {
                        author: {
                            select: {
                                id: true,
                                username: true,
                                email: true,
                                profile: {
                                    select: {
                                        bio: true,
                                        avatarUrl: true
                                    }
                                }
                            }
                        },
                        images: true,
                        _count: {
                            select: { likes: true, retweets: true, replies: true }
                        },
                        likes: reqUserId ? {
                            where: { userId: reqUserId },
                            select: { id: true }
                        } : false
                    }
                },
                _count: {
                    select: { likes: true, retweets: true, replies: true }
                },
                likes: reqUserId ? {
                    where: { userId: reqUserId },
                    select: { id: true }
                } : false
            },
            take: limit + 1,
            orderBy: {
                createdAt: "desc",
            },
        });

        return tweets.map(tweet => {
            const userLiked = reqUserId && tweet.likes?.length > 0;
            const parentUserLiked = reqUserId && tweet.parentTweet?.likes?.length > 0;

            return {
                ...tweet,
                userLiked,
                parentTweet: tweet.parentTweet ? {
                    ...tweet.parentTweet,
                    userLiked: parentUserLiked,
                    likes: undefined
                } : null,
                likes: undefined
            };
        });
    } catch (error) {
        throw error;
    }
};

export const searchUsersAndTweets = async (query, userLimit = 5, tweetLimit = 5, reqUserId) => {
    try {
        const [users, tweets] = await Promise.all([
            searchUsersByUsername(query, userLimit),
            searchTweetsByContent(query, tweetLimit, reqUserId)
        ]);

        return { users, tweets };
    } catch (error) {
        throw error;
    }
};
