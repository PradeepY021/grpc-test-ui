#!/bin/bash
# Script to help set up ngrok authentication

echo "🔐 Ngrok Authentication Setup"
echo ""

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m'

# Check if ngrok is installed
if ! command -v ngrok &> /dev/null; then
    echo -e "${RED}❌ ngrok is not installed${NC}"
    echo ""
    echo "Install it with:"
    echo "  brew install ngrok/ngrok/ngrok"
    exit 1
fi

echo -e "${GREEN}✅ ngrok is installed${NC}"
echo ""

# Check current config
echo -e "${YELLOW}Checking current ngrok configuration...${NC}"
if ngrok config check 2>&1 | grep -q "Valid configuration file"; then
    echo -e "${GREEN}✅ ngrok is already configured${NC}"
    echo ""
    echo "Current config status:"
    ngrok config check
    echo ""
    read -p "Do you want to add a new authtoken? (y/n) " -n 1 -r
    echo ""
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "Keeping existing configuration."
        exit 0
    fi
else
    echo -e "${YELLOW}⚠️  ngrok needs authentication${NC}"
fi

echo ""
echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}To get your ngrok authtoken:${NC}"
echo ""
echo "1. Go to: https://dashboard.ngrok.com/get-started/your-authtoken"
echo "2. Sign up or log in"
echo "3. Copy your authtoken"
echo ""
echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"
echo ""

# Prompt for authtoken (with retry)
MAX_RETRIES=3
RETRY=0

while [ $RETRY -lt $MAX_RETRIES ]; do
    echo ""
    read -p "Enter your ngrok authtoken: " AUTHTOKEN
    
    if [ -z "$AUTHTOKEN" ]; then
        RETRY=$((RETRY + 1))
        if [ $RETRY -lt $MAX_RETRIES ]; then
            echo -e "${YELLOW}⚠️  No authtoken provided. Please try again.${NC}"
            echo -e "${YELLOW}   (Attempt $RETRY of $MAX_RETRIES)${NC}"
            echo ""
            echo "To get your authtoken:"
            echo "1. Go to: https://dashboard.ngrok.com/get-started/your-authtoken"
            echo "2. Sign in and copy the token"
            echo ""
        else
            echo -e "${RED}❌ No authtoken provided after $MAX_RETRIES attempts${NC}"
            echo ""
            echo "To get your authtoken manually:"
            echo "1. Visit: https://dashboard.ngrok.com/get-started/your-authtoken"
            echo "2. Copy your authtoken"
            echo "3. Run: ngrok config add-authtoken YOUR_TOKEN"
            exit 1
        fi
    else
        break
    fi
done

# Add authtoken
echo ""
echo -e "${YELLOW}Adding authtoken to ngrok...${NC}"
if ngrok config add-authtoken "$AUTHTOKEN" 2>&1; then
    echo ""
    echo -e "${GREEN}✅ Authtoken added successfully!${NC}"
    echo ""
    
    # Verify
    echo -e "${YELLOW}Verifying configuration...${NC}"
    if ngrok config check 2>&1 | grep -q "Valid configuration file"; then
        echo -e "${GREEN}✅ Configuration is valid!${NC}"
        echo ""
        echo -e "${GREEN}You can now start ngrok:${NC}"
        echo "  ngrok http 3001"
        echo ""
        echo "Or use the automated script:"
        echo "  ./start-with-ngrok.sh"
    else
        echo -e "${RED}❌ Configuration verification failed${NC}"
        echo "Please check your authtoken and try again"
        exit 1
    fi
else
    echo -e "${RED}❌ Failed to add authtoken${NC}"
    echo "Please check your authtoken and try again"
    exit 1
fi

