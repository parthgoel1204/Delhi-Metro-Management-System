#!/bin/bash

# DMRC Housekeeping Full-Stack Deployment Script
# Run this on your VPS or production machine.

echo "🚇 Starting DMRC Housekeeping Deployment..."

# 1. Server Build
echo "📦 Building Backend..."
cd server
npm install
npm run build
cd ..

# 2. Client Build
echo "🎨 Building Frontend..."
cd client
npm install
npm run build
cd ..

echo "✅ Build Complete!"

# 3. PM2 Process Manager setup (Optional but Recommended)
echo ""
echo "🔌 To start the server in production, we recommend using PM2:"
echo "   npm install -g pm2"
echo "   cd server"
echo "   pm2 start dist/index.js --name dmrc-app"
echo ""
echo "Your app will be served purely from the Node.js backend (Port 3001 or $PORT)."
echo "The backend now serves the frontend statically."
