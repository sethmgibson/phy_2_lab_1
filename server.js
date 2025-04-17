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

// Debug: List all directories and files
console.log("Current directory:", __dirname);
try {
  const lsOutput = execSync('find . -type f -name "*.html" | grep -v node_modules', { cwd: __dirname }).toString();
  console.log("HTML files in the project:", lsOutput);
} catch (err) {
  console.error("Error listing files:", err);
}

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

// For the root path, redirect to the charges-and-fields HTML file
app.get('/', (req, res) => {
  // Directly redirect to the simulation file
  res.redirect('/charges-and-fields/charges-and-fields_en.html');
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`Lab Questions App: http://localhost:${PORT}/lab-app/`);
  console.log(`PhET Simulation (Main Entry): http://localhost:${PORT}/charges-and-fields/charges-and-fields_en.html`);
}); 