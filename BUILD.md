# Build Instructions

## Prerequisites

1. **Node.js 18+**

   ```bash
   node --version  # Should be v18 or higher
   ```

2. **Rust** (for Tauri)

   ```bash
   curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
   rustc --version  # Verify installation
   ```

3. **macOS Development Tools**
   ```bash
   xcode-select --install  # Command Line Tools (NOT full Xcode)
   ```

---

## Development

### 1. Install Dependencies

```bash
npm install
```

### 2. Run Development Server

**Option A: Next.js only (browser)**

```bash
npm run dev
# Visit http://localhost:3000
```

**Option B: Full Tauri app (desktop)**

```bash
npm run tauri:dev
# Opens native desktop window
```

> **Note**: First Tauri launch will compile Rust dependencies (~5-10 minutes)

---

## Production Build

### Build macOS DMG

```bash
npm run tauri:build
```

**Output Location:**

```
src-tauri/target/release/bundle/dmg/Sermon Vault_1.0.0_x64.dmg
```

**What gets built:**

- Static Next.js export → `out/`
- Rust binary with embedded frontend
- Signed macOS app bundle (if code signing configured)
- DMG installer

---

## Build Configuration

### Next.js (`next.config.ts`)

```typescript
const nextConfig: NextConfig = {
  output: "export", // Static export for Tauri
  images: {
    unoptimized: true, // Required for static export
  },
  reactCompiler: true,
};
```

### Tauri (`src-tauri/tauri.conf.json`)

```json
{
  "productName": "Sermon Vault",
  "version": "1.0.0",
  "identifier": "com.sermonvault.app",
  "bundle": {
    "targets": "dmg", // macOS only
    "macOS": {
      "minimumSystemVersion": "10.15"
    }
  }
}
```

---

## Troubleshooting

### Issue: Tauri build fails with "xcrun: error"

**Solution:**

```bash
sudo xcode-select --switch /Library/Developer/CommandLineTools
```

### Issue: "Failed to bundle project"

**Solution:**

```bash
# Clean and rebuild
rm -rf src-tauri/target
npm run tauri build
```

### Issue: App won't open ("damaged" or "unverified")

**Solution (Development):**

```bash
# Remove quarantine flag
xattr -cr "src-tauri/target/release/bundle/macos/Sermon Vault.app"
```

**Solution (Distribution):**

- Code sign with Apple Developer ID
- Notarize the app with Apple

---

## Code Signing (Optional)

For distribution outside development:

1. **Get Apple Developer ID**
   - Enroll in Apple Developer Program ($99/year)

2. **Configure Signing**

   Add to `tauri.conf.json`:

   ```json
   "bundle": {
     "macOS": {
       "signingIdentity": "Developer ID Application: Your Name (TEAM_ID)"
     }
   }
   ```

3. **Build with Signing**

   ```bash
   npm run tauri build
   ```

4. **Notarize (Required for macOS 10.15+)**
   ```bash
   xcrun notarytool submit \
     "Sermon Vault.dmg" \
     --apple-id "your@email.com" \
     --password "app-specific-password" \
     --team-id "TEAM_ID" \
     --wait
   ```

---

## CI/CD (GitHub Actions)

Coming soon: Automated builds for releases

---

## Platform Support

| Platform | Status   | Notes                            |
| -------- | -------- | -------------------------------- |
| macOS    | ✅ Full  | Primary target, tested on 10.15+ |
| Windows  | 🚧 Ready | Config ready, untested           |
| Linux    | 🚧 Ready | Config ready, untested           |

To build for Windows/Linux, change `tauri.conf.json`:

```json
"bundle": {
  "targets": ["dmg", "msi", "appimage"]  // Add Windows/Linux
}
```

---

## File Sizes (Approximate)

- **Development build**: ~15 MB (unoptimized)
- **Production DMG**: ~8-10 MB (optimized + compressed)
- **Installed app**: ~12 MB

---

## Next Steps After Build

1. Test the DMG on a clean macOS system
2. Create GitHub Release with DMG attached
3. Write installation instructions
4. (Optional) Set up auto-updates with Tauri Updater plugin

---

**Ready to build? Run:**

```bash
npm run tauri:build
```
