#!/bin/bash

echo "🚀 Setting up gRPC Test UI..."

# Check Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 16+ first."
    exit 1
fi

echo "✅ Node.js version: $(node --version)"

# Install backend dependencies
echo "📦 Installing backend dependencies..."
npm install

# Install frontend dependencies
echo "📦 Installing frontend dependencies..."
cd client
npm install
cd ..

echo "✅ Setup complete!"
echo ""
echo "To start the application:"
echo "  1. Backend: npm start (or npm run dev)"
echo "  2. Frontend: npm run client (in another terminal)"
echo ""
echo "Or set NODE_ENV=production and run: npm start (serves both)"

