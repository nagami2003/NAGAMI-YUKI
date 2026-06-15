import { prisma } from "@/lib/prisma";
import { Header } from "@/components/layout/Header";
import { Card, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { formatDate, daysUntil } from "@/lib/utils";
import { INTERVIEW_STATUS_LABELS } from "@/lib/constants";
import Link from "next/link";
import { Plus, AlertTriangle } from "lucide-react";

interface InterviewWithWorker {
  id: string;
  workerId: string;
  scheduledAt: Date;
  conductedAt: Date | null;
  status: string;
  notes: string | null;
  interviewer: string | null;
  concerns: string | null;
  quarter: string | null;
  worker: { id: string; name: string; nationality: string; employer: string };
}

export default async function InterviewsPage() {
  const now = new Date();
  const interviews: InterviewWithWorker[] = await prisma.interview.findMany({
    include: {
      worker: { select: { id: true, name: true, nationality: true, employer: true } },
    },
    orderBy: { scheduledAt: "asc" },
  });

  const overdue = interviews.filter(
    (i: InterviewWithWorker) => i.status === "scheduled" && new Date(i.scheduledAt) < now
  );
  const upcoming = interviews.filter(
    (i: InterviewWithWorker) => i.status === "scheduled" && new Date(i.scheduledAt) >= now
  );
  const completed = interviews.filter((i: InterviewWithWorker) => i.status === "completed");

  return (
    <>
      <Header title="定期面談管理" description="外国人労働者との定期面談（3ヶ月ごと）を管理します" />
      <main className="flex-1 p-8">
        <div className="flex justify-between items-center mb-6">
          <div className="flex gap-4 text-sm">
            <div className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-red-500 inline-block"></span>
              <span className="text-gray-600">期限切れ: <strong>{overdue.length}</strong>件</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-blue-500 inline-block"></span>
              <span className="text-gray-600">予定: <strong>{upcoming.length}</strong>件</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-green-500 inline-block"></span>
              <span className="text-gray-600">完了: <strong>{completed.length}</strong>件</span>
            </div>
          </div>
          <Link
            href="/interviews/new"
            className="inline-flex items-center gap-2 bg-blue-700 hover:bg-blue-800 text-white px-4 py-2 rounded-lg text-sm font-medium"
          >
            <Plus className="h-4 w-4" />
            面談を登録
          </Link>
        </div>

        {overdue.length > 0 && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
            <div className="flex items-center gap-2 text-red-700 font-semibold mb-3">
              <AlertTriangle className="h-5 w-5" />
              期限切れの面談 ({overdue.length}件) — 早急に対応が必要です
            </div>
            <div className="space-y-2">
              {overdue.map((i) => (
                <div key={i.id} className="flex items-center justify-between bg-white rounded-lg p-3 border border-red-100">
                  <div>
                    <Link href={`/workers/${i.worker.id}`} className="font-medium text-blue-700 hover:underline text-sm">
                      {i.worker.name}
                    </Link>
                    <span className="text-gray-500 text-sm"> — {i.worker.employer}</span>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-red-600 font-medium">{formatDate(i.scheduledAt)}</div>
                    <div className="text-xs text-red-500">{Math.abs(daysUntil(i.scheduledAt))}日超過</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <Card>
          <CardContent className="p-0">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 text-left text-xs text-gray-500 uppercase tracking-wide">
                  <th className="px-6 py-3 font-medium">労働者</th>
                  <th className="px-6 py-3 font-medium">雇用先</th>
                  <th className="px-6 py-3 font-medium">面談予定日</th>
                  <th className="px-6 py-3 font-medium">四半期</th>
                  <th className="px-6 py-3 font-medium">担当者</th>
                  <th className="px-6 py-3 font-medium">ステータス</th>
                  <th className="px-6 py-3 font-medium">懸念事項</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {interviews.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center text-gray-400">
                      面談が登録されていません
                    </td>
                  </tr>
                ) : (
                  interviews.map((interview) => {
                    const isOverdue =
                      interview.status === "scheduled" &&
                      new Date(interview.scheduledAt) < now;
                    return (
                      <tr
                        key={interview.id}
                        className={`hover:bg-gray-50 ${isOverdue ? "bg-red-50/30" : ""}`}
                      >
                        <td className="px-6 py-4">
                          <Link
                            href={`/workers/${interview.worker.id}`}
                            className="font-semibold text-blue-700 hover:underline"
                          >
                            {interview.worker.name}
                          </Link>
                          <div className="text-xs text-gray-400">{interview.worker.nationality}</div>
                        </td>
                        <td className="px-6 py-4 text-gray-700">{interview.worker.employer}</td>
                        <td className="px-6 py-4">
                          <div className={isOverdue ? "text-red-600 font-medium" : ""}>
                            {formatDate(interview.scheduledAt)}
                          </div>
                          {isOverdue && (
                            <div className="text-xs text-red-500">
                              {Math.abs(daysUntil(interview.scheduledAt))}日超過
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4 text-gray-600">{interview.quarter || "—"}</td>
                        <td className="px-6 py-4 text-gray-600">{interview.interviewer || "—"}</td>
                        <td className="px-6 py-4">
                          <Badge
                            variant={
                              interview.status === "completed"
                                ? "success"
                                : isOverdue
                                ? "danger"
                                : "info"
                            }
                          >
                            {isOverdue ? "期限切れ" : INTERVIEW_STATUS_LABELS[interview.status]}
                          </Badge>
                        </td>
                        <td className="px-6 py-4">
                          {interview.concerns ? (
                            <span className="text-xs text-orange-600 bg-orange-50 px-2 py-1 rounded">
                              {interview.concerns}
                            </span>
                          ) : (
                            <span className="text-gray-400">—</span>
                          )}
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
