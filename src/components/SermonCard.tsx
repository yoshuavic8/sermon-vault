import { Sermon } from "@/lib/types";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, Calendar, Users, Clock } from "lucide-react";
import { format } from "date-fns";
import { FileUtils } from "@/lib/file-utils";

interface SermonCardProps {
  sermon: Sermon;
  onClick?: (sermon: Sermon) => void;
}

export function SermonCard({ sermon, onClick }: SermonCardProps) {
  const { metadata, fileType, year } = sermon;

  const handleClick = () => {
    if (onClick) onClick(sermon);
  };

  const fileIcon = FileUtils.getFileIcon(fileType);
  const fileTypeName = FileUtils.getFileTypeName(fileType);

  // Rotate through gradient colors for variety
  const gradients = ["purple", "pink", "blue", "cyan", "orange"];
  const gradientIndex =
    (metadata.title.charCodeAt(0) + metadata.title.length) % gradients.length;
  const cardGradient = `card-gradient-${gradients[gradientIndex]}`;
  const iconGradient = `icon-gradient-${gradients[gradientIndex]}`;

  return (
    <Card
      className={`${cardGradient} cursor-pointer hover-lift hover:scale-[1.02] overflow-hidden group animate-in-smooth border-0`}
      onClick={handleClick}
    >
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-4 flex-1">
            <div
              className={`${iconGradient} w-16 h-16 rounded-2xl flex items-center justify-center text-3xl transform group-hover:scale-110 transition-transform duration-500`}
            >
              {fileIcon}
            </div>
            <div className="flex-1 min-w-0">
              <CardTitle className="text-xl font-bold text-white line-clamp-2 mb-2 drop-shadow-lg">
                {metadata.title}
              </CardTitle>
              <CardDescription className="text-sm text-white/70 font-medium">
                {fileTypeName} • {year}
              </CardDescription>
            </div>
          </div>
          {metadata.series && (
            <Badge
              variant="secondary"
              className="text-xs whitespace-nowrap backdrop-blur-sm bg-white/20 border-white/30 text-white font-semibold px-3 py-1.5"
            >
              {metadata.series}
            </Badge>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-4 pb-5">
        {/* Date & Speaker */}
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="flex items-center gap-2 text-white/90">
            <div className="p-2 rounded-xl bg-white/20 backdrop-blur-sm">
              <Calendar className="w-4 h-4 text-white" />
            </div>
            <span className="font-semibold">
              {metadata.date
                ? format(new Date(metadata.date), "MMM dd, yyyy")
                : "No date"}
            </span>
          </div>
        </div>

        {/* Delivery Sessions */}
        {metadata.deliveries && metadata.deliveries.length > 0 && (
          <div className="flex items-center gap-2 text-sm bg-white/15 backdrop-blur-sm rounded-xl px-4 py-2.5 border border-white/20">
            <div className="p-1.5 rounded-lg bg-white/20">
              <Clock className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-white">
              {metadata.deliveries.length} delivery session
              {metadata.deliveries.length > 1 ? "s" : ""}
            </span>
          </div>
        )}

        {/* Bible References */}
        {metadata.references && metadata.references.length > 0 && (
          <div className="flex items-center gap-2 text-sm text-white/80">
            <span className="text-xl">📖</span>
            <span className="line-clamp-1 font-semibold">
              {metadata.references.slice(0, 2).join(", ")}
              {metadata.references.length > 2 &&
                ` +${metadata.references.length - 2}`}
            </span>
          </div>
        )}
      </CardContent>

      <CardFooter className="flex items-center justify-between border-t border-white/10 pt-4 bg-black/10">
        <div className="flex gap-2 flex-wrap">
          {metadata.tags &&
            metadata.tags.slice(0, 3).map((tag, idx) => (
              <Badge
                key={idx}
                variant="secondary"
                className="text-xs px-3 py-1.5 backdrop-blur-sm bg-white/20 hover:bg-white/30 transition-colors text-white font-semibold border border-white/20"
              >
                {tag}
              </Badge>
            ))}
          {metadata.tags && metadata.tags.length > 3 && (
            <Badge
              variant="secondary"
              className="text-xs px-3 py-1.5 backdrop-blur-sm bg-white/20 text-white font-semibold border border-white/20"
            >
              +{metadata.tags.length - 3}
            </Badge>
          )}
        </div>
      </CardFooter>
    </Card>
  );
}
