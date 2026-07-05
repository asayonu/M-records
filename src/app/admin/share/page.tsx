import Link from "next/link";
import AppShell from "@/components/AppShell";
import CopyShareLinkButton from "@/components/CopyShareLinkButton";
import ShareSettingsPanel from "@/components/ShareSettingsPanel";
import { getShareSettings } from "@/lib/share/actions";

export const metadata = {
  title: "共有設定 | 麻雀成績管理",
};

export default async function AdminSharePage() {
  const settings = await getShareSettings();
  const sharePath =
    settings.shareEnabled && settings.shareToken
      ? `/share/${settings.shareToken}`
      : null;

  return (
    <AppShell title="共有設定">
      <div className="space-y-8">
        <div>
          <Link
            href="/"
            className="text-sm font-medium text-emerald-700 hover:text-emerald-800"
          >
            ← カレンダー
          </Link>
          <h1 className="mt-3 text-2xl font-bold text-stone-900">共有設定</h1>
          <p className="mt-1 text-sm text-stone-600">
            リンクを知っている人は、ログインなしで記録を閲覧できます（編集不可）
          </p>
        </div>

        <section className="space-y-4 rounded-2xl border border-stone-200/80 bg-white p-5 shadow-sm">
          <ShareSettingsPanel shareEnabled={settings.shareEnabled} />

          {sharePath ? (
            <div className="space-y-3 rounded-xl border border-emerald-200 bg-emerald-50/50 p-4">
              <p className="text-xs font-medium text-stone-600">共有リンク</p>
              <p className="break-all font-mono text-sm text-stone-800">
                {sharePath}
              </p>
              <CopyShareLinkButton path={sharePath} />
            </div>
          ) : (
            <p className="text-sm text-stone-500">
              上のチェックをオンにすると、共有リンクが発行されます
            </p>
          )}
        </section>
      </div>
    </AppShell>
  );
}
