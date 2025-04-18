const fs = require('fs');
const path = require('path');

// Read dist/index.html
const indexPath = path.join(__dirname, 'dist', 'index.html');

try {
  // Read the file
  let content = fs.readFileSync(indexPath, 'utf8');
  
  // Replace all src="/... and href="/... with src="./... and href="./...
  content = content.replace(/src="\/([^"]+)"/g, 'src="./$1"');
  content = content.replace(/href="\/([^"]+)"/g, 'href="./$1"');
  
  // Write the fixed content back to the file
  fs.writeFileSync(indexPath, content);
  
  console.log('Successfully fixed paths in index.html');
} catch (err) {
  console.error('Error fixing paths:', err);
} 