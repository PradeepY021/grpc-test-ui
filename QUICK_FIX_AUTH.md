# Quick Fix: Ngrok Authentication Error

## Error: "reconnecting (failed to send authentication request)"

Your ngrok config exists but authentication is failing. Here's how to fix it:

## Solution: Refresh Your Authtoken

### Step 1: Get a Fresh Authtoken

1. **Go to ngrok dashboard:**
   https://dashboard.ngrok.com/get-started/your-authtoken

2. **Sign in** (or create account if needed)

3. **Copy your authtoken** (it's a long string like: `2abc123def456...`)

### Step 2: Update the Authtoken

Run this command (replace with your actual token):

```bash
ngrok config add-authtoken YOUR_NEW_AUTHTOKEN
```

**OR** use the automated script:

```bash
cd /Users/pradeepyadav/Documents/grpc-test-ui
./setup-ngrok-auth.sh
```

### Step 3: Verify It Works

```bash
# Test the connection
./test-ngrok-connection.sh
```

### Step 4: Start Everything

```bash
./start-with-ngrok.sh
```

## Alternative: Manual Steps

If the script doesn't work, do it manually:

1. **Kill existing ngrok:**
   ```bash
   pkill ngrok
   ```

2. **Add new authtoken:**
   ```bash
   ngrok config add-authtoken YOUR_NEW_TOKEN
   ```

3. **Start your server:**
   ```bash
   npm start
   ```

4. **In another terminal, start ngrok:**
   ```bash
   ngrok http 3001
   ```

## Common Causes

1. **Expired token** - Free tokens can expire
2. **Invalid token** - Token was revoked or changed
3. **Network issues** - Firewall blocking ngrok API
4. **Account issues** - Account suspended or changed

## Still Not Working?

1. **Check network connectivity:**
   ```bash
   curl https://api.ngrok.com
   ```

2. **Check ngrok logs:**
   ```bash
   tail -f ~/.ngrok2/ngrok.log
   ```

3. **Try resetting config:**
   ```bash
   # Backup current config
   cp ~/Library/Application\ Support/ngrok/ngrok.yml ~/ngrok.yml.backup
   
   # Remove old config
   rm ~/Library/Application\ Support/ngrok/ngrok.yml
   
   # Add fresh token
   ngrok config add-authtoken YOUR_NEW_TOKEN
   ```

## Success Indicators

After fixing, you should see:
- ✅ "Session Status: online" (not "reconnecting")
- ✅ "Forwarding: https://xxxx.ngrok-free.app -> http://localhost:3001"
- ✅ No authentication errors in the ngrok output

