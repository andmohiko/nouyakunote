import { LogOutIcon } from 'lucide-react'
import { useNavigate } from '@tanstack/react-router'

import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { ThemeSelector } from '@/features/settings/components/ThemeSelector'
import { useFirebaseAuthContext } from '@/providers/FirebaseAuthProvider'

export const SettingsPage = () => {
  const { currentUser, logout } = useFirebaseAuthContext()
  const navigate = useNavigate()

  const handleLogout = async (): Promise<void> => {
    await logout()
    navigate({ to: '/login' })
  }

  return (
    <div className="mx-auto max-w-lg space-y-6">
      <h1 className="text-xl font-bold">設定</h1>

      {/* プロフィール */}
      <Card>
        <CardHeader>
          <CardTitle>プロフィール</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-2">
            <Label>電話番号</Label>
            <p className="text-sm text-muted-foreground">
              {currentUser?.phoneNumber ?? '未登録'}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* テーマ */}
      <Card>
        <CardHeader>
          <CardTitle>テーマ</CardTitle>
          <CardDescription>アプリの表示モードを切り替えます</CardDescription>
        </CardHeader>
        <CardContent>
          <ThemeSelector />
        </CardContent>
      </Card>

      {/* アカウント */}
      <Card>
        <CardHeader>
          <CardTitle>アカウント</CardTitle>
        </CardHeader>
        <CardContent>
          <Button variant="outline" onClick={handleLogout}>
            <LogOutIcon className="size-4" />
            ログアウト
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
