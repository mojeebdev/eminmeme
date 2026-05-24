"use client";

import {
  useState,
  useEffect,
  useImperativeHandle,
  forwardRef,
  useCallback,
} from "react";
import Image from "next/image";
import Link from "next/link";
import { Meme } from "@/types";
import { supabase } from "@/lib/supabase";

const PAGE_SIZE = 12;

export interface MemeWallHandle {
  refresh: () => void;
}

const MemeWall = forwardRef<MemeWallHandle>((_, ref) => {
  const [memes, setMemes] = useState<Meme[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(0);

  const fetchMemes = useCallback(async (reset = false) => {
    setLoading(true);
    const from = reset ? 0 : page * PAGE_SIZE;
    const to = from + PAGE_SIZE - 1;

    const { data, error } = await supabase
      .from("memes")
      .select("*")
      .order("created_at", { ascending: false })
      .range(from, to);

    if (!error && data) {
      setMemes((prev) => (reset ? data : [...prev, ...data]));
      setHasMore(data.length === PAGE_SIZE);
      if (!reset) setPage((p) => p + 1);
      else setPage(1);
    }
    setLoading(false);
  }, [page]);

  useImperativeHandle(ref, () => ({
    refresh: () => fetchMemes(true),
  }));

  useEffect(() => {
    fetchMemes(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function formatTime(iso: string) {
    return new Date(iso).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  if (loading && memes.length === 0) {
    return (
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
          gap: "20px",
        }}
      >
        {[...Array(6)].map((_, i) => (
          <div key={i}>
            <div
              className="skeleton"
              style={{ aspectRatio: "1 / 1", borderRadius: "24px" }}
            />
            <div
              className="skeleton"
              style={{ height: "14px", borderRadius: "4px", marginTop: "12px", width: "70%" }}
            />
          </div>
        ))}
      </div>
    );
  }

  if (!loading && memes.length === 0) {
    return (
      <div
        style={{
          textAlign: "center",
          padding: "80px 24px",
          border: "1px dashed var(--border)",
          borderRadius: "24px",
        }}
      >
        <p
          style={{
            fontFamily: "var(--font-playfair)",
            fontStyle: "italic",
            fontSize: "20px",
            color: "var(--muted)",
          }}
        >
          No memes yet. Be the first bozo.
        </p>
      </div>
    );
  }

  return (
    <div>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
          gap: "20px",
        }}
      >
        {memes.map((meme, idx) => (
          <Link
            key={meme.id}
            href={`/meme/${meme.slug}`}
            style={{ textDecoration: "none" }}
          >
            <div style={{ cursor: "pointer" }}>
              {/* Rounded square frame — objectFit contain, no crop */}
              <div
                style={{
                  borderRadius: "24px",
                  overflow: "hidden",
                  border: "1px solid var(--border)",
                  background: "var(--bg-card)",
                  aspectRatio: "1 / 1",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  transition: "border-color 0.2s, box-shadow 0.2s",
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLDivElement).style.borderColor = "var(--border-hover)";
                  (e.currentTarget as HTMLDivElement).style.boxShadow = "var(--glow-gold)";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLDivElement).style.borderColor = "var(--border)";
                  (e.currentTarget as HTMLDivElement).style.boxShadow = "none";
                }}
              >
                <Image
                  src={meme.meme_output_url}
                  alt={meme.prompt}
                  width={400}
                  height={400}
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "contain",
                    display: "block",
                  }}
                  sizes="(max-width: 768px) 100vw, 33vw"
                  priority={idx < 3}
                  unoptimized
                />
              </div>

              {/* Meta below frame */}
              <div style={{ padding: "10px 4px 0" }}>
                <p
                  style={{
                    fontSize: "13px",
                    color: "var(--cream)",
                    marginBottom: "4px",
                    lineHeight: 1.4,
                    display: "-webkit-box",
                    WebkitLineClamp: 1,
                    WebkitBoxOrient: "vertical",
                    overflow: "hidden",
                  }}
                >
                  {meme.prompt}
                </p>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <span style={{ fontSize: "11px", color: "var(--muted)" }}>
                    {formatTime(meme.created_at)}
                  </span>
                  {meme.x_handle && (
                    <span style={{ fontSize: "11px", color: "var(--gold-dim)", fontWeight: 700 }}>
                      @{meme.x_handle}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {hasMore && (
        <div style={{ textAlign: "center", marginTop: "40px" }}>
          <button
            className="btn-ghost"
            onClick={() => fetchMemes(false)}
            disabled={loading}
          >
            {loading ? "Loading..." : "Load More"}
          </button>
        </div>
      )}
    </div>
  );
});

MemeWall.displayName = "MemeWall";
export default MemeWall;
