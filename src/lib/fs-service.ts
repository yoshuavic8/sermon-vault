/**
 * FS Service - Centralized File System abstraction layer
 *
 * TAURI FS RULES:
 * 1. Semua FS operations HARUS melalui layer ini
 * 2. JANGAN panggil @tauri-apps/plugin-fs langsung dari komponen/service lain
 * 3. Path HARUS berasal dari dialog picker atau appDataDir
 * 4. stat() hanya dipanggil jika BENAR-BENAR perlu
 * 5. Semua error FS ditangani di sini (centralized error handling)
 * 6. WAJIB: ensureDirExists sebelum writeFile
 * 7. WAJIB: initializeAppData() di app startup
 */

import {
  readTextFile,
  writeTextFile,
  readDir,
  exists,
  mkdir,
} from "@tauri-apps/plugin-fs";
import {
  open as openDialog,
  save as saveDialog,
} from "@tauri-apps/plugin-dialog";
import { appDataDir } from "@tauri-apps/api/path";

// App data initialization flag
let appDataInitialized = false;

/**
 * File metadata yang AMAN tanpa perlu stat()
 */
export interface SafeFileMetadata {
  fileName: string;
  extension: string;
  relativePath?: string;
}

/**
 * File metadata lengkap (HANYA jika benar-benar perlu)
 */
export interface ExtendedFileMetadata extends SafeFileMetadata {
  size?: number;
  created?: number;
  modified?: number;
  accessed?: number;
}

export class FSService {
  /**
   * 🔧 INITIALIZE: Setup app data directory structure
   * WAJIB dipanggil saat app startup, sebelum FS operations lain
   */
  static async initializeAppData(): Promise<void> {
    if (appDataInitialized) {
      console.log("✅ App data already initialized");
      return;
    }

    try {
      console.log("🔧 Initializing app data directories...");

      const baseDir = await appDataDir();
      console.log("📁 Base dir:", baseDir);

      // Ensure base directory exists
      await this.ensureDirExists(baseDir);

      // Create subdirectories if needed
      await this.ensureDirExists(this.joinPath(baseDir, "cache"));
      await this.ensureDirExists(this.joinPath(baseDir, "index"));

      appDataInitialized = true;
      console.log("✅ App data directories initialized");
    } catch (error) {
      console.error("❌ Failed to initialize app data:", error);
      throw new Error("Cannot initialize app data structure");
    }
  }

  /**
   * 🛡️ GUARD: Ensure directory exists (creates if missing)
   * WAJIB dipanggil sebelum writeFile
   */
  static async ensureDirExists(dirPath: string): Promise<void> {
    try {
      const dirExists = await exists(dirPath);

      if (!dirExists) {
        console.log("📁 Creating directory:", dirPath);
        await mkdir(dirPath, { recursive: true });
        console.log("✅ Directory created");
      }
    } catch (error) {
      console.error("❌ Failed to ensure directory exists:", dirPath, error);
      throw new Error(`Cannot create directory: ${dirPath}`);
    }
  }

  /**
   * 🔑 HELPER: Extract parent directory from file path
   */
  private static getParentDir(filePath: string): string {
    const parts = filePath.split("/");
    parts.pop(); // Remove filename
    return parts.join("/");
  }
  /**
   * ✅ SAFE: Pilih folder menggunakan dialog (auto-trusted by Tauri)
   */
  static async selectFolder(): Promise<string | null> {
    try {
      const selected = await openDialog({
        directory: true,
        multiple: false,
      });

      if (typeof selected === "string") {
        console.log("✅ Folder selected (trusted by Tauri):", selected);
        return selected;
      }

      return null;
    } catch (error) {
      console.error("❌ Failed to select folder:", error);
      return null;
    }
  }

  /**
   * ✅ SAFE: Pilih file menggunakan dialog
   */
  static async selectFile(
    filters?: { name: string; extensions: string[] }[],
  ): Promise<string | null> {
    try {
      const selected = await openDialog({
        multiple: false,
        filters: filters || [],
      });

      if (typeof selected === "string") {
        console.log("✅ File selected (trusted by Tauri):", selected);
        return selected;
      }

      return null;
    } catch (error) {
      console.error("❌ Failed to select file:", error);
      return null;
    }
  }

  /**
   * ✅ SAFE: Pilih multiple files
   */
  static async selectFiles(
    filters?: { name: string; extensions: string[] }[],
  ): Promise<string[]> {
    try {
      const selected = await openDialog({
        multiple: true,
        filters: filters || [],
      });

      if (Array.isArray(selected)) {
        console.log("✅ Files selected:", selected.length);
        return selected;
      }

      return [];
    } catch (error) {
      console.error("❌ Failed to select files:", error);
      return [];
    }
  }

  /**
   * ✅ SAFE: Pilih lokasi untuk save file
   */
  static async selectSaveLocation(
    defaultPath?: string,
  ): Promise<string | null> {
    try {
      const selected = await saveDialog({
        defaultPath,
      });

      if (selected) {
        console.log("✅ Save location selected:", selected);
        return selected;
      }

      return null;
    } catch (error) {
      console.error("❌ Failed to select save location:", error);
      return null;
    }
  }

  /**
   * ✅ SAFE: Get app data directory (auto-allowed by Tauri)
   */
  static async getAppDataDir(): Promise<string> {
    try {
      const dir = await appDataDir();
      console.log("✅ App data dir:", dir);
      return dir;
    } catch (error) {
      console.error("❌ Failed to get app data dir:", error);
      throw new Error("Cannot access app data directory");
    }
  }

  /**
   * ✅ SAFE: Copy file from source to destination
   * Reads binary content and writes to new location
   */
  static async copyFile(sourcePath: string, destPath: string): Promise<void> {
    try {
      console.log("📋 Copying file:", sourcePath, "→", destPath);

      // Ensure destination directory exists
      const parentDir = this.getParentDir(destPath);
      await this.ensureDirExists(parentDir);

      // Read source file as text (works for most sermon files)
      const content = await readTextFile(sourcePath);

      // Write to destination
      await writeTextFile(destPath, content);

      console.log("✅ File copied successfully");
    } catch (error) {
      console.error(
        "❌ Failed to copy file:",
        sourcePath,
        "→",
        destPath,
        error,
      );
      throw new Error(`Cannot copy file: ${sourcePath}`);
    }
  }

  /**
   * ✅ SAFE: Read file content
   * HANYA gunakan dengan path dari dialog picker atau appDataDir
   */
  static async readFile(path: string): Promise<string> {
    try {
      console.log("📖 Reading file:", path);
      const content = await readTextFile(path);
      return content;
    } catch (error) {
      console.error("❌ Failed to read file:", path, error);
      throw new Error(`Cannot read file: ${path}`);
    }
  }

  /**
   * ✅ SAFE: Write file content
   * AUTO ensures parent directory exists
   * HANYA gunakan dengan path dari dialog picker atau appDataDir
   */
  static async writeFile(path: string, content: string): Promise<void> {
    try {
      console.log("✍️ Writing file:", path);

      // 🛡️ GUARD: Ensure parent directory exists
      const parentDir = this.getParentDir(path);
      await this.ensureDirExists(parentDir);

      await writeTextFile(path, content);
      console.log("✅ File written successfully");
    } catch (error) {
      console.error("❌ Failed to write file:", path, error);
      throw new Error(`Cannot write file: ${path}`);
    }
  }

  /**
   * ✅ SAFE: Check if file/folder exists
   */
  static async exists(path: string): Promise<boolean> {
    try {
      const result = await exists(path);
      return result;
    } catch (error) {
      console.error("❌ Failed to check existence:", path, error);
      return false;
    }
  }

  /**
   * ✅ SAFE: Create directory
   * Now uses ensureDirExists internally
   * HANYA gunakan dengan path dari dialog picker atau appDataDir
   */
  static async createDirectory(path: string): Promise<void> {
    try {
      await this.ensureDirExists(path);
    } catch (error) {
      console.error("❌ Failed to create directory:", path, error);
      throw new Error(`Cannot create directory: ${path}`);
    }
  }

  /**
   * ✅ SAFE: Read directory contents
   * Returns list of file paths
   */
  static async readDirectory(
    path: string,
    recursive = false,
  ): Promise<string[]> {
    try {
      console.log("📂 Reading directory:", path, "recursive:", recursive);
      const entries = await readDir(path);
      const files: string[] = [];

      for (const entry of entries) {
        const fullPath = `${path}/${entry.name}`;

        if (entry.isDirectory && recursive) {
          const subFiles = await this.readDirectory(fullPath, true);
          files.push(...subFiles);
        } else if (entry.isFile) {
          files.push(fullPath);
        }
      }

      console.log(`✅ Found ${files.length} files`);
      return files;
    } catch (error) {
      console.error("❌ Failed to read directory:", path, error);
      throw new Error(`Cannot read directory: ${path}`);
    }
  }

  /**
   * ✅ SAFE: Extract metadata dari path TANPA stat()
   * Gunakan ini untuk mendapatkan info dasar tanpa file system access
   */
  static extractPathMetadata(filePath: string): SafeFileMetadata {
    const fileName = filePath.split("/").pop() || "unknown";
    const extension = fileName.includes(".")
      ? fileName.split(".").pop() || ""
      : "";

    return {
      fileName,
      extension,
    };
  }

  /**
   * ✅ SAFE: Extract title dari filename (tanpa stat())
   * Gunakan ini sebagai pengganti extractFileMetadata yang lama
   */
  static extractTitleFromPath(filePath: string): string {
    const fileName = filePath.split("/").pop() || "Untitled";
    const title = fileName
      .replace(/\.[^/.]+$/, "") // Remove extension
      .replace(/[-_]/g, " ") // Replace dashes/underscores with spaces
      .replace(/\b\w/g, (l) => l.toUpperCase()); // Capitalize words

    return title;
  }

  /**
   * ⚠️ UNSAFE: Hanya gunakan jika BENAR-BENAR perlu file stats
   * Contoh use case yang valid:
   * - Menampilkan ukuran file ke user
   * - Sorting by modified date
   * - Sync/backup logic
   *
   * JANGAN gunakan hanya untuk mendapat filename/extension!
   */
  static async getExtendedMetadata(
    filePath: string,
  ): Promise<ExtendedFileMetadata | null> {
    try {
      // Import stat hanya di sini, tidak di module level
      const { stat } = await import("@tauri-apps/plugin-fs");

      console.log("⚠️ Using stat() for:", filePath);
      const stats = await stat(filePath);

      const pathMeta = this.extractPathMetadata(filePath);

      return {
        ...pathMeta,
        size: stats.size,
        created: stats.birthtime?.getTime(),
        modified: stats.mtime?.getTime(),
        accessed: stats.atime?.getTime(),
      };
    } catch (error) {
      console.error("❌ Failed to get extended metadata:", filePath, error);
      console.log("⚠️ This is expected if path is not in Tauri scope");

      // Return safe fallback
      return {
        ...this.extractPathMetadata(filePath),
        size: 0,
        created: Date.now(),
        modified: Date.now(),
      };
    }
  }

  /**
   * ✅ SAFE: Validate extension
   */
  static hasExtension(filePath: string, extensions: string[]): boolean {
    const meta = this.extractPathMetadata(filePath);
    return extensions.includes(meta.extension.toLowerCase());
  }

  /**
   * ✅ SAFE: Filter files by extension
   */
  static filterByExtension(
    filePaths: string[],
    extensions: string[],
  ): string[] {
    return filePaths.filter((path) => this.hasExtension(path, extensions));
  }

  /**
   * ✅ SAFE: Get year from filename/path
   */
  static extractYearFromPath(path: string): number | null {
    const yearMatch = path.match(/\b(19|20)\d{2}\b/);
    return yearMatch ? parseInt(yearMatch[0]) : null;
  }

  /**
   * ✅ SAFE: Normalize path separators
   */
  static normalizePath(path: string): string {
    return path.replace(/\\/g, "/");
  }

  /**
   * ✅ SAFE: Join paths properly
   * Preserves leading slash for absolute paths
   */
  static joinPath(...parts: string[]): string {
    if (parts.length === 0) return "";

    // Check if first part is absolute (starts with /)
    const isAbsolute = parts[0].startsWith("/");

    // Clean and join parts
    const joined = parts
      .map((part) => part.replace(/^\/+|\/+$/g, ""))
      .filter((part) => part.length > 0)
      .join("/");

    // Restore leading slash if original was absolute
    return isAbsolute ? `/${joined}` : joined;
  }
}
