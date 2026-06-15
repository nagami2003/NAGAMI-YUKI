import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

type Params = { params: Promise<{ id: string }> };

export async function GET(_request: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    const worker = await prisma.worker.findUnique({
      where: { id },
      include: {
        supports: { orderBy: { type: "asc" } },
        interviews: { orderBy: { scheduledAt: "desc" } },
        documents: { orderBy: { createdAt: "desc" } },
      },
    });

    if (!worker) {
      return NextResponse.json({ error: "見つかりません" }, { status: 404 });
    }

    return NextResponse.json(worker);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "サーバーエラー" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    const body = await request.json();

    const worker = await prisma.worker.update({
      where: { id },
      data: {
        name: body.name,
        nameKana: body.nameKana || null,
        nationality: body.nationality,
        visaStatus: body.visaStatus,
        employer: body.employer,
        employerContact: body.employerContact || null,
        entryDate: new Date(body.entryDate),
        contractEnd: new Date(body.contractEnd),
        phone: body.phone || null,
        email: body.email || null,
        address: body.address || null,
        residenceCard: body.residenceCard || null,
        status: body.status || "active",
      },
    });

    return NextResponse.json(worker);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "更新に失敗しました" }, { status: 500 });
  }
}

export async function DELETE(_request: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    await prisma.worker.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "削除に失敗しました" }, { status: 500 });
  }
}
