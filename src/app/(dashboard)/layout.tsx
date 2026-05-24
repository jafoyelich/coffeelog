'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Coffee, Flame, ClipboardList, LayoutDashboard, BarChart2, Sparkles } from 'lucide-react';

interface NavItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
}

const navItems: NavItem[] = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard },
  { name: 'Cafés', href: '/coffees', icon: Coffee },
  { name: 'Métodos', href: '/methods', icon: Flame },
  { name: 'Extracciones', href: '/extractions', icon: ClipboardList },
  { name: 'Estadísticas', href: '/statistics', icon: BarChart2 },
  { name: 'Asistente IA', href: '/assistant', icon: Sparkles },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-[#0d0b0a] text-[#f7f5f3]">
      {/* Sidebar for Desktop */}
      <aside className="fixed inset-y-0 left-0 z-20 hidden w-64 border-r border-[#261f1c] bg-[#14100e] md:flex md:flex-col">
        <div className="flex h-16 items-center gap-2 border-b border-[#261f1c] px-6">
          <Coffee className="h-6 w-6 text-[#d4a373]" />
          <span className="text-xl font-bold tracking-tight text-[#f7f5f3]">
            Coffee<span className="text-[#d4a373]">Log</span>
          </span>
        </div>

        <nav className="flex-1 space-y-1 px-4 py-6">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`group flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? 'bg-[#d4a373] text-[#14100e]'
                    : 'text-[#a69c97] hover:bg-[#261f1c] hover:text-[#f7f5f3]'
                }`}
              >
                <Icon
                  className={`h-5 w-5 transition-transform duration-200 group-hover:scale-105 ${
                    isActive ? 'text-[#14100e]' : 'text-[#a69c97] group-hover:text-[#d4a373]'
                  }`}
                />
                {item.name}
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-[#261f1c] p-4 text-center">
          <p className="text-xs text-[#5c5450]">CoffeeLog v0.1.0</p>
        </div>
      </aside>

      {/* Bottom Nav for Mobile */}
      <nav className="fixed bottom-0 left-0 right-0 z-20 border-t border-[#261f1c] bg-[#14100e]/95 backdrop-blur-md md:hidden">
        <div className="flex h-16 items-center justify-around px-2">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex flex-col items-center gap-1 px-3 py-1.5 transition-colors duration-200 ${
                  isActive ? 'text-[#d4a373]' : 'text-[#a69c97] hover:text-[#f7f5f3]'
                }`}
              >
                <Icon className="h-5 w-5" />
                <span className="text-[10px] font-medium">{item.name}</span>
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Main Content Area */}
      <div className="flex flex-col md:pl-64">
        {/* Mobile Header */}
        <header className="flex h-16 items-center justify-between border-b border-[#261f1c] bg-[#14100e] px-4 md:hidden">
          <div className="flex items-center gap-2">
            <Coffee className="h-5 w-5 text-[#d4a373]" />
            <span className="text-lg font-bold text-[#f7f5f3]">
              Coffee<span className="text-[#d4a373]">Log</span>
            </span>
          </div>
        </header>

        {/* Content Container */}
        <main className="flex-1 p-4 pb-24 md:p-8 md:pb-8">{children}</main>
      </div>
    </div>
  );
}
