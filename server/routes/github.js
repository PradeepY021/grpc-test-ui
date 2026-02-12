const express = require('express');
const router = express.Router();
const fs = require('fs').promises;
const path = require('path');
const simpleGit = require('simple-git');

// Repository location where we'll do git pull
const REPO_DIR = '/Users/pradeepyadav/Documents/product-assortment-service';
const PROTO_DIR = path.join(REPO_DIR, 'proto');

/**
 * Update proto files by doing git pull with GitHub token authentication
 */
router.post('/update-proto', async (req, res) => {
  try {
    const { githubToken } = req.body;
    
    if (!githubToken) {
      return res.status(400).json({
        error: 'GitHub token is required',
        message: 'Please provide a GitHub token to authenticate and pull latest changes.'
      });
    }

    // Check if repository directory exists
    try {
      await fs.access(REPO_DIR);
    } catch (error) {
      return res.status(404).json({
        error: 'Repository directory not found',
        message: `Repository directory not found at: ${REPO_DIR}. Please ensure the product-assortment-service repository exists at this location.`,
        expectedPath: REPO_DIR
      });
    }

    // Get current remote URL
    const git = simpleGit(REPO_DIR);
    const originalUrl = await git.getConfig('remote.origin.url');
    const currentRemoteUrl = originalUrl.value || '';
    
    // Extract repo path from URL (e.g., https://github.com/zeptonow/product-assortment-service.git or git@github.com:zeptonow/product-assortment-service.git)
    let repoPath = '';
    if (currentRemoteUrl.includes('github.com')) {
      const match = currentRemoteUrl.match(/github\.com[\/:](.+?)(?:\.git)?$/);
      if (match) {
        repoPath = match[1];
      }
    }
    
    if (!repoPath) {
      return res.status(400).json({
        error: 'Invalid repository URL',
        message: `Could not extract repository path from remote URL: ${currentRemoteUrl}`
      });
    }

    // Create authenticated URL
    const authenticatedUrl = `https://${githubToken}@github.com/${repoPath}.git`;
    
    try {
      // Temporarily update remote URL with token
      console.log('🔧 Setting remote URL with token...');
      await git.addConfig('remote.origin.url', authenticatedUrl);
      console.log('✅ Remote URL updated');
      
      // Check for unstaged changes and stash them if needed
      console.log('📊 Checking git status...');
      const status = await git.status();
      console.log('Git status:', {
        current: status.current,
        files: status.files.length,
        not_added: status.not_added.length,
        modified: status.modified.length
      });
      let hasStashed = false;
      
      if (status.files.length > 0 || status.not_added.length > 0 || status.modified.length > 0) {
        console.log('📦 Stashing local changes before pull...');
        await git.stash(['--include-untracked']);
        hasStashed = true;
        console.log('✅ Changes stashed');
      }
      
      try {
        // Abort any ongoing rebase/merge first
        try {
          const status = await git.status();
          if (status.conflicted.length > 0 || status.current !== 'main') {
            console.log('🔄 Cleaning up any ongoing merge/rebase...');
            try {
              await git.rebase(['--abort']);
            } catch (e) {
              // Ignore if no rebase in progress
            }
            try {
              await git.merge(['--abort']);
            } catch (e) {
              // Ignore if no merge in progress
            }
          }
        } catch (cleanupError) {
          // Ignore cleanup errors
          console.log('ℹ️  No cleanup needed');
        }
        
        // Do git pull with merge strategy (no rebase)
        console.log('🔄 Pulling latest changes from main branch...');
        try {
          const pullResult = await git.pull('origin', 'main', [
            '--no-rebase',
            '--no-edit',
            '--strategy-option=theirs' // Prefer remote changes on conflict
          ]);
          
          // pullResult.summary might be an object, convert to string for checking
          const summaryText = typeof pullResult.summary === 'string' 
            ? pullResult.summary 
            : JSON.stringify(pullResult.summary || {});
          
          console.log('Pull result:', {
            summary: summaryText,
            files: pullResult.files || [],
            insertions: pullResult.insertions || 0,
            deletions: pullResult.deletions || 0
          });
          
          // Check if already up to date
          if (summaryText.includes('Already up to date') || 
              summaryText.includes('up to date') ||
              (pullResult.files && pullResult.files.length === 0)) {
            console.log('ℹ️  Repository is already up to date');
          } else {
            console.log('✅ Successfully pulled latest changes');
            console.log('Files updated:', pullResult.files?.length || 0);
          }
        } catch (pullError) {
          // Check if error is just "already up to date"
          if (pullError.message.includes('Already up to date') || 
              pullError.message.includes('up to date')) {
            console.log('ℹ️  Repository is already up to date');
            // Continue - this is not an error
          } else {
            throw pullError; // Re-throw if it's a real error
          }
        }
        
        // Restore stashed changes if any
        if (hasStashed) {
          try {
            await git.stash(['pop']);
            console.log('✅ Restored stashed changes');
          } catch (stashError) {
            console.log('⚠️  Could not restore stashed changes (may have conflicts):', stashError.message);
            // Continue anyway - user can handle conflicts manually
          }
        }
      } catch (pullError) {
        // If pull fails, abort any ongoing operations and restore stash
        try {
          await git.rebase(['--abort']);
        } catch (e) {
          // Ignore if no rebase
        }
        try {
          await git.merge(['--abort']);
        } catch (e) {
          // Ignore if no merge
        }
        
        if (hasStashed) {
          try {
            await git.stash(['pop']);
          } catch (e) {
            // Ignore stash restore errors
          }
        }
        
        // Check if it's a conflict error
        if (pullError.message.includes('CONFLICT') || pullError.message.includes('conflict')) {
          return res.status(409).json({
            error: 'Merge conflict detected',
            message: `Git pull failed due to merge conflicts. Please resolve conflicts manually in the repository.\n\nError: ${pullError.message}\n\nTo resolve:\n1. Go to: ${REPO_DIR}\n2. Resolve conflicts manually\n3. Run: git add . && git commit\n4. Then try Update Proto again`,
            repoPath: REPO_DIR
          });
        }
        
        throw pullError;
      }
      
      // Restore original URL
      if (currentRemoteUrl && !currentRemoteUrl.includes('@github.com')) {
        await git.addConfig('remote.origin.url', currentRemoteUrl);
      }
    } catch (gitError) {
      console.error('❌❌❌ GIT ERROR CAUGHT ❌❌❌');
      console.error('Error type:', gitError.constructor.name);
      console.error('Error message:', gitError.message);
      console.error('Error stack:', gitError.stack);
      console.error('Full error:', JSON.stringify(gitError, Object.getOwnPropertyNames(gitError), 2));
      
      // Restore original URL on error
      if (currentRemoteUrl && !currentRemoteUrl.includes('@github.com')) {
        try {
          await git.addConfig('remote.origin.url', currentRemoteUrl);
        } catch (restoreError) {
          console.error('Failed to restore original URL:', restoreError);
        }
      }
      
      // Check for specific error types
      if (gitError.message.includes('Authentication') || 
          gitError.message.includes('401') || 
          gitError.message.includes('Bad credentials')) {
        return res.status(401).json({
          error: 'GitHub authentication failed',
          message: 'Invalid GitHub token. Please check your token and try again.'
        });
      }
      
      if (gitError.message.includes('Permission denied') || 
          gitError.message.includes('403') ||
          gitError.message.includes('not found') ||
          gitError.message.includes('Not Found')) {
        return res.status(403).json({
          error: 'Repository access denied',
          message: 'Your token does not have access to the repository. Please:\n1. Ensure you have access to zeptonow/product-assortment-service\n2. Enable SSO for the token if required: https://github.com/settings/tokens\n3. Check with your admin for repository access.'
        });
      }
      
      if (gitError.message.includes('CONFLICT') || 
          gitError.message.includes('conflict') ||
          gitError.message.includes('merge conflict')) {
        return res.status(409).json({
          error: 'Merge conflict detected',
          message: `Git pull failed due to merge conflicts.\n\nError: ${gitError.message}\n\nTo resolve:\n1. Go to: ${REPO_DIR}\n2. Run: git rebase --abort (if rebase in progress)\n3. Run: git pull origin main --no-rebase --strategy-option=theirs\n4. Then try Update Proto again`,
          repoPath: REPO_DIR
        });
      }
      
      // Generic git error
      return res.status(500).json({
        error: 'Git pull failed',
        message: `Failed to pull latest changes: ${gitError.message}\n\nPossible causes:\n- Repository access issues\n- Git conflicts\n- Network issues\n\nCheck server logs for more details.`
      });
    }

    // Check if proto directory exists after pull
    try {
      await fs.access(PROTO_DIR);
      console.log('✅ Proto directory exists:', PROTO_DIR);
    } catch (error) {
      console.error('❌ Proto directory not found:', PROTO_DIR);
      return res.status(404).json({
        error: 'Proto directory not found',
        message: `Proto directory not found at: ${PROTO_DIR} after git pull.`,
        expectedPath: PROTO_DIR
      });
    }

    // Read proto files from the updated location
    console.log('📖 Reading proto files from:', PROTO_DIR);
    let protoFiles;
    try {
      protoFiles = await readProtoFiles(PROTO_DIR);
      console.log(`✅ Found ${Object.keys(protoFiles).length} proto files`);
    } catch (readError) {
      console.error('❌ Error reading proto files:', readError);
      return res.status(500).json({
        error: 'Failed to read proto files',
        message: `Error reading proto files: ${readError.message}`,
        checkedPath: PROTO_DIR
      });
    }
    
    if (Object.keys(protoFiles).length === 0) {
      console.warn('⚠️  No proto files found in:', PROTO_DIR);
      return res.status(404).json({
        error: 'No proto files found',
        message: `No .proto files found in: ${PROTO_DIR}. Please check if proto files exist in the repository.`,
        checkedPath: PROTO_DIR
      });
    }
    
    res.json({
      success: true,
      message: 'Proto files updated successfully',
      protoFiles: protoFiles,
      protoLocation: PROTO_DIR,
      fileCount: Object.keys(protoFiles).length,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Error updating proto files:', error);
    console.error('Error stack:', error.stack);
    console.error('Error details:', JSON.stringify(error, null, 2));
    
    // Return the actual error message, not a generic one
    const errorMessage = error.message || 'Unknown error occurred';
    const errorDetails = error.stack || '';
    
    res.status(500).json({
      error: 'Failed to update proto files',
      message: `${errorMessage}\n\nCheck server logs for more details.`,
      details: errorDetails,
      expectedPath: PROTO_DIR
    });
  }
});

/**
 * Read all proto files from directory
 */
async function readProtoFiles(dir) {
  const files = {};
  
  async function readDir(currentDir, relativePath = '') {
    const entries = await fs.readdir(currentDir, { withFileTypes: true });
    
    for (const entry of entries) {
      const fullPath = path.join(currentDir, entry.name);
      const relPath = path.join(relativePath, entry.name);
      
      if (entry.isDirectory()) {
        await readDir(fullPath, relPath);
      } else if (entry.name.endsWith('.proto')) {
        const content = await fs.readFile(fullPath, 'utf-8');
        files[relPath] = content;
      }
    }
  }
  
  await readDir(dir);
  return files;
}

module.exports = router;

