/**
 * Remove all audit logging from the entire project
 */

const fs = require('fs');
const path = require('path');

function removeAuditLoggingFromFile(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;

    // Remove import statements
    const importPatterns = [
      /// Audit logging removed
\n?/g,
      /// Audit logging removed
\n?/g,
    ];

    importPatterns.forEach(pattern => {
      if (pattern.test(content)) {
        content = content.replace(pattern, '// Audit logging removed\n');
        modified = true;
      }
    });

    // Remove audit logger instantiation
    const instantiationPatterns = [
      /// Audit logging removed
\n?/g,
      /// Audit logging removed
\n?/g,
    ];

    instantiationPatterns.forEach(pattern => {
      if (pattern.test(content)) {
        content = content.replace(pattern, '// Audit logging removed\n');
        modified = true;
      }
    });

    // Remove audit logging calls (multi-line)
    const auditCallPattern = /\/\/ Log.*\n\s*await auditLogger\.log\(\{[\s\S]*?\}\);\n?/g;
    if (auditCallPattern.test(content)) {
      content = content.replace(auditCallPattern, '// Audit logging removed\n');
      modified = true;
    }

    // Remove simple audit logging calls
    const simpleAuditPattern = /await auditLogger\.log.*\([\s\S]*?\);\n?/g;
    if (simpleAuditPattern.test(content)) {
      content = content.replace(simpleAuditPattern, '// Audit logging removed\n');
      modified = true;
    }

    // Remove audit logger method calls
    const methodCallPatterns = [
      /await auditLogger\.logAuthenticationSuccess[\s\S]*?\);\n?/g,
      /await auditLogger\.logAuthenticationFailure[\s\S]*?\);\n?/g,
      /await auditLogger\.logDataExport[\s\S]*?\);\n?/g,
    ];

    methodCallPatterns.forEach(pattern => {
      if (pattern.test(content)) {
        content = content.replace(pattern, '// Audit logging removed\n');
        modified = true;
      }
    });

    if (modified) {
      fs.writeFileSync(filePath, content);
      console.log(`✅ Removed audit logging from: ${filePath}`);
      return true;
    }
    return false;
  } catch (error) {
    console.error(`❌ Error processing ${filePath}:`, error.message);
    return false;
  }
}

function processDirectory(dirPath, extensions = ['.ts', '.tsx', '.js', '.jsx']) {
  let totalModified = 0;
  
  function walkDir(currentPath) {
    const items = fs.readdirSync(currentPath);
    
    for (const item of items) {
      const fullPath = path.join(currentPath, item);
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory()) {
        // Skip node_modules and .git directories
        if (!['node_modules', '.git', '.next', 'dist'].includes(item)) {
          walkDir(fullPath);
        }
      } else if (stat.isFile()) {
        const ext = path.extname(item);
        if (extensions.includes(ext)) {
          if (removeAuditLoggingFromFile(fullPath)) {
            totalModified++;
          }
        }
      }
    }
  }
  
  walkDir(dirPath);
  return totalModified;
}

console.log('🧹 Removing all audit logging from the project...\n');

// Process the entire project
const projectRoot = path.join(__dirname, '..');
const modifiedFiles = processDirectory(projectRoot);

console.log(`\n🎉 Audit logging removal complete!`);
console.log(`📊 Modified ${modifiedFiles} files`);
console.log(`\n✅ All audit logging has been removed from the project.`);
console.log(`🔄 Restart your server: npm run dev`);
console.log(`🧪 Test login now - it should work!`);