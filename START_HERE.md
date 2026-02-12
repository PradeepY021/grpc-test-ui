# 🚀 START HERE - How to Test the gRPC Test UI

## Quick Test (5 minutes)

### 1️⃣ Install Dependencies

```bash
cd grpc-test-ui

# Install backend
npm install

# Install frontend  
cd client
npm install
cd ..
```

### 2️⃣ Verify Setup

```bash
./test-setup.sh
```

This will check if everything is ready.

### 3️⃣ Start Backend (Terminal 1)

```bash
npm start
```

**Wait for**: `🚀 Server running on http://localhost:3001`

### 4️⃣ Start Frontend (Terminal 2)

```bash
npm run client
```

**Wait for**: Browser to open at http://localhost:3000

### 5️⃣ Test in Browser

1. **Check UI loads** - You should see the gRPC Test UI interface
2. **Check methods load** - Methods dropdown should populate (may take a few seconds)
3. **Select a method** - Try "FetchProductDetail"
4. **See example message** - Message editor should show JSON
5. **Check headers** - Headers table should show pre-filled values

## 🧪 Test Scenarios

### Scenario A: Test Without GitHub (Uses Local Proto)

1. ✅ UI loads
2. ✅ Methods dropdown populates (from local proto files)
3. ✅ Select method → message auto-fills
4. ✅ Can edit message
5. ✅ Can edit headers
6. ⚠️  gRPC call may fail (network/auth) but UI should work

### Scenario B: Test With GitHub Token

1. Enter GitHub token
2. Click "Update Proto"
3. ✅ Should see success message
4. ✅ Methods refresh
5. ✅ Can test gRPC calls

### Scenario C: Test gRPC Call

1. Select: `FetchProductDetail`
2. Environment: `QA`
3. Message:
   ```json
   {
     "product_variant_id": "eb49897f-0110-4d54-984f-aa9f915cf050",
     "store_id": "9785ce3b-ca57-4033-af1e-46504def34d9"
   }
   ```
4. Headers: Keep all enabled
5. Click: "Execute gRPC Call"
6. ✅ Should see response or error message

## 🔍 Verify Backend is Working

Open a new terminal and test:

```bash
# Health check
curl http://localhost:3001/api/health

# Get methods
curl http://localhost:3001/api/proto/methods
```

## 📋 What to Check

- [ ] Backend starts (no errors)
- [ ] Frontend opens in browser
- [ ] UI components render
- [ ] Methods dropdown has items
- [ ] Message editor shows JSON
- [ ] Headers table is editable
- [ ] Can click "Execute" button

## 🐛 If Something Doesn't Work

### Backend won't start
- Check Node.js version: `node --version` (need 16+)
- Check port 3001 is free: `lsof -i :3001`
- Check for errors in terminal

### Frontend won't start  
- Check if backend is running first
- Try: `cd client && rm -rf node_modules && npm install`

### Methods dropdown is empty
- Check backend logs for errors
- Try "Update Proto" button
- Check browser console (F12) for errors

### gRPC call fails
- This is expected if network/auth issues
- Check error message for details
- Verify environment endpoints are reachable

## 📚 More Details

- **Full Testing Guide**: See `TESTING.md`
- **Setup Instructions**: See `README.md`
- **Quick Start**: See `QUICK_START.md`

## ✅ Success Criteria

If you can:
1. See the UI in browser ✅
2. See methods in dropdown ✅  
3. Select a method and see example message ✅
4. Edit headers ✅
5. Click "Execute" button ✅

Then the UI is working! 🎉

gRPC calls may fail due to network/auth, but the UI functionality is verified.

