# F-03: 農薬詳細表示 実装計画

## 概要

農薬の登録情報（有効成分・対象作物・希釈倍率・使用方法など）を詳細表示する画面を実装する。

## 前提条件

- F-02（農薬検索）の FAMIC CSV 取込が完了し、`pesticides` コレクションにデータが格納されていること

## 実装内容

### 1. Firestore 操作

**`apps/web/src/infrastructure/firestore/pesticides.ts`（新規）**

```
fetchPesticideOperation(registrationNumber: string): Promise<Pesticide | null>
```

- `pesticides/{registrationNumber}` ドキュメントを取得
- 農薬マスターは全ユーザー共通データのため、ユーザー認証なしで読み取り可能（Firestore Rules で `pesticides` コレクションは読み取りのみ許可）

### 2. Hook

**`apps/web/src/features/pesticides/hooks/usePesticide.ts`（新規）**

```typescript
const pesticideQueryKey = (id: string) => ['pesticides', id] as const

const usePesticide = (registrationNumber: string) => {
  return useQuery({
    queryKey: pesticideQueryKey(registrationNumber),
    queryFn: () => fetchPesticideOperation(registrationNumber),
  })
}
```

### 3. 農薬詳細画面

**ルート:** `/pesticide/$id`（`apps/web/src/routes/_authed/pesticide.$id.tsx`）

**表示内容:**
- 農薬名（大きく表示）
- 農薬登録番号
- 農薬種類（乳剤・水和剤等）
- 用途（殺虫・殺菌・除草等）
- 会社名

**適用情報テーブル:**

| 作物名 | 適用病害虫 | 希釈倍率 | 使用時期 | 使用方法 | 使用回数 | 総使用回数 |
|--------|-----------|---------|---------|---------|---------|-----------|

- 「この農薬で記録する」ボタン → 散布記録登録画面へ遷移（農薬名・登録番号を引き継ぎ）

### 4. Firestore Security Rules

`pesticides` コレクションの読み取りを認証済みユーザーに許可する。

```
match /pesticides/{pesticideId} {
  allow read: if request.auth != null;
}
match /cropIndex/{cropName} {
  allow read: if request.auth != null;
}
```

## 対象ファイル

| ファイル | 操作 |
|---------|------|
| `apps/web/src/routes/_authed/pesticide.$id.tsx` | 新規（詳細画面） |
| `apps/web/src/infrastructure/firestore/pesticides.ts` | 新規（Firestore 操作） |
| `apps/web/src/features/pesticides/hooks/usePesticide.ts` | 新規 |
| `apps/web/src/features/pesticides/components/PesticideDetail/` | 新規（詳細コンポーネント） |
| `apps/web/src/features/pesticides/components/ApplicationTable/` | 新規（適用情報テーブル） |
| `firestore.rules` | 修正（pesticides, cropIndex の読み取り許可） |

## 確認方法

- 農薬検索画面から「詳細を見る」をタップして詳細画面に遷移すること
- 農薬名・種類・会社名・適用情報が正しく表示されること
- 適用情報テーブルに作物名・病害虫・希釈倍率等が表示されること
- 「この農薬で記録する」ボタンが動作すること
- `pnpm web build` が通ること
