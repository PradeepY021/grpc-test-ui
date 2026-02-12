# 🔧 Fix: Port 3001 Already in Use

## Quick Fix

If you get `EADDRINUSE: address already in use :::3001`, kill the existing process:

### Option 1: Kill by Port (Recommended)
```bash
# Find process using port 3001
lsof -ti:3001

# Kill it
kill $(lsof -ti:3001)

# Or force kill if needed
kill -9 $(lsof -ti:3001)
```

### Option 2: Kill by Process ID
```bash
# Find the process
lsof -ti:3001
# Output: 47339 (example)

# Kill it
kill 47339

# Or force kill
kill -9 47339
```

### Option 3: Change Port
If you want to use a different port, edit `server/index.js`:
```javascript
const PORT = process.env.PORT || 3002; // Change from 3001 to 3002
```

## Verify Port is Free
```bash
lsof -ti:3001
# Should return nothing if port is free
```

## Then Start Server
```bash
cd /Users/pradeepyadav/Documents/product-assortment-service_o/grpc-test-ui
npm start
```

