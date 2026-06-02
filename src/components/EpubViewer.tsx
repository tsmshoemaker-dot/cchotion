"use client";

import { useEffect, useRef, useState } from "react";
import { X, BookOpen, ChevronDown, ChevronRight, ChevronLeft, ChevronRight as ChevronRightNav } from "lucide-react";

type EpubViewerProps = {
  epubUrl: string;
  onRemove: () => void;
};

export default function EpubViewer({ epubUrl, onRemove }: EpubViewerProps) {
  const [collapsed, setCollapsed] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [bookTitle, setBookTitle] = useState("");
  const [atStart, setAtStart] = useState(true);
  const [atEnd, setAtEnd] = useState(false);
  const viewerRef = useRef<HTMLDivElement>(null);
  const renditionRef = useRef<any>(null);

  const filename = epubUrl.split("/").pop() || "document.epub";

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const ePub = (await import("epubjs")).default;
        const book = ePub(epubUrl);
        await book.ready;

        if (cancelled) return;

        try {
          const meta = (book as any).packaging?.metadata;
          if (meta?.title) setBookTitle(meta.title);
        } catch {} // metadata is optional

        const rendition = book.renderTo(viewerRef.current!, {
          width: "100%",
          height: "100%",
          spread: "none",
          flow: "paginated",
          allowScriptedContent: false,
        });
        renditionRef.current = rendition;

        rendition.on("relocated", (loc: { atStart: boolean; atEnd: boolean }) => {
          setAtStart(loc.atStart);
          setAtEnd(loc.atEnd);
        });

        if (document.documentElement.classList.contains("dark")) {
          rendition.themes.register("dark", {
            body: { color: "#e1dfdd", background: "#1e1e1e" },
            a: { color: "#0078d4" },
          });
          rendition.themes.select("dark");
        }

        await rendition.display();

        if (!cancelled) setLoading(false);
      } catch {
        if (!cancelled) {
          setError(true);
          setLoading(false);
        }
      }
    })();

    return () => {
      cancelled = true;
      renditionRef.current?.destroy();
    };
  }, [epubUrl]);

  useEffect(() => {
    const observer = new MutationObserver(() => {
      const r = renditionRef.current;
      if (!r) return;
      const isDark = document.documentElement.classList.contains("dark");
      if (isDark) {
        r.themes.register("dark", {
          body: { color: "#e1dfdd", background: "#1e1e1e" },
          a: { color: "#0078d4" },
        });
        r.themes.select("dark");
      } else {
        r.themes.select("default");
      }
    });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
    return () => observer.disconnect();
  }, []);

  const handleToggle = () => {
    setCollapsed((c) => {
      if (c) {
        setTimeout(() => renditionRef.current?.resize?.(), 50);
      }
      return !c;
    });
  };

  const goPrev = () => renditionRef.current?.prev();
  const goNext = () => renditionRef.current?.next();

  return (
    <div className="border border-[#e1dfdd] dark:border-[#3b3a39] bg-white dark:bg-[#252526] mb-4">
      <div className="flex items-center justify-between px-3 py-2 bg-[#faf9f8] dark:bg-[#2d2d2d] border-b border-[#e1dfdd] dark:border-[#3b3a39]">
        <button
          onClick={handleToggle}
          className="flex items-center gap-2 text-xs text-[#323130] dark:text-[#e1dfdd] cursor-pointer"
        >
          {collapsed ? <ChevronRight size={14} /> : <ChevronDown size={14} />}
          <BookOpen size={14} />
          <span className="font-medium truncate max-w-[300px]">{bookTitle || filename}</span>
        </button>
        <button
          onClick={onRemove}
          className="flex items-center gap-1 text-xs text-[#8a8886] hover:text-[#d92c2c] transition cursor-pointer"
        >
          <X size={14} />
          Remove
        </button>
      </div>
      <div style={{ display: collapsed ? "none" : "block" }}>
        <div
          ref={viewerRef}
          className="w-full h-[60vh] bg-[#f3f2f1] dark:bg-[#1e1e1e]"
        >
          {loading && (
            <div className="flex items-center justify-center h-full text-xs text-[#8a8886]">
              Loading EPUB...
            </div>
          )}
          {error && (
            <div className="flex items-center justify-center h-full text-xs text-[#d92c2c]">
              Failed to load EPUB.
            </div>
          )}
        </div>
        {!loading && !error && (
          <div className="flex items-center justify-between px-3 py-2 bg-[#faf9f8] dark:bg-[#2d2d2d] border-t border-[#e1dfdd] dark:border-[#3b3a39]">
            <button
              onClick={goPrev}
              disabled={atStart}
              className="flex items-center gap-1 text-xs text-[#0078d4] disabled:text-[#8a8886] disabled:cursor-not-allowed hover:underline transition cursor-pointer"
            >
              <ChevronLeft size={14} />
              Previous
            </button>
            <button
              onClick={goNext}
              disabled={atEnd}
              className="flex items-center gap-1 text-xs text-[#0078d4] disabled:text-[#8a8886] disabled:cursor-not-allowed hover:underline transition cursor-pointer"
            >
              Next
              <ChevronRightNav size={14} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
