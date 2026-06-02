"use client";

import { useState } from "react";
import { X, FileText, ChevronDown, ChevronRight } from "lucide-react";

type PdfViewerProps = {
  pdfUrl: string;
  onRemove: () => void;
};

export default function PdfViewer({ pdfUrl, onRemove }: PdfViewerProps) {
  const [collapsed, setCollapsed] = useState(false);
  const filename = pdfUrl.split("/").pop() || "document.pdf";

  return (
    <div className="border border-[#e1dfdd] dark:border-[#3b3a39] bg-white dark:bg-[#252526] mb-4">
      <div className="flex items-center justify-between px-3 py-2 bg-[#faf9f8] dark:bg-[#2d2d2d] border-b border-[#e1dfdd] dark:border-[#3b3a39]">
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="flex items-center gap-2 text-xs text-[#323130] dark:text-[#e1dfdd] cursor-pointer"
        >
          {collapsed ? <ChevronRight size={14} /> : <ChevronDown size={14} />}
          <FileText size={14} />
          <span className="font-medium truncate max-w-[300px]">{filename}</span>
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
        <object
          data={pdfUrl}
          type="application/pdf"
          className="w-full h-[60vh] bg-[#f3f2f1] dark:bg-[#1e1e1e]"
        >
          <div className="flex items-center justify-center h-full text-sm text-[#8a8886]">
            <a
              href={pdfUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#0078d4] hover:underline"
            >
              Open PDF in new tab
            </a>
          </div>
        </object>
      </div>
    </div>
  );
}
