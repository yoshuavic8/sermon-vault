"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { SermonIndexer } from "@/lib/indexer";
import { SettingsService } from "@/lib/settings";
import { SermonIndex } from "@/lib/types";
import {
  BarChart3,
  Calendar,
  FileText,
  MapPin,
  Tag,
  TrendingUp,
  Users,
  Clock,
  FolderOpen,
  Sparkles,
  Target,
  Activity,
  BookOpen,
  Settings,
} from "lucide-react";

interface StatCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon: React.ReactNode;
  trend?: {
    value: string;
    isPositive?: boolean;
  };
}

function StatCard({ title, value, description, icon, trend }: StatCardProps) {
  // Assign gradient based on title for visual variety
  const gradientMap: Record<string, string> = {
    "Total Sermons": "card-gradient-purple",
    "Total Files": "card-gradient-pink",
    Deliveries: "card-gradient-blue",
    "Avg per Year": "card-gradient-cyan",
    "Active Years": "card-gradient-orange",
    Tags: "card-gradient-green",
    Series: "card-gradient-indigo",
  };
  const cardClass = gradientMap[title] || "card-gradient-purple";

  return (
    <Card
      className={`${cardClass} hover-lift hover:scale-105 border-0 shadow-deep`}
    >
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-bold text-white/90">
          {title}
        </CardTitle>
        <div className="h-5 w-5 text-white">{icon}</div>
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-bold text-white drop-shadow-lg">
          {value}
        </div>
        {description && (
          <p className="text-xs text-white/70 mt-1 font-semibold">
            {description}
          </p>
        )}
        {trend && (
          <div
            className={`text-xs font-bold mt-2 flex items-center gap-1 ${trend.isPositive ? "text-green-300" : "text-white/70"}`}
          >
            {trend.isPositive && <TrendingUp className="h-3 w-3" />}
            {trend.value}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

interface DistributionBarProps {
  label: string;
  count: number;
  total: number;
  color?: string;
}

function DistributionBar({
  label,
  count,
  total,
  color = "bg-gradient-to-r from-purple-400 to-pink-400",
}: DistributionBarProps) {
  const percentage = total > 0 ? (count / total) * 100 : 0;

  return (
    <div className="space-y-2 group">
      <div className="flex items-center justify-between text-sm">
        <span className="font-bold text-white group-hover:text-white/90 transition-colors">
          {label}
        </span>
        <span className="text-white/70 font-semibold">
          {count} <span className="text-xs">({percentage.toFixed(1)}%)</span>
        </span>
      </div>
      <div className="h-3 bg-white/20 rounded-full overflow-hidden backdrop-blur-sm border border-white/30">
        <div
          className={`h-full ${color} transition-all duration-700 ease-out shadow-glow-purple`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}

export default function StatisticsPage() {
  const router = useRouter();
  const [index, setIndex] = useState<SermonIndex | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const vaultPath = await SettingsService.getVaultPath();
        if (!vaultPath) {
          setLoading(false);
          return;
        }
        const loadedIndex = await SermonIndexer.loadIndex(vaultPath);
        setIndex(loadedIndex);
      } catch (error) {
        console.error("Failed to load statistics:", error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-vibrant-purple flex items-center justify-center">
        <div className="flex flex-col items-center gap-4 animate-in-smooth">
          <Activity className="h-12 w-12 animate-spin text-white" />
          <p className="text-white text-lg font-bold drop-shadow-lg">
            Loading statistics...
          </p>
        </div>
      </div>
    );
  }

  if (!index || index.sermons.length === 0) {
    return (
      <div className="min-h-screen bg-vibrant-purple flex items-center justify-center p-6">
        <Card className="card-gradient-purple max-w-md shadow-glow-purple animate-in-smooth border-0">
          <CardHeader className="text-center pb-8">
            <div className="mx-auto mb-4 icon-gradient-pink w-20 h-20 rounded-3xl flex items-center justify-center">
              <BarChart3 className="h-10 w-10 text-white" />
            </div>
            <CardTitle className="text-2xl text-white font-bold drop-shadow-lg">
              No Data Available
            </CardTitle>
            <CardDescription className="text-base mt-2 text-white/70 font-semibold">
              Add some sermons to your vault to see statistics.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  // Compute statistics
  const totalSermons = index.sermons.length;
  const totalDeliveries = index.sermons.reduce(
    (sum, s) => sum + (s.metadata.deliveries?.length || 0),
    0,
  );
  const filterOptions = SermonIndexer.extractFilterOptions(index.sermons);
  const years = filterOptions.years;
  const tags = filterOptions.tags;
  const locations = filterOptions.locations;
  const services = filterOptions.services;
  const speakers = filterOptions.speakers;
  const series = filterOptions.series;

  // Date range
  const sortedSermons = SermonIndexer.sortByDate(index.sermons, false);
  const firstSermon = sortedSermons[0];
  const latestSermon = sortedSermons[sortedSermons.length - 1];
  const dateRange =
    firstSermon && latestSermon
      ? `${new Date(firstSermon.metadata.date).getFullYear()} - ${new Date(latestSermon.metadata.date).getFullYear()}`
      : "N/A";

  // Growth metrics
  const currentYear = new Date().getFullYear();
  const lastYear = currentYear - 1;
  const sermonsThisYear = index.stats.byYear[currentYear] || 0;
  const sermonsLastYear = index.stats.byYear[lastYear] || 0;
  const growthRate =
    sermonsLastYear > 0
      ? (((sermonsThisYear - sermonsLastYear) / sermonsLastYear) * 100).toFixed(
          1,
        )
      : "100";

  // Multi-delivery sermons
  const multiDeliverySermons = index.sermons.filter(
    (s) => (s.metadata.deliveries?.length || 0) > 1,
  ).length;

  // Tag frequency
  const tagFrequency: Record<string, number> = {};
  index.sermons.forEach((sermon) => {
    sermon.metadata.tags?.forEach((tag: string) => {
      tagFrequency[tag] = (tagFrequency[tag] || 0) + 1;
    });
  });
  const topTags = Object.entries(tagFrequency)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 10);

  // File type colors
  const fileTypeColors: Record<string, string> = {
    markdown: "bg-blue-500",
    keynote: "bg-purple-500",
    powerpoint: "bg-orange-500",
    pdf: "bg-red-500",
    word: "bg-blue-600",
    pages: "bg-yellow-500",
    notes: "bg-green-500",
    unknown: "bg-gray-500",
  };

  // Year data for timeline
  const yearData = Object.entries(index.stats.byYear).sort(
    ([a], [b]) => parseInt(a) - parseInt(b),
  );
  const maxYearCount = Math.max(...Object.values(index.stats.byYear));

  // Top locations and services
  const topLocations = Object.entries(index.stats.byLocation)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 10);
  const topServices = Object.entries(index.stats.byService)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 10);

  // Average sermons per year
  const avgSermonsPerYear =
    years.length > 0 ? (totalSermons / years.length).toFixed(1) : "0";

  // Recent activity (last 30 days)
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const recentSermons = index.sermons.filter((s) => {
    const created = s.fileMetadata?.created
      ? new Date(s.fileMetadata.created)
      : null;
    return created && created > thirtyDaysAgo;
  }).length;

  return (
    <div className="container mx-auto p-8 space-y-12 max-w-7xl min-h-screen bg-vibrant-purple">
      {/* Header */}
      <div className="space-y-4 animate-in-smooth">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="icon-gradient-purple w-16 h-16 rounded-2xl flex items-center justify-center shadow-glow-purple">
              <BarChart3 className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-5xl font-bold tracking-tight text-white drop-shadow-xl">
                Vault Statistics
              </h1>
              <p className="text-base text-white/80 mt-1 font-semibold">
                Comprehensive analytics for your sermon library
              </p>
            </div>
          </div>
          <div className="flex gap-3">
            <Button
              onClick={() => router.push("/sermons")}
              variant="outline"
              className="gap-2 backdrop-blur-md bg-white/20 hover:bg-white/30 border-white/30 text-white font-semibold hover-lift shadow-deep hover:scale-105"
            >
              <BookOpen className="w-4 h-4" />
              Library
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
      </div>

      <Separator className="bg-white/20" />

      {/* Overview Stats */}
      <div className="animate-in-smooth" style={{ animationDelay: "100ms" }}>
        <h2 className="text-3xl font-bold mb-6 flex items-center gap-3 text-white drop-shadow-lg">
          <div className="icon-gradient-pink w-12 h-12 rounded-xl flex items-center justify-center">
            <Sparkles className="h-6 w-6 text-white" />
          </div>
          Overview
        </h2>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Total Sermons"
            value={totalSermons}
            description={`${avgSermonsPerYear} average per year`}
            icon={<FileText className="h-4 w-4" />}
            trend={
              sermonsThisYear > 0
                ? {
                    value: `${sermonsThisYear} this year`,
                    isPositive: true,
                  }
                : undefined
            }
          />
          <StatCard
            title="Total Deliveries"
            value={totalDeliveries}
            description={`${multiDeliverySermons} sermons delivered multiple times`}
            icon={<Users className="h-4 w-4" />}
          />
          <StatCard
            title="Time Span"
            value={dateRange}
            description={`Across ${years.length} ${years.length === 1 ? "year" : "years"}`}
            icon={<Calendar className="h-4 w-4" />}
          />
          <StatCard
            title="Recent Activity"
            value={recentSermons}
            description="Added in last 30 days"
            icon={<Clock className="h-4 w-4" />}
            trend={
              recentSermons > 0
                ? {
                    value: "Active",
                    isPositive: true,
                  }
                : undefined
            }
          />
        </div>
      </div>

      {/* Content Stats */}
      <div className="animate-in-smooth" style={{ animationDelay: "200ms" }}>
        <h2 className="text-3xl font-bold mb-6 flex items-center gap-3 text-white drop-shadow-lg">
          <div className="icon-gradient-cyan w-12 h-12 rounded-xl flex items-center justify-center">
            <Target className="h-6 w-6 text-white" />
          </div>
          Content Metrics
        </h2>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Unique Tags"
            value={tags.length}
            description="Total tag collection"
            icon={<Tag className="h-4 w-4" />}
          />
          <StatCard
            title="Series"
            value={series.length}
            description="Sermon series count"
            icon={<FolderOpen className="h-4 w-4" />}
          />
          <StatCard
            title="Speakers"
            value={speakers.length}
            description="Unique speakers"
            icon={<Users className="h-4 w-4" />}
          />
          <StatCard
            title="Locations"
            value={locations.length}
            description={`${services.length} service types`}
            icon={<MapPin className="h-4 w-4" />}
          />
        </div>
      </div>

      {/* Sermons by Year */}
      <Card
        className="card-gradient-orange shadow-glow-orange hover-lift border-0 animate-in-smooth"
        style={{ animationDelay: "300ms" }}
      >
        <CardHeader className="pb-6">
          <CardTitle className="flex items-center gap-3 text-2xl text-white font-bold drop-shadow-lg">
            <div className="icon-gradient-pink w-12 h-12 rounded-xl flex items-center justify-center">
              <Calendar className="h-6 w-6 text-white" />
            </div>
            Sermons by Year
          </CardTitle>
          <CardDescription className="text-base mt-2 text-white/70 font-semibold">
            Historical distribution of sermons
            {sermonsLastYear > 0 && (
              <span className="ml-2 inline-flex items-center gap-1 text-xs font-bold text-green-300 bg-green-500/30 px-3 py-1.5 rounded-full backdrop-blur-sm border border-green-400/30">
                <TrendingUp className="h-3 w-3" />
                {growthRate}% growth from last year
              </span>
            )}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {yearData.map(([year, count]) => (
            <DistributionBar
              key={year}
              label={year}
              count={count}
              total={maxYearCount}
              color="bg-gradient-to-r from-pink-400 to-orange-400"
            />
          ))}
        </CardContent>
      </Card>

      {/* File Types */}
      <Card
        className="card-gradient-blue shadow-glow-blue hover-lift border-0 animate-in-smooth"
        style={{ animationDelay: "350ms" }}
      >
        <CardHeader className="pb-6">
          <CardTitle className="flex items-center gap-3 text-2xl text-white font-bold drop-shadow-lg">
            <div className="icon-gradient-cyan w-12 h-12 rounded-xl flex items-center justify-center">
              <FileText className="h-6 w-6 text-white" />
            </div>
            File Type Distribution
          </CardTitle>
          <CardDescription className="text-base mt-2 text-white/70 font-semibold">
            Sermon formats in your vault
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {Object.entries(index.stats.byType)
            .sort(([, a], [, b]) => b - a)
            .map(([type, count]) => (
              <DistributionBar
                key={type}
                label={type.charAt(0).toUpperCase() + type.slice(1)}
                count={count}
                total={totalSermons}
                color={fileTypeColors[type] || "bg-gray-500"}
              />
            ))}
        </CardContent>
      </Card>

      {/* Two Column Layout */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Top Locations */}
        <Card className="card-gradient-blue shadow-glow-blue hover-lift border-0">
          <CardHeader className="pb-6">
            <CardTitle className="flex items-center gap-3 text-2xl text-white font-bold drop-shadow-lg">
              <div className="icon-gradient-cyan w-12 h-12 rounded-xl flex items-center justify-center">
                <MapPin className="h-6 w-6 text-white" />
              </div>
              Top Locations
            </CardTitle>
            <CardDescription className="text-base mt-2 text-white/70 font-semibold">
              Most active delivery locations
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {topLocations.length > 0 ? (
              topLocations.map(([location, count]) => (
                <DistributionBar
                  key={location}
                  label={location}
                  count={count}
                  total={totalDeliveries}
                  color="bg-gradient-to-r from-cyan-400 to-blue-400"
                />
              ))
            ) : (
              <p className="text-sm text-white/60 font-semibold">
                No location data available
              </p>
            )}
          </CardContent>
        </Card>

        {/* Top Services */}
        <Card className="card-gradient-indigo shadow-glow-purple hover-lift border-0">
          <CardHeader className="pb-6">
            <CardTitle className="flex items-center gap-3 text-2xl text-white font-bold drop-shadow-lg">
              <div className="icon-gradient-purple w-12 h-12 rounded-xl flex items-center justify-center">
                <Clock className="h-6 w-6 text-white" />
              </div>
              Top Services
            </CardTitle>
            <CardDescription className="text-base mt-2 text-white/70 font-semibold">
              Most frequent service types
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {topServices.length > 0 ? (
              topServices.map(([service, count]) => (
                <DistributionBar
                  key={service}
                  label={service}
                  count={count}
                  total={totalDeliveries}
                  color="bg-gradient-to-r from-purple-400 to-indigo-400"
                />
              ))
            ) : (
              <p className="text-sm text-white/60 font-semibold">
                No service data available
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Top Tags */}
      <Card
        className="card-gradient-green shadow-glow-cyan hover-lift border-0 animate-in-smooth"
        style={{ animationDelay: "450ms" }}
      >
        <CardHeader className="pb-6">
          <CardTitle className="flex items-center gap-3 text-2xl text-white font-bold drop-shadow-lg">
            <div className="icon-gradient-green w-12 h-12 rounded-xl flex items-center justify-center">
              <Tag className="h-6 w-6 text-white" />
            </div>
            Most Used Tags
          </CardTitle>
          <CardDescription className="text-base mt-2 text-white/70 font-semibold">
            Top 10 tags across all sermons
          </CardDescription>
        </CardHeader>
        <CardContent>
          {topTags.length > 0 ? (
            <div className="flex flex-wrap gap-3">
              {topTags.map(([tag, count]) => (
                <Badge
                  key={tag}
                  variant="secondary"
                  className="text-sm px-5 py-2.5 backdrop-blur-md bg-white/20 hover:bg-white/30 border border-white/30 text-white font-bold hover:-translate-y-1 hover:shadow-glow-green transition-all duration-300"
                >
                  {tag}
                  <span className="ml-2 text-xs text-white/90 font-bold bg-white/20 px-2 py-1 rounded-full">
                    {count}
                  </span>
                </Badge>
              ))}
            </div>
          ) : (
            <p className="text-sm text-white/60 font-semibold">No tags found</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
