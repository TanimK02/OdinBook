# Twitter/X Clone

A full-stack Twitter/X clone built with React, Node.js, Express, Prisma, and PostgreSQL.

## Features

- ✨ Twitter/X-like UI with dark theme
- 🔐 User authentication (login/register)
- 📝 Create, read, and delete tweets
- 💬 Reply to tweets (threaded conversations)
- ❤️ Like/unlike tweets and retweets
- 🔄 Retweet functionality 
- 👤 User profiles with bio and avatar
- 🔍 Advanced search (users, tweets, and combined results)
- 📱 Mobile responsive design with adaptive navigation
- ∞ Infinite scroll on all feeds
- 🖼️ Image upload support (up to 4 images per tweet)
- ⚙️ Account settings (username, email, password changes)
- ✏️ Profile editing (bio and avatar)
- 🎨 Real-time search suggestions
- 📊 Comprehensive testing suite

## Browser Compatibility

⚠️ **Safari Users**: This application currently has session management issues with Safari due to its strict cross-site tracking prevention policies. For the best experience, please use Chrome, Firefox, or Edge. Safari compatibility improvements are planned for future releases.

## Tech Stack

### Frontend
- React 18 with Hooks
- React Router DOM (client-side routing)
- React Query/TanStack Query (server state management)
- Axios (HTTP client)
- React Icons
- React Hot Toast (notifications)
- date-fns (date formatting)
- Vite (build tool and dev server)

### Backend  
- Node.js with Express.js
- Prisma ORM with PostgreSQL
- JWT Authentication with HTTP-only cookies
- Bcrypt (password hashing)
- Supabase (cloud image storage)
- Multer (file upload middleware)
- Jest (testing framework)

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

### Test Accounts
After seeding the database, you can log in with any of these test accounts:
- **Usernames**: `techguru`, `coffeelover`, `bookworm`, `fitnessfan`, `moviebuff`
- **Password**: `password123`

### Core Features

#### Creating Tweets
1. Type your tweet in the compose box at the top of the home feed
2. Optionally add up to 4 images using the camera icon
3. Click "Post" to share your tweet

#### Replying to Tweets
1. Click on any tweet to view its details
2. Type your reply in the compose box at the top
3. Click "Post" to add your reply to the conversation thread

#### Interactions
- **Like**: Click the heart icon on any tweet to like/unlike
- **Retweet**: Click the retweet icon to share tweets with your followers

#### Search Functionality
- Use the search bar in the right sidebar for quick user searches
- Visit the dedicated Search page for comprehensive results:
  - **All**: Combined search results (users and tweets)
  - **Tweets**: Search through tweet content
  - **Users**: Search for users by username
- Real-time search suggestions as you type
- Infinite scroll on all search result types

#### Profile Management
- Click on any username or avatar to view profiles
- View all tweets, replies, and user information
- **Edit Profile**: Update your bio and avatar image
- **Account Settings**: Change username, email, or password

#### Mobile Experience
- Responsive design that adapts to screen size
- Collapsible sidebar that becomes bottom navigation on mobile
- Touch-friendly interfaces optimized for mobile use

## API Endpoints

### Users
- `GET /api/users/userinfo` - Get current user info (requires auth)
- `POST /api/users/register` - Register new user
- `POST /api/users/login` - Login user
- `POST /api/users/logout` - Logout user (requires auth)
- `GET /api/users/profile` - Get user profile (requires auth)
- `PUT /api/users/profile` - Update profile (bio, avatar) (requires auth)
- `PUT /api/users/username` - Update username (requires auth)
- `PUT /api/users/email` - Update email (requires auth)
- `PUT /api/users/password` - Change password (requires auth)
- `GET /api/users/:id` - Get user by ID

### Tweets
- `GET /api/tweets/tweets/page/:page` - Get paginated tweets for home feed
- `GET /api/tweets/tweet/:id` - Get single tweet with details
- `GET /api/tweets/tweets/user/:userId/page/:page` - Get user's tweets (paginated)
- `GET /api/tweets/tweets/replies/:parentTweetId/page/:page` - Get tweet replies (paginated)
- `POST /api/tweets/tweet` - Create new tweet (requires auth)
- `PUT /api/tweets/tweet/:id` - Update tweet (requires auth)
- `DELETE /api/tweets/tweet/:id` - Delete tweet (requires auth)

### Search
- `GET /api/search/users?query=:query&cursor=:cursor` - Search users by username
- `GET /api/search/tweets?query=:query&cursor=:cursor` - Search tweets by content
- `GET /api/search/all?query=:query` - Combined search (users and tweets)

### Interactions
- `POST /api/interactions/like` - Like/unlike tweet (requires auth)
- `POST /api/interactions/retweet` - Retweet/unretweet (requires auth)

## Project Structure

```
twitterClone/
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── layout/
│   │   │   │   ├── Layout.jsx
│   │   │   │   ├── Sidebar.jsx
│   │   │   │   └── RightSidebar.jsx
│   │   │   ├── modals/
│   │   │   │   ├── EditProfileModal.jsx
│   │   │   │   └── AccountSettingsModal.jsx
│   │   │   ├── search/
│   │   │   │   ├── SearchHeader.jsx
│   │   │   │   ├── SearchTabs.jsx
│   │   │   │   ├── TweetsList.jsx
│   │   │   │   └── UsersList.jsx
│   │   │   ├── tweet/
│   │   │   │   ├── TweetCard.jsx
│   │   │   │   ├── ComposeTweet.jsx
│   │   │   │   └── TweetImages.jsx
│   │   │   └── user/
│   │   │       └── UserBar.jsx
│   │   ├── hooks/
│   │   │   ├── useSearchMutations.js
│   │   │   ├── useTweetMutations.js
│   │   │   └── useUserMutations.js
│   │   ├── pages/
│   │   │   ├── Home.jsx
│   │   │   ├── Profile.jsx
│   │   │   ├── TweetDetail.jsx
│   │   │   ├── Search.jsx
│   │   │   ├── Login.jsx
│   │   │   └── Register.jsx
│   │   ├── App.jsx
│   │   ├── AuthProvider.jsx
│   │   └── main.jsx
│   └── package.json
└── server/
    ├── config/
    │   ├── passport.js
    │   ├── prisma.js
    │   └── supabase.js
    ├── controllers/
    │   ├── userController.js
    │   ├── tweetController.js
    │   ├── likeRetweetController.js
    │   └── searchController.js
    ├── services/
    │   ├── userService.js
    │   ├── tweetService.js
    │   ├── likeRetweetService.js
    │   └── searchService.js
    ├── routes/
    │   ├── userRoute.js
    │   ├── tweetRoute.js
    │   ├── likeRetweetRouter.js
    │   └── searchRoute.js
    ├── middleware/
    │   ├── authentication.js
    │   ├── uploadController.js
    │   └── validators.js
    ├── tests/
    │   ├── user.test.js
    │   ├── tweet.test.js
    │   └── likeRetweet.test.js
    ├── prisma/
    │   └── schema.prisma
    ├── index.js
    ├── seed.js
    └── package.json
```

## Features in Detail

### Advanced Search System
- **Real-time suggestions**: Get instant search suggestions in the right sidebar
- **Multi-tab search interface**: Separate tabs for All, Tweets, and Users
- **Infinite scroll**: All search results support infinite scrolling for better performance  
- **Debounced queries**: Optimized search with 500ms debouncing to reduce server load
- **Cursor-based pagination**: Efficient pagination using database cursors

### Authentication & Security
- **JWT-based authentication** with HTTP-only cookies for security
- **Secure password hashing** with bcrypt (10 salt rounds)
- **Protected routes** on both frontend and backend
- **Session management** with automatic token refresh

### Infinite Scroll Implementation
- Uses Intersection Observer API for efficient loading
- Prevents duplicate content with Set-based tracking
- Loads 10 items per page by default
- Works across all feeds: home, user profiles, search results

### Image Upload & Management  
- Supports up to 4 images per tweet
- **Dynamic grid layouts** (1, 2, 3, or 4 images)
- **Cloud storage** via Supabase with automatic optimization
- **File validation** and size limits for security
- **Preview functionality** during tweet composition

### Mobile-First Responsive Design
- **Adaptive sidebar navigation**: 
  - Desktop: Full sidebar with text labels
  - Tablet: Icon-only sidebar 
  - Mobile: Bottom navigation bar
- **Touch-friendly interfaces** optimized for mobile interaction
- **Responsive grid layouts** for images and content
- **Optimized typography** and spacing for different screen sizes

### Real-time Features
- **Live search suggestions** with debounced input
- **Instant UI updates** after user actions (like, retweet, post)
- **Optimistic updates** for better perceived performance
- **Error handling** with user-friendly notifications

### State Management
- **React Query/TanStack Query** for server state management
- **Infinite queries** for pagination
- **Optimistic updates** for instant UI feedback
- **Automatic cache invalidation** and background refetching
- **Error boundary** handling for robust error management

### Testing & Quality Assurance  
- **Comprehensive test suite** with Jest and Supertest
- **API endpoint testing** for all major functionality
- **Authentication flow testing** 
- **Database integration testing** with cleanup utilities
- **User registration and login testing**

## Development & Testing

### Running Tests
```bash
# Backend tests
cd server
npm test

# Run specific test suites
npm test -- --testNamePattern="User Routes"
npm test -- --testNamePattern="Tweet Routes" 
npm test -- --testNamePattern="Like and Retweet"
```

### Development Commands
```bash
# Backend development with hot reload
cd server
npm run dev

# Frontend development
cd frontend  
npm run dev

# Database operations
cd server
npx prisma studio          # Open Prisma Studio
npx prisma migrate dev     # Run migrations
npx prisma db seed         # Seed database
```

### Environment Setup
Make sure to set up both development and production environment variables:

**Development (.env)**:
```env
DATABASE_URL="postgresql://user:password@localhost:5432/twitter"
JWT_SECRET="your-development-secret"
SUPABASE_URL="your-supabase-url"
SUPABASE_ANON_KEY="your-supabase-anon-key"
NODE_ENV="development"
```

**Production considerations**:
- Use strong JWT secrets (minimum 256 bits)
- Enable HTTPS for cookie security
- Configure CORS properly for your domain
- Set up proper database connection pooling

## Performance Optimizations

- **Lazy loading** of components and routes
- **Image optimization** through Supabase transformations  
- **Debounced search** to reduce API calls
- **Cursor-based pagination** for efficient database queries
- **React Query caching** with stale-while-revalidate strategy
- **Optimistic updates** for immediate UI feedback
- **Bundle splitting** with Vite for faster loading

## Known Issues & Limitations

- **Safari Compatibility**: Session management issues due to Safari's cross-site tracking prevention
- **Image Upload**: Maximum 4 images per tweet (by design)
- **Search**: Real-time search limited to username and tweet content (no hashtags or mentions yet)
- **Notifications**: No push notifications implemented yet
- **DMs**: Direct messaging not implemented

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Run tests to ensure everything works (`npm test`)
4. Commit your changes (`git commit -m 'Add amazing feature'`)
5. Push to the branch (`git push origin feature/amazing-feature`)  
6. Open a Pull Request

### Code Style Guidelines
- Use ES6+ features and modern JavaScript
- Follow React hooks best practices
- Write descriptive commit messages
- Add tests for new functionality
- Use meaningful variable and function names

## License

ISC

## Acknowledgments

- **Inspired by Twitter/X** - UI/UX design patterns
- **Built as part of The Odin Project** - Full-stack curriculum
- **Community contributions** - Testing and feedback
- **Open source libraries** - React, Express, Prisma, and many others
