# Authentication Integration Guide

## Overview
This document describes the authentication system integration between the Nebula frontend and backend.

## Backend Authentication Endpoints

The backend provides the following authentication endpoints:

### 1. Register
- **Endpoint**: `POST /auth/register`
- **Request Body**:
  ```json
  {
    "firstName": "string",
    "lastName": "string",
    "email": "string",
    "password": "string"
  }
  ```
- **Response**:
  ```json
  {
    "success": true,
    "message": "User registered successfully",
    "data": {
      "user": {
        "id": "string",
        "firstName": "string",
        "lastName": "string",
        "email": "string",
        "role": "string"
      },
      "accessToken": "string",
      "refreshToken": "string"
    }
  }
  ```

### 2. Login
- **Endpoint**: `POST /auth/login`
- **Request Body**:
  ```json
  {
    "email": "string",
    "password": "string"
  }
  ```
- **Response**: Same as Register

### 3. Refresh Token
- **Endpoint**: `POST /auth/refresh`
- **Request Body**:
  ```json
  {
    "refreshToken": "string"
  }
  ```
- **Response**:
  ```json
  {
    "success": true,
    "message": "Token refreshed successfully",
    "data": {
      "accessToken": "string",
      "refreshToken": "string"
    }
  }
  ```

### 4. Logout
- **Endpoint**: `POST /auth/logout`
- **Request Body**:
  ```json
  {
    "refreshToken": "string"
  }
  ```
- **Response**:
  ```json
  {
    "success": true,
    "message": "Logged out successfully"
  }
  ```

## Frontend Implementation

### Architecture

The frontend authentication system consists of:

1. **AuthService** (`src/services/auth.service.ts`)
   - Handles all authentication API calls
   - Manages token storage
   - Provides methods for login, register, logout, and token refresh

2. **AuthContext** (`src/context/AuthContext.tsx`)
   - React Context for global authentication state
   - Provides user data and authentication status
   - Exposes login, register, and logout functions

3. **TokenStorage** (`src/api/tokenStorage.ts`)
   - Manages localStorage for tokens and user data
   - Provides methods to get/set/clear tokens

4. **ProtectedRoute** (`src/components/ProtectedRoute.tsx`)
   - HOC to protect routes that require authentication
   - Redirects unauthenticated users to login

5. **Axios Interceptors** (`src/api/axiosInstance.ts`)
   - Automatically adds Authorization header to requests
   - Handles token refresh on 401 errors
   - Manages token expiration

### Usage

#### 1. Using Authentication in Components

```typescript
import { useAuth } from '@/context/AuthContext';

function MyComponent() {
  const { user, isAuthenticated, login, logout } = useAuth();

  // Access user data
  console.log(user?.email);

  // Check authentication status
  if (isAuthenticated) {
    // User is logged in
  }

  // Login
  const handleLogin = async () => {
    try {
      await login({ email: 'user@example.com', password: 'password' });
    } catch (error) {
      console.error('Login failed:', error);
    }
  };

  // Logout
  const handleLogout = async () => {
    await logout();
  };
}
```

#### 2. Protecting Routes

Routes under `/app/*` are automatically protected by the `ProtectedRoute` component in `AppLayout`.

```typescript
// In AppLayout.tsx
<ProtectedRoute>
  <div className="min-h-screen bg-[#0A0A0A]">
    <AppSidebar />
    <main className="ml-60 min-h-screen flex flex-col">
      <Topbar />
      <Outlet />
    </main>
  </div>
</ProtectedRoute>
```

#### 3. Making Authenticated API Calls

All API calls through `axiosInstance` automatically include the authentication token:

```typescript
import axiosInstance from '@/api/axiosInstance';

// Token is automatically added to headers
const response = await axiosInstance.get('/api/some-endpoint');
```

### Token Management

#### Storage
- **accessToken**: Stored in localStorage, used for API authentication
- **refreshToken**: Stored in localStorage, used to refresh access token
- **user**: User data stored in localStorage

#### Automatic Token Refresh
The axios interceptor automatically:
1. Detects when access token expires (401 error)
2. Uses refresh token to get new access token
3. Retries the failed request with new token
4. Redirects to login if refresh fails

### Session Persistence

The application automatically restores user sessions on page reload:
- On app initialization, `AuthContext` checks localStorage for tokens
- If valid tokens exist, user is automatically logged in
- If tokens are invalid or expired, user is logged out

## Testing Authentication

### 1. Register a New User
1. Navigate to `/signup`
2. Fill in the registration form
3. Submit the form
4. You should be redirected to `/app/dashboard`

### 2. Login
1. Navigate to `/login`
2. Enter email and password
3. Submit the form
4. You should be redirected to `/app/dashboard`

### 3. Logout
1. Click on the user avatar in the top-right corner
2. Click "Log Out"
3. You should be redirected to the home page

### 4. Protected Routes
1. Try accessing `/app/dashboard` without logging in
2. You should be redirected to `/login`

## Error Handling

The authentication system handles various error scenarios:

1. **Invalid Credentials**: Shows error message on login page
2. **Network Errors**: Shows toast notification
3. **Token Expiration**: Automatically refreshes token
4. **Refresh Token Expiration**: Redirects to login
5. **API Errors**: Shows appropriate error messages

## Security Considerations

1. **Token Storage**: Tokens are stored in localStorage (consider httpOnly cookies for production)
2. **HTTPS**: Always use HTTPS in production
3. **Token Expiration**: Access tokens expire after a set time
4. **Password Requirements**: Enforced on both frontend and backend
5. **CORS**: Properly configured on backend

## Environment Variables

Make sure to set the following in your `.env` file:

```env
VITE_API_URL=http://localhost:5000/api
```

## Troubleshooting

### Issue: 401 Unauthorized Error
- **Solution**: Check if backend is running and accessible
- Verify API URL in `.env` file
- Check if tokens are being stored correctly

### Issue: CORS Error
- **Solution**: Ensure backend CORS is configured to allow frontend origin

### Issue: Token Not Refreshing
- **Solution**: Check if refresh token endpoint is working
- Verify refresh token is being stored correctly

### Issue: User Not Persisting on Reload
- **Solution**: Check localStorage for tokens
- Verify `AuthContext` initialization logic

## Future Enhancements

1. Implement OAuth (Google, GitHub, etc.)
2. Add two-factor authentication
3. Implement password reset functionality
4. Add email verification
5. Use httpOnly cookies instead of localStorage
6. Add session timeout warnings
