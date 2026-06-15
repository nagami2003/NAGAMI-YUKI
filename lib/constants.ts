export const SUPPORT_TYPES = [
  {
    id: "pre_guidance",
    label: "事前ガイダンス",
    description: "入国前の生活・労働に関するガイダンス",
  },
  {
    id: "airport",
    label: "出入国時の送迎",
    description: "空港等への送迎支援",
  },
  {
    id: "housing",
    label: "住居確保支援",
    description: "適切な住居の確保・契約支援",
  },
  {
    id: "life_orientation",
    label: "生活オリエンテーション",
    description: "日本の生活・ルールの説明",
  },
  {
    id: "japanese",
    label: "日本語学習支援",
    description: "日本語習得のための学習機会の提供",
  },
  {
    id: "consultation",
    label: "相談・苦情対応",
    description: "労働・生活上の相談・苦情への対応",
  },
  {
    id: "interaction",
    label: "日本人との交流促進",
    description: "地域住民・日本人との交流活動支援",
  },
  {
    id: "job_change",
    label: "転職支援",
    description: "非自発的離職時の転職活動支援",
  },
  {
    id: "regular_interview",
    label: "定期面談",
    description: "3ヶ月ごとの定期的な面談実施",
  },
  {
    id: "government",
    label: "行政機関への同行",
    description: "行政手続きへの同行・支援",
  },
];

export const NATIONALITIES = [
  "フィリピン",
  "ベトナム",
  "インドネシア",
  "ミャンマー",
  "カンボジア",
  "タイ",
  "ネパール",
  "中国",
  "モンゴル",
  "スリランカ",
  "バングラデシュ",
  "パキスタン",
  "インド",
  "その他",
];

export const VISA_STATUSES = ["特定技能1号", "特定技能2号"];

export const DOCUMENT_TYPES = [
  { id: "visa", label: "ビザ・在留資格認定証明書" },
  { id: "residence_card", label: "在留カード" },
  { id: "contract", label: "雇用契約書" },
  { id: "insurance", label: "健康保険・年金証書" },
  { id: "passport", label: "パスポート" },
  { id: "support_plan", label: "支援計画書" },
  { id: "other", label: "その他" },
];

export const SUPPORT_STATUS_LABELS: Record<string, string> = {
  pending: "未実施",
  completed: "完了",
  not_applicable: "対象外",
};

export const INTERVIEW_STATUS_LABELS: Record<string, string> = {
  scheduled: "予定",
  completed: "完了",
  cancelled: "キャンセル",
};

export const REPORT_TYPES = [
  { id: "quarterly", label: "四半期報告" },
  { id: "annual", label: "年次報告" },
  { id: "support_plan", label: "支援計画書" },
  { id: "activity_report", label: "活動状況報告" },
];
