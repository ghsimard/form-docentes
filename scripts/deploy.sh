#!/bin/bash

# Exit on error
set -e

echo "Starting deployment process..."

# Build the React application
echo "Building React application..."
npm run build

# Create production directory if it doesn't exist
echo "Setting up production directory..."
mkdir -p /var/www/form-docentes

# Copy build files to production directory
echo "Copying build files..."
sudo cp -r build/* /var/www/form-docentes/

# Copy server files
echo "Setting up server files..."
mkdir -p /var/www/form-docentes/server
cp -r src/server/* /var/www/form-docentes/server/

# Install production dependencies
echo "Installing production dependencies..."
cd /var/www/form-docentes
npm install --production

# Setup PM2 process
echo "Setting up PM2 process..."
pm2 delete form-docentes || true
pm2 start server/index.js --name "form-docentes"

# Restart Nginx
echo "Restarting Nginx..."
sudo systemctl restart nginx

echo "Deployment completed successfully!" 