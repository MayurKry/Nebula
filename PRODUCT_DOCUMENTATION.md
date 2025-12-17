# Nebula - Complete Product Documentation

## 📋 Table of Contents
1. [Product Overview](#product-overview)
2. [Architecture](#architecture)
3. [Technology Stack](#technology-stack)
4. [Features](#features)
5. [Setup & Installation](#setup--installation)
6. [API Documentation](#api-documentation)
7. [External Services & APIs](#external-services--apis)
8. [Database Schema](#database-schema)
9. [Authentication & Authorization](#authentication--authorization)
10. [Deployment](#deployment)
11. [Troubleshooting](#troubleshooting)

---

## 🎯 Product Overview

**Nebula** is an AI-powered video and image creation platform that enables users to generate professional-quality visual content using artificial intelligence.

### Key Capabilities:
- **Text-to-Image Generation**: Create images from text descriptions
- **Text-to-Video Generation**: Generate videos from prompts
- **Image-to-Video Generation**: Animate static images
- **Scene Editor**: Advanced editing capabilities
- **Asset Management**: Organize and manage generated content
- **Project Management**: Create and manage creative projects

### Target Users:
- Content Creators
- Marketing Teams
- Video Producers
- Social Media Managers
- Creative Agencies

---

## 🏗️ Architecture

### System Architecture

```
┌─────────────────────────────────────────────────────────┐
│                     Frontend (React)                     │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌─────────┐ │
│  │Dashboard │  │  Create  │  │  Editor  │  │ Profile │ │
│  └──────────┘  └──────────┘  └──────────┘  └─────────┘ │
└────────────────────────┬────────────────────────────────┘
                         │ HTTP/REST
                         ▼
┌─────────────────────────────────────────────────────────┐
│                  Backend API (Node.js/Express)           │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌─────────┐ │
│  │   Auth   │  │    AI    │  │  Assets  │  │Projects │ │
│  └──────────┘  └──────────┘  └──────────┘  └─────────┘ │
└────────────────────────┬────────────────────────────────┘
                         │
         ┌───────────────┼───────────────┐
         ▼               ▼               ▼
    ┌────────┐    ┌──────────┐    ┌──────────┐
    │MongoDB │    │AI Services│    │  Storage │
    └────────┘    └──────────┘    └──────────┘
```

### Component Architecture

**Frontend:**
- React 18+ with TypeScript
- React Router for navigation
- Context API for state management
- Axios for API calls
- TailwindCSS for styling

**Backend:**
- Node.js with Express
- TypeScript
- MongoDB with Mongoose
- JWT for authentication
- Multi-provider AI integration

---

## 💻 Technology Stack

### Frontend Technologies

| Technology | Version | Purpose |
|------------|---------|---------|
| **React** | 18.3.1 | UI Framework |
| **TypeScript** | 5.6.2 | Type Safety |
| **Vite** | 6.0.1 | Build Tool |
| **React Router** | 7.1.1 | Routing |
| **Axios** | 1.7.9 | HTTP Client |
| **TailwindCSS** | 3.4.17 | Styling |
| **Lucide React** | 0.469.0 | Icons |
| **Sonner** | 1.7.2 | Toast Notifications |

### Backend Technologies

| Technology | Version | Purpose |
|------------|---------|---------|
| **Node.js** | 18+ | Runtime |
| **Express** | 4.21.2 | Web Framework |
| **TypeScript** | 5.7.2 | Type Safety |
| **MongoDB** | Latest | Database |
| **Mongoose** | 8.9.3 | ODM |
| **JWT** | 9.0.2 | Authentication |
| **Axios** | 1.7.9 | HTTP Client |
| **Bcrypt** | 5.1.1 | Password Hashing |
| **Dotenv** | 16.4.7 | Environment Config |

---

## ✨ Features

### 1. **AI Image Generation**
- **Multiple Providers**: Pollinations, Hugging Face, Segmind, Replicate
- **Automatic Fallback**: Never fails - tries multiple providers
- **Batch Generation**: Generate 6 images simultaneously
- **Customization**: Style, aspect ratio, seed control
- **Advanced Settings**: Camera angles, negative prompts

### 2. **AI Video Generation**
- Text-to-video conversion
- Image-to-video animation
- Duration control
- Style selection
- Job status tracking

### 3. **Asset Management**
- Organize generated content
- Folder structure
- Search and filter
- Download capabilities
- Bulk operations

### 4. **Project Management**
- Create and manage projects
- Scene organization
- Storyboard generation
- Timeline editing

### 5. **User Management**
- Authentication (JWT)
- User profiles
- Role-based access
- Onboarding flow

---

## 🚀 Setup & Installation

### Prerequisites
```bash
- Node.js 18+ 
- MongoDB 4.4+
- npm or yarn
- Git
```

### Installation Steps

#### 1. Clone Repository
```bash
git clone <repository-url>
cd Nebula
```

#### 2. Backend Setup
```bash
cd backend
npm install

# Create .env file
cp .env.example .env

# Edit .env and add:
PORT=5000
DATABASE_URL=mongodb://localhost:27017/nebula
NODE_ENV=development
ACCESS_SECRET=your-secret-key-here
REFRESH_TOKEN_SECRET=your-refresh-secret-here
BYPASS_AUTH=true  # For development testing
AI_PROVIDER_PRIORITY=pollinations,huggingface,segmind

# Start backend
npm run dev
```

#### 3. Frontend Setup
```bash
cd frontend
npm install

# Create .env file
cp .env.example .env

# Edit .env and add:
VITE_API_URL=http://localhost:5000/api

# Start frontend
npm run dev
```

#### 4. Access Application
```
Frontend: http://localhost:5173
Backend API: http://localhost:5000/api
```

### Quick Test
```bash
# Test AI providers
cd backend
node test-providers.js

# Should show:
# ✅ Pollinations.AI... WORKING
```

---

## 📡 API Documentation

### Base URL
```
Development: http://localhost:5000/api
Production: https://your-domain.com/api
```

### Authentication

All `/api/ai/*` and `/api/assets/*` endpoints require authentication.

**Header:**
```
Authorization: Bearer <jwt_token>
```

**Development Mode:**
Set `BYPASS_AUTH=true` in `.env` to skip authentication for testing.

### API Endpoints

#### **Authentication**
```
POST   /api/auth/register          Register new user
POST   /api/auth/login             Login user
POST   /api/auth/refresh-token     Refresh access token
POST   /api/auth/logout            Logout user
```

#### **AI Generation**
```
POST   /api/ai/generate-image      Generate image from prompt
POST   /api/ai/generate-video      Generate video from prompt
GET    /api/ai/video-status/:jobId Check video generation status
POST   /api/ai/generate-storyboard Generate storyboard
GET    /api/ai/providers           Get available AI providers
POST   /api/ai/onboarding          Update user onboarding
```

#### **Assets**
```
GET    /api/assets                 Get all user assets
POST   /api/assets                 Create new asset
GET    /api/assets/:id             Get asset by ID
PUT    /api/assets/:id             Update asset
DELETE /api/assets/:id             Delete asset
```

#### **Projects**
```
GET    /api/projects               Get all user projects
POST   /api/projects               Create new project
GET    /api/projects/:id           Get project by ID
PUT    /api/projects/:id           Update project
DELETE /api/projects/:id           Delete project
```

#### **Folders**
```
GET    /api/folders                Get all user folders
POST   /api/folders                Create new folder
GET    /api/folders/:id            Get folder by ID
PUT    /api/folders/:id            Update folder
DELETE /api/folders/:id            Delete folder
```

#### **Users**
```
GET    /api/users/profile          Get user profile
PUT    /api/users/profile          Update user profile
```

### API Request/Response Examples

#### Generate Image
**Request:**
```json
POST /api/ai/generate-image
Content-Type: application/json
Authorization: Bearer <token>

{
  "prompt": "A majestic dragon flying over mountains",
  "style": "Cinematic",
  "width": 1024,
  "height": 576,
  "seed": 42,
  "negativePrompt": "ugly, blurry, low quality"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Image generated successfully",
  "data": {
    "url": "https://image.pollinations.ai/prompt/...",
    "prompt": "A majestic dragon flying over mountains",
    "style": "Cinematic",
    "width": 1024,
    "height": 576,
    "seed": 42,
    "provider": "pollinations",
    "generatedAt": "2025-12-16T10:54:50.000Z"
  }
}
```

#### Get AI Providers
**Request:**
```json
GET /api/ai/providers
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "message": "AI providers retrieved successfully",
  "data": {
    "providers": ["pollinations", "huggingface", "segmind"],
    "total": 3,
    "primary": "pollinations"
  }
}
```

---

## 🌐 External Services & APIs

### 1. **Pollinations.AI** (Primary Image Generation)

**Service:** Free AI image generation
**Website:** https://pollinations.ai/
**Cost:** FREE
**Rate Limits:** None
**API Key:** Not required

**Usage in Nebula:**
```typescript
// backend/src/services/ai-image.service.ts
const url = `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?width=${width}&height=${height}&seed=${seed}`;
```

**Features Used:**
- Text-to-image generation
- Custom dimensions
- Seed control for reproducibility
- No watermark mode

**Integration Details:**
- Simple URL-based API
- No authentication required
- Instant response
- Returns image URL directly

---

### 2. **Hugging Face Inference API** (Secondary Image Generation)

**Service:** AI model hosting and inference
**Website:** https://huggingface.co/
**Cost:** FREE tier available
**Rate Limits:** 50-300 requests/hour (free tier)
**API Key:** Required (free)

**How to Get API Key:**
1. Sign up at https://huggingface.co/join
2. Go to https://huggingface.co/settings/tokens
3. Create new token with "Make calls to Inference Providers" permission
4. Add to `.env`: `HUGGINGFACE_API_KEY=hf_your_key_here`

**Models Used:**
- `stabilityai/stable-diffusion-2-1`
- `runwayml/stable-diffusion-v1-5`

**Usage in Nebula:**
```typescript
// backend/src/services/ai-image.service.ts
const response = await axios.post(
  'https://api-inference.huggingface.co/models/stabilityai/stable-diffusion-2-1',
  {
    inputs: prompt,
    parameters: {
      negative_prompt: negativePrompt,
      width, height,
      num_inference_steps: 30,
      guidance_scale: 7.5,
      seed
    }
  },
  {
    headers: { Authorization: `Bearer ${HUGGINGFACE_API_KEY}` }
  }
);
```

**Features Used:**
- Stable Diffusion 2.1
- Custom parameters
- Negative prompts
- High-quality generation

**Integration Details:**
- REST API
- Returns image as binary data
- Converted to base64 for frontend
- May require model warm-up time

---

### 3. **Segmind** (Tertiary Image Generation)

**Service:** Fast AI image generation
**Website:** https://www.segmind.com/
**Cost:** FREE tier available
**Rate Limits:** Limited free credits
**API Key:** Required (free tier available)

**How to Get API Key:**
1. Sign up at https://www.segmind.com/
2. Navigate to dashboard
3. Copy API key
4. Add to `.env`: `SEGMIND_API_KEY=your_key_here`

**Usage in Nebula:**
```typescript
// backend/src/services/ai-image.service.ts
const response = await axios.post(
  'https://api.segmind.com/v1/sd2.1-txt2img',
  {
    prompt,
    negative_prompt: negativePrompt,
    samples: 1,
    scheduler: "UniPC",
    num_inference_steps: 25,
    guidance_scale: 7.5,
    seed,
    img_width: width,
    img_height: height
  },
  {
    headers: { 'x-api-key': SEGMIND_API_KEY }
  }
);
```

**Features Used:**
- Stable Diffusion 2.1
- Fast generation
- Serverless deployment
- Custom schedulers

---

### 4. **Replicate** (Optional - Premium)

**Service:** High-quality AI model hosting
**Website:** https://replicate.com/
**Cost:** ~$0.006 per image
**Rate Limits:** Pay-as-you-go
**API Key:** Required (credit card needed)

**How to Get API Key:**
1. Sign up at https://replicate.com/
2. Add payment method
3. Get API token from account settings
4. Add to `.env`: `REPLICATE_API_KEY=r8_your_key_here`

**Models Used:**
- SDXL (Stable Diffusion XL)
- Flux
- Custom fine-tuned models

**Usage in Nebula:**
```typescript
// backend/src/services/ai-image.service.ts
// Start prediction
const prediction = await axios.post(
  'https://api.replicate.com/v1/predictions',
  {
    version: "ac732df83cea7fff18b8472768c88ad041fa750ff7682a21affe81863cbe77e4",
    input: { prompt, width, height, seed }
  },
  {
    headers: { Authorization: `Token ${REPLICATE_API_KEY}` }
  }
);

// Poll for completion
const result = await axios.get(
  `https://api.replicate.com/v1/predictions/${prediction.data.id}`,
  {
    headers: { Authorization: `Token ${REPLICATE_API_KEY}` }
  }
);
```

**Features Used:**
- SDXL for highest quality
- Async prediction model
- Status polling
- Premium quality output

---

### 5. **MongoDB Atlas** (Database)

**Service:** Cloud database
**Website:** https://www.mongodb.com/cloud/atlas
**Cost:** FREE tier available (512MB)
**Connection:** MongoDB connection string

**Setup:**
1. Create account at https://www.mongodb.com/cloud/atlas/register
2. Create free cluster
3. Get connection string
4. Add to `.env`: `DATABASE_URL=mongodb+srv://...`

**Collections Used:**
- `users` - User accounts
- `projects` - User projects
- `assets` - Generated assets
- `folders` - Asset organization

---

### 6. **JWT (JSON Web Tokens)**

**Service:** Authentication tokens
**Library:** jsonwebtoken (npm package)
**Cost:** FREE (local library)

**Usage:**
```typescript
// Generate token
const token = jwt.sign(
  { userId, email },
  process.env.ACCESS_SECRET,
  { expiresIn: '15m' }
);

// Verify token
const decoded = jwt.verify(token, process.env.ACCESS_SECRET);
```

---

## 📊 Database Schema

### Users Collection
```typescript
{
  _id: ObjectId,
  name: string,
  email: string (unique),
  password: string (hashed),
  avatar?: string,
  industry?: string,
  useCase?: string,
  skillLevel?: string,
  onboardingCompleted: boolean,
  refreshToken?: string,
  createdAt: Date,
  updatedAt: Date
}
```

### Projects Collection
```typescript
{
  _id: ObjectId,
  userId: ObjectId (ref: User),
  name: string,
  description?: string,
  thumbnail?: string,
  status: 'draft' | 'in-progress' | 'completed',
  scenes: [{
    sceneNumber: number,
    description: string,
    imageUrl?: string,
    duration: number,
    cameraAngle?: string
  }],
  createdAt: Date,
  updatedAt: Date
}
```

### Assets Collection
```typescript
{
  _id: ObjectId,
  userId: ObjectId (ref: User),
  folderId?: ObjectId (ref: Folder),
  name: string,
  type: 'image' | 'video' | 'audio',
  url: string,
  thumbnail?: string,
  metadata: {
    prompt?: string,
    style?: string,
    provider?: string,
    width?: number,
    height?: number,
    duration?: number
  },
  createdAt: Date,
  updatedAt: Date
}
```

### Folders Collection
```typescript
{
  _id: ObjectId,
  userId: ObjectId (ref: User),
  name: string,
  description?: string,
  parentId?: ObjectId (ref: Folder),
  createdAt: Date,
  updatedAt: Date
}
```

---

## 🔐 Authentication & Authorization

### Authentication Flow

```
1. User Registration/Login
   ↓
2. Backend validates credentials
   ↓
3. Generate JWT tokens (access + refresh)
   ↓
4. Return tokens to frontend
   ↓
5. Frontend stores tokens
   ↓
6. Include access token in API requests
   ↓
7. Backend validates token on each request
```

### Token Types

**Access Token:**
- Short-lived (15 minutes)
- Used for API authentication
- Stored in memory (not localStorage)

**Refresh Token:**
- Long-lived (7 days)
- Used to get new access tokens
- Stored securely

### Development Mode

For testing without authentication:
```bash
# In backend/.env
NODE_ENV=development
BYPASS_AUTH=true
```

This allows API access without tokens during development.

---

## 🚀 Deployment

### Environment Variables

**Backend (.env):**
```bash
# Server
PORT=5000
NODE_ENV=production

# Database
DATABASE_URL=mongodb+srv://your-connection-string

# Authentication
ACCESS_SECRET=your-super-secret-key
REFRESH_TOKEN_SECRET=your-refresh-secret-key
BYPASS_AUTH=false  # MUST be false in production

# AI Providers
HUGGINGFACE_API_KEY=hf_your_key
SEGMIND_API_KEY=your_key
REPLICATE_API_KEY=r8_your_key
AI_PROVIDER_PRIORITY=pollinations,huggingface,segmind
```

**Frontend (.env):**
```bash
VITE_API_URL=https://your-api-domain.com/api
```

### Deployment Checklist

- [ ] Set `NODE_ENV=production`
- [ ] Set `BYPASS_AUTH=false`
- [ ] Use strong secrets for JWT
- [ ] Configure MongoDB Atlas
- [ ] Set up CORS properly
- [ ] Enable HTTPS
- [ ] Configure rate limiting
- [ ] Set up error logging
- [ ] Configure backup strategy
- [ ] Set up monitoring

---

## 🔧 Troubleshooting

### Common Issues

#### 1. "Redirected to homepage when generating images"
**Cause:** Authentication issue
**Solution:**
```bash
# Add to backend/.env
BYPASS_AUTH=true
# Restart backend
```

#### 2. "All AI providers failed"
**Cause:** Network or API key issues
**Solution:**
```bash
# Test providers
cd backend
node test-providers.js

# Check internet connection
# Verify API keys if using Hugging Face/Segmind
```

#### 3. "Cannot connect to MongoDB"
**Cause:** Database connection issue
**Solution:**
```bash
# Check MongoDB is running
# Verify DATABASE_URL in .env
# Check network connectivity
```

#### 4. "CORS errors"
**Cause:** Frontend-backend communication blocked
**Solution:**
```typescript
// backend/src/app.ts
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true
}));
```

---

## 📚 Additional Resources

- **AI Providers Guide**: `AI_PROVIDERS_GUIDE.md`
- **Multi-Provider Setup**: `MULTI_PROVIDER_AI_COMPLETE.md`
- **Quick Reference**: `AI_QUICK_REFERENCE.md`
- **Implementation Details**: `IMPLEMENTATION_TEXT_TO_IMAGE.md`

---

## 📞 Support

For issues or questions:
1. Check troubleshooting section
2. Review documentation files
3. Check backend logs
4. Test with `node test-providers.js`

---

**Last Updated:** December 16, 2025
**Version:** 1.0.0
