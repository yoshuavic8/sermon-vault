"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Sermon, SearchFilters } from "@/lib/types";
import { SermonIndexer } from "@/lib/indexer";
import { SettingsService } from "@/lib/settings";
import { SearchBar } from "@/components/SearchBar";
import { SermonCard } from "@/components/SermonCard";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Logo } from "@/components/Logo";
import {
  BookOpen,
  Plus,
  RefreshCw,
  Settings,
  Loader2,
  BarChart3,
} from "lucide-react";
import { toast } from "sonner";

export default function SermonsPage() {
  const router = useRouter();
  const [sermons, setSermons] = useState<Sermon[]>([]);
  const [filteredSermons, setFilteredSermons] = useState<Sermon[]>([]);
  const [loading, setLoading] = useState(true);
  const [indexing, setIndexing] = useState(false);
  const [vaultPath, setVaultPath] = useState<string | null>(null);

  useEffect(() => {
    loadSermons();
  }, []);

  const loadSermons = async () => {
    try {
      const path = await SettingsService.getVaultPath();

      if (!path) {
        toast.error("No vault configured");
        router.push("/");
        return;
      }

      setVaultPath(path);

      // Try to load cached index
      const index = await SermonIndexer.loadIndex(path);

      // If no cache or cache is old (> 1 hour), rebuild
      if (!index || Date.now() - index.lastScanned > 3600000) {
        await handleRebuildIndex(path);
      } else {
        setSermons(index.sermons);
        setFilteredSermons(index.sermons);
      }
    } catch (error) {
      toast.error("Failed to load sermons");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleRebuildIndex = async (path?: string) => {
    const targetPath = path || vaultPath;
    if (!targetPath) return;

    setIndexing(true);
    try {
      const index = await SermonIndexer.buildIndex(targetPath);
      setSermons(index.sermons);
      setFilteredSermons(index.sermons);
      toast.success(`Indexed ${index.totalCount} sermons`);
    } catch (error) {
      toast.error("Failed to rebuild index");
      console.error(error);
    } finally {
      setIndexing(false);
    }
  };

  const handleSearch = (query: string) => {
    if (!query.trim()) {
      setFilteredSermons(sermons);
      return;
    }

    const filters: SearchFilters = { query: query.toLowerCase() };
    const results = SermonIndexer.searchSermons(sermons, filters);
    setFilteredSermons(results);
  };

  const handleSermonClick = (sermon: Sermon) => {
    router.push(`/sermons/detail?id=${encodeURIComponent(sermon.metadata.id)}`);
  };

  const handleNewSermon = () => {
    router.push("/sermons/new");
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center space-y-4 animate-in-smooth">
          <Loader2 className="w-10 h-10 animate-spin text-primary mx-auto" />
          <p className="text-muted-foreground text-lg">Loading sermons...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-vibrant-purple">
      <div className="container mx-auto px-6 py-12">
        {/* Header */}
        <div className="flex items-center justify-between mb-12 animate-in-smooth">
          <div className="flex items-center gap-4">
            <div className="icon-gradient-purple w-20 h-20 rounded-2xl flex items-center justify-center shadow-glow-purple p-2">
              <Logo variant="icon" size="lg" />
            </div>
            <div>
              <h1 className="text-5xl font-bold tracking-tight text-white drop-shadow-xl">
                Sermon Library
              </h1>
              <p className="text-base text-white/80 mt-1 font-semibold">
                {sermons.length} sermon{sermons.length !== 1 ? "s" : ""} total
                {filteredSermons.length !== sermons.length &&
                  ` • ${filteredSermons.length} filtered`}
              </p>
            </div>
          </div>

          <div className="flex gap-3">
            <Button
              onClick={() => handleRebuildIndex()}
              variant="outline"
              disabled={indexing}
              className="gap-2 backdrop-blur-md bg-white/20 hover:bg-white/30 border-white/30 text-white font-semibold hover-lift shadow-deep hover:scale-105"
            >
              {indexing ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <RefreshCw className="w-4 h-4" />
              )}
              {indexing ? "Indexing..." : "Rescan"}
            </Button>

            <Button
              onClick={handleNewSermon}
              className="gap-2 bg-white text-purple-600 hover:bg-white/90 font-bold shadow-deep hover:shadow-glow-purple hover:scale-105 transition-all duration-500"
            >
              <Plus className="w-4 h-4" />
              New Sermon
            </Button>

            <Button
              onClick={() => router.push("/statistics")}
              variant="outline"
              className="gap-2 backdrop-blur-md bg-white/20 hover:bg-white/30 border-white/30 text-white font-semibold hover-lift shadow-deep hover:scale-105"
            >
              <BarChart3 className="w-4 h-4" />
              Statistics
            </Button>

            <Button
              onClick={() => router.push("/settings")}
              variant="ghost"
              size="icon"
              className="hover-lift backdrop-blur-md bg-white/10 hover:bg-white/20 text-white"
            >
              <Settings className="w-5 h-5" />
            </Button>
          </div>
        </div>

        {/* Search Bar */}
        <div
          className="mb-10 animate-in-smooth"
          style={{ animationDelay: "100ms" }}
        >
          <SearchBar
            onSearch={handleSearch}
            placeholder="Search by title, theme, verse, tag..."
          />
        </div>

        {/* Sermon Grid */}
        {filteredSermons.length === 0 ? (
          <Card className="card-gradient-purple p-16 text-center shadow-glow-purple animate-in-smooth border-0">
            <div className="flex flex-col items-center gap-6">
              <div className="icon-gradient-pink w-24 h-24 rounded-3xl flex items-center justify-center p-3">
                <Logo variant="icon" size="xl" />
              </div>
              <div>
                <h3 className="text-2xl font-bold mb-3 text-white drop-shadow-lg">
                  {sermons.length === 0 ? "No sermons yet" : "No results found"}
                </h3>
                <p className="text-white/70 text-lg mb-6 font-semibold">
                  {sermons.length === 0
                    ? "Create your first sermon to get started"
                    : "Try adjusting your search terms"}
                </p>
                {sermons.length === 0 && (
                  <Button
                    onClick={handleNewSermon}
                    size="lg"
                    className="gap-2 bg-white text-purple-600 hover:bg-white/90 font-bold shadow-deep hover:shadow-glow-pink hover:scale-105 transition-all duration-500"
                  >
                    <Plus className="w-5 h-5" />
                    Create First Sermon
                  </Button>
                )}
              </div>
            </div>
          </Card>
        ) : (
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {filteredSermons.map((sermon, idx) => (
              <div
                key={sermon.metadata.id}
                style={{ animationDelay: `${idx * 50}ms` }}
              >
                <SermonCard sermon={sermon} onClick={handleSermonClick} />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
