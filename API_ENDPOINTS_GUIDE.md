# Twitter Clone API Endpoints Documentation

## Base URL
```
http://localhost:3000/api
```

## Authentication
Most endpoints require authentication using session cookies. The server uses Passport.js with session-based authentication.

**⚠️ IMPORTANT: You MUST set `withCredentials: true` in axios for authentication to work!**

**Authentication Setup:**
```javascript
// Set this GLOBALLY at the start of your app
axios.defaults.withCredentials = true;

// Or include it in each request
axios.get(url, { withCredentials: true });
```

**Why:** Session cookies are automatically sent/received with each request when `withCredentials` is true.

---

## 📝 User Routes (`/api/users`)

### 1. Register User
Creates a new user account and logs them in automatically.

**Endpoint:** `POST /api/users/register`

**Authentication:** Not required

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123",
  "username": "johndoe"
}
```

**Validation:**
- `email`: Must be valid email format
- `password`: Minimum 6 characters
- `username`: Minimum 3 characters

**Success Response (201):**
```json
{
  "message": "User registered successfully",
  "userId": "clxxx..."
}
```

**Error Responses:**
- `400`: Validation errors or email/username already exists
- `500`: Internal server error

**Frontend Implementation:**
```javascript
const register = async (username, email, password) => {
  const response = await axios.post(`${API_URL}/api/users/register`, {
    username,
    email,
    password
  });
  return response.data;
};
```

---

### 2. Login User
Authenticates a user and creates a session.

**Endpoint:** `POST /api/users/login`

**Authentication:** Not required

**Request Body:**
```json
{
  "identifier": "username_or_email",
  "password": "password123"
}
```

**Validation:**
- `identifier`: Required (username or email)
- `password`: Required

**Success Response (200):**
```json
{
  "message": "Login successful",
  "userId": "clxxx..."
}
```

**Error Responses:**
- `400`: Invalid credentials
- `500`: Internal server error

**Frontend Implementation:**
```javascript
const login = async (identifier, password) => {
  const response = await axios.post(`${API_URL}/api/users/login`, {
    identifier,
    password
  });
  return response.data;
};
```

---

### 3. Logout User
Ends the user's session.

**Endpoint:** `POST /api/users/logout`

**Authentication:** Required

**Request Body:** None

**Success Response (200):**
```json
{
  "message": "Logout successful"
}
```

**Error Responses:**
- `401`: Unauthorized
- `500`: Internal server error

**Frontend Implementation:**
```javascript
const logout = async () => {
  const response = await axios.post(`${API_URL}/api/users/logout`);
  return response.data;
};
```

---

### 4. Get User Info
Retrieves the authenticated user's information.

**Endpoint:** `GET /api/users/userinfo`

**Authentication:** Required

**Success Response (200):**
```json
{
  "user": {
    "id": "clxxx...",
    "username": "johndoe",
    "email": "user@example.com",
    "createdAt": "2025-01-01T00:00:00.000Z",
    "profile": {
      "id": "clxxx...",
      "bio": "Hello world!",
      "avatarUrl": "https://...",
      "userId": "clxxx..."
    }
  }
}
```

**Error Responses:**
- `401`: Unauthorized
- `404`: User not found
- `500`: Internal server error

**Frontend Implementation:**
```javascript
const getUserInfo = async () => {
  const response = await axios.get(`${API_URL}/api/users/userinfo`);
  return response.data.user;
};
```

---

### 5. Create/Update Profile
Creates or updates the user's profile with bio and avatar.

**Endpoint:** `POST /api/users/profile`

**Authentication:** Required

**Content-Type:** `multipart/form-data`

**Request Body (FormData):**
```javascript
{
  "bio": "My bio text",
  "avatar": File // (optional) Image file
}
```

**Success Response (201 or 200):**
```json
{
  "message": "Profile created" | "Profile updated",
  "profile": {
    "id": "clxxx...",
    "bio": "My bio text",
    "avatarUrl": "https://...",
    "userId": "clxxx..."
  }
}
```

**Error Responses:**
- `401`: Unauthorized
- `500`: Internal server error

**Frontend Implementation:**
```javascript
const updateProfile = async (bio, avatarFile) => {
  const formData = new FormData();
  formData.append('bio', bio);
  if (avatarFile) {
    formData.append('avatar', avatarFile);
  }
  
  const response = await axios.post(`${API_URL}/api/users/profile`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
  return response.data.profile;
};
```

---

### 6. Get Profile
Retrieves the authenticated user's profile.

**Endpoint:** `GET /api/users/profile`

**Authentication:** Required

**Success Response (200):**
```json
{
  "profile": {
    "id": "clxxx...",
    "bio": "My bio text",
    "avatarUrl": "https://...",
    "userId": "clxxx..."
  }
}
```

**Error Responses:**
- `401`: Unauthorized
- `404`: Profile not found
- `500`: Internal server error

**Frontend Implementation:**
```javascript
const getProfile = async () => {
  const response = await axios.get(`${API_URL}/api/users/profile`);
  return response.data.profile;
};
```

---

### 7. Change Password
Updates the user's password.

**Endpoint:** `PUT /api/users/change-password`

**Authentication:** Required

**Request Body:**
```json
{
  "oldPassword": "currentPassword123",
  "newPassword": "newPassword456"
}
```

**Validation:**
- `oldPassword`: Required
- `newPassword`: Minimum 6 characters

**Success Response (200):**
```json
{
  "message": "Password changed successfully"
}
```

**Error Responses:**
- `400`: Old password is incorrect
- `401`: Unauthorized
- `404`: User not found
- `500`: Internal server error

**Frontend Implementation:**
```javascript
const changePassword = async (oldPassword, newPassword) => {
  const response = await axios.put(`${API_URL}/api/users/change-password`, {
    oldPassword,
    newPassword
  });
  return response.data;
};
```

---

### 8. Update Email
Updates the user's email address.

**Endpoint:** `PUT /api/users/update-email`

**Authentication:** Required

**Request Body:**
```json
{
  "newEmail": "newemail@example.com"
}
```

**Validation:**
- `newEmail`: Must be valid email format

**Success Response (200):**
```json
{
  "message": "Email updated successfully"
}
```

**Error Responses:**
- `400`: Email already in use
- `401`: Unauthorized
- `500`: Internal server error

**Frontend Implementation:**
```javascript
const updateEmail = async (newEmail) => {
  const response = await axios.put(`${API_URL}/api/users/update-email`, {
    newEmail
  });
  return response.data;
};
```

---

### 9. Update Username
Updates the user's username.

**Endpoint:** `PUT /api/users/update-username`

**Authentication:** Required

**Request Body:**
```json
{
  "newUsername": "newusername"
}
```

**Validation:**
- `newUsername`: Minimum 3 characters

**Success Response (200):**
```json
{
  "message": "Username updated successfully"
}
```

**Error Responses:**
- `400`: Username already in use
- `401`: Unauthorized
- `500`: Internal server error

**Frontend Implementation:**
```javascript
const updateUsername = async (newUsername) => {
  const response = await axios.put(`${API_URL}/api/users/update-username`, {
    newUsername
  });
  return response.data;
};
```

---

### 10. Delete Account
Permanently deletes the user's account.

**Endpoint:** `DELETE /api/users/delete-account`

**Authentication:** Required

**Request Body:** None

**Success Response (200):**
```json
{
  "message": "Account deleted successfully"
}
```

**Error Responses:**
- `401`: Unauthorized
- `500`: Internal server error

**Frontend Implementation:**
```javascript
const deleteAccount = async () => {
  const response = await axios.delete(`${API_URL}/api/users/delete-account`);
  return response.data;
};
```

---

## 🐦 Tweet Routes (`/api/tweets`)

### 1. Create Tweet
Creates a new tweet (or reply if parentTweetId is provided).

**Endpoint:** `POST /api/tweets/tweet`

**Authentication:** Required

**Content-Type:** `multipart/form-data`

**Request Body (FormData):**
```javascript
{
  "content": "Tweet text content",
  "parentTweetId": "clxxx..." // (optional) For replies
  "tweetPics": [File, File, ...] // (optional) Up to 4 images
}
```

**Validation:**
- Must have either `content` or `tweetPics` (or both)
- `content`: Maximum 280 characters
- `tweetPics`: Maximum 4 images

**Success Response (201):**
```json
{
  "tweet": {
    "id": "clxxx...",
    "content": "Tweet text content",
    "authorId": "clxxx...",
    "createdAt": "2025-01-01T00:00:00.000Z",
    "updatedAt": "2025-01-01T00:00:00.000Z",
    "parentTweetId": null,
    "author": {
      "id": "clxxx...",
      "username": "johndoe",
      "profile": {
        "avatarUrl": "https://..."
      }
    },
    "images": [],
    "_count": {
      "likes": 0,
      "retweets": 0,
      "replies": 0
    }
  }
}
```

**Error Responses:**
- `400`: Validation errors
- `401`: Unauthorized
- `404`: Parent tweet not found (if replying)
- `500`: Internal server error

**Frontend Implementation:**
```javascript
const createTweet = async (content, images = [], parentTweetId = null) => {
  const formData = new FormData();
  formData.append('content', content);
  
  if (parentTweetId) {
    formData.append('parentTweetId', parentTweetId);
  }
  
  images.forEach(image => {
    formData.append('tweetPics', image);
  });
  
  const response = await axios.post(`${API_URL}/api/tweets/tweet`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
  return response.data.tweet;
};
```

---

### 2. Get Tweets (Paginated)
Retrieves tweets with pagination (excludes replies).

**Endpoint:** `GET /api/tweets/tweets/page/:page`

**Authentication:** Required

**URL Parameters:**
- `page`: Page number (integer, starts at 1)

**Query Parameters:** None

**Success Response (200):**
```json
{
  "tweets": [
    {
      "id": "clxxx...",
      "content": "Tweet content",
      "authorId": "clxxx...",
      "createdAt": "2025-01-01T00:00:00.000Z",
      "updatedAt": "2025-01-01T00:00:00.000Z",
      "parentTweetId": null,
      "author": {
        "id": "clxxx...",
        "username": "johndoe",
        "profile": {
          "avatarUrl": "https://..."
        }
      },
      "images": [
        {
          "id": "clxxx...",
          "imageUrl": "https://...",
          "tweetId": "clxxx..."
        }
      ],
      "_count": {
        "likes": 5,
        "retweets": 2,
        "replies": 10
      }
    }
  ]
}
```

**Note:** Returns 10 tweets per page, ordered by creation date (newest first)

**Error Responses:**
- `401`: Unauthorized
- `500`: Internal server error

**Frontend Implementation:**
```javascript
const getTweets = async (page = 1) => {
  const response = await axios.get(`${API_URL}/api/tweets/tweets/page/${page}`);
  return response.data.tweets;
};
```

---

### 3. Get Single Tweet
Retrieves a specific tweet by ID.

**Endpoint:** `GET /api/tweets/tweet/:id`

**Authentication:** Required

**URL Parameters:**
- `id`: Tweet ID (string)

**Success Response (200):**
```json
{
  "tweet": {
    "id": "clxxx...",
    "content": "Tweet content",
    "authorId": "clxxx...",
    "createdAt": "2025-01-01T00:00:00.000Z",
    "updatedAt": "2025-01-01T00:00:00.000Z",
    "parentTweetId": null,
    "author": {
      "id": "clxxx...",
      "username": "johndoe",
      "profile": {
        "avatarUrl": "https://..."
      }
    },
    "parentTweet": {
      // Full parent tweet object if this is a reply
    },
    "images": [],
    "_count": {
      "likes": 5,
      "retweets": 2,
      "replies": 10
    }
  }
}
```

**Error Responses:**
- `401`: Unauthorized
- `404`: Tweet not found
- `500`: Internal server error

**Frontend Implementation:**
```javascript
const getTweet = async (tweetId) => {
  const response = await axios.get(`${API_URL}/api/tweets/tweet/${tweetId}`);
  return response.data.tweet;
};
```

---

### 4. Get User's Tweets (Paginated)
Retrieves all tweets by a specific user.

**Endpoint:** `GET /api/tweets/tweets/user/:userId/page/:page`

**Authentication:** Required

**URL Parameters:**
- `userId`: User ID (string)
- `page`: Page number (integer, starts at 1)

**Success Response (200):**
```json
{
  "tweets": [
    // Array of tweet objects (same structure as Get Tweets)
  ]
}
```

**Note:** Returns 10 tweets per page, ordered by creation date (newest first)

**Error Responses:**
- `401`: Unauthorized
- `500`: Internal server error

**Frontend Implementation:**
```javascript
const getUserTweets = async (userId, page = 1) => {
  const response = await axios.get(`${API_URL}/api/tweets/tweets/user/${userId}/page/${page}`);
  return response.data.tweets;
};
```

---

### 5. Get Tweet Replies (Paginated)
Retrieves all replies to a specific tweet.

**Endpoint:** `GET /api/tweets/tweets/replies/:parentTweetId/page/:page`

**Authentication:** Required

**URL Parameters:**
- `parentTweetId`: Parent tweet ID (string)
- `page`: Page number (integer, starts at 1)

**Success Response (200):**
```json
{
  "replies": [
    // Array of tweet objects (same structure as Get Tweets)
  ]
}
```

**Note:** Returns 10 replies per page, ordered by creation date (newest first)

**Error Responses:**
- `401`: Unauthorized
- `500`: Internal server error

**Frontend Implementation:**
```javascript
const getTweetReplies = async (tweetId, page = 1) => {
  const response = await axios.get(`${API_URL}/api/tweets/tweets/replies/${tweetId}/page/${page}`);
  return response.data.replies;
};
```

---

### 6. Update Tweet
Updates an existing tweet's content and/or adds images.

**Endpoint:** `PUT /api/tweets/tweet/:id`

**Authentication:** Required (must be tweet owner)

**Content-Type:** `multipart/form-data`

**URL Parameters:**
- `id`: Tweet ID (string)

**Request Body (FormData):**
```javascript
{
  "content": "Updated tweet text",
  "tweetPics": [File, File, ...] // (optional) Additional images
}
```

**Validation:**
- `content`: Between 1 and 280 characters
- Total images (existing + new) cannot exceed 4

**Success Response (200):**
```json
{
  "tweet": {
    // Full updated tweet object
  }
}
```

**Error Responses:**
- `400`: Validation errors or too many images
- `401`: Unauthorized
- `403`: Not the tweet owner
- `404`: Tweet not found
- `500`: Internal server error

**Frontend Implementation:**
```javascript
const updateTweet = async (tweetId, content, newImages = []) => {
  const formData = new FormData();
  formData.append('content', content);
  
  newImages.forEach(image => {
    formData.append('tweetPics', image);
  });
  
  const response = await axios.put(`${API_URL}/api/tweets/tweet/${tweetId}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
  return response.data.tweet;
};
```

---

### 7. Delete Tweet
Deletes a tweet (must be the owner).

**Endpoint:** `DELETE /api/tweets/tweet/:id`

**Authentication:** Required (must be tweet owner)

**URL Parameters:**
- `id`: Tweet ID (string)

**Request Body:** None

**Success Response (200):**
```json
{
  "message": "Tweet deleted successfully"
}
```

**Error Responses:**
- `401`: Unauthorized
- `403`: Not the tweet owner
- `404`: Tweet not found
- `500`: Internal server error

**Frontend Implementation:**
```javascript
const deleteTweet = async (tweetId) => {
  const response = await axios.delete(`${API_URL}/api/tweets/tweet/${tweetId}`);
  return response.data;
};
```

---

## ❤️ Interaction Routes (`/api/interactions`)

### 1. Like/Unlike Tweet
Toggles like status on a tweet.

**Endpoint:** `POST /api/interactions/like`

**Authentication:** Required

**Request Body:**
```json
{
  "tweetId": "clxxx..."
}
```

**Validation:**
- `tweetId`: Required

**Success Response (200 or 201):**
```json
{
  "message": "Tweet liked" | "Tweet unliked"
}
```

**Note:** 
- Returns 201 with "Tweet liked" if the tweet was liked
- Returns 200 with "Tweet unliked" if the like was removed

**Error Responses:**
- `401`: Unauthorized
- `500`: Internal server error

**Frontend Implementation:**
```javascript
const toggleLike = async (tweetId) => {
  const response = await axios.post(`${API_URL}/api/interactions/like`, {
    tweetId
  });
  return response.data;
};
```

---

### 2. Retweet/Unretweet Tweet
Toggles retweet status on a tweet.

**Endpoint:** `POST /api/interactions/retweet`

**Authentication:** Required

**Request Body:**
```json
{
  "tweetId": "clxxx..."
}
```

**Validation:**
- `tweetId`: Required

**Success Response (200 or 201):**
```json
{
  "message": "Tweet retweeted" | "Tweet unretweeted"
}
```

**Note:** 
- Returns 201 with "Tweet retweeted" if the tweet was retweeted
- Returns 200 with "Tweet unretweeted" if the retweet was removed

**Error Responses:**
- `401`: Unauthorized
- `500`: Internal server error

**Frontend Implementation:**
```javascript
const toggleRetweet = async (tweetId) => {
  const response = await axios.post(`${API_URL}/api/interactions/retweet`, {
    tweetId
  });
  return response.data;
};
```

---

## 🔐 Authentication Setup

### Axios Configuration
**CRITICAL: Set up axios to include credentials with EVERY request:**

```javascript
import axios from 'axios';

// ⚠️ REQUIRED: This must be set for session-based auth to work
axios.defaults.withCredentials = true;
axios.defaults.baseURL = 'http://localhost:3000';

// Optional: Add request interceptor to ensure withCredentials is always set
axios.interceptors.request.use(
  (config) => {
    // Ensure withCredentials is set (redundant if using defaults, but safe)
    config.withCredentials = true;
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Optional: Add response interceptor for error handling
axios.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Redirect to login
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);
```

**Why `withCredentials: true` is required:**
- The backend uses session cookies for authentication
- Browsers don't send cookies in cross-origin requests by default
- `withCredentials: true` tells axios to include cookies in all requests
- Without it, your authenticated requests will fail with 401 errors

---

## 📊 Common Response Structures

### User Object
```typescript
{
  id: string;
  username: string;
  email: string;
  createdAt: string; // ISO date
  profile?: {
    id: string;
    bio: string;
    avatarUrl: string | null;
    userId: string;
  }
}
```

### Tweet Object
```typescript
{
  id: string;
  content: string;
  authorId: string;
  createdAt: string; // ISO date
  updatedAt: string; // ISO date
  parentTweetId: string | null;
  author: {
    id: string;
    username: string;
    profile: {
      avatarUrl: string | null;
    }
  };
  parentTweet?: TweetObject; // Only included in single tweet fetch
  images: Array<{
    id: string;
    imageUrl: string;
    tweetId: string;
  }>;
  _count: {
    likes: number;
    retweets: number;
    replies: number;
  }
}
```

### Error Response
```typescript
{
  error: string; // Error message
  errors?: Array<{ // Validation errors
    msg: string;
    param: string;
    location: string;
  }>
}
```

---

## 🚀 Complete API Service Example

Here's a complete example of an API service module:

### Option 1: Without async/await (Simpler)
Returns promises directly - the caller will await them.

```javascript
// api.js
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

// ⚠️ CRITICAL: Must be set for session-based authentication!
axios.defaults.withCredentials = true;

// User APIs
export const userAPI = {
  register: (username, email, password) =>
    axios.post(`${API_URL}/api/users/register`, { username, email, password }),
  
  login: (identifier, password) =>
    axios.post(`${API_URL}/api/users/login`, { identifier, password }),
  
  logout: () =>
    axios.post(`${API_URL}/api/users/logout`),
  
  getUserInfo: () =>
    axios.get(`${API_URL}/api/users/userinfo`),
  
  updateProfile: (bio, avatarFile) => {
    const formData = new FormData();
    formData.append('bio', bio);
    if (avatarFile) formData.append('avatar', avatarFile);
    return axios.post(`${API_URL}/api/users/profile`, formData);
  },
  
  getProfile: () =>
    axios.get(`${API_URL}/api/users/profile`),
  
  changePassword: (oldPassword, newPassword) =>
    axios.put(`${API_URL}/api/users/change-password`, { oldPassword, newPassword }),
  
  updateEmail: (newEmail) =>
    axios.put(`${API_URL}/api/users/update-email`, { newEmail }),
  
  updateUsername: (newUsername) =>
    axios.put(`${API_URL}/api/users/update-username`, { newUsername }),
  
  deleteAccount: () =>
    axios.delete(`${API_URL}/api/users/delete-account`)
};

// Tweet APIs
export const tweetAPI = {
  createTweet: (content, images = [], parentTweetId = null) => {
    const formData = new FormData();
    formData.append('content', content);
    if (parentTweetId) formData.append('parentTweetId', parentTweetId);
    images.forEach(img => formData.append('tweetPics', img));
    return axios.post(`${API_URL}/api/tweets/tweet`, formData);
  },
  
  getTweets: (page = 1) =>
    axios.get(`${API_URL}/api/tweets/tweets/page/${page}`),
  
  getTweet: (tweetId) =>
    axios.get(`${API_URL}/api/tweets/tweet/${tweetId}`),
  
  getUserTweets: (userId, page = 1) =>
    axios.get(`${API_URL}/api/tweets/tweets/user/${userId}/page/${page}`),
  
  getReplies: (tweetId, page = 1) =>
    axios.get(`${API_URL}/api/tweets/tweets/replies/${tweetId}/page/${page}`),
  
  updateTweet: (tweetId, content, newImages = []) => {
    const formData = new FormData();
    formData.append('content', content);
    newImages.forEach(img => formData.append('tweetPics', img));
    return axios.put(`${API_URL}/api/tweets/tweet/${tweetId}`, formData);
  },
  
  deleteTweet: (tweetId) =>
    axios.delete(`${API_URL}/api/tweets/tweet/${tweetId}`)
};

// Interaction APIs
export const interactionAPI = {
  toggleLike: (tweetId) =>
    axios.post(`${API_URL}/api/interactions/like`, { tweetId }),
  
  toggleRetweet: (tweetId) =>
    axios.post(`${API_URL}/api/interactions/retweet`, { tweetId })
};
```

**Usage:**
```javascript
// Caller will use await
const response = await userAPI.login(identifier, password);
const user = response.data;
```

---

### Option 2: With async/await (More Explicit)
Better for error handling, logging, or data transformation.

```javascript
// api.js
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

// ⚠️ CRITICAL: Must be set for session-based authentication!
axios.defaults.withCredentials = true;

// User APIs
export const userAPI = {
  register: async (username, email, password) => {
    const response = await axios.post(`${API_URL}/api/users/register`, { 
      username, email, password 
    });
    return response.data;
  },
  
  login: async (identifier, password) => {
    const response = await axios.post(`${API_URL}/api/users/login`, { 
      identifier, password 
    });
    return response.data;
  },
  
  logout: async () => {
    const response = await axios.post(`${API_URL}/api/users/logout`);
    return response.data;
  },
  
  getUserInfo: async () => {
    const response = await axios.get(`${API_URL}/api/users/userinfo`);
    return response.data.user;
  },
  
  updateProfile: async (bio, avatarFile) => {
    const formData = new FormData();
    formData.append('bio', bio);
    if (avatarFile) formData.append('avatar', avatarFile);
    const response = await axios.post(`${API_URL}/api/users/profile`, formData);
    return response.data.profile;
  },
  
  getProfile: async () => {
    const response = await axios.get(`${API_URL}/api/users/profile`);
    return response.data.profile;
  },
  
  changePassword: async (oldPassword, newPassword) => {
    const response = await axios.put(`${API_URL}/api/users/change-password`, { 
      oldPassword, newPassword 
    });
    return response.data;
  },
  
  updateEmail: async (newEmail) => {
    const response = await axios.put(`${API_URL}/api/users/update-email`, { newEmail });
    return response.data;
  },
  
  updateUsername: async (newUsername) => {
    const response = await axios.put(`${API_URL}/api/users/update-username`, { newUsername });
    return response.data;
  },
  
  deleteAccount: async () => {
    const response = await axios.delete(`${API_URL}/api/users/delete-account`);
    return response.data;
  }
};

// Tweet APIs
export const tweetAPI = {
  createTweet: async (content, images = [], parentTweetId = null) => {
    const formData = new FormData();
    formData.append('content', content);
    if (parentTweetId) formData.append('parentTweetId', parentTweetId);
    images.forEach(img => formData.append('tweetPics', img));
    const response = await axios.post(`${API_URL}/api/tweets/tweet`, formData);
    return response.data.tweet;
  },
  
  getTweets: async (page = 1) => {
    const response = await axios.get(`${API_URL}/api/tweets/tweets/page/${page}`);
    return response.data.tweets;
  },
  
  getTweet: async (tweetId) => {
    const response = await axios.get(`${API_URL}/api/tweets/tweet/${tweetId}`);
    return response.data.tweet;
  },
  
  getUserTweets: async (userId, page = 1) => {
    const response = await axios.get(`${API_URL}/api/tweets/tweets/user/${userId}/page/${page}`);
    return response.data.tweets;
  },
  
  getReplies: async (tweetId, page = 1) => {
    const response = await axios.get(`${API_URL}/api/tweets/tweets/replies/${tweetId}/page/${page}`);
    return response.data.replies;
  },
  
  updateTweet: async (tweetId, content, newImages = []) => {
    const formData = new FormData();
    formData.append('content', content);
    newImages.forEach(img => formData.append('tweetPics', img));
    const response = await axios.put(`${API_URL}/api/tweets/tweet/${tweetId}`, formData);
    return response.data.tweet;
  },
  
  deleteTweet: async (tweetId) => {
    const response = await axios.delete(`${API_URL}/api/tweets/tweet/${tweetId}`);
    return response.data;
  }
};

// Interaction APIs
export const interactionAPI = {
  toggleLike: async (tweetId) => {
    const response = await axios.post(`${API_URL}/api/interactions/like`, { tweetId });
    return response.data;
  },
  
  toggleRetweet: async (tweetId) => {
    const response = await axios.post(`${API_URL}/api/interactions/retweet`, { tweetId });
    return response.data;
  }
};
```

**Usage:**
```javascript
// Returns the data directly, not the full axios response
const user = await userAPI.getUserInfo(); // Just the user object
const tweets = await tweetAPI.getTweets(1); // Just the tweets array
```

---

### Which Should You Use?

**Option 1 (without async/await):**
- ✅ Simpler, less code
- ✅ Good for straightforward API calls
- ❌ Caller gets full axios response (must do `.data` themselves)

**Option 2 (with async/await):**
- ✅ Returns just the data you need
- ✅ Better for adding error handling, logging, or transformations
- ✅ More consistent with async patterns
- ❌ Slightly more verbose

**Recommendation:** Use **Option 2** for cleaner consuming code!

---

## 📝 Notes

1. **⚠️ Session-based Authentication - CRITICAL**: The API uses session cookies for authentication. You **MUST** set `axios.defaults.withCredentials = true` or include `withCredentials: true` in every axios request, otherwise authentication will not work.

2. **Pagination**: All paginated endpoints return 10 items per page.

3. **File Uploads**: Use `FormData` for endpoints that accept files (profile avatar, tweet images).

4. **Image Limits**: Maximum 4 images per tweet.

5. **Character Limits**: Tweet content is limited to 280 characters.

6. **Toggle Endpoints**: Like and retweet are toggle endpoints - calling them again will unlike/unretweet.

7. **Error Handling**: Always check response status codes and handle errors appropriately.

8. **CORS**: The backend is configured to accept requests from `http://localhost:5173` and `https://odin-book-pi.vercel.app`.
