# Authentication Testing Guide

## Prerequisites
- Backend server running on `http://localhost:5000`
- Frontend server running on `http://localhost:5173` (or your configured port)
- MongoDB database connected and running

## Test Scenarios

### 1. User Registration ✅

**Steps:**
1. Navigate to `http://localhost:5173/signup`
2. Fill in the registration form:
   - First Name: `John`
   - Last Name: `Doe`
   - Email: `john.doe@example.com`
   - Password: `Test123!` (must meet requirements)
   - Confirm Password: `Test123!`
3. Click "Create Account"

**Expected Results:**
- ✅ Success toast notification appears
- ✅ User is redirected to `/app/dashboard`
- ✅ User data is visible in the top-right corner
- ✅ Tokens are stored in localStorage
- ✅ User can access protected routes

**Verification:**
```javascript
// Open browser console and check localStorage
localStorage.getItem('accessToken')  // Should return a JWT token
localStorage.getItem('refreshToken') // Should return a JWT token
localStorage.getItem('user')         // Should return user JSON
```

---

### 2. User Login ✅

**Steps:**
1. Navigate to `http://localhost:5173/login`
2. Enter credentials:
   - Email: `john.doe@example.com`
   - Password: `Test123!`
3. Click "Sign In"

**Expected Results:**
- ✅ Success toast notification appears
- ✅ User is redirected to `/app/dashboard`
- ✅ User data is visible in the UI
- ✅ Tokens are stored in localStorage

**Test Invalid Credentials:**
1. Enter wrong password
2. Click "Sign In"
3. Error message should appear: "Invalid email or password"

---

### 3. Session Persistence ✅

**Steps:**
1. Login successfully
2. Refresh the page (F5)

**Expected Results:**
- ✅ User remains logged in
- ✅ User data is still visible
- ✅ No redirect to login page
- ✅ Dashboard content loads normally

**Verification:**
```javascript
// Check if user is restored from localStorage
const user = JSON.parse(localStorage.getItem('user'))
console.log(user) // Should show user data
```

---

### 4. Protected Routes ✅

**Test A: Accessing Protected Route While Logged Out**

**Steps:**
1. Make sure you're logged out (clear localStorage if needed)
2. Try to navigate directly to `http://localhost:5173/app/dashboard`

**Expected Results:**
- ✅ Redirected to `/login`
- ✅ After login, redirected back to `/app/dashboard`

**Test B: Accessing Protected Route While Logged In**

**Steps:**
1. Login successfully
2. Navigate to any protected route:
   - `/app/dashboard`
   - `/app/create/text-to-image`
   - `/app/profile`

**Expected Results:**
- ✅ Content loads without redirect
- ✅ User can access all features

---

### 5. Logout Functionality ✅

**Steps:**
1. Login successfully
2. Click on user avatar in top-right corner
3. Click "Log Out"

**Expected Results:**
- ✅ User is redirected to home page (`/`)
- ✅ All tokens are cleared from localStorage
- ✅ User data is removed from state
- ✅ Trying to access protected routes redirects to login

**Verification:**
```javascript
// Check localStorage is cleared
localStorage.getItem('accessToken')  // Should return null
localStorage.getItem('refreshToken') // Should return null
localStorage.getItem('user')         // Should return null
```

---

### 6. API Requests with Authentication ✅

**Steps:**
1. Login successfully
2. Navigate to `/app/create/text-to-image`
3. Try to generate an image

**Expected Results:**
- ✅ Request includes `Authorization: Bearer <token>` header
- ✅ Request succeeds (no 401 error)
- ✅ Image is generated successfully

**Verification (Browser DevTools):**
1. Open Network tab
2. Make an API request
3. Check request headers:
   ```
   Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   ```

---

### 7. Token Refresh (Advanced) ✅

**Note:** This test requires waiting for the access token to expire (usually 15-60 minutes).

**Alternative Test (Manual):**
1. Login successfully
2. Open browser console
3. Manually expire the access token:
   ```javascript
   // Set an expired token
   localStorage.setItem('accessToken', 'expired_token')
   ```
4. Make an API request (e.g., generate an image)

**Expected Results:**
- ✅ Request fails with 401
- ✅ Axios interceptor detects 401
- ✅ Refresh token is used to get new access token
- ✅ Original request is retried with new token
- ✅ Request succeeds

**If Refresh Token is Also Expired:**
- ✅ User is logged out
- ✅ Redirected to login page
- ✅ Toast notification: "Session expired. Please log in again."

---

### 8. Error Handling ✅

**Test A: Network Error**

**Steps:**
1. Stop the backend server
2. Try to login

**Expected Results:**
- ✅ Error toast: "Network error. Please try again."
- ✅ No crash or white screen

**Test B: Invalid Email Format**

**Steps:**
1. Enter invalid email: `notanemail`
2. Try to submit

**Expected Results:**
- ✅ HTML5 validation prevents submission
- ✅ Error message: "Please enter a valid email"

**Test C: Password Too Short**

**Steps:**
1. Enter password: `123`
2. Try to submit

**Expected Results:**
- ✅ Backend validation error
- ✅ Error toast with appropriate message

---

### 9. Multiple Tabs/Windows ✅

**Steps:**
1. Login in Tab 1
2. Open Tab 2 with the same app
3. Logout from Tab 1
4. Try to make an API request in Tab 2

**Expected Results:**
- ✅ Tab 2 should detect missing tokens
- ✅ Tab 2 should redirect to login (on next API call)

**Note:** Real-time sync across tabs requires additional implementation (e.g., localStorage events).

---

### 10. Password Requirements ✅

**Steps:**
1. Go to signup page
2. Try different passwords:
   - `short` - Should fail (too short)
   - `alllowercase` - Should fail (no uppercase)
   - `ALLUPPERCASE` - Should fail (no lowercase)
   - `NoNumbers!` - Should fail (no numbers)
   - `Valid123!` - Should pass ✅

**Expected Results:**
- ✅ Visual indicators show which requirements are met
- ✅ Form submission is prevented if requirements not met
- ✅ Backend also validates password requirements

---

## Automated Testing (Optional)

You can create automated tests using tools like:
- **Cypress** - E2E testing
- **Playwright** - E2E testing
- **Jest + React Testing Library** - Unit/Integration testing

### Example Cypress Test:

```javascript
describe('Authentication', () => {
  it('should login successfully', () => {
    cy.visit('/login')
    cy.get('input[type="email"]').type('john.doe@example.com')
    cy.get('input[type="password"]').type('Test123!')
    cy.get('button[type="submit"]').click()
    cy.url().should('include', '/app/dashboard')
    cy.contains('John Doe').should('be.visible')
  })

  it('should logout successfully', () => {
    cy.visit('/app/dashboard')
    cy.get('[data-testid="user-avatar"]').click()
    cy.contains('Log Out').click()
    cy.url().should('eq', '/')
  })
})
```

---

## Common Issues & Solutions

### Issue: "401 Unauthorized" on all requests
**Solution:**
- Check if backend is running
- Verify `VITE_API_URL` in `.env`
- Check if tokens are being stored correctly
- Clear localStorage and login again

### Issue: CORS errors
**Solution:**
- Ensure backend CORS is configured correctly
- Check if frontend origin is allowed
- Verify API URL doesn't have trailing slash

### Issue: Token not refreshing
**Solution:**
- Check refresh token endpoint in backend
- Verify refresh token is being stored
- Check axios interceptor logic

### Issue: User not persisting on reload
**Solution:**
- Check if tokens are in localStorage
- Verify `AuthContext` initialization
- Check browser console for errors

### Issue: Infinite redirect loop
**Solution:**
- Check `ProtectedRoute` logic
- Verify authentication check is working
- Clear localStorage and try again

---

## Performance Testing

### Load Testing
- Test with multiple concurrent users
- Verify token refresh doesn't cause race conditions
- Check for memory leaks in long sessions

### Security Testing
- Test XSS vulnerabilities
- Test CSRF protection
- Verify tokens are not exposed in URLs
- Check for secure token storage

---

## Checklist

Before deploying to production:

- [ ] All test scenarios pass
- [ ] Error handling works correctly
- [ ] Token refresh is working
- [ ] Session persistence is working
- [ ] Protected routes are secure
- [ ] Logout clears all data
- [ ] Password requirements are enforced
- [ ] HTTPS is enabled in production
- [ ] CORS is properly configured
- [ ] Environment variables are set correctly
- [ ] Tokens have appropriate expiration times
- [ ] Rate limiting is implemented on backend
- [ ] Logging is in place for debugging

---

## Success Criteria

✅ **Authentication is working correctly if:**
1. Users can register new accounts
2. Users can login with correct credentials
3. Invalid credentials are rejected
4. Sessions persist across page reloads
5. Protected routes are inaccessible without login
6. Logout clears all authentication data
7. API requests include authentication tokens
8. Token refresh works automatically
9. Error messages are clear and helpful
10. No security vulnerabilities exist

---

**Happy Testing! 🎉**
