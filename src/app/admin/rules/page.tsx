import Link from "next/link";
import AppShell from "@/components/AppShell";
import RuleRegisterForm from "@/components/RuleRegisterForm";
import RuleAdminList from "@/components/RuleAdminList";
import { getAllRules } from "@/lib/rules/actions";

type Props = {
  searchParams: Promise<{ error?: string }>;
};

export const metadata = {
  title: "ルール管理 | 麻雀成績管理",
};

export default async function AdminRulesPage({ searchParams }: Props) {
  const params = await searchParams;
  const rules = await getAllRules();

  return (
    <AppShell title="ルール管理">
      <div className="space-y-8">
        <div>
          <Link
            href="/"
            className="text-sm font-medium text-emerald-700 hover:text-emerald-800"
          >
            ← カレンダー
          </Link>
          <h1 className="mt-3 text-2xl font-bold text-stone-900">
            ルール管理
          </h1>
          <p className="mt-1 text-sm text-stone-600">
            三麻・四麻の持ち点など、対局ルールを登録・管理します
          </p>
          <p className="mt-2 text-sm">
            <Link
              href="/admin/players"
              className="font-medium text-emerald-700 hover:text-emerald-800"
            >
              プレイヤー管理 →
            </Link>
          </p>
        </div>

        {params.error === "in-use" && (
          <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
            対局記録があるルールは削除できません
          </p>
        )}

        <section className="space-y-4 rounded-2xl border border-stone-200/80 bg-white p-5 shadow-sm">
          <h2 className="text-sm font-semibold text-stone-700">
            新規ルール登録
          </h2>
          <RuleRegisterForm />
        </section>

        <section className="space-y-3">
          <h2 className="text-sm font-semibold text-stone-700">
            登録済みルール（{rules.length}件）
          </h2>
          <RuleAdminList rules={rules} />
        </section>
      </div>
    </AppShell>
  );
}
