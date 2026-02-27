"use client";

import { useEffect, useRef, useState } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import { FileDropzoneUpload } from "@/components/global/file-upload";
import { MediaGallery } from "@/components/global/media-gallery";

interface MediaPickerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelect: (url: string) => void;
  folder?: string;
  accept?: string;
}

export function MediaPickerDialog({
  open,
  onOpenChange,
  onSelect,
  folder = "general",
  accept = "image/*,.mp4,.webm,.pdf",
}: MediaPickerDialogProps) {
  const ref = useRef<HTMLDialogElement>(null);
  const [tab, setTab] = useState<"library" | "upload">("library");
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) {
      dialog.showModal();
    } else if (!open && dialog.open) {
      dialog.close();
    }
  }, [open]);

  const handleClose = () => onOpenChange(false);

  const handleSelect = (url: string) => {
    onSelect(url);
    onOpenChange(false);
  };

  const handleUploadComplete = (url: string) => {
    setRefreshKey((k) => k + 1);
    setTab("library");
    handleSelect(url);
  };

  return (
    <dialog
      ref={ref}
      onClose={handleClose}
      className="backdrop:bg-black/50 bg-transparent p-0 m-auto w-[calc(100%-2rem)] max-w-5xl h-[85vh] outline-none"
    >
      {open && (
        <div className="bg-background rounded-lg border shadow-lg flex flex-col h-full overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b shrink-0">
            <h2 className="text-lg font-semibold">Media Library</h2>
            <button
              type="button"
              onClick={handleClose}
              className="rounded-sm opacity-70 hover:opacity-100 transition-opacity"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Tab buttons */}
          <div className="px-6 pt-4 shrink-0">
            <div className="inline-flex h-9 w-fit items-center justify-center rounded-lg bg-muted p-1 text-muted-foreground">
              <button
                type="button"
                onClick={() => setTab("library")}
                className={cn(
                  "inline-flex items-center justify-center rounded-md px-3 py-1 text-sm font-medium",
                  tab === "library"
                    ? "bg-background text-foreground shadow-sm"
                    : "hover:text-foreground"
                )}
              >
                Library
              </button>
              <button
                type="button"
                onClick={() => setTab("upload")}
                className={cn(
                  "inline-flex items-center justify-center rounded-md px-3 py-1 text-sm font-medium",
                  tab === "upload"
                    ? "bg-background text-foreground shadow-sm"
                    : "hover:text-foreground"
                )}
              >
                Upload
              </button>
            </div>
          </div>

          {/* Tab panels */}
          <div className="flex-1 min-h-0 px-6 py-4 overflow-hidden">
            <div className={tab === "library" ? "h-full overflow-y-auto" : "hidden"}>
              <MediaGallery
                onSelect={handleSelect}
                accept={accept}
                refreshKey={refreshKey}
              />
            </div>
            <div className={tab === "upload" ? "" : "hidden"}>
              <FileDropzoneUpload
                folder={folder}
                onUploadComplete={handleUploadComplete}
              />
            </div>
          </div>
        </div>
      )}
    </dialog>
  );
}
