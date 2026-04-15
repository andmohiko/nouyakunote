import { useNavigate } from '@tanstack/react-router'
import type { Uid } from '@vectornote/common'
import type { User } from 'firebase/auth'
import {
  RecaptchaVerifier,
  signInWithPhoneNumber,
  signOut,
} from 'firebase/auth'
import type { ConfirmationResult } from 'firebase/auth'
import { Loader2Icon } from 'lucide-react'
import type { ReactNode } from 'react'
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react'
import { toast } from 'sonner'
import {
  createUserOperation,
  fetchUserOperation,
} from '@/infrastructure/firestore/users'
import { getContext } from '@/integrations/tanstack-query/root-provider'
import { auth, serverTimestamp } from '@/lib/firebase'

const SESSION_LOGIN_AT_KEY = 'auth_login_at'
const SESSION_MAX_AGE_MS = 30 * 24 * 60 * 60 * 1000 // 30日

type FirebaseAuthContextValue = {
  currentUser: User | null | undefined
  uid: string | null | undefined
  confirmationResult: ConfirmationResult | null
  sendSmsCode: (phoneNumber: string) => Promise<void>
  verifySmsCode: (code: string) => Promise<void>
  logout: () => Promise<void>
}

const FirebaseAuthContext = createContext<FirebaseAuthContextValue>({
  currentUser: undefined,
  uid: undefined,
  confirmationResult: null,
  sendSmsCode: async () => {},
  verifySmsCode: async () => {},
  logout: async () => {},
})

const FirebaseAuthProvider = ({
  children,
}: {
  children: ReactNode
}): ReactNode => {
  const [currentUser, setCurrentUser] = useState<User | null | undefined>(
    undefined,
  )
  const [uid, setUid] = useState<string | null | undefined>(undefined)
  const [confirmationResult, setConfirmationResult] =
    useState<ConfirmationResult | null>(null)
  const recaptchaVerifierRef = useRef<RecaptchaVerifier | null>(null)
  const navigate = useNavigate()

  const LoadingCover = () => {
    return (
      <div className="flex h-screen w-screen items-center justify-center">
        <Loader2Icon className="size-10 animate-spin" />
      </div>
    )
  }

  // 認証状態の監視
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (user) {
        // 30日セッション有効期限チェック
        const loginAt = localStorage.getItem(SESSION_LOGIN_AT_KEY)
        if (loginAt) {
          const elapsed = Date.now() - Number(loginAt)
          if (elapsed > SESSION_MAX_AGE_MS) {
            await signOut(auth)
            localStorage.removeItem(SESSION_LOGIN_AT_KEY)
            setCurrentUser(null)
            setUid(null)
            navigate({ to: '/login' })
            return
          }
        }
        setCurrentUser(user)
        setUid(user.uid)
      } else {
        setCurrentUser(null)
        setUid(null)
        navigate({ to: '/login' })
      }
    })
    return () => unsubscribe()
  }, [navigate])

  /** invisible reCAPTCHA を初期化する */
  const setupRecaptcha = useCallback((): RecaptchaVerifier => {
    if (recaptchaVerifierRef.current) {
      return recaptchaVerifierRef.current
    }
    const verifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
      size: 'invisible',
    })
    recaptchaVerifierRef.current = verifier
    return verifier
  }, [])

  /** SMS認証コードを送信する */
  const sendSmsCode = useCallback(
    async (phoneNumber: string): Promise<void> => {
      try {
        const appVerifier = setupRecaptcha()
        // 日本の電話番号形式に変換（先頭の0を+81に置換）
        const formattedPhone = phoneNumber.startsWith('0')
          ? `+81${phoneNumber.slice(1).replace(/-/g, '')}`
          : phoneNumber.replace(/-/g, '')
        const result = await signInWithPhoneNumber(
          auth,
          formattedPhone,
          appVerifier,
        )
        setConfirmationResult(result)
      } catch (error) {
        console.error('SMS送信エラー:', error)
        // reCAPTCHA をリセットして再利用可能にする
        recaptchaVerifierRef.current = null
        toast.error('認証コードの送信に失敗しました')
        throw error
      }
    },
    [setupRecaptcha],
  )

  /** 認証コードを検証してログインする */
  const verifySmsCode = useCallback(
    async (code: string): Promise<void> => {
      if (!confirmationResult) {
        toast.error('認証コードの送信を先に行ってください')
        return
      }
      try {
        const result = await confirmationResult.confirm(code)
        // ログイン成功時にログイン日時を記録
        localStorage.setItem(SESSION_LOGIN_AT_KEY, String(Date.now()))

        // ユーザードキュメントの存在確認・作成
        const uid = result.user.uid as Uid
        const existingUser = await fetchUserOperation(uid)
        if (!existingUser) {
          await createUserOperation(uid, {
            phoneNumber: result.user.phoneNumber ?? '',
            createdAt: serverTimestamp,
            updatedAt: serverTimestamp,
          })
        }

        setConfirmationResult(null)
        navigate({ to: '/' })
      } catch (error) {
        console.error('認証コード検証エラー:', error)
        toast.error('認証コードが正しくありません')
        throw error
      }
    },
    [confirmationResult, navigate],
  )

  /** ログアウトする */
  const logout = useCallback(async (): Promise<void> => {
    await signOut(auth)
    localStorage.removeItem(SESSION_LOGIN_AT_KEY)
    const { queryClient } = getContext()
    queryClient.clear()
    setConfirmationResult(null)
    recaptchaVerifierRef.current = null
  }, [])

  return (
    <FirebaseAuthContext.Provider
      value={{
        currentUser,
        uid,
        confirmationResult,
        sendSmsCode,
        verifySmsCode,
        logout,
      }}
    >
      {currentUser === undefined ? <LoadingCover /> : null}
      {children}
    </FirebaseAuthContext.Provider>
  )
}

export { FirebaseAuthContext, FirebaseAuthProvider }

export const useFirebaseAuthContext = () => useContext(FirebaseAuthContext)
