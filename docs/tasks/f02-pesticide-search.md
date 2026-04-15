# F-02: 農薬検索 実装計画

## 概要

FAMIC CSV から取り込んだ農薬マスターデータを使い、作物名で農薬を検索して一覧表示する機能を実装する。

## 実装内容

### 1. FAMIC CSV 取込バッチ（Cloud Functions）

**関数名:** `importPesticides`（onSchedule or onRequest）

**処理フロー:**
1. FAMIC の CSV ダウンロードページから ZIP ファイルを 3 つ取得
   - 登録基本部: `https://www.acis.famic.go.jp/ddata/datacsv/R0804080.zip`
   - 登録適用部1: `https://www.acis.famic.go.jp/ddata/datacsv/R0804081.zip`
   - 登録適用部2: `https://www.acis.famic.go.jp/ddata/datacsv/R0804082.zip`
   ※ URL のファイル名は更新日ごとに変わる可能性あり。ダウンロードページをパースして最新 URL を取得するか、固定パターンで対応する
2. ZIP を展開し CSV をパース（`csv-parse` ライブラリ等を使用）
3. 基本部の各行を `pesticides/{registrationNumber}` ドキュメントとして書き込み
4. 適用部1 + 適用部2 を登録番号でグルーピングし、各農薬の `applications` 配列に格納
5. 適用部の作物名を抽出し、`cropIndex/{cropName}` ドキュメントに農薬登録番号の配列を構築

**依存ライブラリ（apps/functions）:**
- `node-fetch` or Node.js 組み込み `fetch`（ZIP ダウンロード）
- `adm-zip` or `jszip`（ZIP 展開）
- `csv-parse`（CSV パース）

**Cloud Scheduler 設定:**
- 実行頻度: 週 1 回（毎週月曜 02:00 JST）
- メモリ: 512MB（CSV 全体を処理するため）
- タイムアウト: 300 秒

**初回データ投入:**
- onRequest 版も用意し、手動で初回取込を実行できるようにする

### 2. 農薬検索 API（Cloud Functions）

**関数名:** `searchPesticides`（onCall）

**リクエスト:**
```typescript
{ cropName: string }
```

**処理フロー:**
1. 入力された作物名で `cropIndex/{cropName}` ドキュメントを取得
2. 該当する農薬登録番号の配列を取得
3. `pesticides` コレクションから該当農薬を取得
4. 各農薬の適用情報のうち、検索作物名に一致するものだけをフィルタして返却

**レスポンス:**
```typescript
{
  pesticides: Array<{
    registrationNumber: string
    pesticideName: string
    pesticideType: string
    companyName: string
    applications: Array<{
      cropName: string
      pestName: string
      dilutionRate: string
      usagePeriod: string
      usageMethod: string
      maxCount: string
      totalMaxCount: string
    }>
  }>
}
```

### 3. フロントエンド（農薬検索画面）

**ルート:** `/search`（`apps/web/src/routes/_authed/search.tsx`）

**UI 構成:**
- テキスト入力（作物名）+ 検索ボタン
- 検索結果: 農薬カードのリスト
  - 農薬名、農薬種類、会社名
  - 対象病害虫、希釈倍率、使用回数制限
  - 「詳細を見る」リンク → `/pesticide/$id`
  - 「この農薬で記録する」ボタン → 散布記録登録へ遷移（F-05 と連携）

**実装ファイル:**
- `apps/web/src/features/pesticides/hooks/useSearchPesticides.ts` — Cloud Functions の searchPesticides を呼ぶ useMutation
- `apps/web/src/features/pesticides/components/PesticideSearchForm/` — 検索フォーム
- `apps/web/src/features/pesticides/components/PesticideCard/` — 検索結果カード

### 4. 型定義（packages/common）

```typescript
// packages/common/src/entities/Pesticide.ts
export const pesticideCollection = 'pesticides' as const
export type PesticideId = string

export type PesticideApplication = {
  cropName: string
  pestName: string
  dilutionRate: string
  usagePeriod: string
  usageMethod: string
  maxCount: string
  totalMaxCount: string
}

export type Pesticide = {
  registrationNumber: string
  pesticideName: string
  pesticideType: string
  usage: string
  companyName: string
  applications: PesticideApplication[]
  updatedAt: Date
}
```

## 対象ファイル

| ファイル | 操作 |
|---------|------|
| `apps/functions/src/api/pesticides/importPesticides.ts` | 新規（CSV 取込バッチ） |
| `apps/functions/src/api/pesticides/searchPesticides.ts` | 新規（検索 API） |
| `apps/functions/src/index.ts` | 修正（関数エクスポート追加） |
| `apps/web/src/routes/_authed/search.tsx` | 修正（検索画面） |
| `apps/web/src/features/pesticides/hooks/useSearchPesticides.ts` | 新規 |
| `apps/web/src/features/pesticides/components/PesticideSearchForm/` | 新規 |
| `apps/web/src/features/pesticides/components/PesticideCard/` | 新規 |
| `packages/common/src/entities/Pesticide.ts` | 新規（型定義） |

## 確認方法

- `importPesticides` を手動実行し、Firestore に `pesticides` と `cropIndex` のデータが投入されること
- 「大根」で検索して農薬一覧が表示されること
- 検索結果の農薬名・病害虫・希釈倍率が正しいこと
- 存在しない作物名で検索すると「該当なし」と表示されること
- `pnpm functions pre-build` が通ること
- `pnpm web build` が通ること
