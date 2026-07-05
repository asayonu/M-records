# M-records（麻雀成績管理）

Next.js + Prisma で対局記録・成績を管理する Web アプリです。

## ローカル開発

```bash
npm install
cp .env.example .env
# .env に PostgreSQL の DATABASE_URL と AUTH_SECRET を設定
npx prisma db push
npm run dev
```

## Vercel へのデプロイ

Vercel のサーバーレス環境では **SQLite は使えません**。PostgreSQL が必要です。

### 1. Neon でデータベースを作成（無料）

1. [Neon](https://neon.tech/) でプロジェクトを作成
2. **Connection string**（`postgresql://...`）をコピー

### 2. Vercel の環境変数を設定

Vercel ダッシュボード → プロジェクト → **Settings → Environment Variables**

| 名前 | 値 |
|------|-----|
| `DATABASE_URL` | Neon の PostgreSQL 接続文字列 |
| `AUTH_SECRET` | 16文字以上のランダム文字列（例: `openssl rand -base64 32` の出力） |

**Production / Preview / Development** すべてに設定してください。

### 3. 再デプロイ

環境変数を保存したあと **Redeploy** します。  
ビルド時に `prisma db push` でテーブルが自動作成されます。

### 4. 初回利用

1. `https://m-records.vercel.app/register` でアカウント作成
2. ログインしてプレイヤー・ルールを登録

## 主な機能

- アカウントごとのデータ管理（ログイン / 新規登録）
- プレイヤー・ルール管理、対局記録
- カレンダー表示、通算成績・pt 推移グラフ
- 閲覧専用共有リンク（`/admin/share`）

## 技術スタック

- Next.js 15, React 19, Tailwind CSS 4
- Prisma 6, PostgreSQL
