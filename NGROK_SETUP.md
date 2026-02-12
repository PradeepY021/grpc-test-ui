# Ngrok Setup Guide for gRPC Test UI

## Quick Start

### Option 1: Use the Automated Script (Recommended)

```bash
cd /Users/pradeepyadav/Documents/grpc-test-ui
./start-with-ngrok.sh
```

This script will:
- ✅ Clean up any existing processes
- ✅ Build the frontend if needed
- ✅ Start the backend server on port 3001
- ✅ Start ngrok tunnel
- ✅ Display your public ngrok URL

### Option 2: Manual Setup

#### Step 1: Start the Backend Server

```bash
cd /Users/pradeepyadav/Documents/grpc-test-ui
npm start
```

The server should start on `http://localhost:3001`

#### Step 2: Start Ngrok (in a new terminal)

```bash
ngrok http 3001
```

#### Step 3: Get Your Public URL

Ngrok will display a URL like:
```
Forwarding  https://xxxx-xx-xx-xx-xx.ngrok-free.app -> http://localhost:3001
```

Use this URL to access your web UI from anywhere!

## Troubleshooting

### Issue: "ERR_NGROK_3200 - The endpoint is offline"

**Causes:**
1. The ngrok process stopped or crashed
2. The local server (port 3001) is not running
3. The ngrok tunnel expired (free tunnels expire after 2 hours)

**Solutions:**

1. **Check if server is running:**
   ```bash
   curl http://localhost:3001/api/health
   ```
   Should return: `{"status":"ok","message":"gRPC Test UI Server is running"}`

2. **Check if ngrok is running:**
   ```bash
   curl http://localhost:4040/api/tunnels
   ```
   Or open: http://localhost:4040 in your browser

3. **Restart everything:**
   ```bash
   # Kill existing processes
   kill -9 $(lsof -ti:3001) 2>/dev/null
   pkill -f ngrok 2>/dev/null
   
   # Start again
   ./start-with-ngrok.sh
   ```

### Issue: Port 3001 is already in use

```bash
# Kill the process using port 3001
kill -9 $(lsof -ti:3001)
```

### Issue: Ngrok authentication required

If you see authentication errors, you need to:
1. Sign up at https://dashboard.ngrok.com
2. Get your authtoken
3. Run: `ngrok config add-authtoken YOUR_TOKEN`

### Issue: Ngrok tunnel keeps disconnecting

Free ngrok tunnels:
- Expire after 2 hours
- Get a new random URL each time
- Have connection limits

**Solutions:**
- Use the script to restart when needed
- Consider ngrok paid plan for persistent URLs
- Use ngrok config file for custom domains (paid feature)

## Ngrok Dashboard

While ngrok is running, you can:
- View requests: http://localhost:4040
- See tunnel status
- Inspect HTTP requests/responses
- Replay requests

## Keeping the Tunnel Active

### For Development:
- Keep the terminal with ngrok running
- Use the automated script which keeps everything together

### For Production/Testing:
- Consider using ngrok's paid plan for persistent URLs
- Or set up a reverse proxy with a static domain

## Environment Variables

You can set these in `.env` file:

```env
PORT=3001
NODE_ENV=production
GITHUB_TOKEN=your_token_here
```

## Next Steps

1. ✅ Start the server and ngrok
2. ✅ Share the ngrok URL with your team
3. ✅ Access the UI at the ngrok URL
4. ✅ Test gRPC methods through the web interface

## Notes

- **Free ngrok URLs change each time** you restart ngrok
- **Tunnels expire after 2 hours** on free plan
- **Keep the terminal open** to maintain the tunnel
- The **ngrok dashboard** at http://localhost:4040 is very useful for debugging

