# Auth Boilerplate - TypeScript, Node.js & MongoDB 🚀

A production-ready full-stack authentication boilerplate built with **TypeScript**, **Node.js/Express**, **MongoDB**, and **React**. This project provides a complete authentication system with role-based access control, JWT token management, and a modern UI.

---

## 📋 Table of Contents

1. [Project Overview](#project-overview)
2. [Tech Stack](#tech-stack)
3. [Features](#features)
4. [Project Structure](#project-structure)
5. [Installation & Setup](#installation--setup)
6. [Environment Configuration](#environment-configuration)
7. [Backend Documentation](#backend-documentation)
8. [Frontend Documentation](#frontend-documentation)
9. [API Endpoints](#api-endpoints)
10. [Authentication Flow](#authentication-flow)
11. [Database Schema](#database-schema)
12. [Middleware & Utilities](#middleware--utilities)
13. [Common Issues & Solutions](#common-issues--solutions)

---

## 🎯 Project Overview

This is a **full-stack authentication boilerplate** designed to jumpstart development with:

- ✅ User registration and login
- ✅ Role-based access control (User, SuperAdmin)
- ✅ JWT token authentication with refresh tokens
- ✅ Secure password hashing with bcrypt
- ✅ MongoDB database integration
- ✅ Rate limiting and security headers
- ✅ Error handling and logging
- ✅ Form validation with Zod
- ✅ Redux state management
- ✅ Responsive UI with Tailwind CSS
- ✅ Vercel deployment ready

---

## 🛠️ Tech Stack

### Backend
- **Runtime**: Node.js
- **Language**: TypeScript
- **Framework**: Express.js (v5.1.0)
- **Database**: MongoDB with Mongoose
- **Authentication**: JWT (jsonwebtoken)
- **Security**: 
  - Bcryptjs for password hashing
  - Helmet for HTTP headers security
  - CORS for cross-origin requests
  - Express Rate Limiter for API protection
- **Validation**: Zod
- **Logging**: Winston
- **Monitoring**: Morgan for HTTP request logging

### Frontend
- **Library**: React (v19.1.1)
- **Language**: TypeScript
- **Build Tool**: Vite
- **Routing**: React Router v7
- **State Management**: Redux Toolkit
- **HTTP Client**: Axios
- **UI Components**: Radix UI
- **Styling**: Tailwind CSS (v4.1.12)
- **Form Management**: React Hook Form
- **Form Validation**: Zod
- **Toast Notifications**: Sonner
- **Data Fetching**: TanStack React Query

---

## ✨ Features

### Authentication & Authorization
- User registration with email validation
- Secure login with JWT tokens
- Refresh token mechanism for session persistence
- Logout functionality
- Role-based routing (SuperAdmin, User)
- Protected API endpoints with auth middleware

### Security
- Password hashing with bcryptjs
- HTTP headers security (Helmet)
- CORS enabled
- Rate limiting on API endpoints
- JWT token validation
- Secure token storage in localStorage

### User Management
- User profile with first name, last name, email, and role
- Role assignment (user, superAdmin)
- User creation timestamps

### API Features
- Standardized API response format
- Comprehensive error handling
- Health check endpoint
- Request logging with Morgan
- Input validation with Zod schemas

### Frontend Features
- Modern, responsive UI with Tailwind CSS
- Redux-based state management
- Protected routes based on user roles
- Token auto-refresh mechanism
- Error toast notifications
- Loading states for async operations

---

## 📁 Project Structure

```
auth-boilerplate-ts-node-mongo/
│
├── backend/                          # Express API Server
│   ├── src/
│   │   ├── app.ts                   # Express app configuration
│   │   ├── server.ts                # Server entry point
│   │   │
│   │   ├── config/
│   │   │   └── db/
│   │   │       └── index.ts         # Database configuration
│   │   │
│   │   ├── controllers/
│   │   │   ├── auth.controller.ts   # Auth endpoints handlers
│   │   │   ├── user.controller.ts   # User endpoints handlers
│   │   │   ├── admin.controller.ts  # Admin endpoints handlers
│   │   │   └── index.ts
│   │   │
│   │   ├── services/
│   │   │   ├── auth.service.ts      # Auth business logic
│   │   │   ├── user.service.ts      # User business logic
│   │   │   ├── admin.service.ts     # Admin business logic
│   │   │   └── index.ts
│   │   │
│   │   ├── models/
│   │   │   └── user.model.ts        # Mongoose user schema
│   │   │
│   │   ├── routes/
│   │   │   ├── auth.routes.ts       # Auth endpoints
│   │   │   ├── user.routes.ts       # User endpoints
│   │   │   ├── admin.routes.ts      # Admin endpoints
│   │   │   └── index.ts
│   │   │
│   │   ├── middlewares/
│   │   │   ├── auth.middleware.ts   # JWT verification
│   │   │   ├── errorHandler.ts      # Global error handler
│   │   │   └── rateLimiter.ts       # Rate limiting
│   │   │
│   │   ├── validation/
│   │   │   ├── auth.validate.ts     # Auth schema validation
│   │   │   └── validate.ts          # Validation middleware
│   │   │
│   │   ├── types/
│   │   │   └── user.types.ts        # User type definitions
│   │   │
│   │   └── utils/
│   │       ├── ApiError.ts          # Custom error class
│   │       ├── catchAsync.ts        # Async wrapper
│   │       ├── controllerHandler.ts # Controller wrapper with response
│   │       ├── jwt.ts               # JWT utilities
│   │       ├── logger.ts            # Winston logger
│   │       ├── sendResponse.ts      # Response formatter
│   │       └── initialUserCreation.ts # Default user creation
│   │
│   ├── api/
│   │   └── index.ts                 # Vercel serverless endpoint
│   │
│   ├── package.json
│   ├── tsconfig.json
│   ├── vercel.json                  # Vercel deployment config
│   └── .env.example
│
├── frontend/                         # React Frontend
│   ├── src/
│   │   ├── main.tsx                 # React entry point
│   │   ├── App.tsx                  # Root component
│   │   ├── Layout.tsx               # Main layout
│   │   │
│   │   ├── api/
│   │   │   ├── axiosInstance.ts     # Axios configuration
│   │   │   ├── tokenStorage.ts      # Token management
│   │   │   └── index.ts
│   │   │
│   │   ├── components/
│   │   │   ├── app-sidebar.tsx      # Sidebar component
│   │   │   ├── NavUser.tsx          # User navigation
│   │   │   │
│   │   │   ├── auth/
│   │   │   │   ├── LoginForm.tsx    # Login form component
│   │   │   │   └── SignForm.tsx     # Registration form component
│   │   │   │
│   │   │   └── ui/                  # Radix UI components
│   │   │       ├── button.tsx
│   │   │       ├── input.tsx
│   │   │       ├── card.tsx
│   │   │       ├── form.tsx
│   │   │       └── ... (other UI components)
│   │   │
│   │   ├── pages/
│   │   │   ├── Auth/
│   │   │   │   ├── AuthPage.tsx
│   │   │   │   ├── LoginPage.tsx
│   │   │   │   └── SignUpPage.tsx
│   │   │   │
│   │   │   ├── User/
│   │   │   │   ├── UserHome.tsx     # User dashboard
│   │   │   │   └── UserSetting.tsx
│   │   │   │
│   │   │   ├── SuperAdmin/
│   │   │   │   ├── SuperAdminHome.tsx # Admin dashboard
│   │   │   │   └── SuperAdminSetting.tsx
│   │   │   │
│   │   │   └── Setting/
│   │   │       └── Setting.tsx
│   │   │
│   │   ├── routes/
│   │   │   ├── AppRoute.tsx         # Main route coordinator
│   │   │   ├── PublicRoute.tsx      # Public pages (login, signup)
│   │   │   ├── UserRoute.tsx        # Protected user routes
│   │   │   ├── SuperAdminRoute.tsx  # Protected admin routes
│   │   │   └── TemRoute.tsx
│   │   │
│   │   ├── slice/
│   │   │   ├── auth.slice.ts        # Redux auth state & actions
│   │   │   ├── hook.ts              # Redux hooks
│   │   │   └── store.ts             # Redux store configuration
│   │   │
│   │   ├── types/
│   │   │   ├── auth.types.ts        # Auth type definitions
│   │   │   ├── api.types.ts         # API response types
│   │   │   └── user.types.ts        # User type definitions
│   │   │
│   │   ├── lib/
│   │   │   └── utils.ts             # Utility functions
│   │   │
│   │   ├── hooks/
│   │   │   └── use-mobile.ts        # Mobile detection hook
│   │   │
│   │   ├── provider/
│   │   │   └── ThemeProvider.tsx    # Theme context provider
│   │   │
│   │   ├── assets/
│   │   │   └── images/              # Static assets
│   │   │
│   │   ├── data/
│   │   │   └── sidebarData.tsx      # Sidebar configuration
│   │   │
│   │   ├── index.css
│   │   └── App.css
│   │
│   ├── public/
│   ├── index.html
│   ├── vite.config.ts
│   ├── tsconfig.json
│   ├── package.json
│   └── .env.example
│
└── README.md

```

---

## 🚀 Installation & Setup

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn
- MongoDB (local or cloud - MongoDB Atlas)
- Git

### Backend Setup

1. **Navigate to backend directory**
```bash
cd backend
```

2. **Install dependencies**
```bash
npm install
```

3. **Configure environment variables**
```bash
cp .env.example .env
# Edit .env with your configuration (see Environment Configuration section)
```

4. **Start development server**
```bash
npm run dev
```

The backend will start on `http://localhost:5000` (or your configured port)

5. **Build for production**
```bash
npm run build
npm start
```

### Frontend Setup

1. **Navigate to frontend directory**
```bash
cd frontend
```

2. **Install dependencies**
```bash
npm install
```

3. **Configure environment variables**
```bash
cp .env.example .env
# Configure backend API URL
```

4. **Start development server**
```bash
npm run dev
```

The frontend will start on `http://localhost:5173`

5. **Build for production**
```bash
npm run build
```

---

## 🔐 Environment Configuration

### Backend `.env` Example

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# Database
MONGODB_URI=mongodb://localhost:27017/auth-boilerplate
# or for MongoDB Atlas
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/auth-boilerplate

# JWT
JWT_ACCESS_TOKEN_SECRET=your_super_secret_access_token_key_min_32_chars
JWT_REFRESH_TOKEN_SECRET=your_super_secret_refresh_token_key_min_32_chars
JWT_ACCESS_TOKEN_EXPIRE=1h
JWT_REFRESH_TOKEN_EXPIRE=7d

# CORS
CORS_ORIGIN=http://localhost:5173

# Google Generative AI (Optional)
GOOGLE_GENAI_API_KEY=your_google_api_key_here
```

### Frontend `.env` Example

```env
VITE_API_BASE_URL=http://localhost:5000/v1
```

---

## 📡 Backend Documentation

### Architecture Overview

The backend follows a **layered architecture** pattern:

```
Request → Routes → Controllers → Services → Models → Database
         ↑                                              ↓
         └─────────── Middlewares & Error Handler ────┘
```

### Key Components

#### 1. **Express App Configuration** (`src/app.ts`)

Sets up the Express application with:
- Security middleware (Helmet)
- CORS configuration
- Rate limiting
- Request logging (Morgan)
- Body parsing
- Health check endpoint
- Global error handler

```typescript
app.use(helmet());           // Security headers
app.use(cors());             // CORS
app.use(rateLimiter);        // Rate limiting
app.use(morgan(...));        // HTTP logging
```

#### 2. **Server Entry Point** (`src/server.ts`)

Handles:
- MongoDB connection
- Server initialization
- Vercel serverless compatibility
- Initial user creation

#### 3. **Database Configuration** (`src/config/db/index.ts`)

Centralizes MongoDB connection details and configuration.

#### 4. **Controllers** (`src/controllers/`)

Request handlers that delegate to services:

**Auth Controller** - Handles authentication endpoints
- `register()` - User registration
- `login()` - User login
- `refresh()` - Token refresh
- `logout()` - User logout

**User Controller** - Handles user endpoints
- User profile management

**Admin Controller** - Handles admin operations

#### 5. **Services** (`src/services/`)

Business logic layer:

**Auth Service** - Authentication logic
```typescript
async register(req) - Creates new user with hashed password
async login(req) - Validates credentials and issues tokens
async refreshToken(req) - Issues new access token using refresh token
async logout(req) - Invalidates refresh token
```

**User Service** - User operations
**Admin Service** - Admin operations

#### 6. **Models** (`src/models/user.model.ts`)

Mongoose schema for User:
```typescript
{
  firstName: String (required)
  lastName: String (required)
  email: String (required, unique)
  role: String (default: "user")
  password: String (required, hashed)
  refreshToken?: String
  createdAt: Date (auto)
  updatedAt: Date (auto)
}
```

#### 7. **Routes** (`src/routes/`)

API endpoint definitions:

**Auth Routes** (`/v1/auth/`)
- `POST /register` - Register new user
- `POST /login` - Login user
- `POST /refresh` - Refresh access token
- `POST /logout` - Logout user

**User Routes** (`/v1/users/`)
- User management endpoints

**Admin Routes** (`/v1/admins/`)
- Admin operations

#### 8. **Middlewares** (`src/middlewares/`)

**Auth Middleware** (`auth.middleware.ts`)
- Verifies JWT tokens
- Checks user authorization

**Error Handler** (`errorHandler.ts`)
- Global error catching
- Consistent error responses
- Logging errors

**Rate Limiter** (`rateLimiter.ts`)
- Prevents API abuse
- Configurable request limits

#### 9. **Validation** (`src/validation/`)

Zod schemas for request validation:

```typescript
registerSchema - Validates registration input
loginSchema - Validates login credentials
refreshSchema - Validates refresh token request
logoutSchema - Validates logout request
```

Validation middleware ensures all inputs match the schema before reaching controllers.

#### 10. **Utilities** (`src/utils/`)

**ApiError** - Custom error class
```typescript
throw new ApiError(statusCode, message)
```

**JWT Utilities** (`jwt.ts`)
```typescript
generateAccessToken(payload) - Creates short-lived JWT
generateRefreshToken(payload) - Creates long-lived JWT
verifyRefreshToken(token) - Validates refresh token
```

**Logger** (`logger.ts`)
```typescript
logger.info(message)
logger.error(message)
logger.warn(message)
```

**Controller Handler** (`controllerHandler.ts`)
Wrapper that:
- Catches async errors
- Formats successful responses
- Handles error responses

**sendResponse** - Standardizes API response format
```typescript
{
  success: boolean
  statusCode: number
  message: string
  data: any
  timestamp: ISO string
}
```

---

## 🎨 Frontend Documentation

### Architecture Overview

The frontend follows a **component-based architecture** with Redux for global state:

```
App (Routes) → Public/Protected Routes → Pages → Components
                        ↓
                   Redux Store (Auth State)
```

### Key Components

#### 1. **Root Component** (`src/App.tsx`)

Sets up HashRouter for client-side routing.

#### 2. **Route Configuration** (`src/routes/`)

**AppRoute.tsx** - Main route coordinator
- Routes authenticated users to role-based pages
- Routes unauthenticated users to login
- Redirects unknown routes appropriately

**PublicRoute.tsx** - Public pages
- Login page
- Sign up page

**UserRoute.tsx** - Protected user routes
- User dashboard
- User settings

**SuperAdminRoute.tsx** - Protected admin routes
- Admin dashboard
- Admin settings

#### 3. **Pages** (`src/pages/`)

**Auth Pages**
- `LoginPage.tsx` - Login form
- `SignUpPage.tsx` - Registration form
- `AuthPage.tsx` - Auth wrapper

**User Pages**
- `UserHome.tsx` - User dashboard
- `UserSetting.tsx` - User settings

**SuperAdmin Pages**
- `SuperAdminHome.tsx` - Admin dashboard
- `SuperAdminSetting.tsx` - Admin settings

#### 4. **Components** (`src/components/`)

**Auth Components**
- `LoginForm.tsx` - Login form with validation
- `SignForm.tsx` - Registration form with validation

**UI Components**
- Radix UI based reusable components
- Button, Input, Card, Form, Modal, etc.

**Layout Components**
- `app-sidebar.tsx` - Sidebar navigation
- `NavUser.tsx` - User navigation dropdown

#### 5. **Redux State Management** (`src/slice/`)

**Auth Slice** (`auth.slice.ts`)

State:
```typescript
{
  user: User | null
  accessToken: string | null
  refreshToken: string | null
  isAuthenticated: boolean
  loading: boolean
  error: string | null
}
```

Async Thunks (Actions):
```typescript
register(credentials) - Register new user
login(credentials) - Login user
refreshTokens() - Refresh access token
logout() - Logout user
```

Reducer Actions:
```typescript
resetError() - Clear error messages
```

**Store** (`store.ts`)
- Configures Redux store
- Combines all slices

**Hooks** (`hook.ts`)
- `useAppDispatch()` - Typed dispatch
- `useAppSelector()` - Typed selector

#### 6. **API Integration** (`src/api/`)

**Axios Instance** (`axiosInstance.ts`)
```typescript
- Base URL configuration
- Default headers
- Request/response interceptors
- Token refresh on 401
```

**Token Storage** (`tokenStorage.ts`)
```typescript
- Store/retrieve access token
- Store/retrieve refresh token
- Store/retrieve user data
- Clear all tokens
- Check authentication status
```

#### 7. **Types** (`src/types/`)

**Auth Types** (`auth.types.ts`)
```typescript
User {
  id: string
  firstName: string
  lastName: string
  email: string
  role: "user" | "superAdmin"
}

LoginCredentials {
  email: string
  password: string
}

RegisterCredentials extends LoginCredentials {
  firstName: string
  lastName: string
}

AuthState {
  user: User | null
  accessToken: string | null
  refreshToken: string | null
  isAuthenticated: boolean
  loading: boolean
  error: string | null
}
```

**API Types** (`api.types.ts`)
```typescript
ApiResponse<T> {
  success: boolean
  statusCode: number
  message: string
  data: T
  timestamp: string
}
```

#### 8. **Utilities** (`src/lib/utils.ts`)

Helper functions for:
- Class name merging (clsx)
- Tailwind CSS utilities

---

## 📡 API Endpoints

### Base URL
```
http://localhost:5000/v1
```

### Public Endpoints (No Authentication Required)

#### 1. **Register User**
```
POST /auth/register

Request Body:
{
  "firstName": "string",
  "lastName": "string",
  "email": "string",
  "password": "string"
}

Response (201):
{
  "success": true,
  "statusCode": 201,
  "message": "User registered successfully",
  "data": {
    "user": {
      "id": "user_id",
      "firstName": "John",
      "lastName": "Doe",
      "email": "john@example.com",
      "role": "user"
    },
    "accessToken": "jwt_token",
    "refreshToken": "refresh_token"
  },
  "timestamp": "2024-11-12T10:00:00Z"
}
```

#### 2. **Login User**
```
POST /auth/login

Request Body:
{
  "email": "string",
  "password": "string"
}

Response (200):
{
  "success": true,
  "statusCode": 200,
  "message": "Login successful",
  "data": {
    "user": { ... },
    "accessToken": "jwt_token",
    "refreshToken": "refresh_token"
  }
}
```

### Protected Endpoints (Require JWT Token)

#### 3. **Refresh Access Token**
```
POST /auth/refresh

Headers:
Authorization: Bearer {refreshToken}

Response (200):
{
  "success": true,
  "message": "Token refreshed successfully",
  "data": {
    "accessToken": "new_jwt_token",
    "refreshToken": "new_refresh_token",
    "user": { ... }
  }
}
```

#### 4. **Logout**
```
POST /auth/logout

Headers:
Authorization: Bearer {accessToken}

Response (200):
{
  "success": true,
  "message": "Logged out successfully"
}
```

### System Endpoints

#### 5. **Health Check**
```
GET /health

Response (200):
{
  "status": "ok",
  "server": "running",
  "database": "connected",
  "timestamp": "2024-11-12T10:00:00Z"
}
```

#### 6. **Root**
```
GET /

Response (200):
API is up and running!!!
```

---

## 🔄 Authentication Flow

### Registration Flow

```
1. User enters: firstName, lastName, email, password
   ↓
2. Frontend validates input with Zod schema
   ↓
3. Frontend sends POST /auth/register to backend
   ↓
4. Backend validates input (Zod middleware)
   ↓
5. Backend checks if email already exists
   ↓
6. Backend hashes password with bcryptjs (10 rounds)
   ↓
7. Backend creates user in MongoDB
   ↓
8. Backend generates JWT tokens (access + refresh)
   ↓
9. Backend saves refresh token to user document
   ↓
10. Backend returns tokens to frontend
   ↓
11. Frontend stores tokens in localStorage (via TokenStorage)
   ↓
12. Frontend stores user data in Redux
   ↓
13. Frontend redirects to user dashboard
```

### Login Flow

```
1. User enters: email, password
   ↓
2. Frontend validates input with Zod schema
   ↓
3. Frontend sends POST /auth/login to backend
   ↓
4. Backend validates input (Zod middleware)
   ↓
5. Backend finds user by email in MongoDB
   ↓
6. Backend compares password with bcrypt.compare()
   ↓
7. Backend generates JWT tokens (access + refresh)
   ↓
8. Backend updates user's refresh token in DB
   ↓
9. Backend returns tokens to frontend
   ↓
10. Frontend stores tokens in localStorage
   ↓
11. Frontend stores user data in Redux
   ↓
12. Frontend routes to dashboard based on user.role
```

### Token Refresh Flow

```
1. Frontend detects 401 Unauthorized response
   ↓
2. Axios interceptor triggers (axiosInstance.ts)
   ↓
3. Frontend sends POST /auth/refresh with refreshToken
   ↓
4. Backend verifies refresh token
   ↓
5. Backend generates new access token + refresh token
   ↓
6. Backend returns new tokens to frontend
   ↓
7. Axios interceptor updates localStorage
   ↓
8. Axios retries original request with new token
```

### Logout Flow

```
1. User clicks logout button
   ↓
2. Frontend calls logout thunk from Redux
   ↓
3. Frontend clears localStorage (tokens + user)
   ↓
4. Frontend updates Redux state (isAuthenticated = false)
   ↓
5. Frontend redirects to login page
   ↓
6. (Optional) Backend clears refresh token from user document
```

---

## 💾 Database Schema

### User Model

```typescript
{
  _id: ObjectId (auto-generated)
  firstName: String (required)
  lastName: String (required)
  email: String (required, unique, indexed)
  role: String (enum: ["user", "superAdmin"], default: "user")
  password: String (required, hashed with bcryptjs)
  refreshToken: String (optional, stored for token refresh)
  createdAt: Date (auto-generated)
  updatedAt: Date (auto-generated)
}
```

**Example Document:**
```json
{
  "_id": "507f1f77bcf86cd799439011",
  "firstName": "John",
  "lastName": "Doe",
  "email": "john@example.com",
  "role": "user",
  "password": "$2a$10$...(hashed)...",
  "refreshToken": "eyJhbGc...(jwt)...",
  "createdAt": "2024-11-12T10:00:00.000Z",
  "updatedAt": "2024-11-12T10:00:00.000Z"
}
```

---

## 🔧 Middleware & Utilities

### Middlewares

#### 1. **Auth Middleware** (`src/middlewares/auth.middleware.ts`)

Verifies JWT token and attaches user to request:

```typescript
authMiddleware(req, res, next)
- Checks Authorization header
- Extracts Bearer token
- Verifies JWT signature
- Attaches user data to req.user
- Calls next() or returns 401
```

#### 2. **Error Handler** (`src/middlewares/errorHandler.ts`)

Global error handler for all errors:

```typescript
errorHandler(err, req, res, next)
- Catches all errors (sync and async)
- Checks if error is ApiError instance
- Returns standardized error response
- Logs errors with Winston logger
```

Error Response Format:
```json
{
  "success": false,
  "statusCode": 400,
  "message": "Error message",
  "timestamp": "2024-11-12T10:00:00Z"
}
```

#### 3. **Rate Limiter** (`src/middlewares/rateLimiter.ts`)

Prevents API abuse using express-rate-limit:

```typescript
- 15 requests per 15 minutes per IP
- Returns 429 Too Many Requests
- Configurable per route
```

### Utilities

#### 1. **ApiError** (`src/utils/ApiError.ts`)

Custom error class:

```typescript
throw new ApiError(statusCode, message)
// Example:
throw new ApiError(400, "Invalid email")
throw new ApiError(401, "Unauthorized")
throw new ApiError(500, "Internal server error")
```

#### 2. **JWT Utilities** (`src/utils/jwt.ts`)

```typescript
generateAccessToken(payload) 
- Creates JWT with 1-hour expiry
- Uses JWT_ACCESS_TOKEN_SECRET

generateRefreshToken(payload)
- Creates JWT with 7-day expiry
- Uses JWT_REFRESH_TOKEN_SECRET

verifyRefreshToken(token)
- Validates refresh token signature
- Returns payload if valid
- Throws error if invalid/expired
```

#### 3. **Controller Handler** (`src/utils/controllerHandler.ts`)

Wraps controller functions:

```typescript
controllerHandler(
  async (req) => { ... },
  { statusCode, message }
)
```

Benefits:
- Automatic error catching
- Consistent response formatting
- No try-catch needed in controllers

#### 4. **Logger** (`src/utils/logger.ts`)

Winston logger configuration:

```typescript
logger.info(message)    // Info level
logger.warn(message)    // Warning level
logger.error(message)   // Error level
logger.debug(message)   // Debug level
```

Logs to both console and file.

#### 5. **Send Response** (`src/utils/sendResponse.ts`)

Standardizes API responses:

```typescript
sendResponse(res, statusCode, message, data)
// Returns:
{
  "success": true/false,
  "statusCode": number,
  "message": string,
  "data": any,
  "timestamp": "ISO string"
}
```

#### 6. **Initial User Creation** (`src/utils/initialUserCreation.ts`)

Creates a default superAdmin user on first run:

```typescript
- Checks if any users exist
- If not, creates superAdmin with default credentials
- Useful for first-time setup
```

---

## 🐛 Common Issues & Solutions

### Issue 1: MongoDB Connection Failed

**Error**: `❌ Failed to connect to MongoDB: Connection refused`

**Solutions**:
1. Ensure MongoDB is running
   ```bash
   # For local MongoDB
   mongod  # Windows
   # or
   brew services start mongodb-community  # macOS
   ```

2. Check connection string in `.env`:
   ```env
   MONGODB_URI=mongodb://localhost:27017/auth-boilerplate
   # or for MongoDB Atlas
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/dbname
   ```

3. Verify network connectivity (if using MongoDB Atlas)

### Issue 2: Port Already in Use

**Error**: `Error: listen EADDRINUSE: address already in use :::5000`

**Solutions**:
1. Kill process on port 5000:
   ```bash
   # Windows
   netstat -ano | findstr :5000
   taskkill /PID <PID> /F
   
   # macOS/Linux
   lsof -i :5000
   kill -9 <PID>
   ```

2. Use different port:
   ```env
   PORT=5001
   ```

### Issue 3: JWT Token Invalid

**Error**: `Invalid token` or `jwt malformed`

**Solutions**:
1. Ensure token is included in Authorization header:
   ```
   Authorization: Bearer <token>
   ```

2. Check JWT secrets in `.env`:
   ```env
   JWT_ACCESS_TOKEN_SECRET=your_secret_key_min_32_chars
   JWT_REFRESH_TOKEN_SECRET=your_secret_key_min_32_chars
   ```

3. Token may be expired - use refresh endpoint

### Issue 4: CORS Error

**Error**: `Access to XMLHttpRequest has been blocked by CORS policy`

**Solutions**:
1. Update CORS_ORIGIN in backend `.env`:
   ```env
   CORS_ORIGIN=http://localhost:5173
   ```

2. Check if frontend URL matches CORS_ORIGIN

3. Clear browser cache and cookies

### Issue 5: Request Validation Failed

**Error**: `Validation failed` or `Invalid input`

**Solutions**:
1. Check request body matches schema:
   - Register: firstName, lastName, email, password
   - Login: email, password

2. Validate email format

3. Password minimum requirements (if configured)

### Issue 6: "User already exists"

**Error**: `User already exists` during registration

**Solutions**:
1. Use a different email
2. Check database for existing user:
   ```bash
   db.users.find({ email: "email@example.com" })
   ```
3. Delete user from database if needed

### Issue 7: Refresh Token Not Working

**Error**: `No refresh token available` or `Session expired`

**Solutions**:
1. Ensure localStorage is enabled in browser
2. Check TokenStorage implementation
3. Verify refresh token endpoint:
   ```
   POST /v1/auth/refresh
   ```

4. Check JWT_REFRESH_TOKEN_SECRET in `.env`

### Issue 8: TypeScript Compilation Errors

**Error**: `TS2345: Argument of type is not assignable to parameter`

**Solutions**:
1. Ensure strict mode is enabled in tsconfig.json
2. Add proper type annotations to functions
3. Use interfaces for object types
4. Run type check:
   ```bash
   tsc --noEmit
   ```

### Issue 9: Build Fails

**Error**: `ERROR in entry.XXXXXX.js`

**Solutions**:
1. Clear node_modules and reinstall:
   ```bash
   rm -rf node_modules package-lock.json
   npm install
   ```

2. Clear build cache:
   ```bash
   rm -rf dist
   npm run build
   ```

---

## 📚 Additional Resources

### Backend Dependencies
- [Express.js Documentation](https://expressjs.com/)
- [Mongoose Documentation](https://mongoosejs.com/)
- [JWT Documentation](https://jwt.io/)
- [Bcryptjs Documentation](https://www.npmjs.com/package/bcryptjs)
- [Zod Documentation](https://zod.dev/)

### Frontend Dependencies
- [React Documentation](https://react.dev/)
- [Redux Toolkit Documentation](https://redux-toolkit.js.org/)
- [React Router Documentation](https://reactrouter.com/)
- [Axios Documentation](https://axios-http.com/)
- [Tailwind CSS Documentation](https://tailwindcss.com/)
- [React Hook Form Documentation](https://react-hook-form.com/)

### Deployment
- [Vercel Deployment Guide](https://vercel.com/docs)
- [MongoDB Atlas Setup](https://www.mongodb.com/docs/atlas/getting-started/)
- [Environment Variables Best Practices](https://12factor.net/config)

---


## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

---

## 📧 Support

For issues and questions, please open an issue in the repository.


