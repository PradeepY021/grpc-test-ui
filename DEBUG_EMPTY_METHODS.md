# 🔍 Debug: Empty Methods Dropdown

## Problem
After "Update Proto" succeeds, the methods dropdown is empty.

## Debug Steps

### Step 1: Check Browser Console
1. Open DevTools (F12)
2. Go to **Console** tab
3. Look for:
   ```
   🔄 Loading methods from: /api/proto/methods
   ✅ Methods response: { success: true, methods: [...] }
   📋 Found X methods
   ```

### Step 2: Check Server Terminal
Look for logs like:
```
🔍 Parsing proto files from: /Users/pradeepyadav/Documents/product-assortment-service/proto
📁 Found 19 proto files in ...
✅ Loaded: service/store-product-service/store_product_service.proto
🔍 Found service: StoreProductService with X methods
✅ Total methods found: X
```

### Step 3: Test API Directly
```bash
curl http://localhost:3001/api/proto/methods | jq '.'
```

Should return:
```json
{
  "success": true,
  "methods": [
    {
      "name": "FetchProductDetail",
      "service": "StoreProductService",
      "fullName": "StoreProductService.FetchProductDetail",
      ...
    },
    ...
  ]
}
```

## Common Issues

### Issue 1: Proto Files Not Parsed
**Symptom**: Server logs show "Found 19 proto files" but "Total methods found: 0"
**Cause**: Proto files have syntax errors or missing imports
**Fix**: Check server logs for "Could not load" warnings

### Issue 2: No Services Found
**Symptom**: Proto files load but no services found
**Cause**: Proto files don't define services, or services are in different namespace
**Fix**: Check proto file structure

### Issue 3: Methods Not Returned
**Symptom**: Server finds methods but API returns empty array
**Cause**: Response format issue
**Fix**: Check server response format

## Quick Test

Run this to see what methods are found:
```bash
curl http://localhost:3001/api/proto/methods | jq '.methods | length'
```

Should return a number > 0 if methods are found.

## Share Debug Info

When asking for help, share:
1. Browser console output (F12 → Console)
2. Server terminal logs (when methods endpoint is called)
3. Result of `curl http://localhost:3001/api/proto/methods`

