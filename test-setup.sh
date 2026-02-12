#!/bin/bash

echo "🧪 Testing gRPC Test UI Setup..."
echo ""

# Check Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed"
    exit 1
fi
echo "✅ Node.js: $(node --version)"

# Check npm
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed"
    exit 1
fi
echo "✅ npm: $(npm --version)"

# Check if dependencies are installed
if [ ! -d "node_modules" ]; then
    echo "⚠️  Backend dependencies not installed. Run: npm install"
else
    echo "✅ Backend dependencies installed"
fi

if [ ! -d "client/node_modules" ]; then
    echo "⚠️  Frontend dependencies not installed. Run: cd client && npm install"
else
    echo "✅ Frontend dependencies installed"
fi

# Check if proto files exist
if [ -d "../proto" ]; then
    echo "✅ Local proto files found"
else
    echo "⚠️  Local proto files not found. Will need to update from GitHub"
fi

# Check if server files exist
if [ -f "server/index.js" ]; then
    echo "✅ Server files found"
else
    echo "❌ Server files missing"
    exit 1
fi

# Check if client files exist
if [ -f "client/src/App.js" ]; then
    echo "✅ Client files found"
else
    echo "❌ Client files missing"
    exit 1
fi

echo ""
echo "✅ Setup looks good!"
echo ""
echo "To start testing:"
echo "  1. Terminal 1: npm start"
echo "  2. Terminal 2: npm run client"
echo "  3. Open: http://localhost:3000"
echo ""

