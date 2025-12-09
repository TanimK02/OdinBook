import { Router } from "express";
import { requireJwt } from "../middleware/jwtValidator.js";
import { likeRetweetValidation } from "../middleware/validators.js";
import { likeController, retweetController } from "../controllers/likeRetweetController.js";
const likeRetweetRouter = Router();

likeRetweetRouter.post("/like", requireJwt, likeRetweetValidation, likeController);

likeRetweetRouter.post("/retweet", requireJwt, likeRetweetValidation, retweetController);

export { likeRetweetRouter };