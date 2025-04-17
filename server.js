const express = require('express');
const path = require('path');
const fs = require('fs');
const app = express();
const PORT = process.env.PORT || 8080;

// Check if the ChargesAndFields build exists
const phetSimPath = path.join(__dirname, 'charges-and-fields', 'build');
const labAppPath = path.join(__dirname, 'charges-fields-lab-app', 'dist');

// Serve the lab app at /lab-app
app.use('/lab-app', express.static(labAppPath));

// Serve the PhET simulation files at the root
app.use(express.static(phetSimPath));

// For any routes that don't match the PhET sim, serve the simulation HTML
app.get('/', (req, res) => {
  // Attempt to serve the main simulation HTML file
  const htmlFilePath = path.join(phetSimPath, 'charges-and-fields_en.html');
  
  if (fs.existsSync(htmlFilePath)) {
    res.sendFile(htmlFilePath);
  } else {
    res.status(404).send(`
      <html>
        <head><title>PhET Simulation Setup Required</title></head>
        <body>
          <h1>PhET Simulation Build Required</h1>
          <p>The PhET simulation build files are not found. Please build the simulation first.</p>
          <p>You can access the lab questions directly at <a href="/lab-app/">/lab-app/</a></p>
        </body>
      </html>
    `);
  }
});

// Redirect other routes to the lab app if the PhET sim isn't available
app.get('*', (req, res) => {
  if (!fs.existsSync(phetSimPath)) {
    res.redirect('/lab-app/');
  } else {
    res.status(404).send('Page not found');
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`PhET Simulation: http://localhost:${PORT}/`);
  console.log(`Lab Questions App: http://localhost:${PORT}/lab-app/`);
}); 