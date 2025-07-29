#!/usr/bin/env node

/**
 * ES6 to CommonJS Converter
 * Converts import/export statements to require/module.exports
 */

const fs = require('fs');
const path = require('path');

function convertES6ToCommonJS(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;

    // Store original content for comparison
    const originalContent = content;

    // Convert import statements
    // Pattern 1: import defaultExport from 'module'
    content = content.replace(/import\s+(\w+)\s+from\s+['"]([^'"]+)['"];?/g, (match, defaultImport, modulePath) => {
      modified = true;
      const cleanPath = modulePath.replace('.js', '');
      return `const ${defaultImport} = require('${cleanPath}');`;
    });

    // Pattern 2: import { namedExports } from 'module'
    content = content.replace(/import\s*\{\s*([^}]+)\s*\}\s*from\s+['"]([^'"]+)['"];?/g, (match, namedImports, modulePath) => {
      modified = true;
      const cleanPath = modulePath.replace('.js', '');
      return `const { ${namedImports} } = require('${cleanPath}');`;
    });

    // Pattern 3: import * as namespace from 'module'
    content = content.replace(/import\s*\*\s*as\s+(\w+)\s+from\s+['"]([^'"]+)['"];?/g, (match, namespace, modulePath) => {
      modified = true;
      const cleanPath = modulePath.replace('.js', '');
      return `const ${namespace} = require('${cleanPath}');`;
    });

    // Convert export statements
    // Pattern 1: export default something
    content = content.replace(/export\s+default\s+/g, () => {
      modified = true;
      return 'module.exports = ';
    });

    // Pattern 2: export function/const/let/var/class - collect names for module.exports
    const exportedNames = [];
    content = content.replace(/export\s+(async\s+)?(function|const|let|var|class)\s+(\w+)/g, (match, asyncKeyword, type, name) => {
      modified = true;
      exportedNames.push(name);
      return `${asyncKeyword || ''}${type} ${name}`;
    });

    // Pattern 2b: export async function
    content = content.replace(/export\s+(async\s+function)\s+(\w+)/g, (match, asyncFunc, name) => {
      modified = true;
      exportedNames.push(name);
      return `${asyncFunc} ${name}`;
    });

    // Pattern 3: export { namedExports }
    const exportMatches = content.match(/export\s*\{\s*([^}]+)\s*\}(\s*from\s+['"]([^'"]+)['"])?;?/g);
    if (exportMatches) {
      exportMatches.forEach(match => {
        const namedExportMatch = match.match(/export\s*\{\s*([^}]+)\s*\}(\s*from\s+['"]([^'"]+)['"])?;?/);
        if (namedExportMatch) {
          const [fullMatch, exports, fromClause, modulePath] = namedExportMatch;
          
          if (fromClause && modulePath) {
            // Re-export from another module
            const cleanPath = modulePath.replace('.js', '');
            const replacement = `const { ${exports} } = require('${cleanPath}');\n\nmodule.exports = { ${exports} };`;
            content = content.replace(fullMatch, replacement);
          } else {
            // Regular named exports
            const replacement = `\nmodule.exports = { ${exports} };`;
            content = content.replace(fullMatch, replacement);
          }
          modified = true;
        }
      });
    }

    // Handle export { name as alias } patterns
    content = content.replace(/export\s*\{\s*([^}]+)\s*\}\s*from\s+['"]([^'"]+)['"];?/g, (match, exports, modulePath) => {
      modified = true;
      const cleanPath = modulePath.replace('.js', '');
      return `const { ${exports} } = require('${cleanPath}');\n\nmodule.exports = { ${exports} };`;
    });

    // Handle mixed exports at the end of files
    if (modified) {
      // Look for individual export function/const declarations and collect them
      const functionExports = [];
      const functionRegex = /^(function|const|let|var|class)\s+(\w+)/gm;
      let match;
      
      const lines = content.split('\n');
      let hasModuleExports = false;
      
      lines.forEach(line => {
        if (line.includes('module.exports')) {
          hasModuleExports = true;
        }
      });

      // If we have export statements but no module.exports, add one
      if (!hasModuleExports && (modified || exportedNames.length > 0)) {
        // Find all function/const/class declarations that were previously exports
        while ((match = functionRegex.exec(originalContent)) !== null) {
          if (originalContent.includes(`export ${match[0]}`)) {
            functionExports.push(match[2]);
          }
        }

        // Combine collected exported names with regex-found names
        const allExports = [...new Set([...exportedNames, ...functionExports])];

        if (allExports.length > 0) {
          content += `\nmodule.exports = {\n${allExports.map(name => `  ${name}`).join(',\n')}\n};`;
        }
      }
    }

    // Write back if modified
    if (modified && content !== originalContent) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`✅ Converted: ${filePath}`);
      return true;
    } else {
      console.log(`⏭️ Skipped: ${filePath} (no changes needed)`);
      return false;
    }

  } catch (error) {
    console.error(`❌ Error converting ${filePath}:`, error.message);
    return false;
  }
}

function findJSFiles(directory) {
  const jsFiles = [];
  
  function walkDir(dir) {
    const files = fs.readdirSync(dir);
    
    files.forEach(file => {
      const fullPath = path.join(dir, file);
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory()) {
        walkDir(fullPath);
      } else if (file.endsWith('.js')) {
        jsFiles.push(fullPath);
      }
    });
  }
  
  walkDir(directory);
  return jsFiles;
}

// Main execution
function main() {
  const targetDirectories = [
    'E:\\codes\\BruhMCP\\backend\\src\\mcp-servers\\slack',
    'E:\\codes\\BruhMCP\\backend\\src\\mcp-servers\\sheets',
    'E:\\codes\\BruhMCP\\backend\\src\\mcp-servers\\reddit',
    'E:\\codes\\BruhMCP\\backend\\src\\mcp-servers\\notion',
    'E:\\codes\\BruhMCP\\backend\\src\\mcp-servers\\googledrive'
  ];

  let totalFiles = 0;
  let convertedFiles = 0;

  targetDirectories.forEach(dir => {
    if (fs.existsSync(dir)) {
      console.log(`\n🔍 Processing directory: ${dir}`);
      const jsFiles = findJSFiles(dir);
      totalFiles += jsFiles.length;
      
      jsFiles.forEach(file => {
        if (convertES6ToCommonJS(file)) {
          convertedFiles++;
        }
      });
    } else {
      console.log(`⚠️ Directory not found: ${dir}`);
    }
  });

  console.log(`\n📊 Conversion Summary:`);
  console.log(`   Total files processed: ${totalFiles}`);
  console.log(`   Files converted: ${convertedFiles}`);
  console.log(`   Files unchanged: ${totalFiles - convertedFiles}`);
}

if (require.main === module) {
  main();
}

module.exports = { convertES6ToCommonJS, findJSFiles };