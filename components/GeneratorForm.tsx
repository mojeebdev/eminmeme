"use client";

import { useState, useRef, useCallback } from "react";
import { GenerateResponse } from "@/types";

interface Props {
  loading: boolean;
  onLoading: (v: boolean) => void;
  onGenerated: (res: GenerateResponse) => void;
}

export default function GeneratorForm({ loading, onLoading, onGenerated }: Props) {
  const [prompt, setPrompt] = useState("");
  const [xHandle, setXHandle] = useState("");
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageBase64, setImageBase64] = useState<string | null>(null);
  const [imageMimeType, setImageMimeType] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback((file: File) => {
    if (!file.type.startsWith("image/")) {
      setError("Please upload an image file.");
      return;
    }
    if (file.size > 8 * 1024 * 1024) {
      setError("Image must be under 8MB.");
      return;
    }
    setError(null);
    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      setImagePreview(dataUrl);
      setImageBase64(dataUrl.split(",")[1]);
      setImageMimeType(file.type);
    };
    reader.readAsDataURL(file);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      const file = e.dataTransfer.files[0];
      if (file) handleFile(file);
    },
    [handleFile]
  );

  const clearImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setImagePreview(null);
    setImageBase64(null);
    setImageMimeType(null);
  };

  const handleSubmit = async () => {
    if (!prompt.trim()) {
      setError("Describe the meme vibe first.");
      return;
    }
    setError(null);
    onLoading(true);

    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: prompt.trim(),
          xHandle: xHandle.trim() || undefined,
          imageBase64: imageBase64 || undefined,
          imageMimeType: imageMimeType || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Generation failed");

      onGenerated(data);
      setPrompt("");
      setXHandle("");
      setImagePreview(null);
      setImageBase64(null);
      setImageMimeType(null);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      onLoading(false);
    }
  };

  return (
    <div>
      <h2
        style={{
          fontFamily: "var(--font-playfair)",
          fontSize: "28px",
          fontWeight: 700,
          color: "var(--cream)",
          marginBottom: "8px",
        }}
      >
        Generate Your Meme
      </h2>
      <p style={{ fontSize: "14px", color: "var(--muted)", marginBottom: "32px" }}>
        Enim always shows up. Add your photo for a bonus cameo.
      </p>

      {/* Image upload zone */}
      <div style={{ marginBottom: "20px" }}>
        <label className="label" style={{ display: "block", marginBottom: "8px" }}>
          Your Photo (optional)
        </label>

        {imagePreview ? (
          /* Compact thumbnail row once image is picked */
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "16px",
              padding: "12px 16px",
              background: "var(--bg-elevated)",
              border: "1px solid var(--border)",
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={imagePreview}
              alt="Upload preview"
              style={{
                width: "72px",
                height: "72px",
                objectFit: "cover",
                flexShrink: 0,
              }}
            />
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ fontSize: "13px", color: "var(--cream)", marginBottom: "4px" }}>
                Photo ready ✓
              </p>
              <p style={{ fontSize: "11px", color: "var(--muted)" }}>
                Will appear as corner overlay on the meme
              </p>
            </div>
            <button
              onClick={clearImage}
              style={{
                background: "transparent",
                border: "1px solid var(--border)",
                color: "var(--muted)",
                fontSize: "12px",
                padding: "6px 12px",
                cursor: "pointer",
                flexShrink: 0,
                fontFamily: "var(--font-lato)",
              }}
            >
              Remove
            </button>
          </div>
        ) : (
          /* Drop zone when no image */
          <div
            onClick={() => fileRef.current?.click()}
            onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
            style={{
              border: `1px dashed ${isDragging ? "var(--gold)" : "var(--border)"}`,
              background: isDragging ? "rgba(196,165,90,0.04)" : "var(--bg-elevated)",
              cursor: "pointer",
              transition: "all 0.2s",
              height: "120px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexDirection: "column",
              gap: "6px",
            }}
          >
            <div style={{ fontSize: "24px", opacity: 0.4 }}>↑</div>
            <p style={{ fontSize: "13px", color: "var(--muted)" }}>
              Drop photo or click to upload
            </p>
            <p style={{ fontSize: "11px", color: "var(--muted)" }}>
              JPG, PNG, WEBP · max 8MB
            </p>
          </div>
        )}

        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          style={{ display: "none" }}
          onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
        />
      </div>

      {/* Prompt */}
      <div style={{ marginBottom: "16px" }}>
        <label className="label" style={{ display: "block", marginBottom: "8px" }}>
          What's the Vibe? *
        </label>
        <textarea
          className="input-field"
          placeholder="e.g. me showing up to work on Monday pretending I'm fine... Enim energy only"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          maxLength={500}
        />
        <div style={{ fontSize: "11px", color: "var(--muted)", textAlign: "right", marginTop: "4px" }}>
          {prompt.length}/500
        </div>
      </div>

      {/* X Handle */}
      <div style={{ marginBottom: "24px" }}>
        <label className="label" style={{ display: "block", marginBottom: "8px" }}>
          Your X Handle (optional)
        </label>
        <input
          type="text"
          className="input-field"
          placeholder="@yourhandle"
          value={xHandle}
          onChange={(e) => setXHandle(e.target.value)}
          maxLength={50}
        />
      </div>

      {error && (
        <p
          style={{
            fontSize: "13px",
            color: "var(--red)",
            marginBottom: "16px",
            padding: "10px 14px",
            background: "rgba(232,84,84,0.08)",
            border: "1px solid rgba(232,84,84,0.2)",
          }}
        >
          {error}
        </p>
      )}

      <button
        className="btn-primary"
        onClick={handleSubmit}
        disabled={loading}
        style={{ width: "100%", fontSize: "15px", padding: "16px" }}
      >
        {loading ? (
          <>
            <span
              style={{
                display: "inline-block",
                width: "14px",
                height: "14px",
                border: "2px solid rgba(13,10,26,0.3)",
                borderTopColor: "#0D0A1A",
                borderRadius: "50%",
                animation: "spin 0.7s linear infinite",
              }}
            />
            Enim is cooking...
          </>
        ) : (
          "Generate Meme →"
        )}
      </button>
    </div>
  );
}
