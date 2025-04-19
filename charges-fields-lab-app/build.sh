#!/bin/bash

# Clean dist folder, npm cache, and Parcel cache
rm -rf dist
rm -rf .cache
npm cache clean --force

# Build with parcel (development mode for more verbose errors)
echo "Starting Parcel build..."
npx parcel build index.html --public-url /

# Check if Parcel build succeeded
if [ $? -ne 0 ]; then
  echo "Parcel build failed!"
  exit 1
fi
echo "Parcel build finished."

# No longer running fix-paths.js

# Ensure all file permissions are set correctly
# Only run if dist exists (Parcel succeeded)
if [ -d "dist" ]; then
  chmod -R 755 dist

  # Create serve.json for SPA routing
  echo '{ "rewrites": [ { "source": "**", "destination": "/index.html" } ] }' > dist/serve.json
else
  echo "dist directory not found after Parcel build."
  exit 1
fi

echo "Build script completed successfully" 