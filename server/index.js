const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware - Allow all origins for deployment (Render, etc.)
app.use(cors({
  origin: true, // Allow all origins for team sharing
  credentials: true
}));
app.use(express.json());
app.use(express.static(path.join(__dirname, '../client/build')));

// Routes
app.use('/api/github', require('./routes/github'));
app.use('/api/proto', require('./routes/proto'));
app.use('/api/grpc', require('./routes/grpc'));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'gRPC Test UI Server is running' });
});

// Serve React app (check if build exists, otherwise serve dev message)
const buildPath = path.join(__dirname, '../client/build');
const fs = require('fs');

if (fs.existsSync(buildPath)) {
  // Serve React app from build
  app.get('*', (req, res) => {
    res.sendFile(path.join(buildPath, 'index.html'));
  });
} else {
  // Build doesn't exist - show helpful message
  app.get('*', (req, res) => {
    res.send(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>gRPC Test UI - Build Required</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 40px; text-align: center; }
            .error { color: #d32f2f; }
            .code { background: #f5f5f5; padding: 20px; border-radius: 5px; margin: 20px 0; }
            pre { text-align: left; display: inline-block; }
          </style>
        </head>
        <body>
          <h1 class="error">⚠️ Frontend Not Built</h1>
          <p>Please build the React frontend first:</p>
          <div class="code">
            <pre>cd client
npm install
npm run build</pre>
          </div>
          <p>Or run in development mode:</p>
          <div class="code">
            <pre>npm run client</pre>
          </div>
          <p><small>Backend API is running at <a href="/api/health">/api/health</a></small></p>
        </body>
      </html>
    `);
  });
}

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📡 gRPC Test UI Backend ready`);
}).on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`❌ Port ${PORT} is already in use!`);
    console.error(`💡 To kill the existing process, run:`);
    console.error(`   kill -9 $(lsof -ti:${PORT})`);
    console.error(`💡 Or use the existing server at http://localhost:${PORT}`);
    process.exit(1);
  } else {
    throw err;
  }
});

