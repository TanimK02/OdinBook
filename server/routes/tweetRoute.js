import { uploadMiddleware } from "../middleware/uploadController.js";
import { Router } from "express";
import { requireJwt } from "../middleware/jwtValidator.js";
import { tweetValidation, updateTweetValidation } from "../middleware/validators.js";
import { deleteTweetController, getReplies, getTweet, getTweets, getUserTweets, postTweet, updateTweetController } from "../controllers/tweetController.js";
const tweetRouter = Router();

tweetRouter.post("/tweet", requireJwt, uploadMiddleware, tweetValidation, postTweet);

tweetRouter.get("/tweets/page/:page", requireJwt, getTweets);

tweetRouter.get("/tweet/:id", requireJwt, getTweet);

tweetRouter.get("/tweets/user/:userId/page/:page", requireJwt, getUserTweets);

tweetRouter.delete("/tweet/:id", requireJwt, deleteTweetController);

tweetRouter.get("/tweets/replies/:parentTweetId/page/:page", requireJwt, getReplies);

tweetRouter.put("/tweet/:id", requireJwt, updateTweetValidation, uploadMiddleware, updateTweetController);

export { tweetRouter };
