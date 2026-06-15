import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { Header } from "@/components/layout/Header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { formatDate, daysUntil } from "@/lib/utils";
import { SUPPORT_TYPES, SUPPORT_STATUS_LABELS, INTERVIEW_STATUS_LABELS } from "@/lib/constants";
import Link from "next/link";
import {
  ArrowLeft,
  Edit,
  Phone,
  Mail,
  MapPin,
  Building2,
  Calendar,
  CheckCircle2,
  Clock,
  FileText,
} from "lucide-react";

type Params = { params: Promise<{ id: string }> };

export default async function WorkerDetailPage({ params }: Params) {
  const { id } = await params;
  const worker = await prisma.worker.findUnique({
    where: { id },
    include: {
      supports: { orderBy: { type: "asc" } },
      interviews: { orderBy: { scheduledAt: "desc" } },
      documents: { orderBy: { createdAt: "desc" } },
    },
  });

  if (!worker) notFound();

  const completedSupports = worker.supports.filter((s) => s.status === "completed").length;
  const daysToExpiry = daysUntil(worker.contractEnd);

  return (
    <>
      <Header
        title={worker.name}
        description={`${worker.nationality} | ${worker.visaStatus} | ${worker.employer}`}
      />
      <main className="flex-1 p-8">
        <div className="flex items-center justify-between mb-6">
          <Link
            href="/workers"
            className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700"
          >
            <ArrowLeft className="h-4 w-4" />
            一覧に戻る
          </Link>
          <Link
            href={`/workers/${id}/edit`}
            className="inline-flex items-center gap-2 border border-gray-300 hover:bg-gray-50 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium"
          >
            <Edit className="h-4 w-4" />
            編集
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column */}
          <div className="space-y-5">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>基本情報</CardTitle>
                  <Badge variant={worker.status === "active" ? "success" : "gray"}>
                    {worker.status === "active" ? "活動中" : "非活動"}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <InfoRow label="国籍" value={worker.nationality} />
                <InfoRow label="在留資格" value={worker.visaStatus} />
                <InfoRow label="在留カード" value={worker.residenceCard || "—"} />
                <InfoRow label="入国日" value={formatDate(worker.entryDate)} />
                <div>
                  <div className="text-xs text-gray-500 mb-1">契約終了日</div>
                  <div
                    className={`text-sm font-medium ${
                      daysToExpiry <= 30
                        ? "text-red-600"
                        : daysToExpiry <= 90
                        ? "text-orange-600"
                        : "text-gray-900"
                    }`}
                  >
                    {formatDate(worker.contractEnd)}
                    {daysToExpiry > 0 && (
                      <span className="ml-2 text-xs font-normal text-gray-500">
                        （残{daysToExpiry}日）
                      </span>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>連絡先</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {worker.phone && (
                  <div className="flex items-center gap-2 text-sm">
                    <Phone className="h-4 w-4 text-gray-400" />
                    <span>{worker.phone}</span>
                  </div>
                )}
                {worker.email && (
                  <div className="flex items-center gap-2 text-sm">
                    <Mail className="h-4 w-4 text-gray-400" />
                    <span>{worker.email}</span>
                  </div>
                )}
                {worker.address && (
                  <div className="flex items-start gap-2 text-sm">
                    <MapPin className="h-4 w-4 text-gray-400 mt-0.5" />
                    <span>{worker.address}</span>
                  </div>
                )}
                {!worker.phone && !worker.email && !worker.address && (
                  <p className="text-sm text-gray-400">連絡先未登録</p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>雇用先</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex items-start gap-2 text-sm">
                  <Building2 className="h-4 w-4 text-gray-400 mt-0.5" />
                  <div>
                    <div className="font-medium">{worker.employer}</div>
                    {worker.employerContact && (
                      <div className="text-gray-500 text-xs mt-0.5">{worker.employerContact}</div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column */}
          <div className="lg:col-span-2 space-y-5">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>支援業務状況</CardTitle>
                  <span className="text-sm text-gray-500">
                    {completedSupports} / {worker.supports.length} 完了
                  </span>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <div className="divide-y divide-gray-50">
                  {SUPPORT_TYPES.map((type) => {
                    const support = worker.supports.find((s) => s.type === type.id);
                    const status = support?.status || "pending";
                    return (
                      <div key={type.id} className="flex items-center justify-between px-6 py-3">
                        <div className="flex items-center gap-3">
                          {status === "completed" ? (
                            <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0" />
                          ) : (
                            <Clock className="h-5 w-5 text-gray-300 flex-shrink-0" />
                          )}
                          <div>
                            <div className="text-sm font-medium text-gray-900">{type.label}</div>
                            <div className="text-xs text-gray-500">{type.description}</div>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          {support?.completedAt && (
                            <span className="text-xs text-gray-400">
                              {formatDate(support.completedAt)}
                            </span>
                          )}
                          <Badge
                            variant={
                              status === "completed"
                                ? "success"
                                : status === "not_applicable"
                                ? "gray"
                                : "warning"
                            }
                          >
                            {SUPPORT_STATUS_LABELS[status]}
                          </Badge>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>面談記録</CardTitle>
                  <Link
                    href={`/interviews/new?workerId=${id}`}
                    className="inline-flex items-center gap-1 text-sm text-blue-600 hover:underline"
                  >
                    + 新規面談予定
                  </Link>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                {worker.interviews.length === 0 ? (
                  <div className="px-6 py-8 text-center text-gray-400 text-sm">
                    面談記録がありません
                  </div>
                ) : (
                  <div className="divide-y divide-gray-50">
                    {worker.interviews.map((interview) => (
                      <div key={interview.id} className="px-6 py-3 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Calendar className="h-4 w-4 text-gray-400" />
                          <div>
                            <div className="text-sm font-medium">
                              {formatDate(interview.scheduledAt)}
                            </div>
                            {interview.quarter && (
                              <div className="text-xs text-gray-500">{interview.quarter}</div>
                            )}
                            {interview.concerns && (
                              <div className="text-xs text-orange-600 mt-0.5">
                                懸念: {interview.concerns}
                              </div>
                            )}
                          </div>
                        </div>
                        <Badge
                          variant={
                            interview.status === "completed"
                              ? "success"
                              : interview.status === "cancelled"
                              ? "gray"
                              : "info"
                          }
                        >
                          {INTERVIEW_STATUS_LABELS[interview.status]}
                        </Badge>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>書類</CardTitle>
                  <Link
                    href={`/documents?workerId=${id}`}
                    className="text-sm text-blue-600 hover:underline"
                  >
                    書類管理 →
                  </Link>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                {worker.documents.length === 0 ? (
                  <div className="px-6 py-8 text-center text-gray-400 text-sm">
                    書類が登録されていません
                  </div>
                ) : (
                  <div className="divide-y divide-gray-50">
                    {worker.documents.map((doc) => (
                      <div key={doc.id} className="px-6 py-3 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <FileText className="h-4 w-4 text-gray-400" />
                          <div>
                            <div className="text-sm font-medium">{doc.name}</div>
                            {doc.expiresAt && (
                              <div
                                className={`text-xs ${
                                  daysUntil(doc.expiresAt) <= 30
                                    ? "text-red-500"
                                    : "text-gray-500"
                                }`}
                              >
                                有効期限: {formatDate(doc.expiresAt)}
                              </div>
                            )}
                          </div>
                        </div>
                        <Badge variant="gray">{doc.type}</Badge>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-xs text-gray-500 mb-0.5">{label}</div>
      <div className="text-sm font-medium text-gray-900">{value}</div>
    </div>
  );
}
