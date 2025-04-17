const express = require('express');
const path = require('path');
const fs = require('fs');
const app = express();
const PORT = process.env.PORT || 8080;

// Define paths for the lab app and simulation
const labAppPath = path.join(__dirname, 'charges-fields-lab-app', 'dist');
const simulationPath = path.join(__dirname); // Root directory containing all PhET files

// Serve the lab app at /lab-app
app.use('/lab-app', express.static(labAppPath));

// Serve all PhET simulation files from their original locations
// This replicates how the local development server works
app.use(express.static(simulationPath));

// Add a simple health check endpoint
app.get('/health', (req, res) => {
  res.status(200).send('OK');
});

// For the root path, check if the simulation file exists before redirecting
app.get('/', (req, res) => {
  const simulationFile = path.join(__dirname, 'charges-and-fields', 'charges-and-fields_en.html');
  
  // Check if the file exists before redirecting
  if (fs.existsSync(simulationFile)) {
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
        </body>
      </html>
    `);
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`PhET Simulation: http://localhost:${PORT}/charges-and-fields/charges-and-fields_en.html`);
  console.log(`Lab Questions App: http://localhost:${PORT}/lab-app/`);
  
  // Log the file existence for debugging
  const simulationFile = path.join(__dirname, 'charges-and-fields', 'charges-and-fields_en.html');
  console.log(`Simulation file exists: ${fs.existsSync(simulationFile)}`);
  console.log(`Looking for file at: ${simulationFile}`);
}); 