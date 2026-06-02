"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Trash2, FileText } from "lucide-react";

type NoteSummary = {
  id: string;
  title: string;
  updatedAt: string;
  createdAt: string;
};

export default function Home() {
  const [notes, setNotes] = useState<NoteSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const fetchNotes = async () => {
    const res = await fetch("/api/notes");
    if (res.ok) setNotes(await res.json());
    setLoading(false);
  };

  useEffect(() => {
    fetchNotes();
  }, []);

  const createNote = async () => {
    const res = await fetch("/api/notes", { method: "POST" });
    if (res.ok) {
      const note = await res.json();
      router.push(`/notes/${note.id}`);
    }
  };

  const deleteNote = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    const res = await fetch(`/api/notes/${id}`, { method: "DELETE" });
    if (res.ok) fetchNotes();
  };

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 w-full">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-neutral-900 dark:text-white">
          My Notes
        </h1>
        <button
          onClick={createNote}
          className="flex items-center gap-2 px-4 py-2 bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 rounded-lg hover:bg-neutral-700 dark:hover:bg-neutral-200 transition cursor-pointer"
        >
          <Plus size={20} />
          New Note
        </button>
      </div>

      {loading ? (
        <div className="text-center text-neutral-500 py-12">Loading...</div>
      ) : notes.length === 0 ? (
        <div className="text-center text-neutral-500 py-12">
          <FileText size={48} className="mx-auto mb-4 opacity-50" />
          <p className="text-lg">No notes yet. Create your first one!</p>
        </div>
      ) : (
        <div className="space-y-2">
          {notes.map((note) => (
            <div
              key={note.id}
              onClick={() => router.push(`/notes/${note.id}`)}
              className="flex items-center justify-between p-4 rounded-lg border border-neutral-200 dark:border-neutral-700 hover:border-neutral-400 dark:hover:border-neutral-500 hover:shadow-sm transition cursor-pointer group"
            >
              <div className="min-w-0 flex-1">
                <h2 className="font-medium text-neutral-900 dark:text-white truncate">
                  {note.title}
                </h2>
                <p className="text-sm text-neutral-500 mt-0.5">
                  {formatDate(note.updatedAt)}
                </p>
              </div>
              <button
                onClick={(e) => deleteNote(e, note.id)}
                className="p-2 text-neutral-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition cursor-pointer"
                title="Delete note"
              >
                <Trash2 size={18} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
