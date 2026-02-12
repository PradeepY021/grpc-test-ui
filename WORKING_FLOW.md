# ✅ Working Flow - How to Use the App

## Current Working Flow

### Step 1: Start the Server
```bash
cd /Users/pradeepyadav/Documents/product-assortment-service_o/grpc-test-ui
npm start
```

Server runs on: `http://localhost:3001`

### Step 2: Open UI in Browser
Open: `http://localhost:3001`

### Step 3: Enter GitHub Token
In the UI, enter your token:
```
YOUR_GITHUB_TOKEN
```

### Step 4: Click "Update Proto"
Click the "Update Proto" button

### Step 5: Success! ✅
You'll see:
- ✅ "Proto files updated successfully!"
- ✅ Location: `/Users/pradeepyadav/Documents/product-assortment-service/proto`
- ✅ Files found: 19

### Step 6: Methods Load Automatically
After success, the method dropdown will automatically populate with all gRPC methods from the proto files.

## Alternative: Test API Directly with cURL

If you want to test the API directly (without UI):

```bash
curl -X POST http://localhost:3001/api/github/update-proto \
  -H "Content-Type: application/json" \
  -d '{"githubToken":"YOUR_GITHUB_TOKEN"}'
```

## What Happens After "Update Proto"

1. **Git Pull** - Pulls latest code from `main` branch
2. **Read Proto Files** - Scans `proto/` directory
3. **Load Methods** - Parses proto files and extracts gRPC methods
4. **Update Dropdown** - Method dropdown gets populated
5. **Ready to Test** - You can now select methods and test them

## Next Steps After Success

1. **Select Method** - Choose a gRPC method from dropdown
2. **Edit Message** - Modify the request message (JSON)
3. **Edit Headers** - Update headers if needed
4. **Select Environment** - Choose QA or Prod
5. **Execute** - Click "Execute gRPC Call"
6. **View Response** - See the response in the response area

## Summary

✅ **API is working!**
✅ **19 proto files found**
✅ **Everything is set up correctly**

You don't need to hit the API separately - just use the UI and click "Update Proto"!

