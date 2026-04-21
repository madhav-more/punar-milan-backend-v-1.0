# Punar Milan Backend: Vercel Deployment Guide

Follow these steps to deploy your Node.js backend to Vercel.

## 1. Prerequisites
- A [Vercel Account](https://vercel.com/signup).
- [Vercel CLI](https://vercel.com/download) installed (`npm install -g vercel`).
- A [MongoDB Atlas](https://www.mongodb.com/products/platform/atlas-database) cluster (live database).
- [Cloudinary](https://cloudinary.com/) account for image storage.

## 2. Prepare for Deployment
We will optimize the backend for Vercel by:
1. Adding a `vercel.json` configuration.
2. Switching file uploads from Disk to Memory storage.
3. Exporting the Express app as the main handler.

## 3. Environment Variables
You must set these in the Vercel Dashboard (Project Settings > Environment Variables):

| Variable | Value |
| :--- | :--- |
| `MONGODB_URI` | Your MongoDB connection string |
| `JWT_SECRET` | A strong random string |
| `CLOUDINARY_CLOUD_NAME` | Your Cloudinary Cloud Name |
| `CLOUDINARY_API_KEY` | Your Cloudinary API Key |
| `CLOUDINARY_API_SECRET` | Your Cloudinary API Secret |
| `NODE_ENV` | production |

## 4. Deployment Steps
1. Open your terminal in the `backend` directory.
2. Run the following command:
   ```bash
   vercel
   ```
3. Follow the prompts to set up your project.
4. Once the preview is ready, deploy to production:
   ```bash
   vercel --prod
   ```

## 5. Socket.io Note
Standard Socket.io doesn't work out-of-the-box on Vercel Serverless. Your messaging features will need to be adapted to use **Pusher** or **Ably** if you choose to stay on Vercel.
