"use client";

import { useRef, useState, useCallback } from "react";
import { Camera, Loader2, CheckCircle2, X } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/components/ui/use-toast";
import { getInitials } from "@/lib/utils";
import { cn } from "@/lib/utils";

interface ProfileImageUploaderProps {
  currentImage?: string;
  name: string;
  onUploadSuccess: (url: string) => void;
}

type UploadState = "idle" | "uploading" | "success";

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_SIZE_BYTES = 5 * 1024 * 1024;

export function ProfileImageUploader({
  currentImage,
  name,
  onUploadSuccess,
}: ProfileImageUploaderProps) {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [preview, setPreview] = useState<string | null>(null);
  const [uploadState, setUploadState] = useState<UploadState>("idle");
  const [isDragging, setIsDragging] = useState(false);

  const displayImage = preview ?? currentImage ?? "";

  // ── Validate and preview ──────────────────────────────────────────
  function processFile(file: File) {
    if (!ALLOWED_TYPES.includes(file.type)) {
      toast({
        variant: "destructive",
        title: "Invalid file type",
        description: "Please choose a JPEG, PNG, or WebP image.",
      });
      return;
    }
    if (file.size > MAX_SIZE_BYTES) {
      toast({
        variant: "destructive",
        title: "File too large",
        description: "Maximum file size is 5 MB.",
      });
      return;
    }

    // Show local preview immediately
    const reader = new FileReader();
    reader.onload = (e) => setPreview(e.target?.result as string);
    reader.readAsDataURL(file);

    uploadFile(file);
  }

  // ── Upload ────────────────────────────────────────────────────────
  async function uploadFile(file: File) {
    setUploadState("uploading");

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/upload/profile-image", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        setPreview(null);
        setUploadState("idle");
        toast({
          variant: "destructive",
          title: "Upload failed",
          description: data.error ?? "Something went wrong. Please try again.",
        });
        return;
      }

      setUploadState("success");
      onUploadSuccess(data.url);
      toast({ title: "Profile photo updated" });

      // Reset success indicator after a beat
      setTimeout(() => setUploadState("idle"), 2500);
    } catch {
      setPreview(null);
      setUploadState("idle");
      toast({
        variant: "destructive",
        title: "Network error",
        description: "Could not reach the server. Please try again.",
      });
    }
  }

  // ── Input change ──────────────────────────────────────────────────
  function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) processFile(file);
    // Reset so the same file can be re-selected
    e.target.value = "";
  }

  // ── Drag & drop ───────────────────────────────────────────────────
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      const file = e.dataTransfer.files?.[0];
      if (file) processFile(file);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  // ── Clear preview ─────────────────────────────────────────────────
  function handleClearPreview(e: React.MouseEvent) {
    e.stopPropagation();
    setPreview(null);
    setUploadState("idle");
  }

  const isUploading = uploadState === "uploading";

  return (
    <div className="flex flex-col items-center gap-3">
      {/* ── Avatar circle ──────────────────────────────────────── */}
      <div className="relative group">
        {/* Gradient glow ring */}
        <div
          className={cn(
            "absolute -inset-1 rounded-full bg-gradient-to-br from-blue-500 via-violet-500 to-pink-500 opacity-0 blur-sm transition-all duration-300",
            isDragging ? "opacity-60" : "group-hover:opacity-40"
          )}
        />

        {/* Clickable / droppable avatar */}
        <button
          type="button"
          disabled={isUploading}
          onClick={() => fileInputRef.current?.click()}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          aria-label="Upload profile photo"
          className={cn(
            "relative h-24 w-24 rounded-full ring-2 ring-offset-2 ring-offset-background transition-all duration-200 focus-visible:outline-none focus-visible:ring-blue-500",
            isDragging
              ? "ring-blue-500 scale-105"
              : "ring-border group-hover:ring-blue-400",
            isUploading && "cursor-not-allowed"
          )}
        >
          <Avatar className="h-24 w-24">
            <AvatarImage
              src={displayImage}
              alt={name}
              className="object-cover"
            />
            <AvatarFallback className="bg-gradient-to-br from-blue-500 to-violet-600 text-white text-2xl font-bold">
              {getInitials(name)}
            </AvatarFallback>
          </Avatar>

          {/* Hover / upload overlay */}
          <div
            className={cn(
              "absolute inset-0 rounded-full flex items-center justify-center transition-all duration-200",
              isUploading
                ? "bg-black/50"
                : "bg-black/0 group-hover:bg-black/40"
            )}
          >
            {isUploading ? (
              <Loader2 className="h-6 w-6 text-white animate-spin" />
            ) : uploadState === "success" ? (
              <CheckCircle2 className="h-6 w-6 text-emerald-400 opacity-0 group-hover:opacity-100 transition-opacity" />
            ) : (
              <Camera className="h-5 w-5 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
            )}
          </div>
        </button>

        {/* Clear-preview badge — shown only when a local preview is active */}
        {preview && uploadState === "idle" && (
          <button
            type="button"
            onClick={handleClearPreview}
            className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-destructive text-white shadow-sm hover:bg-destructive/90 transition-colors"
            aria-label="Remove preview"
          >
            <X className="h-3 w-3" />
          </button>
        )}

        {/* Success badge */}
        {uploadState === "success" && (
          <span className="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500 shadow-sm ring-2 ring-background animate-scale-in">
            <CheckCircle2 className="h-3.5 w-3.5 text-white" />
          </span>
        )}
      </div>

      {/* ── Caption ────────────────────────────────────────────── */}
      <div className="text-center">
        <p className="text-xs font-medium text-muted-foreground">
          {isUploading
            ? "Uploading…"
            : uploadState === "success"
            ? "Photo updated!"
            : "Click or drag to upload"}
        </p>
        {uploadState === "idle" && (
          <p className="text-[11px] text-muted-foreground/70 mt-0.5">
            JPEG, PNG or WebP · max 5 MB
          </p>
        )}
      </div>

      {/* ── Hidden file input ───────────────────────────────────── */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="sr-only"
        onChange={handleInputChange}
        disabled={isUploading}
      />
    </div>
  );
}
