import { Router } from "express";
import { body } from "express-validator";
import prisma from "../config/prisma.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { validationResult } from "express-validator";
import passport from "passport";
import { uploadMiddleware } from "./uploadController.js";
import { supabase } from "../config/supabase.js";
const requireJwt = passport.authenticate("jwt", { session: false });
const userRouter = Router();

userRouter.get("/", (req, res) => {
    res.send("User route");
});

userRouter.post("/register", [body("email").isEmail(),
body("password").isLength({ min: 6 }),
body("username").isLength({ min: 3 })
], async (req, res) => {

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { email, password, username } = req.body;
    const passwordHash = bcrypt.hashSync(password, 10);

    try {
        const user = await prisma.user.create({
            data: {
                email,
                username,
                passwordHash,
                profile: { create: {} }
            }
        });
        const token = jwt.sign({ id: user.id, username: user.username }, process.env.JWT_SECRET || "secretkey", { expiresIn: '1d' });
        res.status(201).json({ message: "User registered successfully", userId: user.id, token });
    } catch (err) {
        console.error(err);
        if (err.code === 'P2002') { // Unique constraint failed
            return res.status(400).json({ error: "Email or username already exists" });
        }
        res.status(500).json({ error: "Internal server error" });
    }
});

userRouter.post("/login", [body("identifier").not().isEmpty(),
body("password").not().isEmpty()], async (req, res) => {

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { identifier, password } = req.body;

    try {
        const user = await prisma.user.findFirst({
            where: {
                OR: [
                    { email: identifier },
                    { username: identifier }
                ]
            }
        });

        if (!user) {
            return res.status(400).json({ error: "Invalid credentials" });
        }

        const isPasswordValid = bcrypt.compareSync(password, user.passwordHash);
        if (!isPasswordValid) {
            return res.status(400).json({ error: "Invalid credentials" });
        }

        const token = jwt.sign({ id: user.id, username: user.username }, process.env.JWT_SECRET || "secretkey", { expiresIn: '1d' });
        res.status(200).json({ message: "Login successful", userId: user.id, token });

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Internal server error" });
    }
});

userRouter.get("/userinfo", requireJwt, async (req, res) => {
    try {
        const user = await prisma.user.findUnique({
            where: { id: req.user.id },
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
        });

        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        res.status(200).json({ user });

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Internal server error" });
    }
});

userRouter.post("/profile", requireJwt, uploadMiddleware, async (req, res) => {
    const { bio } = req.body;
    const avatarFile = req.files && req.files['avatar'] ? req.files['avatar'][0] : null;

    try {
        let avatarUrl = null;

        // Upload avatar to Supabase if provided
        if (avatarFile) {
            const filePath = `avatars/${req.user.id}_${Date.now()}_${avatarFile.originalname}`;
            await supabase
                .storage
                .from('tweet-images')
                .upload(filePath, avatarFile.buffer, {
                    cacheControl: '3600',
                    upsert: true,
                    contentType: avatarFile.mimetype
                });
            const { data } = supabase
                .storage
                .from('tweet-images')
                .getPublicUrl(filePath);
            avatarUrl = data.publicUrl;
        }

        const existingProfile = await prisma.profile.findUnique({
            where: { userId: req.user.id }
        });

        if (existingProfile) {
            const updateData = { bio };
            if (avatarUrl) updateData.avatarUrl = avatarUrl;

            const updatedProfile = await prisma.profile.update({
                where: { userId: req.user.id },
                data: updateData
            });
            return res.status(200).json({ message: "Profile updated", profile: updatedProfile });
        }
        else {
            const newProfile = await prisma.profile.create({
                data: {
                    bio,
                    avatarUrl: avatarUrl || null,
                    user: { connect: { id: req.user.id } }
                }
            });
            return res.status(201).json({ message: "Profile created", profile: newProfile });
        }
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Internal server error" });
    }
});

userRouter.get("/profile", requireJwt, async (req, res) => {
    try {
        const profile = await prisma.profile.findUnique({
            where: { userId: req.user.id }
        });

        if (!profile) {
            return res.status(404).json({ error: "Profile not found" });
        }

        res.status(200).json({ profile });

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Internal server error" });
    }
});

userRouter.put("/change-password", requireJwt, [body("oldPassword").not().isEmpty(),
body("newPassword").isLength({ min: 6 })], async (req, res) => {

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { oldPassword, newPassword } = req.body;

    try {
        const user = await prisma.user.findUnique({
            where: { id: req.user.id }
        });

        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        const isOldPasswordValid = bcrypt.compareSync(oldPassword, user.passwordHash);
        if (!isOldPasswordValid) {
            return res.status(400).json({ error: "Old password is incorrect" });
        }

        const newHashedPassword = bcrypt.hashSync(newPassword, 10);
        await prisma.user.update({
            where: { id: req.user.id },
            data: { passwordHash: newHashedPassword }
        });

        res.status(200).json({ message: "Password changed successfully" });

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Internal server error" });
    }
});

userRouter.put("/update-email", requireJwt, [body("newEmail").isEmail()], async (req, res) => {

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { newEmail } = req.body;

    try {
        await prisma.user.update({
            where: { id: req.user.id },
            data: { email: newEmail }
        });

        res.status(200).json({ message: "Email updated successfully" });

    } catch (err) {
        console.error(err);
        if (err.code === 'P2002') { // Unique constraint failed
            return res.status(400).json({ error: "Email already in use" });
        }
        res.status(500).json({ error: "Internal server error" });
    }
});

userRouter.put("/update-username", requireJwt, [body("newUsername").isLength({ min: 3 })], async (req, res) => {

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { newUsername } = req.body;

    try {
        await prisma.user.update({
            where: { id: req.user.id },
            data: { username: newUsername }
        });

        res.status(200).json({ message: "Username updated successfully" });

    } catch (err) {
        console.error(err);
        if (err.code === 'P2002') { // Unique constraint failed
            return res.status(400).json({ error: "Username already in use" });
        }
        res.status(500).json({ error: "Internal server error" });
    }
});

userRouter.delete("/delete-account", requireJwt, async (req, res) => {
    try {
        await prisma.user.delete({
            where: { id: req.user.id }
        });

        res.status(200).json({ message: "Account deleted successfully" });

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Internal server error" });
    }
});

export { userRouter };


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
//   id        String    @id @default(cuid())
//   content   String
//   author    User      @relation(fields: [authorId], references: [id], onDelete: Cascade)
//   authorId  String
//   images    Img[]
//   likes     Like[]
//   retweets  Retweet[]
//   createdAt DateTime  @default(now())
//   updatedAt DateTime  @updatedAt

//   @@index([authorId, createdAt])
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
