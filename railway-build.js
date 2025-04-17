/**
 * Special build script for Railway deployment
 * This script ensures all PhET directories are properly included in the deployment
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// List of required PhET directories that must be included
const REQUIRED_DIRS = [
  "axon",
  "babel",
  "brand",
  "charges-and-fields",
  "chipper",
  "dot",
  "joist",
  "kite",
  "perennial-alias",
  "phet-core",
  "phetcommon",
  "phetmarks",
  "query-string-machine",
  "scenery-phet",
  "scenery",
  "sherpa",
  "sun",
  "tambo",
  "tandem",
  "twixt",
  "utterance-queue"
];

// Function to check if a directory exists
function dirExists(dir) {
  try {
    return fs.existsSync(dir) && fs.statSync(dir).isDirectory();
  } catch (e) {
    return false;
  }
}

// Function to count JS files in a directory (recursive)
function countJsFiles(dir) {
  let count = 0;
  try {
    const files = fs.readdirSync(dir);
    for (const file of files) {
      const fullPath = path.join(dir, file);
      if (fs.statSync(fullPath).isDirectory()) {
        count += countJsFiles(fullPath);
      } else if (file.endsWith('.js')) {
        count++;
      }
    }
  } catch (e) {
    console.error(`Error counting JS files in ${dir}:`, e.message);
  }
  return count;
}

// Function to create a symbolic link if needed
function ensureDirectoryLinked(source, dest) {
  if (!dirExists(source)) {
    console.log(`⚠️ Source directory ${source} doesn't exist!`);
    return false;
  }
  
  // If destination doesn't exist or isn't a directory, create/replace it
  if (!dirExists(dest)) {
    // Remove if it exists but isn't a directory
    if (fs.existsSync(dest)) {
      fs.rmSync(dest, { recursive: true, force: true });
    }
    
    try {
      // Create a hard copy of the directory
      console.log(`📁 Copying ${source} to ${dest}`);
      fs.mkdirSync(dest, { recursive: true });
      
      // Copy all files recursively
      execSync(`cp -R ${source}/* ${dest}/`);
      return true;
    } catch (e) {
      console.error(`❌ Error copying ${source} to ${dest}:`, e.message);
      return false;
    }
  }
  return true;
}

// The main function
async function main() {
  console.log('📦 Railway Build Script - PhET Dependencies\n');
  console.log(`🔍 Current directory: ${process.cwd()}`);
  console.log(`📊 Node.js version: ${process.version}`);
  
  // Create a special "phet-modules" directory in the project root
  const phetModulesDir = path.join(process.cwd(), 'phet-modules');
  if (!dirExists(phetModulesDir)) {
    fs.mkdirSync(phetModulesDir, { recursive: true });
  }
  
  // Ensure all required directories exist for deployment
  const dirStatus = {};
  let missingCount = 0;
  
  for (const dir of REQUIRED_DIRS) {
    const sourceDir = path.join(process.cwd(), dir);
    const destDir = path.join(phetModulesDir, dir);
    
    const exists = dirExists(sourceDir);
    if (exists) {
      const jsCount = countJsFiles(sourceDir);
      console.log(`✅ ${dir} - Found with ${jsCount} JS files`);
      
      // Make sure the directory is properly linked/copied
      const linked = ensureDirectoryLinked(sourceDir, destDir);
      dirStatus[dir] = { exists, jsCount, linked };
    } else {
      console.log(`❌ ${dir} - MISSING`);
      dirStatus[dir] = { exists, jsCount: 0, linked: false };
      missingCount++;
    }
  }
  
  // Check critical files
  const criticalFiles = [
    '/joist/js/preferences/PreferencesModel.js',
    '/joist/js/Sim.js',
    '/joist/js/simLauncher.js',
    '/tandem/js/Tandem.js',
    '/dot/js/dot.js',
    '/axon/js/DerivedProperty.js',
    '/scenery/js/nodes/Node.js'
  ];
  
  console.log('\n🔍 Checking critical files:');
  for (const file of criticalFiles) {
    const filePath = path.join(process.cwd(), file);
    const exists = fs.existsSync(filePath);
    console.log(`${exists ? '✅' : '❌'} ${file} - ${exists ? 'Found' : 'MISSING'}`);
    
    // If file exists, also check if it's properly copied to the modules directory
    if (exists) {
      const destPath = path.join(phetModulesDir, file);
      try {
        // Ensure the directory exists
        fs.mkdirSync(path.dirname(destPath), { recursive: true });
        // Copy the file
        fs.copyFileSync(filePath, destPath);
        console.log(`  ✅ Copied to ${destPath}`);
      } catch (e) {
        console.error(`  ❌ Failed to copy to modules: ${e.message}`);
      }
    }
  }
  
  // Create directory for static assets in the public path
  const publicDir = path.join(process.cwd(), 'public');
  if (!dirExists(publicDir)) {
    fs.mkdirSync(publicDir, { recursive: true });
  }
  
  // Create a manifest file for debugging
  console.log('\n📄 Creating manifest files...');
  const manifestPath = path.join(process.cwd(), 'phet-manifest.json');
  fs.writeFileSync(manifestPath, JSON.stringify({
    dirStatus,
    criticalFiles: criticalFiles.map(file => ({
      path: file,
      exists: fs.existsSync(path.join(process.cwd(), file))
    })),
    timestamp: new Date().toISOString()
  }, null, 2));
  console.log(`✅ Manifest saved to ${manifestPath}`);
  
  // Create a symlink file in server.js to force using the phet-modules
  console.log('\n🔧 Patching server.js to use phet-modules...');
  let serverJs = fs.readFileSync(path.join(process.cwd(), 'server.js'), 'utf8');
  
  // Add module resolution code at the top
  if (!serverJs.includes('phet-modules-resolver')) {
    const patchCode = `
// ===== PhET Modules Resolver (added by railway-build.js) =====
const modulesPath = path.join(__dirname, 'phet-modules');
// Register a custom module resolver to serve files from phet-modules if they exist there
require.extensions['.js'] = function(module, filename) {
  const originalFilename = filename;
  // Check if the file should be served from phet-modules
  REQUIRED_DIRS.forEach(dir => {
    const dirPath = path.join(__dirname, dir);
    if (filename.startsWith(dirPath)) {
      const relativePath = path.relative(dirPath, filename);
      const modulesFilePath = path.join(modulesPath, dir, relativePath);
      if (fs.existsSync(modulesFilePath)) {
        filename = modulesFilePath;
      }
    }
  });
  
  // Load the file content
  const content = fs.readFileSync(filename, 'utf8');
  return module._compile(content, originalFilename);
};
// ===== End PhET Modules Resolver =====

`;
    serverJs = serverJs.replace(
      'const express = require(\'express\');',
      'const express = require(\'express\');\n' + patchCode
    );
    
    // Add REQUIRED_DIRS array
    serverJs = serverJs.replace(
      'const PORT = process.env.PORT || 8080;',
      `const PORT = process.env.PORT || 8080;

// PhET directories that should be checked
const REQUIRED_DIRS = ${JSON.stringify(REQUIRED_DIRS, null, 2)};`
    );
    
    fs.writeFileSync(path.join(process.cwd(), 'server.js'), serverJs);
    console.log('✅ Server.js patched with module resolver');
  } else {
    console.log('ℹ️ Server.js already contains module resolver');
  }
  
  // Build the lab app
  console.log('\n🏗️ Building lab app...');
  try {
    process.chdir(path.join(process.cwd(), 'charges-fields-lab-app'));
    execSync('npm install', { stdio: 'inherit' });
    execSync('npm run build', { stdio: 'inherit' });
    process.chdir(process.cwd());
    console.log('✅ Lab app built successfully');
  } catch (e) {
    console.error('❌ Error building lab app:', e.message);
  }
  
  console.log('\n✨ Railway build completed!');
}

// Run the main function
main().catch(err => {
  console.error('❌ Fatal error in build script:', err);
  process.exit(1);
}); 