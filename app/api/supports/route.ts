import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const workerId = searchParams.get("workerId");

    const supports = await prisma.support.findMany({
      where: workerId ? { workerId } : {},
      include: { worker: { select: { name: true, nationality: true } } },
      orderBy: { createdAt: "asc" },
    });

    return NextResponse.json(supports);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "サーバーエラー" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, status, notes } = body;

    const support = await prisma.support.update({
      where: { id },
      data: {
        status,
        notes: notes || null,
        completedAt: status === "completed" ? new Date() : null,
      },
    });

    return NextResponse.json(support);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "更新に失敗しました" }, { status: 500 });
  }
}
