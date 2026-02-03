#!/bin/bash

# Post-build script to handle SPA routing for Tauri
# Creates 404.html fallback for dynamic routes

cp out/index.html out/404.html
echo "✓ Created 404.html fallback for SPA routing"
