import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { SUPPORT_TYPES } from "@/lib/constants";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || "";
    const status = searchParams.get("status") || "";

    const workers = await prisma.worker.findMany({
      where: {
        AND: [
          search
            ? {
                OR: [
                  { name: { contains: search } },
                  { employer: { contains: search } },
                  { nationality: { contains: search } },
                ],
              }
            : {},
          status ? { status } : {},
        ],
      },
      include: {
        supports: true,
        interviews: {
          where: { status: "scheduled" },
          orderBy: { scheduledAt: "asc" },
          take: 1,
        },
        _count: {
          select: { documents: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(workers);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "サーバーエラーが発生しました" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const worker = await prisma.worker.create({
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
        status: "active",
        supports: {
          create: SUPPORT_TYPES.map((type) => ({
            type: type.id,
            status: "pending",
          })),
        },
      },
    });

    return NextResponse.json(worker, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "登録に失敗しました" }, { status: 500 });
  }
}
