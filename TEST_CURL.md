# 🧪 Test API with cURL

## Test Update Proto Endpoint

### Basic cURL Command
```bash
curl -X POST http://localhost:3001/api/github/update-proto \
  -H "Content-Type: application/json" \
  -d '{"githubToken":"YOUR_GITHUB_TOKEN"}'
```

### Pretty Print Response (with jq)
```bash
curl -X POST http://localhost:3001/api/github/update-proto \
  -H "Content-Type: application/json" \
  -d '{"githubToken":"YOUR_GITHUB_TOKEN"}' \
  | jq '.'
```

### Verbose Output (see headers and response)
```bash
curl -v -X POST http://localhost:3001/api/github/update-proto \
  -H "Content-Type: application/json" \
  -d '{"githubToken":"YOUR_GITHUB_TOKEN"}'
```

### Save Response to File
```bash
curl -X POST http://localhost:3001/api/github/update-proto \
  -H "Content-Type: application/json" \
  -d '{"githubToken":"YOUR_GITHUB_TOKEN"}' \
  -o response.json
```

## Expected Success Response
```json
{
  "success": true,
  "message": "Proto files updated successfully",
  "protoFiles": {
    "service/store-product-service/store_product_service.proto": "...",
    "service/store-product-service/store_product_messages.proto": "..."
  },
  "protoLocation": "/Users/pradeepyadav/Documents/product-assortment-service/proto",
  "fileCount": 15,
  "timestamp": "2026-02-11T..."
}
```

## Expected Error Responses

### Missing Token (400)
```json
{
  "error": "GitHub token is required",
  "message": "Please provide a GitHub token to authenticate and pull latest changes."
}
```

### Repository Not Found (404)
```json
{
  "error": "Repository directory not found",
  "message": "Repository directory not found at: /Users/pradeepyadav/Documents/product-assortment-service",
  "expectedPath": "/Users/pradeepyadav/Documents/product-assortment-service"
}
```

### Git Pull Failed (500)
```json
{
  "error": "Git pull failed",
  "message": "Failed to pull latest changes: ...",
  "expectedPath": "/Users/pradeepyadav/Documents/product-assortment-service/proto"
}
```

## Test Health Endpoint First
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

## One-Liner for Quick Test
```bash
curl -X POST http://localhost:3001/api/github/update-proto -H "Content-Type: application/json" -d '{"githubToken":"YOUR_GITHUB_TOKEN"}' | jq '.success, .message, .fileCount'
```

