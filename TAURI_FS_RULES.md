# 🔐 TAURI FILE SYSTEM RULES - SermonVault

> **WAJIB DIBACA** sebelum melakukan operasi file system di SermonVault

## 🧠 FILOSOFI DASAR

```
Tauri bukan Node.js.
File system itu privilege, bukan hak.
Setiap akses HARUS diizinkan secara eksplisit.
Binary files ≠ Text files.
```

---

## 🛡️ FILE TYPES SAFETY CHECKLIST (KRITIS!)

### TEXT FILES (use `readTextFile` / `writeTextFile`)

✅ **AMAN untuk:**

- `.md` (metadata files)
- `.txt` (plain text)
- `.json` (configuration)

### BINARY FILES (use `copyFile` / `readBinaryFile` / `writeBinaryFile`)

✅ **WAJIB untuk:**

- `.key` (Keynote - **macOS bundle/package**)
- `.pages` (Pages - **macOS bundle/package**)
- `.pdf` (PDF documents)
- `.ppt`, `.pptx` (PowerPoint)
- `.doc`, `.docx` (Word)
- `.jpg`, `.png`, `.gif` (images)
- `.mp4`, `.mov` (videos)
- `.mp3`, `.m4a` (audio)

### ⚠️ CRITICAL RULES

1. **NEVER** use `readTextFile`/`writeTextFile` for binary files
   - Will **DESTROY** file integrity
   - Keynote/Pages will become **UNREADABLE**
2. **ALWAYS** use `TauriFS.copyFile()` for sermon attachments
   - Uses native OS copy operation
   - Preserves file integrity
3. **macOS `.key`/`.pages` are BUNDLES** (folders), not single files
   - Must be copied as whole units
   - Never read/write individual files inside
4. **Use `openPath()` for files**, NOT `shell.open()`
   - `shell.open()` is ONLY for URLs (http, mailto, tel)
   - Will fail regex validation if given file path

---

## ✅ GOLDEN RULES (TIDAK BOLEH DILANGGAR)

### 0. 🔧 WAJIB: Initialize app data SEBELUM operasi FS lainnya

**App Startup Lifecycle:**

```ts
// src/components/AppInitializer.tsx
await FSService.initializeAppData(); // ← WAJIB di startup
```

**Ini memastikan:**

- ✅ Base directory ada
- ✅ Subdirectories dibuat
- ✅ Semua writeFile aman

**JANGAN:**

- ❌ Langsung writeFile tanpa init
- ❌ Assume folder sudah ada

### 1. ❌ JANGAN PERNAH panggil `@tauri-apps/plugin-fs` langsung

**SALAH:**

```ts
import { stat, readTextFile } from "@tauri-apps/plugin-fs";
const stats = await stat(filePath);
```

**BENAR:**

```ts
import { FSService } from "@/lib/fs-service";
const title = FSService.extractTitleFromPath(filePath);
```

### 2. ✅ SEMUA FS operations HARUS melalui `FSService`

**Lokasi:** `src/lib/fs-service.ts`

**Alasan:**

- Centralized error handling
- Permission-aware
- Logging untuk debugging
- Fallback yang aman

### 3. ⚠️ `stat()` adalah OPERASI MAHAL - hindari jika tidak perlu

**Jangan gunakan `stat()` hanya untuk:**

- ❌ Mendapat filename → gunakan `path.split("/").pop()`
- ❌ Mendapat extension → gunakan `FSService.extractPathMetadata()`
- ❌ Validasi path → gunakan `FSService.exists()`

**Gunakan `stat()` HANYA untuk:**

- ✅ Menampilkan ukuran file ke user
- ✅ Sorting by modified date
- ✅ Sync/backup logic yang memerlukan timestamps

### 4. 🎯 Path HARUS dari sumber yang trusted

**Sumber Path yang AMAN (auto-trusted by Tauri):**

- ✅ `FSService.selectFolder()` - dialog picker
- ✅ `FSService.selectFile()` - dialog picker
- ✅ `FSService.getAppDataDir()` - app config folder

**Sumber Path yang TIDAK AMAN:**

- ❌ Hardcoded path (`/Users/john/Documents`)
- ❌ User input langsung (`input.value`)
- ❌ Path dari external source tanpa validasi

### 5. �️ WAJIB: Parent directory HARUS ada sebelum writeFile

**PRINSIP EMAS:**

> `writeFile` TIDAK membuat directory
> `appDataDir()` TIDAK menjamin folder exists

**Yang BENAR:**

```ts
// ✅ writeFile sudah auto-ensure parent dir
await FSService.writeFile(filePath, content);
// Internal: ensureDirExists → writeTextFile
```

**Yang SALAH:**

```ts
// ❌ Manual writeTextFile tanpa ensure dir
import { writeTextFile } from "@tauri-apps/plugin-fs";
await writeTextFile(filePath, content); // ← Error: No such file or directory
```

**Lifecycle:**

1. App startup → `initializeAppData()` → base folders created
2. Write file → `ensureDirExists(parentDir)` → write aman
3. Result: TIDAK PERNAH error "No such file or directory"

### 6. �📋 Permission HARUS sesuai dengan operasi

**File:** `src-tauri/tauri.conf.json`

```json
{
  "permissions": [
    "fs:allow-read-text-file", // ✅ Untuk readFile
    "fs:allow-write-text-file", // ✅ Untuk writeFile
    "fs:allow-read-dir", // ✅ Untuk readDirectory
    "fs:allow-exists", // ✅ Untuk exists
    "fs:allow-mkdir", // ✅ Untuk createDirectory
    "fs:allow-stat", // ✅ Untuk getExtendedMetadata
    {
      "identifier": "fs:scope",
      "allow": [
        { "path": "$HOME/**" }, // User's home folder
        { "path": "$APPCONFIG" }, // App config folder
        { "path": "$APPCONFIG/**" }
      ]
    }
  ]
}
```

**⚠️ Jika ada error "not allowed":**

1. Cek apakah permission ada di list
2. Cek apakah path dalam scope
3. Cek apakah menggunakan FSService

---

## 🧩 PATTERN USAGE YANG BENAR

### Pattern 1: Pilih Folder Vault

```ts
// ✅ BENAR
const vaultPath = await FSService.selectFolder();
if (!vaultPath) {
  console.error("No folder selected");
  return;
}

// Path ini sekarang trusted by Tauri
await FSService.readDirectory(vaultPath, true);
```

### Pattern 2: Baca File dari Vault

```ts
// ✅ BENAR
const files = await FSService.readDirectory(vaultPath, true);
const mdFiles = FSService.filterByExtension(files, ["md", "markdown"]);

for (const filePath of mdFiles) {
  const content = await FSService.readFile(filePath);
  // Process content
}
```

### Pattern 3: Extract Metadata TANPA stat()

```ts
// ✅ BENAR - Tidak perlu stat()
const title = FSService.extractTitleFromPath(filePath);
const meta = FSService.extractPathMetadata(filePath);

console.log("Filename:", meta.fileName);
console.log("Extension:", meta.extension);
console.log("Title:", title);
```

### Pattern 4: Extended Metadata (jika perlu)

```ts
// ⚠️ Gunakan hanya jika BENAR-BENAR perlu
const extendedMeta = await FSService.getExtendedMetadata(filePath);

if (extendedMeta) {
  console.log("Size:", extendedMeta.size);
  console.log("Modified:", new Date(extendedMeta.modified));
}
```

### Pattern 5: Save Vault Data (App Config)

```ts
// ✅ BENAR - appDataDir auto-allowed
const appDataPath = await FSService.getAppDataDir();
const configPath = FSService.joinPath(appDataPath, "config.json");

await FSService.writeFile(configPath, JSON.stringify(config));
```

---

## 🚨 COMMON ERRORS & SOLUTIONS

### Error 1: "fs.stat not allowed"

**Penyebab:**

- Permission `fs:allow-stat` tidak ada di `tauri.conf.json`
- Path di luar scope

**Solusi:**

```json
// Tambahkan di tauri.conf.json
"fs:allow-stat"
```

### Error 2: "path not in scope"

**Penyebab:**

- Menggunakan path yang tidak dari dialog picker
- Path di luar `$HOME/**` atau `$APPCONFIG`

**Solusi:**

```ts
// Gunakan dialog picker
const path = await FSService.selectFolder();
```

### Error 3: "Cannot read file: /some/path"

**Penyebab:**

- File tidak ada
- Permission denied
- Path salah

**Solusi:**

```ts
// Cek existence dulu
const exists = await FSService.exists(filePath);
if (!exists) {
  console.error("File not found");
  return;
}
```

---

## 📦 CHECKLIST SEBELUM COMMIT

- [ ] Tidak ada import langsung dari `@tauri-apps/plugin-fs` (kecuali di `fs-service.ts`)
- [ ] Semua FS operations melalui `FSService`
- [ ] Tidak ada `stat()` yang tidak perlu
- [ ] Path berasal dari dialog picker atau appDataDir
- [ ] Permission sudah sesuai di `tauri.conf.json`
- [ ] Error handling sudah proper
- [ ] Console log untuk debugging FS operations

---

## 🔧 MIGRATION GUIDE (Kode Lama → Kode Baru)

### Dari `TauriFS` → `FSService`

```ts
// ❌ LAMA
import { TauriFS } from "@/lib/tauri-fs";
const content = await TauriFS.readFile(path);

// ✅ BARU
import { FSService } from "@/lib/fs-service";
const content = await FSService.readFile(path);
```

### Dari `stat()` langsung → `extractTitleFromPath()`

```ts
// ❌ LAMA
import { stat } from "@tauri-apps/plugin-fs";
const stats = await stat(filePath);
const fileName = filePath.split("/").pop();
const title = fileName.replace(/\.[^/.]+$/, "");

// ✅ BARU
import { FSService } from "@/lib/fs-service";
const title = FSService.extractTitleFromPath(filePath);
```

### Dari `appDataDir()` langsung → `getAppDataDir()`

```ts
// ❌ LAMA
import { appDataDir } from "@tauri-apps/api/path";
const appData = await appDataDir();
const configPath = `${appData}config.json`;

// ✅ BARU
import { FSService } from "@/lib/fs-service";
const appData = await FSService.getAppDataDir();
const configPath = FSService.joinPath(appData, "config.json");
```

---

## 🎓 PEMBELAJARAN DARI BUG INI

### Apa yang terjadi?

1. `sermon-service.ts` memanggil `stat()` langsung
2. Path berasal dari vault user (belum divalidasi)
3. Tauri melihat: "stat() butuh permission, tapi kamu tidak punya"
4. Error dilempar: "fs.stat not allowed"

### Kenapa fallback tetap jalan tapi error tetap muncul?

- Try-catch menangkap error
- Fallback logic dijalankan
- Tapi error tetap di-log ke console
- User bingung karena app "jalan tapi error"

### Solusi final:

1. ✅ Buat `FSService` sebagai single source of truth
2. ✅ Tambahkan `fs:allow-stat` di permissions
3. ✅ Refactor `sermon-service.ts` untuk tidak panggil `stat()` kecuali perlu
4. ✅ Gunakan `extractTitleFromPath()` untuk title extraction

---

## 🎯 NEXT STEPS

### Untuk Windows Build (nanti)

1. Test semua FS operations di Windows
2. Cek path separator (`\` vs `/`)
3. Validate permissions di Windows
4. Test dialog picker behavior

### Untuk Production

1. Implement proper error reporting
2. Add retry logic untuk FS failures
3. Implement file locking jika perlu
4. Add progress indicator untuk bulk operations

---

## 📞 KALAU STUCK

**Langkah debugging:**

1. Cek console log → cari error FS
2. Cek path → apakah dari dialog picker?
3. Cek `tauri.conf.json` → apakah permission ada?
4. Cek `FSService` → apakah sudah digunakan?
5. Cek scope → apakah path dalam `$HOME/**`?

**Jika masih error:**

- Tambahkan console.log di `FSService` methods
- Cek Tauri devtools (jika ada)
- Review error message dari Tauri (panjang tapi informatif)

---

## ✝️ AYAT PENGINGAT

> "Karena itu, barangsiapa mendengar perkataan-Ku ini dan melakukannya, ia sama dengan orang yang bijaksana, yang mendirikan rumahnya di atas batu."
> — Matius 7:24

**Diterapkan di kode:**
Tauri memberi "perkataan" (security model).
Kita "melakukan" (ikuti rules).
Hasilnya: aplikasi yang solid seperti rumah di atas batu.

---

**DIBUAT:** 2026-02-03  
**UNTUK:** SermonVault Development Team  
**VERSI TAURI:** v2.x
