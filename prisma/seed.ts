import { PrismaClient } from "@prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { SUPPORT_TYPES } from "../lib/constants";

const adapter = new PrismaBetterSqlite3({ url: "file:./dev.db" });
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const prisma = new PrismaClient({ adapter } as any);

async function main() {
  console.log("シードデータを投入中...");

  const workers = [
    {
      name: "グエン・ティ・フオン",
      nameKana: "グエン ティ フオン",
      nationality: "ベトナム",
      visaStatus: "特定技能1号",
      employer: "株式会社サクラフード",
      employerContact: "田中部長 / 03-1234-5678",
      entryDate: new Date("2024-04-01"),
      contractEnd: new Date("2026-09-30"),
      phone: "090-1111-2222",
      email: "nguyen.huong@example.com",
      address: "東京都江東区○○1-2-3",
      residenceCard: "AB12345678CD",
      status: "active",
    },
    {
      name: "レオ・ムタシア",
      nameKana: "レオ ムタシア",
      nationality: "フィリピン",
      visaStatus: "特定技能1号",
      employer: "山田建設株式会社",
      employerContact: "山田社長 / 045-9876-5432",
      entryDate: new Date("2023-10-15"),
      contractEnd: new Date("2026-10-14"),
      phone: "080-3333-4444",
      email: "leo.mutasia@example.com",
      address: "神奈川県横浜市○○4-5-6",
      residenceCard: "CD98765432EF",
      status: "active",
    },
    {
      name: "ミン・スウェ",
      nameKana: "ミン スウェ",
      nationality: "ミャンマー",
      visaStatus: "特定技能1号",
      employer: "東京介護サービス株式会社",
      employerContact: "佐藤主任 / 03-2222-3333",
      entryDate: new Date("2025-01-20"),
      contractEnd: new Date("2026-07-19"),
      phone: "070-5555-6666",
      address: "埼玉県さいたま市○○7-8-9",
      residenceCard: "EF11111111GH",
      status: "active",
    },
    {
      name: "スレシュ・クマール",
      nameKana: "スレシュ クマール",
      nationality: "ネパール",
      visaStatus: "特定技能2号",
      employer: "グローバルIT株式会社",
      employerContact: "鈴木マネージャー / 03-4444-5555",
      entryDate: new Date("2022-06-01"),
      contractEnd: new Date("2027-05-31"),
      phone: "090-7777-8888",
      email: "suresh.kumar@example.com",
      address: "千葉県千葉市○○10-11-12",
      residenceCard: "GH22222222IJ",
      status: "active",
    },
    {
      name: "チャン・ティ・マイ",
      nameKana: "チャン ティ マイ",
      nationality: "ベトナム",
      visaStatus: "特定技能1号",
      employer: "農業法人みどり",
      employerContact: "中村代表 / 0297-11-2222",
      entryDate: new Date("2025-03-01"),
      contractEnd: new Date("2026-08-31"),
      phone: "080-9999-0000",
      address: "茨城県つくば市○○13-14-15",
      residenceCard: "IJ33333333KL",
      status: "active",
    },
    {
      name: "ハミド・アリ",
      nameKana: "ハミド アリ",
      nationality: "バングラデシュ",
      visaStatus: "特定技能1号",
      employer: "ニッポン製造株式会社",
      employerContact: "高橋工場長 / 048-5555-6666",
      entryDate: new Date("2023-07-15"),
      contractEnd: new Date("2025-07-14"),
      phone: "090-1234-5678",
      address: "埼玉県川口市○○16-17-18",
      residenceCard: "KL44444444MN",
      status: "inactive",
    },
  ];

  for (const workerData of workers) {
    const worker = await prisma.worker.create({
      data: {
        ...workerData,
        supports: {
          create: SUPPORT_TYPES.map((type, index) => ({
            type: type.id,
            status: index < 4 ? "completed" : index === 4 ? "completed" : "pending",
            completedAt: index < 5 ? new Date(Date.now() - (10 - index) * 30 * 24 * 60 * 60 * 1000) : null,
          })),
        },
      },
    });

    // Add interviews
    await prisma.interview.createMany({
      data: [
        {
          workerId: worker.id,
          scheduledAt: new Date(Date.now() - 180 * 24 * 60 * 60 * 1000),
          conductedAt: new Date(Date.now() - 180 * 24 * 60 * 60 * 1000),
          status: "completed",
          interviewer: "山本支援員",
          quarter: "2025年 第4四半期",
          notes: "特に問題なし。日本語も上達している。",
        },
        {
          workerId: worker.id,
          scheduledAt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000),
          conductedAt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000),
          status: "completed",
          interviewer: "田村支援員",
          quarter: "2026年 第1四半期",
          notes: "職場環境に慣れてきた。",
        },
        {
          workerId: worker.id,
          scheduledAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
          status: "scheduled",
          interviewer: "山本支援員",
          quarter: "2026年 第2四半期",
        },
      ],
    });

    // Add documents
    await prisma.document.createMany({
      data: [
        {
          workerId: worker.id,
          name: "在留カード（コピー）",
          type: "在留カード",
          expiresAt: workerData.contractEnd,
        },
        {
          workerId: worker.id,
          name: "雇用契約書",
          type: "雇用契約書",
        },
        {
          workerId: worker.id,
          name: "健康保険証",
          type: "健康保険・年金証書",
          expiresAt: new Date(Date.now() + 200 * 24 * 60 * 60 * 1000),
        },
      ],
    });
  }

  // Add reports
  await prisma.report.createMany({
    data: [
      {
        title: "2026年第1四半期 支援実施状況報告",
        type: "四半期報告",
        period: "2026年 第1四半期",
        status: "submitted",
        submittedAt: new Date("2026-04-15"),
        notes: "6名全員の面談実施済み",
      },
      {
        title: "2025年年次活動報告書",
        type: "年次報告",
        period: "2025年 年次報告",
        status: "submitted",
        submittedAt: new Date("2026-01-31"),
      },
      {
        title: "2026年第2四半期 支援実施状況報告",
        type: "四半期報告",
        period: "2026年 第2四半期",
        status: "draft",
        notes: "作成中",
      },
    ],
  });

  console.log("シードデータの投入が完了しました");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
