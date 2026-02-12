# 🏗️ Build the UI

## Problem
The backend is running, but the UI isn't showing because the frontend hasn't been built.

## Solution: Build the Frontend

### Option 1: Build for Production (Recommended)
```bash
cd /Users/pradeepyadav/Documents/product-assortment-service_o/grpc-test-ui/client
npm install
npm run build
```

Then restart the backend:
```bash
cd /Users/pradeepyadav/Documents/product-assortment-service_o/grpc-test-ui
npm start
```

### Option 2: Run in Development Mode (Auto-reload)
```bash
# Terminal 1: Backend
cd /Users/pradeepyadav/Documents/product-assortment-service_o/grpc-test-ui
npm start

# Terminal 2: Frontend (in development mode)
cd /Users/pradeepyadav/Documents/product-assortment-service_o/grpc-test-ui
npm run client
```

This will:
- Start backend on `http://localhost:3001`
- Start frontend dev server on `http://localhost:3000`
- Open `http://localhost:3000` in browser

## Quick Build Script

```bash
cd /Users/pradeepyadav/Documents/product-assortment-service_o/grpc-test-ui
cd client && npm install && npm run build && cd ..
npm start
```

## Verify Build

After building, check:
```bash
ls -la client/build/
# Should see index.html and other files
```

## Access UI

- **Production build**: `http://localhost:3001`
- **Development mode**: `http://localhost:3000`

