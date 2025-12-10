# API Routes Testing Guide

## User Routes (`/api/users`)

### 1. GET `/api/users`
- **Auth Required:** No
- **Input:** None
- **Expected Response:** `"User route"` (200)
- **Purpose:** Health check

---

### 2. POST `/api/users/register`
- **Auth Required:** No
- **Input (JSON):**
  ```json
  {
    "email": "user@example.com",
    "password": "password123",  // min 6 characters
    "username": "username123"   // min 3 characters
  }
  ```
- **Validations:**
  - `email` must be valid email format
  - `password` must be at least 6 characters
  - `username` must be at least 3 characters
- **Success Response (201):**
  ```json
  {
    "message": "User registered successfully",
    "userId": "cuid"
  }
  ```
- **Session:** User is automatically logged in after registration (session created)
- **Error Cases:**
  - 400: Validation errors
  - 400: Email or username already exists (P2002)
  - 500: Internal server error

---

### 3. POST `/api/users/login`
- **Auth Required:** No
- **Input (JSON):**
  ```json
  {
    "identifier": "username or email",
    "password": "password123"
  }
  ```
- **Validations:**
  - Both fields required (not empty)
- **Success Response (200):**
  ```json
  {
    "message": "Login successful",
    "userId": "cuid"
  }
  ```
- **Session:** Session cookie is set on successful login
- **Error Cases:**
  - 400: Validation errors
  - 400: Invalid credentials (user not found or wrong password)
  - 500: Internal server error

---

### 4. POST `/api/users/logout`
- **Auth Required:** Yes (Session cookie)
- **Input:** None
- **Success Response (200):**
  ```json
  {
    "message": "Logout successful"
  }
  ```
- **Session:** Session is destroyed
- **Error Cases:**
  - 401: Unauthorized (no active session)
  - 500: Logout failed

---

### 5. GET `/api/users/userinfo`
- **Auth Required:** Yes (Session cookie)
- **Input:** None (user ID from session)
- **Success Response (200):**
  ```json
  {
    "user": {
      "id": "cuid",
      "username": "username",
      "email": "email@example.com",
      "profile": {
        "bio": "User bio text",
        "avatarUrl": "https://url.to/avatar.jpg"
      }
    }
  }
  ```
- **Error Cases:**
  - 401: Unauthorized (no active session)
  - 404: User not found
  - 500: Internal server error

---

### 6. POST `/api/users/profile`
- **Auth Required:** Yes (Session cookie)
- **Input (FormData):**
  - `bio` (text, optional)
  - `avatar` (file, optional - single image file)
- **Success Response (200 for update / 201 for create):**
  ```json
  {
    "message": "Profile updated" or "Profile created",
    "profile": {
      "id": "cuid",
      "bio": "Updated bio",
      "avatarUrl": "https://url.to/avatar.jpg",
      "userId": "cuid",
      "createdAt": "timestamp",
      "updatedAt": "timestamp"
    }
  }
  ```
- **Error Cases:**
  - 401: Unauthorized
  - 500: Internal server error

---

### 7. GET `/api/users/profile`
- **Auth Required:** Yes (Session cookie)
- **Input:** None (user ID from session)
- **Success Response (200):**
  ```json
  {
    "profile": {
      "id": "cuid",
      "bio": "User bio",
      "avatarUrl": "https://url.to/avatar.jpg",
      "userId": "cuid",
      "createdAt": "timestamp",
      "updatedAt": "timestamp"
    }
  }
  ```
- **Error Cases:**
  - 401: Unauthorized
  - 404: Profile not found
  - 500: Internal server error

---

### 8. PUT `/api/users/change-password`
- **Auth Required:** Yes (Session cookie)
- **Input (JSON):**
  ```json
  {
    "oldPassword": "currentpassword",
    "newPassword": "newpassword123"  // min 6 characters
  }
  ```
- **Validations:**
  - `oldPassword` required
  - `newPassword` must be at least 6 characters
- **Success Response (200):**
  ```json
  {
    "message": "Password changed successfully"
  }
  ```
- **Error Cases:**
  - 400: Validation errors
  - 400: Old password is incorrect
  - 401: Unauthorized
  - 404: User not found
  - 500: Internal server error

---

### 9. PUT `/api/users/update-email`
- **Auth Required:** Yes (Session cookie)
- **Input (JSON):**
  ```json
  {
    "newEmail": "newemail@example.com"
  }
  ```
- **Validations:**
  - `newEmail` must be valid email format
- **Success Response (200):**
  ```json
  {
    "message": "Email updated successfully"
  }
  ```
- **Error Cases:**
  - 400: Validation errors
  - 400: Email already in use (P2002)
  - 401: Unauthorized
  - 500: Internal server error

---

### 10. PUT `/api/users/update-username`
- **Auth Required:** Yes (Session cookie)
- **Input (JSON):**
  ```json
  {
    "newUsername": "newusername123"  // min 3 characters
  }
  ```
- **Validations:**
  - `newUsername` must be at least 3 characters
- **Success Response (200):**
  ```json
  {
    "message": "Username updated successfully"
  }
  ```
- **Error Cases:**
  - 400: Validation errors
  - 400: Username already in use (P2002)
  - 401: Unauthorized
  - 500: Internal server error

---

### 11. DELETE `/api/users/delete-account`
- **Auth Required:** Yes (Session cookie)
- **Input:** None (user ID from session)
- **Success Response (200):**
  ```json
  {
    "message": "Account deleted successfully"
  }
  ```
- **Error Cases:**
  - 401: Unauthorized
  - 500: Internal server error

---

## Tweet Routes (`/api/tweets`)

### 12. POST `/api/tweets/tweet`
- **Auth Required:** Yes (Session cookie)
- **Input (FormData):**
  - `content` (text, optional if images provided, max 280 characters)
  - `parentTweetId` (text/cuid, optional - for replies)
  - `tweetPics` (files, optional - max 4 images)
- **Validations:**
  - Must have content or images (at least one)
  - Content max 280 characters
  - Max 4 images per tweet
  - Parent tweet must exist if `parentTweetId` provided
- **Success Response (201):**
  ```json
  {
    "tweet": {
      "id": "cuid",
      "content": "Tweet content",
      "authorId": "cuid",
      "parentTweetId": "cuid or null",
      "createdAt": "timestamp",
      "updatedAt": "timestamp",
      "images": [{"id": "cuid", "url": "https://..."}],
      "author": {...},
      "_count": {"likes": 0}
    }
  }
  ```
- **Error Cases:**
  - 400: Tweet must have content or images
  - 400: Content too long (>280 chars)
  - 400: Too many images (>4)
  - 401: Unauthorized
  - 404: Parent tweet not found
  - 500: Internal server error

---

### 13. GET `/api/tweets/tweets/page/:page`
- **Auth Required:** Yes (Session cookie)
- **Input:** 
  - `:page` (URL param, number, defaults to 1)
- **Query Params:** None
- **Pagination:** 10 tweets per page
- **Success Response (200):**
  ```json
  {
    "tweets": [
      {
        "id": "cuid",
        "content": "Tweet content",
        "authorId": "cuid",
        "parentTweetId": "cuid or null",
        "createdAt": "timestamp",
        "updatedAt": "timestamp",
        "images": [...],
        "author": {...},
        "parentTweet": {...},
        "_count": {"likes": 0}
      }
    ]
  }
  ```
- **Error Cases:**
  - 401: Unauthorized
  - 500: Internal server error

---

### 14. GET `/api/tweets/tweet/:id`
- **Auth Required:** Yes (Session cookie)
- **Input:**
  - `:id` (URL param, tweet cuid)
- **Success Response (200):**
  ```json
  {
    "tweet": {
      "id": "cuid",
      "content": "Tweet content",
      "authorId": "cuid",
      "parentTweetId": "cuid or null",
      "createdAt": "timestamp",
      "updatedAt": "timestamp",
      "images": [...],
      "author": {...},
      "parentTweet": {...},
      "_count": {"likes": 0}
    }
  }
  ```
- **Error Cases:**
  - 401: Unauthorized
  - 404: Tweet not found
  - 500: Internal server error

---

### 15. GET `/api/tweets/tweets/user/:userId/page/:page`
- **Auth Required:** Yes (Session cookie)
- **Input:**
  - `:userId` (URL param, user cuid)
  - `:page` (URL param, number, defaults to 1)
- **Pagination:** 10 tweets per page
- **Success Response (200):**
  ```json
  {
    "tweets": [...]
  }
  ```
- **Error Cases:**
  - 401: Unauthorized
  - 500: Internal server error

---

### 16. GET `/api/tweets/tweets/replies/:parentTweetId/page/:page`
- **Auth Required:** Yes (Session cookie)
- **Input:**
  - `:parentTweetId` (URL param, tweet cuid)
  - `:page` (URL param, number, defaults to 1)
- **Pagination:** 10 replies per page
- **Success Response (200):**
  ```json
  {
    "replies": [...]
  }
  ```
- **Error Cases:**
  - 401: Unauthorized
  - 500: Internal server error

---

### 17. PUT `/api/tweets/tweet/:id`
- **Auth Required:** Yes (Session cookie)
- **Input:**
  - `:id` (URL param, tweet cuid)
  - (FormData):
    - `content` (text, required, 1-280 characters)
    - `tweetPics` (files, optional - additional images)
- **Validations:**
  - Content must be 1-280 characters
  - Total images (existing + new) cannot exceed 4
  - Only tweet author can edit
- **Success Response (200):**
  ```json
  {
    "tweet": {...}
  }
  ```
- **Error Cases:**
  - 400: Validation errors
  - 400: Too many images
  - 401: Unauthorized
  - 403: Unauthorized to edit this tweet (not author)
  - 404: Tweet not found
  - 500: Internal server error

---

### 18. DELETE `/api/tweets/tweet/:id`
- **Auth Required:** Yes (Session cookie)
- **Input:**
  - `:id` (URL param, tweet cuid)
- **Validations:**
  - Only tweet author can delete
- **Success Response (200):**
  ```json
  {
    "message": "Tweet deleted successfully"
  }
  ```
- **Error Cases:**
  - 401: Unauthorized
  - 403: Unauthorized to delete this tweet (not author)
  - 404: Tweet not found
  - 500: Internal server error

---

## Interaction Routes (`/api/interactions`)

### 19. POST `/api/interactions/like`
- **Auth Required:** Yes (Session cookie)
- **Input (JSON):**
  ```json
  {
    "tweetId": "cuid"
  }
  ```
- **Validations:**
  - `tweetId` required
- **Behavior:** Toggle - if already liked, unlike; if not liked, like
- **Success Response (200 for unlike / 201 for like):**
  ```json
  {
    "message": "Tweet unliked" or "Tweet liked"
  }
  ```
- **Error Cases:**
  - 400: Validation errors
  - 401: Unauthorized
  - 500: Internal server error

---

### 20. POST `/api/interactions/retweet`
- **Auth Required:** Yes (Session cookie)
- **Input (JSON):**
  ```json
  {
    "tweetId": "cuid"
  }
  ```
- **Validations:**
  - `tweetId` required
- **Behavior:** Toggle - if already retweeted, unretweet; if not retweeted, retweet
- **Success Response (200 for unretweet / 201 for retweet):**
  ```json
  {
    "message": "Tweet unretweeted" or "Tweet retweeted"
  }
  ```
- **Error Cases:**
  - 400: Validation errors
  - 401: Unauthorized
  - 500: Internal server error

---

## Testing Tips

1. **Authentication Flow:**
   - First register a user (route 2) - session is automatically created
   - Or login (route 3) - session cookie is set
   - Session cookie is automatically included in subsequent requests
   - Use logout (route 4) to destroy session

2. **Session Cookie Testing:**
   - In Postman/Insomnia: Enable "Send cookies automatically"
   - In supertest: Use `.set('Cookie', cookie)` or use an agent for persistent cookies
   - Example with supertest agent:
     ```javascript
     const agent = request.agent(app);
     await agent.post('/api/users/login').send({...});
     // Subsequent requests with agent automatically include session cookie
     await agent.get('/api/users/userinfo');
     ```

3. **Testing Order Suggestion:**
   - Start with user registration/login (routes 2-3)
   - Test user info retrieval (route 5)
   - Test profile creation/update (routes 6-7)
   - Test tweet creation (route 12)
   - Test tweet retrieval (routes 13-16)
   - Test interactions (routes 19-20)
   - Test updates (routes 8-10, 17)
   - Test deletions (routes 11, 18)
   - Test logout (route 4)

4. **Edge Cases to Test:**
   - No session cookie
   - Invalid/expired session
   - Missing required fields
   - Invalid data formats
   - Duplicate usernames/emails
   - Accessing other users' resources
   - Pagination edge cases (page 0, negative, very large)
   - File upload limits
   - Character limits

5. **FormData Testing:**
   - Routes 6, 12, and 17 use FormData (not JSON)
   - In supertest: use `.attach()` for files and `.field()` for text fields
   - Example:
     ```javascript
     await agent
       .post('/api/tweets/tweet')
       .field('content', 'Tweet text')
       .attach('tweetPics', buffer, 'image.jpg')
     ```

6. **Session Cookie Configuration:**
   - Cookie name: `connect.sid` (default express-session)
   - httpOnly: true
   - secure: false in development, true in production
   - maxAge: 24 hours (86400000 ms)
   - sameSite: 'lax'
