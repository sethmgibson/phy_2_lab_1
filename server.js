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
const simulationPath = path.join(__dirname, 'charges-and-fields');
const simulationBuildPath = path.join(__dirname, 'charges-and-fields', 'build');

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

// Serve charges-and-fields build directory and the main directory
app.use('/charges-and-fields', express.static(simulationPath));
app.use('/charges-and-fields/build', express.static(simulationBuildPath));

// Serve all static files from the root directory too
app.use(express.static(simulationPath));
app.use(express.static(__dirname));

// Add a simple health check endpoint
app.get('/health', (req, res) => {
  res.status(200).send('OK');
});

// For the root path, try multiple locations for the simulation file
app.get('/', (req, res) => {
  // If we found the simulation file during server startup, redirect to it
  if (simulationFile) {
    const relativePath = path.relative(__dirname, simulationFile);
    const urlPath = '/' + relativePath.replace(/\\/g, '/');
    console.log(`Redirecting to ${urlPath}`);
    return res.redirect(urlPath);
  }
  
  // Try different possible locations for the simulation file
  const possibleLocations = [
    path.join(__dirname, 'charges-and-fields', 'charges-and-fields_en.html'),
    path.join(__dirname, 'charges-and-fields', 'build', 'charges-and-fields_en.html'),
    path.join(__dirname, 'charges-and-fields_en.html')
  ];
  
  // Find the first location that exists
  const existingFile = possibleLocations.find(file => fs.existsSync(file));
  
  if (existingFile) {
    // Calculate the relative path from the root directory
    const relativePath = path.relative(__dirname, existingFile);
    const urlPath = '/' + relativePath.replace(/\\/g, '/');
    console.log(`Redirecting to ${urlPath}`);
    res.redirect(urlPath);
  } else {
    // If the simulation file doesn't exist, serve a placeholder page with extensive debugging information
    const searchedLocations = possibleLocations.map(p => `- ${p}`).join('\n');
    
    // Find all HTML files recursively
    const allHtmlFiles = findFiles(__dirname, '.html')
      .filter(file => !file.includes('node_modules'))
      .map(file => `- ${file}`)
      .join('\n');
    
    res.send(`
      <html>
        <head><title>PhET Physics Lab</title></head>
        <body>
          <h1>PhET Physics Lab</h1>
          <p>The application is running, but the simulation file was not found.</p>
          <p>Try accessing the <a href="/lab-app/">Lab App</a> directly.</p>
          <p>Server status: Running on port ${PORT}</p>
          <p><strong>Debug Info:</strong></p>
          <p>Searched the following locations:</p>
          <pre>${searchedLocations}</pre>
          <p>Available files in charges-and-fields directory:</p>
          <pre>${fs.existsSync(simulationPath) ? fs.readdirSync(simulationPath).join('\n') : 'Directory not found'}</pre>
          <p>All HTML files found:</p>
          <pre>${allHtmlFiles}</pre>
        </body>
      </html>
    `);
  }
});

// Make sure we serve the simulation file directly too
app.get('/charges-and-fields_en.html', (req, res) => {
  if (simulationFile) {
    res.sendFile(simulationFile);
  } else {
    const filePath = path.join(__dirname, 'charges-and-fields', 'charges-and-fields_en.html');
    if (fs.existsSync(filePath)) {
      res.sendFile(filePath);
    } else {
      res.status(404).send('Simulation file not found');
    }
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`PhET Simulation: http://localhost:${PORT}/charges-and-fields/charges-and-fields_en.html`);
  console.log(`Lab Questions App: http://localhost:${PORT}/lab-app/`);
  
  // Log the file existence for debugging
  const simFile = path.join(__dirname, 'charges-and-fields', 'charges-and-fields_en.html');
  const buildFile = path.join(__dirname, 'charges-and-fields', 'build', 'charges-and-fields_en.html');
  console.log(`Simulation file exists (main directory): ${fs.existsSync(simFile)}`);
  console.log(`Simulation file exists (build directory): ${fs.existsSync(buildFile)}`);
  console.log(`Looking for files at:\n- ${simFile}\n- ${buildFile}`);
  
  // List files in the charges-and-fields directory
  if (fs.existsSync(simulationPath)) {
    console.log('Files in charges-and-fields directory:');
    fs.readdirSync(simulationPath).forEach(file => {
      console.log(`- ${file}`);
    });
  }
}); 