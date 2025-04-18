const fs = require('fs');
const path = require('path');

// Process HTML files in the dist directory
const fixHtmlFile = (filename) => {
  const filePath = path.join(__dirname, 'dist', filename);
  
  try {
    // Read the file
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Replace all src="/... and href="/... with src="./... and href="./...
    content = content.replace(/src="\/([^"]+)"/g, 'src="./$1"');
    content = content.replace(/href="\/([^"]+)"/g, 'href="./$1"');
    
    // Write the fixed content back to the file
    fs.writeFileSync(filePath, content);
    
    console.log(`Successfully fixed paths in ${filename}`);
  } catch (err) {
    console.error(`Error fixing paths in ${filename}:`, err);
  }
};

// Process all HTML files
fixHtmlFile('index.html');
fixHtmlFile('static.html');

console.log('Path fixing completed'); 