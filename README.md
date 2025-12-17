# 🌌 Nebula - AI-Powered Visual Content Creation Platform

[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Node](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen.svg)](https://nodejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.6+-blue.svg)](https://www.typescriptlang.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-4.4+-green.svg)](https://www.mongodb.com/)

> Transform your ideas into stunning visuals with AI-powered image and video generation

---

## 📋 Table of Contents
- [Overview](#-overview)
- [Features](#-features)
- [Quick Start](#-quick-start)
- [Documentation](#-documentation)
- [Technology Stack](#-technology-stack)
- [Project Structure](#-project-structure)
- [Contributing](#-contributing)
- [License](#-license)

---

## 🎯 Overview

**Nebula** is a cutting-edge platform that leverages multiple AI providers to generate professional-quality images and videos from text descriptions. Built with a robust fallback system, Nebula ensures your creative workflow never stops.

### Why Nebula?

- ✅ **Multi-Provider AI**: 4 integrated AI providers with automatic fallback
- ✅ **Always Available**: Never fails - if one provider is down, another takes over
- ✅ **Free to Start**: Works immediately with free providers
- ✅ **Production Ready**: Enterprise-grade architecture
- ✅ **Easy to Scale**: Add more providers anytime
- ✅ **Developer Friendly**: Comprehensive documentation

---

## ✨ Features

### 🎨 AI Image Generation
- **Multiple Providers**: Pollinations, Hugging Face, Segmind, Replicate
- **Batch Generation**: Create 6 images simultaneously
- **Full Customization**: Styles, aspect ratios, seeds, camera angles
- **Smart Fallback**: Automatic provider switching on failure
- **Provider Transparency**: See which AI generated your images

### 🎬 AI Video Generation
- Text-to-video conversion
- Image-to-video animation
- Customizable duration and styles
- Real-time status tracking

### 📁 Asset Management
- Organize generated content
- Folder structure
- Search and filter
- Bulk operations
- Download capabilities

### 🎯 Project Management
- Create and manage creative projects
- Scene organization
- Storyboard generation
- Timeline editing

### 👤 User Management
- JWT authentication
- User profiles
- Role-based access
- Onboarding flow

---

## 🚀 Quick Start

### Prerequisites

```bash
Node.js 18+
MongoDB 4.4+
npm or yarn
```

### Installation

#### 1. Clone the Repository
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

# Edit .env - Add this line for testing:
echo "BYPASS_AUTH=true" >> .env

# Start backend
npm run dev
```

#### 3. Frontend Setup
```bash
cd frontend
npm install

# Create .env file
cp .env.example .env

# Start frontend
npm run dev
```

#### 4. Access the Application
```
Frontend: http://localhost:5173
Backend:  http://localhost:5000
```

### Test AI Generation

```bash
# Test AI providers
cd backend
node test-providers.js

# Expected output:
# ✅ Pollinations.AI... WORKING
```

### Generate Your First Image

1. Navigate to http://localhost:5173/app/create/text-to-image
2. Enter prompt: "A futuristic city at sunset, cyberpunk style"
3. Click "Generate Images"
4. Wait ~10-15 seconds
5. See 6 AI-generated images! 🎉

---

## 📚 Documentation

### Core Documentation
- **[PRODUCT_DOCUMENTATION.md](PRODUCT_DOCUMENTATION.md)** - Complete product documentation
- **[AI_PROVIDERS_GUIDE.md](AI_PROVIDERS_GUIDE.md)** - AI provider setup guide
- **[MULTI_PROVIDER_AI_COMPLETE.md](MULTI_PROVIDER_AI_COMPLETE.md)** - Multi-provider implementation
- **[AI_QUICK_REFERENCE.md](AI_QUICK_REFERENCE.md)** - Quick reference card

### Troubleshooting
- **[QUICK_FIX_AUTH.md](QUICK_FIX_AUTH.md)** - Fix authentication issues

### Implementation Details
- **[IMPLEMENTATION_TEXT_TO_IMAGE.md](IMPLEMENTATION_TEXT_TO_IMAGE.md)** - Text-to-image implementation

---

## 💻 Technology Stack

### Frontend
- **React 18** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool
- **TailwindCSS** - Styling
- **React Router** - Navigation
- **Axios** - HTTP client

### Backend
- **Node.js** - Runtime
- **Express** - Web framework
- **TypeScript** - Type safety
- **MongoDB** - Database
- **Mongoose** - ODM
- **JWT** - Authentication

### AI Providers
- **Pollinations.AI** - Free, no API key
- **Hugging Face** - Free tier, high quality
- **Segmind** - Free tier, fast
- **Replicate** - Premium, highest quality

---

## 📁 Project Structure

```
Nebula/
├── backend/
│   ├── src/
│   │   ├── controllers/      # Request handlers
│   │   ├── models/           # Database models
│   │   ├── routes/           # API routes
│   │   ├── services/         # Business logic
│   │   │   └── ai-image.service.ts  # Multi-provider AI service
│   │   ├── middlewares/      # Express middlewares
│   │   ├── utils/            # Helper functions
│   │   └── app.ts            # Express app
│   ├── test-providers.js     # Provider testing script
│   ├── .env.example          # Environment template
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── components/       # React components
│   │   ├── pages/            # Page components
│   │   │   └── App/Create/TextToImagePage.tsx
│   │   ├── services/         # API services
│   │   │   └── ai.service.ts
│   │   ├── context/          # React context
│   │   ├── routes/           # Route configuration
│   │   └── App.tsx           # Root component
│   ├── .env.example          # Environment template
│   └── package.json
│
├── PRODUCT_DOCUMENTATION.md  # Complete documentation
├── AI_PROVIDERS_GUIDE.md     # AI setup guide
├── QUICK_FIX_AUTH.md         # Troubleshooting
└── README.md                 # This file
```

---

## 🔧 Configuration

### Backend Environment Variables

```bash
# Server
PORT=5000
NODE_ENV=development

# Database
DATABASE_URL=mongodb://localhost:27017/nebula

# Authentication
ACCESS_SECRET=your-secret-key
REFRESH_TOKEN_SECRET=your-refresh-key
BYPASS_AUTH=true  # For development only!

# AI Providers (Optional)
HUGGINGFACE_API_KEY=hf_your_key
SEGMIND_API_KEY=your_key
REPLICATE_API_KEY=r8_your_key
AI_PROVIDER_PRIORITY=pollinations,huggingface,segmind
```

### Frontend Environment Variables

```bash
VITE_API_URL=http://localhost:5000/api
```

---

## 🐛 Troubleshooting

### Issue: Redirected to homepage when generating images
**Solution:** Add `BYPASS_AUTH=true` to `backend/.env` and restart backend.
See [QUICK_FIX_AUTH.md](QUICK_FIX_AUTH.md) for details.

### Issue: All AI providers failed
**Solution:** Run `node test-providers.js` to check provider status.
See [AI_PROVIDERS_GUIDE.md](AI_PROVIDERS_GUIDE.md) for setup.

### Issue: Cannot connect to MongoDB
**Solution:** Ensure MongoDB is running and `DATABASE_URL` is correct in `.env`.

---

**Built with ❤️ by the Nebula Team**

**Last Updated:** December 16, 2025
**Version:** 1.0.0
