"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Sermon } from "@/lib/types";
import { SermonService } from "@/lib/sermon-service";
import { SermonIndexer } from "@/lib/indexer";
import { SettingsService } from "@/lib/settings";
import { TauriFS } from "@/lib/tauri-fs";
import { FileUtils } from "@/lib/file-utils";
import { MetadataEditor } from "@/components/MetadataEditor";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ArrowLeft,
  Save,
  FileText,
  ExternalLink,
  Loader2,
  MapPin,
  Calendar,
  Users,
  Clock,
} from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";

function SermonDetailContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const sermonId = searchParams.get("id");

  const [sermon, setSermon] = useState<Sermon | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (sermonId) {
      loadSermon();
    }
  }, [sermonId]);

  const loadSermon = async () => {
    if (!sermonId) return;

    try {
      const vaultPath = await SettingsService.getVaultPath();
      if (!vaultPath) {
        toast.error("Vault not configured");
        router.push("/");
        return;
      }

      // Load index and find sermon by ID
      const index = await SermonIndexer.loadIndex(vaultPath);
      if (!index) {
        toast.error("No sermons found");
        router.push("/sermons");
        return;
      }

      const foundSermon = index.sermons.find((s) => s.id === sermonId);

      if (!foundSermon) {
        toast.error("Sermon not found");
        router.push("/sermons");
        return;
      }

      setSermon(foundSermon);
    } catch (error) {
      toast.error("Failed to load sermon");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!sermon) return;

    setSaving(true);
    try {
      await SermonService.updateMetadata(sermon.metadataPath, sermon.metadata);

      // Rebuild index to update cache
      const vaultPath = await SettingsService.getVaultPath();
      if (vaultPath) {
        await SermonIndexer.buildIndex(vaultPath);
      }

      // Reload sermon to get fresh data
      await loadSermon();

      toast.success("Sermon updated successfully");
    } catch (error) {
      toast.error("Failed to save sermon");
      console.error(error);
    } finally {
      setSaving(false);
    }
  };

  const handleOpenFile = async () => {
    if (!sermon) return;

    try {
      await TauriFS.openWithDefault(sermon.filePath);
    } catch (error) {
      toast.error("Failed to open file");
      console.error(error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-vibrant-purple">
        <div className="text-center space-y-4 animate-in-smooth">
          <Loader2 className="w-10 h-10 animate-spin text-white mx-auto" />
          <p className="text-white text-lg font-bold drop-shadow-lg">
            Loading sermon...
          </p>
        </div>
      </div>
    );
  }

  if (!sermon) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-vibrant-purple">
        <div className="text-center space-y-6 animate-in-smooth">
          <div className="icon-gradient-pink w-24 h-24 rounded-3xl mx-auto flex items-center justify-center">
            <FileText className="w-12 h-12 text-white" />
          </div>
          <div>
            <p className="text-white text-lg mb-4 font-bold drop-shadow-lg">
              Sermon not found
            </p>
            <Button
              onClick={() => router.push("/sermons")}
              className="bg-white text-purple-600 hover:bg-white/90 font-bold shadow-deep hover:shadow-glow-pink hover:scale-105"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Library
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const fileIcon = FileUtils.getFileIcon(sermon.fileType);
  const fileTypeName = FileUtils.getFileTypeName(sermon.fileType);

  return (
    <div className="min-h-screen bg-vibrant-purple">
      <div className="container mx-auto px-6 py-12 max-w-5xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-12 animate-in-smooth">
          <div className="flex items-center gap-6">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => router.push("/sermons")}
              className="hover-lift backdrop-blur-md bg-white/10 hover:bg-white/20 text-white"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div className="flex items-start gap-4">
              <div className="text-5xl transform hover:scale-110 transition-transform duration-500">
                {fileIcon}
              </div>
              <div>
                <h1 className="text-5xl font-bold tracking-tight text-white drop-shadow-xl">
                  {sermon.metadata.title}
                </h1>
                <p className="text-base text-white/80 mt-2 font-semibold">
                  {fileTypeName}
                </p>
              </div>
            </div>
          </div>
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={handleOpenFile}
              className="gap-2 backdrop-blur-md bg-white/20 hover:bg-white/30 border-white/30 text-white font-semibold hover-lift shadow-deep hover:scale-105"
            >
              <FileText className="w-4 h-4" />
              Open File
            </Button>

            <Button
              onClick={handleSave}
              disabled={saving}
              className="gap-2 bg-white text-purple-600 hover:bg-white/90 font-bold shadow-deep hover:shadow-glow-purple hover:scale-105 transition-all duration-500"
            >
              {saving ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              {saving ? "Saving..." : "Save"}
            </Button>
          </div>
        </div>

        {/* Quick Info Card */}
        <Card
          className="card-gradient-pink mb-10 shadow-glow-pink hover-lift border-0 animate-in-smooth"
          style={{ animationDelay: "100ms" }}
        >
          <CardHeader className="pb-6">
            <CardTitle className="text-2xl flex items-center gap-3 text-white font-bold drop-shadow-lg">
              <div className="icon-gradient-purple w-12 h-12 rounded-xl flex items-center justify-center">
                <FileText className="h-5 w-5 text-white" />
              </div>
              Sermon Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-2 gap-6">
              <div className="flex items-center gap-3 p-3 rounded-xl bg-white/20 backdrop-blur-md border border-white/30">
                <div className="icon-gradient-cyan w-10 h-10 rounded-lg flex items-center justify-center">
                  <Calendar className="w-4 h-4 text-white" />
                </div>
                <span className="font-semibold text-white">
                  {sermon.metadata.date
                    ? format(new Date(sermon.metadata.date), "MMMM dd, yyyy")
                    : "No date"}
                </span>
              </div>
            </div>

            {/* Delivery Sessions */}
            {sermon.metadata.deliveries &&
              sermon.metadata.deliveries.length > 0 && (
                <div>
                  <p className="text-sm font-bold text-white/90 mb-4 flex items-center gap-2">
                    <Clock className="w-4 h-4 text-white" />
                    Delivery Sessions:
                  </p>
                  <div className="grid gap-4 md:grid-cols-2">
                    {sermon.metadata.deliveries.map((delivery, idx) => (
                      <div
                        key={idx}
                        className="backdrop-blur-md bg-white/15 p-4 rounded-xl border border-white/30 hover:border-white/50 hover-lift space-y-3"
                      >
                        <div className="flex items-center gap-2.5 text-sm">
                          <div className="icon-gradient-blue w-8 h-8 rounded-lg flex items-center justify-center">
                            <Calendar className="w-3.5 h-3.5 text-white" />
                          </div>
                          <span className="font-bold text-white">
                            {delivery.date || "No date"}
                          </span>
                        </div>
                        <div className="flex items-center gap-2.5 text-sm text-white/80">
                          <div className="icon-gradient-cyan w-8 h-8 rounded-lg flex items-center justify-center">
                            <MapPin className="w-3.5 h-3.5 text-white" />
                          </div>
                          <span className="font-semibold">
                            {delivery.location || "No location"}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-sm flex-wrap">
                          <div className="icon-gradient-purple w-8 h-8 rounded-lg flex items-center justify-center">
                            <Clock className="w-3.5 h-3.5 text-white" />
                          </div>
                          {delivery.services && delivery.services.length > 0 ? (
                            delivery.services.map((service, sIdx) => (
                              <Badge
                                key={sIdx}
                                variant="outline"
                                className="text-xs backdrop-blur-sm bg-white/20 border-white/30 text-white font-semibold"
                              >
                                {service}
                              </Badge>
                            ))
                          ) : (
                            <span className="text-white/70">No services</span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
          </CardContent>
        </Card>

        {/* Metadata Editor */}
        <MetadataEditor
          metadata={sermon.metadata}
          onChange={(updated) => setSermon({ ...sermon, metadata: updated })}
          onSave={handleSave}
        />

        {/* Notes Section */}
        {sermon.metadata.notes && (
          <Card className="mt-8">
            <CardHeader>
              <CardTitle>Notes</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm whitespace-pre-wrap">
                {sermon.metadata.notes}
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

export default function SermonDetailPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-screen">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      }
    >
      <SermonDetailContent />
    </Suspense>
  );
}
