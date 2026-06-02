"use client";

import { use, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { ArrowLeft, Trash2 } from "lucide-react";

const Editor = dynamic(() => import("@/components/Editor"), { ssr: false });

type Note = {
  id: string;
  title: string;
  content: Record<string, unknown> | null;
  updatedAt: string;
};

export default function NotePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const [note, setNote] = useState<Note | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savedAt, setSavedAt] = useState<string | null>(null);
  const titleRef = useRef<HTMLInputElement>(null);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    fetch(`/api/notes/${id}`)
      .then((res) => res.json())
      .then((data) => {
        setNote(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [id]);

  const save = async (data: Partial<Note>) => {
    setSaving(true);
    const res = await fetch(`/api/notes/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (res.ok) {
      const updated = await res.json();
      setNote(updated);
      setSavedAt(new Date().toLocaleTimeString());
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
    await fetch(`/api/notes/${id}`, { method: "DELETE" });
    router.push("/");
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen text-neutral-500">
        Loading...
      </div>
    );
  }

  if (!note) {
    return (
      <div className="flex items-center justify-center min-h-screen text-neutral-500">
        Note not found.
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-6 w-full">
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={() => router.push("/")}
          className="flex items-center gap-2 text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white transition cursor-pointer"
        >
          <ArrowLeft size={20} />
          Back
        </button>
        <div className="flex items-center gap-4">
          {saving && (
            <span className="text-sm text-neutral-400">Saving...</span>
          )}
          {savedAt && !saving && (
            <span className="text-sm text-neutral-400">
              Saved at {savedAt}
            </span>
          )}
          <button
            onClick={deleteNote}
            className="flex items-center gap-2 px-3 py-1.5 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition cursor-pointer"
          >
            <Trash2 size={16} />
            Delete
          </button>
        </div>
      </div>

      <input
        ref={titleRef}
        type="text"
        value={note.title}
        onChange={handleTitleChange}
        className="w-full text-3xl font-bold bg-transparent border-none outline-none mb-6 text-neutral-900 dark:text-white placeholder-neutral-400"
        placeholder="Note title..."
      />

      <Editor content={note.content} onUpdate={handleContentUpdate} />
    </div>
  );
}
