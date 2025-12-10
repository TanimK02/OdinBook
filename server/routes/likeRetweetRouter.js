import { Router } from "express";
import { requireAuth } from "../middleware/authentication.js";
import { likeRetweetValidation } from "../middleware/validators.js";
import { likeController, retweetController } from "../controllers/likeRetweetController.js";
const likeRetweetRouter = Router();

likeRetweetRouter.post("/like", requireAuth, likeRetweetValidation, likeController);

likeRetweetRouter.post("/retweet", requireAuth, likeRetweetValidation, retweetController);

export { likeRetweetRouter };