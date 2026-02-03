# Sermon Vault Setup

## Prerequisites

This desktop app requires both Node.js and Rust to be installed.

### 1. Install Rust

```bash
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
```

After installation, restart your terminal or run:

```bash
source "$HOME/.cargo/env"
```

Verify Rust is installed:

```bash
rustc --version
cargo --version
```

### 2. Install Node.js Dependencies

```bash
npm install
```

### 3. Run Development Mode

Once Rust is installed, run:

```bash
npm run tauri:dev
```

This will:

1. Start the Next.js dev server at `localhost:3000`
2. Open a Tauri desktop window

**Important**: Use the Tauri window (not the browser) to test file system features like folder selection.

### 4. Build for Production

To create a macOS DMG installer:

```bash
npm run tauri:build
```

The DMG will be created in: `src-tauri/target/release/bundle/dmg/`

## Troubleshooting

### Error: "Cannot read properties of undefined (reading 'invoke')"

This means you're accessing the app in a browser instead of the Tauri desktop window. The file system APIs only work in the Tauri context.

**Solution**: Run `npm run tauri:dev` and use the desktop window that opens.

### Error: "failed to get cargo metadata"

Rust is not installed.

**Solution**: Follow step 1 above to install Rust.

### Port 3000 Already in Use

If you have Next.js already running:

```bash
# Kill existing Next.js process
lsof -ti:3000 | xargs kill -9

# Then run tauri:dev
npm run tauri:dev
```

## Next Steps

1. Select your sermon vault folder (the parent folder containing your sermons)
2. Place markdown sermon files in the vault with proper YAML frontmatter
3. Use the app to browse, search, and manage your sermon library

See [QUICKSTART.md](./QUICKSTART.md) for usage instructions.
