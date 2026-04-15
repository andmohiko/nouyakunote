import { Link } from '@tanstack/react-router'
import { FileOutputIcon, SettingsIcon } from 'lucide-react'

import { Button } from '@/components/ui/button'

export const Header = () => {
  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur-sm">
      <div className="flex items-center gap-3 px-4 py-3">
        <Link
          to="/"
          className="shrink-0 text-base font-bold text-foreground no-underline hover:text-foreground"
        >
          農薬ノート
        </Link>
        <div className="flex-1" />
        <Button variant="ghost" size="icon" asChild>
          <Link to="/export">
            <FileOutputIcon className="size-5" />
          </Link>
        </Button>
        <Button variant="ghost" size="icon" asChild>
          <Link to="/settings">
            <SettingsIcon className="size-5" />
          </Link>
        </Button>
      </div>
    </header>
  )
}
