# F-05: 散布記録の登録 実装計画

## 概要

使用した農薬の日付・倍率・量・圃場を履歴として記録する機能を実装する。

## 前提条件

- F-04（圃場管理）で圃場が登録済みであること
- F-02（農薬検索）が実装済みであること（検索結果からの遷移に必要）

## 実装内容

### 1. 型定義（packages/common）

**`packages/common/src/entities/Spray.ts`（新規）**

```typescript
export const sprayCollection = 'sprays' as const
export type SprayId = string

export type Spray = {
  sprayId: SprayId
  sprayedAt: Date
  pesticideName: string
  registrationNumber: string
  targetCrop: string
  targetPest: string
  fieldId: FieldId
  fieldName: string
  dilutionRate: number
  sprayAmount: number
  sprayAmountUnit: string       // 'ml' | 'L'
  pesticideAmount: number
  pesticideAmountUnit: string   // 'ml' | 'L' | 'g' | 'kg'
  note: string
  userId: Uid
  createdAt: Date
  updatedAt: Date
}

export type CreateSprayDto = Omit<Spray, 'sprayId' | 'createdAt' | 'updatedAt'> & {
  createdAt: FieldValue
  updatedAt: FieldValue
}
```

### 2. Firestore 操作

**`apps/web/src/infrastructure/firestore/sprays.ts`（新規）**

| 関数名 | 説明 |
|--------|------|
| `createSprayOperation(dto)` | 散布記録を作成 |

※ 一覧取得・更新・削除は F-06 で実装

### 3. Hooks

**`apps/web/src/features/sprays/hooks/useCreateSprayMutation.ts`（新規）**

- `useMutation` で `createSprayOperation` を呼び出す
- 成功時: トースト表示 + `['sprays', userId]` を invalidate
- エラー時: トースト表示

### 4. Zod スキーマ

**`apps/web/src/features/sprays/schemas/spraySchema.ts`（新規）**

```typescript
export const sprayFormSchema = z.object({
  sprayedAt: z.date({ required_error: '散布日を入力してください' }),
  pesticideName: z.string().min(1, '農薬名を入力してください'),
  registrationNumber: z.string().optional().default(''),
  targetCrop: z.string().min(1, '対象作物を入力してください'),
  targetPest: z.string().optional().default(''),
  fieldId: z.string().min(1, '圃場を選択してください'),
  dilutionRate: z.number().min(1, '希釈倍率を入力してください'),
  sprayAmount: z.number().min(0.01, '散布量を入力してください'),
  sprayAmountUnit: z.enum(['ml', 'L']),
  pesticideAmount: z.number().min(0.01, '農薬使用量を入力してください'),
  pesticideAmountUnit: z.enum(['ml', 'L', 'g', 'kg']),
  note: z.string().max(500, '備考は500文字以内です').optional().default(''),
})
```

### 5. 散布記録登録画面（モーダル）

**ルート:** `/sprays` 上のモーダル

spec の画面構成に従い、散布記録一覧画面（`/sprays`）上でモーダルとして登録フォームを表示する。

**フォーム構成:**
- 散布日: DatePicker（デフォルト: 今日、未来日不可）
- 農薬名: テキスト入力（農薬検索から遷移時は自動入力）
- 農薬登録番号: 非表示（農薬検索から遷移時に自動セット）
- 対象作物: テキスト入力（農薬検索から遷移時は自動入力）
- 対象病害虫: テキスト入力（任意）
- 圃場: セレクトボックス（`useFields` で取得した圃場リストから選択）
- 希釈倍率: 数値入力
- 散布量 + 単位: 数値入力 + セレクト（ml / L）
- 農薬使用量 + 単位: 数値入力 + セレクト（ml / L / g / kg）
- 備考: テキストエリア（任意）
- 「希釈計算機を使う」リンク → `/calculator` へ遷移（F-07 と連携）

**農薬検索からの遷移:**
- URL クエリパラメータ or state で農薬情報を渡す
- 例: `/sprays?pesticideName=○○乳剤&registrationNumber=12345&dilutionRate=1000&targetCrop=大根`

### 6. Firestore Security Rules

```
match /sprays/{sprayId} {
  allow create: if request.auth != null && request.resource.data.userId == request.auth.uid;
}
```

## 対象ファイル

| ファイル | 操作 |
|---------|------|
| `packages/common/src/entities/Spray.ts` | 新規（型定義） |
| `packages/common/src/entities/index.ts` | 修正（エクスポート追加） |
| `apps/web/src/infrastructure/firestore/sprays.ts` | 新規（Firestore 操作） |
| `apps/web/src/features/sprays/hooks/useCreateSprayMutation.ts` | 新規 |
| `apps/web/src/features/sprays/schemas/spraySchema.ts` | 新規 |
| `apps/web/src/features/sprays/components/CreateSprayModal/` | 新規（登録モーダル） |
| `apps/web/src/routes/_authed/sprays.tsx` | 新規 or 修正（モーダル呼び出し） |
| `firestore.rules` | 修正（sprays ルール追加） |

## 確認方法

- 散布記録登録モーダルが表示されること
- 全必須項目を入力して「記録する」で保存できること
- 農薬検索画面から遷移した場合、農薬名・希釈倍率が自動入力されること
- 圃場セレクトボックスに登録済み圃場が表示されること
- バリデーションエラーが正しく表示されること
- Firestore に `sprays` ドキュメントが作成されること
- `pnpm web build` が通ること
