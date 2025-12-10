import app from '../index.js';
import request from 'supertest';
import prisma from "../config/prisma.js"
import bcrypt from 'bcryptjs';

describe('User Routes', () => {
    // Helper function to create authenticated agent
    const createAuthenticatedAgent = async (username, password) => {
        const agent = request.agent(app);
        await agent
            .post("/api/users/login")
            .send({ identifier: username, password })
            .set("Content-Type", "application/json");
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

    // Helper function to cleanup test users
    const cleanupUsers = async (...usernames) => {
        await prisma.user.deleteMany({
            where: {
                username: { in: usernames }
            }
        });
    };

    describe('GET /api/users', () => {
        it('should respond with user route', async () => {
            const res = await request(app).get('/api/users');
            expect(res.statusCode).toBe(200);
            expect(res.text).toBe('User route');
        });
    });

    describe('POST /api/users/register', () => {
        const testUsername = "testuser";

        beforeEach(async () => {
            await cleanupUsers(testUsername);
        });

        afterAll(async () => {
            await cleanupUsers(testUsername);
        });

        it('should return 400 for validation errors - invalid email', async () => {
            const payload = {
                email: "invalidemail",
                password: "password123",
                username: "testuser"
            };
            const res = await request(app)
                .post("/api/users/register")
                .send(payload)
                .set("Content-Type", "application/json");
            expect(res.status).toBe(400);
        });

        it('should return 400 for validation errors - short password', async () => {
            const payload = {
                email: "test@example.com",
                password: "short",
                username: "testuser"
            };
            const res = await request(app)
                .post("/api/users/register")
                .send(payload)
                .set("Content-Type", "application/json");
            expect(res.status).toBe(400);
        });

        it('should return 400 for validation errors - short username', async () => {
            const payload = {
                email: "test@example.com",
                password: "password123",
                username: "te"
            };
            const res = await request(app)
                .post("/api/users/register")
                .send(payload)
                .set("Content-Type", "application/json");
            expect(res.status).toBe(400);
        });

        it('should return 201 and register user successfully', async () => {
            const payload = {
                username: "testuser",
                email: "test@example.com",
                password: "password123"
            };
            const res = await request(app)
                .post("/api/users/register")
                .send(payload)
                .set("Content-Type", "application/json");
            expect(res.status).toBe(201);
            expect(res.body.message).toBe("User registered successfully");
            expect(res.body.userId).toBeDefined();
        });

        it('should return 400 for duplicate username', async () => {
            const payload = {
                username: "testuser",
                email: "test@example.com",
                password: "password123"
            };
            await request(app)
                .post("/api/users/register")
                .send(payload)
                .set("Content-Type", "application/json");

            const payload2 = {
                username: "testuser",
                email: "another@example.com",
                password: "password123"
            };
            const res = await request(app)
                .post("/api/users/register")
                .send(payload2)
                .set("Content-Type", "application/json");
            expect(res.status).toBe(400);
            expect(res.body.error).toBe("Email or username already exists");
        });

        it('should return 400 for duplicate email', async () => {
            const payload = {
                username: "testuser",
                email: "test@example.com",
                password: "password123"
            };
            await request(app)
                .post("/api/users/register")
                .send(payload)
                .set("Content-Type", "application/json");

            const payload2 = {
                username: "anotheruser",
                email: "test@example.com",
                password: "password123"
            };
            const res = await request(app)
                .post("/api/users/register")
                .send(payload2)
                .set("Content-Type", "application/json");
            expect(res.status).toBe(400);
            expect(res.body.error).toBe("Email or username already exists");
        });
    });

    describe('POST /api/users/login', () => {
        const user = {
            username: "loginuser",
            email: "login@example.com",
            password: "password123"
        };

        beforeEach(async () => {
            await cleanupUsers(user.username);
            await createTestUser(user.username, user.email, user.password);
        });

        afterAll(async () => {
            await cleanupUsers(user.username);
        });

        it('should return 400 for missing fields', async () => {
            const res = await request(app)
                .post("/api/users/login")
                .send({ identifier: user.username })
                .set("Content-Type", "application/json");
            expect(res.status).toBe(400);
        });

        it('should return 400 for invalid credentials - wrong username', async () => {
            const res = await request(app)
                .post("/api/users/login")
                .send({ identifier: "wronguser", password: user.password })
                .set("Content-Type", "application/json");
            expect(res.status).toBe(400);
        });

        it('should return 400 for invalid credentials - wrong password', async () => {
            const res = await request(app)
                .post("/api/users/login")
                .send({ identifier: user.username, password: "wrongpassword" })
                .set("Content-Type", "application/json");
            expect(res.status).toBe(400);
        });

        it('should return 200 and login with username', async () => {
            const res = await request(app)
                .post("/api/users/login")
                .send({ identifier: user.username, password: user.password })
                .set("Content-Type", "application/json");
            expect(res.status).toBe(200);
            expect(res.body.message).toBe("Login successful");
            expect(res.body.userId).toBeDefined();
        });

        it('should return 200 and login with email', async () => {
            const res = await request(app)
                .post("/api/users/login")
                .send({ identifier: user.email, password: user.password })
                .set("Content-Type", "application/json");
            expect(res.status).toBe(200);
            expect(res.body.message).toBe("Login successful");
            expect(res.body.userId).toBeDefined();
        });
    });

    describe('POST /api/users/logout', () => {
        const user = {
            username: "logoutuser",
            email: "logout@example.com",
            password: "password123"
        };

        beforeEach(async () => {
            await cleanupUsers(user.username);
            await createTestUser(user.username, user.email, user.password);
        });

        afterAll(async () => {
            await cleanupUsers(user.username);
        });

        it('should return 401 when not logged in', async () => {
            const res = await request(app).post("/api/users/logout");
            expect(res.status).toBe(401);
        });

        it('should return 200 and logout successfully', async () => {
            const agent = await createAuthenticatedAgent(user.username, user.password);
            const res = await agent.post("/api/users/logout");
            expect(res.status).toBe(200);
            expect(res.body.message).toBe("Logout successful");
        });
    });

    describe('GET /api/users/userinfo', () => {
        const user = {
            username: "infouser",
            email: "info@example.com",
            password: "password123"
        };

        beforeEach(async () => {
            await cleanupUsers(user.username);
            await createTestUser(user.username, user.email, user.password);
        });

        afterAll(async () => {
            await cleanupUsers(user.username);
        });

        it('should return 401 when not authenticated', async () => {
            const res = await request(app).get("/api/users/userinfo");
            expect(res.status).toBe(401);
        });

        it('should return 200 with user info when authenticated', async () => {
            const agent = await createAuthenticatedAgent(user.username, user.password);
            const res = await agent.get("/api/users/userinfo");
            expect(res.status).toBe(200);
            expect(res.body.user.username).toBe(user.username);
            expect(res.body.user.email).toBe(user.email);
            expect(res.body.user.profile).toBeDefined();
        });
    });

    describe('POST /api/users/profile', () => {
        const user = {
            username: "profileuser",
            email: "profile@example.com",
            password: "password123"
        };

        beforeEach(async () => {
            await cleanupUsers(user.username);
            await createTestUser(user.username, user.email, user.password);
        });

        afterAll(async () => {
            await cleanupUsers(user.username);
        });

        it('should return 401 when not authenticated', async () => {
            const res = await request(app)
                .post("/api/users/profile")
                .field('bio', 'Test bio');
            expect(res.status).toBe(401);
        });

        it('should return 200 and update profile', async () => {
            const agent = await createAuthenticatedAgent(user.username, user.password);
            const res = await agent
                .post("/api/users/profile")
                .field('bio', 'Updated bio');
            expect(res.status).toBe(200);
            expect(res.body.message).toBe("Profile updated");
            expect(res.body.profile.bio).toBe("Updated bio");
        });
    });

    describe('GET /api/users/profile', () => {
        const user = {
            username: "getprofileuser",
            email: "getprofile@example.com",
            password: "password123"
        };

        beforeEach(async () => {
            await cleanupUsers(user.username);
            const passwordHash = bcrypt.hashSync(user.password, 10);
            await prisma.user.create({
                data: {
                    username: user.username,
                    passwordHash,
                    email: user.email,
                    profile: { create: { bio: "Test bio" } }
                }
            });
        });

        afterAll(async () => {
            await cleanupUsers(user.username);
        });

        it('should return 401 when not authenticated', async () => {
            const res = await request(app).get("/api/users/profile");
            expect(res.status).toBe(401);
        });

        it('should return 200 with profile data', async () => {
            const agent = await createAuthenticatedAgent(user.username, user.password);
            const res = await agent.get("/api/users/profile");
            expect(res.status).toBe(200);
            expect(res.body.profile.bio).toBe("Test bio");
        });
    });

    describe('PUT /api/users/change-password', () => {
        const user = {
            username: "changepassuser",
            email: "changepass@example.com",
            password: "password123"
        };

        beforeEach(async () => {
            await cleanupUsers(user.username);
            await createTestUser(user.username, user.email, user.password);
        });

        afterAll(async () => {
            await cleanupUsers(user.username);
        });

        it('should return 401 when not authenticated', async () => {
            const res = await request(app)
                .put("/api/users/change-password")
                .send({ oldPassword: user.password, newPassword: "newpassword123" })
                .set("Content-Type", "application/json");
            expect(res.status).toBe(401);
        });

        it('should return 400 for validation errors - short password', async () => {
            const agent = await createAuthenticatedAgent(user.username, user.password);
            const res = await agent
                .put("/api/users/change-password")
                .send({ oldPassword: user.password, newPassword: "short" })
                .set("Content-Type", "application/json");
            expect(res.status).toBe(400);
        });

        it('should return 400 for incorrect old password', async () => {
            const agent = await createAuthenticatedAgent(user.username, user.password);
            const res = await agent
                .put("/api/users/change-password")
                .send({ oldPassword: "wrongpassword", newPassword: "newpassword123" })
                .set("Content-Type", "application/json");
            expect(res.status).toBe(400);
            expect(res.body.error).toBe("Old password is incorrect");
        });

        it('should return 200 and change password successfully', async () => {
            const agent = await createAuthenticatedAgent(user.username, user.password);
            const res = await agent
                .put("/api/users/change-password")
                .send({ oldPassword: user.password, newPassword: "newpassword123" })
                .set("Content-Type", "application/json");
            expect(res.status).toBe(200);
            expect(res.body.message).toBe("Password changed successfully");
        });
    });

    describe('PUT /api/users/update-email', () => {
        const user1 = {
            username: "emailuser1",
            email: "email1@example.com",
            password: "password123"
        };
        const user2 = {
            username: "emailuser2",
            email: "email2@example.com",
            password: "password123"
        };

        beforeEach(async () => {
            await cleanupUsers(user1.username, user2.username);
            await createTestUser(user1.username, user1.email, user1.password);
            await createTestUser(user2.username, user2.email, user2.password);
        });

        afterAll(async () => {
            await cleanupUsers(user1.username, user2.username);
        });

        it('should return 401 when not authenticated', async () => {
            const res = await request(app)
                .put("/api/users/update-email")
                .send({ newEmail: "newemail@example.com" })
                .set("Content-Type", "application/json");
            expect(res.status).toBe(401);
        });

        it('should return 400 for invalid email format', async () => {
            const agent = await createAuthenticatedAgent(user1.username, user1.password);
            const res = await agent
                .put("/api/users/update-email")
                .send({ newEmail: "invalidemail" })
                .set("Content-Type", "application/json");
            expect(res.status).toBe(400);
        });

        it('should return 400 for duplicate email', async () => {
            const agent = await createAuthenticatedAgent(user1.username, user1.password);
            const res = await agent
                .put("/api/users/update-email")
                .send({ newEmail: user2.email })
                .set("Content-Type", "application/json");
            expect(res.status).toBe(400);
            expect(res.body.error).toBe("Email already in use");
        });

        it('should return 200 and update email successfully', async () => {
            const agent = await createAuthenticatedAgent(user1.username, user1.password);
            const res = await agent
                .put("/api/users/update-email")
                .send({ newEmail: "newemail@example.com" })
                .set("Content-Type", "application/json");
            expect(res.status).toBe(200);
            expect(res.body.message).toBe("Email updated successfully");
        });
    });

    describe('PUT /api/users/update-username', () => {
        const user1 = {
            username: "usernameuser1",
            email: "username1@example.com",
            password: "password123"
        };
        const user2 = {
            username: "usernameuser2",
            email: "username2@example.com",
            password: "password123"
        };

        beforeEach(async () => {
            // Delete ALL users to prevent conflicts from previous test suites
            await prisma.user.deleteMany({});
            await createTestUser(user1.username, user1.email, user1.password);
            await createTestUser(user2.username, user2.email, user2.password);
        });

        afterAll(async () => {
            await cleanupUsers(user1.username, user2.username);
        }); it('should return 401 when not authenticated', async () => {
            const res = await request(app)
                .put("/api/users/update-username")
                .send({ newUsername: "newusername" })
                .set("Content-Type", "application/json");
            expect(res.status).toBe(401);
        });

        it('should return 400 for short username', async () => {
            const agent = await createAuthenticatedAgent(user1.username, user1.password);
            const res = await agent
                .put("/api/users/update-username")
                .send({ newUsername: "ab" })
                .set("Content-Type", "application/json");
            expect(res.status).toBe(400);
        });

        it('should return 400 for duplicate username', async () => {
            const agent = await createAuthenticatedAgent(user1.username, user1.password);
            const res = await agent
                .put("/api/users/update-username")
                .send({ newUsername: user2.username })
                .set("Content-Type", "application/json");
            expect(res.status).toBe(400);
            expect(res.body.error).toBe("Username already in use");
        });

        it('should return 200 and update username successfully', async () => {
            const agent = await createAuthenticatedAgent(user1.username, user1.password);
            const res = await agent
                .put("/api/users/update-username")
                .send({ newUsername: "newusername123" })
                .set("Content-Type", "application/json");
            expect(res.status).toBe(200);
            expect(res.body.message).toBe("Username updated successfully");
        });
    });

    describe('DELETE /api/users/delete-account', () => {
        const user = {
            username: "deleteuser",
            email: "delete@example.com",
            password: "password123"
        };

        beforeEach(async () => {
            await cleanupUsers(user.username);
            await createTestUser(user.username, user.email, user.password);
        });

        afterAll(async () => {
            await cleanupUsers(user.username);
        });

        it('should return 401 when not authenticated', async () => {
            const res = await request(app).delete("/api/users/delete-account");
            expect(res.status).toBe(401);
        });

        it('should return 200 and delete account successfully', async () => {
            const agent = await createAuthenticatedAgent(user.username, user.password);
            const res = await agent.delete("/api/users/delete-account");
            expect(res.status).toBe(200);
            expect(res.body.message).toBe("Account deleted successfully");
        });
    });
});

