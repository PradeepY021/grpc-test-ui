# gRPC Test UI - Product Assortment Service

A web-based UI tool for testing gRPC methods of the Product Assortment Service.

## Features

- ✅ Fetch latest proto files from GitHub main branch
- ✅ List all gRPC methods from proto files
- ✅ Select environment (QA/Prod)
- ✅ Edit request messages with auto-generated examples
- ✅ Manage custom headers (editable table)
- ✅ Execute gRPC calls and view responses
- ✅ Pre-filled common headers (store_serviceability, user_id, etc.)

## Setup

### Prerequisites

- Node.js 16+ and npm
- GitHub token (for updating proto files)

### Installation

1. Install backend dependencies:
```bash
cd grpc-test-ui
npm install
```

2. Install frontend dependencies:
```bash
cd client
npm install
cd ..
```

3. Create `.env` file:
```bash
cp .env.example .env
# Edit .env and add your GitHub token (optional)
```

## Running

### Development Mode

1. Start the backend server:
```bash
npm start
# or
npm run dev  # with nodemon for auto-reload
```

2. In another terminal, start the frontend:
```bash
npm run client
```

3. Open browser: http://localhost:3000

### Production Build

1. Build the React app:
```bash
npm run build
```

2. Start the server:
```bash
NODE_ENV=production npm start
```

## Usage

1. **Update Proto Files**: 
   - Enter your GitHub token
   - Click "Update Proto" to fetch latest from main branch

2. **Select Method**: 
   - Choose a gRPC method from the dropdown
   - The message editor will auto-populate with an example

3. **Select Environment**: 
   - Choose QA or Prod

4. **Edit Message**: 
   - Modify the JSON message as needed

5. **Manage Headers**: 
   - Enable/disable headers using checkboxes
   - Edit header values
   - Add/remove headers as needed

6. **Execute**: 
   - Click "Execute gRPC Call" to make the request
   - View response in the scrollable area below

## API Endpoints

- `POST /api/github/update-proto` - Fetch latest proto from GitHub
- `GET /api/proto/methods` - Get all gRPC methods
- `GET /api/proto/methods/:methodName` - Get method details
- `POST /api/grpc/call` - Execute gRPC call

## Environment Variables

- `PORT` - Server port (default: 3001)
- `NODE_ENV` - Environment (development/production)
- `GITHUB_TOKEN` - GitHub token for repo access (optional)

## Troubleshooting

- **GitHub Access Error**: Make sure your GitHub token has access to the repository
- **Proto Parsing Error**: Check that proto files are in the correct location
- **gRPC Call Failed**: Verify environment endpoints and network connectivity

