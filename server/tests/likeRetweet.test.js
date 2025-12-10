import app from '../index.js';
import request from 'supertest';
import prisma from "../config/prisma.js";
import bcrypt from 'bcryptjs';

describe('Like and Retweet Routes', () => {
    // Helper function to create authenticated agent
    const createAuthenticatedAgent = async (username, password) => {
        const agent = request.agent(app);
        await agent
            .post("/api/users/login")
            .send({ identifier: username, password });
        return agent;
    };

    // Helper function to create test user
    const createTestUser = async (username, email, password) => {
        const passwordHash = bcrypt.hashSync(password, 10);
        return await prisma.user.create({
            data: {
                username,
                passwordHash,
                email,
                profile: { create: {} }
            }
        });
    };

    const user = {
        username: "likeretweetuser",
        email: "likeretweet@example.com",
        password: "password123"
    };
    let userId;
    let tweetId;

    beforeAll(async () => {
        await prisma.user.deleteMany({
            where: { username: user.username }
        });
        const createdUser = await createTestUser(user.username, user.email, user.password);
        userId = createdUser.id;

        const tweet = await prisma.tweet.create({
            data: {
                content: 'Tweet for like/retweet testing',
                authorId: userId
            }
        });
        tweetId = tweet.id;
    });

    afterAll(async () => {
        await prisma.like.deleteMany({
            where: { userId }
        });
        await prisma.retweet.deleteMany({
            where: { userId }
        });
        await prisma.tweet.deleteMany({
            where: { authorId: userId }
        });
        await prisma.user.deleteMany({
            where: { username: user.username }
        });
    });

    describe('POST /api/interactions/like', () => {
        afterEach(async () => {
            await prisma.like.deleteMany({
                where: { userId, tweetId }
            });
        });

        it('should return 401 when not authenticated', async () => {
            const res = await request(app)
                .post("/api/interactions/like")
                .send({ tweetId })
                .set("Content-Type", "application/json");
            expect(res.status).toBe(401);
        });

        it('should return 400 when tweetId is missing', async () => {
            const agent = request.agent(app);
            await agent
                .post("/api/users/login")
                .send({ identifier: user.username, password: user.password });

            const res = await agent
                .post("/api/interactions/like")
                .send({})
                .set("Content-Type", "application/json");
            expect(res.status).toBe(400);
        });

        it('should return 201 and like tweet successfully', async () => {
            const agent = request.agent(app);
            await agent
                .post("/api/users/login")
                .send({ identifier: user.username, password: user.password });

            const res = await agent
                .post("/api/interactions/like")
                .send({ tweetId })
                .set("Content-Type", "application/json");
            expect(res.status).toBe(201);
            expect(res.body.message).toBe("Tweet liked");
        });

        it('should return 200 and unlike tweet when already liked', async () => {
            const agent = request.agent(app);
            await agent
                .post("/api/users/login")
                .send({ identifier: user.username, password: user.password });

            // First like
            await agent
                .post("/api/interactions/like")
                .send({ tweetId })
                .set("Content-Type", "application/json");

            // Then unlike
            const res = await agent
                .post("/api/interactions/like")
                .send({ tweetId })
                .set("Content-Type", "application/json");
            expect(res.status).toBe(200);
            expect(res.body.message).toBe("Tweet unliked");
        });

        it('should toggle like/unlike multiple times', async () => {
            const agent = request.agent(app);
            await agent
                .post("/api/users/login")
                .send({ identifier: user.username, password: user.password });

            // Like
            let res = await agent
                .post("/api/interactions/like")
                .send({ tweetId })
                .set("Content-Type", "application/json");
            expect(res.status).toBe(201);
            expect(res.body.message).toBe("Tweet liked");

            // Unlike
            res = await agent
                .post("/api/interactions/like")
                .send({ tweetId })
                .set("Content-Type", "application/json");
            expect(res.status).toBe(200);
            expect(res.body.message).toBe("Tweet unliked");

            // Like again
            res = await agent
                .post("/api/interactions/like")
                .send({ tweetId })
                .set("Content-Type", "application/json");
            expect(res.status).toBe(201);
            expect(res.body.message).toBe("Tweet liked");
        });
    });

    describe('POST /api/interactions/retweet', () => {
        afterEach(async () => {
            await prisma.retweet.deleteMany({
                where: { userId, tweetId }
            });
        });

        it('should return 401 when not authenticated', async () => {
            const res = await request(app)
                .post("/api/interactions/retweet")
                .send({ tweetId })
                .set("Content-Type", "application/json");
            expect(res.status).toBe(401);
        });

        it('should return 400 when tweetId is missing', async () => {
            const agent = request.agent(app);
            await agent
                .post("/api/users/login")
                .send({ identifier: user.username, password: user.password });

            const res = await agent
                .post("/api/interactions/retweet")
                .send({})
                .set("Content-Type", "application/json");
            expect(res.status).toBe(400);
        });

        it('should return 201 and retweet successfully', async () => {
            const agent = request.agent(app);
            await agent
                .post("/api/users/login")
                .send({ identifier: user.username, password: user.password });

            const res = await agent
                .post("/api/interactions/retweet")
                .send({ tweetId })
                .set("Content-Type", "application/json");
            expect(res.status).toBe(201);
            expect(res.body.message).toBe("Tweet retweeted");
        });

        it('should return 200 and unretweet when already retweeted', async () => {
            const agent = request.agent(app);
            await agent
                .post("/api/users/login")
                .send({ identifier: user.username, password: user.password });

            // First retweet
            await agent
                .post("/api/interactions/retweet")
                .send({ tweetId })
                .set("Content-Type", "application/json");

            // Then unretweet
            const res = await agent
                .post("/api/interactions/retweet")
                .send({ tweetId })
                .set("Content-Type", "application/json");
            expect(res.status).toBe(200);
            expect(res.body.message).toBe("Tweet unretweeted");
        });

        it('should toggle retweet/unretweet multiple times', async () => {
            const agent = request.agent(app);
            await agent
                .post("/api/users/login")
                .send({ identifier: user.username, password: user.password });

            // Retweet
            let res = await agent
                .post("/api/interactions/retweet")
                .send({ tweetId })
                .set("Content-Type", "application/json");
            expect(res.status).toBe(201);
            expect(res.body.message).toBe("Tweet retweeted");

            // Unretweet
            res = await agent
                .post("/api/interactions/retweet")
                .send({ tweetId })
                .set("Content-Type", "application/json");
            expect(res.status).toBe(200);
            expect(res.body.message).toBe("Tweet unretweeted");

            // Retweet again
            res = await agent
                .post("/api/interactions/retweet")
                .send({ tweetId })
                .set("Content-Type", "application/json");
            expect(res.status).toBe(201);
            expect(res.body.message).toBe("Tweet retweeted");
        });
    });

    describe('Like and Retweet Integration', () => {
        afterEach(async () => {
            await prisma.like.deleteMany({
                where: { userId, tweetId }
            });
            await prisma.retweet.deleteMany({
                where: { userId, tweetId }
            });
        });

        it('should allow both liking and retweeting the same tweet', async () => {
            const agent = request.agent(app);
            await agent
                .post("/api/users/login")
                .send({ identifier: user.username, password: user.password });

            // Like the tweet
            let res = await agent
                .post("/api/interactions/like")
                .send({ tweetId })
                .set("Content-Type", "application/json");
            expect(res.status).toBe(201);

            // Retweet the same tweet
            res = await agent
                .post("/api/interactions/retweet")
                .send({ tweetId })
                .set("Content-Type", "application/json");
            expect(res.status).toBe(201);

            // Verify both exist
            const like = await prisma.like.findUnique({
                where: {
                    userId_tweetId: {
                        userId,
                        tweetId
                    }
                }
            });
            expect(like).not.toBeNull();

            const retweet = await prisma.retweet.findUnique({
                where: {
                    userId_tweetId: {
                        userId,
                        tweetId
                    }
                }
            });
            expect(retweet).not.toBeNull();
        });

        it('should allow unliking without affecting retweet status', async () => {
            const agent = request.agent(app);
            await agent
                .post("/api/users/login")
                .send({ identifier: user.username, password: user.password });

            // Like and retweet
            await agent
                .post("/api/interactions/like")
                .send({ tweetId })
                .set("Content-Type", "application/json");
            await agent
                .post("/api/interactions/retweet")
                .send({ tweetId })
                .set("Content-Type", "application/json");

            // Unlike
            await agent
                .post("/api/interactions/like")
                .send({ tweetId })
                .set("Content-Type", "application/json");

            // Verify like is removed but retweet remains
            const like = await prisma.like.findUnique({
                where: {
                    userId_tweetId: {
                        userId,
                        tweetId
                    }
                }
            });
            expect(like).toBeNull();

            const retweet = await prisma.retweet.findUnique({
                where: {
                    userId_tweetId: {
                        userId,
                        tweetId
                    }
                }
            });
            expect(retweet).not.toBeNull();
        });
    });
});
