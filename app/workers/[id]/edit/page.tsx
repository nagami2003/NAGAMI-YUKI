"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { Header } from "@/components/layout/Header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { NATIONALITIES, VISA_STATUSES } from "@/lib/constants";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

interface Worker {
  id: string;
  name: string;
  nameKana: string | null;
  nationality: string;
  visaStatus: string;
  employer: string;
  employerContact: string | null;
  entryDate: string;
  contractEnd: string;
  phone: string | null;
  email: string | null;
  address: string | null;
  residenceCard: string | null;
  status: string;
}

export default function EditWorkerPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const [worker, setWorker] = useState<Worker | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch(`/api/workers/${id}`)
      .then((r) => r.json())
      .then(setWorker);
  }, [id]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const form = e.currentTarget;
    const data = {
      name: (form.elements.namedItem("name") as HTMLInputElement).value,
      nameKana: (form.elements.namedItem("nameKana") as HTMLInputElement).value,
      nationality: (form.elements.namedItem("nationality") as HTMLSelectElement).value,
      visaStatus: (form.elements.namedItem("visaStatus") as HTMLSelectElement).value,
      employer: (form.elements.namedItem("employer") as HTMLInputElement).value,
      employerContact: (form.elements.namedItem("employerContact") as HTMLInputElement).value,
      entryDate: (form.elements.namedItem("entryDate") as HTMLInputElement).value,
      contractEnd: (form.elements.namedItem("contractEnd") as HTMLInputElement).value,
      phone: (form.elements.namedItem("phone") as HTMLInputElement).value,
      email: (form.elements.namedItem("email") as HTMLInputElement).value,
      address: (form.elements.namedItem("address") as HTMLInputElement).value,
      residenceCard: (form.elements.namedItem("residenceCard") as HTMLInputElement).value,
      status: (form.elements.namedItem("status") as HTMLSelectElement).value,
    };

    try {
      const res = await fetch(`/api/workers/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("更新に失敗しました");
      router.push(`/workers/${id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "エラーが発生しました");
      setLoading(false);
    }
  }

  if (!worker) {
    return (
      <>
        <Header title="編集" />
        <main className="flex-1 p-8">
          <div className="text-center text-gray-400">読み込み中...</div>
        </main>
      </>
    );
  }

  const toDateInput = (d: string) => new Date(d).toISOString().split("T")[0];

  return (
    <>
      <Header title={`${worker.name} の編集`} />
      <main className="flex-1 p-8 max-w-3xl">
        <Link
          href={`/workers/${id}`}
          className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-6"
        >
          <ArrowLeft className="h-4 w-4" />
          詳細に戻る
        </Link>

        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <Card>
            <CardHeader><CardTitle>基本情報</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <Field label="氏名 *" name="name" required defaultValue={worker.name} />
                <Field label="氏名（カナ）" name="nameKana" defaultValue={worker.nameKana || ""} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <SelectField label="国籍 *" name="nationality" required options={NATIONALITIES} defaultValue={worker.nationality} />
                <SelectField label="在留資格 *" name="visaStatus" required options={VISA_STATUSES} defaultValue={worker.visaStatus} />
              </div>
              <Field label="在留カード番号" name="residenceCard" defaultValue={worker.residenceCard || ""} />
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">ステータス</label>
                <select
                  name="status"
                  defaultValue={worker.status}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="active">活動中</option>
                  <option value="inactive">非活動</option>
                </select>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>雇用情報</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <Field label="雇用先会社名 *" name="employer" required defaultValue={worker.employer} />
              <Field label="雇用先連絡先" name="employerContact" defaultValue={worker.employerContact || ""} />
              <div className="grid grid-cols-2 gap-4">
                <Field label="入国日 *" name="entryDate" type="date" required defaultValue={toDateInput(worker.entryDate)} />
                <Field label="契約終了日 *" name="contractEnd" type="date" required defaultValue={toDateInput(worker.contractEnd)} />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>連絡先情報</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <Field label="電話番号" name="phone" type="tel" defaultValue={worker.phone || ""} />
                <Field label="メールアドレス" name="email" type="email" defaultValue={worker.email || ""} />
              </div>
              <Field label="住所" name="address" defaultValue={worker.address || ""} />
            </CardContent>
          </Card>

          <div className="flex justify-end gap-3">
            <Link href={`/workers/${id}`}>
              <Button type="button" variant="outline">キャンセル</Button>
            </Link>
            <Button type="submit" loading={loading}>更新する</Button>
          </div>
        </form>
      </main>
    </>
  );
}

function Field({
  label, name, type = "text", required, defaultValue, placeholder,
}: {
  label: string; name: string; type?: string; required?: boolean; defaultValue?: string; placeholder?: string;
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      <input
        type={type} name={name} required={required} defaultValue={defaultValue} placeholder={placeholder}
        className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
    </div>
  );
}

function SelectField({
  label, name, required, options, defaultValue,
}: {
  label: string; name: string; required?: boolean; options: string[]; defaultValue?: string;
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      <select
        name={name} required={required} defaultValue={defaultValue}
        className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        <option value="">選択してください</option>
        {options.map((opt) => <option key={opt} value={opt}>{opt}</option>)}
      </select>
    </div>
  );
}
