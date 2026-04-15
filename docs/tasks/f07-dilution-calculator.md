# F-07: 希釈計算機 実装計画

## 概要

水量と希釈倍率から農薬の必要量を自動計算する機能を実装する。液剤（ml）と粉剤（g）の単位切替に対応する。

## 実装内容

### 1. 計算ロジック

**コア計算式:**
```
農薬量 = 水量 (L) × 1000 ÷ 希釈倍率
```

- 液剤 → 結果は ml 単位
- 粉剤・水和剤 → 結果は g 単位

**単位変換:**
- ml → L: ÷ 1000
- g → kg: ÷ 1000

**ユーティリティ関数:**

`apps/web/src/features/calculator/utils/calculateDilution.ts`（新規）

```typescript
type FormulationType = 'liquid' | 'powder'

type DilutionResult = {
  amount: number
  unit: 'ml' | 'g'
  convertedAmount: number
  convertedUnit: 'L' | 'kg'
}

const calculateDilution = (
  waterAmountLiters: number,
  dilutionRate: number,
  formulationType: FormulationType,
): DilutionResult
```

この関数はフロントエンドのみで使用する純粋関数。Cloud Functions は不要。

### 2. 希釈計算機画面

**ルート:** `/calculator`（`apps/web/src/routes/_authed/calculator.tsx`）

**UI 構成:**

```
┌─────────────────────────────────┐
│         希釈計算機               │
├─────────────────────────────────┤
│                                 │
│  剤型                           │
│  [液剤(ml)]  [粉剤・水和剤(g)]  │  ← トグルボタン
│                                 │
│  水量                           │
│  [ 100        ] L               │  ← 数値入力
│                                 │
│  希釈倍率                       │
│  [ 1000       ] 倍              │  ← 数値入力
│                                 │
│  ═══════════════════════════    │
│  必要農薬量: 100 ml (= 0.1 L)  │  ← リアルタイム計算結果
│  ═══════════════════════════    │
│                                 │
│  [散布記録に反映する]           │  ← ボタン（任意）
└─────────────────────────────────┘
```

**インタラクション:**
- 水量 or 希釈倍率を変更すると **リアルタイムで** 計算結果が更新される（onChange）
- 剤型を切り替えると結果の単位が ml ⇔ g に変わる
- 変換後の単位（L / kg）も併記する

### 3. 散布記録登録画面との連携

**パターン A: URL パラメータで連携**

散布記録登録画面から「希釈計算機を使う」リンクで `/calculator` に遷移。
計算結果をURLパラメータで散布記録登録画面に戻す。

```
/calculator?returnTo=sprays&pesticideName=○○乳剤
↓ 計算完了後
/sprays?pesticideAmount=100&pesticideAmountUnit=ml
```

**パターン B: 散布記録登録フォーム内に計算機を組み込む**

登録モーダル内にインライン計算機を設置し、計算結果をフォームフィールドに直接反映する。

→ パターン B の方がスマートフォンでの操作性が良い。画面遷移が少ない。

### 4. コンポーネント

| コンポーネント | 説明 |
|-------------|------|
| `DilutionCalculator` | 計算機本体（独立ページ・インライン両対応） |
| `FormulationTypeToggle` | 液剤 / 粉剤の切り替えトグル |
| `CalculationResult` | 計算結果の表示 |

`apps/web/src/features/calculator/components/DilutionCalculator/` に配置。
独立ページ（`/calculator`）でもインラインでも使えるよう、props で制御する。

## 対象ファイル

| ファイル | 操作 |
|---------|------|
| `apps/web/src/routes/_authed/calculator.tsx` | 新規（計算機画面） |
| `apps/web/src/features/calculator/utils/calculateDilution.ts` | 新規（計算ロジック） |
| `apps/web/src/features/calculator/components/DilutionCalculator/` | 新規 |

## 確認方法

- 水量 100L、倍率 1000、液剤 → 結果が 100ml (0.1L) と表示されること
- 水量 100L、倍率 2000、粉剤 → 結果が 50g (0.05kg) と表示されること
- 水量 0 や倍率 0 の場合、エラーにならずに 0 or 入力促進メッセージが表示されること
- 剤型の切り替えで単位が正しく変わること
- リアルタイムで計算結果が更新されること
- `pnpm web build` が通ること
