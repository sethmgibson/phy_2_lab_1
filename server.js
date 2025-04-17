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

// Find the simulation HTML file
let simulationFile = null;
const htmlFiles = findFiles(__dirname, '_en.html');
console.log("Found HTML files:", htmlFiles);

if (htmlFiles.length > 0) {
  // Find the charges-and-fields HTML file
  simulationFile = htmlFiles.find(file => file.includes('charges-and-fields'));
  console.log("Selected simulation file:", simulationFile);
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

// Serve the lab app at /lab-app
app.use('/lab-app', express.static(labAppPath));

// Serve all PhET simulation files from their original locations
// This replicates how the local development server works
app.use(express.static(simulationPath));

// Add a simple health check endpoint
app.get('/health', (req, res) => {
  res.status(200).send('OK');
});

// For the root path, redirect to the copied PhET simulation file in the root directory
app.get('/', (req, res) => {
  // Check for the file in the root directory first (where we copied it)
  const rootFile = path.join(__dirname, 'charges-and-fields_en.html');
  
  if (fs.existsSync(rootFile)) {
    console.log('Found simulation file in root directory, redirecting to it');
    res.redirect('/charges-and-fields_en.html');
  } else {
    // Fall back to the original path
    const simulationFile = path.join(__dirname, 'charges-and-fields', 'charges-and-fields_en.html');
    
    if (fs.existsSync(simulationFile)) {
      console.log('Found simulation file in charges-and-fields directory, redirecting to it');
      res.redirect('/charges-and-fields/charges-and-fields_en.html');
    } else {
      // If the simulation file doesn't exist, serve a placeholder page
      res.send(`
        <html>
          <head><title>PhET Lab Application</title></head>
          <body>
            <h1>PhET Physics Lab</h1>
            <p>The application is running, but the simulation file was not found.</p>
            <p>Try accessing the <a href="/lab-app/">Lab App</a> directly.</p>
            <p>Server status: Running on port ${PORT}</p>
            <p>Looked for files at:</p>
            <pre>- ${rootFile} (exists: ${fs.existsSync(rootFile)})
- ${simulationFile} (exists: ${fs.existsSync(simulationFile)})</pre>
            <p>Directory contents:</p>
            <pre>${fs.readdirSync(__dirname).join('\n')}</pre>
          </body>
        </html>
      `);
    }
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`Lab Questions App: http://localhost:${PORT}/lab-app/`);
  
  // Check for simulation file
  const rootFile = path.join(__dirname, 'charges-and-fields_en.html');
  const dirFile = path.join(__dirname, 'charges-and-fields', 'charges-and-fields_en.html');
  
  if (fs.existsSync(rootFile)) {
    console.log(`PhET Simulation (root): http://localhost:${PORT}/charges-and-fields_en.html`);
  } else if (fs.existsSync(dirFile)) {
    console.log(`PhET Simulation (dir): http://localhost:${PORT}/charges-and-fields/charges-and-fields_en.html`);
  } else {
    console.log('Simulation file not found in either location');
  }
}); 