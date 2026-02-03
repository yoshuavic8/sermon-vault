"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Plus, X } from "lucide-react";
import { VaultDataService } from "@/lib/vault-data-service";
import { toast } from "sonner";

export default function TagsManagementPage() {
  const router = useRouter();

  const [tags, setTags] = useState<string[]>([]);
  const [locations, setLocations] = useState<string[]>([]);
  const [services, setServices] = useState<string[]>([]);

  const [newTag, setNewTag] = useState("");
  const [newLocation, setNewLocation] = useState("");
  const [newService, setNewService] = useState("");

  const loadData = async () => {
    const data = await VaultDataService.loadVaultData();
    setTags(data.tags);
    setLocations(data.locations);
    setServices(data.services);
  };

  useEffect(() => {
    // Load initial data on mount
    const initData = async () => {
      const data = await VaultDataService.loadVaultData();
      setTags(data.tags);
      setLocations(data.locations);
      setServices(data.services);
    };
    initData();
  }, []);

  // Tags
  const handleAddTag = async () => {
    if (!newTag.trim()) return;

    await VaultDataService.addTag(newTag.trim());
    await loadData();
    setNewTag("");
    toast.success("Tag added");
  };

  const handleRemoveTag = async (tag: string) => {
    await VaultDataService.removeTag(tag);
    await loadData();
    toast.success("Tag removed");
  };

  // Locations
  const handleAddLocation = async () => {
    if (!newLocation.trim()) return;

    await VaultDataService.addLocation(newLocation.trim());
    await loadData();
    setNewLocation("");
    toast.success("Location added");
  };

  const handleRemoveLocation = async (location: string) => {
    await VaultDataService.removeLocation(location);
    await loadData();
    toast.success("Location removed");
  };

  // Services
  const handleAddService = async () => {
    if (!newService.trim()) return;

    await VaultDataService.addService(newService.trim());
    await loadData();
    setNewService("");
    toast.success("Service added");
  };

  const handleRemoveService = async (service: string) => {
    await VaultDataService.removeService(service);
    await loadData();
    toast.success("Service removed");
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-background via-background to-primary/5">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="flex items-center gap-4 mb-8">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.push("/settings")}
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Manage Tags & Categories</h1>
            <p className="text-muted-foreground">
              Organize your sermon metadata
            </p>
          </div>
        </div>

        <div className="space-y-6">
          {/* Tags */}
          <Card>
            <CardHeader>
              <CardTitle>🏷️ Tags</CardTitle>
              <CardDescription>
                Tags help you categorize and find sermons easily
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Input
                  placeholder="Add new tag..."
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleAddTag();
                  }}
                />
                <Button onClick={handleAddTag}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add
                </Button>
              </div>

              <div className="flex flex-wrap gap-2 pt-4 border-t">
                {tags.map((tag) => (
                  <Badge
                    key={tag}
                    variant="secondary"
                    className="px-3 py-2 text-sm gap-2"
                  >
                    {tag}
                    <button
                      onClick={() => handleRemoveTag(tag)}
                      className="hover:text-destructive"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </Badge>
                ))}
                {tags.length === 0 && (
                  <p className="text-sm text-muted-foreground">No tags yet</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Locations */}
          <Card>
            <CardHeader>
              <CardTitle>🏛️ Locations</CardTitle>
              <CardDescription>
                Churches or venues where sermons are delivered
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Input
                  placeholder="Add new location..."
                  value={newLocation}
                  onChange={(e) => setNewLocation(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleAddLocation();
                  }}
                />
                <Button onClick={handleAddLocation}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add
                </Button>
              </div>

              <div className="flex flex-wrap gap-2 pt-4 border-t">
                {locations.map((location) => (
                  <Badge
                    key={location}
                    variant="secondary"
                    className="px-3 py-2 text-sm gap-2"
                  >
                    {location}
                    <button
                      onClick={() => handleRemoveLocation(location)}
                      className="hover:text-destructive"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </Badge>
                ))}
                {locations.length === 0 && (
                  <p className="text-sm text-muted-foreground">
                    No locations yet
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Services */}
          <Card>
            <CardHeader>
              <CardTitle>⛪ Services</CardTitle>
              <CardDescription>
                Types of church services (Raya 1, Youth, Kids, etc.)
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Input
                  placeholder="Add new service..."
                  value={newService}
                  onChange={(e) => setNewService(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleAddService();
                  }}
                />
                <Button onClick={handleAddService}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add
                </Button>
              </div>

              <div className="flex flex-wrap gap-2 pt-4 border-t">
                {services.map((service) => (
                  <Badge
                    key={service}
                    variant="secondary"
                    className="px-3 py-2 text-sm gap-2"
                  >
                    {service}
                    <button
                      onClick={() => handleRemoveService(service)}
                      className="hover:text-destructive"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </Badge>
                ))}
                {services.length === 0 && (
                  <p className="text-sm text-muted-foreground">
                    No services yet
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
