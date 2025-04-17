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

// For the root path, redirect to the PhET simulation
app.get('/', (req, res) => {
  res.redirect('/charges-and-fields/charges-and-fields_en.html');
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`PhET Simulation: http://localhost:${PORT}/charges-and-fields/charges-and-fields_en.html`);
  console.log(`Lab Questions App: http://localhost:${PORT}/lab-app/`);
}); 