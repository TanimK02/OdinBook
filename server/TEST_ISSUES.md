# Test Issues - Identified Failures

**Test Run Date**: 2024
**Total Tests**: 71
**Passed**: 60
**Failed**: 11

---

## Critical Issues

### 1. Database Cleanup Problem - Unique Constraint Violations

**Error**: `PrismaClientKnownRequestError: Unique constraint failed on the fields: (email)`

**Location**: `tests/user.test.js:623`

**Cause**: Test users from previous test suites are not being properly cleaned up between tests, causing email/username collisions when creating new test users.

**Affected Tests**:
- All tests in "PUT /api/users/update-username" suite (4 tests)

**Root Cause**: The `beforeEach` hook in user.test.js uses:
```javascript
await prisma.user.deleteMany({
    where: {
        username: { in: [user1.username, user2.username] }
    }
});
```

This only deletes users with specific usernames, but tests create users with different usernames/emails that persist across test runs.

**Solution**:
```javascript
beforeEach(async () => {
    // Delete ALL test users to prevent conflicts
    await prisma.user.deleteMany({});
    // Or use a more specific pattern:
    // await prisma.user.deleteMany({
    //     where: {
    //         OR: [
    //             { email: { contains: 'test' } },
    //             { username: { contains: 'test' } }
    //         ]
    //     }
    // });
});
```

---

### 2. Error Status Code Mismatches - Service Layer Error Handling

**Error Type**: Expected 400, Received 500

**Affected Tests**:
1. **POST /api/users/register - Duplicate username**
   - Expected: 400
   - Received: 500
   - Location: `tests/user.test.js:106`

2. **POST /api/users/register - Duplicate email**
   - Expected: 400
   - Received: 500
   - Location: `tests/user.test.js:130`

3. **PUT /api/users/change-password - Incorrect old password**
   - Expected: 400
   - Received: 500
   - Location: `tests/user.test.js:484`

4. **PUT /api/users/change-password - Change password successfully**
   - Expected: 200
   - Received: 500
   - Location: `tests/user.test.js:499`

**Root Cause**: Service functions are not properly catching and handling Prisma errors or validation failures. When these errors occur, they bubble up as unhandled exceptions, causing Express to return 500 Internal Server Error instead of appropriate client error codes.

**Files to Fix**:

#### `services/userService.js`

**registerUser function** needs proper error handling:
```javascript
export const registerUser = async (username, email, password) => {
    try {
        // Check for existing user first
        const existingUser = await prisma.user.findFirst({
            where: {
                OR: [
                    { email: email },
                    { username: username }
                ]
            }
        });

        if (existingUser) {
            throw new Error('Email or username already exists');
        }

        const passwordHash = await bcrypt.hash(password, 10);
        const user = await prisma.user.create({
            data: {
                username,
                email,
                passwordHash,
                profile: {
                    create: {}
                }
            }
        });
        return user;
    } catch (error) {
        // If it's our custom error, rethrow it
        if (error.message === 'Email or username already exists') {
            throw error;
        }
        // Handle Prisma unique constraint errors
        if (error.code === 'P2002') {
            throw new Error('Email or username already exists');
        }
        throw error;
    }
};
```

**updatePassword function** needs password validation:
```javascript
export const updatePassword = async (userId, oldPassword, newPassword) => {
    try {
        const user = await prisma.user.findUnique({
            where: { id: userId }
        });

        if (!user) {
            throw new Error('User not found');
        }

        // Verify old password
        const isValid = await bcrypt.compare(oldPassword, user.passwordHash);
        if (!isValid) {
            throw new Error('Old password is incorrect');
        }

        const newPasswordHash = await bcrypt.hash(newPassword, 10);
        await prisma.user.update({
            where: { id: userId },
            data: { passwordHash: newPasswordHash }
        });

        return { message: 'Password changed successfully' };
    } catch (error) {
        throw error;
    }
};
```

#### `controllers/userController.js`

**register controller** needs proper error handling:
```javascript
export const register = async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { username, email, password } = req.body;

    try {
        const user = await registerUser(username, email, password);
        
        req.login(user, (err) => {
            if (err) {
                return res.status(500).json({ error: "Failed to log in after registration" });
            }
            res.status(201).json({
                message: "User registered successfully",
                user: {
                    id: user.id,
                    username: user.username,
                    email: user.email
                }
            });
        });
    } catch (error) {
        // Handle specific errors with appropriate status codes
        if (error.message === 'Email or username already exists') {
            return res.status(400).json({ error: error.message });
        }
        res.status(500).json({ error: "Registration failed" });
    }
};
```

**changePassword controller** needs proper error handling:
```javascript
export const changePassword = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { oldPassword, newPassword } = req.body;

    try {
        const result = await updatePassword(req.user.id, oldPassword, newPassword);
        res.status(200).json(result);
    } catch (error) {
        // Handle specific errors
        if (error.message === 'Old password is incorrect') {
            return res.status(400).json({ error: error.message });
        }
        if (error.message === 'User not found') {
            return res.status(404).json({ error: error.message });
        }
        res.status(500).json({ error: "Failed to change password" });
    }
};
```

---

## Summary of Required Fixes

### Priority 1: Database Cleanup (Blocks 4 tests)
- **File**: `tests/user.test.js`
- **Change**: Update `beforeEach` hook to delete all users or use better filtering
- **Impact**: Fixes all "PUT /api/users/update-username" test failures

### Priority 2: Error Handling in userService.js (Blocks 4 tests)
- **File**: `services/userService.js`
- **Functions to fix**:
  - `registerUser` - Add duplicate check and proper error handling
  - `updatePassword` - Add password verification and error handling
- **Impact**: Fixes registration and password change test failures

### Priority 3: Error Handling in userController.js (Blocks 4 tests)
- **File**: `controllers/userController.js`
- **Functions to fix**:
  - `register` - Catch and return 400 for duplicate errors
  - `changePassword` - Catch and return 400 for incorrect password
- **Impact**: Ensures proper HTTP status codes are returned

---

## Testing Strategy After Fixes

1. **Run user tests in isolation**:
   ```bash
   npm test -- tests/user.test.js
   ```

2. **Verify database cleanup**:
   - Check that no test users persist after test run
   - Confirm unique constraint errors are gone

3. **Verify error codes**:
   - Duplicate registration returns 400
   - Incorrect password returns 400
   - Successful operations return 200/201

4. **Run all tests**:
   ```bash
   npm test
   ```
