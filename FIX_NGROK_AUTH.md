# Fix Ngrok Authentication Error

## Error: "Session Status: reconnecting (failed to send authentication request)"

This error means ngrok needs to be authenticated with your authtoken.

## Quick Fix

### Step 1: Get Your Ngrok Authtoken

1. **Sign up/Login** at https://dashboard.ngrok.com
2. Go to: https://dashboard.ngrok.com/get-started/your-authtoken
3. Copy your authtoken (looks like: `2abc123def456ghi789jkl012mno345pqr678stu901vwx234yz_5A6B7C8D9E0F1G2H3I4J5K`)

### Step 2: Add Authtoken to Ngrok

Run this command (replace `YOUR_AUTHTOKEN` with your actual token):

```bash
ngrok config add-authtoken YOUR_AUTHTOKEN
```

### Step 3: Verify Configuration

```bash
ngrok config check
```

You should see: `Valid configuration file`

### Step 4: Restart Ngrok

Now start ngrok again:

```bash
ngrok http 3001
```

Or use the automated script:

```bash
./start-with-ngrok.sh
```

## Alternative: Check Existing Config

If you think you already have a token configured:

```bash
# View current config
cat ~/.ngrok2/ngrok.yml

# Or check config location
ngrok config check
```

## Troubleshooting

### Issue: "command not found: ngrok"

Install ngrok:
```bash
brew install ngrok/ngrok/ngrok
```

### Issue: "Invalid authtoken"

- Make sure you copied the entire token
- Check for extra spaces
- Get a fresh token from the dashboard

### Issue: Still showing "reconnecting"

1. **Check internet connection:**
   ```bash
   curl https://api.ngrok.com
   ```

2. **Try restarting ngrok:**
   ```bash
   pkill ngrok
   ngrok http 3001
   ```

3. **Check ngrok status:**
   ```bash
   curl http://localhost:4040/api/tunnels
   ```

### Issue: Network/Firewall blocking

If you're behind a corporate firewall:
- You may need to configure proxy settings
- Contact your network admin
- Or use ngrok's enterprise solution

## Quick Test Script

Run this to test if authentication works:

```bash
# Test ngrok authentication
ngrok http 3001 &
sleep 5
curl http://localhost:4040/api/tunnels
pkill ngrok
```

If you see tunnel information, authentication is working!

## After Fixing

Once authenticated, your ngrok tunnel should show:
- **Status**: online
- **Forwarding**: https://xxxx-xx-xx-xx-xx.ngrok-free.app -> http://localhost:3001

## Need Help?

- Ngrok Docs: https://ngrok.com/docs
- Ngrok Dashboard: https://dashboard.ngrok.com
- Check ngrok logs: `~/.ngrok2/ngrok.log`

