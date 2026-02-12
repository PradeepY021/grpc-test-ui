const express = require('express');
const router = express.Router();
const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');
const path = require('path');
const fs = require('fs').promises;

// Use existing proto location where user does manual git pull
const PROTO_BASE_DIR = '/Users/pradeepyadav/Documents/product-assortment-service';
const PROTO_DIR = path.join(PROTO_BASE_DIR, 'proto');
const LOCAL_PROTO_DIR = path.join(__dirname, '../../../proto'); // Fallback to local

const ENVIRONMENTS = {
  QA: 'pas.zeptonow.dev:443',
  PROD: 'pas.zepto.co.in:443'
};

/**
 * Execute gRPC call
 */
router.post('/call', async (req, res) => {
  try {
    const { methodName, serviceName, environment, message, headers } = req.body;
    
    if (!methodName || !serviceName || !environment || !message) {
      return res.status(400).json({
        error: 'Missing required parameters',
        message: 'methodName, serviceName, environment, and message are required'
      });
    }
    
    if (!ENVIRONMENTS[environment]) {
      return res.status(400).json({
        error: 'Invalid environment',
        message: `Environment must be one of: ${Object.keys(ENVIRONMENTS).join(', ')}`
      });
    }
    
    // Load proto files
    let protoDir = PROTO_DIR;
    try {
      await fs.access(PROTO_DIR);
    } catch {
      protoDir = LOCAL_PROTO_DIR;
    }
    
    const protoPath = path.join(protoDir, 'service', 'store-product-service', 'store_product_service.proto');
    
    // Check if proto file exists
    try {
      await fs.access(protoPath);
    } catch {
      return res.status(404).json({
        error: 'Proto file not found',
        message: `Proto file not found at ${protoPath}. Please update proto files first.`
      });
    }
    
    // Load proto package
    const packageDefinition = protoLoader.loadSync(protoPath, {
      keepCase: true,
      longs: String,
      enums: String,
      defaults: true,
      oneofs: true,
      includeDirs: [protoDir, path.join(protoDir, 'google'), path.join(protoDir, 'validate')]
    });
    
    const protoDescriptor = grpc.loadPackageDefinition(packageDefinition);
    
    // Navigate to the service - proto structure: store_product_service.StoreProductService
    const servicePackage = protoDescriptor.store_product_service;
    if (!servicePackage) {
      return res.status(400).json({
        error: 'Service package not found',
        message: `Package 'store_product_service' not found. Available packages: ${Object.keys(protoDescriptor).join(', ')}`
      });
    }
    
    const Service = servicePackage[serviceName];
    if (!Service) {
      return res.status(400).json({
        error: 'Service not found',
        message: `Service ${serviceName} not found. Available services: ${Object.keys(servicePackage).join(', ')}`
      });
    }
    
    // Create gRPC client
    const client = new Service(
      ENVIRONMENTS[environment],
      grpc.credentials.createSsl()
    );
    
    // Prepare metadata (headers)
    const metadata = new grpc.Metadata();
    if (headers && typeof headers === 'object') {
      Object.entries(headers).forEach(([key, value]) => {
        if (value && typeof value === 'string') {
          metadata.add(key, value);
        }
      });
    }
    
    // Convert message to handle StringValue wrapped types
    // The proto expects StringValue fields as {value: "..."} but user sends plain strings
    const convertedMessage = convertMessageForGrpc(message, Service, methodName, protoDescriptor);
    
    // Make gRPC call
    const response = await new Promise((resolve, reject) => {
      // Check if method exists
      if (typeof client[methodName] !== 'function') {
        return reject(new Error(`Method ${methodName} not found. Available methods: ${Object.getOwnPropertyNames(Object.getPrototypeOf(client)).filter(m => m !== 'constructor').join(', ')}`));
      }
      
      client[methodName](convertedMessage, metadata, (error, response) => {
        if (error) {
          reject(error);
        } else {
          resolve(response);
        }
      });
    });
    
    // Convert response to plain object
    const responseObj = JSON.parse(JSON.stringify(response));
    
    res.json({
      success: true,
      response: responseObj,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('gRPC call error:', error);
    res.status(500).json({
      error: 'gRPC call failed',
      message: error.message,
      details: error.details || error.stack
    });
  }
});

/**
 * Convert message to handle StringValue wrapped types
 * StringValue fields need to be {value: "..."} format for gRPC
 */
function convertMessageForGrpc(message, Service, methodName, protoDescriptor) {
  if (!message || typeof message !== 'object') {
    return message;
  }
  
  const converted = { ...message };
  
  // Try to get the request type from proto descriptor
  // Common StringValue field names in ProductDetailRequest
  const stringValueFields = ['product_id', 'store_id', 'subcategory_id', 'product_variant_id'];
  
  // Convert StringValue fields from plain strings to {value: "..."} format
  stringValueFields.forEach(fieldName => {
    if (fieldName in converted) {
      const value = converted[fieldName];
      // If it's a plain string (not already wrapped), wrap it
      if (typeof value === 'string') {
        converted[fieldName] = { value: value };
      }
      // If it's empty string, still wrap it
      else if (value === '' || value === null || value === undefined) {
        converted[fieldName] = { value: '' };
      }
      // If it's already an object with value property, keep it
      else if (typeof value === 'object' && 'value' in value) {
        // Already wrapped, keep as is
      }
    }
  });
  
  return converted;
}

module.exports = router;

