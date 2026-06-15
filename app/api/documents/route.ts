import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const workerId = searchParams.get("workerId");

    const documents = await prisma.document.findMany({
      where: workerId ? { workerId } : {},
      include: {
        worker: { select: { name: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(documents);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "サーバーエラー" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const document = await prisma.document.create({
      data: {
        workerId: body.workerId,
        name: body.name,
        type: body.type,
        expiresAt: body.expiresAt ? new Date(body.expiresAt) : null,
        notes: body.notes || null,
      },
      include: {
        worker: { select: { name: true } },
      },
    });

    return NextResponse.json(document, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "登録に失敗しました" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ error: "IDが必要です" }, { status: 400 });

    await prisma.document.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "削除に失敗しました" }, { status: 500 });
  }
}
