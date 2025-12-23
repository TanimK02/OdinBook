import { Router } from "express";
import { requireAuth } from "../middleware/authentication.js";
import { searchTweets, searchTweetsAndUsers, searchUsers } from "../controllers/searchController.js";
const searchRouter = Router();

searchRouter.get("/", requireAuth, (req, res) => {
    res.send("Search route");
});

searchRouter.get("/users", requireAuth, searchUsers);

searchRouter.get("/tweets", requireAuth, searchTweets);

searchRouter.get("/all", requireAuth, searchTweetsAndUsers);

export { searchRouter };
