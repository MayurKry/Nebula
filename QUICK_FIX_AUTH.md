# 🔧 QUICK FIX: Authentication Issue

## Problem
When clicking "Generate Images", you're redirected to the homepage.

## Cause
The backend requires authentication, but the frontend is using a mock user.

## Solution

### Step 1: Add BYPASS_AUTH to your .env file

**Location:** `backend/.env`

**Add this line:**
```bash
BYPASS_AUTH=true
```

### Step 2: Restart the backend

```bash
# Stop the backend (Ctrl+C in the terminal)
# Then restart:
cd backend
npm run dev
```

### Step 3: Test

1. Go to `/app/create/text-to-image`
2. Enter a prompt
3. Click "Generate Images"
4. Should work now! ✅

---

## Full .env File Example

Your `backend/.env` should look like this:

```bash
PORT=5000
DATABASE_URL=mongodb://localhost:27017/nebula
NODE_ENV=development
GEMINI_API_KEY=your_gemini_api_key_here
ACCESS_SECRET=youraccesssecret
REFRESH_TOKEN_SECRET=yourrefreshtokensecret

# THIS IS THE IMPORTANT LINE FOR TESTING
BYPASS_AUTH=true

# AI Providers (optional)
AI_PROVIDER_PRIORITY=pollinations,huggingface,segmind
```

---

## Why This Works

- **Development Mode**: `BYPASS_AUTH=true` tells the backend to skip authentication
- **Mock User**: Creates a temporary dev user automatically
- **Testing**: Allows you to test features without login

---

## ⚠️ Important

**NEVER use `BYPASS_AUTH=true` in production!**

This is only for development/testing.

---

## Alternative: Proper Authentication

If you want to use real authentication instead:

1. Remove `BYPASS_AUTH=true` from `.env`
2. Implement proper login/signup
3. Get JWT tokens
4. Use tokens in API requests

For now, use `BYPASS_AUTH=true` for quick testing! ✨
