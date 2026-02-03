import { Badge } from "./ui/badge";
import { X } from "lucide-react";

interface TagCloudProps {
  availableTags: string[];
  selectedTags: string[];
  onToggle: (tag: string) => void;
  onRemove?: (tag: string) => void;
  showRemove?: boolean;
}

export function TagCloud({
  availableTags,
  selectedTags,
  onToggle,
  onRemove,
  showRemove = false,
}: TagCloudProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {availableTags.map((tag) => {
        const isSelected = selectedTags.includes(tag);

        return (
          <Badge
            key={tag}
            variant={isSelected ? "default" : "outline"}
            className="cursor-pointer hover:scale-105 transition-transform"
            onClick={() => onToggle(tag)}
          >
            {tag}
            {showRemove && onRemove && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onRemove(tag);
                }}
                className="ml-1 hover:text-destructive"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </Badge>
        );
      })}
    </div>
  );
}
