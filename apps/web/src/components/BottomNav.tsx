import { Link, useLocation } from '@tanstack/react-router'
import {
  CalculatorIcon,
  HomeIcon,
  MapIcon,
  SearchIcon,
  SprayCanIcon,
} from 'lucide-react'

import { cn } from '@/lib/utils'

type NavItem = {
  label: string
  to: string
  icon: React.ReactNode
}

const navItems: Array<NavItem> = [
  { label: 'ホーム', to: '/', icon: <HomeIcon className="size-5" /> },
  { label: '検索', to: '/search', icon: <SearchIcon className="size-5" /> },
  { label: '散布記録', to: '/sprays', icon: <SprayCanIcon className="size-5" /> },
  { label: '圃場', to: '/fields', icon: <MapIcon className="size-5" /> },
  { label: '計算機', to: '/calculator', icon: <CalculatorIcon className="size-5" /> },
]

export const BottomNav = () => {
  const location = useLocation()

  return (
    <nav className="fixed inset-x-0 bottom-0 z-50 border-t border-border bg-background/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-sm">
      <ul className="flex items-center justify-around">
        {navItems.map((item) => {
          const isActive =
            item.to === '/'
              ? location.pathname === '/'
              : location.pathname.startsWith(item.to)
          return (
            <li key={item.to} className="flex-1">
              <Link
                to={item.to}
                className={cn(
                  'flex flex-col items-center gap-0.5 py-2 text-[10px] font-medium transition-colors',
                  isActive
                    ? 'text-primary'
                    : 'text-muted-foreground',
                )}
              >
                {item.icon}
                <span>{item.label}</span>
              </Link>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
