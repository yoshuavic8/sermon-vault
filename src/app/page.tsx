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
import { BookOpen, FolderOpen, Search, Settings, FileText } from "lucide-react";
import { SettingsService } from "@/lib/settings";
import { TauriFS } from "@/lib/tauri-fs";
import { toast } from "sonner";
import { Logo } from "@/components/Logo";

export default function Home() {
  const router = useRouter();
  const [vaultPath, setVaultPath] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkVaultPath();
  }, []);

  const checkVaultPath = async () => {
    try {
      const path = await SettingsService.getVaultPath();
      setVaultPath(path);

      // If vault is already configured, redirect to library
      if (path) {
        router.push("/sermons");
      }
    } catch (error) {
      console.error("Failed to load vault path:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectFolder = async () => {
    try {
      const selected = await TauriFS.pickFolder();
      if (selected) {
        await SettingsService.updateVaultPath(selected);
        setVaultPath(selected);
        toast.success("Sermon Vault folder selected");
        // Redirect to library after selecting folder
        router.push("/sermons");
      }
    } catch (error) {
      toast.error("Failed to select folder");
      console.error(error);
    }
  };

  const handleOpenVault = () => {
    router.push("/sermons");
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-vibrant-purple">
        <div className="flex flex-col items-center gap-4 animate-in-smooth">
          <Logo variant="icon" size="lg" className="animate-pulse" />
          <div className="text-white font-bold text-lg drop-shadow-lg">
            Loading...
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-vibrant-purple">
      <div className="container mx-auto px-4 py-16">
        {/* Header */}
        <div className="text-center mb-16 space-y-6 animate-in-smooth">
          <div className="flex justify-center mb-8">
            <div className="icon-gradient-orange w-32 h-32 rounded-3xl backdrop-blur-md flex items-center justify-center shadow-glow-orange">
              <Logo variant="icon" size="xl" />
            </div>
          </div>
          <div className="flex justify-center mb-4">
            <Logo variant="full" size="xl" />
          </div>
          <p className="text-xl text-white/80 max-w-2xl mx-auto font-semibold drop-shadow-lg">
            Your local sermon filing system. Archive, organize, and manage
            sermons with markdown-based storage.
          </p>
        </div>

        {/* Main Action */}
        <div
          className="max-w-2xl mx-auto mb-12 animate-in-smooth"
          style={{ animationDelay: "100ms" }}
        >
          {!vaultPath && (
            <Card className="card-gradient-purple border-0 shadow-glow-purple">
              <CardHeader>
                <CardTitle className="text-2xl text-white font-bold drop-shadow-lg">
                  Welcome to Sermon Vault
                </CardTitle>
                <CardDescription className="text-white/70 font-semibold">
                  Get started by selecting your Sermon Vault folder. This is
                  where all your sermon files will be stored.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button
                  onClick={handleSelectFolder}
                  className="w-full h-12 text-base bg-white text-purple-600 hover:bg-white/90 font-bold shadow-deep hover:shadow-glow-orange hover:scale-105 transition-all duration-500"
                  size="lg"
                >
                  <FolderOpen className="w-5 h-5 mr-2" />
                  Select Sermon Vault Folder
                </Button>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Features */}
        <div
          className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto animate-in-smooth"
          style={{ animationDelay: "200ms" }}
        >
          <Card className="card-gradient-blue border-0 shadow-glow-blue hover-lift hover:scale-105">
            <CardHeader>
              <div className="icon-gradient-blue w-16 h-16 rounded-2xl flex items-center justify-center mb-4">
                <FileText className="w-8 h-8 text-white" />
              </div>
              <CardTitle className="text-lg text-white font-bold drop-shadow-lg">
                Markdown Storage
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-white/80 font-semibold">
                All sermons stored as markdown files with YAML frontmatter.
                Portable, readable, future-proof.
              </p>
            </CardContent>
          </Card>

          <Card className="card-gradient-cyan border-0 shadow-glow-cyan hover-lift hover:scale-105">
            <CardHeader>
              <div className="icon-gradient-cyan w-16 h-16 rounded-2xl flex items-center justify-center mb-4">
                <Search className="w-8 h-8 text-white" />
              </div>
              <CardTitle className="text-lg text-white font-bold drop-shadow-lg">
                Powerful Search
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-white/80 font-semibold">
                Search by title, verses, themes, audience, tags, and dates. Fast
                indexed search.
              </p>
            </CardContent>
          </Card>

          <Card className="card-gradient-green border-0 shadow-glow-green hover-lift hover:scale-105">
            <CardHeader>
              <div className="icon-gradient-green w-16 h-16 rounded-2xl flex items-center justify-center mb-4">
                <BookOpen className="w-8 h-8 text-white" />
              </div>
              <CardTitle className="text-lg text-white font-bold drop-shadow-lg">
                Rich Metadata
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-white/80 font-semibold">
                Track themes, Bible verses, audience, dates preached,
                attachments, and custom notes.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
