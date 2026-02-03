# 🎨 Logo & Icon Setup Instructions

## Files yang Sudah Disiapkan

✅ Logo component sudah dibuat di `src/components/Logo.tsx`
✅ Home page sudah diupdate untuk menggunakan Logo
✅ All pages sudah menggunakan vibrant styling

## 📥 Langkah-langkah Setup

### 1. Save Logo untuk Web/UI (Image pertama - dengan text)

**File:** Image pertama dengan text "SermonVault"

**Lokasi:** `public/logo.png`

**Cara:**

1. Download/save image pertama
2. Rename menjadi `logo.png`
3. Copy ke folder `public/` di root project
4. Ukuran optimal: minimal 600x200px (akan di-resize otomatis oleh Next.js)

---

### 2. Save Icon untuk Desktop App (Image kedua - rounded square)

**File:** Image kedua dengan rounded square background

**Lokasi:** `public/icon.png`

**Cara:**

1. Download/save image kedua
2. Rename menjadi `icon.png`
3. Copy ke folder `public/` di root project
4. Ukuran: 512x512px atau 1024x1024px (square)

---

### 3. Generate Icon untuk Tauri (Desktop App Icon)

Setelah save icon.png ke public, jalankan command ini:

```bash
# Install tauri icon generator (jika belum)
npm install -g @tauri-apps/cli

# Generate semua ukuran icon untuk macOS, Windows, Linux
cd /Users/yoshuavictor/nextjs/sermon-vault
npx @tauri-apps/cli icon public/icon.png
```

Command ini akan otomatis generate:

- `src-tauri/icons/icon.icns` (macOS)
- `src-tauri/icons/icon.ico` (Windows)
- `src-tauri/icons/32x32.png`
- `src-tauri/icons/128x128.png`
- `src-tauri/icons/128x128@2x.png`
- Dan semua ukuran lainnya

---

## ✅ Setelah Setup

Struktur folder akan seperti ini:

```
public/
├── logo.png          ← Logo dengan text (untuk UI)
├── icon.png          ← Icon square (untuk app icon)
└── ...

src-tauri/icons/
├── icon.png          ← Generated automatically
├── icon.icns         ← Generated automatically (macOS)
├── icon.ico          ← Generated automatically (Windows)
├── 32x32.png         ← Generated automatically
├── 128x128.png       ← Generated automatically
└── ...
```

---

## 🎯 Penggunaan Logo di Code

Logo component sudah siap digunakan:

```tsx
import { Logo } from "@/components/Logo";

// Full logo dengan text
<Logo variant="full" size="lg" />

// Icon only (tanpa text)
<Logo variant="icon" size="md" />

// Sizes: "sm" | "md" | "lg" | "xl"
```

---

## 🔄 Rebuild Aplikasi

Setelah semua file di-save, rebuild:

```bash
# Development
npm run dev

# Tauri app
npm run tauri:dev
```

Icon baru akan muncul di:

- ✅ Home page (loading & header)
- ✅ Desktop app icon (macOS Dock, Windows Taskbar)
- ✅ Window title bar icon

---

## 📝 Notes

- Logo PNG mendukung transparency
- Icon sebaiknya square (1:1 ratio) untuk hasil terbaik
- Tauri icon generator akan otomatis resize ke semua ukuran yang dibutuhkan
- Browser favicon bisa ditambahkan nanti dengan file `public/favicon.ico`
