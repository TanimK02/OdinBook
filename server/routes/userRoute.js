import { Router } from "express";
import { requireAuth } from "../middleware/authentication.js";
import { uploadMiddleware } from "../middleware/uploadController.js";
import { loginValidation, passwordChangeValidation, registerValidation, updateEmailValidation, updateUsernameValidation } from "../middleware/validators.js";
import { changePassword, deleteAccountController, getProfileController, login, postProfile, register, updateEmailController, updateUsernameController, userInfo, logout, getOtherUserInfoController, getRandomUsersController } from "../controllers/userController.js";
const userRouter = Router();

userRouter.get("/", (req, res) => {
    res.send("User route");
});

userRouter.post("/register", registerValidation, register);

userRouter.post("/login", loginValidation, login);

userRouter.post("/logout", requireAuth, logout);

userRouter.get("/userinfo", requireAuth, userInfo);

userRouter.get("/user/:userId", requireAuth, getOtherUserInfoController);

userRouter.get("/random", requireAuth, getRandomUsersController);

userRouter.post("/profile", requireAuth, uploadMiddleware, postProfile);

userRouter.get("/profile", requireAuth, getProfileController);

userRouter.put("/change-password", requireAuth, passwordChangeValidation, changePassword);

userRouter.put("/update-email", requireAuth, updateEmailValidation, updateEmailController);

userRouter.put("/update-username", requireAuth, updateUsernameValidation, updateUsernameController);

userRouter.delete("/delete-account", requireAuth, deleteAccountController);

export { userRouter };

