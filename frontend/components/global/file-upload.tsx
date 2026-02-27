"use client";

import { useCallback, useRef, useState } from "react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3009";

// --- Shared upload helper ---

export async function uploadFile(
  file: File,
  folder: string,
): Promise<{ publicUrl: string }> {
  // 1. Get signed URL
  const res = await fetch(`${API_URL}/upload/signed-url`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      filename: file.name,
      contentType: file.type,
      folder,
    }),
  });

  if (!res.ok) {
    const body = await res.json().catch(() => null);
    throw new Error(body?.message || `Failed to get upload URL (${res.status})`);
  }

  const { signedUrl, path, publicUrl } = await res.json();

  // 2. Upload directly to Supabase Storage
  const uploadRes = await fetch(signedUrl, {
    method: "PUT",
    headers: { "Content-Type": file.type },
    body: file,
  });

  if (!uploadRes.ok) {
    throw new Error(`Upload failed (${uploadRes.status})`);
  }

  // 3. Create media record
  await fetch(`${API_URL}/media`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      url: publicUrl,
      path,
      filename: file.name,
      mimetype: file.type,
      size: file.size,
      folder,
    }),
  });

  return { publicUrl };
}

export async function deleteByUrl(url: string) {
  try {
    const res = await fetch(`${API_URL}/media?search=`);
    if (!res.ok) return;
    const items = await res.json();
    const match = items.find((m: { url: string }) => m.url === url);
    if (match) {
      await fetch(`${API_URL}/media/${match.id}`, { method: "DELETE" });
    } else {
      await fetch(`${API_URL}/upload`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });
    }
  } catch {
    // best-effort
  }
}

// --- Standalone upload dropzone (used inside MediaPickerDialog upload tab) ---

interface FileDropzoneUploadProps {
  folder?: string;
  accept?: string;
  maxSizeMB?: number;
  onUploadComplete: (url: string) => void;
}

export function FileDropzoneUpload({
  folder = "general",
  accept = "image/*,.mp4,.webm,.pdf",
  maxSizeMB = 5,
  onUploadComplete,
}: FileDropzoneUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState({ done: 0, total: 0 });
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const uploadMultiple = useCallback(
    async (files: File[]) => {
      setError(null);
      const oversized = files.find((f) => f.size > maxSizeMB * 1024 * 1024);
      if (oversized) {
        setError(`"${oversized.name}" exceeds ${maxSizeMB} MB limit`);
        return;
      }

      setIsUploading(true);
      setProgress({ done: 0, total: files.length });
      let lastUrl = "";

      for (let i = 0; i < files.length; i++) {
        try {
          const { publicUrl } = await uploadFile(files[i], folder);
          lastUrl = publicUrl;
          setProgress({ done: i + 1, total: files.length });
        } catch (err) {
          setError(
            `Failed to upload "${files[i].name}": ${err instanceof Error ? err.message : "Upload failed"}`
          );
        }
      }

      setIsUploading(false);
      if (lastUrl) onUploadComplete(lastUrl);
    },
    [folder, maxSizeMB, onUploadComplete],
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      const files = Array.from(e.dataTransfer.files);
      if (files.length) uploadMultiple(files);
    },
    [uploadMultiple],
  );

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = Array.from(e.target.files || []);
      if (files.length) uploadMultiple(files);
      e.target.value = "";
    },
    [uploadMultiple],
  );

  return (
    <div>
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        className={`flex flex-col items-center justify-center gap-2 rounded-md border-2 border-dashed p-10 cursor-pointer transition-colors ${
          isDragging
            ? "border-primary bg-primary/5"
            : "border-input hover:border-primary/50"
        } ${isUploading ? "pointer-events-none opacity-60" : ""}`}
      >
        {isUploading ? (
          <svg
            className="h-8 w-8 animate-spin text-muted-foreground"
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
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="32"
            height="32"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-muted-foreground"
          >
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="17 8 12 3 7 8" />
            <line x1="12" y1="3" x2="12" y2="15" />
          </svg>
        )}
        <p className="text-sm text-muted-foreground">
          {isUploading
            ? `Uploading ${progress.done}/${progress.total}...`
            : "Drag & drop or click to browse (multiple files supported)"}
        </p>
      </div>
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        multiple
        onChange={handleFileChange}
        className="hidden"
      />
      {error && (
        <p className="mt-1.5 text-sm text-destructive">{error}</p>
      )}
    </div>
  );
}
