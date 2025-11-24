import { uploadMiddleware } from "./uploadController.js";
import { Router } from "express";
import { body } from "express-validator";
import prisma from "../config/prisma.js";
import { validationResult } from "express-validator";
import { supabase } from "../config/supabase.js";
import passport from "passport";
const requireJwt = passport.authenticate("jwt", { session: false });
const tweetRouter = Router();

tweetRouter.post(
    "/tweet",
    requireJwt,
    uploadMiddleware,
    async (req, res) => {
        try {
            const { content, parentTweetId } = req.body;
            const tweetPics = (req.files && req.files['tweetPics']) ? req.files['tweetPics'] : [];

            // Validate content - handle empty string from FormData
            const hasContent = content && content.trim().length > 0;

            if (!hasContent && tweetPics.length === 0) {
                return res.status(400).json({ error: "Tweet must have content or images" });
            }

            if (content && content.length > 280) {
                return res.status(400).json({ error: "Content must be 280 characters or less" });
            }

            // Validate image count for new tweets
            if (tweetPics.length > 4) {
                return res.status(400).json({
                    error: `Cannot upload ${tweetPics.length} images. Maximum is 4 images per tweet.`
                });
            }

            // Validate parent tweet exists if provided
            if (parentTweetId) {
                const parentTweet = await prisma.tweet.findUnique({
                    where: { id: parentTweetId }
                });
                if (!parentTweet) {
                    return res.status(404).json({ error: "Parent tweet not found" });
                }
            }

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

            const newTweet = await prisma.tweet.create({
                data: {
                    content,
                    authorId: req.user.id,
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

            return res.status(201).json({ tweet: newTweet });
        } catch (error) {
            console.error("Error creating tweet:", error);
            return res.status(500).json({ error: "Internal server error" });
        }
    }
);
tweetRouter.get("/tweets/page/:page", requireJwt, async (req, res) => {
    const page = parseInt(req.params.page) || 1;
    const pageSize = 10;
    const skip = (page - 1) * pageSize;

    try {
        const tweets = await prisma.tweet.findMany({
            skip,
            take: pageSize,
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
                        }
                    }
                },
                _count: {
                    select: { likes: true }
                }
            }
        });
        return res.status(200).json({ tweets });
    } catch (error) {
        console.error("Error fetching tweets:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
});
tweetRouter.get("/tweet/:id", requireJwt, async (req, res) => {
    const tweetId = req.params.id;

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
                        }
                    }
                },
                _count: {
                    select: { likes: true }
                }
            }
        });

        if (!tweet) {
            return res.status(404).json({ error: "Tweet not found" });
        }

        return res.status(200).json({ tweet });
    } catch (error) {
        console.error("Error fetching tweet:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
});
tweetRouter.get("/tweets/user/:userId/page/:page", requireJwt, async (req, res) => {
    const userId = req.params.userId;
    const page = parseInt(req.params.page) || 1;
    const pageSize = 10;
    const skip = (page - 1) * pageSize;

    try {
        const tweets = await prisma.tweet.findMany({
            where: { authorId: userId },
            skip,
            take: pageSize,
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
                }
            }
        });
        return res.status(200).json({ tweets });
    } catch (error) {
        console.error("Error fetching user's tweets:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
});
tweetRouter.delete("/tweet/:id", requireJwt, async (req, res) => {
    const tweetId = req.params.id;

    try {
        const tweet = await prisma.tweet.findUnique({
            where: { id: tweetId }
        });

        if (!tweet) {
            return res.status(404).json({ error: "Tweet not found" });
        }

        if (tweet.authorId !== req.user.id) {
            return res.status(403).json({ error: "Unauthorized to delete this tweet" });
        }

        await prisma.tweet.delete({
            where: { id: tweetId }
        });

        return res.status(200).json({ message: "Tweet deleted successfully" });
    } catch (error) {
        console.error("Error deleting tweet:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
});

tweetRouter.get("/tweets/replies/:parentTweetId/page/:page", requireJwt, async (req, res) => {
    const parentTweetId = req.params.parentTweetId;
    const page = parseInt(req.params.page) || 1;
    const pageSize = 10;
    const skip = (page - 1) * pageSize;

    try {
        const replies = await prisma.tweet.findMany({
            where: { parentTweetId },
            skip,
            take: pageSize,
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
                }
            }
        });
        return res.status(200).json({ replies });
    } catch (error) {
        console.error("Error fetching tweet replies:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
});

tweetRouter.put("/tweet/:id", requireJwt, [
    body("content").isLength({ min: 1, max: 280 }).withMessage("Content must be between 1 and 280 characters")
], uploadMiddleware, async (req, res) => {
    const tweetId = req.params.id;
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {
        const tweet = await prisma.tweet.findUnique({
            where: { id: tweetId }
        });

        if (!tweet) {
            return res.status(404).json({ error: "Tweet not found" });
        }

        if (tweet.authorId !== req.user.id) {
            return res.status(403).json({ error: "Unauthorized to edit this tweet" });
        }
        const { content } = req.body;
        const tweetPics = req.files['tweetPics'] || [];

        // Check existing image count
        const existingImagesCount = await prisma.img.count({
            where: { tweetId }
        });

        // Validate total image count doesn't exceed 4
        if (existingImagesCount + tweetPics.length > 4) {
            return res.status(400).json({
                error: `Cannot add ${tweetPics.length} image(s). Tweet already has ${existingImagesCount} image(s). Maximum is 4 images per tweet.`
            });
        }

        // Only process and upload new images if they exist
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

        const updateData = {
            content,
            // Only add images if new ones were uploaded
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

        return res.status(200).json({ tweet: updatedTweet });
    } catch (error) {
        console.error("Error updating tweet:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
});

export { tweetRouter };

// model User {
//   id           String @id @default(cuid())
//   username     String @unique
//   email        String @unique
//   passwordHash String

//   // Self relations
//   followers Follow[] @relation("UserFollowing_follower")
//   following Follow[] @relation("UserFollowing_following")

//   tweets    Tweet[]
//   profile   Profile?
//   likes     Like[]
//   retweets  Retweet[]
//   createdAt DateTime  @default(now())
//   updatedAt DateTime  @updatedAt
// }

// model Tweet {
//   id       String @id @default(cuid())
//   content  String
//   author   User   @relation(fields: [authorId], references: [id], onDelete: Cascade)
//   authorId String

//   // Self relation for replies/threads
//   parentTweet   Tweet?  @relation("TweetReplies", fields: [parentTweetId], references: [id], onDelete: Cascade)
//   parentTweetId String?
//   replies       Tweet[] @relation("TweetReplies")

//   images    Img[]
//   likes     Like[]
//   retweets  Retweet[]
//   createdAt DateTime  @default(now())
//   updatedAt DateTime  @updatedAt

//   @@index([authorId, createdAt])
//   @@index([parentTweetId])
// }


// model Profile {
//   id        String   @id @default(cuid())
//   bio       String?
//   avatarUrl String?
//   user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
//   userId    String   @unique
//   createdAt DateTime @default(now())
//   updatedAt DateTime @updatedAt
// }

// model Img {
//   id        String   @id @default(cuid())
//   url       String
//   tweet     Tweet    @relation(fields: [tweetId], references: [id], onDelete: Cascade)
//   tweetId   String
//   createdAt DateTime @default(now())

//   @@index([tweetId])
// }

// model Follow {
//   id String @id @default(cuid())

//   follower   User   @relation("UserFollowing_follower", fields: [followerId], references: [id], onDelete: Cascade)
//   followerId String

//   following   User   @relation("UserFollowing_following", fields: [followingId], references: [id], onDelete: Cascade)
//   followingId String

//   createdAt DateTime @default(now())

//   @@unique([followerId, followingId])
//   @@index([followerId])
//   @@index([followingId])
// }

// model Like {
//   id        String   @id @default(cuid())
//   user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
//   userId    String
//   tweet     Tweet    @relation(fields: [tweetId], references: [id], onDelete: Cascade)
//   tweetId   String
//   createdAt DateTime @default(now())

//   @@unique([userId, tweetId])
//   @@index([userId])
//   @@index([tweetId])
// }

// model Retweet {
//   id        String   @id @default(cuid())
//   user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
//   userId    String
//   tweet     Tweet    @relation(fields: [tweetId], references: [id], onDelete: Cascade)
//   tweetId   String
//   createdAt DateTime @default(now())

//   @@unique([userId, tweetId])
//   @@index([userId])
//   @@index([tweetId])
// }
