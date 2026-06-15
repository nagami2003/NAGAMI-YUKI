"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { Header } from "@/components/layout/Header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getQuarterLabel } from "@/lib/utils";

interface Worker {
  id: string;
  name: string;
  employer: string;
}

function NewInterviewForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const preselectedWorkerId = searchParams.get("workerId") || "";

  const [workers, setWorkers] = useState<Worker[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/workers").then((r) => r.json()).then(setWorkers);
  }, []);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const form = e.currentTarget;
    const data = {
      workerId: (form.elements.namedItem("workerId") as HTMLSelectElement).value,
      scheduledAt: (form.elements.namedItem("scheduledAt") as HTMLInputElement).value,
      interviewer: (form.elements.namedItem("interviewer") as HTMLInputElement).value,
      quarter: (form.elements.namedItem("quarter") as HTMLInputElement).value,
    };

    try {
      const res = await fetch("/api/interviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("登録に失敗しました");
      router.push("/interviews");
    } catch (err) {
      setError(err instanceof Error ? err.message : "エラーが発生しました");
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-lg">
      <Card>
        <CardHeader><CardTitle>面談情報</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">対象労働者 *</label>
            <select
              name="workerId"
              required
              defaultValue={preselectedWorkerId}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">選択してください</option>
              {workers.map((w) => (
                <option key={w.id} value={w.id}>
                  {w.name} ({w.employer})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">面談予定日 *</label>
            <input
              type="datetime-local"
              name="scheduledAt"
              required
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">四半期</label>
            <input
              type="text"
              name="quarter"
              defaultValue={getQuarterLabel()}
              placeholder="例: 2026年 第2四半期"
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">担当者</label>
            <input
              type="text"
              name="interviewer"
              placeholder="面談担当者名"
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end gap-3">
        <Link href="/interviews">
          <Button type="button" variant="outline">キャンセル</Button>
        </Link>
        <Button type="submit" loading={loading}>登録する</Button>
      </div>
    </form>
  );
}

export default function NewInterviewPage() {
  return (
    <>
      <Header title="面談登録" description="定期面談の予定を登録します" />
      <main className="flex-1 p-8">
        <Link
          href="/interviews"
          className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-6"
        >
          <ArrowLeft className="h-4 w-4" />
          一覧に戻る
        </Link>
        <Suspense fallback={<div className="text-gray-400">読み込み中...</div>}>
          <NewInterviewForm />
        </Suspense>
      </main>
    </>
  );
}
