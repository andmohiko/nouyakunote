import { LoginForm } from '@/features/auth/components/LoginForm'

export const LoginPage = () => {
  return (
    <main className="flex min-h-screen w-full items-center justify-center bg-background px-4">
      <div className="flex w-full max-w-sm flex-col items-center gap-8">
        <div className="flex flex-col items-center gap-2">
          <h1 className="text-2xl font-bold text-foreground">農薬ノート</h1>
          <p className="text-sm text-muted-foreground">
            農薬管理をもっとかんたんに
          </p>
        </div>
        <LoginForm />
      </div>
      {/* Firebase invisible reCAPTCHA のコンテナ */}
      <div id="recaptcha-container" />
    </main>
  )
}
