# 🔐 Authentication Quick Reference

## 📦 Import Authentication

```typescript
import { useAuth } from '@/context/AuthContext';
```

## 🎯 Using Authentication in Components

### Get User Data
```typescript
const { user, isAuthenticated, isLoading } = useAuth();

// Access user properties
console.log(user?.email);        // User email
console.log(user?.firstName);    // First name
console.log(user?.lastName);     // Last name
console.log(user?.name);         // Full name
console.log(user?.role);         // User role
```

### Login
```typescript
const { login } = useAuth();

const handleLogin = async () => {
  try {
    await login({ 
      email: 'user@example.com', 
      password: 'password123' 
    });
    // Success! User is now logged in
    navigate('/app/dashboard');
  } catch (error) {
    console.error('Login failed:', error);
  }
};
```

### Register
```typescript
const { register } = useAuth();

const handleRegister = async () => {
  try {
    await register({
      firstName: 'John',
      lastName: 'Doe',
      email: 'john@example.com',
      password: 'Password123!'
    });
    // Success! User is registered and logged in
    navigate('/app/dashboard');
  } catch (error) {
    console.error('Registration failed:', error);
  }
};
```

### Logout
```typescript
const { logout } = useAuth();

const handleLogout = async () => {
  await logout();
  navigate('/');
};
```

### Check Authentication Status
```typescript
const { isAuthenticated, isLoading } = useAuth();

if (isLoading) {
  return <LoadingSpinner />;
}

if (!isAuthenticated) {
  return <Navigate to="/login" />;
}

return <ProtectedContent />;
```

## 🛡️ Protecting Routes

### Method 1: Using ProtectedRoute Component
```typescript
import ProtectedRoute from '@/components/ProtectedRoute';

<Route path="/app" element={
  <ProtectedRoute>
    <AppLayout />
  </ProtectedRoute>
} />
```

### Method 2: Manual Check in Component
```typescript
const MyComponent = () => {
  const { isAuthenticated } = useAuth();
  
  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }
  
  return <div>Protected Content</div>;
};
```

## 🌐 Making Authenticated API Calls

### Automatic (Recommended)
```typescript
import axiosInstance from '@/api/axiosInstance';

// Token is automatically added to headers
const response = await axiosInstance.get('/api/data');
const data = await axiosInstance.post('/api/create', { name: 'Test' });
```

### Manual (If needed)
```typescript
import { TokenStorage } from '@/api/tokenStorage';

const token = TokenStorage.getAccessToken();
const response = await fetch('/api/data', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
});
```

## 💾 Token Storage

### Get Tokens
```typescript
import { TokenStorage } from '@/api/tokenStorage';

const accessToken = TokenStorage.getAccessToken();
const refreshToken = TokenStorage.getRefreshToken();
const user = TokenStorage.getUser();
```

### Set Tokens (Usually handled automatically)
```typescript
TokenStorage.setAccessToken(token);
TokenStorage.setRefreshToken(token);
TokenStorage.setUser(userData);
```

### Clear Tokens (Logout)
```typescript
TokenStorage.clearTokens();
```

## 🎨 UI Examples

### Show User Avatar
```typescript
const { user } = useAuth();

<div className="avatar">
  {user?.name?.[0]?.toUpperCase() || 'U'}
</div>
```

### Conditional Rendering
```typescript
const { isAuthenticated } = useAuth();

{isAuthenticated ? (
  <button onClick={handleLogout}>Logout</button>
) : (
  <Link to="/login">Login</Link>
)}
```

### Loading State
```typescript
const { isLoading } = useAuth();

{isLoading ? (
  <Spinner />
) : (
  <Content />
)}
```

## 🔄 Token Refresh

Token refresh is **automatic**! The axios interceptor handles it:

```typescript
// This happens automatically in axiosInstance.ts
// You don't need to do anything!

// When access token expires:
// 1. Request fails with 401
// 2. Interceptor catches error
// 3. Calls /auth/refresh with refresh token
// 4. Gets new access token
// 5. Retries original request
// 6. Returns data to your component
```

## ⚠️ Error Handling

### Login/Register Errors
```typescript
try {
  await login({ email, password });
} catch (error: any) {
  const message = error?.response?.data?.message || 'Login failed';
  toast.error(message);
}
```

### API Request Errors
```typescript
try {
  const response = await axiosInstance.get('/api/data');
} catch (error: any) {
  if (error.response?.status === 401) {
    // Unauthorized - user will be logged out automatically
  } else if (error.response?.status === 403) {
    // Forbidden - user doesn't have permission
  } else {
    // Other error
    toast.error('Something went wrong');
  }
}
```

## 🧪 Testing Authentication

### Check if Logged In (Console)
```javascript
// Open browser console
localStorage.getItem('accessToken')  // Should return JWT token
localStorage.getItem('user')         // Should return user JSON
```

### Manually Logout (Console)
```javascript
localStorage.clear()
window.location.reload()
```

### Manually Set User (Console)
```javascript
const mockUser = {
  id: '1',
  firstName: 'Test',
  lastName: 'User',
  name: 'Test User',
  email: 'test@example.com',
  role: 'user'
};
localStorage.setItem('user', JSON.stringify(mockUser));
localStorage.setItem('accessToken', 'mock_token');
window.location.reload();
```

## 📝 Common Patterns

### Redirect After Login
```typescript
const location = useLocation();
const from = location.state?.from?.pathname || '/app/dashboard';

await login({ email, password });
navigate(from, { replace: true });
```

### Show User Greeting
```typescript
const { user } = useAuth();

<h1>Welcome back, {user?.firstName}!</h1>
```

### Conditional Navigation
```typescript
const { isAuthenticated } = useAuth();

<nav>
  <Link to="/">Home</Link>
  {isAuthenticated ? (
    <>
      <Link to="/app/dashboard">Dashboard</Link>
      <button onClick={handleLogout}>Logout</button>
    </>
  ) : (
    <>
      <Link to="/login">Login</Link>
      <Link to="/signup">Sign Up</Link>
    </>
  )}
</nav>
```

## 🚨 Important Notes

1. **Never store passwords** - Only tokens are stored
2. **Tokens are in localStorage** - Consider httpOnly cookies for production
3. **Token refresh is automatic** - No manual intervention needed
4. **Always use HTTPS** in production
5. **Clear tokens on logout** - Use `logout()` function
6. **Check isAuthenticated** before accessing user data
7. **Handle loading states** - Use `isLoading` to show spinners

## 🔗 Related Files

- `src/services/auth.service.ts` - Authentication API calls
- `src/context/AuthContext.tsx` - Authentication state management
- `src/api/axiosInstance.ts` - HTTP client with interceptors
- `src/api/tokenStorage.ts` - Token storage utilities
- `src/components/ProtectedRoute.tsx` - Route protection component

## 📚 Full Documentation

For detailed documentation, see:
- `AUTHENTICATION.md` - Complete authentication guide
- `AUTHENTICATION_TESTING.md` - Testing guide
- `AUTH_INTEGRATION_SUMMARY.md` - Integration summary

---

**Quick Start:**
```typescript
// 1. Import
import { useAuth } from '@/context/AuthContext';

// 2. Use in component
const { user, login, logout, isAuthenticated } = useAuth();

// 3. Login
await login({ email, password });

// 4. Access user data
console.log(user?.email);

// 5. Logout
await logout();
```

**That's it! 🎉**
