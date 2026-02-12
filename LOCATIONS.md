# 📍 File Locations - Where Proto Files Are Read From

## Proto Files Location

The UI reads proto files from your existing repository location:

### Full Path:
```
/Users/pradeepyadav/Documents/product-assortment-service/proto/
```

### Specific Service Proto Files:
```
/Users/pradeepyadav/Documents/product-assortment-service/proto/service/store-product-service/
```

## Directory Structure

```
product-assortment-service/
├── proto/                        ← Proto files location (where you do git pull)
│   ├── service/
│   │   ├── store-product-service/
│   │   │   ├── store_product_service.proto
│   │   │   ├── store_product_messages.proto
│   │   │   └── ...
│   │   ├── category_service/
│   │   └── ...
│   ├── google/
│   └── validate/
└── ... (other repo files)
```

## How It Works

1. **Manual Git Pull**: You do `git pull` in `/Users/pradeepyadav/Documents/product-assortment-service/`
2. **Update Proto Button**: Clicking "Update Proto" reads from the existing location
3. **No Cloning**: The UI doesn't clone - it just reads from your existing repo

## How to Check if Proto Files Are Available

### Option 1: Check via Terminal
```bash
cd /Users/pradeepyadav/Documents/product-assortment-service
ls -la proto/service/store-product-service/
```

### Option 2: Check via File Explorer
Navigate to:
```
Documents/product-assortment-service/proto/service/store-product-service/
```

### Option 3: Verify in UI
After clicking "Update Proto", check the response:
- ✅ Success: Proto files loaded successfully
- ❌ Error: Proto directory not found (do `git pull` first)

## Workflow

1. **Update Proto Files** (in your repo):
   ```bash
   cd /Users/pradeepyadav/Documents/product-assortment-service
   git pull origin main
   ```

2. **Click "Update Proto"** in UI:
   - Verifies proto directory exists
   - Reads all `.proto` files
   - Updates the method list

## Important Notes

- ✅ No cloning - uses your existing repository
- ✅ Proto files are read from `/Users/pradeepyadav/Documents/product-assortment-service/proto/`
- ✅ You must do `git pull` manually before clicking "Update Proto"
- ✅ If proto directory doesn't exist, UI will show an error with the expected path

