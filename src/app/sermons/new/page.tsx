"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Upload, FileUp, Loader2, Plus, X } from "lucide-react";
import { SermonService } from "@/lib/sermon-service";
import { SermonIndexer } from "@/lib/indexer";
import { SettingsService } from "@/lib/settings";
import { VaultDataService } from "@/lib/vault-data-service";
import { FileUtils } from "@/lib/file-utils";
import { TagCloud } from "@/components/TagCloud";
import { SermonMetadata } from "@/lib/types";
import { toast } from "sonner";

export default function ImportSermonPage() {
  const router = useRouter();
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string>("");
  const [importing, setImporting] = useState(false);

  // Auto-extracted metadata
  const [title, setTitle] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);

  // User-input metadata
  const [selectedLocations, setSelectedLocations] = useState<string[]>([]);
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [notes, setNotes] = useState("");

  // Available options
  const [availableTags, setAvailableTags] = useState<string[]>([]);
  const [availableLocations, setAvailableLocations] = useState<string[]>([]);
  const [availableServices, setAvailableServices] = useState<string[]>([]);

  // New inputs
  const [newLocation, setNewLocation] = useState("");
  const [newTag, setNewTag] = useState("");

  useEffect(() => {
    loadVaultData();
  }, []);

  const loadVaultData = async () => {
    const data = await VaultDataService.loadVaultData();
    setAvailableTags(data.tags);
    setAvailableLocations(data.locations);
    setAvailableServices(data.services);
  };

  const handleFileSelect = async () => {
    try {
      const { open } = await import("@tauri-apps/plugin-dialog");

      const selected = await open({
        multiple: false,
        title: "Select Sermon File",
        filters: [
          {
            name: "Sermon Files",
            extensions: FileUtils.getSupportedExtensions(),
          },
        ],
      });

      if (selected && typeof selected === "string") {
        setSelectedFile(selected);
        const name = selected.split("/").pop() || "";
        setFileName(name);

        // Auto-extract metadata from file
        const extracted = await SermonService.extractFileMetadata(selected);
        setTitle(extracted.title);
        setDate(extracted.date);

        toast.success("File selected & metadata extracted");
      }
    } catch (error) {
      console.error("Failed to select file:", error);
      toast.error("Cannot select file");
    }
  };

  const handleAddLocation = async () => {
    if (!newLocation.trim()) return;

    const trimmed = newLocation.trim();
    await VaultDataService.addLocation(trimmed);
    setAvailableLocations([...availableLocations, trimmed].sort());
    setSelectedLocations([...selectedLocations, trimmed]);
    setNewLocation("");
    toast.success("Location added");
  };

  const handleAddTag = async () => {
    if (!newTag.trim()) return;

    const trimmed = newTag.trim();
    await VaultDataService.addTag(trimmed);
    setAvailableTags([...availableTags, trimmed].sort());
    setSelectedTags([...selectedTags, trimmed]);
    setNewTag("");
    toast.success("Tag added");
  };

  const toggleLocation = (location: string) => {
    setSelectedLocations(
      selectedLocations.includes(location)
        ? selectedLocations.filter((l) => l !== location)
        : [...selectedLocations, location],
    );
  };

  const toggleService = (service: string) => {
    setSelectedServices(
      selectedServices.includes(service)
        ? selectedServices.filter((s) => s !== service)
        : [...selectedServices, service],
    );
  };

  const toggleTag = (tag: string) => {
    setSelectedTags(
      selectedTags.includes(tag)
        ? selectedTags.filter((t) => t !== tag)
        : [...selectedTags, tag],
    );
  };

  const handleImport = async () => {
    if (!selectedFile) {
      toast.error("Please select a file");
      return;
    }

    if (!title.trim()) {
      toast.error("Title is required");
      return;
    }

    setImporting(true);
    try {
      const vaultPath = await SettingsService.getVaultPath();
      if (!vaultPath) {
        toast.error("Vault not configured");
        router.push("/");
        return;
      }

      const metadata: SermonMetadata = {
        id: FileUtils.generateSermonId(),
        title: title.trim(),
        date,
        deliveries:
          selectedLocations.length > 0 && selectedServices.length > 0
            ? selectedLocations.map((location) => ({
                date,
                location,
                services: selectedServices,
              }))
            : [],
        tags: selectedTags.length > 0 ? selectedTags : undefined,
        notes: notes.trim() || undefined,
      };

      console.log("Import metadata:", {
        locations: selectedLocations,
        services: selectedServices,
        deliveries: metadata.deliveries,
      });

      await SermonService.importSermon(vaultPath, selectedFile, metadata);

      // Rebuild index so new sermon appears in list
      console.log("Rebuilding index after import...");
      await SermonIndexer.buildIndex(vaultPath);

      toast.success("Sermon imported successfully!");
      router.push("/sermons");
    } catch (error) {
      console.error("Failed to import sermon:", error);
      toast.error("Cannot import sermon");
    } finally {
      setImporting(false);
    }
  };

  return (
    <div className="min-h-screen bg-vibrant-purple">
      <div className="container mx-auto px-4 py-8 max-w-3xl">
        <div className="flex items-center gap-4 mb-8">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.push("/sermons")}
            className="backdrop-blur-md bg-white/10 hover:bg-white/20 text-white"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-4xl font-bold text-white drop-shadow-xl">
              Import Sermon
            </h1>
            <p className="text-white/80 font-semibold">
              Upload and organize your sermon files
            </p>
          </div>
        </div>

        <div className="space-y-6">
          {/* File Upload Section */}
          <Card className="card-gradient-purple border-0 shadow-glow-purple">
            <CardHeader>
              <CardTitle className="text-2xl font-bold text-white drop-shadow-lg flex items-center gap-2">
                📎 Select File
              </CardTitle>
              <CardDescription className="text-white/70 font-semibold">
                File metadata (title, date) will be extracted automatically
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button
                onClick={handleFileSelect}
                variant="outline"
                className="w-full h-24 border-dashed border-2 border-white/30 hover:border-white/50 backdrop-blur-md bg-white/10 hover:bg-white/20 text-white font-bold"
              >
                <div className="flex flex-col items-center gap-2">
                  <FileUp className="w-8 h-8" />
                  <span>{fileName || "Click to select sermon file"}</span>
                </div>
              </Button>

              {selectedFile && (
                <div className="p-4 bg-white/20 backdrop-blur-md rounded-lg border border-white/30">
                  <div className="flex items-start gap-3">
                    <div className="text-3xl">
                      {FileUtils.getFileIcon(FileUtils.getFileType(fileName))}
                    </div>
                    <div className="flex-1">
                      <p className="font-bold text-white">{title}</p>
                      <p className="text-sm text-white/70 font-semibold">
                        {FileUtils.getFileTypeName(
                          FileUtils.getFileType(fileName),
                        )}{" "}
                        • {date}
                      </p>
                      <p className="text-xs text-white/60 mt-1">{fileName}</p>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Simplified Metadata Form */}
          {selectedFile && (
            <Card className="card-gradient-blue border-0 shadow-glow-blue">
              <CardHeader>
                <CardTitle className="text-2xl font-bold text-white drop-shadow-lg flex items-center gap-2">
                  🏛️ Locations
                </CardTitle>
                <CardDescription className="text-white/70 font-semibold">
                  Where was this sermon delivered? (can select multiple)
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <TagCloud
                  availableTags={availableLocations}
                  selectedTags={selectedLocations}
                  onToggle={toggleLocation}
                />

                {/* Add New Location */}
                <div className="flex gap-2 pt-2 border-t border-white/20">
                  <Input
                    placeholder="Add new location..."
                    value={newLocation}
                    onChange={(e) => setNewLocation(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleAddLocation();
                    }}
                    className="backdrop-blur-md bg-white/10 border-white/30 text-white placeholder:text-white/50"
                  />
                  <Button
                    onClick={handleAddLocation}
                    size="icon"
                    className="bg-white/20 hover:bg-white/30 text-white border-white/30"
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>

                {selectedLocations.length > 0 && (
                  <div className="flex gap-2 flex-wrap pt-2">
                    <span className="text-sm text-white/70 font-semibold">
                      Selected:
                    </span>
                    {selectedLocations.map((loc) => (
                      <Badge
                        key={loc}
                        variant="default"
                        className="gap-1 bg-white/20 hover:bg-white/30 border-white/30 text-white backdrop-blur-md font-bold"
                      >
                        {loc}
                        <X
                          className="w-3 h-3 cursor-pointer hover:text-red-300"
                          onClick={() => toggleLocation(loc)}
                        />
                      </Badge>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {selectedFile && (
            <Card className="card-gradient-cyan border-0 shadow-glow-cyan">
              <CardHeader>
                <CardTitle className="text-2xl font-bold text-white drop-shadow-lg flex items-center gap-2">
                  ⛪ Services
                </CardTitle>
                <CardDescription className="text-white/70 font-semibold">
                  Select all services where this sermon was preached
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex flex-wrap gap-2">
                  {availableServices.map((svc) => (
                    <Badge
                      key={svc}
                      variant={
                        selectedServices.includes(svc) ? "default" : "outline"
                      }
                      className={`cursor-pointer hover:scale-105 transition-all font-bold ${
                        selectedServices.includes(svc)
                          ? "bg-white text-cyan-600 hover:bg-white/90"
                          : "bg-white/10 text-white border-white/30 hover:bg-white/20"
                      }`}
                      onClick={() => toggleService(svc)}
                    >
                      {svc}
                    </Badge>
                  ))}
                </div>

                {selectedServices.length > 0 && (
                  <div className="pt-2 border-t border-white/20">
                    <p className="text-sm text-white/70 mb-2 font-semibold">
                      Selected:
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {selectedServices.map((svc) => (
                        <Badge
                          key={svc}
                          variant="secondary"
                          className="bg-white/20 text-white border-white/30 backdrop-blur-md font-bold"
                        >
                          {svc}
                          <button
                            onClick={() => toggleService(svc)}
                            className="ml-1 hover:text-red-300"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {selectedFile && (
            <Card className="card-gradient-green border-0 shadow-glow-cyan">
              <CardHeader>
                <CardTitle className="text-2xl font-bold text-white drop-shadow-lg flex items-center gap-2">
                  🏷️ Tags
                </CardTitle>
                <CardDescription className="text-white/70 font-semibold">
                  Click tags to add them (helps with searching later)
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <TagCloud
                  availableTags={availableTags}
                  selectedTags={selectedTags}
                  onToggle={toggleTag}
                />

                {/* Add New Tag */}
                <div className="flex gap-2 pt-2 border-t border-white/20">
                  <Input
                    placeholder="Add new tag..."
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleAddTag();
                    }}
                    className="backdrop-blur-md bg-white/10 border-white/30 text-white placeholder:text-white/50"
                  />
                  <Button
                    onClick={handleAddTag}
                    size="icon"
                    className="bg-white/20 hover:bg-white/30 text-white border-white/30"
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>

                {selectedTags.length > 0 && (
                  <div className="flex gap-2 flex-wrap pt-2">
                    <span className="text-sm text-white/70 font-semibold">
                      Selected:
                    </span>
                    {selectedTags.map((tag) => (
                      <Badge
                        key={tag}
                        variant="default"
                        className="gap-1 bg-white/20 hover:bg-white/30 border-white/30 text-white backdrop-blur-md font-bold"
                      >
                        {tag}
                        <X
                          className="w-3 h-3 cursor-pointer hover:text-red-300"
                          onClick={() => toggleTag(tag)}
                        />
                      </Badge>
                    ))}
                  </div>
                )}

                <div className="pt-2 text-xs text-white/60 font-semibold">
                  💡 Tip: You can manage all tags from Settings
                </div>
              </CardContent>
            </Card>
          )}

          {selectedFile && (
            <Card className="card-gradient-orange border-0 shadow-glow-orange">
              <CardHeader>
                <CardTitle className="text-2xl font-bold text-white drop-shadow-lg flex items-center gap-2">
                  📝 Notes (Optional)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Any additional notes about this sermon..."
                  rows={4}
                  className="backdrop-blur-md bg-white/10 border-white/30 text-white placeholder:text-white/50"
                />
              </CardContent>
            </Card>
          )}

          {/* Actions */}
          <div className="flex gap-3 justify-end">
            <Button
              variant="outline"
              onClick={() => router.push("/sermons")}
              disabled={importing}
              className="backdrop-blur-md bg-white/20 hover:bg-white/30 border-white/30 text-white font-semibold"
            >
              Cancel
            </Button>
            <Button
              onClick={handleImport}
              disabled={importing || !selectedFile}
              className="gap-2 bg-white text-purple-600 hover:bg-white/90 font-bold shadow-deep hover:shadow-glow-purple hover:scale-105 transition-all duration-500"
            >
              {importing ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Importing...
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4 mr-2" />
                  Import Sermon
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
