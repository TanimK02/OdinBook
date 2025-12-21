import { uploadMiddleware } from "../middleware/uploadController.js";
import { Router } from "express";
import { requireAuth } from "../middleware/authentication.js";
import { tweetValidation, updateTweetValidation } from "../middleware/validators.js";
import { deleteTweetController, getReplies, getTweet, getTweets, getUserTweets, postTweet, updateTweetController } from "../controllers/tweetController.js";
const tweetRouter = Router();

tweetRouter.post("/tweet", requireAuth, uploadMiddleware, tweetValidation, postTweet);

tweetRouter.get("/tweets", requireAuth, getTweets);

tweetRouter.get("/tweet/:id", requireAuth, getTweet);

tweetRouter.get("/tweets/user/:userId", requireAuth, getUserTweets);
tweetRouter.delete("/tweet/:id", requireAuth, deleteTweetController);

tweetRouter.get("/tweets/replies/:parentTweetId", requireAuth, getReplies);

tweetRouter.put("/tweet/:id", requireAuth, uploadMiddleware, updateTweetValidation, updateTweetController);

export { tweetRouter };
