"use client";

import { useEffect, useState } from "react";
import { Plus, Trash2, FileText, BookOpen, ArrowLeft, PanelLeftClose, PanelLeftOpen } from "lucide-react";
import NoteEditor from "@/components/NoteEditor";

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
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);

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
      setNotes((prev) => [note, ...prev]);
      setSelectedId(note.id);
    }
  };

  const deleteNote = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (!window.confirm("Delete this tile?")) return;
    const res = await fetch(`/api/notes/${id}`, { method: "DELETE" });
    if (res.ok) {
      setNotes((prev) => prev.filter((n) => n.id !== id));
      if (selectedId === id) setSelectedId(null);
    }
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

  const selectedNote = notes.find((n) => n.id === selectedId);

  return (
    <div className="h-screen flex">
      {/* Sidebar */}
      <aside className={`shrink-0 border-r border-[#e1dfdd] dark:border-[#3b3a39] bg-[#faf9f8] dark:bg-[#2d2d2d] flex flex-col overflow-hidden transition-all duration-200 ${sidebarOpen ? "w-72 lg:w-80" : "w-0"} ${selectedId && !sidebarOpen ? "hidden md:flex" : selectedId ? "hidden md:flex" : "flex"}`}>
        <div className="flex items-center justify-between px-4 py-3 border-b border-[#e1dfdd] dark:border-[#3b3a39] shrink-0 min-w-0">
          <h1 className="text-sm font-semibold text-[#323130] dark:text-[#e1dfdd] whitespace-nowrap">
            Tiles
          </h1>
          <div className="flex items-center gap-1">
            <button
              onClick={createNote}
              className="flex items-center gap-1.5 px-2 py-1 text-xs bg-[#0078d4] text-white rounded-sm hover:bg-[#005a9e] transition cursor-pointer whitespace-nowrap"
            >
              <Plus size={14} />
              New
            </button>
            <button
              onClick={() => setSidebarOpen(false)}
              className="p-1 text-[#8a8886] hover:text-[#323130] dark:hover:text-[#e1dfdd] transition cursor-pointer"
              title="Collapse sidebar"
            >
              <PanelLeftClose size={16} />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="text-center text-[#8a8886] py-8 text-sm">Loading...</div>
          ) : notes.length === 0 ? (
            <div className="text-center text-[#8a8886] py-12 px-4">
              <FileText size={32} className="mx-auto mb-2 opacity-40" />
              <p className="text-sm">No notes yet</p>
            </div>
          ) : (
            notes.map((note, i) => (
              <div
                key={note.id}
                onClick={() => setSelectedId(note.id)}
                className={`flex items-center justify-between px-4 py-3 cursor-pointer transition group ${
                  note.id === selectedId
                    ? "bg-[#deecf9] dark:bg-[#37373d]"
                    : "hover:bg-[#f3f2f1] dark:hover:bg-[#333333]"
                } ${i !== notes.length - 1 ? "border-b border-[#e1dfdd] dark:border-[#3b3a39]" : ""}`}
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
                  className="p-1 text-[#8a8886] hover:text-[#d92c2c] opacity-0 group-hover:opacity-100 transition cursor-pointer"
                  title="Delete note"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))
          )}
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 flex flex-col min-w-0 bg-white dark:bg-[#1b1a1a]">
        <div className="flex items-center shrink-0 border-b border-[#e1dfdd] dark:border-[#3b3a39] min-h-0">
          {!sidebarOpen && (
            <button
              onClick={() => setSidebarOpen(true)}
              className="hidden md:flex items-center gap-1 px-3 py-2 text-xs text-[#8a8886] hover:text-[#323130] dark:hover:text-[#e1dfdd] transition cursor-pointer border-r border-[#e1dfdd] dark:border-[#3b3a39]"
              title="Expand sidebar"
            >
              <PanelLeftOpen size={16} />
            </button>
          )}
          {selectedId && (
            <div className="md:hidden flex items-center px-4 py-2">
              <button
                onClick={() => setSelectedId(null)}
                className="flex items-center gap-1 text-xs text-[#0078d4] hover:underline transition cursor-pointer"
              >
                <ArrowLeft size={14} />
                Back to notes
              </button>
            </div>
          )}
        </div>
        <div className="flex-1 px-4 py-4 overflow-y-auto min-h-0">
          <NoteEditor
            noteId={selectedId}
            onDelete={() => setSelectedId(null)}
          />
        </div>
      </main>
    </div>
  );
}
