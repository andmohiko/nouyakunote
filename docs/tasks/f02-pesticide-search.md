# F-02: 農薬検索 実装計画

## 概要

FAMIC（農林水産消費安全技術センター）が公開する農薬登録情報をNeon PostgreSQLに格納し、作物名で農薬を検索して一覧表示する機能を実装する。農薬マスターデータは検索性（部分一致・JOIN）を重視し、Firestore ではなく PostgreSQL を使用する。

## 前提条件

- [F-02-1: FAMIC エクセル → CSV 変換](./f02-1-xls-to-csv.md) が完了し、`assets/csv/` にCSVファイルが生成されていること

## アーキテクチャ

```
assets/csv/*.csv（F-02-1 で生成済み）
    ↓ Prisma seed スクリプト
Neon PostgreSQL（pesticides / pesticide_applications テーブル）
    ↓ Next.js API Routes（apps/console）
apps/web フロントエンド（検索UI）
```

## 実装内容

### Phase 1: apps/console セットアップ

#### 1.1 Next.js プロジェクト作成

```bash
cd apps
pnpm create next-app console --typescript --tailwind --app --src-dir --no-eslint
```

- `pnpm-workspace.yaml` に含まれるため自動認識される
- ルートの `package.json` に `console` スクリプトを追加: `"console": "pnpm -F \"console\""`

#### 1.2 Prisma セットアップ

```bash
cd apps/console
pnpm add prisma @prisma/client
npx prisma init
```

#### 1.3 環境変数

```env
# apps/console/.env
DATABASE_URL="postgresql://...@...neon.tech/neondb?sslmode=require"
```

### Phase 2: スキーマ定義 & データ投入

#### 2.1 Prisma スキーマ

**ファイル:** `apps/console/prisma/schema.prisma`

実際のFAMICデータのカラム構成に基づく（F-02-1 のカラム定義を参照）。

**pesticides テーブル（登録基本部）:**

| カラム | 型 | 説明 |
|--------|---|------|
| id | Int (PK) | 自動採番 |
| registration_number | String (UNIQUE) | 登録番号 |
| pesticide_type | String | 農薬の種類 |
| pesticide_name | String | 農薬の名称 |
| company_name | String | 登録を有する者の名称 |
| active_ingredient | String | 有効成分 |
| active_ingredient_for_total_count | String | 総使用回数における有効成分 |
| concentration | String | 濃度 |
| mix_count | Int | 混合数 |
| usage | String | 用途 |
| formulation | String | 剤型名 |
| registration_date | DateTime? | 登録年月日 |

**pesticide_applications テーブル（登録適用部）:**

| カラム | 型 | 説明 |
|--------|---|------|
| id | Int (PK) | 自動採番 |
| registration_number | String (FK → pesticides) | 登録番号 |
| usage | String | 用途 |
| pesticide_type | String | 農薬の種類 |
| pesticide_name | String | 農薬の名称 |
| company_abbreviation | String | 登録を有する者の略称 |
| crop_name | String | 作物名 |
| application_place | String? | 適用場所 |
| pest_name | String | 適用病害虫雑草名 |
| purpose | String? | 使用目的 |
| dilution_rate | String | 希釈倍数使用量 |
| spray_volume | String? | 散布液量 |
| usage_period | String | 使用時期 |
| max_count | String | 本剤の使用回数 |
| usage_method | String | 使用方法 |
| fumigation_time | String? | くん蒸時間 |
| fumigation_temperature | String? | くん蒸温度 |
| application_soil | String? | 適用土壌 |
| application_area | String? | 適用地帯名 |
| application_pesticide_name | String? | 適用農薬名 |
| mix_count | Int | 混合数 |
| total_max_count_1 | String? | 有効成分①を含む農薬の総使用回数 |
| total_max_count_2 | String? | 有効成分②〜⑤ |
| total_max_count_3 | String? | |
| total_max_count_4 | String? | |
| total_max_count_5 | String? | |

**インデックス:**
- `pesticide_applications.crop_name` — 作物名検索の高速化
- `pesticide_applications.registration_number` — リレーション

#### 2.2 マイグレーション

```bash
cd apps/console
npx prisma migrate dev --name init_pesticide_tables
```

#### 2.3 Seed スクリプト

**ファイル:** `apps/console/prisma/seed.ts`

**依存ライブラリ:**
- `csv-parse`（CSVパース）

**処理フロー:**
1. `assets/csv/pesticides.csv` を読み込み、`pesticides` テーブルに UPSERT
2. `assets/csv/applications.csv` を読み込み
3. `pesticide_applications` テーブルを TRUNCATE → `createMany` でバルクINSERT
4. 1000件ずつチャンクに分割して投入
5. トランザクションで一括処理

**実行コマンド:**
```bash
cd apps/console
npx prisma db seed
```

**package.json に追加:**
```json
{
  "prisma": {
    "seed": "tsx prisma/seed.ts"
  }
}
```

### Phase 3: 農薬検索 API

#### 3.1 作物名検索API

**エンドポイント:** `GET /api/pesticides/search?crop={作物名}`

**ファイル:** `apps/console/src/app/api/pesticides/search/route.ts`

**処理フロー:**
1. クエリパラメータ `crop` を受け取る
2. `pesticide_applications` を作物名で完全一致検索
3. リレーションで `pesticides` をJOIN
4. 農薬ごとに適用情報をグルーピングして返却

**レスポンス:**
```typescript
{
  pesticides: Array<{
    registrationNumber: string
    pesticideName: string
    pesticideType: string
    usage: string
    companyName: string
    formulation: string
    applications: Array<{
      cropName: string
      pestName: string
      dilutionRate: string
      usagePeriod: string
      usageMethod: string
      maxCount: string
      totalMaxCount1: string | null
    }>
  }>
}
```

#### 3.2 農薬詳細API

**エンドポイント:** `GET /api/pesticides/[registrationNumber]`

**ファイル:** `apps/console/src/app/api/pesticides/[registrationNumber]/route.ts`

**処理フロー:**
1. パスパラメータから `registrationNumber` を取得
2. `pesticides` テーブルから基本情報を取得
3. リレーションで `pesticide_applications` も含めて返却

### Phase 4: フロントエンド連携

#### 4.1 型定義

**ファイル:** `packages/common/src/entities/Pesticide.ts`

```typescript
export type PesticideId = string

export type PesticideApplication = {
  cropName: string
  pestName: string
  dilutionRate: string
  usagePeriod: string
  usageMethod: string
  maxCount: string
  totalMaxCount1: string | null
}

export type Pesticide = {
  registrationNumber: string
  pesticideName: string
  pesticideType: string
  usage: string
  companyName: string
  formulation: string
  applications: PesticideApplication[]
}
```

#### 4.2 フロントエンド実装

**ルート:** `/search`（`apps/web/src/routes/_authed/search.tsx`）

**UI 構成:**
- テキスト入力（作物名）+ 検索ボタン
- 検索結果: 農薬カードのリスト
  - 農薬名、農薬種類、会社名
  - 対象病害虫、希釈倍率、使用回数制限
  - 「詳細を見る」リンク → `/pesticide/$id`
  - 「この農薬で記録する」ボタン → 散布記録登録へ遷移

**実装ファイル:**
- `apps/web/src/features/pesticides/hooks/useSearchPesticides.ts`
- `apps/web/src/features/pesticides/components/PesticideSearchForm/`
- `apps/web/src/features/pesticides/components/PesticideCard/`

## 対象ファイル

| ファイル | 操作 | 説明 |
|---------|------|------|
| `apps/console/` | 新規 | Next.jsアプリ |
| `apps/console/prisma/schema.prisma` | 新規 | Prismaスキーマ |
| `apps/console/prisma/seed.ts` | 新規 | データ投入スクリプト |
| `apps/console/src/app/api/pesticides/search/route.ts` | 新規 | 作物名検索API |
| `apps/console/src/app/api/pesticides/[registrationNumber]/route.ts` | 新規 | 農薬詳細API |
| `packages/common/src/entities/Pesticide.ts` | 新規 | 型定義 |
| `apps/web/src/routes/_authed/search.tsx` | 修正 | 検索画面 |
| `apps/web/src/features/pesticides/hooks/useSearchPesticides.ts` | 新規 |
| `apps/web/src/features/pesticides/components/` | 新規 |
| `package.json`（ルート） | 修正 | console スクリプト追加 |

## 確認方法

- `npx prisma migrate dev` でテーブルが作成されること
- `npx prisma db seed` でデータが投入されること
- Prisma Studioでデータを目視確認できること
- `GET /api/pesticides/search?crop=きゅうり` で農薬一覧が返ること
- `GET /api/pesticides/52` で農薬詳細が返ること
- 存在しない作物名で空配列が返ること
- `pnpm web build` が通ること

## 注意事項

- FAMICのデータは著作権がFAMICに帰属。出典を明記して利用すること
- 将来的にはCloud FunctionsのスケジューラーでFAMICサイトから自動取込する想定（本タスクのスコープ外）
