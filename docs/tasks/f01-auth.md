# F-01: ユーザー認証（SMS）実装計画

## 概要

Firebase Authentication の電話番号（SMS）認証によるログイン・ログアウト機能を実装する。

## 前提条件

- Firebase プロジェクトで電話番号認証を有効化済みであること
- Firebase Console > Authentication > Sign-in method > 電話番号 を有効化

## 実装内容

### 1. 認証プロバイダーの変更

既存の `FirebaseAuthProvider.tsx` を SMS 認証に対応させる。

**変更点:**
- `GoogleAuthProvider` + `signInWithPopup` → `RecaptchaVerifier` + `signInWithPhoneNumber` + `confirmationResult.confirm(code)`
- ログインフローが 2 ステップ（電話番号入力 → 認証コード入力）になるため、状態管理を追加

**ログインフロー:**
1. `RecaptchaVerifier` を初期化（invisible reCAPTCHA）
2. `signInWithPhoneNumber(auth, phoneNumber, recaptchaVerifier)` で SMS 送信
3. 返却された `ConfirmationResult` を state に保持
4. ユーザーが 6 桁コードを入力
5. `confirmationResult.confirm(code)` で認証完了
6. `onAuthStateChanged` でユーザー情報を取得し、Firestore に保存

### 2. ログイン画面 UI

**`/login` ルート（apps/web/src/routes/login.tsx）**

2 段階のフォーム:
- Step 1: 電話番号入力フォーム + 「認証コードを送信」ボタン
- Step 2: 6 桁認証コード入力フォーム + 「ログイン」ボタン

**バリデーション（Zod）:**
```
電話番号: 日本の携帯番号形式（090/080/070 で始まる 11 桁）→ +81 形式に変換して送信
認証コード: 数字 6 桁
```

### 3. ヘッダーの表示変更

- ログイン時: 電話番号（マスキング: 090-****-1234）+ ログアウトボタン
- 未ログイン時: ログインボタン

### 4. Firestore ユーザードキュメント

- ログイン成功時に `users/{uid}` ドキュメントの存在を確認
- 存在しなければ作成（`createUserOperation`）
- SMS 認証ではメールアドレスが取得できないため、`email` フィールドは空文字 or 電話番号を格納

### 5. reCAPTCHA 設定

- `RecaptchaVerifier` を invisible モードで使用
- 開発時は Firebase Emulator のテスト電話番号機能を活用

## 対象ファイル

| ファイル | 操作 |
|---------|------|
| `apps/web/src/providers/FirebaseAuthProvider.tsx` | 修正（SMS 認証対応） |
| `apps/web/src/routes/login.tsx` | 修正（SMS ログイン UI） |
| `apps/web/src/features/auth/schemas/loginSchema.ts` | 新規（Zod スキーマ） |
| `apps/web/src/components/Header.tsx` | 修正（電話番号表示） |
| `packages/common/src/entities/User.ts` | 確認・修正（phone フィールド追加検討） |

## 確認方法

- Firebase Emulator で テスト電話番号を使ってログインできること
- ログイン後にダッシュボードへ遷移すること
- 未ログイン状態でダッシュボードにアクセスすると `/login` にリダイレクトされること
- ログアウト後に再度ログインできること
- Firestore に `users/{uid}` ドキュメントが作成されること
