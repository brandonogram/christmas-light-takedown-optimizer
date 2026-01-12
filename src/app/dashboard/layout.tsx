'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  ClipboardList,
  Route,
  Users,
  Settings,
  Navigation,
  Sparkles,
  LogOut
} from 'lucide-react'

const navItems = [
  { href: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/dashboard/jobs', icon: ClipboardList, label: 'Jobs' },
  { href: '/dashboard/routes', icon: Route, label: 'Routes' },
  { href: '/dashboard/my-route', icon: Navigation, label: 'My Route' },
  { href: '/dashboard/crews', icon: Users, label: 'Crews' },
  { href: '/dashboard/settings', icon: Settings, label: 'Settings' },
]

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()

  return (
    <div className="min-h-screen bg-zinc-50">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex flex-col fixed left-0 top-0 bottom-0 w-64 bg-white border-r border-zinc-200">
        {/* Logo */}
        <div className="flex items-center gap-2 px-6 py-4 border-b border-zinc-200">
          <div className="w-8 h-8 rounded-lg gradient-festive flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <span className="font-bold text-lg text-zinc-900">TakedownPro</span>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href))
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition ${
                  isActive
                    ? 'bg-zinc-900 text-white'
                    : 'text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900'
                }`}
              >
                <item.icon className="w-5 h-5" />
                {item.label}
              </Link>
            )
          })}
        </nav>

        {/* Bottom section */}
        <div className="px-3 py-4 border-t border-zinc-200">
          <button className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900 transition w-full">
            <LogOut className="w-5 h-5" />
            Disconnect
          </button>
        </div>
      </aside>

      {/* Mobile Header */}
      <header className="lg:hidden fixed top-0 left-0 right-0 z-40 bg-white border-b border-zinc-200">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg gradient-festive flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-lg text-zinc-900">TakedownPro</span>
          </div>
        </div>
      </header>

      {/* Mobile Bottom Navigation */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-zinc-200 safe-area-inset-bottom">
        <div className="flex items-center justify-around py-2">
          {navItems.slice(0, 5).map((item) => {
            const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href))
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex flex-col items-center gap-1 px-3 py-2 rounded-lg min-w-[64px] ${
                  isActive ? 'text-red-600' : 'text-zinc-500'
                }`}
              >
                <item.icon className="w-5 h-5" />
                <span className="text-xs font-medium">{item.label}</span>
              </Link>
            )
          })}
        </div>
      </nav>

      {/* Main Content */}
      <main className="lg:ml-64 pt-16 lg:pt-0 pb-24 lg:pb-0 min-h-screen">
        {children}
      </main>
    </div>
  )
}
