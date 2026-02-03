// Vault data management (tags, locations, services)
import { VaultData } from "./types";
import { FSService } from "./fs-service";

export class VaultDataService {
  private static readonly VAULT_DATA_FILE = "vault-data.json";

  /**
   * Get vault data file path (SAFE - uses appDataDir)
   */
  private static async getVaultDataPath(): Promise<string> {
    const appData = await FSService.getAppDataDir();
    return FSService.joinPath(appData, this.VAULT_DATA_FILE);
  }

  /**
   * Load vault data
   */
  static async loadVaultData(): Promise<VaultData> {
    try {
      const dataPath = await this.getVaultDataPath();
      const exists = await FSService.exists(dataPath);

      if (!exists) {
        return this.getDefaultVaultData();
      }

      const content = await FSService.readFile(dataPath);
      return JSON.parse(content) as VaultData;
    } catch (error) {
      console.error("Failed to load vault data:", error);
      return this.getDefaultVaultData();
    }
  }

  /**
   * Save vault data
   */
  static async saveVaultData(data: VaultData): Promise<void> {
    try {
      const dataPath = await this.getVaultDataPath();
      await FSService.writeFile(dataPath, JSON.stringify(data, null, 2));
    } catch (error) {
      console.error("Failed to save vault data:", error);
      throw new Error("Cannot save vault data");
    }
  }

  /**
   * Get default vault data
   */
  private static getDefaultVaultData(): VaultData {
    return {
      tags: ["Kasih", "Iman", "Pengharapan", "Natal", "Paskah", "Keluarga"],
      locations: ["GBI Haleluya", "GBI Kristus"],
      services: [
        "Raya 1",
        "Raya 2",
        "Raya 3",
        "Raya 4",
        "Youth Service",
        "Kids Service",
      ],
    };
  }

  /**
   * Add tag
   */
  static async addTag(tag: string): Promise<void> {
    const data = await this.loadVaultData();
    if (!data.tags.includes(tag)) {
      data.tags.push(tag);
      data.tags.sort();
      await this.saveVaultData(data);
    }
  }

  /**
   * Remove tag
   */
  static async removeTag(tag: string): Promise<void> {
    const data = await this.loadVaultData();
    data.tags = data.tags.filter((t) => t !== tag);
    await this.saveVaultData(data);
  }

  /**
   * Add location
   */
  static async addLocation(location: string): Promise<void> {
    const data = await this.loadVaultData();
    if (!data.locations.includes(location)) {
      data.locations.push(location);
      data.locations.sort();
      await this.saveVaultData(data);
    }
  }

  /**
   * Remove location
   */
  static async removeLocation(location: string): Promise<void> {
    const data = await this.loadVaultData();
    data.locations = data.locations.filter((l) => l !== location);
    await this.saveVaultData(data);
  }

  /**
   * Add service
   */
  static async addService(service: string): Promise<void> {
    const data = await this.loadVaultData();
    if (!data.services.includes(service)) {
      data.services.push(service);
      data.services.sort();
      await this.saveVaultData(data);
    }
  }

  /**
   * Remove service
   */
  static async removeService(service: string): Promise<void> {
    const data = await this.loadVaultData();
    data.services = data.services.filter((s) => s !== service);
    await this.saveVaultData(data);
  }
}
