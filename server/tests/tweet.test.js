import app from '../index.js';
import request from 'supertest';
import prisma from "../config/prisma.js";
import bcrypt from 'bcryptjs';

describe('Tweet Routes', () => {
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
        username: "tweetuser",
        email: "tweet@example.com",
        password: "password123"
    };
    let userId;

    beforeAll(async () => {
        await prisma.user.deleteMany({
            where: { username: user.username }
        });
        const createdUser = await createTestUser(user.username, user.email, user.password);
        userId = createdUser.id;
    });

    afterAll(async () => {
        await prisma.tweet.deleteMany({
            where: { authorId: userId }
        });
        await prisma.user.deleteMany({
            where: { username: user.username }
        });
    });

    describe('POST /api/tweets/tweet', () => {
        afterEach(async () => {
            await prisma.tweet.deleteMany({
                where: { authorId: userId }
            });
        });

        it('should return 401 when not authenticated', async () => {
            const res = await request(app)
                .post("/api/tweets/tweet")
                .field('content', 'Test tweet');
            expect(res.status).toBe(401);
        });

        it('should return 400 when no content or images provided', async () => {
            const agent = request.agent(app);
            await agent
                .post("/api/users/login")
                .send({ identifier: user.username, password: user.password });

            const res = await agent
                .post("/api/tweets/tweet")
                .field('content', '');
            expect(res.status).toBe(400);
            expect(res.body.error).toBe("Tweet must have content or images");
        });

        it('should return 400 when content exceeds 280 characters', async () => {
            const agent = request.agent(app);
            await agent
                .post("/api/users/login")
                .send({ identifier: user.username, password: user.password });

            const longContent = 'a'.repeat(281);
            const res = await agent
                .post("/api/tweets/tweet")
                .field('content', longContent);
            expect(res.status).toBe(400);
            expect(res.body.error).toBe("Content must be 280 characters or less");
        });

        it('should return 201 and create tweet successfully', async () => {
            const agent = request.agent(app);
            await agent
                .post("/api/users/login")
                .send({ identifier: user.username, password: user.password });

            const res = await agent
                .post("/api/tweets/tweet")
                .field('content', 'Test tweet content');
            expect(res.status).toBe(201);
            expect(res.body.tweet.content).toBe('Test tweet content');
            expect(res.body.tweet.authorId).toBe(userId);
        });

        it('should return 404 when parent tweet does not exist', async () => {
            const agent = request.agent(app);
            await agent
                .post("/api/users/login")
                .send({ identifier: user.username, password: user.password });

            const res = await agent
                .post("/api/tweets/tweet")
                .field('content', 'Reply tweet')
                .field('parentTweetId', 'nonexistent-id');
            expect(res.status).toBe(404);
            expect(res.body.error).toBe("Parent tweet not found");
        });

        it('should create a reply tweet successfully', async () => {
            const agent = request.agent(app);
            await agent
                .post("/api/users/login")
                .send({ identifier: user.username, password: user.password });

            const parentRes = await agent
                .post("/api/tweets/tweet")
                .field('content', 'Parent tweet');
            const parentTweetId = parentRes.body.tweet.id;

            const res = await agent
                .post("/api/tweets/tweet")
                .field('content', 'Reply tweet')
                .field('parentTweetId', parentTweetId);
            expect(res.status).toBe(201);
            expect(res.body.tweet.parentTweetId).toBe(parentTweetId);
        });
    });

    describe('GET /api/tweets/tweets/page/:page', () => {
        beforeAll(async () => {
            await prisma.tweet.deleteMany({
                where: { authorId: userId }
            });
            // Create some test tweets
            for (let i = 0; i < 15; i++) {
                await prisma.tweet.create({
                    data: {
                        content: `Test tweet ${i}`,
                        authorId: userId
                    }
                });
            }
        });

        it('should return 401 when not authenticated', async () => {
            const res = await request(app).get("/api/tweets/tweets/page/1");
            expect(res.status).toBe(401);
        });

        it('should return paginated tweets', async () => {
            const agent = request.agent(app);
            await agent
                .post("/api/users/login")
                .send({ identifier: user.username, password: user.password });

            const res = await agent.get("/api/tweets/tweets/page/1");
            expect(res.status).toBe(200);
            expect(res.body.tweets).toBeInstanceOf(Array);
            expect(res.body.tweets.length).toBeLessThanOrEqual(10);
        });

        it('should return second page of tweets', async () => {
            const agent = request.agent(app);
            await agent
                .post("/api/users/login")
                .send({ identifier: user.username, password: user.password });

            const res = await agent.get("/api/tweets/tweets/page/2");
            expect(res.status).toBe(200);
            expect(res.body.tweets).toBeInstanceOf(Array);
            expect(res.body.tweets.length).toBeGreaterThan(0);
        });
    });

    describe('GET /api/tweets/tweet/:id', () => {
        let tweetId;

        beforeAll(async () => {
            const tweet = await prisma.tweet.create({
                data: {
                    content: 'Single test tweet',
                    authorId: userId
                }
            });
            tweetId = tweet.id;
        });

        afterAll(async () => {
            await prisma.tweet.delete({
                where: { id: tweetId }
            });
        });

        it('should return 401 when not authenticated', async () => {
            const res = await request(app).get(`/api/tweets/tweet/${tweetId}`);
            expect(res.status).toBe(401);
        });

        it('should return 404 when tweet does not exist', async () => {
            const agent = request.agent(app);
            await agent
                .post("/api/users/login")
                .send({ identifier: user.username, password: user.password });

            const res = await agent.get("/api/tweets/tweet/nonexistent-id");
            expect(res.status).toBe(404);
            expect(res.body.error).toBe("Tweet not found");
        });

        it('should return tweet by id', async () => {
            const agent = request.agent(app);
            await agent
                .post("/api/users/login")
                .send({ identifier: user.username, password: user.password });

            const res = await agent.get(`/api/tweets/tweet/${tweetId}`);
            expect(res.status).toBe(200);
            expect(res.body.tweet.id).toBe(tweetId);
            expect(res.body.tweet.content).toBe('Single test tweet');
        });
    });

    describe('GET /api/tweets/tweets/user/:userId/page/:page', () => {
        beforeAll(async () => {
            await prisma.tweet.deleteMany({
                where: { authorId: userId }
            });
            for (let i = 0; i < 5; i++) {
                await prisma.tweet.create({
                    data: {
                        content: `User tweet ${i}`,
                        authorId: userId
                    }
                });
            }
        });

        it('should return 401 when not authenticated', async () => {
            const res = await request(app).get(`/api/tweets/tweets/user/${userId}/page/1`);
            expect(res.status).toBe(401);
        });

        it('should return tweets for specific user', async () => {
            const agent = request.agent(app);
            await agent
                .post("/api/users/login")
                .send({ identifier: user.username, password: user.password });

            const res = await agent.get(`/api/tweets/tweets/user/${userId}/page/1`);
            expect(res.status).toBe(200);
            expect(res.body.tweets).toBeInstanceOf(Array);
            expect(res.body.tweets.length).toBe(5);
            expect(res.body.tweets[0].authorId).toBe(userId);
        });
    });

    describe('GET /api/tweets/tweets/replies/:parentTweetId/page/:page', () => {
        let parentTweetId;

        beforeAll(async () => {
            const parentTweet = await prisma.tweet.create({
                data: {
                    content: 'Parent tweet for replies',
                    authorId: userId
                }
            });
            parentTweetId = parentTweet.id;

            for (let i = 0; i < 3; i++) {
                await prisma.tweet.create({
                    data: {
                        content: `Reply ${i}`,
                        authorId: userId,
                        parentTweetId
                    }
                });
            }
        });

        it('should return 401 when not authenticated', async () => {
            const res = await request(app).get(`/api/tweets/tweets/replies/${parentTweetId}/page/1`);
            expect(res.status).toBe(401);
        });

        it('should return replies for a tweet', async () => {
            const agent = request.agent(app);
            await agent
                .post("/api/users/login")
                .send({ identifier: user.username, password: user.password });

            const res = await agent.get(`/api/tweets/tweets/replies/${parentTweetId}/page/1`);
            expect(res.status).toBe(200);
            expect(res.body.replies).toBeInstanceOf(Array);
            expect(res.body.replies.length).toBe(3);
            expect(res.body.replies[0].parentTweetId).toBe(parentTweetId);
        });
    });

    describe('PUT /api/tweets/tweet/:id', () => {
        let tweetId;

        beforeEach(async () => {
            const tweet = await prisma.tweet.create({
                data: {
                    content: 'Tweet to update',
                    authorId: userId
                }
            });
            tweetId = tweet.id;
        });

        afterEach(async () => {
            await prisma.tweet.deleteMany({
                where: { id: tweetId }
            });
        });

        it('should return 401 when not authenticated', async () => {
            const res = await request(app)
                .put(`/api/tweets/tweet/${tweetId}`)
                .field('content', 'Updated content');
            expect(res.status).toBe(401);
        });

        it('should return 400 for invalid content length', async () => {
            const agent = request.agent(app);
            await agent
                .post("/api/users/login")
                .send({ identifier: user.username, password: user.password });

            const res = await agent
                .put(`/api/tweets/tweet/${tweetId}`)
                .field('content', '');
            expect(res.status).toBe(400);
        });

        it('should return 404 when tweet does not exist', async () => {
            const agent = request.agent(app);
            await agent
                .post("/api/users/login")
                .send({ identifier: user.username, password: user.password });
            const res = await agent
                .put("/api/tweets/tweet/nonexistent-id")
                .field('content', 'Updated content');
            expect(res.status).toBe(404);
            expect(res.body.error).toBe("Tweet not found");
        });

        it('should return 200 and update tweet successfully', async () => {
            const agent = request.agent(app);
            await agent
                .post("/api/users/login")
                .send({ identifier: user.username, password: user.password });

            const res = await agent
                .put(`/api/tweets/tweet/${tweetId}`)
                .field('content', 'Updated tweet content');
            expect(res.status).toBe(200);
            expect(res.body.tweet.content).toBe('Updated tweet content');
        });

        it('should return 403 when trying to update another user\'s tweet', async () => {
            // Create another user
            const user2 = {
                username: "tweetuser2",
                email: "tweet2@example.com",
                password: "password123"
            };
            const passwordHash2 = bcrypt.hashSync(user2.password, 10);
            await prisma.user.create({
                data: {
                    username: user2.username,
                    passwordHash: passwordHash2,
                    email: user2.email,
                    profile: { create: {} }
                }
            });

            const agent = request.agent(app);
            await agent
                .post("/api/users/login")
                .send({ identifier: user2.username, password: user2.password });

            const res = await agent
                .put(`/api/tweets/tweet/${tweetId}`)
                .field('content', 'Trying to update');
            expect(res.status).toBe(403);
            expect(res.body.error).toBe("Unauthorized to edit this tweet");

            await prisma.user.deleteMany({
                where: { username: user2.username }
            });
        });
    });

    describe('DELETE /api/tweets/tweet/:id', () => {
        let tweetId;

        beforeEach(async () => {
            const tweet = await prisma.tweet.create({
                data: {
                    content: 'Tweet to delete',
                    authorId: userId
                }
            });
            tweetId = tweet.id;
        });

        it('should return 401 when not authenticated', async () => {
            const res = await request(app).delete(`/api/tweets/tweet/${tweetId}`);
            expect(res.status).toBe(401);
        });

        it('should return 404 when tweet does not exist', async () => {
            const agent = request.agent(app);
            await agent
                .post("/api/users/login")
                .send({ identifier: user.username, password: user.password });

            const res = await agent.delete("/api/tweets/tweet/nonexistent-id");
            expect(res.status).toBe(404);
            expect(res.body.error).toBe("Tweet not found");
        });

        it('should return 200 and delete tweet successfully', async () => {
            const agent = request.agent(app);
            await agent
                .post("/api/users/login")
                .send({ identifier: user.username, password: user.password });

            const res = await agent.delete(`/api/tweets/tweet/${tweetId}`);
            expect(res.status).toBe(200);
            expect(res.body.message).toBe("Tweet deleted successfully");
        });

        it('should return 403 when trying to delete another user\'s tweet', async () => {
            // Create another user
            const user2 = {
                username: "tweetuser3",
                email: "tweet3@example.com",
                password: "password123"
            };
            const passwordHash2 = bcrypt.hashSync(user2.password, 10);
            await prisma.user.create({
                data: {
                    username: user2.username,
                    passwordHash: passwordHash2,
                    email: user2.email,
                    profile: { create: {} }
                }
            });

            const agent = request.agent(app);
            await agent
                .post("/api/users/login")
                .send({ identifier: user2.username, password: user2.password });

            const res = await agent.delete(`/api/tweets/tweet/${tweetId}`);
            expect(res.status).toBe(403);
            expect(res.body.error).toBe("Unauthorized to delete this tweet");

            await prisma.user.deleteMany({
                where: { username: user2.username }
            });
        });
    });
});
