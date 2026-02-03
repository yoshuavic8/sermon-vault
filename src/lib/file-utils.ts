// File utilities for Sermon Vault
import { FileType, FileMetadata } from "./types";

export class FileUtils {
  /**
   * Detect file type from extension
   */
  static getFileType(fileName: string): FileType {
    const ext = fileName.toLowerCase().split(".").pop() || "";

    const typeMap: Record<string, FileType> = {
      // Keynote
      key: "keynote",
      keynote: "keynote",

      // Pages
      pages: "pages",

      // PDF
      pdf: "pdf",

      // Word
      doc: "word",
      docx: "word",

      // PowerPoint
      ppt: "powerpoint",
      pptx: "powerpoint",

      // Notes/Text
      txt: "notes",
      rtf: "notes",

      // Markdown
      md: "markdown",
      markdown: "markdown",
    };

    return typeMap[ext] || "unknown";
  }

  /**
   * Get file type icon/emoji
   */
  static getFileIcon(fileType: FileType): string {
    const iconMap: Record<FileType, string> = {
      keynote: "📊",
      pages: "📄",
      pdf: "📕",
      word: "📘",
      powerpoint: "📙",
      notes: "📝",
      markdown: "✍️",
      unknown: "📎",
    };

    return iconMap[fileType];
  }

  /**
   * Get file type display name
   */
  static getFileTypeName(fileType: FileType): string {
    const nameMap: Record<FileType, string> = {
      keynote: "Keynote",
      pages: "Pages",
      pdf: "PDF",
      word: "Word",
      powerpoint: "PowerPoint",
      notes: "Notes",
      markdown: "Markdown",
      unknown: "Unknown",
    };

    return nameMap[fileType];
  }

  /**
   * Get supported file extensions
   */
  static getSupportedExtensions(): string[] {
    return [
      "key",
      "keynote",
      "pages",
      "pdf",
      "doc",
      "docx",
      "ppt",
      "pptx",
      "txt",
      "rtf",
      "md",
      "markdown",
    ];
  }

  /**
   * Check if file is supported
   */
  static isSupportedFile(fileName: string): boolean {
    const ext = fileName.toLowerCase().split(".").pop() || "";
    return this.getSupportedExtensions().includes(ext);
  }

  /**
   * Format file size
   */
  static formatFileSize(bytes: number): string {
    if (bytes === 0) return "0 B";

    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
  }

  /**
   * Generate metadata filename from sermon file
   * Keeps the original extension to preserve file type information
   * Example: "Sermon.key" -> "Sermon.key.md"
   */
  static getMetadataFileName(sermonFileName: string): string {
    // Keep original filename and add .md extension
    return `${sermonFileName}.md`;
  }

  /**
   * Get year from date string
   */
  static getYearFromDate(dateString: string): number {
    return new Date(dateString).getFullYear();
  }

  /**
   * Generate sermon ID
   */
  static generateSermonId(): string {
    return `sermon-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Sanitize filename (remove invalid characters)
   */
  static sanitizeFileName(fileName: string): string {
    return fileName
      .replace(/[<>:"/\\|?*]/g, "-")
      .replace(/\s+/g, "-")
      .toLowerCase();
  }
}
