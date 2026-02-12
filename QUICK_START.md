# Quick Start - Testing the gRPC Test UI

## 🚀 Fastest Way to Test

### Step 1: Install Dependencies (One-time setup)

```bash
cd grpc-test-ui

# Install backend
npm install

# Install frontend
cd client && npm install && cd ..
```

### Step 2: Start Backend (Terminal 1)

```bash
cd grpc-test-ui
npm start
```

**Expected output:**
```
🚀 Server running on http://localhost:3001
📡 gRPC Test UI Backend ready
```

### Step 3: Start Frontend (Terminal 2)

```bash
cd grpc-test-ui/client
npm start
```

**Expected output:**
```
Compiled successfully!
You can now view grpc-test-ui in the browser.
  Local:            http://localhost:3000
```

### Step 4: Test in Browser

1. **Open**: http://localhost:3000
2. **You should see**: The gRPC Test UI interface

## 🧪 Quick Test Scenarios

### Test 1: Load Methods (No GitHub Token Needed)

1. The UI should automatically try to load methods from local proto files
2. Check browser console for any errors
3. Methods dropdown should populate (may take a few seconds)

**If methods don't load:**
- Check backend is running: `curl http://localhost:3001/api/health`
- Check browser console for errors
- Methods will load from `../proto/` directory (local proto files)

### Test 2: Update Proto (With GitHub Token)

1. Enter your GitHub token in the "GitHub Token" field
2. Click "Update Proto" button
3. Wait for success message
4. Methods should refresh

**Expected**: Success message or error if token is invalid

### Test 3: Select Method and Execute

1. **Select Method**: Choose "FetchProductDetail" from dropdown
2. **Message Editor**: Should auto-populate with example JSON
3. **Edit Message**: 
   ```json
   {
     "product_variant_id": "eb49897f-0110-4d54-984f-aa9f915cf050",
     "store_id": "9785ce3b-ca57-4033-af1e-46504def34d9"
   }
   ```
4. **Select Environment**: Choose "QA"
5. **Headers**: Keep pre-filled headers enabled
6. **Click**: "Execute gRPC Call"
7. **Check Response**: Should see JSON response or error

## 🔍 Verify Everything Works

### Backend Health Check
```bash
curl http://localhost:3001/api/health
```
**Expected**: `{"status":"ok","message":"gRPC Test UI Server is running"}`

### Test Methods Endpoint
```bash
curl http://localhost:3001/api/proto/methods | jq '.methods | length'
```
**Expected**: Number of methods found (should be > 0)

### Test Specific Method
```bash
curl http://localhost:3001/api/proto/methods/FetchProductDetail | jq '.method.name'
```
**Expected**: `"FetchProductDetail"`

## 🐛 Common Issues & Quick Fixes

### Issue: "Cannot GET /api/proto/methods"
**Fix**: Backend not running. Start with `npm start`

### Issue: Methods dropdown is empty
**Fix**: 
- Check backend logs for proto parsing errors
- Try clicking "Update Proto" button
- Check if proto files exist at `../proto/`

### Issue: Frontend won't start
**Fix**:
```bash
cd client
rm -rf node_modules
npm install
npm start
```

### Issue: "Network Error" in browser
**Fix**: 
- Verify backend is running on port 3001
- Check browser console for CORS errors
- Verify `proxy` in `client/package.json` points to `http://localhost:3001`

## 📝 Testing Checklist

- [ ] Backend starts without errors
- [ ] Frontend loads in browser
- [ ] Health check endpoint works
- [ ] Methods endpoint returns data
- [ ] Methods dropdown populates
- [ ] Message editor shows JSON
- [ ] Headers table displays pre-filled values
- [ ] Can edit headers
- [ ] Can add/remove headers
- [ ] gRPC call executes (may fail if network/auth issues, but should attempt)
- [ ] Response area displays result

## 🎯 Next: Test with Real Data

Once basic UI works, test with:
1. Real product variant IDs
2. Real store IDs  
3. QA environment endpoint
4. Verify responses match expected format

