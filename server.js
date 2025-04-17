const express = require('express');
const path = require('path');
const fs = require('fs');
const { execSync } = require('child_process');
const app = express();
const PORT = process.env.PORT || 8080;

// Helper function to recursively find files
function findFiles(startPath, filter) {
  if (!fs.existsSync(startPath)) {
    console.log("Directory not found:", startPath);
    return [];
  }

  let results = [];
  try {
    const files = fs.readdirSync(startPath);
    
    for (let i = 0; i < files.length; i++) {
      const filename = path.join(startPath, files[i]);
      const stat = fs.lstatSync(filename);
      
      if (stat.isDirectory()) {
        // Recurse into subdirectories unless they're node_modules
        if (files[i] !== 'node_modules') {
          results = results.concat(findFiles(filename, filter));
        }
      } else if (filename.indexOf(filter) >= 0) {
        results.push(filename);
      }
    }
  } catch (err) {
    console.error("Error searching directory:", err);
  }
  
  return results;
}

// Define paths for the lab app and simulation
const labAppPath = path.join(__dirname, 'charges-fields-lab-app', 'dist');
const simulationPath = path.join(__dirname); // Root directory containing all PhET files

// Debug: List directories and check for specific dependency files
console.log("Current directory:", __dirname);
console.log("Directory contents:", fs.readdirSync(__dirname).join(', '));

// Check for a few crucial directories
const testDirs = ['joist', 'scenery', 'axon', 'tambo'];
testDirs.forEach(dir => {
  const dirPath = path.join(__dirname, dir);
  console.log(`Directory ${dir} exists:`, fs.existsSync(dirPath));
  if (fs.existsSync(dirPath) && fs.existsSync(path.join(dirPath, 'js'))) {
    console.log(`  Files in ${dir}/js:`, fs.readdirSync(path.join(dirPath, 'js')).slice(0, 5).join(', ') + '...');
  }
});

// Check if the manifest file exists from the build process
const manifestFile = path.join(__dirname, 'file_manifest.txt');
if (fs.existsSync(manifestFile)) {
  console.log('Manifest file exists, contains:', fs.readFileSync(manifestFile, 'utf8').split('\n').length, 'files');
} else {
  console.log('Manifest file not found');
}

// Check specific crucial files
const crucialFiles = [
  '/joist/js/preferences/PreferencesModel.js',
  '/joist/js/Sim.js',
  '/joist/js/simLauncher.js',
  '/tandem/js/Tandem.js'
];
crucialFiles.forEach(file => {
  const fullPath = path.join(__dirname, file);
  console.log(`Crucial file ${file} exists:`, fs.existsSync(fullPath));
});

// Add MIME types for proper ES module support
app.use((req, res, next) => {
  if (req.path.endsWith('.js')) {
    res.type('application/javascript');
  } else if (req.path.endsWith('.mjs')) {
    res.type('application/javascript');
  } else if (req.path.endsWith('.json')) {
    res.type('application/json');
  }
  next();
});

// Debug middleware to log 404s
app.use((req, res, next) => {
  // Save the original end method
  const originalEnd = res.end;
  
  // Override end method
  res.end = function() {
    // If it's a 404 for a JS file, log it
    if (res.statusCode === 404 && req.path.endsWith('.js')) {
      console.log(`404 for ${req.path}, file exists: ${fs.existsSync(path.join(__dirname, req.path))}`);
      
      // Try to find a similar file
      const filename = path.basename(req.path);
      const foundFiles = findFiles(__dirname, filename);
      if (foundFiles.length > 0) {
        console.log(`  Similar files found:`, foundFiles.slice(0, 3));
      }
    }
    
    // Call the original end method
    return originalEnd.apply(this, arguments);
  };
  
  next();
});

// Serve the lab app at /lab-app
app.use('/lab-app', express.static(labAppPath));

// Serve static files from the root directory with proper caching disabled
app.use(express.static(simulationPath, {
  etag: false,
  lastModified: false,
  setHeaders: (res) => {
    // Disable caching for all assets
    res.set('Cache-Control', 'no-store, no-cache, must-revalidate, private');
    res.set('Pragma', 'no-cache');
    res.set('Expires', '0');
    
    // Add CORS headers to allow ES module imports
    res.set('Access-Control-Allow-Origin', '*');
    res.set('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  }
}));

// Add a check-file endpoint to verify if specific files exist
app.get('/check-file', (req, res) => {
  const filePath = req.query.path;
  if (!filePath) {
    return res.status(400).json({ error: 'Missing path parameter' });
  }
  
  const fullPath = path.join(__dirname, filePath);
  const exists = fs.existsSync(fullPath);
  
  const result = {
    path: filePath,
    fullPath: fullPath,
    exists: exists
  };
  
  if (exists) {
    try {
      const stats = fs.statSync(fullPath);
      result.size = stats.size;
      result.isDirectory = stats.isDirectory();
      
      if (!stats.isDirectory()) {
        // If it's a JS file, show a sample of the content
        if (filePath.endsWith('.js')) {
          const content = fs.readFileSync(fullPath, 'utf8');
          result.content = content.substring(0, 500) + (content.length > 500 ? '...' : '');
        }
      } else {
        // If it's a directory, list its contents
        result.contents = fs.readdirSync(fullPath).slice(0, 20);
      }
    } catch (err) {
      result.error = err.message;
    }
  }
  
  res.json(result);
});

// Add a simple health check endpoint
app.get('/health', (req, res) => {
  res.status(200).send('OK');
});

// Add a route to debug the charges-and-fields-main.js file
app.get('/debug-main-js', (req, res) => {
  const filePath = path.join(__dirname, 'charges-and-fields/js/charges-and-fields-main.js');
  
  if (fs.existsSync(filePath)) {
    const content = fs.readFileSync(filePath, 'utf8');
    res.set('Content-Type', 'text/plain');
    res.send(`
File exists at ${filePath}
Size: ${fs.statSync(filePath).size} bytes
Content:
${content}
    `);
  } else {
    res.send(`File does not exist at ${filePath}`);
  }
});

// Add a directory listing route
app.get('/list-dir', (req, res) => {
  const dirPath = req.query.path || __dirname;
  const fullPath = path.resolve(__dirname, dirPath);
  
  // Security check to prevent directory traversal
  if (!fullPath.startsWith(__dirname)) {
    return res.status(403).send('Access denied');
  }
  
  if (fs.existsSync(fullPath)) {
    try {
      const files = fs.readdirSync(fullPath);
      const fileDetails = files.map(file => {
        const filePath = path.join(fullPath, file);
        const stats = fs.statSync(filePath);
        return {
          name: file,
          isDirectory: stats.isDirectory(),
          size: stats.size,
          path: path.relative(__dirname, filePath)
        };
      });
      
      res.json({
        currentPath: path.relative(__dirname, fullPath) || '/',
        files: fileDetails
      });
    } catch (err) {
      res.status(500).send(`Error reading directory: ${err.message}`);
    }
  } else {
    res.status(404).send(`Directory not found: ${dirPath}`);
  }
});

// Add an endpoint to show environment information
app.get('/env', (req, res) => {
  res.json({
    nodeVersion: process.version,
    platform: process.platform,
    env: process.env.NODE_ENV,
    directories: fs.readdirSync(__dirname).filter(name => fs.statSync(path.join(__dirname, name)).isDirectory()),
    railwayEnvironment: process.env.RAILWAY_ENVIRONMENT || 'not set'
  });
});

// For the root path, redirect to the charges-and-fields HTML file
app.get('/', (req, res) => {
  // Directly redirect to the simulation file
  res.redirect('/charges-and-fields/charges-and-fields_en.html');
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`Lab Questions App: http://localhost:${PORT}/lab-app/`);
  console.log(`PhET Simulation (Main Entry): http://localhost:${PORT}/charges-and-fields/charges-and-fields_en.html`);
  console.log(`Directory Browser: http://localhost:${PORT}/list-dir`);
  console.log(`File Checker: http://localhost:${PORT}/check-file?path=/joist/js/Sim.js`);
}); 