import { prisma } from "@/lib/prisma";
import { Header } from "@/components/layout/Header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { SUPPORT_TYPES, SUPPORT_STATUS_LABELS } from "@/lib/constants";
import { formatDate } from "@/lib/utils";
import Link from "next/link";
import { CheckCircle2, Clock, MinusCircle } from "lucide-react";

export default async function SupportsPage() {
  const workers = await prisma.worker.findMany({
    where: { status: "active" },
    include: {
      supports: true,
    },
    orderBy: { name: "asc" },
  });

  const totalSupports = workers.reduce((sum, w) => sum + w.supports.length, 0);
  const completedSupports = workers.reduce(
    (sum, w) => sum + w.supports.filter((s) => s.status === "completed").length,
    0
  );
  const pendingSupports = workers.reduce(
    (sum, w) => sum + w.supports.filter((s) => s.status === "pending").length,
    0
  );

  return (
    <>
      <Header
        title="支援業務状況"
        description="特定技能外国人への10種類の支援業務の実施状況"
      />
      <main className="flex-1 p-8">
        <div className="grid grid-cols-3 gap-4 mb-8">
          <Card>
            <CardContent className="pt-5">
              <div className="text-2xl font-bold text-green-600">{completedSupports}</div>
              <div className="text-sm text-gray-500">完了</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-5">
              <div className="text-2xl font-bold text-yellow-600">{pendingSupports}</div>
              <div className="text-sm text-gray-500">未実施</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-5">
              <div className="text-2xl font-bold text-blue-600">
                {totalSupports > 0 ? Math.round((completedSupports / totalSupports) * 100) : 0}%
              </div>
              <div className="text-sm text-gray-500">全体完了率</div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>労働者別 支援業務一覧</CardTitle>
          </CardHeader>
          <CardContent className="p-0 overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-gray-100 text-left text-gray-500">
                  <th className="px-4 py-3 font-medium min-w-28">氏名</th>
                  {SUPPORT_TYPES.map((t) => (
                    <th key={t.id} className="px-2 py-3 font-medium text-center min-w-20 leading-tight">
                      {t.label.split("・")[0]}
                    </th>
                  ))}
                  <th className="px-4 py-3 font-medium text-center">進捗</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {workers.length === 0 ? (
                  <tr>
                    <td colSpan={SUPPORT_TYPES.length + 2} className="px-4 py-12 text-center text-gray-400">
                      活動中の労働者がいません
                    </td>
                  </tr>
                ) : (
                  workers.map((worker) => {
                    const completed = worker.supports.filter((s) => s.status === "completed").length;
                    const total = worker.supports.length;
                    return (
                      <tr key={worker.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3">
                          <Link href={`/workers/${worker.id}`} className="font-medium text-blue-700 hover:underline">
                            {worker.name}
                          </Link>
                        </td>
                        {SUPPORT_TYPES.map((type) => {
                          const support = worker.supports.find((s) => s.type === type.id);
                          const status = support?.status || "pending";
                          return (
                            <td key={type.id} className="px-2 py-3 text-center">
                              {status === "completed" ? (
                                <CheckCircle2 className="h-4 w-4 text-green-500 mx-auto" />
                              ) : status === "not_applicable" ? (
                                <MinusCircle className="h-4 w-4 text-gray-300 mx-auto" />
                              ) : (
                                <Clock className="h-4 w-4 text-gray-200 mx-auto" />
                              )}
                            </td>
                          );
                        })}
                        <td className="px-4 py-3 text-center">
                          <div className="flex items-center gap-1.5 justify-center">
                            <div className="w-16 bg-gray-100 rounded-full h-1.5">
                              <div
                                className="bg-blue-600 h-1.5 rounded-full"
                                style={{ width: total > 0 ? `${(completed / total) * 100}%` : "0%" }}
                              />
                            </div>
                            <span className="text-gray-500">{completed}/{total}</span>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </CardContent>
        </Card>

        <div className="mt-6 flex items-center gap-6 text-xs text-gray-500">
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="h-4 w-4 text-green-500" />完了
          </div>
          <div className="flex items-center gap-1.5">
            <Clock className="h-4 w-4 text-gray-200" />未実施
          </div>
          <div className="flex items-center gap-1.5">
            <MinusCircle className="h-4 w-4 text-gray-300" />対象外
          </div>
        </div>
      </main>
    </>
  );
}
