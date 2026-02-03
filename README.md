# Sermon Vault

<div align="center">
  <h3>📖 Local Sermon Filing System</h3>
  <p>A desktop application for managing and archiving sermons with markdown-based storage</p>
</div>

---

## 🎯 Overview

**Sermon Vault** is a local-first desktop application designed for pastors and preachers to organize, manage, and archive their sermon collection. Built with longevity in mind, it uses **markdown files** as the database, ensuring your sermons remain accessible and portable for decades to come.

### ✨ Key Features

- **📝 Markdown Storage**: All sermons stored as `.md` files with YAML frontmatter
- **🔍 Powerful Search**: Search by title, themes, Bible verses, audience, tags, and dates
- **📊 Rich Metadata**: Track themes, verses, dates preached, audience, attachments, and notes
- **💾 Portable Data**: Copy one folder, move everything—no database dependencies
- **🎨 Modern UI**: Clean, futuristic interface built with shadcn/ui
- **🖥️ Native Desktop**: macOS app with Tauri (Windows support ready for future)
- **⚡ Fast Indexing**: Local caching for instant search results

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────┐
│        TAURI SHELL (Rust)               │
│  ┌──────────────────────────────────┐   │
│  │   NEXT.JS (Static Export)        │   │
│  │  • App Router                    │   │
│  │  • React Components              │   │
│  │  • TypeScript Service Layer      │   │
│  └──────────────────────────────────┘   │
│              ↓                           │
│  ┌──────────────────────────────────┐   │
│  │   File System API Bridge         │   │
│  │  • Read/Write Markdown           │   │
│  │  • Directory Scanning            │   │
│  │  • File System Access            │   │
│  └──────────────────────────────────┘   │
└─────────────────────────────────────────┘
                 ↓
┌─────────────────────────────────────────┐
│       LOCAL FILE SYSTEM                 │
│  SermonVault/                           │
│  ├── sermons/YYYY/*.md                  │
│  ├── attachments/{keynote,pages}/       │
│  ├── sermon-index.json (cache)          │
│  └── config.json                        │
└─────────────────────────────────────────┘
```

---

## 📦 Tech Stack

### Frontend

- **Next.js 16** (App Router, Static Export)
- **React 19**
- **TypeScript**
- **Tailwind CSS 4**
- **shadcn/ui** (Radix UI components)

### Desktop

- **Tauri 2.0** (Rust + WebView)
- **Tauri Plugins**: FS, Shell, Dialog

### Data Layer

- **gray-matter** (Markdown + YAML frontmatter parsing)
- **date-fns** (Date utilities)

---

## 🗂️ Data Structure

### Markdown File Format

```markdown
---
id: 2024-08-11-keluarga-dalam-visi-tuhan
title: Keluarga dalam Visi Tuhan
date_created: 2024-08-01
date_preached:
  - 2024-08-11
audience:
  - Ibadah Umum 1
  - Ibadah Keluarga
themes:
  - Keluarga
  - Kepemimpinan
verses:
  - Yosua 24:15
  - Mazmur 127
tags:
  - pastoral
  - vision
attachments:
  keynote: keluarga-visi.key
  pages: keluarga-visi.pages
notes:
  preached_at: GBI Example Church
  remarks: Jemaat sangat responsif
---

# Content

Your sermon content here (read-only in app)...
```

### Folder Structure

```
SermonVault/
├── sermons/
│   ├── 2024/
│   │   ├── 2024-01-07-new-year-vision.md
│   │   └── 2024-08-11-family-in-gods-vision.md
│   ├── 2025/
│   └── 2026/
├── attachments/
│   ├── keynote/
│   │   └── family-vision.key
│   └── pages/
│       └── family-vision.pages
├── sermon-index.json (auto-generated cache)
└── config.json
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** 18+
- **Rust** (for Tauri)
- **macOS** (primary target)

### Installation

1. **Clone the repository**

   ```bash
   git clone <repo-url>
   cd sermon-vault
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Run in development mode**

   ```bash
   npm run tauri:dev
   ```

4. **Build for production (DMG)**

   ```bash
   npm run tauri:build
   ```

   Output: `src-tauri/target/release/bundle/dmg/Sermon Vault_1.0.0_x64.dmg`

---

## 🎨 UI Components

Built with **shadcn/ui** with a custom futuristic color scheme:

- **Primary**: Deep purple/blue (oklch based)
- **Layout**: Gradient backgrounds, glass morphism effects
- **Components**: Buttons, Cards, Inputs, Dialogs, Badges
- **Dark Mode**: Ready (not actively implemented yet)

---

## 📚 Project Structure

```
sermon-vault/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── page.tsx            # Dashboard
│   │   ├── sermons/
│   │   │   ├── page.tsx        # Sermon list + search
│   │   │   ├── new/page.tsx    # Create sermon
│   │   │   └── [id]/page.tsx   # Sermon detail + edit
│   │   ├── settings/page.tsx   # Settings
│   │   └── layout.tsx          # Root layout
│   ├── components/
│   │   ├── ui/                 # shadcn/ui components
│   │   ├── SermonCard.tsx
│   │   ├── SearchBar.tsx
│   │   └── MetadataEditor.tsx
│   ├── lib/
│   │   ├── types.ts            # TypeScript types
│   │   ├── tauri-fs.ts         # FS wrapper
│   │   ├── markdown.ts         # Markdown parser
│   │   ├── indexer.ts          # Search & indexing
│   │   ├── settings.ts         # Settings manager
│   │   └── utils.ts            # Utilities
│   └── types/
│       └── gray-matter.d.ts    # Type declarations
├── src-tauri/
│   ├── src/
│   │   ├── main.rs
│   │   └── lib.rs              # Tauri setup + plugins
│   ├── Cargo.toml
│   ├── tauri.conf.json         # Tauri config
│   └── icons/
└── package.json
```

---

## 🔧 Configuration

### Tauri Permissions

Configured in `tauri.conf.json`:

- **File System**: Full access (`$HOME/**`)
- **Shell**: Open files with default apps
- **Dialog**: Folder picker, save dialogs

### Next.js Export

- **Output**: Static export (`output: 'export'`)
- **Images**: Unoptimized for Tauri compatibility

---

## 🎯 Roadmap

### ✅ Phase 1 (Current)

- [x] Core architecture
- [x] Markdown CRUD operations
- [x] Search & indexing
- [x] Sermon list & detail views
- [x] Metadata editor
- [x] Settings page
- [x] macOS DMG build

### 🚧 Phase 2 (Future)

- [ ] Batch import (25 files at once)
- [ ] Export to PDF
- [ ] Statistics dashboard
- [ ] Dark mode toggle
- [ ] Keyboard shortcuts
- [ ] Windows support

### 💡 Phase 3 (Ideas)

- [ ] Optional Git versioning
- [ ] Backup/restore functionality
- [ ] Custom themes
- [ ] Bible verse lookup integration
- [ ] Sermon series grouping

---

## 🛡️ Design Principles

1. **Markdown > Database**: Human-readable, future-proof
2. **File > Server**: No cloud dependencies
3. **Longevity > Trend**: Built to last 10-20 years
4. **Simplicity > Complexity**: Minimal dependencies
5. **Privacy**: All data stays local

---

## 📖 Usage

### 1. First Launch

- Select your **Sermon Vault** folder
- App creates recommended folder structure

### 2. Create a Sermon

- Click **"New Sermon"**
- Enter title and date
- Edit metadata (themes, verses, audience, etc.)

### 3. Search Sermons

- Use search bar for full-text search
- Filter by themes, audiences, verses, tags
- Results update in real-time

### 4. Edit Metadata

- Click any sermon card
- Update all metadata fields
- Click **"Save Changes"**

### 5. Open Attachments

- View attachments in sermon detail
- Click to open with default app (Keynote, Pages, etc.)

---

## 🤝 Contributing

This is a personal pastoral tool, but suggestions and improvements are welcome! Please open an issue or PR.

---

## 📄 License

TBD (Currently private/personal use)

---

## 🙏 Acknowledgments

Built for the glory of God and the benefit of pastoral ministry.

**"Preach the word; be ready in season and out of season..."**  
_— 2 Timothy 4:2_

---

## 💬 Support

For questions or issues, please open a GitHub issue.

---

**Made with ❤️ for pastors and preachers who value their sermon archives.**
