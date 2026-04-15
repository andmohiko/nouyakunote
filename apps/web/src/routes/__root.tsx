import { TanStackDevtools } from '@tanstack/react-devtools'
import type { QueryClient } from '@tanstack/react-query'
import {
  createRootRouteWithContext,
  HeadContent,
  Scripts,
} from '@tanstack/react-router'
import { TanStackRouterDevtoolsPanel } from '@tanstack/react-router-devtools'
import { useLocation } from '@tanstack/react-router'

import { BottomNav } from '@/components/BottomNav'
import { Header } from '@/components/Header'
import { Toaster } from '@/components/ui/sonner'
import TanStackQueryDevtools from '../integrations/tanstack-query/devtools'
import TanStackQueryProvider from '../integrations/tanstack-query/root-provider'
import { Providers } from '../providers'
import appCss from '../styles.css?url'

interface MyRouterContext {
  queryClient: QueryClient
}

const THEME_INIT_SCRIPT = `(function(){try{var stored=window.localStorage.getItem('theme');var mode=(stored==='light'||stored==='dark'||stored==='auto')?stored:'auto';var prefersDark=window.matchMedia('(prefers-color-scheme: dark)').matches;var resolved=mode==='auto'?(prefersDark?'dark':'light'):mode;var root=document.documentElement;root.classList.remove('light','dark');root.classList.add(resolved);if(mode==='auto'){root.removeAttribute('data-theme')}else{root.setAttribute('data-theme',mode)}root.style.colorScheme=resolved;}catch(e){}})();`

export const Route = createRootRouteWithContext<MyRouterContext>()({
  head: () => ({
    meta: [
      { charSet: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { title: '農薬ノート' },
      { name: 'description', content: '農家向けの農薬管理Webアプリケーション' },
      { name: 'theme-color', content: '#16a34a' },
      { name: 'apple-mobile-web-app-capable', content: 'yes' },
      { name: 'apple-mobile-web-app-status-bar-style', content: 'default' },
      { name: 'apple-mobile-web-app-title', content: '農薬ノート' },
    ],
    links: [
      { rel: 'stylesheet', href: appCss },
      { rel: 'apple-touch-icon', href: '/logo192.png' },
      { rel: 'manifest', href: '/manifest.webmanifest' },
    ],
  }),
  shellComponent: RootDocument,
})

const AppLayout = ({ children }: { children: React.ReactNode }) => {
  const location = useLocation()
  const isAuthPath = location.pathname === '/login'

  if (isAuthPath) {
    return <>{children}</>
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1 px-4 pb-20 pt-4">{children}</main>
      <BottomNav />
    </div>
  )
}

function RootDocument({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />
        <HeadContent />
      </head>
      <body
        className="font-sans antialiased [overflow-wrap:anywhere]"
        suppressHydrationWarning
      >
        <TanStackQueryProvider>
          <Providers>
            <AppLayout>{children}</AppLayout>
          </Providers>
          {import.meta.env.DEV && (
            <TanStackDevtools
              config={{ position: 'bottom-right' }}
              plugins={[
                { name: 'Tanstack Router', render: <TanStackRouterDevtoolsPanel /> },
                TanStackQueryDevtools,
              ]}
            />
          )}
        </TanStackQueryProvider>
        <Toaster />
        <Scripts />
      </body>
    </html>
  )
}
