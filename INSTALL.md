# Installation Guide

## macOS Installation

### If you get "damaged and can't be opened" error:

This happens because the app is not signed with an Apple Developer Certificate. To fix:

**Option 1: Remove quarantine attribute (Recommended)**
```bash
# For DMG file:
xattr -cr ~/Downloads/Sermon\ Vault*.dmg

# For .app file:
xattr -cr "/Applications/Sermon Vault.app"
```

**Option 2: Via System Settings**
1. Open System Settings → Privacy & Security
2. Scroll down to "Security" section
3. Click "Open Anyway" next to the blocked app
4. Confirm by clicking "Open"

**Option 3: Allow apps from anywhere (Less secure)**
```bash
sudo spctl --master-disable
```

### Normal Installation
1. Download the `.dmg` file from [Releases](https://github.com/yoshuavic8/sermon-vault/releases)
2. Open the DMG file
3. Drag "Sermon Vault" to Applications folder
4. If blocked, use one of the methods above
5. Launch from Applications

## Windows Installation

1. Download the `.exe` installer from [Releases](https://github.com/yoshuavic8/sermon-vault/releases)
2. Run the installer
3. If Windows SmartScreen appears, click "More info" → "Run anyway"
4. Follow installation wizard
5. Launch from Start Menu or Desktop shortcut

## Code Signing (For Developers)

To distribute signed builds, you need:

### macOS Code Signing
1. Enroll in Apple Developer Program ($99/year)
2. Generate certificates in Xcode
3. Export certificates and add to GitHub Secrets:
   - `APPLE_CERTIFICATE`
   - `APPLE_CERTIFICATE_PASSWORD`
   - `APPLE_SIGNING_IDENTITY`
   - `APPLE_ID`
   - `APPLE_PASSWORD`
   - `APPLE_TEAM_ID`

### Windows Code Signing
1. Purchase code signing certificate
2. Add to GitHub Secrets:
   - `WINDOWS_CERTIFICATE`
   - `WINDOWS_CERTIFICATE_PASSWORD`

## First Launch Setup

1. Open Sermon Vault
2. Click "Choose Vault Location"
3. Select or create a folder for your sermon files
4. Start importing sermons!

## System Requirements

### macOS
- macOS 10.15 (Catalina) or later
- 64-bit processor
- 100MB disk space

### Windows
- Windows 10 or later
- 64-bit processor
- 100MB disk space
- WebView2 (automatically installed)

## Troubleshooting

### macOS: "App is damaged"
See macOS Installation section above.

### Windows: SmartScreen warning
Click "More info" → "Run anyway"

### Can't find vault folder
Make sure you have read/write permissions to the selected folder.

### Sermons not appearing
1. Go to Settings
2. Re-select vault folder
3. Wait for indexing to complete

## Support

For issues, please open a ticket on [GitHub Issues](https://github.com/yoshuavic8/sermon-vault/issues)
