"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Trash2, FileText, BookOpen } from "lucide-react";

type NoteSummary = {
  id: string;
  title: string;
  pdfUrl: string | null;
  epubUrl: string | null;
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
    if (!window.confirm("Delete this note?")) return;
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
    <div className="max-w-3xl mx-auto px-4 py-6 w-full">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-semibold text-[#323130] dark:text-[#e1dfdd]">
          Notes
        </h1>
        <button
          onClick={createNote}
          className="flex items-center gap-2 px-3 py-1.5 text-sm bg-[#0078d4] text-white rounded-sm hover:bg-[#005a9e] transition cursor-pointer"
        >
          <Plus size={16} />
          New
        </button>
      </div>

      {loading ? (
        <div className="text-center text-[#8a8886] py-12 text-sm">Loading...</div>
      ) : notes.length === 0 ? (
        <div className="text-center text-[#8a8886] py-12">
          <FileText size={40} className="mx-auto mb-3 opacity-40" />
          <p className="text-sm">No notes yet</p>
        </div>
      ) : (
        <div className="bg-white dark:bg-[#252526] border border-[#e1dfdd] dark:border-[#3b3a39]">
          {notes.map((note, i) => (
            <div
              key={note.id}
              onClick={() => router.push(`/notes/${note.id}`)}
              className={`flex items-center justify-between px-4 py-4 sm:py-3 cursor-pointer transition group ${
                i !== notes.length - 1 ? "border-b border-[#e1dfdd] dark:border-[#3b3a39]" : ""
              } hover:bg-[#f3f2f1] dark:hover:bg-[#37373d]`}
            >
              <div className="min-w-0 flex-1">
                <h2 className="text-sm font-medium text-[#323130] dark:text-[#e1dfdd] truncate flex items-center gap-1.5">
                  {note.epubUrl && <BookOpen size={12} className="text-[#0078d4] shrink-0" />}
                  {note.pdfUrl && <FileText size={12} className="text-[#0078d4] shrink-0" />}
                  {note.title}
                </h2>
                <p className="text-xs text-[#8a8886] mt-0.5">
                  {formatDate(note.updatedAt)}
                </p>
              </div>
              <button
                onClick={(e) => deleteNote(e, note.id)}
                className="p-2 sm:p-1 text-[#8a8886] hover:text-[#d92c2c] sm:opacity-0 sm:group-hover:opacity-100 transition cursor-pointer"
                title="Delete note"
              >
                <Trash2 size={14} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
