import prisma from '../config/prisma.js';

export const searchUsersByUsername = async (query, limit = 10) => {
    try {
        const users = await prisma.user.findMany({
            where: {
                username: {
                    contains: query,
                    mode: "insensitive",
                },
            },
            select: {
                id: true,
                username: true,
                email: true,
                profile: {
                    select: {
                        bio: true,
                        avatarUrl: true,
                    },
                },
            },
            take: limit,
        });
        return users;
    } catch (error) {
        throw error;
    }
};

export const searchTweetsByContent = async (query, limit = 10, reqUserId) => {
    try {
        const tweets = await prisma.tweet.findMany({
            where: {
                content: {
                    contains: query,
                    mode: "insensitive",
                },
            },
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
            take: limit,
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
