"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Header } from "@/components/layout/Header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { NATIONALITIES, VISA_STATUSES } from "@/lib/constants";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function NewWorkerPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

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
    };

    try {
      const res = await fetch("/api/workers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "登録に失敗しました");
      }

      const worker = await res.json();
      router.push(`/workers/${worker.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "エラーが発生しました");
      setLoading(false);
    }
  }

  return (
    <>
      <Header title="新規労働者登録" description="特定技能外国人を新規登録します" />
      <main className="flex-1 p-8 max-w-3xl">
        <Link
          href="/workers"
          className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-6"
        >
          <ArrowLeft className="h-4 w-4" />
          一覧に戻る
        </Link>

        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>基本情報</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <Field label="氏名 *" name="name" required placeholder="例: グエン・ティ・フオン" />
                <Field label="氏名（カナ）" name="nameKana" placeholder="例: グエン ティ フオン" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <SelectField label="国籍 *" name="nationality" required options={NATIONALITIES} />
                <SelectField label="在留資格 *" name="visaStatus" required options={VISA_STATUSES} />
              </div>
              <Field
                label="在留カード番号"
                name="residenceCard"
                placeholder="例: AB12345678CD"
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>雇用情報</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Field label="雇用先会社名 *" name="employer" required placeholder="例: 株式会社○○" />
              <Field
                label="雇用先連絡先"
                name="employerContact"
                placeholder="例: 担当者名・電話番号"
              />
              <div className="grid grid-cols-2 gap-4">
                <Field label="入国日 *" name="entryDate" type="date" required />
                <Field label="契約終了日 *" name="contractEnd" type="date" required />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>連絡先情報</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <Field label="電話番号" name="phone" type="tel" placeholder="例: 090-1234-5678" />
                <Field label="メールアドレス" name="email" type="email" placeholder="例: example@email.com" />
              </div>
              <Field label="住所" name="address" placeholder="例: 東京都渋谷区○○1-2-3" />
            </CardContent>
          </Card>

          <div className="flex justify-end gap-3">
            <Link href="/workers">
              <Button type="button" variant="outline">キャンセル</Button>
            </Link>
            <Button type="submit" loading={loading}>
              登録する
            </Button>
          </div>
        </form>
      </main>
    </>
  );
}

function Field({
  label,
  name,
  type = "text",
  required,
  placeholder,
}: {
  label: string;
  name: string;
  type?: string;
  required?: boolean;
  placeholder?: string;
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label}
      </label>
      <input
        type={type}
        name={name}
        required={required}
        placeholder={placeholder}
        className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
    </div>
  );
}

function SelectField({
  label,
  name,
  required,
  options,
}: {
  label: string;
  name: string;
  required?: boolean;
  options: string[];
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label}
      </label>
      <select
        name={name}
        required={required}
        className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        <option value="">選択してください</option>
        {options.map((opt) => (
          <option key={opt} value={opt}>
            {opt}
          </option>
        ))}
      </select>
    </div>
  );
}
