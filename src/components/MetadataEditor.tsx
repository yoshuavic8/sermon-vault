import { SermonMetadata, DeliverySession } from "@/lib/types";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { X, Plus, Calendar, MapPin, Users } from "lucide-react";
import { useState, useEffect } from "react";
import { format } from "date-fns";
import { VaultDataService } from "@/lib/vault-data-service";

interface MetadataEditorProps {
  metadata: SermonMetadata;
  onChange: (metadata: SermonMetadata) => void;
  onSave?: () => void;
}

export function MetadataEditor({
  metadata,
  onChange,
  onSave,
}: MetadataEditorProps) {
  const [newReference, setNewReference] = useState("");
  const [newTag, setNewTag] = useState("");

  // For new delivery session
  const [newDeliveryDate, setNewDeliveryDate] = useState("");
  const [newDeliveryLocation, setNewDeliveryLocation] = useState("");
  const [newDeliveryServices, setNewDeliveryServices] = useState<string[]>([]);

  // Available services from vault data
  const [availableServices, setAvailableServices] = useState<string[]>([]);

  // Load vault data on mount
  useEffect(() => {
    const loadVaultData = async () => {
      const data = await VaultDataService.loadVaultData();
      setAvailableServices(data.services);
    };
    loadVaultData();
  }, []);

  const updateMetadata = (updates: Partial<SermonMetadata>) => {
    onChange({ ...metadata, ...updates });
  };

  const addItem = (
    field: keyof SermonMetadata,
    value: string,
    setter: (v: string) => void,
  ) => {
    if (!value.trim()) return;
    const current = (metadata[field] as string[]) || [];
    if (!current.includes(value.trim())) {
      updateMetadata({ [field]: [...current, value.trim()] });
    }
    setter("");
  };

  const removeItem = (field: keyof SermonMetadata, index: number) => {
    const current = (metadata[field] as string[]) || [];
    updateMetadata({ [field]: current.filter((_, i) => i !== index) });
  };

  const addDelivery = () => {
    if (
      !newDeliveryDate ||
      !newDeliveryLocation ||
      newDeliveryServices.length === 0
    ) {
      return;
    }

    const newDelivery: DeliverySession = {
      date: newDeliveryDate,
      location: newDeliveryLocation.trim(),
      services: newDeliveryServices,
    };

    const currentDeliveries = metadata.deliveries || [];
    updateMetadata({ deliveries: [...currentDeliveries, newDelivery] });

    // Clear inputs
    setNewDeliveryDate("");
    setNewDeliveryLocation("");
    setNewDeliveryServices([]);
  };

  const removeDelivery = (index: number) => {
    const currentDeliveries = metadata.deliveries || [];
    updateMetadata({
      deliveries: currentDeliveries.filter((_, i) => i !== index),
    });
  };

  return (
    <div className="space-y-6">
      {/* Basic Info */}
      <Card>
        <CardHeader>
          <CardTitle>Basic Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              value={metadata.title}
              onChange={(e) => updateMetadata({ title: e.target.value })}
              className="mt-1"
            />
          </div>

          <div>
            <Label htmlFor="id">ID</Label>
            <Input
              id="id"
              value={metadata.id}
              disabled
              className="mt-1 bg-muted"
            />
          </div>

          <div>
            <Label htmlFor="date">Primary Date *</Label>
            <Input
              id="date"
              type="date"
              value={metadata.date}
              onChange={(e) => updateMetadata({ date: e.target.value })}
              className="mt-1"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Main date for this sermon (for indexing)
            </p>
          </div>

          <div>
            <Label htmlFor="series">Series (optional)</Label>
            <Input
              id="series"
              value={metadata.series || ""}
              onChange={(e) =>
                updateMetadata({ series: e.target.value || undefined })
              }
              placeholder="e.g., Seri Natal 2024"
              className="mt-1"
            />
          </div>
        </CardContent>
      </Card>

      {/* Delivery Sessions */}
      <Card>
        <CardHeader>
          <CardTitle>📍 Delivery Sessions</CardTitle>
          <p className="text-sm text-muted-foreground mt-1">
            Tambah setiap kali kotbah ini dibawakan (tanggal + tempat + ibadah
            sebagai satu kesatuan)
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Add New Delivery Form */}
          <div className="border rounded-lg p-4 space-y-3 bg-muted/50">
            <div className="grid grid-cols-3 gap-3">
              <div>
                <Label htmlFor="delivery-date" className="text-xs">
                  Tanggal *
                </Label>
                <Input
                  id="delivery-date"
                  type="date"
                  value={newDeliveryDate}
                  onChange={(e) => setNewDeliveryDate(e.target.value)}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="delivery-location" className="text-xs">
                  Tempat *
                </Label>
                <Input
                  id="delivery-location"
                  value={newDeliveryLocation}
                  onChange={(e) => setNewDeliveryLocation(e.target.value)}
                  placeholder="e.g., GBI Haleluya"
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="delivery-service" className="text-xs">
                  Ibadah * (bisa pilih lebih dari satu)
                </Label>
                <div className="flex flex-wrap gap-2 mt-1">
                  {availableServices.map((service) => (
                    <Badge
                      key={service}
                      variant={
                        newDeliveryServices.includes(service)
                          ? "default"
                          : "outline"
                      }
                      className="cursor-pointer hover:bg-primary/80 transition-colors"
                      onClick={() => {
                        if (newDeliveryServices.includes(service)) {
                          setNewDeliveryServices(
                            newDeliveryServices.filter((s) => s !== service),
                          );
                        } else {
                          setNewDeliveryServices([
                            ...newDeliveryServices,
                            service,
                          ]);
                        }
                      }}
                    >
                      {service}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
            <Button
              type="button"
              onClick={addDelivery}
              size="sm"
              className="w-full"
              disabled={
                !newDeliveryDate ||
                !newDeliveryLocation ||
                newDeliveryServices.length === 0
              }
            >
              <Plus className="w-4 h-4 mr-2" />
              Tambah Delivery Session
            </Button>
          </div>

          {/* List of Deliveries */}
          {metadata.deliveries && metadata.deliveries.length > 0 && (
            <div className="space-y-2">
              {metadata.deliveries.map((delivery, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between border rounded-lg p-3 bg-background"
                >
                  <div className="flex items-center gap-4 flex-1">
                    <div className="flex items-center gap-2 text-sm">
                      <Calendar className="w-4 h-4 text-primary" />
                      <span className="font-medium">
                        {format(new Date(delivery.date), "MMM dd, yyyy")}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <MapPin className="w-4 h-4 text-primary" />
                      <span>{delivery.location}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm flex-wrap">
                      <Users className="w-4 h-4 text-primary" />
                      {delivery.services && delivery.services.length > 0 ? (
                        delivery.services.map((service, sIdx) => (
                          <Badge key={sIdx} variant="outline">
                            {service}
                          </Badge>
                        ))
                      ) : (
                        <span className="text-muted-foreground text-xs">
                          No services
                        </span>
                      )}
                    </div>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeDelivery(idx)}
                    className="text-destructive hover:text-destructive"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}

          {(!metadata.deliveries || metadata.deliveries.length === 0) && (
            <p className="text-sm text-muted-foreground text-center py-4">
              Belum ada delivery session. Tambah kombinasi tanggal + tempat +
              ibadah di atas.
            </p>
          )}
        </CardContent>
      </Card>

      {/* Bible References */}
      <Card>
        <CardHeader>
          <CardTitle>📖 Bible References</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex gap-2">
            <Input
              value={newReference}
              onChange={(e) => setNewReference(e.target.value)}
              onKeyDown={(e) =>
                e.key === "Enter" &&
                (e.preventDefault(),
                addItem("references", newReference, setNewReference))
              }
              placeholder="e.g., John 3:16"
            />
            <Button
              type="button"
              onClick={() =>
                addItem("references", newReference, setNewReference)
              }
              size="sm"
            >
              <Plus className="w-4 h-4" />
            </Button>
          </div>
          <div className="flex flex-wrap gap-2">
            {metadata.references?.map((verse: string, idx: number) => (
              <Badge
                key={idx}
                variant="outline"
                className="flex items-center gap-1"
              >
                {verse}
                <button
                  onClick={() => removeItem("references", idx)}
                  className="hover:text-destructive"
                >
                  <X className="w-3 h-3" />
                </button>
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Tags */}
      <Card>
        <CardHeader>
          <CardTitle>Tags</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex gap-2">
            <Input
              value={newTag}
              onChange={(e) => setNewTag(e.target.value)}
              onKeyDown={(e) =>
                e.key === "Enter" &&
                (e.preventDefault(), addItem("tags", newTag, setNewTag))
              }
              placeholder="Add tag"
            />
            <Button
              type="button"
              onClick={() => addItem("tags", newTag, setNewTag)}
              size="sm"
            >
              <Plus className="w-4 h-4" />
            </Button>
          </div>
          <div className="flex flex-wrap gap-2">
            {metadata.tags?.map((tag, idx) => (
              <Badge
                key={idx}
                variant="secondary"
                className="flex items-center gap-1"
              >
                {tag}
                <button
                  onClick={() => removeItem("tags", idx)}
                  className="hover:text-destructive"
                >
                  <X className="w-3 h-3" />
                </button>
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Notes */}
      <Card>
        <CardHeader>
          <CardTitle>📝 Notes</CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea
            id="notes"
            value={metadata.notes || ""}
            onChange={(e) =>
              updateMetadata({ notes: e.target.value || undefined })
            }
            placeholder="Additional notes or remarks..."
            rows={4}
          />
        </CardContent>
      </Card>

      {onSave && (
        <div className="flex justify-end">
          <Button onClick={onSave} size="lg" className="w-full sm:w-auto">
            Save Changes
          </Button>
        </div>
      )}
    </div>
  );
}
