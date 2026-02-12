const express = require('express');
const router = express.Router();
const fs = require('fs').promises;
const path = require('path');
const { parseProtoFile } = require('../utils/protoParser');

// Use existing proto location where user does manual git pull
const PROTO_BASE_DIR = '/Users/pradeepyadav/Documents/product-assortment-service';
const PROTO_DIR = path.join(PROTO_BASE_DIR, 'proto');
const LOCAL_PROTO_DIR = path.join(__dirname, '../../../proto'); // Fallback to local

/**
 * Get all gRPC methods from proto files
 */
router.get('/methods', async (req, res) => {
  try {
    let protoDir = PROTO_DIR;
    
    // Check if temp repo exists, otherwise use local proto
    try {
      await fs.access(PROTO_DIR);
    } catch {
      protoDir = LOCAL_PROTO_DIR;
    }
    
    console.log(`🔍 Parsing proto files from: ${protoDir}`);
    const methods = await parseProtoFile(protoDir);
    console.log(`✅ Parsed ${methods.length} methods`);
    
    res.json({
      success: true,
      methods: methods
    });
  } catch (error) {
    console.error('Error parsing proto:', error);
    res.status(500).json({
      error: 'Failed to parse proto files',
      message: error.message
    });
  }
});

/**
 * Get method details including request/response schema
 */
router.get('/methods/:methodName', async (req, res) => {
  try {
    const { methodName } = req.params;
    let protoDir = PROTO_DIR;
    
    try {
      await fs.access(PROTO_DIR);
    } catch {
      protoDir = LOCAL_PROTO_DIR;
    }
    
    console.log(`🔍 Getting details for method: ${methodName}`);
    const methodDetails = await parseProtoFile(protoDir, methodName);
    
    if (!methodDetails) {
      return res.status(404).json({
        error: 'Method not found',
        message: `Method "${methodName}" not found in proto files.`
      });
    }
    
    console.log(`✅ Found method: ${methodDetails.name}`);
    console.log(`   Example request:`, JSON.stringify(methodDetails.exampleRequest, null, 2));
    
    res.json({
      success: true,
      method: methodDetails
    });
  } catch (error) {
    console.error('Error getting method details:', error);
    res.status(500).json({
      error: 'Failed to get method details',
      message: error.message
    });
  }
});

module.exports = router;

