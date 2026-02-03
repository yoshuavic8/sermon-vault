// Settings management for Sermon Vault
import { AppSettings } from "./types";
import { TauriFS } from "./tauri-fs";
import { appDataDir } from "@tauri-apps/api/path";

export class SettingsService {
  private static readonly SETTINGS_FILE = "sermon-vault-settings.json";

  /**
   * Get settings file path (in app data directory)
   */
  private static async getSettingsPath(): Promise<string> {
    // Use Tauri's app data directory (secure & no extra permissions needed)
    // Example: /Users/yoshuavictor/Library/Application Support/com.sermonvault.app/
    const appData = await appDataDir();
    return `${appData}${this.SETTINGS_FILE}`;
  }

  /**
   * Load settings
   */
  static async loadSettings(): Promise<AppSettings | null> {
    try {
      const settingsPath = await this.getSettingsPath();
      const exists = await TauriFS.exists(settingsPath);

      if (!exists) return null;

      const content = await TauriFS.readFile(settingsPath);
      return JSON.parse(content) as AppSettings;
    } catch (error) {
      console.error("Failed to load settings:", error);
      return null;
    }
  }

  /**
   * Save settings
   */
  static async saveSettings(settings: AppSettings): Promise<void> {
    try {
      const settingsPath = await this.getSettingsPath();
      const dir = settingsPath.substring(0, settingsPath.lastIndexOf("/"));

      // Ensure directory exists
      const dirExists = await TauriFS.exists(dir);
      if (!dirExists) {
        await TauriFS.createDirectory(dir);
      }

      await TauriFS.writeFile(settingsPath, JSON.stringify(settings, null, 2));
    } catch (error) {
      console.error("Failed to save settings:", error);
      throw new Error("Cannot save settings");
    }
  }

  /**
   * Update sermon vault path
   */
  static async updateVaultPath(path: string): Promise<void> {
    const settings = (await this.loadSettings()) || { sermonVaultPath: path };
    settings.sermonVaultPath = path;
    settings.lastOpened = new Date().toISOString();
    await this.saveSettings(settings);
  }

  /**
   * Get current vault path
   */
  static async getVaultPath(): Promise<string | null> {
    const settings = await this.loadSettings();
    return settings?.sermonVaultPath || null;
  }
}
