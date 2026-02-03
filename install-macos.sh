#!/bin/bash
# Sermon Vault Installer for macOS
# This script removes quarantine attributes to allow the app to run

set -e

echo "=================================="
echo "Sermon Vault macOS Installer"
echo "=================================="
echo ""

# Check if DMG file exists
DMG_FILE=""
if [ -f "$HOME/Downloads/Sermon Vault_1.0.0_universal.dmg" ]; then
    DMG_FILE="$HOME/Downloads/Sermon Vault_1.0.0_universal.dmg"
elif [ -f "$HOME/Downloads/"Sermon*.dmg ]; then
    DMG_FILE=$(ls -t "$HOME/Downloads/"Sermon*.dmg | head -n 1)
fi

if [ -n "$DMG_FILE" ]; then
    echo "Found DMG: $DMG_FILE"
    echo "Removing quarantine attribute from DMG..."
    xattr -cr "$DMG_FILE"
    echo "✓ DMG is now safe to open"
    echo ""
    echo "Opening DMG..."
    open "$DMG_FILE"
    echo ""
    echo "Please drag 'Sermon Vault' to Applications folder"
    echo "Then run this script again to fix the .app file"
    exit 0
fi

# Check if app is installed
APP_PATH="/Applications/Sermon Vault.app"
if [ -d "$APP_PATH" ]; then
    echo "Found app: $APP_PATH"
    echo "Removing quarantine attribute from app..."
    xattr -cr "$APP_PATH"
    echo "✓ App is now safe to run"
    echo ""
    echo "Opening Sermon Vault..."
    open "$APP_PATH"
    echo ""
    echo "✓ Installation complete!"
    exit 0
fi

# Nothing found
echo "❌ Could not find Sermon Vault DMG or App"
echo ""
echo "Please:"
echo "1. Download the DMG file from GitHub Releases"
echo "2. Move it to ~/Downloads/"
echo "3. Run this script again"
echo ""
echo "Or manually run:"
echo "  xattr -cr ~/Downloads/Sermon*.dmg"
echo "  xattr -cr /Applications/Sermon\\ Vault.app"
