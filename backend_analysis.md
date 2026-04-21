# Punar Milan Backend Analysis

## Architecture Overview
- **Framework**: Express.js
- **Database**: MongoDB (Mongoose)
- **Real-time**: Socket.io
- **File Storage**: Cloudinary (via local Mutler disk storage)
- **Security**: JWT authentication, Helmet, rate limiting
- **Logging**: Morgan

## Key Components

### 1. Authentication (`src/routes/authRoutes.js`)
- Handles login and registration.
- Uses JWT for session management.

### 2. User Profiles (`src/routes/userRoutes.js`)
- Profile updates and photo uploads.
- **Challenge**: Current upload logic uses `diskStorage`, which is incompatible with Vercel.

### 3. Messaging (`src/socket/socketManager.js`)
- Real-time chat using Socket.io.
- **Challenge**: Vercel Serverless Functions do not support persistent WebSockets.

### 4. Discovery (`src/routes/discoveryRoutes.js`)
- Logic for finding matches and viewing other profiles.

## Vercel Deployment Readiness
- [ ] Add `vercel.json` configuration.
- [ ] Switch `multer` to `memoryStorage`.
- [ ] Refactor Cloudinary upload to handle buffers.
- [ ] Address Socket.io limitation (Switch to Pusher/Ably or migrate to Render/Heroku).
