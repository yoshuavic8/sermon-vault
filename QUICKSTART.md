# Quick Start Guide

## 🚀 Getting Started in 3 Minutes

### Step 1: Install Dependencies

```bash
npm install
```

### Step 2: Run the App

**Development Mode (Browser Preview):**

```bash
npm run dev
# Visit http://localhost:3000
```

**Desktop App (Full Tauri):**

```bash
npm run tauri:dev
```

> ⏱️ **First launch takes 5-10 minutes** (Rust compilation). Subsequent launches are instant.

---

## 📁 First Time Setup

1. **Launch the app**
2. **Click "Select Sermon Vault Folder"**
3. **Choose or create a folder** (e.g., `~/Documents/SermonVault`)
4. **Go to Settings** and click "Create/Verify Structure"

Your folder now has:

```
SermonVault/
├── sermons/2024/
├── sermons/2025/
├── sermons/2026/
├── attachments/keynote/
├── attachments/pages/
└── config.json
```

---

## ✍️ Create Your First Sermon

1. Click **"New Sermon"**
2. Enter title: `"Walking by Faith"`
3. Click **"Create Sermon"**
4. Add metadata:
   - Themes: Faith, Trust
   - Verses: Hebrews 11:1, 2 Corinthians 5:7
   - Audience: Sunday Service
5. Click **"Save Changes"**

Your sermon is now at:

```
SermonVault/sermons/2026/2026-02-03-walking-by-faith.md
```

---

## 🔍 Search Sermons

Type in the search bar:

- `faith` → finds all sermons with "faith" in title, body, or metadata
- `Hebrews` → finds all sermons referencing Hebrews
- `youth` → finds all sermons for youth audience

---

## 📝 Edit Sermon Content

The app **only edits metadata** (frontmatter). To edit sermon content:

1. Click **"Open in Editor"** button
2. Edit the markdown file with your favorite editor
3. Changes reflect immediately in the app

---

## 📎 Attach Files (Keynote, Pages, etc.)

1. Open a sermon
2. Scroll to **"Attachments"** section
3. Manually add to frontmatter:
   ```yaml
   attachments:
     keynote: sermon-slides.key
     pages: sermon-notes.pages
   ```
4. Place files in `SermonVault/attachments/keynote/` or `.../pages/`
5. Click attachment name to open with default app

---

## 🏗️ Build Desktop App (macOS DMG)

```bash
npm run tauri:build
```

**Output:**

```
src-tauri/target/release/bundle/dmg/Sermon Vault_1.0.0_x64.dmg
```

Double-click to install!

---

## 🎯 Tips

- **Backup**: Just copy the `SermonVault/` folder
- **Sync**: Use Dropbox, iCloud Drive, or any cloud service with the vault folder
- **Migration**: Copy vault folder to new computer, point app to it
- **Version Control**: Initialize git in vault folder for versioning

---

## ⚡ Keyboard Shortcuts (Coming Soon)

- `⌘ + N` → New Sermon
- `⌘ + F` → Focus Search
- `⌘ + ,` → Settings

---

## 🆘 Troubleshooting

### App won't load sermons

- Check if vault path is set (Settings page)
- Verify folder contains `sermons/` directory
- Click "Rescan" button

### Search returns nothing

- Click "Rescan" to rebuild index
- Check if `.md` files exist in `sermons/YYYY/` folders

### Can't open attachments

- Verify file exists in `attachments/` folder
- Check filename matches exactly in frontmatter

---

## 📖 Learn More

- [Full Documentation](README.md)
- [Build Instructions](BUILD.md)
- [Data Structure Guide](README.md#-data-structure)

---

**Ready to manage your sermon library! 🎉**
