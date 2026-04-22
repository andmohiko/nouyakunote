# F-02-1: FAMIC エクセル → CSV 変換

## 概要

`assets/raw/` にあるFAMICの農薬登録情報エクセルファイル（.xls）をCSVファイルに変換するスクリプトを、`packages/etl` パッケージとして実装する。

## 入力ファイル

| ファイル | データシート名 | 行数 | 内容 |
|---------|--------------|------|------|
| `assets/raw/登録基本部.xls` | `登録基本部` | 約6,340行 | 農薬基本情報 |
| `assets/raw/登録適用部一.xls` | `登録適用部一` | 約58,810行 | 適用情報（登録番号 52〜22553） |
| `assets/raw/登録適用部二.xls` | `登録適用部二` | 約41,717行 | 適用情報（登録番号 22554〜） |

各ファイルには複数シートがあり、1枚目は「更新日付」シート（メタ情報）、データ本体は上記のシート名で格納されている。

## カラム構成（実ファイルのヘッダーより確定）

### 登録基本部（11カラム）

| # | カラム名 | 型 | 例 |
|---|---------|---|-----|
| 1 | 登録番号 | number | 52 |
| 2 | 農薬の種類 | string | 除虫菊乳剤 |
| 3 | 農薬の名称 | string | 金鳥除虫菊乳剤3 |
| 4 | 登録を有する者の名称 | string | 大日本除蟲菊株式会社 |
| 5 | 有効成分 | string | ﾋﾟﾚﾄﾘﾝ |
| 6 | 総使用回数における有効成分 | string | ﾋﾟﾚﾄﾘﾝ |
| 7 | 濃度 | string | 3.0% |
| 8 | 混合数 | number | 1 |
| 9 | 用途 | string | 殺虫剤 |
| 10 | 剤型名 | string | 乳剤 |
| 11 | 登録年月日 | number（Excelシリアル値） | 17826 |

> ⚠️ 登録年月日はExcelのシリアル値（1900年基準の日数）で格納されている。CSV出力時に `YYYY-MM-DD` 形式に変換する。

### 登録適用部一・二（共通、25カラム）

| # | カラム名 | 例 |
|---|---------|-----|
| 1 | 登録番号 | 52 |
| 2 | 用途 | 殺虫剤 |
| 3 | 農薬の種類 | 除虫菊乳剤 |
| 4 | 農薬の名称 | 金鳥除虫菊乳剤3 |
| 5 | 登録を有する者の略称 | 除虫菊 |
| 6 | 作物名 | きゅうり |
| 7 | 適用場所 | （null可） |
| 8 | 適用病害虫雑草名 | ｱﾌﾞﾗﾑｼ類 |
| 9 | 使用目的 | （null可） |
| 10 | 希釈倍数使用量 | 1000～1600倍 |
| 11 | 散布液量 | 100～300㍑/10a |
| 12 | 使用時期 | 収穫前日まで |
| 13 | 本剤の使用回数 | 5回以内 |
| 14 | 使用方法 | 散布 |
| 15 | くん蒸時間 | （null可） |
| 16 | くん蒸温度 | （null可） |
| 17 | 適用土壌 | （null可） |
| 18 | 適用地帯名 | （null可） |
| 19 | 適用農薬名 | （null可） |
| 20 | 混合数 | 1 |
| 21 | 有効成分①を含む農薬の総使用回数 | 5回以内 |
| 22 | 有効成分②を含む農薬の総使用回数 | （null可） |
| 23 | 有効成分③を含む農薬の総使用回数 | （null可） |
| 24 | 有効成分④を含む農薬の総使用回数 | （null可） |
| 25 | 有効成分⑤を含む農薬の総使用回数 | （null可） |

## 出力ファイル

| 出力先 | 内容 |
|--------|------|
| `assets/csv/pesticides.csv` | 登録基本部 |
| `assets/csv/applications.csv` | 登録適用部一 + 登録適用部二を結合 |

- CSV形式: UTF-8、カンマ区切り、ヘッダー行あり
- ヘッダーは英語のスネークケースに変換する
- null値は空文字として出力
- 適用部一と適用部二は同一カラム構成のため、1ファイルに結合して出力する

### CSVヘッダーマッピング

**pesticides.csv:**
```
registration_number,pesticide_type,pesticide_name,company_name,active_ingredient,active_ingredient_for_total_count,concentration,mix_count,usage,formulation,registration_date
```

**applications.csv:**
```
registration_number,usage,pesticide_type,pesticide_name,company_abbreviation,crop_name,application_place,pest_name,purpose,dilution_rate,spray_volume,usage_period,max_count,usage_method,fumigation_time,fumigation_temperature,application_soil,application_area,application_pesticide_name,mix_count,total_max_count_1,total_max_count_2,total_max_count_3,total_max_count_4,total_max_count_5
```

## パッケージ構成

```
packages/etl/
├── package.json
├── tsconfig.json
└── src/
    └── convert-xls-to-csv.ts
```

### package.json

```json
{
  "name": "@repo/etl",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "convert": "tsx src/convert-xls-to-csv.ts"
  },
  "dependencies": {
    "xlsx": "^0.18.5"
  },
  "devDependencies": {
    "tsx": "^4.0.0",
    "typescript": "^5.3.0"
  }
}
```

### tsconfig.json

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "strict": true,
    "esModuleInterop": true,
    "outDir": "dist",
    "rootDir": "src"
  },
  "include": ["src"]
}
```

## 実装: `src/convert-xls-to-csv.ts`

### 処理フロー

1. `assets/raw/登録基本部.xls` を読み込み、`登録基本部` シートを取得
2. ヘッダー行（row 0）を英語スネークケースにマッピング
3. 登録年月日（Excelシリアル値）を `YYYY-MM-DD` に変換
4. `assets/csv/pesticides.csv` として出力
5. `assets/raw/登録適用部一.xls` の `登録適用部一` シートを読み込み
6. `assets/raw/登録適用部二.xls` の `登録適用部二` シートを読み込み
7. ヘッダー行を英語スネークケースにマッピング
8. 適用部一と適用部二のデータ行を結合
9. `assets/csv/applications.csv` として出力
10. 各ファイルの出力行数をコンソールに表示

### Excelシリアル値 → 日付変換

```typescript
/** Excelシリアル値をYYYY-MM-DD形式に変換 */
const excelDateToString = (serial: number): string => {
  // Excelの1900年基準（1900-01-01 = 1）
  // 1900年2月29日のバグ補正（Excel は1900年をうるう年として扱う）
  const date = new Date((serial - 25569) * 86400 * 1000)
  return date.toISOString().split('T')[0]
}
```

### null/undefined の処理

- xlsxライブラリはセルが空の場合 `null` または `undefined` を返す
- CSV出力時には空文字 `""` として出力する

## 実行方法

```bash
# packages/etl ディレクトリで直接実行
cd packages/etl
pnpm convert

# または、ルートからワークスペース経由
pnpm etl convert
```

## ルート package.json への追加

```json
{
  "scripts": {
    "etl": "pnpm -F \"@repo/etl\""
  }
}
```

## .gitignore への追加

`assets/csv/` は生成物のため、gitignore するかどうか判断が必要。
- gitignore する場合: 他の開発者はローカルで `pnpm etl convert` を実行する必要がある
- コミットする場合: seedスクリプトからすぐ使えるが、ファイルサイズが大きい

→ 適用部は合計約10万行になるため、**gitignore してローカル生成を推奨**。

## 対象ファイル

| ファイル | 操作 |
|---------|------|
| `packages/etl/package.json` | 新規 |
| `packages/etl/tsconfig.json` | 新規 |
| `packages/etl/src/convert-xls-to-csv.ts` | 新規 |
| `package.json`（ルート） | 修正（etl スクリプト追加） |
| `.gitignore` | 修正（`assets/csv/` 追加） |

## 確認方法

- `pnpm etl convert` を実行し、エラーなく完了すること
- `assets/csv/pesticides.csv` が生成され、約6,339行（ヘッダー除く）であること
- `assets/csv/applications.csv` が生成され、約100,526行（58,809 + 41,716、ヘッダー除く）であること
- CSVファイルのヘッダーが英語スネークケースであること
- 登録年月日が `YYYY-MM-DD` 形式で出力されていること
- null値が空文字として出力されていること
- UTF-8エンコーディングであること
