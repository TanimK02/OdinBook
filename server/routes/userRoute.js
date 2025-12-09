import { Router } from "express";
import { requireJwt } from "../middleware/jwtValidator.js";
import { uploadMiddleware } from "../middleware/uploadController.js";
import { loginValidation, passwordChangeValidation, registerValidation, updateEmailValidation, updateUsernameValidation } from "../middleware/validators.js";
import { changePassword, deleteAccountController, getProfileController, login, postProfile, register, updateEmailController, updateUsernameController, userInfo } from "../controllers/userController.js";
const userRouter = Router();

userRouter.get("/", (req, res) => {
    res.send("User route");
});

userRouter.post("/register", registerValidation, register);

userRouter.post("/login", loginValidation, login);

userRouter.get("/userinfo", requireJwt, userInfo);

userRouter.post("/profile", requireJwt, uploadMiddleware, postProfile);

userRouter.get("/profile", requireJwt, getProfileController);

userRouter.put("/change-password", requireJwt, passwordChangeValidation, changePassword);

userRouter.put("/update-email", requireJwt, updateEmailValidation, updateEmailController);

userRouter.put("/update-username", requireJwt, updateUsernameValidation, updateUsernameController);

userRouter.delete("/delete-account", requireJwt, deleteAccountController);

export { userRouter };

