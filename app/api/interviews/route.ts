import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const workerId = searchParams.get("workerId");
    const status = searchParams.get("status");

    const interviews = await prisma.interview.findMany({
      where: {
        ...(workerId ? { workerId } : {}),
        ...(status ? { status } : {}),
      },
      include: {
        worker: { select: { name: true, nationality: true, employer: true } },
      },
      orderBy: { scheduledAt: "asc" },
    });

    return NextResponse.json(interviews);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "サーバーエラー" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const interview = await prisma.interview.create({
      data: {
        workerId: body.workerId,
        scheduledAt: new Date(body.scheduledAt),
        interviewer: body.interviewer || null,
        quarter: body.quarter || null,
        status: "scheduled",
      },
      include: {
        worker: { select: { name: true } },
      },
    });

    return NextResponse.json(interview, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "登録に失敗しました" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, status, notes, concerns, conductedAt } = body;

    const interview = await prisma.interview.update({
      where: { id },
      data: {
        status,
        notes: notes || null,
        concerns: concerns || null,
        conductedAt: conductedAt ? new Date(conductedAt) : null,
      },
    });

    return NextResponse.json(interview);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "更新に失敗しました" }, { status: 500 });
  }
}
