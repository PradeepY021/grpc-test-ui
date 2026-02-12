# 🔄 Complete Flow: Update Proto Button Click

## Step-by-Step Execution Flow

### FRONTEND (Browser - App.js)

#### Step 1: User Clicks "Update Proto"
```javascript
// Location: client/src/App.js, line 103
const handleUpdateProto = async () => {
```

#### Step 2: Validate Token
```javascript
// Line 104-107
if (!githubToken) {
  setError('Please enter your GitHub token first');
  return;
}
```
**Action**: Checks if token field is not empty
**Result**: If empty, shows error and stops

#### Step 3: Set Loading State
```javascript
// Line 109-110
setUpdatingProto(true);  // Shows loading spinner
setError(null);          // Clears previous errors
```

#### Step 4: Make API Call
```javascript
// Line 113-115
const response = await axios.post(`${API_BASE}/github/update-proto`, {
  githubToken: 'YOUR_GITHUB_TOKEN'
});
```
**Action**: Sends POST request to `/api/github/update-proto`
**Payload**: `{ githubToken: "YOUR_GITHUB_TOKEN" }`
**API_BASE**: `/api` (relative URL, so becomes `http://localhost:3001/api`)

---

### BACKEND (Server - github.js)

#### Step 5: Receive Request
```javascript
// Location: server/routes/github.js, line 14
router.post('/update-proto', async (req, res) => {
```

#### Step 6: Extract Token
```javascript
// Line 16
const { githubToken } = req.body;
// githubToken = "YOUR_GITHUB_TOKEN"
```

#### Step 7: Validate Token Exists
```javascript
// Line 18-23
if (!githubToken) {
  return res.status(400).json({
    error: 'GitHub token is required',
    message: 'Please provide a GitHub token...'
  });
}
```
**Action**: Checks if token was provided
**Result**: If missing, returns 400 error

#### Step 8: Check Repository Directory Exists
```javascript
// Line 26-34
try {
  await fs.access(REPO_DIR);
  // REPO_DIR = '/Users/pradeepyadav/Documents/product-assortment-service'
} catch (error) {
  return res.status(404).json({
    error: 'Repository directory not found',
    message: 'Repository directory not found at: ...'
  });
}
```
**Action**: Checks if `/Users/pradeepyadav/Documents/product-assortment-service` exists
**Result**: If not found, returns 404 error

#### Step 9: Initialize Git
```javascript
// Line 37
const git = simpleGit(REPO_DIR);
// Creates git instance pointing to the repository
```

#### Step 10: Get Current Remote URL
```javascript
// Line 38-39
const originalUrl = await git.getConfig('remote.origin.url');
const currentRemoteUrl = originalUrl.value || '';
// Example: "https://github.com/zeptonow/product-assortment-service.git"
```

#### Step 11: Extract Repository Path
```javascript
// Line 42-48
let repoPath = '';
if (currentRemoteUrl.includes('github.com')) {
  const match = currentRemoteUrl.match(/github\.com[\/:](.+?)(?:\.git)?$/);
  if (match) {
    repoPath = match[1];
    // repoPath = "zeptonow/product-assortment-service"
  }
}
```

#### Step 12: Create Authenticated URL
```javascript
// Line 58
const authenticatedUrl = `https://${githubToken}@github.com/${repoPath}.git`;
// Result: "https://YOUR_GITHUB_TOKEN@github.com/zeptonow/product-assortment-service.git"
```

#### Step 13: Update Remote URL with Token
```javascript
// Line 62
await git.addConfig('remote.origin.url', authenticatedUrl);
```
**Action**: Temporarily sets git remote URL to include token for authentication
**Result**: Git will use this token for all operations

#### Step 14: Check Git Status
```javascript
// Line 65
const status = await git.status();
// Gets current git status (modified files, untracked files, etc.)
```

#### Step 15: Stash Changes (if any)
```javascript
// Line 68-72
if (status.files.length > 0 || status.not_added.length > 0 || status.modified.length > 0) {
  console.log('📦 Stashing local changes before pull...');
  await git.stash(['--include-untracked']);
  hasStashed = true;
}
```
**Action**: If there are uncommitted changes, stash them
**Result**: Working directory is clean for pull

#### Step 16: Clean Up Any Ongoing Operations
```javascript
// Line 76-95
try {
  const status = await git.status();
  if (status.conflicted.length > 0 || status.current !== 'main') {
    // Abort any ongoing rebase/merge
    await git.rebase(['--abort']);
    await git.merge(['--abort']);
  }
} catch (cleanupError) {
  // Ignore if no cleanup needed
}
```
**Action**: Aborts any ongoing rebase or merge operations
**Result**: Repository is in clean state

#### Step 17: Pull Latest Changes
```javascript
// Line 99-104
const pullResult = await git.pull('origin', 'main', [
  '--no-rebase',
  '--no-edit',
  '--strategy-option=theirs'
]);
```
**Action**: 
- Fetches latest changes from `origin/main`
- Merges them into local `main` branch
- Uses merge strategy (not rebase)
- Prefers remote changes on conflicts
**Result**: Local repository is updated with latest code

#### Step 18: Handle "Already Up to Date"
```javascript
// Line 106-112
if (pullResult.summary.includes('Already up to date')) {
  console.log('ℹ️  Repository is already up to date');
} else {
  console.log('✅ Successfully pulled latest changes');
}
```
**Action**: Checks if anything was actually pulled
**Result**: Logs appropriate message

#### Step 19: Restore Stashed Changes (if any)
```javascript
// Line 107-114
if (hasStashed) {
  try {
    await git.stash(['pop']);
    console.log('✅ Restored stashed changes');
  } catch (stashError) {
    // Continue if restore fails
  }
}
```
**Action**: Restores previously stashed changes
**Result**: Your local changes are back

#### Step 20: Restore Original Remote URL
```javascript
// Line 167-169
if (currentRemoteUrl && !currentRemoteUrl.includes('@github.com')) {
  await git.addConfig('remote.origin.url', currentRemoteUrl);
}
```
**Action**: Removes token from remote URL (security)
**Result**: Remote URL is back to original (without token)

#### Step 21: Check Proto Directory Exists
```javascript
// Line 220-229
try {
  await fs.access(PROTO_DIR);
  // PROTO_DIR = '/Users/pradeepyadav/Documents/product-assortment-service/proto'
} catch (error) {
  return res.status(404).json({
    error: 'Proto directory not found',
    message: 'Proto directory not found at: ...'
  });
}
```
**Action**: Verifies proto directory exists
**Result**: If not found, returns 404 error

#### Step 22: Read All Proto Files
```javascript
// Line 232
const protoFiles = await readProtoFiles(PROTO_DIR);
```
**Action**: Recursively reads all `.proto` files from `proto/` directory
**Result**: Returns object with file paths as keys and file contents as values

#### Step 23: Validate Proto Files Found
```javascript
// Line 234-240
if (Object.keys(protoFiles).length === 0) {
  return res.status(404).json({
    error: 'No proto files found',
    message: 'No .proto files found in: ...'
  });
}
```
**Action**: Checks if any proto files were found
**Result**: If none found, returns 404 error

#### Step 24: Send Success Response
```javascript
// Line 242-248
res.json({
  success: true,
  message: 'Proto files updated successfully',
  protoFiles: protoFiles,
  protoLocation: PROTO_DIR,
  fileCount: Object.keys(protoFiles).length,
  timestamp: new Date().toISOString()
});
```
**Action**: Sends success response with all proto files
**Payload**: 
```json
{
  "success": true,
  "message": "Proto files updated successfully",
  "protoFiles": {
    "service/store-product-service/store_product_service.proto": "...",
    "service/store-product-service/store_product_messages.proto": "...",
    ...
  },
  "protoLocation": "/Users/pradeepyadav/Documents/product-assortment-service/proto",
  "fileCount": 15,
  "timestamp": "2026-02-11T..."
}
```

---

### BACK TO FRONTEND

#### Step 25: Receive Response
```javascript
// Line 117-120
if (response.data.success) {
  await loadMethods();
  alert('Proto files updated successfully!...');
}
```
**Action**: 
- Checks if response indicates success
- Calls `loadMethods()` to refresh method dropdown
- Shows success alert

#### Step 26: Load Methods
```javascript
// Line 81-89
const loadMethods = async () => {
  const response = await axios.get(`${API_BASE}/proto/methods`);
  setMethods(response.data.methods || []);
}
```
**Action**: Fetches list of all gRPC methods from proto files
**Result**: Method dropdown is populated with latest methods

#### Step 27: Show Success
```javascript
// Line 119
alert(`Proto files updated successfully!\nLocation: ${response.data.protoLocation}\nFiles found: ${response.data.fileCount}`);
```
**Action**: Shows success message with details
**Result**: User sees confirmation

---

## Error Handling

If any step fails, the error is caught and returned:

1. **Token missing** → 400 error
2. **Repo not found** → 404 error
3. **Git pull fails** → 500 error with details
4. **Proto directory missing** → 404 error
5. **No proto files** → 404 error

All errors are logged to server console and returned to frontend with detailed messages.

---

## Summary

1. Frontend sends token to backend
2. Backend validates token and repo
3. Backend updates git remote with token
4. Backend pulls latest code from GitHub
5. Backend reads all `.proto` files
6. Backend returns proto files to frontend
7. Frontend updates method list
8. Frontend shows success message

**Total Steps**: ~27 steps from click to completion

