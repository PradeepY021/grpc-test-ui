#!/bin/bash
# Diagnostic script to check ngrok status

echo "🔍 Diagnosing ngrok issues..."
echo ""

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m'

# Check 1: Is ngrok installed?
echo -e "${BLUE}1. Checking if ngrok is installed...${NC}"
if command -v ngrok &> /dev/null; then
    echo -e "${GREEN}   ✅ ngrok is installed${NC}"
    ngrok version
else
    echo -e "${RED}   ❌ ngrok is not installed${NC}"
    exit 1
fi
echo ""

# Check 2: Is ngrok configured?
echo -e "${BLUE}2. Checking ngrok configuration...${NC}"
if ngrok config check 2>&1 | grep -q "Valid configuration file"; then
    echo -e "${GREEN}   ✅ Configuration is valid${NC}"
    ngrok config check
else
    echo -e "${RED}   ❌ Configuration is invalid${NC}"
    echo "   Run: ./setup-ngrok-auth.sh"
fi
echo ""

# Check 3: Is ngrok process running?
echo -e "${BLUE}3. Checking if ngrok process is running...${NC}"
if pgrep -f ngrok > /dev/null; then
    echo -e "${GREEN}   ✅ Ngrok process is running${NC}"
    echo "   PID: $(pgrep -f ngrok | head -1)"
else
    echo -e "${YELLOW}   ⚠️  Ngrok process is not running${NC}"
fi
echo ""

# Check 4: Can we reach ngrok API?
echo -e "${BLUE}4. Checking ngrok API connectivity...${NC}"
if curl -s --max-time 5 http://localhost:4040/api/tunnels > /dev/null 2>&1; then
    echo -e "${GREEN}   ✅ Can reach ngrok API${NC}"
    
    # Get tunnel status
    TUNNELS=$(curl -s http://localhost:4040/api/tunnels)
    echo "   Response: $TUNNELS"
    
    # Check for tunnels
    if echo "$TUNNELS" | grep -q '"public_url"'; then
        URL=$(echo "$TUNNELS" | grep -o '"public_url":"https://[^"]*' | head -1 | cut -d'"' -f4)
        echo -e "${GREEN}   ✅ Tunnel is active: ${URL}${NC}"
    else
        echo -e "${RED}   ❌ No active tunnels found${NC}"
        
        # Check for errors
        if echo "$TUNNELS" | grep -q "ERR_NGROK"; then
            echo -e "${RED}   ⚠️  Error in response!${NC}"
        fi
    fi
else
    echo -e "${RED}   ❌ Cannot reach ngrok API${NC}"
    echo "   Ngrok might not be running or not started yet"
fi
echo ""

# Check 5: Check ngrok logs
echo -e "${BLUE}5. Checking ngrok logs...${NC}"
if [ -f /tmp/ngrok.log ]; then
    echo -e "${YELLOW}   Last 20 lines of /tmp/ngrok.log:${NC}"
    tail -20 /tmp/ngrok.log
    
    # Check for specific errors
    if grep -q "authentication\|authtoken\|unauthorized" /tmp/ngrok.log 2>/dev/null; then
        echo ""
        echo -e "${RED}   ⚠️  Authentication error found in logs!${NC}"
        echo "   Run: ./setup-ngrok-auth.sh"
    fi
    
    if grep -q "reconnecting\|failed to send" /tmp/ngrok.log 2>/dev/null; then
        echo ""
        echo -e "${RED}   ⚠️  Connection error found in logs!${NC}"
        echo "   This usually means authentication failed"
        echo "   Run: ./setup-ngrok-auth.sh"
    fi
else
    echo -e "${YELLOW}   ⚠️  No log file found at /tmp/ngrok.log${NC}"
fi
echo ""

# Check 6: Is port 3001 accessible?
echo -e "${BLUE}6. Checking if server is running on port 3001...${NC}"
if curl -s --max-time 2 http://localhost:3001/api/health > /dev/null 2>&1; then
    echo -e "${GREEN}   ✅ Server is running on port 3001${NC}"
else
    echo -e "${RED}   ❌ Server is not running on port 3001${NC}"
    echo "   Start the server first: npm start"
fi
echo ""

# Summary and recommendations
echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}Summary & Recommendations:${NC}"
echo ""

if ! ngrok config check 2>&1 | grep -q "Valid"; then
    echo -e "${RED}❌ ACTION REQUIRED:${NC} Ngrok needs authentication"
    echo "   Run: ./setup-ngrok-auth.sh"
elif ! pgrep -f ngrok > /dev/null; then
    echo -e "${YELLOW}⚠️  Ngrok is not running${NC}"
    echo "   Start it with: ngrok http 3001"
    echo "   Or use: ./start-with-ngrok.sh"
elif ! curl -s http://localhost:4040/api/tunnels | grep -q '"public_url"'; then
    echo -e "${RED}❌ Ngrok is running but no tunnel is active${NC}"
    echo "   This usually means authentication failed"
    echo "   Try: ./setup-ngrok-auth.sh"
    echo "   Then restart: ./start-with-ngrok.sh"
else
    echo -e "${GREEN}✅ Everything looks good!${NC}"
    URL=$(curl -s http://localhost:4040/api/tunnels | grep -o '"public_url":"https://[^"]*' | head -1 | cut -d'"' -f4)
    echo "   Your ngrok URL: $URL"
fi

echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"

