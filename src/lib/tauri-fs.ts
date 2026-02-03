// Tauri File System wrapper for type safety and error handling
//
// 🛡️ FILE TYPES SAFETY CHECKLIST
// ================================
//
// TEXT FILES (use readTextFile / writeTextFile):
//   ✅ .md (metadata files)
//   ✅ .txt (plain text)
//   ✅ .json (configuration)
//
// BINARY FILES (use copyFile / readBinaryFile / writeBinaryFile):
//   ✅ .key (Keynote - macOS bundle/package)
//   ✅ .pages (Pages - macOS bundle/package)
//   ✅ .pdf (PDF documents)
//   ✅ .ppt, .pptx (PowerPoint)
//   ✅ .doc, .docx (Word)
//   ✅ .jpg, .png, .gif (images)
//   ✅ .mp4, .mov (videos)
//   ✅ .mp3, .m4a (audio)
//
// ⚠️ CRITICAL RULES:
//   1. NEVER use readTextFile/writeTextFile for binary files
//   2. ALWAYS use copyFile() for sermon attachments
//   3. macOS .key/.pages are BUNDLES (folders), not single files
//   4. Use openPath() for files, NOT shell.open() (that's for URLs only)
//
import {
  readTextFile,
  writeTextFile,
  readDir,
  exists,
  mkdir,
  copyFile as tauriCopyFile,
  readFile as readBinaryFile,
  writeFile as writeBinaryFile,
} from "@tauri-apps/plugin-fs";
import { open as openPath } from "@tauri-apps/plugin-shell";
import {
  open as openDialog,
  save as saveDialog,
} from "@tauri-apps/plugin-dialog";

export class TauriFS {
  /**
   * Read file content as text (for .md, .json, .txt files only)
   * ⚠️ DO NOT USE for binary files (Keynote, Pages, PDF, images, etc.)
   */
  static async readFile(path: string): Promise<string> {
    try {
      return await readTextFile(path);
    } catch (error) {
      console.error("Failed to read file:", path, error);
      throw new Error(`Cannot read file: ${path}`);
    }
  }

  /**
   * Read binary file content (for Keynote, Pages, PDF, images, etc.)
   * Returns Uint8Array of raw bytes
   */
  static async readBinaryFile(path: string): Promise<Uint8Array> {
    try {
      return await readBinaryFile(path);
    } catch (error) {
      console.error("Failed to read binary file:", path, error);
      throw new Error(`Cannot read binary file: ${path}`);
    }
  }

  /**
   * Copy file from source to destination (SAFE FOR ALL FILE TYPES)
   * ✅ Works correctly for:
   *   - Text files (.md, .txt, .json)
   *   - Binary files (.key, .pages, .pdf, .ppt, .doc, images, etc.)
   *   - macOS bundles/packages (Keynote, Pages)
   *
   * Uses native OS copy operation - preserves file integrity
   */
  static async copyFile(sourcePath: string, destPath: string): Promise<void> {
    try {
      // Use Tauri's native copyFile - handles ALL file types correctly
      await tauriCopyFile(sourcePath, destPath);
      console.log(`✅ File copied successfully: ${sourcePath} → ${destPath}`);
    } catch (error) {
      console.error("Failed to copy file:", sourcePath, "to", destPath, error);
      throw new Error(`Cannot copy file: ${sourcePath}`);
    }
  }

  /**
   * Copy attachment/sermon file safely
   * This is specifically for sermon files (Keynote, Pages, PDF, etc.)
   * Alias for copyFile, but with semantic naming
   */
  static async copyAttachmentSafe(
    sourcePath: string,
    destPath: string,
  ): Promise<void> {
    return this.copyFile(sourcePath, destPath);
  }

  /**
   * Write content to file (for text files only: .md, .json, .txt)
   * ⚠️ DO NOT USE for binary files
   */
  static async writeFile(path: string, content: string): Promise<void> {
    try {
      await writeTextFile(path, content);
    } catch (error) {
      console.error("Failed to write file:", path, error);
      throw new Error(`Cannot write file: ${path}`);
    }
  }

  /**
   * Write binary content to file (for Keynote, Pages, PDF, images, etc.)
   */
  static async writeBinaryFile(
    path: string,
    content: Uint8Array,
  ): Promise<void> {
    try {
      await writeBinaryFile(path, content);
    } catch (error) {
      console.error("Failed to write binary file:", path, error);
      throw new Error(`Cannot write binary file: ${path}`);
    }
  }

  /**
   * Read directory recursively
   */
  static async readDirectory(
    path: string,
    recursive = true,
  ): Promise<string[]> {
    try {
      const entries = await readDir(path);
      const files: string[] = [];

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const processEntries = (items: any[]) => {
        for (const entry of items) {
          if (entry.children) {
            processEntries(entry.children);
          } else if (entry.name?.endsWith(".md")) {
            files.push(entry.path);
          }
        }
      };

      processEntries(entries);
      return files;
    } catch (error) {
      console.error("Failed to read directory:", path, error);
      return [];
    }
  }

  /**
   * Check if path exists
   */
  static async exists(path: string): Promise<boolean> {
    try {
      return await exists(path);
    } catch {
      return false;
    }
  }

  /**
   * Create directory
   */
  static async createDirectory(path: string): Promise<void> {
    try {
      await mkdir(path, { recursive: true });
    } catch (error) {
      console.error("Failed to create directory:", path, error);
      throw new Error(`Cannot create directory: ${path}`);
    }
  }

  /**
   * Open file or folder in Finder/Explorer
   * Shows the file in its parent folder (more reliable than opening directly)
   * Works for:
   *   - Files (.key, .pages, .pdf, .ppt, .doc, images, etc.)
   *   - Folders/directories
   *   - macOS bundles/packages
   *
   * Note: Opens the containing folder instead of the file itself
   * because macOS .key/.pages bundles don't always open correctly with openPath
   */
  static async openWithDefault(path: string): Promise<void> {
    try {
      // Extract parent folder path
      const folderPath = path.substring(0, path.lastIndexOf("/"));

      // Open folder in Finder/Explorer
      await openPath(folderPath);
      console.log(`✅ Opened folder in Finder: ${folderPath}`);
    } catch (error) {
      console.error("Failed to open folder:", path, error);
      throw new Error(`Cannot open folder for: ${path}`);
    }
  }

  /**
   * Try to open file directly with default app
   * May not work reliably for macOS bundles (.key, .pages)
   */
  static async openFileDirectly(path: string): Promise<void> {
    try {
      await openPath(path);
      console.log(`✅ Opened file with default app: ${path}`);
    } catch (error) {
      console.error("Failed to open file:", path, error);
      throw new Error(`Cannot open file: ${path}`);
    }
  }

  /**
   * Open folder picker dialog
   */
  static async pickFolder(): Promise<string | null> {
    try {
      const selected = await openDialog({
        directory: true,
        multiple: false,
        title: "Select Sermon Vault Folder",
      });
      console.log("Dialog returned:", selected, "Type:", typeof selected);
      return selected as string | null;
    } catch (error) {
      console.error("Failed to open folder picker:", error);
      return null;
    }
  }

  /**
   * Save file dialog
   */
  static async saveFile(defaultPath?: string): Promise<string | null> {
    try {
      const selected = await saveDialog({
        defaultPath,
        title: "Save Sermon",
      });
      return selected;
    } catch (error) {
      console.error("Failed to open save dialog:", error);
      return null;
    }
  }
}
