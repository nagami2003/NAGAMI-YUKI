import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const reports = await prisma.report.findMany({
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(reports);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "サーバーエラー" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const report = await prisma.report.create({
      data: {
        title: body.title,
        type: body.type,
        period: body.period,
        status: body.status || "draft",
        notes: body.notes || null,
        submittedAt: body.status === "submitted" ? new Date() : null,
      },
    });

    return NextResponse.json(report, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "登録に失敗しました" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();

    const report = await prisma.report.update({
      where: { id: body.id },
      data: {
        status: body.status,
        submittedAt: body.status === "submitted" ? new Date() : undefined,
        notes: body.notes,
      },
    });

    return NextResponse.json(report);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "更新に失敗しました" }, { status: 500 });
  }
}
