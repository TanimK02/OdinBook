import prisma from '../config/prisma.js';
import { supabase } from "../config/supabase.js";

export const uploadTweetImages = async (tweetPics) => {
    try {
        const imageUrls = await Promise.all(tweetPics.map(async (file) => {
            const filePath = `tweets/${Date.now()}_${file.originalname}`;
            await supabase
                .storage
                .from('tweet-images')
                .upload(filePath, file.buffer, {
                    cacheControl: '3600',
                    upsert: false,
                    contentType: file.mimetype
                });
            const { data } = supabase
                .storage
                .from('tweet-images')
                .getPublicUrl(filePath);
            return data.publicUrl;
        }));
        return imageUrls;
    } catch (error) {
        throw error;
    }
}

export const createTweet = async (content, authorId, imageUrls, parentTweetId = null) => {
    try {
        const newTweet = await prisma.tweet.create({
            data: {
                content,
                authorId,
                ...(parentTweetId && { parentTweetId }),
                images: {
                    create: imageUrls.map(url => ({ url }))
                }
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
                _count: {
                    select: { likes: true }
                }
            }
        });
        return newTweet;
    } catch (error) {
        throw error;
    }
}

export const getTweetsPaginated = async (cursor, pageSize = 10, reqUserId) => {
    try {
        const tweets = await prisma.tweet.findMany({
            where: cursor ? { createdAt: { lt: new Date(cursor) } } : undefined,
            take: pageSize + 1,
            orderBy: { createdAt: "desc" },
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
                            select: { likes: true }
                        },
                        likes: reqUserId ? {
                            where: { userId: reqUserId },
                            select: { id: true }
                        } : false
                    }
                },
                _count: {
                    select: { likes: true }
                },
                likes: reqUserId ? {
                    where: { userId: reqUserId },
                    select: { id: true }
                } : false
            }
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
}

export const getTweetById = async (tweetId, reqUserId) => {
    try {
        const tweet = await prisma.tweet.findUnique({
            where: { id: tweetId },
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
                            select: { likes: true }
                        },
                        likes: reqUserId ? {
                            where: { userId: reqUserId },
                            select: { id: true }
                        } : false
                    }
                },
                _count: {
                    select: { likes: true }
                },
                likes: reqUserId ? {
                    where: { userId: reqUserId },
                    select: { id: true }
                } : false
            }
        });

        if (!tweet) return null;

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
    } catch (error) {
        throw error;
    }
}

export const getUserTweetsPaginated = async (userId, cursor, pageSize = 10, reqUserId) => {
    try {
        const whereClause = cursor
            ? { authorId: userId, createdAt: { lt: new Date(cursor) } }
            : { authorId: userId };

        const tweets = await prisma.tweet.findMany({
            where: whereClause,
            take: pageSize + 1,
            orderBy: { createdAt: "desc" },
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
                            select: { likes: true }
                        },
                        likes: reqUserId ? {
                            where: { userId: reqUserId },
                            select: { id: true }
                        } : false
                    }
                },
                _count: {
                    select: { likes: true }
                },
                likes: reqUserId ? {
                    where: { userId: reqUserId },
                    select: { id: true }
                } : false
            }
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
}

export const deleteTweet = async (tweetId) => {
    try {
        await prisma.tweet.delete({
            where: { id: tweetId }
        });
    } catch (error) {
        throw error;
    }
}

export const getRepliesPaginated = async (parentTweetId, cursor, pageSize = 10, reqUserId) => {
    try {
        const whereClause = cursor
            ? { parentTweetId, createdAt: { lt: new Date(cursor) } }
            : { parentTweetId };

        const replies = await prisma.tweet.findMany({
            where: whereClause,
            take: pageSize + 1,
            orderBy: { createdAt: "desc" },
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
                _count: {
                    select: { likes: true }
                },
                likes: reqUserId ? {
                    where: { userId: reqUserId },
                    select: { id: true }
                } : false
            }
        });

        return replies.map(reply => {
            const userLiked = reqUserId && reply.likes?.length > 0;
            return {
                ...reply,
                userLiked,
                likes: undefined
            };
        });
    } catch (error) {
        throw error;
    }
}

export const getExistingImagesCount = async (tweetId) => {
    try {
        const count = await prisma.img.count({
            where: { tweetId }
        });
        return count;
    } catch (error) {
        throw error;
    }
}

export const updateTweet = async (tweetId, content, imageUrls) => {
    try {
        const updateData = {
            content,
            ...(imageUrls.length > 0 && {
                images: {
                    create: imageUrls.map(url => ({ url }))
                }
            })
        };

        const updatedTweet = await prisma.tweet.update({
            where: { id: tweetId },
            data: updateData,
            include: {
                images: true
            }
        });
        return updatedTweet;
    } catch (error) {
        throw error;
    }
}

export const validateParentTweet = async (parentTweetId) => {
    try {
        const parentTweet = await prisma.tweet.findUnique({
            where: { id: parentTweetId }
        });
        return parentTweet;
    } catch (error) {
        throw error;
    }
}
