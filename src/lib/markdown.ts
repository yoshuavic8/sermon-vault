// Markdown parsing and writing utilities using gray-matter
import matter from "gray-matter";
import { SermonMetadata, Sermon } from "./types";
import { TauriFS } from "./tauri-fs";

export class MarkdownService {
  /**
   * Parse markdown file and extract frontmatter
   */
  static async parseSermon(path: string): Promise<Sermon> {
    try {
      const content = await TauriFS.readFile(path);
      const { data } = matter(content);

      const fileName = path.split("/").pop() || "untitled.md";
      const metadata = data as SermonMetadata;
      const dateCreated = new Date(metadata.date);
      const year = dateCreated.getFullYear();

      return {
        id: metadata.id,
        metadata,
        fileType: "markdown",
        fileName,
        filePath: path,
        metadataPath: path,
        fileMetadata: {
          size: content.length,
          created: dateCreated.getTime(),
          modified: Date.now(),
        },
        year,
      };
    } catch (error) {
      console.error("Failed to parse sermon:", path, error);
      throw new Error(`Cannot parse sermon: ${path}`);
    }
  }

  /**
   * Update frontmatter metadata
   */
  static async updateFrontmatter(
    path: string,
    metadata: SermonMetadata,
  ): Promise<void> {
    try {
      const content = await TauriFS.readFile(path);
      const { content: body } = matter(content);

      const updated = matter.stringify(body, metadata);
      await TauriFS.writeFile(path, updated);
    } catch (error) {
      console.error("Failed to update frontmatter:", path, error);
      throw new Error(`Cannot update frontmatter: ${path}`);
    }
  }

  /**
   * Create new sermon markdown file
   */
  static async createSermon(
    path: string,
    metadata: SermonMetadata,
    body: string = "",
  ): Promise<void> {
    try {
      const content = matter.stringify(body, metadata);
      await TauriFS.writeFile(path, content);
    } catch (error) {
      console.error("Failed to create sermon:", path, error);
      throw new Error(`Cannot create sermon: ${path}`);
    }
  }

  /**
   * Generate sermon ID from title and date
   */
  static generateId(title: string, date: string): string {
    const titleSlug = title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");

    return `${date}-${titleSlug}`;
  }

  /**
   * Create metadata template
   */
  static createMetadataTemplate(
    title: string,
    dateCreated?: string,
  ): SermonMetadata {
    const date = dateCreated || new Date().toISOString().split("T")[0];
    const id = this.generateId(title, date);

    return {
      id,
      title,
      date,
      tags: [],
      references: [],
      notes: "",
    };
  }

  /**
   * Validate metadata structure
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  static validateMetadata(metadata: any): metadata is SermonMetadata {
    return (
      typeof metadata === "object" &&
      typeof metadata.id === "string" &&
      typeof metadata.title === "string" &&
      typeof metadata.date_created === "string"
    );
  }

  /**
   * Extract excerpt from body (first 200 chars)
   */
  static extractExcerpt(body: string, length: number = 200): string {
    const clean = body
      .replace(/^#+ .+$/gm, "") // Remove headers
      .replace(/\[([^\]]+)\]\([^\)]+\)/g, "$1") // Remove links
      .replace(/[*_~`]/g, "") // Remove formatting
      .trim();

    return clean.length > length ? clean.substring(0, length) + "..." : clean;
  }
}
