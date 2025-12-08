import app from '../index.js';
import request from 'supertest';
import prisma from "../config/prisma.js"
import bcrypt from 'bcryptjs';
describe('test server', () => {
    it('should respond with user route', async () => {
        const res = await request(app).get('/api/users');
        expect(res.statusCode).toBe(200);
    });
});

describe('user routes', () => {
    describe('register route', () => {
        beforeEach(async () => {
            await prisma.user.deleteMany({
                where: {
                    username: "canteen46"
                }
            }
            )
        })
        afterAll(async () => {
            await prisma.user.deleteMany({
                where: {
                    username: "canteen46"
                }
            }
            )
        })
        it('returns an error for failing validation', async () => {
            const payload = {
                email: "bombo",
                password: "asd",
                username: "can"
            }
            const res = await request(app)
                .post("/api/users/register")
                .send(payload).set("Content-Type", "application/json")
            expect(res.status).toBe(400)
        });

        it('returns a 201 status code along with a message', async () => {
            const payload = {
                username: "canteen46",
                email: "bombo@example.com",
                password: "password123"
            }
            const res = await request(app)
                .post("/api/users/register")
                .send(payload).set("Content-Type", "application/json")
            expect(res.status).toBe(201)
            expect(res.body.message).toBe("User registered successfully")
        })
    })

    describe("user info", () => {

        const user = {
            username: "canteen46",
            email: "bombo@example.com",
            password: "password123"
        }
        const passwordHash = bcrypt.hashSync(user.password, 10);

        beforeEach(async () => {
            await prisma.user.deleteMany({
                where: {
                    username: "canteen46"
                }
            })
            await prisma.user.create({
                data: {
                    username: user.username,
                    passwordHash,
                    email: user.email
                }
            })
        })
        afterAll(async () => {
            await prisma.user.deleteMany({
                where: {
                    username: "canteen46"
                }
            })
        })

        it("returns valid user info witha 200 response", async () => {
            const tokenRes = await request(app)
                .post("/api/users/login")
                .send({ identifier: user.username, password: user.password })
                .set("Content-Type", "application/json")
            const token = tokenRes.body.token;

            const res = await request(app).get("/api/users/userinfo")
                .set("Authorization", `Bearer ${token}`);
            expect(res.status).toBe(200);
            expect(res.body.user.username).toBe("canteen46")
        })
    });

    describe("update email route", () => {
        const user = {
            username: "canteen46",
            email: "bombo@example.com",
            password: "password123"
        }
        const user2 = {
            username: "canteen47",
            email: "canteen47@example.com",
            password: "password123"
        }
        const passwordHash = bcrypt.hashSync(user.password, 10);
        const passwordHash2 = bcrypt.hashSync(user2.password, 10)
        beforeEach(async () => {
            await prisma.user.deleteMany({
                where: {
                    username: { in: ["canteen46", "canteen47"] }
                }
            })
            await prisma.user.create({
                data: {
                    username: user.username,
                    passwordHash,
                    email: user.email
                }
            })
            await prisma.user.create({
                data: {
                    username: user2.username,
                    passwordHash: passwordHash2,
                    email: user2.email
                }
            })
        })
        let token;
        let token2;
        beforeEach(async () => {
            const tokenRes = await request(app)
                .post("/api/users/login")
                .send({ identifier: user.username, password: user.password })
                .set("Content-Type", "application/json")
            token = tokenRes.body.token;
            const tokenRes2 = await request(app)
                .post("/api/users/login")
                .send({ identifier: user2.username, password: user2.password })
                .set("Content-Type", "application/json")
            token2 = tokenRes2.body.token;
        })
        afterAll(async () => {
            await prisma.user.deleteMany({
                where: {
                    username: { in: ["canteen46", "canteen47"] }
                }
            })
        });
        it('returns a 401 status code', async () => {
            const res = await request(app).put("/api/users/update-email")
                .send({ newEmail: "canteen46@example.com" })
                .set("Content-Type", "application/json")
            expect(res.status).toBe(401)
        });
        it('returns a 400', async () => {
            const res = await request(app).put("/api/users/update-email")
                .send({ newEmail: "canteen47@example.com" })
                .set("Content-Type", "application/json")
                .set("Authorization", `Bearer ${token}`);
            expect(res.status).toBe(400);
            const res2 = await request(app).put("/api/users/update-email")
                .send({ newEmail: "canteen" })
                .set("Content-Type", "application/json")
                .set("Authorization", `Bearer ${token}`);
            expect(res.status).toBe(400);
        });
        it('returns a 200 with a message of success', async () => {
            const res = await request(app).put("/api/users/update-email")
                .send({ newEmail: "canteen46@example.com" })
                .set("Content-Type", "application/json")
                .set("Authorization", `Bearer ${token}`);
            expect(res.status).toBe(200);
            expect(res.body.message).toBe('Email updated successfully')
        })
    });
    describe('user delete route', () => {
        const user = {
            username: "canteen46",
            email: "bombo@example.com",
            password: "password123"
        }
        const passwordHash = bcrypt.hashSync(user.password, 10);

        beforeEach(async () => {
            await prisma.user.deleteMany({
                where: {
                    username: "canteen46"
                }
            })
            await prisma.user.create({
                data: {
                    username: user.username,
                    passwordHash,
                    email: user.email
                }
            })
        })
        afterAll(async () => {
            await prisma.user.deleteMany({
                where: {
                    username: "canteen46"
                }
            })
        })
        let token;
        beforeEach(async () => {
            const tokenRes = await request(app)
                .post("/api/users/login")
                .send({ identifier: user.username, password: user.password })
                .set("Content-Type", "application/json")
            token = tokenRes.body.token;
        })
        afterAll(async () => {
            await prisma.user.deleteMany({
                where: {
                    username: { in: ["canteen46"] }
                }
            })
        });
        it('returns a 401 status code', async () => {
            const res = await request(app).delete("/api/users/delete-account")
            expect(res.status).toBe(401)
        });
        it('returns a 200', async () => {
            const res = await request(app).delete("/api/users/delete-account")
                .set("Authorization", `Bearer ${token}`)
            expect(res.status).toBe(200)
            expect(res.body.message).toBe("Account deleted successfully")
        })
    })
})


// ### 10. DELETE `/api/users/delete-account`
// - **Auth Required:** Yes (JWT)
// - **Input:** None (user ID from JWT)
// - **Success Response (200):**
//   ```json
//   {
//     "message": "Account deleted successfully"
//   }
//   ```
// - **Error Cases:**
//   - 401: Unauthorized
//   - 500: Internal server error

// ---
