import { MonitorIcon, MoonIcon, SunIcon } from 'lucide-react'
import { useEffect, useState } from 'react'

import { cn } from '@/lib/utils'

type ThemeMode = 'light' | 'dark' | 'auto'

type ThemeOption = {
  value: ThemeMode
  label: string
  icon: React.ReactNode
}

const themeOptions: Array<ThemeOption> = [
  { value: 'light', label: 'ライト', icon: <SunIcon className="size-5" /> },
  { value: 'dark', label: 'ダーク', icon: <MoonIcon className="size-5" /> },
  { value: 'auto', label: '自動', icon: <MonitorIcon className="size-5" /> },
]

const getStoredTheme = (): ThemeMode => {
  if (typeof window === 'undefined') return 'auto'
  const stored = window.localStorage.getItem('theme')
  if (stored === 'light' || stored === 'dark' || stored === 'auto') {
    return stored
  }
  return 'auto'
}

const applyTheme = (mode: ThemeMode): void => {
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
  const resolved = mode === 'auto' ? (prefersDark ? 'dark' : 'light') : mode

  document.documentElement.classList.remove('light', 'dark')
  document.documentElement.classList.add(resolved)

  if (mode === 'auto') {
    document.documentElement.removeAttribute('data-theme')
  } else {
    document.documentElement.setAttribute('data-theme', mode)
  }

  document.documentElement.style.colorScheme = resolved
}

export const ThemeSelector = () => {
  const [mode, setMode] = useState<ThemeMode>('auto')

  useEffect(() => {
    const initial = getStoredTheme()
    setMode(initial)
    applyTheme(initial)
  }, [])

  // auto モード時にシステム設定の変更を追従
  useEffect(() => {
    if (mode !== 'auto') return
    const media = window.matchMedia('(prefers-color-scheme: dark)')
    const onChange = (): void => applyTheme('auto')
    media.addEventListener('change', onChange)
    return () => media.removeEventListener('change', onChange)
  }, [mode])

  const handleSelect = (selected: ThemeMode): void => {
    setMode(selected)
    applyTheme(selected)
    window.localStorage.setItem('theme', selected)
  }

  return (
    <div className="flex gap-2">
      {themeOptions.map((option) => (
        <button
          key={option.value}
          type="button"
          onClick={() => handleSelect(option.value)}
          className={cn(
            'flex flex-1 flex-col items-center gap-2 rounded-lg border px-4 py-3 text-sm font-medium transition-colors',
            mode === option.value
              ? 'border-primary bg-primary text-primary-foreground'
              : 'border-border bg-background text-muted-foreground hover:bg-accent hover:text-foreground',
          )}
        >
          {option.icon}
          {option.label}
        </button>
      ))}
    </div>
  )
}
