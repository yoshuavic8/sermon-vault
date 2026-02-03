// Sermon indexing and caching system
import { Sermon, SermonIndex, SearchFilters, FileType } from "./types";
import { FSService } from "./fs-service";
import { SermonService } from "./sermon-service";

export class SermonIndexer {
  private static readonly INDEX_FILE = "sermon-index.json";

  /**
   * Scan sermon vault and build index
   * Scans year-based folders for .md metadata files
   */
  static async buildIndex(sermonVaultPath: string): Promise<SermonIndex> {
    try {
      console.log("🔍 Building index for:", sermonVaultPath);

      // Scan for year folders (2020, 2021, etc) recursively
      const files = await FSService.readDirectory(sermonVaultPath, true);
      console.log(`📁 Found ${files.length} total files`);

      // Filter only .md metadata files
      const metadataFiles = files.filter((f) => f.endsWith(".md"));
      console.log(`📝 Found ${metadataFiles.length} .md files`);

      const sermons: Sermon[] = [];

      for (const metadataPath of metadataFiles) {
        try {
          const sermon = await SermonService.loadSermon(metadataPath);
          if (sermon) {
            sermons.push(sermon);
          }
        } catch (error) {
          console.warn("Skipping invalid metadata file:", metadataPath, error);
        }
      }

      // Build statistics
      const stats = this.calculateStats(sermons);

      const index: SermonIndex = {
        sermons,
        lastScanned: Date.now(),
        totalCount: sermons.length,
        stats,
      };

      // Save index to cache
      await this.saveIndex(sermonVaultPath, index);

      return index;
    } catch (error) {
      console.error("Failed to build index:", error);
      throw new Error("Cannot build sermon index");
    }
  }

  /**
   * Calculate statistics from sermons
   */
  private static calculateStats(sermons: Sermon[]) {
    const stats = {
      byYear: {} as Record<number, number>,
      byType: {} as Record<FileType, number>,
      byLocation: {} as Record<string, number>,
      byService: {} as Record<string, number>,
    };

    for (const sermon of sermons) {
      // By year
      stats.byYear[sermon.year] = (stats.byYear[sermon.year] || 0) + 1;

      // By type
      stats.byType[sermon.fileType] = (stats.byType[sermon.fileType] || 0) + 1;

      // By location from deliveries
      if (sermon.metadata.deliveries && sermon.metadata.deliveries.length > 0) {
        sermon.metadata.deliveries.forEach((delivery) => {
          if (delivery.location) {
            stats.byLocation[delivery.location] =
              (stats.byLocation[delivery.location] || 0) + 1;
          }
        });
      }

      // By service from deliveries
      if (sermon.metadata.deliveries && sermon.metadata.deliveries.length > 0) {
        sermon.metadata.deliveries.forEach((delivery) => {
          if (delivery.services && delivery.services.length > 0) {
            delivery.services.forEach((service) => {
              stats.byService[service] = (stats.byService[service] || 0) + 1;
            });
          }
        });
      }
    }

    return stats;
  }

  /**
   * Load cached index
   */
  static async loadIndex(sermonVaultPath: string): Promise<SermonIndex | null> {
    try {
      const indexPath = `${sermonVaultPath}/${this.INDEX_FILE}`;
      const exists = await FSService.exists(indexPath);

      if (!exists) return null;

      const content = await FSService.readFile(indexPath);
      return JSON.parse(content) as SermonIndex;
    } catch (error) {
      console.error("Failed to load index:", error);
      return null;
    }
  }

  /**
   * Save index to cache
   */
  static async saveIndex(
    sermonVaultPath: string,
    index: SermonIndex,
  ): Promise<void> {
    try {
      const indexPath = `${sermonVaultPath}/${this.INDEX_FILE}`;
      await FSService.writeFile(indexPath, JSON.stringify(index, null, 2));
    } catch (error) {
      console.error("Failed to save index:", error);
    }
  }

  /**
   * Search sermons with filters
   */
  static searchSermons(sermons: Sermon[], filters: SearchFilters): Sermon[] {
    return sermons.filter((sermon) => {
      const { metadata } = sermon;

      // Extract locations and services from deliveries for search
      const deliveryLocations =
        metadata.deliveries?.map((d) => d.location).filter(Boolean) || [];
      const deliveryServices =
        metadata.deliveries?.flatMap((d) => d.services || []).filter(Boolean) ||
        [];

      // Text search in title, tags, references, notes, delivery data
      if (filters.query) {
        const query = filters.query.toLowerCase();
        const searchText = [
          metadata.title,
          ...deliveryLocations,
          ...deliveryServices,
          ...(metadata.tags || []),
          ...(metadata.references || []),
          metadata.notes || "",
        ]
          .join(" ")
          .toLowerCase();

        if (!searchText.includes(query)) return false;
      }

      // File type filter
      if (filters.fileTypes && filters.fileTypes.length > 0) {
        if (!filters.fileTypes.includes(sermon.fileType)) return false;
      }

      // Location filter (check deliveries)
      if (filters.locations && filters.locations.length > 0) {
        const hasLocation = filters.locations.some((loc) =>
          deliveryLocations.includes(loc),
        );
        if (!hasLocation) {
          return false;
        }
      }

      // Service filter (check deliveries)
      if (filters.services && filters.services.length > 0) {
        const hasService = filters.services.some((svc) =>
          deliveryServices.includes(svc),
        );
        if (!hasService) {
          return false;
        }
      }

      // Series filter
      if (filters.series && filters.series.length > 0) {
        if (!metadata.series || !filters.series.includes(metadata.series)) {
          return false;
        }
      }

      // Tag filter
      if (filters.tags && filters.tags.length > 0) {
        const hasTag = filters.tags.some((tag) => metadata.tags?.includes(tag));
        if (!hasTag) return false;
      }

      // Year filter
      if (filters.yearFrom || filters.yearTo) {
        if (filters.yearFrom && sermon.year < filters.yearFrom) return false;
        if (filters.yearTo && sermon.year > filters.yearTo) return false;
      }

      return true;
    });
  }

  /**
   * Get all unique values for filter options
   */
  static extractFilterOptions(sermons: Sermon[]) {
    const locations = new Set<string>();
    const services = new Set<string>();
    const speakers = new Set<string>();
    const seriesSet = new Set<string>();
    const tags = new Set<string>();
    const years = new Set<number>();

    for (const sermon of sermons) {
      const { metadata } = sermon;

      // Extract locations and services from deliveries
      metadata.deliveries?.forEach((delivery) => {
        if (delivery.location) locations.add(delivery.location);
        if (delivery.services) {
          delivery.services.forEach((service) => services.add(service));
        }
      });
      if (metadata.series) seriesSet.add(metadata.series);
      metadata.tags?.forEach((t) => tags.add(t));
      years.add(sermon.year);
    }

    return {
      locations: Array.from(locations).sort(),
      services: Array.from(services).sort(),
      speakers: Array.from(speakers).sort(),
      series: Array.from(seriesSet).sort(),
      tags: Array.from(tags).sort(),
      years: Array.from(years).sort(),
    };
  }

  /**
   * Sort sermons by date (newest first)
   */
  static sortByDate(sermons: Sermon[], descending = true): Sermon[] {
    return [...sermons].sort((a, b) => {
      const dateA = new Date(a.metadata.date).getTime();
      const dateB = new Date(b.metadata.date).getTime();
      return descending ? dateB - dateA : dateA - dateB;
    });
  }

  /**
   * Get sermons by year
   */
  static groupByYear(sermons: Sermon[]): Record<number, Sermon[]> {
    const grouped: Record<number, Sermon[]> = {};

    for (const sermon of sermons) {
      if (!grouped[sermon.year]) grouped[sermon.year] = [];
      grouped[sermon.year].push(sermon);
    }

    return grouped;
  }
}
