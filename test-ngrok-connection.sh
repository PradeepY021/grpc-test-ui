#!/bin/bash
# Test ngrok connection and authentication

echo "🔍 Testing ngrok connection..."

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

# Test 1: Check if ngrok can reach API
echo -e "${YELLOW}Test 1: Checking ngrok API connectivity...${NC}"
if curl -s --max-time 5 https://api.ngrok.com > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Can reach ngrok API${NC}"
else
    echo -e "${RED}❌ Cannot reach ngrok API${NC}"
    echo "   This might be a network/firewall issue"
fi

# Test 2: Check config
echo -e "${YELLOW}Test 2: Checking ngrok configuration...${NC}"
if ngrok config check 2>&1 | grep -q "Valid"; then
    echo -e "${GREEN}✅ Configuration file is valid${NC}"
else
    echo -e "${RED}❌ Configuration file is invalid${NC}"
    echo "   Run: ./setup-ngrok-auth.sh"
fi

# Test 3: Try to start ngrok and check status
echo -e "${YELLOW}Test 3: Testing ngrok startup...${NC}"
pkill -f ngrok 2>/dev/null
sleep 2

# Start ngrok in background
ngrok http 3001 > /tmp/ngrok-test.log 2>&1 &
NGROK_PID=$!
sleep 5

# Check if ngrok started
if kill -0 $NGROK_PID 2>/dev/null; then
    # Check tunnel status
    sleep 2
    STATUS=$(curl -s http://localhost:4040/api/tunnels 2>/dev/null)
    
    if [ -n "$STATUS" ] && echo "$STATUS" | grep -q "public_url"; then
        echo -e "${GREEN}✅ Ngrok started successfully!${NC}"
        URL=$(echo "$STATUS" | grep -o '"public_url":"[^"]*' | head -1 | cut -d'"' -f4)
        echo -e "${GREEN}   Your URL: ${URL}${NC}"
    else
        echo -e "${YELLOW}⚠️  Ngrok started but no tunnel found${NC}"
        echo "   Check if port 3001 has a server running"
    fi
    
    # Check logs for errors
    if grep -q "authentication" /tmp/ngrok-test.log 2>/dev/null; then
        echo -e "${RED}❌ Authentication error detected in logs${NC}"
        echo "   You may need to refresh your authtoken"
        echo "   Run: ./setup-ngrok-auth.sh"
    fi
else
    echo -e "${RED}❌ Ngrok failed to start${NC}"
    echo "   Check logs: cat /tmp/ngrok-test.log"
fi

# Cleanup
kill $NGROK_PID 2>/dev/null
pkill -f ngrok 2>/dev/null

echo ""
echo -e "${YELLOW}If you see authentication errors:${NC}"
echo "1. Get a fresh authtoken from: https://dashboard.ngrok.com/get-started/your-authtoken"
echo "2. Run: ngrok config add-authtoken YOUR_NEW_TOKEN"
echo "3. Or use: ./setup-ngrok-auth.sh"

