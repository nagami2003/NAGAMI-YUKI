"use client";

import { useState, useEffect } from "react";
import { Header } from "@/components/layout/Header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { formatDate, daysUntil } from "@/lib/utils";
import { DOCUMENT_TYPES } from "@/lib/constants";
import { Plus, Trash2, AlertTriangle, FileText } from "lucide-react";
import Link from "next/link";

interface Document {
  id: string;
  name: string;
  type: string;
  expiresAt: string | null;
  notes: string | null;
  createdAt: string;
  worker: { name: string };
  workerId: string;
}

interface Worker {
  id: string;
  name: string;
}

export default function DocumentsPage() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    workerId: "", name: "", type: "", expiresAt: "", notes: "",
  });

  useEffect(() => {
    fetch("/api/documents").then((r) => r.json()).then(setDocuments);
    fetch("/api/workers").then((r) => r.json()).then(setWorkers);
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/documents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error("登録に失敗しました");
      const doc = await res.json();
      setDocuments((prev) => [doc, ...prev]);
      setForm({ workerId: "", name: "", type: "", expiresAt: "", notes: "" });
      setShowForm(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "エラー");
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("この書類を削除しますか？")) return;
    await fetch(`/api/documents?id=${id}`, { method: "DELETE" });
    setDocuments((prev) => prev.filter((d) => d.id !== id));
  }

  const expiringSoon = documents.filter(
    (d) => d.expiresAt && daysUntil(d.expiresAt) <= 90 && daysUntil(d.expiresAt) > 0
  );

  return (
    <>
      <Header title="書類管理" description="外国人労働者の書類・証明書を管理します" />
      <main className="flex-1 p-8">
        <div className="flex justify-between items-center mb-6">
          <div className="text-sm text-gray-500">{documents.length}件の書類</div>
          <Button onClick={() => setShowForm(!showForm)}>
            <Plus className="h-4 w-4" />
            書類を登録
          </Button>
        </div>

        {expiringSoon.length > 0 && (
          <div className="mb-6 p-4 bg-orange-50 border border-orange-200 rounded-xl">
            <div className="flex items-center gap-2 text-orange-700 font-semibold mb-2">
              <AlertTriangle className="h-5 w-5" />
              有効期限が90日以内の書類 ({expiringSoon.length}件)
            </div>
            {expiringSoon.map((d) => (
              <div key={d.id} className="flex items-center justify-between text-sm py-1">
                <span className="text-gray-700">{d.worker.name} — {d.name}</span>
                <Badge variant={daysUntil(d.expiresAt!) <= 30 ? "danger" : "warning"}>
                  残{daysUntil(d.expiresAt!)}日
                </Badge>
              </div>
            ))}
          </div>
        )}

        {showForm && (
          <Card className="mb-6">
            <CardHeader><CardTitle>新規書類登録</CardTitle></CardHeader>
            <CardContent>
              {error && (
                <div className="mb-3 p-3 bg-red-50 text-red-700 text-sm rounded">{error}</div>
              )}
              <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">労働者 *</label>
                  <select
                    required
                    value={form.workerId}
                    onChange={(e) => setForm({ ...form, workerId: e.target.value })}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">選択してください</option>
                    {workers.map((w) => (
                      <option key={w.id} value={w.id}>{w.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">書類名 *</label>
                  <input
                    type="text" required
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder="例: 在留カード（コピー）"
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
                    {DOCUMENT_TYPES.map((t) => (
                      <option key={t.id} value={t.label}>{t.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">有効期限</label>
                  <input
                    type="date"
                    value={form.expiresAt}
                    onChange={(e) => setForm({ ...form, expiresAt: e.target.value })}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">メモ</label>
                  <input
                    type="text"
                    value={form.notes}
                    onChange={(e) => setForm({ ...form, notes: e.target.value })}
                    placeholder="備考など"
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="col-span-2 flex justify-end gap-3">
                  <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
                    キャンセル
                  </Button>
                  <Button type="submit" loading={loading}>登録する</Button>
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
                  <th className="px-6 py-3 font-medium">書類名</th>
                  <th className="px-6 py-3 font-medium">種別</th>
                  <th className="px-6 py-3 font-medium">労働者</th>
                  <th className="px-6 py-3 font-medium">有効期限</th>
                  <th className="px-6 py-3 font-medium">登録日</th>
                  <th className="px-6 py-3 font-medium"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {documents.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-gray-400">
                      書類が登録されていません
                    </td>
                  </tr>
                ) : (
                  documents.map((doc) => {
                    const expiring = doc.expiresAt && daysUntil(doc.expiresAt) <= 90;
                    const expired = doc.expiresAt && daysUntil(doc.expiresAt) <= 0;
                    return (
                      <tr key={doc.id} className={`hover:bg-gray-50 ${expired ? "bg-red-50/20" : ""}`}>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <FileText className="h-4 w-4 text-gray-400" />
                            <span className="font-medium text-gray-900">{doc.name}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <Badge variant="gray">{doc.type}</Badge>
                        </td>
                        <td className="px-6 py-4">
                          <Link href={`/workers/${doc.workerId}`} className="text-blue-700 hover:underline">
                            {doc.worker.name}
                          </Link>
                        </td>
                        <td className="px-6 py-4">
                          {doc.expiresAt ? (
                            <div>
                              <span className={expired ? "text-red-600 font-medium" : expiring ? "text-orange-600" : "text-gray-700"}>
                                {formatDate(doc.expiresAt)}
                              </span>
                              {expiring && !expired && (
                                <div className="text-xs text-orange-500">残{daysUntil(doc.expiresAt!)}日</div>
                              )}
                              {expired && <div className="text-xs text-red-500">期限切れ</div>}
                            </div>
                          ) : (
                            <span className="text-gray-400">—</span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-gray-500">{formatDate(doc.createdAt)}</td>
                        <td className="px-6 py-4">
                          <button
                            onClick={() => handleDelete(doc.id)}
                            className="text-red-400 hover:text-red-600 transition-colors"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
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
