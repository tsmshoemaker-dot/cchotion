import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const notes = await prisma.note.findMany({
      orderBy: { updatedAt: "desc" },
      select: { id: true, title: true, pdfUrl: true, epubUrl: true, updatedAt: true, createdAt: true },
    });
    return NextResponse.json(notes);
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch notes" },
      { status: 500 }
    );
  }
}

export async function POST() {
  try {
    const note = await prisma.note.create({
      data: {
        title: "Untitled",
        content: {
          type: "doc",
          content: [{ type: "paragraph" }],
        },
      },
    });
    return NextResponse.json(note, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "Failed to create note" },
      { status: 500 }
    );
  }
}
