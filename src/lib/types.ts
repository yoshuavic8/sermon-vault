// Core types for Sermon Vault

export type FileType =
  | "keynote"
  | "pages"
  | "pdf"
  | "word"
  | "powerpoint"
  | "notes"
  | "markdown"
  | "unknown";

export interface FileMetadata {
  size: number; // bytes
  created: number; // timestamp
  modified: number; // timestamp
  accessed?: number; // timestamp
}

export interface DeliverySession {
  date: string; // ISO date string
  location: string; // e.g., "GBI Haleluya"
  services: string[]; // e.g., ["Raya 1", "Raya 2"], can be multiple
}

export interface SermonMetadata {
  id: string;
  title: string;
  date: string; // Primary date (ISO date string) - for main/first delivery
  deliveries?: DeliverySession[]; // Multiple delivery sessions
  tags?: string[];
  series?: string; // e.g., "Seri Natal 2024"
  references?: string[]; // Bible verses
  notes?: string;
}

export interface Sermon {
  id: string;
  metadata: SermonMetadata;
  fileType: FileType;
  fileName: string;
  filePath: string; // Path to actual sermon file (keynote, pdf, etc)
  metadataPath: string; // Path to .md metadata file
  fileMetadata: FileMetadata;
  year: number;
}

export interface SermonIndex {
  sermons: Sermon[];
  lastScanned: number;
  totalCount: number;
  stats: {
    byYear: Record<number, number>;
    byType: Record<FileType, number>;
    byLocation: Record<string, number>;
    byService: Record<string, number>;
  };
}

export interface AppSettings {
  sermonVaultPath: string;
  lastOpened?: string;
  theme?: "light" | "dark" | "system";
}

export interface VaultData {
  tags: string[];
  locations: string[];
  services: string[];
}

export interface SearchFilters {
  query?: string;
  fileTypes?: FileType[];
  tags?: string[];
  locations?: string[];
  services?: string[];
  speakers?: string[];
  series?: string[];
  yearFrom?: number;
  yearTo?: number;
}
