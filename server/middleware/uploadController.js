import multer from 'multer';
import { PrismaClient } from '../generated/prisma/index.js';

const prisma = new PrismaClient();

// Configure multer for memory storage
const storage = multer.memoryStorage();
const upload = multer({
    storage,
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new Error('Only image files are allowed'));
        }
    }
});

export const uploadMiddleware = upload.fields([
    { name: 'avatar', maxCount: 1 },
    { name: 'tweetPics', maxCount: 4 }
]);
