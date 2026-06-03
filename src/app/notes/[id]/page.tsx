"use client";

import { use } from "react";
import { useRouter } from "next/navigation";
import NoteEditor from "@/components/NoteEditor";

export default function NotePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();

  return (
    <div className="h-full px-4 py-4 overflow-y-auto">
      <NoteEditor
        noteId={id}
        onDelete={() => router.push("/")}
      />
    </div>
  );
}
