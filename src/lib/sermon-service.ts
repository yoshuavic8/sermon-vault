// Sermon management service
import { Sermon, SermonMetadata, FileMetadata } from "./types";
import { TauriFS } from "./tauri-fs";
import { FileUtils } from "./file-utils";
import { FSService } from "./fs-service";
import matter from "gray-matter";

export class SermonService {
  /**
   * Extract metadata from file (SAFE - no stat() unless needed)
   */
  static async extractFileMetadata(
    filePath: string,
    useExtendedMetadata = false,
  ): Promise<{
    title: string;
    date: string;
    fileMetadata: FileMetadata;
  }> {
    // ✅ SAFE: Extract title tanpa stat()
    const title = FSService.extractTitleFromPath(filePath);

    // ✅ SAFE: Use current date as default
    const now = Date.now();
    let createdDate = now;

    let fileMetadata: FileMetadata = {
      size: 0,
      created: now,
      modified: now,
    };

    // ⚠️ Get file creation date for accurate dating
    try {
      const extendedMeta = await FSService.getExtendedMetadata(filePath);
      if (extendedMeta && extendedMeta.created) {
        createdDate = extendedMeta.created;
        fileMetadata = {
          size: extendedMeta.size || 0,
          created: extendedMeta.created,
          modified: extendedMeta.modified || now,
          accessed: extendedMeta.accessed,
        };
      }
    } catch (error) {
      console.warn("Could not get file creation date, using today:", error);
    }

    // Use file creation date for the sermon date
    const date = new Date(createdDate).toISOString().split("T")[0];

    return { title, date, fileMetadata };
  }

  /**
   * Import sermon file to vault
   */
  static async importSermon(
    vaultPath: string,
    sourceFilePath: string,
    metadata: SermonMetadata,
  ): Promise<Sermon> {
    try {
      const year = FileUtils.getYearFromDate(metadata.date);
      const yearPath = `${vaultPath}/${year}`;

      // Ensure year folder exists
      const yearExists = await TauriFS.exists(yearPath);
      if (!yearExists) {
        await TauriFS.createDirectory(yearPath);
      }

      // Get original filename
      const originalFileName = sourceFilePath.split("/").pop() || "sermon";
      const fileType = FileUtils.getFileType(originalFileName);

      // Generate target paths
      const targetFilePath = `${yearPath}/${originalFileName}`;
      const metadataFileName = FileUtils.getMetadataFileName(originalFileName);
      const metadataPath = `${yearPath}/${metadataFileName}`;

      // Copy sermon file to vault
      console.log("Copying sermon file to vault...");
      await TauriFS.copyFile(sourceFilePath, targetFilePath);

      // Create metadata file
      const metadataContent = this.serializeMetadata(metadata);
      await TauriFS.writeFile(metadataPath, metadataContent);

      // Get file metadata (stub for now)
      const fileMetadata: FileMetadata = {
        size: 0,
        created: Date.now(),
        modified: Date.now(),
      };

      const sermon: Sermon = {
        id: metadata.id,
        metadata,
        fileType,
        fileName: originalFileName,
        filePath: targetFilePath,
        metadataPath,
        fileMetadata,
        year,
      };

      return sermon;
    } catch (error) {
      console.error("Failed to import sermon:", error);
      throw new Error("Cannot import sermon file");
    }
  }

  /**
   * Load sermon from vault
   */
  static async loadSermon(metadataPath: string): Promise<Sermon | null> {
    try {
      const content = await FSService.readFile(metadataPath);
      const { data } = matter(content);

      const metadata = data as SermonMetadata;

      // ✅ Deserialize deliveries from JSON string if needed
      if (typeof metadata.deliveries === "string") {
        try {
          metadata.deliveries = JSON.parse(metadata.deliveries);
        } catch (e) {
          console.warn("Failed to parse deliveries JSON:", e);
          metadata.deliveries = [];
        }
      }
      // ✅ Migrate old delivery format (service -> services)
      if (metadata.deliveries && Array.isArray(metadata.deliveries)) {
        metadata.deliveries = metadata.deliveries.map((delivery: any) => {
          // If old format with singular 'service', convert to 'services' array
          if (delivery.service && !delivery.services) {
            return {
              date: delivery.date,
              location: delivery.location,
              services: [delivery.service],
            };
          }
          // Ensure services is always an array
          if (!delivery.services || !Array.isArray(delivery.services)) {
            return {
              date: delivery.date,
              location: delivery.location,
              services: [],
            };
          }
          return delivery;
        });
      }
      // ✅ Validate required fields
      if (!metadata.id) {
        console.warn("Missing id in metadata:", metadataPath);
        return null;
      }

      if (!metadata.title) {
        console.warn("Missing title in metadata:", metadataPath);
        return null;
      }

      // ✅ Ensure date is valid, fallback to current date
      if (!metadata.date) {
        console.warn(
          "Missing date in metadata:",
          metadataPath,
          "using current date",
        );
        metadata.date = new Date().toISOString().split("T")[0];
      }

      // Derive file path from metadata path
      const dirPath = metadataPath.substring(0, metadataPath.lastIndexOf("/"));
      const metadataFileName = metadataPath.split("/").pop() || "";

      // Extract original filename by removing .md extension
      // Example: "Kelimpahan Sejati.key.md" -> "Kelimpahan Sejati.key"
      const fileName = metadataFileName.replace(/\.md$/, "");

      // Build full file path and detect file type
      const filePath = `${dirPath}/${fileName}`;
      const fileType = FileUtils.getFileType(fileName);

      const year = parseInt(dirPath.split("/").pop() || "0");

      const fileMetadata: FileMetadata = {
        size: 0,
        created: Date.now(),
        modified: Date.now(),
      };

      const sermon: Sermon = {
        id: metadata.id,
        metadata,
        fileType,
        fileName,
        filePath,
        metadataPath,
        fileMetadata,
        year,
      };

      return sermon;
    } catch (error) {
      console.error("Failed to load sermon:", error);
      return null;
    }
  }

  /**
   * Update sermon metadata
   */
  static async updateMetadata(
    metadataPath: string,
    metadata: SermonMetadata,
  ): Promise<void> {
    try {
      const content = this.serializeMetadata(metadata);
      await FSService.writeFile(metadataPath, content);
    } catch (error) {
      console.error("Failed to update metadata:", error);
      throw new Error("Cannot update sermon metadata");
    }
  }

  /**
   * Serialize metadata to markdown frontmatter
   */
  static serializeMetadata(metadata: SermonMetadata): string {
    // Build the frontmatter parts
    const parts: string[] = [
      "---",
      `id: ${metadata.id}`,
      `title: "${metadata.title}"`,
      `date: ${metadata.date}`,
    ];

    // Add deliveries if exists
    if (metadata.deliveries && metadata.deliveries.length > 0) {
      const deliveriesData = metadata.deliveries.map((d) => ({
        date: d.date,
        location: d.location,
        services: d.services || [],
      }));
      parts.push(`deliveries: ${JSON.stringify(deliveriesData)}`);
    }

    // Add optional fields
    if (metadata.series) {
      parts.push(`series: "${metadata.series}"`);
    }

    if (metadata.tags && metadata.tags.length > 0) {
      parts.push(`tags: [${metadata.tags.join(", ")}]`);
    }

    if (metadata.references && metadata.references.length > 0) {
      parts.push(`references: [${metadata.references.join(", ")}]`);
    }

    // Close frontmatter and add notes
    parts.push("---");
    parts.push("");
    parts.push(metadata.notes || "");

    return parts.join("\n");
  }

  /**
   * Create metadata template
   */
  static createMetadataTemplate(title: string, date: string): SermonMetadata {
    return {
      id: FileUtils.generateSermonId(),
      title,
      date,
      tags: [],
      references: [],
    };
  }
}
