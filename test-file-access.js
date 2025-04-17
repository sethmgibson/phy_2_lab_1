const express = require('express');
const path = require('path');
const fs = require('fs');
const app = express();
const PORT = 8081;

// Serve static files from the root directory
app.use(express.static(__dirname));

// Add a route to check for a specific file
app.get('/check-file', (req, res) => {
  const filePath = path.join(__dirname, 'charges-and-fields/js/charges-and-fields-main.js');
  
  if (fs.existsSync(filePath)) {
    res.send(`File exists at ${filePath}. Size: ${fs.statSync(filePath).size} bytes`);
  } else {
    res.send(`File does not exist at ${filePath}`);
  }
});

// Show all files in charges-and-fields/js
app.get('/list-files', (req, res) => {
  const dirPath = path.join(__dirname, 'charges-and-fields/js');
  
  if (fs.existsSync(dirPath)) {
    const files = fs.readdirSync(dirPath);
    res.send(`Files in ${dirPath}:<br>${files.join('<br>')}`);
  } else {
    res.send(`Directory does not exist at ${dirPath}`);
  }
});

app.listen(PORT, () => {
  console.log(`Test server running at http://localhost:${PORT}`);
  console.log(`Check file at: http://localhost:${PORT}/check-file`);
  console.log(`List files at: http://localhost:${PORT}/list-files`);
  console.log(`Direct file URL: http://localhost:${PORT}/charges-and-fields/js/charges-and-fields-main.js`);
}); 