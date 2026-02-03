"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ArrowLeft, FolderOpen, Save, Loader2 } from "lucide-react";
import { SettingsService } from "@/lib/settings";
import { TauriFS } from "@/lib/tauri-fs";
import { toast } from "sonner";

export default function SettingsPage() {
  const router = useRouter();
  const [vaultPath, setVaultPath] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const path = await SettingsService.getVaultPath();
      setVaultPath(path);
    } catch (error) {
      console.error("Failed to load settings:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectFolder = async () => {
    try {
      const selected = await TauriFS.pickFolder();
      if (selected) {
        setSaving(true);
        await SettingsService.updateVaultPath(selected);
        setVaultPath(selected);
        toast.success("Vault path updated");
        setSaving(false);
      }
    } catch (error) {
      toast.error("Failed to update vault path");
      console.error(error);
      setSaving(false);
    }
  };

  const handleCreateStructure = async () => {
    if (!vaultPath) {
      toast.error("Please select a vault folder first");
      return;
    }

    setSaving(true);
    try {
      // Create folder structure
      const folders = [
        `${vaultPath}/sermons`,
        `${vaultPath}/sermons/2024`,
        `${vaultPath}/sermons/2025`,
        `${vaultPath}/sermons/2026`,
        `${vaultPath}/attachments`,
        `${vaultPath}/attachments/keynote`,
        `${vaultPath}/attachments/pages`,
      ];

      for (const folder of folders) {
        const exists = await TauriFS.exists(folder);
        if (!exists) {
          await TauriFS.createDirectory(folder);
        }
      }

      // Create config file
      const configPath = `${vaultPath}/config.json`;
      const configExists = await TauriFS.exists(configPath);
      if (!configExists) {
        await TauriFS.writeFile(
          configPath,
          JSON.stringify(
            {
              version: "1.0.0",
              created: new Date().toISOString(),
              structure: "sermon-vault",
            },
            null,
            2,
          ),
        );
      }

      toast.success("Folder structure created");
    } catch (error) {
      toast.error("Failed to create folder structure");
      console.error(error);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      <div className="container mx-auto px-4 py-8 max-w-3xl">
        <div className="flex items-center gap-4 mb-8">
          <Button variant="ghost" size="icon" onClick={() => router.push("/")}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Settings</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Configure your Sermon Vault
            </p>
          </div>
        </div>

        <div className="space-y-6">
          {/* Vault Path */}
          <Card>
            <CardHeader>
              <CardTitle>Sermon Vault Location</CardTitle>
              <CardDescription>
                The folder where all your sermon files are stored
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {vaultPath ? (
                <div className="p-4 bg-muted rounded-lg">
                  <p className="text-sm font-mono break-all">{vaultPath}</p>
                </div>
              ) : (
                <div className="p-4 bg-muted/50 rounded-lg border-2 border-dashed">
                  <p className="text-sm text-muted-foreground">
                    No vault folder selected
                  </p>
                </div>
              )}

              <Button
                onClick={handleSelectFolder}
                variant="outline"
                className="w-full"
                disabled={saving}
              >
                <FolderOpen className="w-4 h-4 mr-2" />
                {vaultPath ? "Change Folder" : "Select Folder"}
              </Button>
            </CardContent>
          </Card>

          {/* Initialize Structure */}
          {vaultPath && (
            <Card>
              <CardHeader>
                <CardTitle>Folder Structure</CardTitle>
                <CardDescription>
                  Initialize the recommended folder structure
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="mb-4 p-4 bg-muted rounded-lg font-mono text-sm">
                  <pre>{`SermonVault/
├── sermons/
│   ├── 2024/
│   ├── 2025/
│   └── 2026/
├── attachments/
│   ├── keynote/
│   └── pages/
└── config.json`}</pre>
                </div>

                <Button
                  onClick={handleCreateStructure}
                  variant="outline"
                  className="w-full"
                  disabled={saving}
                >
                  {saving ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Save className="w-4 h-4 mr-2" />
                  )}
                  Create/Verify Structure
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Tags Management */}
          <Card>
            <CardHeader>
              <CardTitle>Tags & Categories</CardTitle>
              <CardDescription>
                Manage tags, locations, and services
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                onClick={() => router.push("/settings/tags")}
                variant="outline"
                className="w-full"
              >
                🏷️ Manage Tags & Categories
              </Button>
            </CardContent>
          </Card>

          {/* About */}
          <Card>
            <CardHeader>
              <CardTitle>About Sermon Vault</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-muted-foreground">
              <p>Version: 1.0.0</p>
              <p>Local-first sermon filing system</p>
              <p>Built with Next.js + Tauri</p>
              <p className="pt-2 border-t">
                All data stored as portable markdown files
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
