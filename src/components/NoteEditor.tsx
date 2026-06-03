"use client";

import { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { Trash2 } from "lucide-react";

const Editor = dynamic(() => import("@/components/Editor"), { ssr: false });
const PdfViewer = dynamic(() => import("@/components/PdfViewer"), { ssr: false });
const EpubViewer = dynamic(() => import("@/components/EpubViewer"), { ssr: false });

type Note = {
  id: string;
  title: string;
  content: Record<string, unknown> | null;
  pdfUrl: string | null;
  epubUrl: string | null;
  updatedAt: string;
};

type NoteEditorProps = {
  noteId: string | null;
  onDelete?: () => void;
};

export default function NoteEditor({ noteId, onDelete }: NoteEditorProps) {
  const [note, setNote] = useState<Note | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [savedAt, setSavedAt] = useState<string | null>(null);
  const [saveError, setSaveError] = useState(false);
  const titleRef = useRef<HTMLInputElement>(null);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!noteId) {
      setNote(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    setNote(null);
    fetch(`/api/notes/${noteId}`)
      .then((res) => res.json())
      .then((data) => {
        setNote(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [noteId]);

  useEffect(() => {
    if ("ontouchstart" in window) return;
    if (!loading && note) titleRef.current?.focus();
  }, [loading, note]);

  const save = async (data: Partial<Note>) => {
    if (!noteId) return;
    setSaving(true);
    setSaveError(false);
    const res = await fetch(`/api/notes/${noteId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (res.ok) {
      const updated = await res.json();
      setNote(updated);
      setSavedAt(new Date().toLocaleTimeString());
    } else {
      setSaveError(true);
    }
    setSaving(false);
  };

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTitle = e.target.value;
    setNote((prev) => (prev ? { ...prev, title: newTitle } : null));
    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    saveTimeoutRef.current = setTimeout(() => {
      save({ title: newTitle });
    }, 800);
  };

  const handlePdfUpload = (url: string) => {
    save({ pdfUrl: url });
  };

  const handlePdfRemove = () => {
    save({ pdfUrl: null });
  };

  const handleEpubUpload = (url: string) => {
    save({ epubUrl: url });
  };

  const handleEpubRemove = () => {
    save({ epubUrl: null });
  };

  const handleContentUpdate = (doc: Record<string, unknown>) => {
    if (note?.title === "Untitled") {
      const content = (doc as { content?: { type?: string; content?: { text?: string }[] }[] }).content;
      const firstTextNode = content?.find((n) => n.type === "paragraph");
      const text = firstTextNode?.content?.[0]?.text || "";
      if (text.trim()) {
        save({ title: text.trim().slice(0, 80), content: doc });
        return;
      }
    }
    save({ content: doc });
  };

  const deleteNote = async () => {
    if (!noteId || !window.confirm("Delete this tile?")) return;
    await fetch(`/api/notes/${noteId}`, { method: "DELETE" });
    onDelete?.();
  };

  if (!noteId) {
    return (
      <div className="flex items-center justify-center h-full text-[#8a8886] text-sm">
        Select a note or create a new one
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full text-[#8a8886] text-sm">
        Loading...
      </div>
    );
  }

  if (!note) {
    return (
      <div className="flex items-center justify-center h-full text-[#8a8886] text-sm">
        Note not found.
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between mb-3 pb-3 border-b border-[#e1dfdd] dark:border-[#3b3a39] shrink-0">
        <div className="flex items-center gap-3">
          {saving && (
            <span className="text-xs text-[#8a8886]">Saving...</span>
          )}
          {saveError && (
            <span className="text-xs text-[#d92c2c]">Failed to save</span>
          )}
          {savedAt && !saving && !saveError && (
            <span className="text-xs text-[#8a8886]">
              Saved at {savedAt}
            </span>
          )}
        </div>
        <button
          onClick={deleteNote}
          className="flex items-center gap-1.5 px-2 py-1 text-xs text-[#8a8886] hover:text-[#d92c2c] hover:bg-[#f3f2f1] dark:hover:bg-[#37373d] transition cursor-pointer"
        >
          <Trash2 size={14} />
          Delete
        </button>
      </div>

      <input
        ref={titleRef}
        type="text"
        value={note.title}
        onChange={handleTitleChange}
        className="w-full text-2xl font-semibold bg-transparent border-none outline-none mb-5 text-[#323130] dark:text-[#e1dfdd] placeholder-[#8a8886] shrink-0"
        placeholder="Note title..."
      />

      <div className="flex-1 overflow-y-auto min-h-0">
        {note.pdfUrl && (
          <PdfViewer pdfUrl={note.pdfUrl} onRemove={handlePdfRemove} />
        )}

        {note.epubUrl && (
          <EpubViewer epubUrl={note.epubUrl} onRemove={handleEpubRemove} />
        )}

        <Editor content={note.content} onUpdate={handleContentUpdate} onPdfUpload={handlePdfUpload} onEpubUpload={handleEpubUpload} />
      </div>
    </div>
  );
}
