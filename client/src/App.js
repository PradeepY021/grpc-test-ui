import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';

// Function to highlight JSON with full syntax coloring
const highlightJson = (jsonString) => {
  if (!jsonString) return '';
  
  // Escape HTML special characters first
  let highlighted = jsonString
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
  
  // Highlight keys FIRST (quoted strings followed by colon) - green/teal
  highlighted = highlighted.replace(
    /"([^"]+)":/g,
    '<span style="color: #10b981;">"$1":</span>'
  );
  
  // Highlight boolean values - purple
  highlighted = highlighted.replace(
    /\b(true|false)\b/g,
    '<span style="color: #9333ea;">$1</span>'
  );
  
  // Highlight null - gray
  highlighted = highlighted.replace(
    /\bnull\b/g,
    '<span style="color: #6b7280;">null</span>'
  );
  
  // Highlight numbers (not inside strings) - red
  highlighted = highlighted.replace(
    /:\s*(-?\d+\.?\d*)(?=\s*[,}\]])/g,
    (match, number) => {
      return match.replace(number, `<span style="color: #dc2626;">${number}</span>`);
    }
  );
  
  // Highlight string values LAST (quoted strings that are values, not keys) - blue
  // Match : "value" but avoid already highlighted keys
  highlighted = highlighted.replace(
    /(:\s*)"([^"]*)"/g,
    (match, colon, value) => {
      // Skip if this is already inside a span (already highlighted)
      if (match.includes('<span')) return match;
      return `${colon}<span style="color: #2563eb;">"${value}"</span>`;
    }
  );
  
  return highlighted;
};

// Function to format and highlight JSON
const formatJsonWithHighlight = (jsonString) => {
  try {
    const parsed = JSON.parse(jsonString);
    const formatted = JSON.stringify(parsed, null, 2);
    return highlightJson(formatted);
  } catch (e) {
    // If not valid JSON, just highlight keys in the string
    return highlightJson(jsonString);
  }
};

// JSON Tree Viewer Component with Collapse/Expand and Vertical Lines
let lineNumberCounter = 0;

const JsonTreeViewer = ({ data, level = 0, path = 'root', parentKey = null, lineNumber = null, isLast = false }) => {
  const [collapsed, setCollapsed] = useState({});
  
  if (lineNumber === null) {
    lineNumberCounter = 0;
  }

  const toggleCollapse = (p) => {
    setCollapsed(prev => ({
      ...prev,
      [p]: !prev[p]
    }));
  };

  const renderValue = (value, key, currentPath, currentLineNum, isLastItem) => {
    const indent = level * 20;
    const isCollapsed = collapsed[currentPath];
    const isObject = typeof value === 'object' && value !== null && !Array.isArray(value);
    const isArray = Array.isArray(value);
    const isExpandable = isObject || isArray;

    if (isExpandable) {
      const entries = isArray ? value.map((v, i) => [i, v]) : Object.entries(value);
      const isEmpty = entries.length === 0;
      const bracketOpen = isArray ? '[' : '{';
      const bracketClose = isArray ? ']' : '}';

      return (
        <div className="json-tree-item" key={currentPath}>
          <div className="json-tree-line">
            <span className="json-line-number">{currentLineNum}</span>
            <span 
              className="json-collapse-icon"
              onClick={() => !isEmpty && toggleCollapse(currentPath)}
              style={{ 
                marginLeft: '5px', 
                marginRight: '5px',
                cursor: isEmpty ? 'default' : 'pointer', 
                color: '#6b7280', 
                fontSize: '11px',
                display: isEmpty ? 'none' : 'inline-block'
              }}
            >
              {isCollapsed ? '▶' : '▼'}
            </span>
            <span className="json-content" style={{ paddingLeft: `${indent}px` }}>
              {key !== null && (
                <>
                  <span className="json-key" style={{ color: '#10b981' }}>"{key}"</span>
                  <span style={{ color: '#1f2937', marginRight: '5px' }}>: </span>
                </>
              )}
              <span 
                className="json-bracket" 
                style={{ color: '#1f2937', fontWeight: 'bold' }}
              >
                {bracketOpen}
              </span>
              {isEmpty && <span className="json-bracket" style={{ color: '#1f2937', fontWeight: 'bold' }}>{bracketClose}</span>}
            </span>
          </div>
          {!isCollapsed && !isEmpty && (
            <div className="json-tree-children" style={{ position: 'relative' }}>
              {entries.map(([k, v], idx) => {
                lineNumberCounter++;
                const isLastEntry = idx === entries.length - 1;
                return (
                  <JsonTreeViewer 
                    key={`${currentPath}.${k}`} 
                    data={v} 
                    level={level + 1}
                    path={`${currentPath}.${k}`}
                    parentKey={isArray ? null : k}
                    lineNumber={lineNumberCounter}
                    isLast={isLastEntry}
                  />
                );
              })}
              {lineNumberCounter++}
              <div className="json-tree-line">
                <span className="json-line-number">{lineNumberCounter}</span>
                <span className="json-content" style={{ paddingLeft: `${indent}px` }}>
                  <span className="json-bracket" style={{ color: '#1f2937', fontWeight: 'bold' }}>{bracketClose}</span>
                  {!isLastItem && <span style={{ color: '#1f2937' }}>,</span>}
                </span>
              </div>
            </div>
          )}
        </div>
      );
    } else {
      const valueStr = typeof value === 'string' ? `"${value}"` : String(value);
      const valueColor = typeof value === 'string' ? '#2563eb' : 
                        typeof value === 'number' ? '#dc2626' : 
                        value === null ? '#6b7280' : '#1f2937';

      return (
        <div className="json-tree-item" key={currentPath}>
          <div className="json-tree-line">
            <span className="json-line-number">{currentLineNum}</span>
            <span className="json-content" style={{ paddingLeft: `${indent}px` }}>
              {key !== null && (
                <>
                  <span className="json-key" style={{ color: '#10b981' }}>"{key}"</span>
                  <span style={{ color: '#1f2937', marginRight: '5px' }}>: </span>
                </>
              )}
              <span style={{ color: valueColor }}>{valueStr}</span>
              {!isLastItem && <span style={{ color: '#1f2937' }}>,</span>}
            </span>
          </div>
        </div>
      );
    }
  };

  const currentLine = lineNumber !== null ? lineNumber : (lineNumberCounter = 1);
  return renderValue(data, parentKey, path, currentLine, isLast);
};

// Wrapper component to handle the root level
const JsonViewer = ({ jsonString }) => {
  try {
    const data = JSON.parse(jsonString);
    lineNumberCounter = 0;
    return (
      <div className="json-viewer-container">
        <JsonTreeViewer data={data} level={0} path="root" lineNumber={1} isLast={true} />
      </div>
    );
  } catch (e) {
    return <pre className="response-content">{jsonString}</pre>;
  }
};

const API_BASE = process.env.REACT_APP_API_URL || '/api';

// Audio feedback functions using Web Audio API
// Create a single audio context that persists (required for browser security)
let audioContext = null;

const initAudioContext = () => {
  if (!audioContext) {
    try {
      audioContext = new (window.AudioContext || window.webkitAudioContext)();
    } catch (e) {
      console.log('Audio context creation failed:', e);
      return false;
    }
  }
  
  // Resume audio context if suspended (browser security requirement)
  if (audioContext.state === 'suspended') {
    audioContext.resume().catch(e => {
      console.log('Audio context resume failed:', e);
      return false;
    });
  }
  
  return true;
};

const playSeriousTone = () => {
  if (!initAudioContext()) return;
  
  try {
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    // Serious/alarm tone: lower frequency, harsh
    oscillator.frequency.setValueAtTime(200, audioContext.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(150, audioContext.currentTime + 0.3);
    
    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
    
    oscillator.type = 'sawtooth'; // Harsher sound
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.3);
  } catch (e) {
    console.log('Error playing serious tone:', e);
  }
};

const playSoothingTone = () => {
  if (!initAudioContext()) return;
  
  try {
    // Soothing tone: pleasant chime with multiple frequencies
    const frequencies = [523.25, 659.25, 783.99]; // C, E, G major chord
    
    frequencies.forEach((freq, index) => {
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.frequency.setValueAtTime(freq, audioContext.currentTime);
      oscillator.type = 'sine'; // Smooth sound
      
      gainNode.gain.setValueAtTime(0, audioContext.currentTime);
      gainNode.gain.linearRampToValueAtTime(0.2, audioContext.currentTime + 0.05 + index * 0.05);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5 + index * 0.05);
      
      oscillator.start(audioContext.currentTime + index * 0.05);
      oscillator.stop(audioContext.currentTime + 0.5 + index * 0.05);
    });
  } catch (e) {
    console.log('Error playing soothing tone:', e);
  }
};

// Pre-filled headers
const DEFAULT_HEADERS = [
  { key: 'store_serviceability', value: '{"version":"v1","data":{"9785ce3b-ca57-4033-af1e-46504def34d9":{"cost":1,"type":"PRIMARY_STORE"},"d48222ae-a642-4aeb-9cee-e2829ebaa5e7":{"cost":1,"type":"SECONDARY_STORE"},"73bfbb51-d67b-4eff-9a4f-37c044022f89":{"cost":1,"type":"TERTIARY_STORE"}}}', enabled: true },
  { key: 'user_id', value: '0c0bc00b-1c5d-448e-90f9-840b098d6b4e', enabled: true },
  { key: 'compatible_components', value: 'CUSTOMIZATION_ENABLED,SAMPLING_FOR_COUPON_MOV_ENABLED,CONVENIENCE_FEE,RAIN_FEE,EXTERNAL_COUPONS,STANDSTILL,BUNDLE,MULTI_SELLER_ENABLED,PIP_V1,ROLLUPS,SAMPLING_ENABLED,ETA_NORMAL_WITH_149_DELIVERY,ROLLUPS_UOM,SAMPLING_V2,RE_PROMISE_ETA_ORDER_SCREEN_ENABLED,RECOMMENDED_COUPON_WIDGET,NZS_CAMPAIGN_COMPONENT,ETA_NORMAL_WITH_199_DELIVERY,NEW_FEE_STRUCTURE,PHARMA_ENABLED,REWARDS_WIDGET_MISSION_V2,GAMIFICATION_ENABLED,DYNAMIC_FILTERS,HOMEPAGE_V2,COUPON_WIDGET_CART_REVAMP,AUTOSUGGESTION_PIP,NEW_ETA_BANNER,CART_TABBED_WIDGET,IS_DYNAMIC_NZS_SUPPORTED,ZEPTO_THREE,RERANKING_QCL_RELATED_PRODUCTS,AUTO_COD_ORDER_ENABLED,PAAN_BANNER_WIDGETIZED,SINGLE_CLICK_COD_PAYMENT,AUTOSUGGESTION_PAGE_ENABLED,COUPON_UPSELLING_WIDGET,DELIVERY_UPSELLING_WIDGET,CART_BOX_MODEL_WIDGETS,NEW_WALLET_INFO,REFERRAL_P2,PDP_TOP_PRODUCT_BANNER,AUTOSUGGESTION_AD_PIP,VERTICAL_FEED_PRODUCT_GRID,SWAP_LOGIC_CART_PAGE,3x3_PRODUCT_GRID_WIDGET,BOTTOM_NAV_FULL_ICON,RECOMMENDED_PRODUCTS_VERTICAL_GRID,OOS_RECOMMENDATIONS,PRE_SEARCH_2.0,NEW_BILL_INFO,ZEPTO_PASS,ZEPTO_PASS:3,ZEPTO_PASS_RENEWAL,MANUALLY_APPLIED_DELIVERY_FEE_RECEIVABLE,AUTO_COD_ORDER_ENABLED_V2,PLP_ON_SEARCH,NEW_ROLLUPS_ENABLED,RICH_PRODUCT_CARD_GRID,RPCC_TIMER,MARKETPLACE_REPLACEMENT,MARKETPLACE_CATEGORY_GRID,VBD,CROSS_SELL_V2,ITEMISATION_ENABLED,COUPON_BOTTOM_STRIP,TABBED_CAROUSEL_V2,SUPERSTORE_V1,API_MIGRATION_V1,SEARCH_FILTERS_V1,SUPER_SAVER:1,FTB_ELC:0,PLP_NO_PRODUCTS_SUPPORT_FIX,PRODUCT_LIST_BOTTOM_SHEET,BUY_AGAIN_V3,GIFT_CARD,SCOPED_SEARCH_V1,FLASH_SALE_V3,NO_BAG,GIFTING_ENABLED,OFSE,PROMO_CASH:0,CART_REDESIGN_ENABLED,HYPER_UPI,CART_24X7_ENABLED,DISCOUNTED_ADDONS_ENABLED,ROLLUPS_V99,PC_REVAMP_1,FASHION_REVAMP', enabled: true },
  { key: 'marketplace_type', value: 'SUPER_SAVER', enabled: true },
  { key: 'platform', value: 'ANDROID', enabled: true }
];

function App() {
  const [githubToken, setGithubToken] = useState('');
  const [savedToken, setSavedToken] = useState('');
  const [updatingProto, setUpdatingProto] = useState(false);
  const [methods, setMethods] = useState([]);
  
  // Priority methods that should appear at the top
  const priorityMethods = [
    'FetchProductDetail',
    'FetchDetailsForSPIdsV',
    'FetchStoreProductByStoreSubcategoryId',
    'FetchProductEnrichmentDataForCart'
  ];
  
  // Sort methods: priority first, then alphabetically
  const sortMethods = (methodsList) => {
    const priority = [];
    const others = [];
    
    methodsList.forEach(method => {
      if (priorityMethods.includes(method.name)) {
        priority.push(method);
      } else {
        others.push(method);
      }
    });
    
    // Sort priority methods in the specified order
    priority.sort((a, b) => {
      const indexA = priorityMethods.indexOf(a.name);
      const indexB = priorityMethods.indexOf(b.name);
      return indexA - indexB;
    });
    
    // Sort others alphabetically
    others.sort((a, b) => a.name.localeCompare(b.name));
    
    return [...priority, ...others];
  };
  const [selectedMethod, setSelectedMethod] = useState('');
  const [environment, setEnvironment] = useState('QA');
  const [message, setMessage] = useState('{}');
  const [headers, setHeaders] = useState(DEFAULT_HEADERS);
  const [response, setResponse] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('message');
  const [responseExpanded, setResponseExpanded] = useState(false);
  const [responseHeight, setResponseHeight] = useState(500);
  const [isResizing, setIsResizing] = useState(false);

  useEffect(() => {
    loadMethods();
    // Load saved token from localStorage
    const saved = localStorage.getItem('github_token');
    if (saved) {
      setSavedToken(saved);
      setGithubToken(saved);
    }
    
    // Initialize audio context on first user interaction (required by browsers)
    const initAudio = () => {
      if (!audioContext) {
        initAudioContext();
      }
      document.removeEventListener('click', initAudio);
      document.removeEventListener('keydown', initAudio);
    };
    
    document.addEventListener('click', initAudio, { once: true });
    document.addEventListener('keydown', initAudio, { once: true });
  }, []);

  // Handle resize drag for response box
  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!isResizing) return;
      e.preventDefault();
      const responseContainer = document.querySelector('.response-container');
      if (responseContainer) {
        const containerRect = responseContainer.getBoundingClientRect();
        const newHeight = e.clientY - containerRect.top;
        if (newHeight >= 200 && newHeight <= 1000) {
          setResponseHeight(newHeight);
        }
      }
    };

    const handleMouseUp = () => {
      setIsResizing(false);
    };

    if (isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = 'row-resize';
      document.body.style.userSelect = 'none';
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };
  }, [isResizing]);

  const handleSaveToken = () => {
    if (githubToken) {
      localStorage.setItem('github_token', githubToken);
      setSavedToken(githubToken);
      alert('GitHub token saved successfully!');
    } else {
      alert('Please enter a GitHub token to save');
    }
  };

  // Update message when method changes
  useEffect(() => {
    if (selectedMethod && methods.length > 0) {
      const method = methods.find(m => m.name === selectedMethod);
      if (method && method.exampleRequest && Object.keys(method.exampleRequest).length > 0) {
        setMessage(JSON.stringify(method.exampleRequest, null, 2));
      } else {
        loadMethodDetails(selectedMethod);
      }
    }
  }, [selectedMethod, methods]);

  const loadMethods = async () => {
    try {
      const response = await axios.get(`${API_BASE}/proto/methods`);
      const methodsList = response.data.methods || [];
      const sortedMethods = sortMethods(methodsList);
      setMethods(sortedMethods);
    } catch (error) {
      setError(`Failed to load gRPC methods: ${error.message}`);
      // Don't play sound for initial load errors to avoid annoying users
    }
  };

  const loadMethodDetails = async (methodName) => {
    try {
      const response = await axios.get(`${API_BASE}/proto/methods/${methodName}`);
      if (response.data.method && response.data.method.exampleRequest) {
        setMessage(JSON.stringify(response.data.method.exampleRequest, null, 2));
      }
    } catch (error) {
      console.error('Error loading method details:', error);
    }
  };

  const handleUpdateProto = async () => {
    if (!githubToken) {
      setError('Please enter GitHub token');
      return;
    }
    setUpdatingProto(true);
    setError(null);
    try {
      const response = await axios.post(`${API_BASE}/github/update-proto`, { githubToken });
      if (response.data.success) {
        await loadMethods();
        playSoothingTone(); // Play soothing tone on success
        alert('Proto files updated successfully!');
      }
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to update proto files');
      playSeriousTone(); // Play serious tone on error
    } finally {
      setUpdatingProto(false);
    }
  };

  const handleHeaderChange = (index, field, value) => {
    const newHeaders = [...headers];
    if (field === 'enabled') {
      newHeaders[index].enabled = value;
    } else {
      newHeaders[index][field] = value;
    }
    setHeaders(newHeaders);
  };

  const addHeader = () => {
    setHeaders([...headers, { key: '', value: '', enabled: true }]);
  };

  const removeHeader = (index) => {
    setHeaders(headers.filter((_, i) => i !== index));
  };

  const stripJsonComments = (jsonString) => {
    // Remove comments from JSON string and fix structure
    // Handles cases like: "key": //"old", "new_value",
    
    // Step 1: Handle multi-line pattern where key has commented value and next line has the actual value
    // Pattern: "key": //"old",\n    "new",
    // This regex matches across newlines with flexible whitespace
    let result = jsonString.replace(/"([^"]+)":\s*\/\/"[^"]*",\s*\n\s*"([^"]+)"\s*,/g, '"$1": "$2",');
    
    // Pattern: "key": //"old",\n    new_value, (unquoted UUID)
    result = result.replace(/"([^"]+)":\s*\/\/"[^"]*",\s*\n\s*([a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12})\s*,/gi, '"$1": "$2",');
    
    // Step 2: Handle same-line pattern: "key": //"old", "new",
    result = result.replace(/"([^"]+)":\s*\/\/"[^"]*",\s*"([^"]+)"\s*,/g, '"$1": "$2",');
    result = result.replace(/"([^"]+)":\s*\/\/"[^"]*",\s*([a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12})\s*,/gi, '"$1": "$2",');
    
    // Step 3: Now handle general comment removal line by line
    const lines = result.split('\n');
    let cleaned = [];
    let waitingForValue = false;
    let lastKeyLine = null;
    
    for (let i = 0; i < lines.length; i++) {
      let line = lines[i];
      const trimmed = line.trim();
      
      // Skip empty lines or lines that are only comments
      if (trimmed.length === 0 || trimmed.startsWith('//')) {
        continue;
      }
      
      // Check for inline comments
      const commentIndex = line.indexOf('//');
      if (commentIndex !== -1) {
        const beforeComment = line.substring(0, commentIndex);
        const stringMatches = beforeComment.match(/"/g);
        
        // If even number of quotes before //, we're outside a string
        if (stringMatches && stringMatches.length % 2 === 0) {
          const beforeCommentTrimmed = beforeComment.trim();
          
          // Key with commented value: "key": //"value"
          if (beforeCommentTrimmed.endsWith(':')) {
            cleaned.push(beforeCommentTrimmed);
            waitingForValue = true;
            lastKeyLine = cleaned.length - 1;
            continue;
          }
          
          // Regular inline comment - keep everything before //
          if (beforeCommentTrimmed.length > 0) {
            cleaned.push(beforeCommentTrimmed);
          }
          continue;
        }
      }
      
      // If waiting for value, check if this line is a standalone value
      if (waitingForValue && lastKeyLine !== null) {
        // Quoted value: "value",
        const quotedMatch = trimmed.match(/^"([^"]+)"\s*,?\s*$/);
        // Unquoted UUID: 6385d009-d6f7-4566-977a-61c15a375155,
        const uuidMatch = trimmed.match(/^([a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12})\s*,?\s*$/i);
        
        if (quotedMatch || uuidMatch) {
          const value = quotedMatch ? `"${quotedMatch[1]}"` : `"${uuidMatch[1]}"`;
          cleaned[lastKeyLine] = cleaned[lastKeyLine] + ' ' + value;
          waitingForValue = false;
          lastKeyLine = null;
          continue;
        } else {
          // Not a standalone value, reset waiting state
          waitingForValue = false;
          lastKeyLine = null;
        }
      }
      
      // Normal line - add it
      cleaned.push(line);
    }
    
    result = cleaned.join('\n');
    
    // Step 4: Final cleanup
    // Remove trailing commas before closing braces/brackets
    result = result.replace(/,(\s*[}\]])/g, '$1');
    
    // Fix keys without values (shouldn't happen after our fixes, but safety net)
    result = result.replace(/:\s*$/gm, ': null');
    
    // Remove duplicate commas
    result = result.replace(/,\s*,/g, ',');
    
    // Remove any remaining standalone comment lines that might have been missed
    result = result.replace(/^\s*\/\/.*$/gm, '');
    
    return result;
  };

  const handleGrpcCall = async () => {
    if (!selectedMethod) {
      setError('Please select a gRPC method');
      playSeriousTone(); // Play serious tone for validation error
      return;
    }

    setLoading(true);
    setError(null);
    setResponse(null);

    try {
      let messageObj;
      try {
        // Strip comments before parsing
        const cleanedMessage = stripJsonComments(message);
        messageObj = JSON.parse(cleanedMessage);
      } catch (e) {
        setError(`Invalid JSON in message field: ${e.message}`);
        playSeriousTone(); // Play serious tone on validation error
        setLoading(false);
        return;
      }

      const headersObj = {};
      headers.forEach(header => {
        if (header.enabled && header.key) {
          headersObj[header.key] = header.value;
        }
      });

      const serviceName = 'StoreProductService';

      const response = await axios.post(`${API_BASE}/grpc/call`, {
        methodName: selectedMethod,
        serviceName: serviceName,
        environment: environment,
        message: messageObj,
        headers: headersObj
      });

      setResponse(response.data);
      playSoothingTone(); // Play soothing tone on successful API response
    } catch (error) {
      setError(error.response?.data?.message || error.message || 'gRPC call failed');
      playSeriousTone(); // Play serious tone on error
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app-container">
      {/* Left Sidebar */}
      <div className="sidebar">
        <div className="sidebar-title">Update Proto Files</div>
        
        <div style={{ marginTop: '20px' }}>
          <input
            type="password"
            className="github-token-input"
            placeholder="GitHub Token (ghp_...)"
            value={githubToken}
            onChange={(e) => setGithubToken(e.target.value)}
            style={{ width: '100%', padding: '10px', background: '#ffffff', border: '1px solid #d1d5db', borderRadius: '6px', color: '#1f2937', marginBottom: '10px' }}
          />
          <button
            className="update-proto-button"
            onClick={handleUpdateProto}
            disabled={updatingProto || !githubToken}
          >
            {updatingProto ? 'Updating...' : 'UPDATE PROTO'}
          </button>
          <div style={{ marginTop: '10px', display: 'flex', gap: '10px' }}>
            <button
              onClick={playSoothingTone}
              style={{ padding: '8px 12px', background: '#10b981', border: 'none', borderRadius: '4px', color: '#fff', cursor: 'pointer', fontSize: '12px' }}
              title="Test success tone"
            >
              🔊 Test Success
            </button>
            <button
              onClick={playSeriousTone}
              style={{ padding: '8px 12px', background: '#dc2626', border: 'none', borderRadius: '4px', color: '#fff', cursor: 'pointer', fontSize: '12px' }}
              title="Test error tone"
            >
              🔔 Test Error
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="main-content">
        <div className="top-bar">
          <div className="top-bar-left">
            <div className="hamburger-menu">☰</div>
            <div className="top-bar-title">Product Assortment JSON</div>
          </div>
          <div className="top-bar-right">
            <button className="icon-button">🔍</button>
            <button className="icon-button">⚙️</button>
          </div>
        </div>

        <div className="content-area">
          {/* Tab Navigation */}
          <div className="tab-navigation">
            <div 
              className={`tab-item ${activeTab === 'message' ? 'active' : ''}`}
              onClick={() => setActiveTab('message')}
            >
              Message
            </div>
            <div 
              className={`tab-item ${activeTab === 'metadata' ? 'active' : ''}`}
              onClick={() => setActiveTab('metadata')}
            >
              Metadata <span style={{ color: '#10b981', marginLeft: '4px' }}>({headers.filter(h => h.enabled).length})</span>
            </div>
          </div>

          {/* Tab Content */}
          <div className="tab-content">
            {activeTab === 'message' && (
              <>
                <div style={{ display: 'flex', gap: '15px', marginBottom: '20px', alignItems: 'flex-end' }}>
                  <div className="select-field" style={{ width: '300px', marginBottom: '0' }}>
                    <label>Select gRPC Method</label>
                    <select
                      value={selectedMethod}
                      onChange={(e) => setSelectedMethod(e.target.value)}
                    >
                      <option value="">-- Select Method --</option>
                      {methods.map((method) => (
                        <option key={method.name} value={method.name}>
                          {method.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="select-field" style={{ width: '250px', marginBottom: '0' }}>
                    <label>Environment</label>
                    <select
                      value={environment}
                      onChange={(e) => setEnvironment(e.target.value)}
                    >
                      <option value="QA">QA - pas.zeptonow.dev</option>
                      <option value="PROD">PROD - pas.zepto.co.in</option>
                    </select>
                  </div>

                  <button
                    className="execute-button"
                    onClick={handleGrpcCall}
                    disabled={loading || !selectedMethod}
                  >
                    {loading ? 'Running...' : 'RUN'}
                  </button>
                </div>

                <div style={{ display: 'flex', gap: '20px', alignItems: 'flex-start' }}>
                  <div style={{ flex: '1', display: 'flex', flexDirection: 'column' }}>
                    <div className="code-editor-container">
                      <div className="code-editor-toolbar"></div>
                      <div className="code-editor-wrapper">
                        <pre 
                          className="code-editor-display"
                          dangerouslySetInnerHTML={{ __html: highlightJson(message) }}
                        />
                        <textarea
                          className="code-editor"
                          value={message}
                          onChange={(e) => setMessage(e.target.value)}
                          placeholder='{"product_variant_id": "00556129-fc14-4f76-ac09-3d38f53ef922", "store_id": "9785ce3b-ca57-4033-af1e-46504def34d9"}'
                        />
                      </div>
                    </div>

                    {error && (
                      <div className="error-message">
                        <strong>Error:</strong> {error}
                      </div>
                    )}
                  </div>

                  {response && (
                    <div className="response-container" style={{ flex: responseExpanded ? '2' : '1', marginTop: '0', height: window.innerWidth <= 768 ? 'auto' : `${responseHeight}px` }}>
                      <div className="response-header">
                        <div className="response-title">Response</div>
                        <button
                          className="expand-button"
                          onClick={() => setResponseExpanded(!responseExpanded)}
                          title={responseExpanded ? 'Collapse' : 'Expand'}
                        >
                          {responseExpanded ? '◀' : '▶'}
                        </button>
                      </div>
                      <pre 
                        className="response-content"
                        style={{ maxHeight: `${responseHeight - 80}px` }}
                        dangerouslySetInnerHTML={{ 
                          __html: highlightJson(JSON.stringify(response, null, 2)) 
                        }}
                      />
                      <div 
                        className="resize-handle"
                        onMouseDown={(e) => {
                          e.preventDefault();
                          setIsResizing(true);
                        }}
                        title="Drag to resize"
                      />
                    </div>
                  )}
                </div>
              </>
            )}

            {activeTab === 'metadata' && (
              <div>
                <div className="section-title">
                  <span>📋</span>
                  <span>Headers / Metadata</span>
                </div>
                <div style={{ background: '#ffffff', border: '1px solid #e5e7eb', borderRadius: '8px', padding: '20px', boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr style={{ borderBottom: '1px solid #e5e7eb' }}>
                        <th style={{ textAlign: 'left', padding: '12px', color: '#6b7280', fontSize: '12px', fontWeight: 600 }}>Enabled</th>
                        <th style={{ textAlign: 'left', padding: '12px', color: '#6b7280', fontSize: '12px', fontWeight: 600 }}>Key</th>
                        <th style={{ textAlign: 'left', padding: '12px', color: '#6b7280', fontSize: '12px', fontWeight: 600 }}>Value</th>
                        <th style={{ textAlign: 'left', padding: '12px', color: '#6b7280', fontSize: '12px', fontWeight: 600 }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {headers.map((header, index) => (
                        <tr key={index} style={{ borderBottom: '1px solid #e5e7eb' }}>
                          <td style={{ padding: '12px' }}>
                            <input
                              type="checkbox"
                              checked={header.enabled}
                              onChange={(e) => handleHeaderChange(index, 'enabled', e.target.checked)}
                              style={{ cursor: 'pointer' }}
                            />
                          </td>
                          <td style={{ padding: '12px' }}>
                            <input
                              type="text"
                              value={header.key}
                              onChange={(e) => handleHeaderChange(index, 'key', e.target.value)}
                              style={{ width: '100%', padding: '8px', background: '#ffffff', border: '1px solid #d1d5db', borderRadius: '4px', color: '#1f2937', fontSize: '13px' }}
                              placeholder="Header key"
                            />
                          </td>
                          <td style={{ padding: '12px' }}>
                            <textarea
                              value={header.value}
                              onChange={(e) => handleHeaderChange(index, 'value', e.target.value)}
                              style={{ width: '100%', padding: '8px', background: '#ffffff', border: '1px solid #d1d5db', borderRadius: '4px', color: '#1f2937', fontSize: '13px', minHeight: '60px', resize: 'vertical' }}
                              placeholder="Header value"
                            />
                          </td>
                          <td style={{ padding: '12px' }}>
                            <button
                              onClick={() => removeHeader(index)}
                              style={{ padding: '6px 12px', background: '#dc2626', border: 'none', borderRadius: '4px', color: '#fff', cursor: 'pointer', fontSize: '12px' }}
                            >
                              Remove
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  <button
                    onClick={addHeader}
                    style={{ marginTop: '15px', padding: '10px 20px', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', border: 'none', borderRadius: '6px', color: '#fff', cursor: 'pointer', fontSize: '13px', fontWeight: 600 }}
                  >
                    + Add Header
                  </button>
                </div>
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
