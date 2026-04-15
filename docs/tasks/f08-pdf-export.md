# F-08: PDF 出力 実装計画

## 概要

散布記録を帳票形式で PDF 出力する機能を実装する。直売所・市場出荷時の提出資料として使用する。

## 前提条件

- F-06（散布記録の一覧）が実装済みであること

## 実装内容

### 1. 依存ライブラリの追加

**`apps/web/package.json` に追加:**

```json
{
  "dependencies": {
    "jspdf": "^2.x",
    "jspdf-autotable": "^3.x"
  }
}
```

**日本語フォント:**
- NotoSansJP（Regular / Bold）の TTF を `apps/web/public/fonts/` に配置
- jspdf にフォントを登録して日本語表示に対応

### 2. PDF 出力画面

**ルート:** `/export`（`apps/web/src/routes/_authed/export.tsx`）

**UI 構成:**

```
┌─────────────────────────────────┐
│         PDF 出力                │
├─────────────────────────────────┤
│                                 │
│  対象期間                       │
│  [2026/01/01] 〜 [2026/03/31]  │  ← DatePicker
│                                 │
│  対象圃場                       │
│  ○ 全圃場                      │
│  ○ 圃場を選択                  │
│    ☑ 第1畑                     │
│    ☐ 第2畑                     │
│    ☑ 裏の田んぼ                │
│                                 │
│  プレビュー（件数）             │
│  該当する散布記録: 15 件        │
│                                 │
│  [PDF をダウンロード]           │
└─────────────────────────────────┘
```

### 3. PDF 帳票フォーマット

**ページレイアウト:** A4 横向き

**帳票ヘッダー:**
```
農薬散布記録

生産者名: ○○ ○○
対象期間: 2026/01/01 〜 2026/03/31
対象圃場: 第1畑、裏の田んぼ
出力日: 2026/04/16
```

**帳票本体（テーブル）:**

| No. | 散布日 | 圃場名 | 対象作物 | 農薬名 | 希釈倍率 | 散布量 | 農薬使用量 | 対象病害虫 | 備考 |
|-----|--------|--------|---------|--------|---------|--------|-----------|-----------|------|

**帳票フッター:**
- ページ番号（1/3 等）
- 「本記録は農薬取締法に基づく使用記録です」

### 4. PDF 生成ロジック

**`apps/web/src/features/export/utils/generateSprayRecordPdf.ts`（新規）**

```typescript
type PdfExportOptions = {
  userName: string
  startDate: Date
  endDate: Date
  fieldNames: string[]  // 対象圃場名
  sprays: Spray[]       // 出力対象の散布記録
}

const generateSprayRecordPdf = (options: PdfExportOptions): void => {
  // 1. jsPDF インスタンス生成（A4 横向き）
  // 2. NotoSansJP フォント登録
  // 3. ヘッダー描画
  // 4. jspdf-autotable でテーブル描画
  // 5. フッター描画（ページ番号）
  // 6. doc.save('農薬散布記録_YYYY-MM-DD.pdf')
}
```

**処理フロー:**
1. ユーザーが期間・圃場を選択
2. `useSprays` で該当する散布記録を取得（既存の Firestore 操作を利用）
3. 「PDF をダウンロード」ボタン押下で `generateSprayRecordPdf` を呼び出し
4. ブラウザでダウンロードが開始される

### 5. 日本語フォント対応

jspdf はデフォルトで日本語に対応していないため、フォントの組み込みが必要。

**方法:**
1. NotoSansJP-Regular.ttf をダウンロード
2. Base64 エンコードして JS ファイル化、または dynamic import で読み込み
3. `doc.addFileToVFS()` + `doc.addFont()` で登録

**フォントファイルの配置:**
```
apps/web/src/features/export/fonts/
└── NotoSansJP-Regular.ts  // Base64 エンコード済みフォントデータ
```

※ フォントファイルはバンドルサイズに影響するため（数MB）、dynamic import で遅延読み込みする。

### 6. コンポーネント

| コンポーネント | 説明 |
|-------------|------|
| `PdfExportForm` | 出力条件選択フォーム |
| `FieldSelector` | 圃場選択（全圃場 / 個別選択チェックボックス） |
| `ExportPreview` | 該当件数のプレビュー表示 |

`apps/web/src/features/export/components/` に配置。

## 対象ファイル

| ファイル | 操作 |
|---------|------|
| `apps/web/package.json` | 修正（jspdf, jspdf-autotable 追加） |
| `apps/web/src/routes/_authed/export.tsx` | 新規（PDF 出力画面） |
| `apps/web/src/features/export/utils/generateSprayRecordPdf.ts` | 新規（PDF 生成ロジック） |
| `apps/web/src/features/export/fonts/NotoSansJP-Regular.ts` | 新規（フォントデータ） |
| `apps/web/src/features/export/components/PdfExportForm/` | 新規 |
| `apps/web/src/features/export/components/FieldSelector/` | 新規 |

## 確認方法

- 期間・圃場を選択して「PDF をダウンロード」ボタンを押すと PDF がダウンロードされること
- PDF に日本語が正しく表示されること（文字化けなし）
- 帳票ヘッダーに生産者名・期間・圃場が正しく記載されること
- テーブルに散布記録が散布日降順で正しく記載されること
- フッターにページ番号が表示されること
- 該当する散布記録が 0 件の場合、適切なメッセージが表示されること
- PDF 生成が 5 秒以内に完了すること
- `pnpm web build` が通ること
