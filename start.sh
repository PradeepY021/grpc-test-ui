#!/bin/bash
# Simple script to start the app

echo "🚀 Starting gRPC Test UI..."

# Kill any existing processes
echo "🧹 Cleaning up..."
kill -9 $(lsof -ti:3001) 2>/dev/null
kill -9 $(lsof -ti:3000) 2>/dev/null

# Build frontend if not built
if [ ! -d "client/build" ]; then
  echo "📦 Building frontend..."
  cd client
  npm install
  npm run build
  cd ..
fi

# Start server
echo "✅ Starting server on http://localhost:3001"
echo ""
echo "Open your browser at: http://localhost:3001"
echo ""
npm start

