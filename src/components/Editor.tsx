"use client";

import { useEffect, useRef, forwardRef, useImperativeHandle } from "react";
import { useEditor, EditorContent } from "@tiptap/react";

import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import { Bold, Italic, List, ListOrdered, Heading2, ImageIcon, FileText, BookOpen } from "lucide-react";

export type EditorHandle = {
  getContent: () => Record<string, unknown>;
};

type EditorProps = {
  content: Record<string, unknown> | null;
  onUpdate: (json: Record<string, unknown>) => void;
  onPdfUpload?: (url: string) => void;
  onEpubUpload?: (url: string) => void;
};

const Editor = forwardRef<EditorHandle, EditorProps>(function Editor({ content, onUpdate, onPdfUpload, onEpubUpload }, ref) {
  useImperativeHandle(ref, () => ({
    getContent: () => editor?.getJSON() ?? { type: "doc", content: [] },
  }));
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  const editor = useEditor({
    extensions: [
      StarterKit,
      Image.configure({ inline: false, allowBase64: true }),
    ],
    content: content ?? {
      type: "doc",
      content: [{ type: "paragraph" }],
    },
    editorProps: {
      attributes: {
        class:
          "prose prose-sm sm:prose-base dark:prose-invert max-w-none focus:outline-none min-h-[300px] px-4 py-2 text-[#323130] dark:text-[#e1dfdd]",
      },
    },
    onUpdate: ({ editor: ed }) => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => {
        onUpdate(ed.getJSON());
      }, 1000);
    },
  });

  useEffect(() => {
    if (editor && content && !editor.isDestroyed) {
      const currentJson = editor.getJSON();
      if (JSON.stringify(currentJson) !== JSON.stringify(content)) {
        editor.commands.setContent(content);
      }
    }
  }, [content, editor]);

  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  const addImage = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.onchange = async () => {
      const file = input.files?.[0];
      if (!file) return;
      const form = new FormData();
      form.append("file", file);
      try {
        const res = await fetch("/api/upload", { method: "POST", body: form });
        if (res.ok) {
          const { url } = await res.json();
          editor.chain().focus().setImage({ src: url }).run();
        }
      } catch {}
    };
    input.click();
  };

  const addPdf = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "application/pdf";
    input.onchange = async () => {
      const file = input.files?.[0];
      if (!file) return;
      const form = new FormData();
      form.append("file", file);
      try {
        const res = await fetch("/api/upload", { method: "POST", body: form });
        if (res.ok) {
          const { url } = await res.json();
          onPdfUpload?.(url);
        }
      } catch {}
    };
    input.click();
  };

  const addEpub = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".epub,application/epub+zip";
    input.onchange = async () => {
      const file = input.files?.[0];
      if (!file) return;
      const form = new FormData();
      form.append("file", file);
      try {
        const res = await fetch("/api/upload", { method: "POST", body: form });
        if (res.ok) {
          const { url } = await res.json();
          onEpubUpload?.(url);
        }
      } catch {}
    };
    input.click();
  };

  if (!editor) return null;

  const ToolButton = ({
    active,
    onClick,
    children,
  }: {
    active: boolean;
    onClick: () => void;
    children: React.ReactNode;
  }) => (
    <button
      type="button"
      onClick={onClick}
      className={`shrink-0 p-2.5 sm:p-1.5 rounded-sm hover:bg-[#e1dfdd] dark:hover:bg-[#3b3a39] transition ${
        active
          ? "bg-[#deecf9] dark:bg-[#37373d] text-[#0078d4] dark:text-[#0078d4]"
          : "text-[#605e5c] dark:text-[#8a8886]"
      }`}
    >
      {children}
    </button>
  );

  return (
    <div className="border border-[#e1dfdd] dark:border-[#3b3a39] bg-white dark:bg-[#252526]">
      <div className="flex items-center gap-0.5 sm:gap-1 px-2 py-1 border-b border-[#e1dfdd] dark:border-[#3b3a39] bg-[#faf9f8] dark:bg-[#2d2d2d] overflow-x-auto flex-nowrap">
        <ToolButton
          active={editor.isActive("bold")}
          onClick={() => editor.chain().focus().toggleBold().run()}
        >
          <Bold size={17} />
        </ToolButton>
        <ToolButton
          active={editor.isActive("italic")}
          onClick={() => editor.chain().focus().toggleItalic().run()}
        >
          <Italic size={17} />
        </ToolButton>
        <div className="shrink-0 w-px h-5 sm:h-4 bg-[#e1dfdd] dark:bg-[#3b3a39] mx-0.5 sm:mx-1" />
        <ToolButton
          active={editor.isActive("heading", { level: 2 })}
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 2 }).run()
          }
        >
          <Heading2 size={17} />
        </ToolButton>
        <div className="shrink-0 w-px h-5 sm:h-4 bg-[#e1dfdd] dark:bg-[#3b3a39] mx-0.5 sm:mx-1" />
        <ToolButton
          active={editor.isActive("bulletList")}
          onClick={() => editor.chain().focus().toggleBulletList().run()}
        >
          <List size={17} />
        </ToolButton>
        <ToolButton
          active={editor.isActive("orderedList")}
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
        >
          <ListOrdered size={17} />
        </ToolButton>
        <div className="shrink-0 w-px h-5 sm:h-4 bg-[#e1dfdd] dark:bg-[#3b3a39] mx-0.5 sm:mx-1" />
        <ToolButton active={false} onClick={addImage}>
          <ImageIcon size={17} />
        </ToolButton>
        <ToolButton active={false} onClick={addPdf}>
          <FileText size={17} />
        </ToolButton>
        <ToolButton active={false} onClick={addEpub}>
          <BookOpen size={17} />
        </ToolButton>
      </div>
      <EditorContent editor={editor} />
    </div>
  );
});

export default Editor;
