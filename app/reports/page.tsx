"use client";

import { useState, useEffect } from "react";
import { Header } from "@/components/layout/Header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { formatDate } from "@/lib/utils";
import { REPORT_TYPES } from "@/lib/constants";
import { Plus, FileText, CheckCircle2 } from "lucide-react";

interface Report {
  id: string;
  title: string;
  type: string;
  period: string;
  status: string;
  submittedAt: string | null;
  notes: string | null;
  createdAt: string;
}

export default function ReportsPage() {
  const [reports, setReports] = useState<Report[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState<string | null>(null);

  const [form, setForm] = useState({
    title: "", type: "", period: "", notes: "",
  });

  useEffect(() => {
    fetch("/api/reports").then((r) => r.json()).then(setReports);
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/reports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, status: "draft" }),
      });
      const report = await res.json();
      setReports((prev) => [report, ...prev]);
      setForm({ title: "", type: "", period: "", notes: "" });
      setShowForm(false);
    } finally {
      setLoading(false);
    }
  }

  async function markSubmitted(report: Report) {
    setSubmitting(report.id);
    try {
      const res = await fetch("/api/reports", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: report.id, status: "submitted", notes: report.notes }),
      });
      const updated = await res.json();
      setReports((prev) => prev.map((r) => r.id === updated.id ? updated : r));
    } finally {
      setSubmitting(null);
    }
  }

  const currentYear = new Date().getFullYear();
  const quarters = [
    `${currentYear}年 第1四半期`,
    `${currentYear}年 第2四半期`,
    `${currentYear}年 第3四半期`,
    `${currentYear}年 第4四半期`,
    `${currentYear - 1}年 年次報告`,
  ];

  return (
    <>
      <Header title="報告書管理" description="出入国在留管理庁への報告書を管理します" />
      <main className="flex-1 p-8">
        <div className="flex justify-between items-center mb-6">
          <div className="flex gap-4 text-sm text-gray-600">
            <span>
              提出済み: <strong>{reports.filter((r) => r.status === "submitted").length}</strong>件
            </span>
            <span>
              下書き: <strong>{reports.filter((r) => r.status === "draft").length}</strong>件
            </span>
          </div>
          <Button onClick={() => setShowForm(!showForm)}>
            <Plus className="h-4 w-4" />
            報告書を作成
          </Button>
        </div>

        {showForm && (
          <Card className="mb-6">
            <CardHeader><CardTitle>新規報告書</CardTitle></CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">タイトル *</label>
                  <input
                    type="text" required
                    value={form.title}
                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                    placeholder="例: 2026年第2四半期 支援実施状況報告"
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">種別 *</label>
                  <select
                    required
                    value={form.type}
                    onChange={(e) => setForm({ ...form, type: e.target.value })}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">選択してください</option>
                    {REPORT_TYPES.map((t) => (
                      <option key={t.id} value={t.label}>{t.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">対象期間 *</label>
                  <select
                    required
                    value={form.period}
                    onChange={(e) => setForm({ ...form, period: e.target.value })}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">選択してください</option>
                    {quarters.map((q) => (
                      <option key={q} value={q}>{q}</option>
                    ))}
                  </select>
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">メモ</label>
                  <textarea
                    value={form.notes}
                    onChange={(e) => setForm({ ...form, notes: e.target.value })}
                    placeholder="備考・注意事項など"
                    rows={2}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="col-span-2 flex justify-end gap-3">
                  <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
                    キャンセル
                  </Button>
                  <Button type="submit" loading={loading}>作成する</Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardContent className="p-0">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 text-left text-xs text-gray-500 uppercase tracking-wide">
                  <th className="px-6 py-3 font-medium">タイトル</th>
                  <th className="px-6 py-3 font-medium">種別</th>
                  <th className="px-6 py-3 font-medium">対象期間</th>
                  <th className="px-6 py-3 font-medium">ステータス</th>
                  <th className="px-6 py-3 font-medium">提出日</th>
                  <th className="px-6 py-3 font-medium">作成日</th>
                  <th className="px-6 py-3 font-medium"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {reports.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center text-gray-400">
                      報告書がありません
                    </td>
                  </tr>
                ) : (
                  reports.map((report) => (
                    <tr key={report.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <FileText className="h-4 w-4 text-gray-400" />
                          <span className="font-medium text-gray-900">{report.title}</span>
                        </div>
                        {report.notes && (
                          <div className="text-xs text-gray-500 mt-0.5 ml-6">{report.notes}</div>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <Badge variant="info">{report.type}</Badge>
                      </td>
                      <td className="px-6 py-4 text-gray-700">{report.period}</td>
                      <td className="px-6 py-4">
                        <Badge variant={report.status === "submitted" ? "success" : "warning"}>
                          {report.status === "submitted" ? "提出済み" : "下書き"}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 text-gray-500">
                        {report.submittedAt ? formatDate(report.submittedAt) : "—"}
                      </td>
                      <td className="px-6 py-4 text-gray-500">{formatDate(report.createdAt)}</td>
                      <td className="px-6 py-4">
                        {report.status === "draft" && (
                          <Button
                            size="sm"
                            variant="outline"
                            loading={submitting === report.id}
                            onClick={() => markSubmitted(report)}
                          >
                            <CheckCircle2 className="h-3.5 w-3.5" />
                            提出済みにする
                          </Button>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </CardContent>
        </Card>
      </main>
    </>
  );
}
