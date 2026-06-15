import { prisma } from "@/lib/prisma";
import { Header } from "@/components/layout/Header";
import { Card, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { formatDate, daysUntil } from "@/lib/utils";
import Link from "next/link";
import { Plus, ExternalLink, AlertTriangle } from "lucide-react";

async function getWorkers(search: string, status: string) {
  return prisma.worker.findMany({
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
    },
    orderBy: { createdAt: "desc" },
  });
}

export default async function WorkersPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string; status?: string }>;
}) {
  const params = await searchParams;
  const search = params.search || "";
  const status = params.status || "";
  const workers = await getWorkers(search, status);

  return (
    <>
      <Header
        title="外国人労働者管理"
        description="特定技能外国人の登録・管理"
      />
      <main className="flex-1 p-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <form className="flex gap-2">
              <input
                name="search"
                defaultValue={search}
                placeholder="名前・雇用先・国籍で検索"
                className="border border-gray-200 rounded-lg px-3 py-2 text-sm w-64 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <select
                name="status"
                defaultValue={status}
                className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">すべて</option>
                <option value="active">活動中</option>
                <option value="inactive">非活動</option>
              </select>
              <button
                type="submit"
                className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium"
              >
                検索
              </button>
            </form>
          </div>
          <Link
            href="/workers/new"
            className="inline-flex items-center gap-2 bg-blue-700 hover:bg-blue-800 text-white px-4 py-2 rounded-lg text-sm font-medium"
          >
            <Plus className="h-4 w-4" />
            新規登録
          </Link>
        </div>

        <div className="text-sm text-gray-500 mb-4">
          {workers.length}名の労働者
        </div>

        <Card>
          <CardContent className="p-0">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 text-left text-xs text-gray-500 uppercase tracking-wide">
                  <th className="px-6 py-3 font-medium">氏名</th>
                  <th className="px-6 py-3 font-medium">国籍</th>
                  <th className="px-6 py-3 font-medium">在留資格</th>
                  <th className="px-6 py-3 font-medium">雇用先</th>
                  <th className="px-6 py-3 font-medium">在留期限</th>
                  <th className="px-6 py-3 font-medium">次回面談</th>
                  <th className="px-6 py-3 font-medium">支援進捗</th>
                  <th className="px-6 py-3 font-medium">ステータス</th>
                  <th className="px-6 py-3 font-medium"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {workers.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="px-6 py-12 text-center text-gray-400">
                      労働者が登録されていません
                    </td>
                  </tr>
                ) : (
                  workers.map((worker) => {
                    const completedSupports = worker.supports.filter(
                      (s) => s.status === "completed"
                    ).length;
                    const totalSupports = worker.supports.length;
                    const progress = totalSupports > 0
                      ? Math.round((completedSupports / totalSupports) * 100)
                      : 0;
                    const daysToExpiry = daysUntil(worker.contractEnd);
                    const nextInterview = worker.interviews[0];

                    return (
                      <tr key={worker.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <Link
                            href={`/workers/${worker.id}`}
                            className="font-semibold text-blue-700 hover:underline"
                          >
                            {worker.name}
                          </Link>
                          {worker.nameKana && (
                            <div className="text-xs text-gray-400">{worker.nameKana}</div>
                          )}
                        </td>
                        <td className="px-6 py-4">{worker.nationality}</td>
                        <td className="px-6 py-4">
                          <Badge variant="info">{worker.visaStatus}</Badge>
                        </td>
                        <td className="px-6 py-4 text-gray-700">{worker.employer}</td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-1">
                            {daysToExpiry <= 30 && (
                              <AlertTriangle className="h-3.5 w-3.5 text-red-500" />
                            )}
                            <span
                              className={
                                daysToExpiry <= 30
                                  ? "text-red-600 font-medium"
                                  : daysToExpiry <= 90
                                  ? "text-orange-600"
                                  : "text-gray-700"
                              }
                            >
                              {formatDate(worker.contractEnd)}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          {nextInterview ? (
                            <div>
                              <div className="text-gray-700">
                                {formatDate(nextInterview.scheduledAt)}
                              </div>
                              {daysUntil(nextInterview.scheduledAt) < 0 && (
                                <div className="text-xs text-red-500">期限切れ</div>
                              )}
                            </div>
                          ) : (
                            <span className="text-gray-400">未設定</span>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <div className="w-20 bg-gray-100 rounded-full h-1.5">
                              <div
                                className="bg-blue-600 h-1.5 rounded-full"
                                style={{ width: `${progress}%` }}
                              />
                            </div>
                            <span className="text-xs text-gray-500">
                              {completedSupports}/{totalSupports}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <Badge variant={worker.status === "active" ? "success" : "gray"}>
                            {worker.status === "active" ? "活動中" : "非活動"}
                          </Badge>
                        </td>
                        <td className="px-6 py-4">
                          <Link
                            href={`/workers/${worker.id}`}
                            className="text-blue-600 hover:text-blue-800"
                          >
                            <ExternalLink className="h-4 w-4" />
                          </Link>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </CardContent>
        </Card>
      </main>
    </>
  );
}
