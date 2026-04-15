import { PhoneIcon } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useFirebaseAuthContext } from '@/providers/FirebaseAuthProvider'

type Step = 'phone' | 'verify'

export const LoginForm = () => {
  const { sendSmsCode, verifySmsCode } = useFirebaseAuthContext()
  const [step, setStep] = useState<Step>('phone')
  const [phoneNumber, setPhoneNumber] = useState('')
  const [verificationCode, setVerificationCode] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleSendCode = async (
    e: React.FormEvent<HTMLFormElement>,
  ): Promise<void> => {
    e.preventDefault()
    setIsLoading(true)
    try {
      await sendSmsCode(phoneNumber)
      setStep('verify')
      toast.success('認証コードを送信しました')
    } catch {
      // エラー通知は FirebaseAuthProvider 側で行う
    } finally {
      setIsLoading(false)
    }
  }

  const handleVerifyCode = async (
    e: React.FormEvent<HTMLFormElement>,
  ): Promise<void> => {
    e.preventDefault()
    setIsLoading(true)
    try {
      await verifySmsCode(verificationCode)
    } catch {
      // エラー通知は FirebaseAuthProvider 側で行う
    } finally {
      setIsLoading(false)
    }
  }

  const handleBack = (): void => {
    setStep('phone')
    setVerificationCode('')
  }

  return (
    <Card className="w-full">
      {step === 'phone' ? (
        <form onSubmit={handleSendCode}>
          <CardHeader>
            <CardTitle>ログイン</CardTitle>
            <CardDescription>
              電話番号を入力してSMS認証コードを受け取ります
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="phone">電話番号</Label>
              <div className="relative">
                <PhoneIcon className="absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="phone"
                  type="tel"
                  placeholder="090-1234-5678"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  className="pl-9"
                  required
                />
              </div>
            </div>
            <Button
              type="submit"
              className="w-full"
              size="lg"
              disabled={isLoading || !phoneNumber}
            >
              {isLoading ? '送信中...' : '認証コードを送信'}
            </Button>
          </CardContent>
        </form>
      ) : (
        <form onSubmit={handleVerifyCode}>
          <CardHeader>
            <CardTitle>認証コード入力</CardTitle>
            <CardDescription>
              {phoneNumber} に送信された6桁のコードを入力してください
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="code">認証コード</Label>
              <Input
                id="code"
                type="text"
                inputMode="numeric"
                placeholder="123456"
                maxLength={6}
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value)}
                required
              />
            </div>
            <Button
              type="submit"
              className="w-full"
              size="lg"
              disabled={isLoading || verificationCode.length !== 6}
            >
              {isLoading ? '確認中...' : 'ログイン'}
            </Button>
            <Button
              type="button"
              variant="ghost"
              className="w-full"
              onClick={handleBack}
            >
              電話番号を変更する
            </Button>
          </CardContent>
        </form>
      )}
    </Card>
  )
}
