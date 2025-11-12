# Auth Boilerplate - TypeScript, Node.js & MongoDB 🚀

A **production-ready full-stack authentication boilerplate** with complete MERN stack implementation using TypeScript.

![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue)
![Node.js](https://img.shields.io/badge/Node.js-18%2B-green)
![React](https://img.shields.io/badge/React-19-blue)
![MongoDB](https://img.shields.io/badge/MongoDB-8-green)
![Express](https://img.shields.io/badge/Express-5.1-lightgrey)

## ✨ Features

✅ **User Authentication** - Register, login, logout with JWT tokens  
✅ **Token Management** - Access tokens + refresh tokens with auto-refresh  
✅ **Role-Based Access** - SuperAdmin and User roles with protected routes  
✅ **Security** - Password hashing, CORS, rate limiting, helmet headers  
✅ **Form Validation** - Zod schemas on both backend and frontend  
✅ **Error Handling** - Global error handler with comprehensive logging  
✅ **State Management** - Redux Toolkit for auth state  
✅ **Modern UI** - React + Tailwind CSS + Radix UI components  
✅ **Responsive Design** - Mobile-first approach  
✅ **Vercel Ready** - Serverless deployment support  

---

## 🛠️ Tech Stack

### Backend
- **Node.js** + **Express.js** (TypeScript)
- **MongoDB** + **Mongoose**
- **JWT** for authentication
- **Bcryptjs** for password hashing
- **Zod** for validation
- **Winston** for logging
- **Morgan** for HTTP request logging
- **Helmet** for security headers
- **Express Rate Limiter** for API protection

### Frontend
- **React** 19 with TypeScript
- **Vite** for build tooling
- **Redux Toolkit** for state management
- **React Router** for navigation
- **Axios** for HTTP requests
- **React Hook Form** for forms
- **Zod** for validation
- **Tailwind CSS** for styling
- **Radix UI** for components
- **React Query** for data fetching

---

## 🚀 Quick Start

### Prerequisites
- Node.js v18+
- npm or yarn
- MongoDB (local or MongoDB Atlas)

### Backend Setup (5 minutes)

```bash
cd backend

# Install dependencies
npm install

# Create .env file
cp .env.example .env

# Edit .env with your MongoDB URI and JWT secrets
# MONGODB_URI=your_mongodb_connection_string
# JWT_ACCESS_TOKEN_SECRET=your_secret_key
# JWT_REFRESH_TOKEN_SECRET=your_secret_key

# Start development server
npm run dev
```

Backend runs on: `http://localhost:5000`

### Frontend Setup (5 minutes)

```bash
cd frontend

# Install dependencies
npm install

# Create .env file
cp .env.example .env

# Edit .env with backend API URL
# VITE_API_BASE_URL=http://localhost:5000/v1

# Start development server
npm run dev
```

Frontend runs on: `http://localhost:5173`

---

## 🔑 Default Credentials

A default SuperAdmin is created on first run:

**Email**: `admin@example.com`  
**Password**: `password123`

> ⚠️ Change these in production!

---

## 📚 API Endpoints

### Authentication
```
POST   /v1/auth/register      - Register new user
POST   /v1/auth/login         - Login user
POST   /v1/auth/refresh       - Refresh access token
POST   /v1/auth/logout        - Logout user
```

### Health & Status
```
GET    /v1/health             - Health check endpoint
GET    /                       - Server status
```

---

## 🔄 Authentication Flow

```
User Registration/Login
    ↓
Credentials Validated (Zod)
    ↓
Password Hashed (Bcryptjs)
    ↓
User Created/Found in MongoDB
    ↓
JWT Tokens Generated
    ↓
Tokens Stored in localStorage (Frontend)
    ↓
Tokens Stored in Redux (Frontend)
    ↓
Route to Dashboard Based on Role
```

---

## 📁 Project Structure

```
auth-boilerplate-ts-node-mongo/
├── backend/                 # Express API
│   ├── src/
│   │   ├── controllers/     # Request handlers
│   │   ├── services/        # Business logic
│   │   ├── models/          # Mongoose schemas
│   │   ├── routes/          # API routes
│   │   ├── middlewares/      # Express middlewares
│   │   ├── validation/      # Zod schemas
│   │   ├── utils/           # Helpers
│   │   ├── app.ts           # Express setup
│   │   └── server.ts        # Entry point
│   └── package.json
│
├── frontend/                # React app
│   ├── src/
│   │   ├── components/      # React components
│   │   ├── pages/           # Page components
│   │   ├── routes/          # Route definitions
│   │   ├── slice/           # Redux slices
│   │   ├── api/             # API clients
│   │   ├── types/           # TypeScript types
│   │   ├── App.tsx
│   │   └── main.tsx
│   └── package.json
│
└── DOCUMENTATION.md         # Full documentation
```

---

## 🔐 Environment Variables

### Backend `.env`
```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/auth-boilerplate
JWT_ACCESS_TOKEN_SECRET=your_super_secret_key_min_32_chars
JWT_REFRESH_TOKEN_SECRET=your_super_secret_key_min_32_chars
JWT_ACCESS_TOKEN_EXPIRE=1h
JWT_REFRESH_TOKEN_EXPIRE=7d
CORS_ORIGIN=http://localhost:5173
```

### Frontend `.env`
```env
VITE_API_BASE_URL=http://localhost:5000/v1
```

---

## 🧪 Testing

### Register User
```bash
curl -X POST http://localhost:5000/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "John",
    "lastName": "Doe",
    "email": "john@example.com",
    "password": "Password123!"
  }'
```

### Login User
```bash
curl -X POST http://localhost:5000/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "Password123!"
  }'
```

### Health Check
```bash
curl http://localhost:5000/v1/health
```

---

## 📦 Build for Production

### Backend
```bash
cd backend
npm run build
npm start
```

### Frontend
```bash
cd frontend
npm run build
npm run preview
```

---

## 🌐 Deployment

### Vercel Deployment

#### Backend (Vercel Serverless)
1. Push code to GitHub
2. Connect repository to Vercel
3. Set environment variables in Vercel dashboard
4. Deploy automatically on push

#### Frontend (Vercel)
1. Similar process for frontend
2. Set `VITE_API_BASE_URL` to your backend URL

### MongoDB Atlas

1. Create cluster on [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Get connection string
3. Add to `.env`: `MONGODB_URI=<atlas_connection_string>`

---

## 🐛 Troubleshooting

### MongoDB Connection Failed
```bash
# Ensure MongoDB is running
mongod  # Windows
# or
brew services start mongodb-community  # macOS
```

### Port Already in Use
```bash
# Windows: Find and kill process on port
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# macOS/Linux
lsof -i :5000 | grep LISTEN
kill -9 <PID>
```

### CORS Error
Update `CORS_ORIGIN` in backend `.env` to match frontend URL

### Token Issues
Clear localStorage and re-login:
```javascript
localStorage.clear()
```

---

## 📖 Full Documentation

See [DOCUMENTATION.md](./DOCUMENTATION.md) for:
- Detailed architecture explanation
- All API endpoints documentation
- Backend and frontend code structure
- Database schema
- Middleware and utilities explanation
- Common issues and solutions
- Additional resources

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📝 License

This project is licensed under the ISC License - see the LICENSE file for details.

---

## 📧 Support

If you have any questions or issues, please open an issue in the repository.

---

## 📚 Learning Resources

- [Express.js Official Docs](https://expressjs.com/)
- [MongoDB Official Docs](https://www.mongodb.com/docs/)
- [React Official Docs](https://react.dev/)
- [Redux Toolkit Official Docs](https://redux-toolkit.js.org/)
- [TypeScript Official Docs](https://www.typescriptlang.org/docs/)
- [Tailwind CSS Official Docs](https://tailwindcss.com/docs)

---

**Version**: 1.0.0  
**Last Updated**: November 12, 2024

⭐ If you find this helpful, please give it a star!
