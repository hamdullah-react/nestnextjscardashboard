"use client";

import { useCallback, useEffect, useState } from "react";
import {
  Search,
  FileText,
  Film,
  ImageIcon,
  Trash2,
  Upload,
  X,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { FileDropzoneUpload } from "@/components/global/file-upload";
import { Modal } from "@/components/global/modal";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3009";
const PAGE_SIZE = 20;

interface MediaItem {
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

interface PaginatedMedia {
  data: MediaItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
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

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function MediaList() {
  const [items, setItems] = useState<MediaItem[]>([]);
  const [initialLoading, setInitialLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [filter, setFilter] = useState<FilterType>("all");
  const [selected, setSelected] = useState<MediaItem | null>(null);
  const [deleting, setDeleting] = useState<number | null>(null);
  const [uploadOpen, setUploadOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(timer);
  }, [search]);

  // Reset to page 1 when search or filter changes
  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, filter]);

  const fetchMedia = useCallback(async () => {
    try {
      const params = new URLSearchParams();
      if (debouncedSearch) params.set("search", debouncedSearch);
      if (filter !== "all") params.set("mimetype", filter);
      params.set("page", String(page));
      params.set("limit", String(PAGE_SIZE));
      const res = await fetch(`${API_URL}/media?${params.toString()}`);
      if (!res.ok) throw new Error("Failed to fetch media");
      const result: PaginatedMedia = await res.json();
      setItems(result.data);
      setTotal(result.total);
      setTotalPages(result.totalPages);
    } catch {
      setItems([]);
      setTotal(0);
      setTotalPages(1);
    } finally {
      setInitialLoading(false);
    }
  }, [debouncedSearch, filter, page]);

  useEffect(() => {
    fetchMedia();
  }, [fetchMedia]);

  const handleDelete = async (id: number) => {
    setDeleting(id);
    try {
      const res = await fetch(`${API_URL}/media/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete");
      if (selected?.id === id) setSelected(null);
      fetchMedia();
    } catch {
      // best-effort
    } finally {
      setDeleting(null);
    }
  };

  const handleUploadComplete = () => {
    setUploadOpen(false);
    fetchMedia();
  };

  const handleCopyUrl = (url: string) => {
    navigator.clipboard.writeText(url);
  };

  const startItem = (page - 1) * PAGE_SIZE + 1;
  const endItem = Math.min(page * PAGE_SIZE, total);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Media Library</h1>
          <p className="text-muted-foreground text-sm">
            {total} {total === 1 ? "file" : "files"}
          </p>
        </div>
        <Button onClick={() => setUploadOpen(true)}>
          <Upload className="mr-2 h-4 w-4" />
          Upload
        </Button>
      </div>

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
                "rounded-md px-2.5 py-1.5 text-xs font-medium transition-colors",
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
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
          {Array.from({ length: 12 }).map((_, i) => (
            <div
              key={i}
              className="aspect-square rounded-lg bg-muted animate-pulse"
            />
          ))}
        </div>
      ) : items.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
          <ImageIcon className="h-12 w-12 mb-3" />
          <p className="text-sm font-medium">No media found</p>
          <p className="text-xs mt-1">
            {debouncedSearch || filter !== "all"
              ? "Try changing your search or filter"
              : "Upload files to get started"}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
          {items.map((item) => (
            <div
              key={item.id}
              onClick={() => setSelected(item)}
              className={cn(
                "group relative aspect-square rounded-lg border overflow-hidden bg-muted/30 cursor-pointer",
                selected?.id === item.id
                  ? "ring-2 ring-primary border-primary"
                  : "border-input hover:border-primary/50"
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
                  <Film className="h-10 w-10 text-muted-foreground" />
                </div>
              ) : (
                <div className="flex h-full w-full items-center justify-center">
                  <FileText className="h-10 w-10 text-muted-foreground" />
                </div>
              )}

              {/* Hover overlay */}
              <div className="absolute inset-x-0 bottom-0 bg-background/90 p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <p className="text-xs font-medium truncate">{item.filename}</p>
                <p className="text-xs text-muted-foreground">
                  {formatSize(item.size)}
                </p>
              </div>

              {/* Delete button */}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleDelete(item.id);
                }}
                disabled={deleting === item.id}
                className="absolute top-1.5 right-1.5 rounded-full bg-background/80 border border-input p-1 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-destructive hover:text-destructive-foreground"
              >
                {deleting === item.id ? (
                  <svg
                    className="h-3.5 w-3.5 animate-spin"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                    />
                  </svg>
                ) : (
                  <Trash2 className="h-3.5 w-3.5" />
                )}
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {!initialLoading && total > PAGE_SIZE && (
        <div className="flex items-center justify-between">
          <p className="text-muted-foreground text-sm">
            Showing {startItem}-{endItem} of {total}
          </p>
          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              disabled={page <= 1}
              onClick={() => setPage((p) => p - 1)}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <Button
                key={p}
                variant={p === page ? "default" : "outline"}
                size="icon"
                className="h-8 w-8"
                onClick={() => setPage(p)}
              >
                {p}
              </Button>
            ))}
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              disabled={page >= totalPages}
              onClick={() => setPage((p) => p + 1)}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Detail sidebar */}
      {selected && (
        <div className="fixed inset-y-0 right-0 z-40 w-80 border-l bg-background shadow-lg overflow-y-auto">
          <div className="flex items-center justify-between p-4 border-b">
            <h3 className="font-semibold text-sm">File Details</h3>
            <button
              type="button"
              onClick={() => setSelected(null)}
              className="rounded-md p-1 hover:bg-muted"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="p-4 space-y-4">
            {/* Preview */}
            <div className="rounded-lg border overflow-hidden bg-muted/30">
              {selected.mimetype.startsWith("image/") ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={selected.url}
                  alt={selected.alt || selected.filename}
                  className="w-full h-48 object-contain"
                />
              ) : selected.mimetype.startsWith("video/") ? (
                <div className="flex h-48 items-center justify-center">
                  <Film className="h-12 w-12 text-muted-foreground" />
                </div>
              ) : (
                <div className="flex h-48 items-center justify-center">
                  <FileText className="h-12 w-12 text-muted-foreground" />
                </div>
              )}
            </div>

            {/* Info */}
            <div className="space-y-3 text-sm">
              <div>
                <p className="text-muted-foreground text-xs">Filename</p>
                <p className="font-medium break-all">{selected.filename}</p>
              </div>
              <div>
                <p className="text-muted-foreground text-xs">Type</p>
                <p>{selected.mimetype}</p>
              </div>
              <div>
                <p className="text-muted-foreground text-xs">Size</p>
                <p>{formatSize(selected.size)}</p>
              </div>
              <div>
                <p className="text-muted-foreground text-xs">Folder</p>
                <p>{selected.folder}</p>
              </div>
              <div>
                <p className="text-muted-foreground text-xs">Uploaded</p>
                <p>{formatDate(selected.createdAt)}</p>
              </div>
              <div>
                <p className="text-muted-foreground text-xs">URL</p>
                <p className="break-all text-xs text-muted-foreground">
                  {selected.url}
                </p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-2 pt-2">
              <Button
                size="sm"
                variant="outline"
                className="flex-1"
                onClick={() => handleCopyUrl(selected.url)}
              >
                Copy URL
              </Button>
              <Button
                size="sm"
                variant="destructive"
                onClick={() => handleDelete(selected.id)}
                disabled={deleting === selected.id}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Upload dialog */}
      <Modal open={uploadOpen} onClose={() => setUploadOpen(false)} title="Upload Files">
        <FileDropzoneUpload
          folder="general"
          onUploadComplete={handleUploadComplete}
        />
      </Modal>
    </div>
  );
}
