# ⚡ Quick Fix: Port Already in Use

## If Backend is Already Running

**Just use it!** Open your browser:
```
http://localhost:3001
```

## If You Want to Restart

### Step 1: Kill Existing Process
```bash
kill -9 $(lsof -ti:3001)
```

### Step 2: Start Server
```bash
cd /Users/pradeepyadav/Documents/product-assortment-service_o/grpc-test-ui
npm start
```

## One-Liner (Kill + Start)
```bash
cd /Users/pradeepyadav/Documents/product-assortment-service_o/grpc-test-ui && kill -9 $(lsof -ti:3001) 2>/dev/null; npm start
```

## Check What's Running
```bash
lsof -ti:3001
# Shows process ID if something is using port 3001
```

