# 📡 API: `/api/github/update-proto`

## What This API Does

This API **automatically updates your proto files** by pulling the latest changes from GitHub and loading them into the UI.

## Purpose

Instead of manually running `git pull` in your terminal, this API:
1. Uses your GitHub token to authenticate
2. Pulls latest code from `main` branch
3. Reads all `.proto` files
4. Returns them to the UI so you can test gRPC methods

## Endpoint

```
POST /api/github/update-proto
```

## Request Body

```json
{
  "githubToken": "YOUR_GITHUB_TOKEN"
}
```

## What It Does Step-by-Step

1. **Validates Token** - Checks if GitHub token is provided
2. **Checks Repository** - Verifies repo exists at `/Users/pradeepyadav/Documents/product-assortment-service`
3. **Updates Git Remote** - Temporarily adds token to git remote URL for authentication
4. **Stashes Changes** - Saves any uncommitted local changes
5. **Pulls Latest Code** - Runs `git pull origin main` to get latest changes
6. **Restores Changes** - Puts back your local changes (if any)
7. **Reads Proto Files** - Scans `proto/` directory and reads all `.proto` files
8. **Returns Files** - Sends all proto file contents back to UI

## Success Response

```json
{
  "success": true,
  "message": "Proto files updated successfully",
  "protoFiles": {
    "service/store-product-service/store_product_service.proto": "...",
    "service/store-product-service/store_product_messages.proto": "...",
    "service/category-service/category.proto": "..."
  },
  "protoLocation": "/Users/pradeepyadav/Documents/product-assortment-service/proto",
  "fileCount": 15,
  "timestamp": "2026-02-11T12:34:56.789Z"
}
```

## Error Responses

### Missing Token (400)
```json
{
  "error": "GitHub token is required",
  "message": "Please provide a GitHub token..."
}
```

### Repository Not Found (404)
```json
{
  "error": "Repository directory not found",
  "message": "Repository directory not found at: ..."
}
```

### Git Pull Failed (500)
```json
{
  "error": "Git pull failed",
  "message": "Failed to pull latest changes: ..."
}
```

## Why Use This API?

**Before:** 
- Manual `git pull` in terminal
- Restart UI
- Hope it works

**After:**
- Click button in UI
- Automatically pulls latest
- Proto files updated instantly
- Can test immediately

## Use Cases

1. **After Code Review** - Someone merged new proto changes, pull them instantly
2. **Testing New Methods** - New gRPC methods added, update proto files without leaving UI
3. **Development Workflow** - Keep proto files in sync while testing

## Security

- Token is only used temporarily for git operations
- Token is removed from git config after pull
- Token is never stored or logged
- Token is only sent in request body (not in URL)

## Example Usage

### cURL
```bash
curl -X POST http://localhost:3001/api/github/update-proto \
  -H "Content-Type: application/json" \
  -d '{"githubToken":"YOUR_GITHUB_TOKEN"}'
```

### In UI
1. Enter GitHub token in the field
2. Click "Update Proto" button
3. Wait for success message
4. Method dropdown updates automatically

## Summary

**This API = Automated `git pull` + Proto file loading**

Instead of manual steps, one API call does everything!

