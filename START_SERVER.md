# 🚀 Start the Server

## Error: ECONNREFUSED
This means the server is **not running** on port 3001.

## Solution: Start the Server

### Option 1: Using Start Script
```bash
cd /Users/pradeepyadav/Documents/product-assortment-service_o/grpc-test-ui
./start.sh
```

### Option 2: Manual Start
```bash
cd /Users/pradeepyadav/Documents/product-assortment-service_o/grpc-test-ui

# Build frontend (first time only)
cd client
npm run build
cd ..

# Start server
npm start
```

## Verify Server is Running

After starting, you should see:
```
🚀 Server running on http://localhost:3001
📡 gRPC Test UI Backend ready
```

## Test Server

Once server is running, test with:
```bash
curl http://localhost:3001/api/health
```

Should return:
```json
{
  "status": "ok",
  "message": "gRPC Test UI Server is running"
}
```

## Then Test Methods API

```bash
curl http://localhost:3001/api/proto/methods | jq '.methods | length'
```

## Quick Start Commands

```bash
# Kill any existing server
kill -9 $(lsof -ti:3001) 2>/dev/null

# Start server
cd /Users/pradeepyadav/Documents/product-assortment-service_o/grpc-test-ui
npm start
```

## Open UI

Once server is running:
- Open browser: `http://localhost:3001`
- Or if frontend dev server: `http://localhost:3000`

