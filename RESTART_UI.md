# 🔄 How to Restart the UI

## Quick Restart

### Option 1: Restart Everything (Backend + Frontend)
```bash
cd /Users/pradeepyadav/Documents/product-assortment-service_o/grpc-test-ui

# Stop any running processes (Ctrl+C in terminal)
# Then start:
npm start
```

### Option 2: Restart Backend Only
```bash
cd /Users/pradeepyadav/Documents/product-assortment-service_o/grpc-test-ui/server
npm start
# Or if using nodemon:
npm run dev
```

### Option 3: Restart Frontend Only (Development Mode)
```bash
cd /Users/pradeepyadav/Documents/product-assortment-service_o/grpc-test-ui/client
npm start
```

## Development Mode (Auto-reload on changes)

### Backend with Auto-reload:
```bash
cd /Users/pradeepyadav/Documents/product-assortment-service_o/grpc-test-ui/server
npm run dev
# Uses nodemon - automatically restarts on file changes
```

### Frontend with Auto-reload:
```bash
cd /Users/pradeepyadav/Documents/product-assortment-service_o/grpc-test-ui/client
npm start
# Uses react-scripts - automatically reloads browser on changes
```

## Production Build (Static Files)

### Build Frontend:
```bash
cd /Users/pradeepyadav/Documents/product-assortment-service_o/grpc-test-ui/client
npm run build
```

### Serve Production Build:
The backend serves the built files automatically when you run `npm start` from root.

## Stop Running Processes

### Find and Kill Process on Port 3001:
```bash
kill -9 $(lsof -ti:3001)
```

### Find and Kill Process on Port 3000 (React default):
```bash
kill -9 $(lsof -ti:3000)
```

## Full Restart (Clean)

```bash
cd /Users/pradeepyadav/Documents/product-assortment-service_o/grpc-test-ui

# Kill any running processes
kill -9 $(lsof -ti:3001) 2>/dev/null
kill -9 $(lsof -ti:3000) 2>/dev/null

# Start fresh
npm start
```

## Browser Refresh

After restarting, refresh your browser:
- **Hard Refresh**: `Cmd+Shift+R` (Mac) or `Ctrl+Shift+R` (Windows)
- **Clear Cache**: Open DevTools (F12) → Right-click refresh → "Empty Cache and Hard Reload"

