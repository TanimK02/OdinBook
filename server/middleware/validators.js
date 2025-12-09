import { body, validationResult } from "express-validator";

export const registerValidation = [body("email").isEmail(),
body("password").isLength({ min: 6 }),
body("username").isLength({ min: 3 }),
(req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    next();
}
]

export const loginValidation = [body("identifier").not().isEmpty(),
body("password").not().isEmpty(),
(req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    next();
}
]

export const passwordChangeValidation = [body("oldPassword").not().isEmpty(),
body("newPassword").isLength({ min: 6 }),
(req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    next();
}
]

export const updateEmailValidation = [body("newEmail").isEmail(),
(req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    next();
}
]

export const updateUsernameValidation = [body("newUsername").isLength({ min: 3 }),
(req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    next();
}
]

export const tweetValidation = (req, res, next) => {
    const { content } = req.body;
    const tweetPics = (req.files && req.files['tweetPics']) ? req.files['tweetPics'] : [];

    const hasContent = content && content.trim().length > 0;

    if (!hasContent && tweetPics.length === 0) {
        return res.status(400).json({ error: "Tweet must have content or images" });
    }

    if (content && content.length > 280) {
        return res.status(400).json({ error: "Content must be 280 characters or less" });
    }

    if (tweetPics.length > 4) {
        return res.status(400).json({
            error: `Cannot upload ${tweetPics.length} images. Maximum is 4 images per tweet.`
        });
    }

    next();
}

export const updateTweetValidation = [body("content").isLength({ min: 1, max: 280 }).withMessage("Content must be between 1 and 280 characters"),
(req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    next();
}
]

export const likeRetweetValidation = [body("tweetId").not().isEmpty(),
(req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    next();
}
]