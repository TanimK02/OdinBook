import { comparePassword, createProfile, deleteAccount, getProfile, getUser, getUserInfo, loginUser, registerUser, updateEmail, updatePassword, updateProfile, updateUsername, uploadProfilePic } from "../services/userService.js";

export const register = async (req, res) => {

    const { email, password, username } = req.body;
    try {
        const { userId, token } = await registerUser(email, password, username)
        res.status(201).json({ message: "User registered successfully", userId, token });
    } catch (err) {
        console.error(err);
        if (err.code === 'P2002') { // Unique constraint failed
            return res.status(400).json({ error: "Email or username already exists" });
        }
        res.status(500).json({ error: "Internal server error" });
    }
}

export const login = async (req, res) => {
    const { identifier, password } = req.body;

    try {
        const { userId, token } = await loginUser(identifier, password);
        res.status(200).json({ message: "Login successful", userId, token });

    } catch (err) {
        console.error(err);
        if (err.message = "Invalid credentials") {
            return res.status(400).json({ error: "Invalid credentials" });
        }
        res.status(500).json({ error: "Internal server error" });
    }
}

export const userInfo = async (req, res) => {
    try {
        const user = await getUserInfo(req.user.id)
        res.status(200).json({ user });

    } catch (err) {
        console.error(err);
        if (err.message == "User not found") {
            return res.status(404).json({ error: "User not found" });
        }
        res.status(500).json({ error: "Internal server error" });
    }
}

export const postProfile = async (req, res) => {
    const { bio } = req.body;
    const avatarFile = req.files && req.files['avatar'] ? req.files['avatar'][0] : null;

    try {
        let avatarUrl = null;

        if (avatarFile) {
            avatarUrl = await uploadProfilePic(avatarFile);
        }

        const existingProfile = await getProfile(req.user.id);

        if (existingProfile) {
            const updateData = { bio };
            if (avatarUrl) updateData.avatarUrl = avatarUrl;

            const updatedProfile = await updateProfile(req.user.id, updateData);
            return res.status(200).json({ message: "Profile updated", profile: updatedProfile });
        }
        else {
            const newProfile = await createProfile(req.user.id, bio, avatarUrl)
            return res.status(201).json({ message: "Profile created", profile: newProfile });
        }
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Internal server error" });
    }
}

export const getProfileController = async (req, res) => {
    try {
        const profile = await getProfile(req.user.id);

        if (!profile) {
            return res.status(404).json({ error: "Profile not found" });
        }

        res.status(200).json({ profile });

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Internal server error" });
    }
}

export const changePassword = async (req, res) => {
    const { oldPassword, newPassword } = req.body;
    try {
        const user = await getUser(req.user.id)
        const isOldPasswordValid = comparePassword(oldPassword, user.passwordHash);
        if (!isOldPasswordValid) {
            return res.status(400).json({ error: "Old password is incorrect" });
        }
        await updatePassword(req.user.id, newPassword)
        res.status(200).json({ message: "Password changed successfully" });

    } catch (err) {
        console.error(err);
        if (err.message == "User not found") {
            return res.status(404).json({ error: "User not found" });
        }
        res.status(500).json({ error: "Internal server error" });
    }
}

export const updateEmailController = async (req, res) => {
    const { newEmail } = req.body;

    try {
        await updateEmail(req.user.id, newEmail);
        res.status(200).json({ message: "Email updated successfully" });

    } catch (err) {
        console.error(err);
        if (err.code === 'P2002') {
            return res.status(400).json({ error: "Email already in use" });
        }
        res.status(500).json({ error: "Internal server error" });
    }
}

export const updateUsernameController = async (req, res) => {
    const { newUsername } = req.body;

    try {
        await updateUsername(req.user.id, newUsername);
        res.status(200).json({ message: "Username updated successfully" });

    } catch (err) {
        console.error(err);
        if (err.code === 'P2002') {
            return res.status(400).json({ error: "Username already in use" });
        }
        res.status(500).json({ error: "Internal server error" });
    }
}

export const deleteAccountController = async (req, res) => {
    try {
        await deleteAccount(req.user.id);
        res.status(200).json({ message: "Account deleted successfully" });

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Internal server error" });
    }
}