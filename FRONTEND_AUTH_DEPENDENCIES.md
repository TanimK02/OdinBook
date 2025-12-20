# Frontend Authentication Dependency Chart

## Overview
This document maps out all authentication dependencies and flows in the frontend application.

**Authentication Method:** Session-based authentication using HTTP cookies (not JWT tokens)

```
┌─────────────────────────────────────────────────────────────────┐
│                      HTTP Session Cookie                         │
│          (Automatically managed by browser/axios)                │
│            ⚠️ Requires withCredentials: true                     │
└────────────────────┬────────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────────┐
│                          App.jsx                                 │
│  ┌───────────────────────────────────────────────────────┐      │
│  │ Auth State Management:                                │      │
│  │  • isAuthenticated (boolean)                          │      │
│  │  • user (object)                                      │      │
│  │  • loading (boolean)                                  │      │
│  │                                                       │      │
│  │ Auth Functions:                                       │      │
│  │  • fetchUserInfo()                                   │      │
│  │  • handleLogin(userData)                             │      │
│  │  • handleLogout()                                    │      │
│  │  • refreshUser()                                     │      │
│  │                                                       │      │
│  │ Route Protection:                                     │      │
│  │  • <Navigate> redirects based on auth status         │      │
│  └───────────────────────────────────────────────────────┘      │
└──────┬──────────────────┬──────────────────┬────────────────────┘
       │                  │                  │
       │ (not auth)       │ (authenticated)  │ (authenticated)
       ▼                  ▼                  ▼
┌─────────────┐   ┌──────────────┐   ┌──────────────┐
│  Login.jsx  │   │ Register.jsx │   │  Layout.jsx  │
├─────────────┤   ├──────────────┤   ├──────────────┤
│ Receives:   │   │ Receives:    │   │ Receives:    │
│ • onLogin   │   │ • onLogin    │   │ • user       │
│             │   │              │   │ • onLogout   │
│ Actions:    │   │ Actions:     │   │ • onUserUpdate│
│ • POST      │   │ • POST       │   │              │
│   /login    │   │   /register  │   │ Wraps:       │
│ • GET       │   │ • GET        │   │ • <Outlet/>  │
│   /userinfo │   │   /userinfo  │   │              │
│ • onLogin() │   │ • onLogin()  │   │ Renders:     │
│   (session  │   │   (session   │   │ • Sidebar    │
│   cookie    │   │   cookie     │   │              │
│   set)      │   │   set)       │   │              │
│ • navigate  │   │ • navigate   │   │              │
└─────────────┘   └──────────────┘   └──────┬───────┘
                                             │
                                             ▼
                                    ┌────────────────┐
                                    │  Sidebar.jsx   │
                                    ├────────────────┤
                                    │ Receives:      │
                                    │ • user         │
                                    │ • onLogout     │
                                    │ • onUserUpdate │
                                    │                │
                                    │ Actions:       │
                                    │ • Display user │
                                    │ • Logout btn   │
                                    │ • Edit profile │
                                    │ • Settings     │
                                    └────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                     Protected Routes (via Layout)                │
└──────┬──────────────────┬──────────────────┬────────────────────┘
       │                  │                  │
       ▼                  ▼                  ▼
┌─────────────┐   ┌──────────────┐   ┌─────────────────┐
│  Home.jsx   │   │ Profile.jsx  │   │ TweetDetail.jsx │
├─────────────┤   ├──────────────┤   ├─────────────────┤
│ Receisession│   │ Uses session │   │ Uses session    │
│ cookie      │   │ cookie       │   │ cookie          │
│ (automatic) │   │ (automatic)  │   │ (automatic)     │
│ Uses token  │   │ Uses token   │   │ Uses token from │
│ from        │   │ from         │   │ localStorage    │
│ localStorage│   │ localStorage │   │                 │
│             │   │              │   │                 │
│ Renders:    │   │ Renders:     │   │ Renders:        │
│ • Compose   │   │ • TweetCard  │   │ • TweetCard     │
│   Tweet     │   │              │   │ • ComposeTweet  │
│ • TweetCard │   │              │   │                 │
└──────┬──────┘   └──────┬───────┘   └────────┬────────┘
       │                  │                    │
       └──────────────────┴────────────────────┘
                          │
            ┌─────────────┴─────────────┐
            ▼                           ▼
    ┌───────────────┐          ┌───────────────┐
    │ComposeTweet.jsx│         │ TweetCard.jsx │
    ├───────────────┤          ├───────────────┤
    │ Receisession  │          │ Uses session  │
    │ cookie        │          │ cookie        │
    │ (automatic)   │          │ (automatic)   │
    │ Uses token    │          │ Uses token    │
    │ from          │          │ from          │
    │ localStorage  │          │ localStorage  │
    │               │          │               │
    │ Actions:      │          │ Actions:      │
    │ • POST tweet  │          │ • Like tweet  │
    │ • Show avatar │          │ • Delete      │
    │               │          │   (if owner)  │
    └───────────────┘          └───────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                      API Communication Pattern                   │
│                                                                  │
│  All authenticated requests:                                     │
│   Session cookie automatically included with every request       │
│   ⚠️ MUST set: axios.defaults.withCredentials = true            │
│   No manual headers needed - browser handles it!                │
└─────────────────────────────────────────────────────────────────┘
```

## Key Auth Dependencies

### 1. App.jsx → Central Auth Hub
- **Manages all auth state**
  - `isAuthenticated` (boolean)
  - `user` (object)
  - `loading` (boolean)
- **Controls route access**
  - Redirects to `/login` if not authenticated
  - Redirects to `/` if authenticated and trying to access login/register
- **Provides authuserData)` - No token needed, session cookie set by server
  - `handleLogout()`
  - `refreshUser()`
  - `fetchUserInfo()` - Session cookie sent automatically
  - `fetchUserInfo(token)`

### 2. Login/Register → Auth Entry Points
- **Dependencies:**
  - `onLogin` callback from App
- **Actions:**
  - Server sets session cookie automatically (with `withCredentials: true`)
  - GET to `/api/users/userinfo` (session cookie included automatically)
  - Call `onLogin()` to update App state
  - Navigate to home page
- **⚠️ Critical:** Must have `axios.defaults.withCredentials = true` setpdate App state
  - Navigate to home page

### 3. Layout → Auth Wrapper
- **Dependencies:**
  - `user` prop from App
  - `onLogout` callback from App
  - `onUserUpdate` callback from App
- **Functions:**
  - Protected by route guard in App.jsx
  - Wraps all authenticated routes with `<Outlet />`
  - Passes props down to Sidebar

### 4. Pages (Home/Profile/TweetDetail) → Auth Consumers
- **Dependencies:**
  - Session cookie (automatically sent with every request)
- **Functions:**
  - Display user-specific content
  - Make authenticated API requests
  - Pass user data to child components
- **Note:** No need to manually pass any auth headers!
  - Pass user data to child components

### 5. Components (Sidebar/ComposeTweet/TweetCard) → Auth Display
- **Session cookie (automatically sent with actions)
- **Functions:**
  - Display user information
  - Show/hide features based on user identity
  - Perform authenticated actions (post, like, delete)
- **Note:** All API calls are automatically authenticated via session cookie
  - Show/hide features based on user identity
  - Perform authenticated actions (post, like, delete)

## Auth Floattempts to fetch user info on mount
2. If session cookie exists and is valid:
   - Calls `fetchUserInfo()` (session cookie sent automatically)
   - Sets `isAuthenticated = true`
   - Sets `user` state
3. If no session or session expired:
   - Server returns 401 Unauthorizedtoken)`
   - Sets `isAuthenticated = true`
   - Sets `user` state
3. If no token or invalid:
   - Sets `loading = false`
   - Redirects to `/login`
 with `withCredentials: true`
3. Server validates credentials and creates session
4. Server sends session cookie in response (httpOnly, secure)
5. Browser automatically stores session cookie
6. GET to `/api/users/userinfo` (session cookie sent automatically)
7. Call `onLogin(userData)` to update App state
8. App.jsx sets user state and `isAuthenticated = true`
9. Call `onLogin(token, userData)`
6. App.jsx saves token to localStorage
7. App.jsx sets user state and `isAuthenticated = true`
8. Navigate to home page
 with `withCredentials: true`
3. Server creates user and session
4. Server sends session cookie in response
5. Browser automatically stores session cookie
6. GET to `/api/users/userinfo` (session cookie sent automatically)
7. Call `onLogin(userData)` to update App state
8. App.jsx sets user state and `isAuthenticated = true`
9. Call `onLogin(token, userData)`
6. App.jsx saves token to localStorage
7. App.jsx sets user state and `isAuthenticated = true`
8. Navigate to home page

###POST to `/api/users/logout` (with session cookie)
4. Server destroys session and clears cookie
5. App.jsx clears user state
6. App.jsx sets `isAuthenticated = false`
7. App.jsx removes token from localStorage
4. App.jsx clears user state
5. App.jsx sets `isAuthenticated = false`
6. Redirects to `/login`are automatically authenticated via session cookies:
```javascript
// ⚠️ Set this ONCE at app initialization
axios.defaults.withCredentials = true;

// Then all requests are automatically authenticated
axios.get(`${API_URL}/api/tweets/tweets/page/1`);
// Session cookie is automatically included!

// No need for:
// - localStorage.getItem('token')
// - Authorization headers
// - Manual token managementst token = localStorage.getItem('token');
axios.request({
  headers: { Authorization: `Bearer ${token}` }
});
```

## Component Prop Flow

```
App.jsx
├── Login.jsx
│   └── Props: { onLogin }
├── Register.jsx
│   └── Props: { onLogin }
└── Layout.jsx
    ├── Props: { user, onLogout, onUserUpdate }
    └── Sidebar.jsx
        ├── Props: { user, onLogout, onUserUpdate }
        └── Outlet (Routes)
            ├── Home.jsx
            │   ├── Props: { user }
            │   ├── ComposeTweet.jsx
            │   │   └── Props: { user }
            │   └── TweetCard.jsx
            │       └── Props: { currentUser }
            ├── Profile.jsx
            │   ├── Props: { currentUser }
            │   └── TweetCard.jsx
            │       └── Props: { currentUser }
            └── TweetDetail.jsx
     Session Cookie Storage**: 
   - ✅ **More Secure**: Cookies can be `httpOnly` (not accessible via JavaScript)
   - ✅ **XSS Protection**: httpOnly cookies can't be stolen by XSS attacks
   - ✅ **Automatic Management**: Browser handles cookie storage/sending
   - ⚠️ **CSRF Vulnerability**: Need CSRF protection (not in current implementation)
   - ⚠️ **CORS Requirement**: Must set `withCredentials: true` in axios

2. **Route Protection**: Implemented at App level
   - All protected routes wrapped in auth check
   - Redirects handled automatically
   - 401 responses trigger redirect to login

3. **API Authorization**: Session-based
   - Session ID sent automatically via cookie
   - No manual header management needed
   - Session validated on backend via Passport.js

4. **User State Sync**: 
   - Initial fetch on app load checks for valid session
   - `refreshUser()` available for manual updates
   - Session expiration handled by server (24 hour default)

5. **Critical Setup Requirements**:
   ```javascript
   // ⚠️ MUST be set or auth will not work!
   axios.defaults.withCredentials = true;
   
   // Backend CORS must allow credentials
   cors({
     origin: 'http://localhost:5173',
     credentials: true
   })
   ```

## Session vs Token Authentication

### Current Implementation: Session-based
- ✅ More secure (httpOnly cookies)
- ✅ Simpler frontend (no token management)
- ✅ Server controls expiration
- ❌ Harder to scale across multiple servers
- ❌ Not suitable for mobile apps

### Alternative: JWT Token (localStorage)
- ❌ Less secure (accessible via JS)
- ❌ More complex frontend (manual token management)
- ✅ Easier to scale (stateless)
- ✅ Works well with mobile apps

3. **API Authorization**: Bearer token in headers
   - Consistent pattern across all API calls
   - Token validated on backend

4. **User State Sync**: 
   - Initial fetch on app load
   - `refreshUser()` available for manual updates
   - No automatic token refresh mechanism
