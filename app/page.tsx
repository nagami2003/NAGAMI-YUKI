import { prisma } from "@/lib/prisma";
import { Header } from "@/components/layout/Header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { formatDate, daysUntil } from "@/lib/utils";
import {
  Users,
  Calendar,
  AlertTriangle,
  CheckCircle2,
  Clock,
  TrendingUp,
} from "lucide-react";
import Link from "next/link";

async function getDashboardData() {
  const now = new Date();
  const in90days = new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000);
  const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0);

  const [
    totalWorkers,
    activeWorkers,
    upcomingInterviews,
    overdueInterviews,
    expiringVisas,
    recentWorkers,
    pendingSupports,
    completedSupports,
    interviewsDueThisMonth,
    visaExpiring,
  ] = await Promise.all([
    prisma.worker.count(),
    prisma.worker.count({ where: { status: "active" } }),
    prisma.interview.count({
      where: { status: "scheduled", scheduledAt: { gte: now, lte: monthEnd } },
    }),
    prisma.interview.count({
      where: { status: "scheduled", scheduledAt: { lt: now } },
    }),
    prisma.worker.count({
      where: { status: "active", contractEnd: { gte: now, lte: in90days } },
    }),
    prisma.worker.findMany({
      orderBy: { createdAt: "desc" },
      take: 5,
      select: { id: true, name: true, nationality: true, employer: true, visaStatus: true },
    }),
    prisma.support.count({ where: { status: "pending" } }),
    prisma.support.count({ where: { status: "completed" } }),
    prisma.interview.findMany({
      where: { status: "scheduled", scheduledAt: { gte: now, lte: monthEnd } },
      include: { worker: { select: { name: true } } },
      orderBy: { scheduledAt: "asc" },
      take: 5,
    }),
    prisma.worker.findMany({
      where: { status: "active", contractEnd: { gte: now, lte: in90days } },
      select: { id: true, name: true, contractEnd: true, nationality: true },
      orderBy: { contractEnd: "asc" },
      take: 5,
    }),
  ]);

  return {
    totalWorkers,
    activeWorkers,
    upcomingInterviews,
    overdueInterviews,
    expiringVisas,
    recentWorkers,
    pendingSupports,
    completedSupports,
    interviewsDueThisMonth,
    visaExpiring,
  };
}

export default async function DashboardPage() {
  const data = await getDashboardData();
  const totalSupports = data.completedSupports + data.pendingSupports;
  const supportRate = totalSupports > 0
    ? Math.round((data.completedSupports / totalSupports) * 100)
    : 0;

  return (
    <>
      <Header title="ダッシュボード" description="登録支援機関 業務管理システム" />
      <main className="flex-1 p-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
          <StatCard
            title="登録労働者数"
            value={data.totalWorkers}
            sub={`活動中: ${data.activeWorkers}名`}
            icon={<Users className="h-6 w-6 text-blue-600" />}
            color="blue"
          />
          <StatCard
            title="今月の面談予定"
            value={data.upcomingInterviews}
            sub="今月実施予定"
            icon={<Calendar className="h-6 w-6 text-green-600" />}
            color="green"
          />
          <StatCard
            title="期限切れ面談"
            value={data.overdueInterviews}
            sub="要対応"
            icon={<AlertTriangle className="h-6 w-6 text-red-600" />}
            color="red"
          />
          <StatCard
            title="在留期限 90日以内"
            value={data.expiringVisas}
            sub="要確認"
            icon={<Clock className="h-6 w-6 text-orange-600" />}
            color="orange"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-8">
          <Card className="col-span-1">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>支援業務進捗</CardTitle>
                <TrendingUp className="h-5 w-5 text-gray-400" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-center mb-4">
                <div className="text-4xl font-bold text-blue-700">{supportRate}%</div>
                <div className="text-sm text-gray-500 mt-1">支援完了率</div>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-3 mb-3">
                <div
                  className="bg-blue-600 h-3 rounded-full"
                  style={{ width: `${supportRate}%` }}
                />
              </div>
              <div className="flex justify-between text-sm text-gray-600">
                <span>完了: <strong>{data.completedSupports}</strong>件</span>
                <span>未実施: <strong>{data.pendingSupports}</strong>件</span>
              </div>
            </CardContent>
          </Card>

          <Card className="col-span-2">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>今月の面談予定</CardTitle>
                <Link href="/interviews" className="text-sm text-blue-600 hover:underline">
                  すべて見る →
                </Link>
              </div>
            </CardHeader>
            <CardContent>
              {data.interviewsDueThisMonth.length === 0 ? (
                <div className="flex items-center justify-center h-20 text-gray-400 text-sm">
                  <CheckCircle2 className="h-5 w-5 mr-2 text-green-500" />
                  今月の面談予定はありません
                </div>
              ) : (
                <div className="divide-y divide-gray-50">
                  {data.interviewsDueThisMonth.map((interview) => (
                    <div key={interview.id} className="flex items-center justify-between py-2.5">
                      <div>
                        <div className="font-medium text-sm text-gray-900">
                          {interview.worker.name}
                        </div>
                        <div className="text-xs text-gray-500">
                          {formatDate(interview.scheduledAt)}
                        </div>
                      </div>
                      <Badge variant={daysUntil(interview.scheduledAt) < 7 ? "warning" : "info"}>
                        {daysUntil(interview.scheduledAt) < 0
                          ? "期限切れ"
                          : `${daysUntil(interview.scheduledAt)}日後`}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>最近登録した労働者</CardTitle>
                <Link href="/workers" className="text-sm text-blue-600 hover:underline">
                  すべて見る →
                </Link>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {data.recentWorkers.length === 0 ? (
                <div className="px-6 py-8 text-center text-gray-400 text-sm">
                  登録された労働者はいません
                </div>
              ) : (
                <div className="divide-y divide-gray-50">
                  {data.recentWorkers.map((worker) => (
                    <div key={worker.id} className="flex items-center justify-between px-6 py-3">
                      <div>
                        <Link
                          href={`/workers/${worker.id}`}
                          className="font-medium text-sm text-blue-700 hover:underline"
                        >
                          {worker.name}
                        </Link>
                        <div className="text-xs text-gray-500">{worker.employer}</div>
                      </div>
                      <Badge variant="default">{worker.nationality}</Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>在留期限・契約終了 90日以内</CardTitle>
                <Link href="/workers" className="text-sm text-blue-600 hover:underline">
                  すべて見る →
                </Link>
              </div>
            </CardHeader>
            <CardContent>
              {data.visaExpiring.length === 0 ? (
                <div className="flex items-center justify-center h-20 text-gray-400 text-sm">
                  <CheckCircle2 className="h-5 w-5 mr-2 text-green-500" />
                  期限が近い方はいません
                </div>
              ) : (
                <div className="divide-y divide-gray-50">
                  {data.visaExpiring.map((worker) => {
                    const days = daysUntil(worker.contractEnd);
                    return (
                      <div key={worker.id} className="flex items-center justify-between py-2.5">
                        <div>
                          <Link
                            href={`/workers/${worker.id}`}
                            className="font-medium text-sm text-blue-700 hover:underline"
                          >
                            {worker.name}
                          </Link>
                          <div className="text-xs text-gray-500">
                            {formatDate(worker.contractEnd)} 終了
                          </div>
                        </div>
                        <Badge variant={days <= 30 ? "danger" : "warning"}>残{days}日</Badge>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </>
  );
}

function StatCard({
  title,
  value,
  sub,
  icon,
  color,
}: {
  title: string;
  value: number;
  sub: string;
  icon: React.ReactNode;
  color: "blue" | "green" | "red" | "orange";
}) {
  const bgColors = {
    blue: "bg-blue-50",
    green: "bg-green-50",
    red: "bg-red-50",
    orange: "bg-orange-50",
  };
  return (
    <Card>
      <CardContent className="pt-5">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm text-gray-500 mb-1">{title}</p>
            <p className="text-3xl font-bold text-gray-900">{value}</p>
            <p className="text-xs text-gray-400 mt-1">{sub}</p>
          </div>
          <div className={`p-2.5 rounded-lg ${bgColors[color]}`}>{icon}</div>
        </div>
      </CardContent>
    </Card>
  );
}
