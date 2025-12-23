import express from 'express';
import 'dotenv/config';
import cors from 'cors';
import passport from './config/passport.js';
import { likeRetweetRouter } from './routes/likeRetweetRouter.js';
import { userRouter } from './routes/userRoute.js';
import { tweetRouter } from './routes/tweetRoute.js';
import { searchRouter } from './routes/searchRoute.js';
import session from 'express-session';
import pgSession from 'connect-pg-simple';
import { Pool } from 'pg';

const pgPool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

const app = express();
const PORT = process.env.PORT || 3000;

app.set('trust proxy', 1);

app.use(cors({
    origin: (origin, callback) => {
        const allowedOrigins = [
            'http://localhost:5173',
            'https://odin-book-pi.vercel.app'
        ];
        // Allow requests with no origin (like mobile apps or curl)
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    exposedHeaders: ['Set-Cookie']
}));

app.use(express.json());

app.use(session({
    store: new (pgSession(session))({
        pool: pgPool,
        tableName: 'session',
        createTableIfMissing: true
    }),
    secret: process.env.SESSION_SECRET || 'yoursecret',
    resave: false,
    saveUninitialized: false,
    proxy: true,
    cookie: {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
        maxAge: 24 * 60 * 60 * 1000,
        domain: process.env.NODE_ENV === 'production' ? undefined : 'localhost'
    }
}));


// Initialize Passport
app.use(passport.initialize());
app.use(passport.session());

app.use('/api/users', userRouter);
app.use('/api/tweets', tweetRouter);
app.use('/api/interactions', likeRetweetRouter);
app.use('/api/search', searchRouter);

// export default app;

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});