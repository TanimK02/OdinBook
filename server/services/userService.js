import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import prisma from '../config/prisma.js'
import { supabase } from "../config/supabase.js";

export const registerUser = async (email, password, username) => {
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
        return { userId: user.id, token }
    } catch (err) {
        console.error(err);
        if (err.code === 'P2002') { // Unique constraint failed
            throw new Error('Email or username already exists');
        }
        throw (err)
    }

}

export const loginUser = async (identifier, password) => {

    try {
        const user = await prisma.user.findFirst({
            where: {
                OR: [
                    { email: identifier },
                    { username: identifier }
                ]
            }
        });

        const isPasswordValid = bcrypt.compareSync(password, user.passwordHash);
        if (!user || !isPasswordValid) {
            throw new Error("Invalid credentials")
        }

        const token = jwt.sign({ id: user.id, username: user.username }, process.env.JWT_SECRET || "secretkey", { expiresIn: '1d' });
        return { userId: user.id, token }

    } catch (err) {
        throw (err)
    }
}

export const getUser = async (id) => {
    try {
        const user = await prisma.user.findUnique({
            where: { id },
            select: {
                id: true,
                username: true,
                email: true
            }
        });
        if (!user) {
            throw new Error("User not found")
        }
        return user
    } catch (err) {
        console.error(err);
        throw (err)
    }
}

export const getUserInfo = async (id) => {
    try {
        const user = await prisma.user.findUnique({
            where: { id },
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
            throw new Error("User not found")
        }
        return user
    } catch (err) {
        console.error(err);
        throw (err)
    }
}

export const uploadProfilePic = async (avatarFile) => {
    try {
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
        return data.publicUrl
    }
    catch (error) {
        throw (error)
    }
}

export const getProfile = async (userId) => {
    try {
        const profile = await prisma.profile.findUnique({
            where: { userId }
        });
        return profile
    }
    catch (error) {
        throw (error)
    }
}

export const updateProfile = async (userId, updateData) => {
    try {
        const updatedProfile = await prisma.profile.update({
            where: { userId },
            data: updateData
        });
        return updatedProfile
    }
    catch (error) {
        throw (error)
    }
}

export const createProfile = async (userId, bio, avatarUrl) => {
    try {
        const newProfile = await prisma.profile.create({
            data: {
                bio,
                avatarUrl: avatarUrl || null,
                user: { connect: { id: userId } }
            }
        });
        return newProfile
    }
    catch (error) {
        throw (error)
    }
}

export const comparePassword = (oldPassword, passwordHash) => {
    return bcrypt.compareSync(oldPassword, passwordHash);
}

export const updatePassword = async (userId, newPassword) => {
    const newHashedPassword = bcrypt.hashSync(newPassword, 10);
    try {
        await prisma.user.update({
            where: { id: userId },
            data: { passwordHash: newHashedPassword }
        });
    }
    catch (error) {
        throw (error)
    }
}

export const updateEmail = async (userId, newEmail) => {
    try {
        await prisma.user.update({
            where: { id: userId },
            data: { email: newEmail }
        });
    }
    catch (error) {
        throw (error)
    }
}

export const updateUsername = async (userId, newUsername) => {
    try {
        await prisma.user.update({
            where: { id: userId },
            data: { username: newUsername }
        });
    }
    catch (error) {
        throw (error)
    }
}

export const deleteAccount = async (userId) => {
    try {
        await prisma.user.delete({
            where: { id: userId }
        });
    }
    catch (error) {
        throw (error)
    }
}
