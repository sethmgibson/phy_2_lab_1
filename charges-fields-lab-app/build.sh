#!/bin/bash

# Clean dist folder, npm cache, and Parcel cache
rm -rf dist
rm -rf .cache
npm cache clean --force

# Build with parcel, relying on --public-url for paths
NODE_ENV=production npx parcel build index.html --no-minify --public-url ./

# Create a copy of the index.html that directly references the bundled files
# This might not be strictly necessary if serving index.html directly
cp dist/index.html dist/static.html

# No longer running fix-paths.js

# Ensure all file permissions are set correctly
chmod -R 755 dist

echo "Build completed successfully" 