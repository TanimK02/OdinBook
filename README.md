# Twitter / X clone

Full-stack social feed app (compose tweets, replies, likes, retweets, profiles, search, image uploads) built for [The Odin Project](https://www.theodinproject.com/). Live deployment: [https://tclone.one](https://tclone.one)

## Features

- Twitter-style UI with dark theme
- Register, login, and logout with server-side sessions
- Create, edit, and delete tweets; threaded replies
- Like and retweet
- Profiles (bio, avatar) and account settings (username, email, password, delete account)
- Search across users and tweets with suggestions and infinite scroll
- Responsive layout (sidebar / bottom navigation on small screens)
- Up to four images per tweet, stored in Supabase

## Browser compatibility

Safari can block or partition third-party cookies more aggressively than Chromium-based browsers. This app uses a **session cookie** on the API origin. For local development, use **Chrome, Firefox, or Edge** with the Vite dev server and API on the documented localhost URLs. If you deploy the frontend and API on different sites, you will need HTTPS, `SameSite=None`, and correct CORS/cookie settings (see [server/index.js](server/index.js)).

## Tech stack

**Frontend**

- React 19, React Router 7, Vite 7
- TanStack Query for server state
- Axios with `withCredentials` for cookie sessions
- React Hot Toast, react-icons, date-fns, react-photo-view

**Backend**

- Node.js (ES modules), Express 5
- PostgreSQL with Prisma ORM (client generated under `server/generated/prisma`)
- Authentication: Passport local strategy, bcrypt, **express-session** with **connect-pg-simple** (sessions in Postgres)
- Supabase Storage for avatars and tweet images (optional `SUPABASE_SERVICE_ROLE_KEY` or anon key)
- Multer for uploads, express-validator, Jest + Supertest

Note: `jsonwebtoken` and `passport-jwt` are present in dependencies but are not used for the current session-based auth flow.

## Prerequisites

- Node.js 18+
- PostgreSQL
- A Supabase project (URL + key, and a storage bucket for media)

## Getting started

### 1. Clone and install

```bash
git clone https://github.com/TanimK02/OdinBook.git
cd OdinBook
```

Install server and client dependencies:

```bash
cd server && npm install
cd ../frontend && npm install
```

### 2. Environment variables (server)

Create `server/.env` (do not commit real secrets):

```env
DATABASE_URL="postgresql://USER:PASSWORD@localhost:5432/DATABASE_NAME"
SESSION_SECRET="a-long-random-string-for-express-session"

SUPABASE_URL="https://YOUR_PROJECT.supabase.co"
# Prefer service role for server-side uploads; anon key is accepted as fallback
SUPABASE_SERVICE_ROLE_KEY="your-service-role-key"
# SUPABASE_ANON_KEY="your-anon-key"

# Optional: defaults to bucket name "tweet-images" in code
# SUPABASE_STORAGE_BUCKET="tweet-images"

# Optional
# PORT=3000
# NODE_ENV=development
```

### 3. Database

From the `server` directory:

```bash
npx prisma migrate dev
node seed.js
```

`seed.js` creates a **`guest`** user (password `password123`) plus additional users and sample tweets, likes, retweets, and follows (randomized data via Faker). There is no `prisma db seed` script in `package.json`; use `node seed.js` as above.

### 4. Run the API

From `server/`:

```bash
npm start
```

This runs `node --watch index.js`. API default: [http://localhost:3000](http://localhost:3000)

### 5. Run the frontend

From `frontend/`:

```bash
npm run dev
```

Default: [http://localhost:5173](http://localhost:5173)

If the API is not on `http://localhost:3000`, set in `frontend/.env`:

```env
VITE_API_BASE_URL="https://your-api.example.com"
```

### 6. CORS and new front-end origins

Allowed origins are listed in [server/index.js](server/index.js). Add your dev or production front-end URL there if it is not already included.

## Test account (after seed)

- Username: `guest`
- Password: `password123`

Other seeded accounts use random usernames; check the seed script output or the database for their credentials (all use `password123`).

## API overview

All JSON routes below are under the `/api` prefix. Most require an authenticated session cookie (`credentials: 'include'` from the browser).

**Users** (`/api/users`)

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/register` | No | Register; logs in on success |
| POST | `/login` | No | Login with `identifier` (email or username) and `password` |
| POST | `/logout` | Yes | Logout |
| GET | `/userinfo` | Yes | Current user |
| GET | `/user/:userId` | Yes | Public user by **database id** |
| GET | `/random?limit=` | Yes | Random users (limit 1–20) |
| GET | `/profile` | Yes | Current user profile |
| POST | `/profile` | Yes | Update profile (multipart: `bio`, optional `avatar`) |
| PUT | `/change-password` | Yes | Change password |
| PUT | `/update-email` | Yes | Update email |
| PUT | `/update-username` | Yes | Update username |
| DELETE | `/delete-account` | Yes | Delete account |

**Tweets** (`/api/tweets`)

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/tweet` | Yes | Create tweet (multipart: `content`, optional `tweetPics[]`, optional `parentTweetId`) |
| GET | `/tweets?cursor=` | Yes | Home timeline (cursor pagination) |
| GET | `/tweet/:id` | Yes | Single tweet |
| GET | `/tweets/user/:userId?cursor=` | Yes | Tweets by user id |
| GET | `/tweets/replies/:parentTweetId?cursor=` | Yes | Replies |
| PUT | `/tweet/:id` | Yes | Update tweet |
| DELETE | `/tweet/:id` | Yes | Delete tweet |

**Interactions** (`/api/interactions`)

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/like` | Yes | Body: `{ tweetId }` — toggle like |
| POST | `/retweet` | Yes | Body: `{ tweetId }` — toggle retweet |

**Search** (`/api/search`)

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/users?query=&cursor=` | Yes | Search users |
| GET | `/tweets?query=&cursor=` | Yes | Search tweets |
| GET | `/all?query=` | Yes | Combined users + tweets |

The React client wraps these calls in [frontend/src/api.js](frontend/src/api.js).

## Project structure

```
twitterClone/
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── layout/       # Layout, Sidebar, RightSidebar
│   │   │   ├── modals/       # Edit profile, account settings
│   │   │   ├── search/       # Search UI
│   │   │   ├── tweet/        # TweetCard, ComposeTweet
│   │   │   └── user/         # UserBar
│   │   ├── hooks/            # useTweetMutations, useUserMutations, useSearchMutations
│   │   ├── pages/            # Home, Profile, TweetDetail, Search, Login, Register
│   │   ├── api.js
│   │   ├── AuthProvider.jsx
│   │   ├── App.jsx
│   │   └── main.jsx
│   └── package.json
└── server/
    ├── config/               # passport, prisma client, supabase
    ├── controllers/
    ├── services/
    ├── routes/
    ├── middleware/
    ├── tests/
    ├── prisma/
    │   └── schema.prisma
    ├── generated/prisma/     # Prisma client output (after generate/migrate)
    ├── index.js
    ├── seed.js
    └── package.json
```

## Development and tests

```bash
# Backend tests (from server/)
npm test

# Prisma Studio (from server/)
npx prisma studio
```

## Production notes

- Use a strong `SESSION_SECRET` and HTTPS so session cookies stay secure (`secure: true` when `NODE_ENV=production` in [server/index.js](server/index.js)).
- Configure CORS allowlist and database pooling for your host.
- Build the SPA: `cd frontend && npm run build` — serve `frontend/dist` behind your static host and point `VITE_API_BASE_URL` at build time to the public API URL.

## Known limitations

- No hashtags, @mentions, DMs, or push notifications in this version.
- Image cap: four images per tweet by design.

## Contributing

1. Fork the repository
2. Create a branch for your change
3. Run `npm test` in `server/` where relevant
4. Open a pull request

## License

ISC

## Acknowledgments

- UI patterns inspired by Twitter / X
- Built as part of The Odin Project curriculum
