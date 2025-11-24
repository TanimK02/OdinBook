import express from 'express';
import 'dotenv/config';
import cors from 'cors';
import passport from './config/passport.js';
import { likeRetweetRouter } from './routes/likeRetweetRouter.js';
import { userRouter } from './routes/userRoute.js';
import { tweetRouter } from './routes/tweetRoute.js';
const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors({
    origin: ['http://localhost:5173', 'https://odin-book-pi.vercel.app'],
    credentials: true
}));
app.set('trust proxy', 1);
app.use(express.json());
app.use(passport.initialize());

app.use('/api/users', userRouter);
app.use('/api/tweets', tweetRouter);
app.use('/api/interactions', likeRetweetRouter);

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});