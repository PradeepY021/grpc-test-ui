# Testing Guide - gRPC Test UI

## Quick Start Testing

### Step 1: Install Dependencies

```bash
cd grpc-test-ui

# Install backend dependencies
npm install

# Install frontend dependencies
cd client
npm install
cd ..
```

### Step 2: Start the Backend Server

```bash
# From grpc-test-ui directory
npm start

# You should see:
# 🚀 Server running on http://localhost:3001
# 📡 gRPC Test UI Backend ready
```

**Alternative (with auto-reload):**
```bash
npm run dev
```

### Step 3: Start the Frontend (in a new terminal)

```bash
cd grpc-test-ui/client
npm start

# React app will open at http://localhost:3000
```

### Step 4: Test the UI

1. **Open Browser**: http://localhost:3000

2. **Test Update Proto Button**:
   - Enter your GitHub token in the "GitHub Token" field
   - Click "Update Proto"
   - Should see success message or error if token is invalid

3. **Test Method Dropdown**:
   - After proto update, dropdown should populate with methods
   - Select a method (e.g., "FetchProductDetail")
   - Message editor should auto-populate with example JSON

4. **Test Environment Selection**:
   - Select QA or PROD from dropdown

5. **Test Headers Table**:
   - Check/uncheck headers to enable/disable
   - Edit header values
   - Add new headers using "Add Header" button

6. **Test gRPC Call**:
   - Select a method
   - Edit message if needed
   - Click "Execute gRPC Call"
   - Response should appear in the scrollable area below

## Manual Testing Checklist

### ✅ Backend API Tests

#### 1. Health Check
```bash
curl http://localhost:3001/api/health
```
**Expected**: `{"status":"ok","message":"gRPC Test UI Server is running"}`

#### 2. Get Methods (using local proto)
```bash
curl http://localhost:3001/api/proto/methods
```
**Expected**: JSON array of methods

#### 3. Update Proto (requires GitHub token)
```bash
curl -X POST http://localhost:3001/api/github/update-proto \
  -H "Content-Type: application/json" \
  -d '{"githubToken":"your_token_here"}'
```
**Expected**: Success message with proto files

#### 4. Get Method Details
```bash
curl http://localhost:3001/api/proto/methods/FetchProductDetail
```
**Expected**: Method details with example request

#### 5. Execute gRPC Call
```bash
curl -X POST http://localhost:3001/api/grpc/call \
  -H "Content-Type: application/json" \
  -d '{
    "methodName": "FetchProductDetail",
    "serviceName": "StoreProductService",
    "environment": "QA",
    "message": {
      "product_variant_id": "test-pv-id",
      "store_id": "test-store-id"
    },
    "headers": {
      "user_id": "test-user-id"
    }
  }'
```
**Expected**: gRPC response or error message

### ✅ Frontend Tests

1. **UI Loads**: Check if all components render
2. **Method Dropdown**: Should show methods after proto load
3. **Message Editor**: Should auto-populate when method selected
4. **Headers Table**: Should show pre-filled headers
5. **Response Area**: Should display formatted JSON

## Troubleshooting

### Issue: "Failed to load gRPC methods"

**Solution**: 
- Check if backend is running on port 3001
- Check if proto files exist in `proto/` directory
- Try clicking "Update Proto" button first

### Issue: "GitHub authentication failed"

**Solution**:
- Verify GitHub token is valid
- Check token has access to `product-assortment-service` repo
- Token should have `repo` scope

### Issue: "Proto file not found"

**Solution**:
- Run "Update Proto" button first
- Or ensure local proto files exist at `../proto/` relative to server

### Issue: "gRPC call failed"

**Possible causes**:
1. **Network connectivity**: Check if you can reach QA/Prod endpoints
2. **SSL certificate**: May need to configure SSL for internal network
3. **Method not found**: Verify method name matches proto definition
4. **Invalid message**: Check JSON format matches proto schema

### Issue: Frontend won't start

**Solution**:
```bash
cd client
rm -rf node_modules package-lock.json
npm install
npm start
```

### Issue: Port already in use

**Solution**:
- Backend: Change PORT in `.env` file
- Frontend: React will prompt to use different port

## Testing with Real Data

### Example: Test FetchProductDetail

1. **Select Method**: `FetchProductDetail`
2. **Select Environment**: `QA`
3. **Message**:
```json
{
  "product_variant_id": "eb49897f-0110-4d54-984f-aa9f915cf050",
  "store_id": "9785ce3b-ca57-4033-af1e-46504def34d9"
}
```
4. **Headers**: Use pre-filled values (enable all)
5. **Click**: "Execute gRPC Call"
6. **Expected**: Product detail response with store product data

### Example: Test FetchDetailsForSPIds

1. **Select Method**: `FetchDetailsForSPIds`
2. **Select Environment**: `QA`
3. **Message**:
```json
{
  "store_product_ids": ["sp-id-1", "sp-id-2"]
}
```
4. **Headers**: Enable required headers
5. **Click**: "Execute gRPC Call"

## Debug Mode

### Enable Backend Logging

Add to `server/index.js`:
```javascript
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path}`, req.body);
  next();
});
```

### Check Proto Parsing

```bash
# Test proto parser directly
node -e "
const { parseProtoFile } = require('./server/utils/protoParser');
parseProtoFile('./proto').then(methods => {
  console.log('Methods found:', methods.length);
  console.log(methods.map(m => m.name));
});
"
```

## Production Testing

### Build for Production

```bash
# Build React app
cd client
npm run build
cd ..

# Start production server
NODE_ENV=production npm start
```

### Test Production Build

```bash
# Server serves both frontend and backend
curl http://localhost:3001/api/health
# Open browser: http://localhost:3001
```

## Common Test Scenarios

### Scenario 1: First Time Setup
1. Install dependencies ✅
2. Start backend ✅
3. Start frontend ✅
4. Update proto (with GitHub token) ✅
5. Select method ✅
6. Execute call ✅

### Scenario 2: Without GitHub Access
1. Start backend (uses local proto) ✅
2. Methods should load from local proto files ✅
3. Test gRPC calls ✅

### Scenario 3: Multiple Methods
1. Update proto once ✅
2. Test different methods ✅
3. Verify message examples change ✅

### Scenario 4: Different Environments
1. Test same method on QA ✅
2. Test same method on PROD ✅
3. Compare responses ✅

## Expected Behavior

### ✅ Success Indicators

- Backend starts without errors
- Frontend loads in browser
- Methods populate in dropdown
- Message editor shows JSON
- Headers table is editable
- gRPC calls return responses
- Response area shows formatted JSON

### ❌ Error Indicators

- Backend crashes on start
- Frontend shows blank page
- Methods dropdown is empty
- "Failed to load" errors
- gRPC calls timeout
- SSL certificate errors

## Next Steps After Testing

1. **Fix any bugs** found during testing
2. **Add request history** feature
3. **Save/load templates**
4. **Add authentication** if needed
5. **Deploy to internal network**

