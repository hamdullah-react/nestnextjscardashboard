"use client";

import { useCallback, useRef, useState } from "react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3009";

interface FileDropzoneProps {
  value?: string;
  onChange: (url: string) => void;
  folder?: string;
  accept?: string;
  maxSizeMB?: number;
}

export function FileDropzone({
  value,
  onChange,
  folder = "general",
  accept = "image/*",
  maxSizeMB = 5,
}: FileDropzoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const deleteFile = useCallback(
    async (url: string) => {
      try {
        await fetch(`${API_URL}/upload`, {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ url }),
        });
      } catch {
        // best-effort delete — don't block the user
      }
    },
    [],
  );

  const upload = useCallback(
    async (file: File) => {
      setError(null);

      if (file.size > maxSizeMB * 1024 * 1024) {
        setError(`File exceeds ${maxSizeMB} MB limit`);
        return;
      }

      setIsUploading(true);
      try {
        // delete old file if replacing
        if (value) {
          await deleteFile(value);
        }

        const formData = new FormData();
        formData.append("file", file);
        formData.append("folder", folder);

        const res = await fetch(`${API_URL}/upload`, {
          method: "POST",
          body: formData,
        });

        if (!res.ok) {
          const body = await res.json().catch(() => null);
          throw new Error(body?.message || `Upload failed (${res.status})`);
        }

        const data: { url: string } = await res.json();
        onChange(data.url);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Upload failed");
      } finally {
        setIsUploading(false);
      }
    },
    [folder, maxSizeMB, onChange, value, deleteFile],
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      const file = e.dataTransfer.files[0];
      if (file) upload(file);
    },
    [upload],
  );

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) upload(file);
      e.target.value = "";
    },
    [upload],
  );

  const handleRemove = useCallback(async () => {
    if (value) {
      await deleteFile(value);
      onChange("");
    }
  }, [value, deleteFile, onChange]);

  if (value) {
    return (
      <div className="relative group w-full">
        <div className="rounded-md border border-input overflow-hidden bg-muted/30">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={value}
            alt="Uploaded file"
            className="w-full h-40 object-contain"
          />
        </div>
        <button
          type="button"
          onClick={handleRemove}
          className="absolute top-2 right-2 rounded-full bg-background/80 border border-input p-1 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-destructive hover:text-destructive-foreground"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      </div>
    );
  }

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
        className={`flex flex-col items-center justify-center gap-2 rounded-md border-2 border-dashed p-6 cursor-pointer transition-colors ${
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
            ? "Uploading..."
            : "Drag & drop or click to browse"}
        </p>
      </div>
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        onChange={handleFileChange}
        className="hidden"
      />
      {error && (
        <p className="mt-1.5 text-sm text-destructive">{error}</p>
      )}
    </div>
  );
}
