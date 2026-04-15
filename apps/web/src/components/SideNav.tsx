import { Link, useLocation } from '@tanstack/react-router'
import {
  CalculatorIcon,
  FileOutputIcon,
  HomeIcon,
  MapIcon,
  SearchIcon,
  SettingsIcon,
  SprayCanIcon,
  XIcon,
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

type NavItem = {
  label: string
  to: string
  icon: React.ReactNode
}

const navItems: Array<NavItem> = [
  { label: 'ダッシュボード', to: '/', icon: <HomeIcon className="size-5" /> },
  { label: '農薬検索', to: '/search', icon: <SearchIcon className="size-5" /> },
  { label: '散布記録', to: '/sprays', icon: <SprayCanIcon className="size-5" /> },
  { label: '圃場管理', to: '/fields', icon: <MapIcon className="size-5" /> },
  { label: '希釈計算機', to: '/calculator', icon: <CalculatorIcon className="size-5" /> },
  { label: 'PDF出力', to: '/export', icon: <FileOutputIcon className="size-5" /> },
  { label: '設定', to: '/settings', icon: <SettingsIcon className="size-5" /> },
]

type SideNavProps = {
  isOpen: boolean
  onClose: () => void
}

export const SideNav = ({ isOpen, onClose }: SideNavProps) => {
  const location = useLocation()

  return (
    <>
      {/* モバイルオーバーレイ */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 md:hidden"
          onClick={onClose}
          onKeyDown={(e) => {
            if (e.key === 'Escape') onClose()
          }}
        />
      )}

      {/* サイドナビ */}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-border bg-background transition-transform duration-200 md:static md:translate-x-0',
          isOpen ? 'translate-x-0' : '-translate-x-full',
        )}
      >
        <div className="flex items-center justify-between border-b border-border px-4 py-3 md:hidden">
          <span className="text-base font-bold">農薬ノート</span>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <XIcon className="size-5" />
          </Button>
        </div>
        <nav className="flex-1 overflow-y-auto p-2">
          <ul className="flex flex-col gap-1">
            {navItems.map((item) => {
              const isActive =
                item.to === '/'
                  ? location.pathname === '/'
                  : location.pathname.startsWith(item.to)
              return (
                <li key={item.to}>
                  <Link
                    to={item.to}
                    onClick={onClose}
                    className={cn(
                      'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                      isActive
                        ? 'bg-primary text-primary-foreground'
                        : 'text-muted-foreground hover:bg-accent hover:text-foreground',
                    )}
                  >
                    {item.icon}
                    {item.label}
                  </Link>
                </li>
              )
            })}
          </ul>
        </nav>
      </aside>
    </>
  )
}
