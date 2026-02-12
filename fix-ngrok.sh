#!/bin/bash
# Quick fix script for ngrok issues

echo "🔧 Fixing ngrok setup..."

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

# Step 1: Kill all existing processes
echo -e "${YELLOW}Step 1: Cleaning up...${NC}"
kill -9 $(lsof -ti:3001) 2>/dev/null || echo "No process on port 3001"
kill -9 $(lsof -ti:3000) 2>/dev/null || echo "No process on port 3000"
pkill -f ngrok 2>/dev/null || echo "No ngrok process found"
sleep 2

# Step 2: Check if server can start
echo -e "${YELLOW}Step 2: Testing server startup...${NC}"
cd "$(dirname "$0")"

# Start server in background
npm start > /tmp/grpc-fix-test.log 2>&1 &
SERVER_PID=$!
sleep 5

# Check if server is responding
if curl -s http://localhost:3001/api/health > /dev/null; then
    echo -e "${GREEN}✅ Server is running correctly${NC}"
    kill $SERVER_PID 2>/dev/null
else
    echo -e "${RED}❌ Server failed to start${NC}"
    echo "Check logs: cat /tmp/grpc-fix-test.log"
    kill $SERVER_PID 2>/dev/null
    exit 1
fi

# Step 3: Check ngrok
echo -e "${YELLOW}Step 3: Checking ngrok...${NC}"
if ! command -v ngrok &> /dev/null; then
    echo -e "${RED}❌ ngrok is not installed${NC}"
    echo "Install with: brew install ngrok/ngrok/ngrok"
    exit 1
fi
echo -e "${GREEN}✅ ngrok is installed${NC}"

# Step 4: Instructions
echo ""
echo -e "${GREEN}═══════════════════════════════════════════════════════════${NC}"
echo -e "${GREEN}✅ Everything looks good!${NC}"
echo ""
echo -e "${YELLOW}To start everything:${NC}"
echo "  ./start-with-ngrok.sh"
echo ""
echo -e "${YELLOW}Or manually:${NC}"
echo "  1. Terminal 1: npm start"
echo "  2. Terminal 2: ngrok http 3001"
echo ""
echo -e "${GREEN}═══════════════════════════════════════════════════════════${NC}"

