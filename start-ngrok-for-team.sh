#!/bin/bash
# Script to start the app with ngrok for team sharing

echo "🚀 Starting gRPC Test UI with ngrok for team sharing..."
echo ""

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m'

# Kill any existing processes
echo -e "${YELLOW}🧹 Cleaning up existing processes...${NC}"
kill -9 $(lsof -ti:3001) 2>/dev/null || true
kill -9 $(lsof -ti:3000) 2>/dev/null || true
pkill -f ngrok 2>/dev/null || true
sleep 2

# Check if ngrok is installed
if ! command -v ngrok &> /dev/null; then
    echo -e "${RED}❌ ngrok is not installed!${NC}"
    echo "Install it with: brew install ngrok/ngrok/ngrok"
    exit 1
fi

# Check ngrok authentication
echo -e "${YELLOW}🔍 Checking ngrok authentication...${NC}"
if ! ngrok config check 2>&1 | grep -q "Valid configuration file"; then
    echo -e "${RED}❌ Ngrok is not authenticated!${NC}"
    echo "Run: ./setup-ngrok-auth.sh"
    exit 1
fi
echo -e "${GREEN}✅ Ngrok authentication OK${NC}"

# Build frontend if not built
if [ ! -d "client/build" ]; then
  echo -e "${YELLOW}📦 Building frontend...${NC}"
  cd client
  npm install
  npm run build
  cd ..
fi

# Start backend server in background
echo -e "${GREEN}✅ Starting backend server on port 3001...${NC}"
cd "$(dirname "$0")"
npm start > /tmp/grpc-ui-server.log 2>&1 &
SERVER_PID=$!
sleep 5

# Check if server started successfully
if ! kill -0 $SERVER_PID 2>/dev/null; then
    echo -e "${RED}❌ Failed to start server!${NC}"
    echo "Check logs: cat /tmp/grpc-ui-server.log"
    exit 1
fi

# Wait for server to be ready
for i in {1..10}; do
    if curl -s http://localhost:3001/api/health > /dev/null 2>&1; then
        echo -e "${GREEN}✅ Server is running!${NC}"
        break
    fi
    if [ $i -eq 10 ]; then
        echo -e "${YELLOW}⚠️  Server might not be ready yet, but starting ngrok anyway...${NC}"
    fi
    sleep 1
done

# Start ngrok tunnel
echo -e "${GREEN}🌐 Starting ngrok tunnel...${NC}"
echo ""

# Start ngrok in background
ngrok http 3001 > /tmp/ngrok.log 2>&1 &
NGROK_PID=$!

# Wait for ngrok to start and get URL
echo -e "${YELLOW}   Waiting for ngrok to initialize...${NC}"
NGROK_URL=""
for i in {1..15}; do
    sleep 2
    
    # Check if ngrok process is still running
    if ! kill -0 $NGROK_PID 2>/dev/null; then
        echo -e "${RED}❌ Ngrok process died!${NC}"
        echo "Check logs: cat /tmp/ngrok.log"
        kill $SERVER_PID 2>/dev/null
        exit 1
    fi
    
    # Try to get URL
    TUNNELS_RESPONSE=$(curl -s http://localhost:4040/api/tunnels 2>/dev/null)
    if [ -n "$TUNNELS_RESPONSE" ]; then
        NGROK_URL=$(echo "$TUNNELS_RESPONSE" | grep -o '"public_url":"https://[^"]*' | head -1 | cut -d'"' -f4)
        if [ -n "$NGROK_URL" ]; then
            break
        fi
    fi
    echo -e "${YELLOW}   Attempt $i/15...${NC}"
done

if [ -z "$NGROK_URL" ]; then
    echo -e "${RED}❌ Failed to get ngrok URL after 30 seconds!${NC}"
    echo ""
    echo -e "${YELLOW}Diagnostics:${NC}"
    echo "1. Check ngrok status: curl http://localhost:4040/api/tunnels"
    echo "2. Check ngrok logs: cat /tmp/ngrok.log"
    echo "3. Check ngrok web interface: http://localhost:4040"
    kill $SERVER_PID 2>/dev/null
    kill $NGROK_PID 2>/dev/null
    exit 1
fi

echo ""
echo -e "${GREEN}═══════════════════════════════════════════════════════════${NC}"
echo -e "${GREEN}✅ Everything is running!${NC}"
echo ""
echo -e "${BLUE}📡 Share this URL with your team:${NC}"
echo -e "${GREEN}   ${NGROK_URL}${NC}"
echo ""
echo -e "${YELLOW}📋 Quick Info:${NC}"
echo -e "   Local URL:     http://localhost:3001"
echo -e "   Ngrok Dashboard: http://localhost:4040"
echo ""
echo -e "${YELLOW}⚠️  Important:${NC}"
echo -e "   • Keep this terminal open to keep the tunnel active"
echo -e "   • Free ngrok URLs expire after 2 hours"
echo -e "   • URL changes each time you restart ngrok"
echo -e "   • Press Ctrl+C to stop everything"
echo ""
echo -e "${GREEN}═══════════════════════════════════════════════════════════${NC}"
echo ""

# Function to cleanup on exit
cleanup() {
    echo ""
    echo -e "${YELLOW}🛑 Shutting down...${NC}"
    kill $SERVER_PID 2>/dev/null
    kill $NGROK_PID 2>/dev/null
    pkill -f ngrok 2>/dev/null
    echo -e "${GREEN}✅ Cleanup complete${NC}"
    exit 0
}

# Trap Ctrl+C
trap cleanup INT TERM

# Wait for user to stop
echo "Press Ctrl+C to stop..."
wait

