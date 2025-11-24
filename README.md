# Twitter/X Clone

A full-stack Twitter/X clone built with React, Node.js, Express, Prisma, and PostgreSQL.

## Features

- ✨ Twitter/X-like UI with dark theme
- 🔐 User authentication (login/register)
- 📝 Create, read, and delete tweets
- 💬 Reply to tweets (threaded conversations)
- ❤️ Like/unlike tweets
- 👤 User profiles
- 📱 Mobile responsive design
- ∞ Infinite scroll on all feeds
- 🖼️ Image upload support (up to 4 images per tweet)
- 🔄 Real-time updates

## Tech Stack

### Frontend
- React 18
- React Router DOM
- Axios
- React Icons
- date-fns
- Vite

### Backend
- Node.js
- Express
- Prisma ORM
- PostgreSQL
- JWT Authentication
- Bcrypt
- Supabase (image storage)
- Multer (file upload)

## Getting Started

### Prerequisites
- Node.js (v18 or higher)
- PostgreSQL database
- Supabase account (for image storage)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd twitterClone
   ```

2. **Set up the backend**
   ```bash
   cd server
   npm install
   ```

3. **Configure environment variables**
   Create a `.env` file in the `server` directory:
   ```env
   DATABASE_URL="postgresql://user:password@localhost:5432/twitter"
   JWT_SECRET="your-secret-key"
   SUPABASE_URL="your-supabase-url"
   SUPABASE_ANON_KEY="your-supabase-anon-key"
   ```

4. **Run database migrations**
   ```bash
   npx prisma migrate dev
   ```

5. **Seed the database (optional)**
   ```bash
   node seed.js
   ```

6. **Start the backend server**
   ```bash
   node index.js
   ```
   Server will run on http://localhost:3000

7. **Set up the frontend**
   ```bash
   cd ../frontend
   npm install
   ```

8. **Start the frontend development server**
   ```bash
   npm run dev
   ```
   Frontend will run on http://localhost:5173

## Usage

### Test Account
After seeding the database, you can log in with any of these test accounts:
- Username: `techguru`, `coffeelover`, `bookworm`, etc.
- Password: `password123`

### Creating Tweets
1. Type your tweet in the compose box at the top of the home feed
2. Optionally add up to 4 images
3. Click "Post"

### Replying to Tweets
1. Click on any tweet to view details
2. Type your reply in the compose box
3. Click "Post"

### Liking Tweets
- Click the heart icon on any tweet

### Viewing Profiles
- Click on any username or avatar to view their profile
- See all tweets from that user

## API Endpoints

### Authentication
- `POST /api/users/register` - Register new user
- `POST /api/users/login` - Login user
- `GET /api/users/userinfo` - Get current user info (requires auth)

### Tweets
- `GET /api/tweets/tweets/page/:page` - Get paginated tweets
- `GET /api/tweets/tweet/:id` - Get single tweet
- `GET /api/tweets/tweets/user/:userId/page/:page` - Get user tweets
- `GET /api/tweets/tweets/replies/:parentTweetId/page/:page` - Get tweet replies
- `POST /api/tweets/tweet` - Create tweet (requires auth)
- `PUT /api/tweets/tweet/:id` - Update tweet (requires auth)
- `DELETE /api/tweets/tweet/:id` - Delete tweet (requires auth)

### Interactions
- `POST /api/interactions/like` - Like/unlike tweet (requires auth)
- `POST /api/interactions/retweet` - Retweet/unretweet (requires auth)

## Project Structure

```
twitterClone/
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Layout.jsx
│   │   │   ├── Sidebar.jsx
│   │   │   ├── RightSidebar.jsx
│   │   │   ├── TweetCard.jsx
│   │   │   └── ComposeTweet.jsx
│   │   ├── pages/
│   │   │   ├── Home.jsx
│   │   │   ├── Profile.jsx
│   │   │   ├── TweetDetail.jsx
│   │   │   ├── Login.jsx
│   │   │   └── Register.jsx
│   │   ├── App.jsx
│   │   └── main.jsx
│   └── package.json
└── server/
    ├── config/
    │   ├── passport.js
    │   ├── prisma.js
    │   └── supabase.js
    ├── prisma/
    │   └── schema.prisma
    ├── routes/
    │   ├── tweetRoute.js
    │   ├── userRoute.js
    │   ├── likeRetweetRouter.js
    │   └── uploadController.js
    ├── index.js
    ├── seed.js
    └── package.json
```

## Features in Detail

### Infinite Scroll
- Uses Intersection Observer API for efficient loading
- Prevents duplicate tweets with Set-based tracking
- Loads 10 tweets per page

### Mobile Responsive
- Adaptive sidebar (full → icons → bottom nav)
- Touch-friendly interfaces
- Optimized layouts for small screens

### Image Upload
- Supports up to 4 images per tweet
- Grid layouts (1, 2, 3, or 4 images)
- Automatic image optimization
- Stored in Supabase storage

### Authentication
- JWT-based authentication
- Secure password hashing with bcrypt
- Protected routes on both frontend and backend

## License

ISC

## Acknowledgments

- Inspired by Twitter/X
- Built as part of The Odin Project
