"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Search, FileText, Film, ImageIcon } from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3009";

export interface MediaItem {
  id: number;
  url: string;
  path: string;
  filename: string;
  mimetype: string;
  size: number;
  folder: string;
  alt: string | null;
  createdAt: string;
}

type FilterType = "all" | "image/" | "video/" | "application/";

const FILTERS: { label: string; value: FilterType }[] = [
  { label: "All", value: "all" },
  { label: "Images", value: "image/" },
  { label: "Videos", value: "video/" },
  { label: "Documents", value: "application/" },
];

function formatSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

interface MediaGalleryProps {
  onSelect: (url: string) => void;
  accept?: string;
  refreshKey?: number;
}

export function MediaGallery({ onSelect, accept, refreshKey }: MediaGalleryProps) {
  const [allItems, setAllItems] = useState<MediaItem[]>([]);
  const [initialLoading, setInitialLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [filter, setFilter] = useState<FilterType>(
    accept?.startsWith("image/") ? "image/" : "all"
  );
  const hasFetched = useRef(false);

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(timer);
  }, [search]);

  const fetchMedia = useCallback(async () => {
    try {
      const params = new URLSearchParams();
      if (debouncedSearch) params.set("search", debouncedSearch);
      const query = params.toString();
      const res = await fetch(`${API_URL}/media${query ? `?${query}` : ""}`);
      if (!res.ok) throw new Error("Failed to fetch media");
      setAllItems(await res.json());
    } catch {
      setAllItems([]);
    } finally {
      setInitialLoading(false);
      hasFetched.current = true;
    }
  }, [debouncedSearch]);

  useEffect(() => {
    fetchMedia();
  }, [fetchMedia, refreshKey]);

  // Client-side filter — instant, no API call
  const items = filter === "all"
    ? allItems
    : allItems.filter((item) => item.mimetype.startsWith(filter));

  return (
    <div className="flex flex-col gap-3 h-full">
      {/* Search + Filters */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search files..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-8"
          />
        </div>
        <div className="flex gap-1">
          {FILTERS.map((f) => (
            <button
              key={f.value}
              type="button"
              onClick={() => setFilter(f.value)}
              className={cn(
                "rounded-md px-2.5 py-1 text-xs font-medium transition-colors",
                filter === f.value
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:text-foreground"
              )}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Grid */}
      {initialLoading ? (
        <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-8 gap-2 p-1">
          {Array.from({ length: 16 }).map((_, i) => (
            <div
              key={i}
              className="aspect-square max-h-28 rounded-md bg-muted animate-pulse"
            />
          ))}
        </div>
      ) : allItems.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
          <ImageIcon className="h-10 w-10 mb-2" />
          <p className="text-sm">No media found</p>
        </div>
      ) : (
        <>
          {items.length === 0 && (
            <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
              <ImageIcon className="h-10 w-10 mb-2" />
              <p className="text-sm">No media matches this filter</p>
            </div>
          )}
          <div className={cn(
            "grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-8 gap-2 flex-1 overflow-y-auto p-1",
            items.length === 0 && "hidden"
          )}>
            {allItems.map((item) => {
              const visible = filter === "all" || item.mimetype.startsWith(filter);
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => onSelect(item.url)}
                  className={cn(
                    visible ? "" : "hidden",
                    "group relative aspect-square rounded-md border border-input overflow-hidden bg-muted/30 hover:ring-2 hover:ring-primary cursor-pointer max-h-28"
                  )}
                >
                  {item.mimetype.startsWith("image/") ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={item.url}
                      alt={item.alt || item.filename}
                      className="h-full w-full object-cover"
                      loading="lazy"
                    />
                  ) : item.mimetype.startsWith("video/") ? (
                    <div className="flex h-full w-full items-center justify-center">
                      <Film className="h-8 w-8 text-muted-foreground" />
                    </div>
                  ) : (
                    <div className="flex h-full w-full items-center justify-center">
                      <FileText className="h-8 w-8 text-muted-foreground" />
                    </div>
                  )}
                  {/* Hover overlay */}
                  <div className="absolute inset-x-0 bottom-0 bg-background/90 p-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                    <p className="text-xs font-medium truncate">{item.filename}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatSize(item.size)}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
