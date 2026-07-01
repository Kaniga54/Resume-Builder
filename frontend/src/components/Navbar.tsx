'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { api, User } from '@/lib/api';
import { FileText, LogOut, User as UserIcon, LayoutDashboard, Sparkles } from 'lucide-react';

export default function Navbar() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    setUser(api.getCurrentUser());
  }, []);

  const handleLogout = () => {
    api.logout();
    setUser(null);
    router.push('/');
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/5 bg-[#080C10]/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-2.5">
          <svg className="h-8 w-8 shrink-0" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="6" y="4" width="20" height="24" rx="4" fill="url(#logo_grad)" />
            <line x1="16" y1="12" x2="22" y2="12" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
            <line x1="16" y1="16" x2="22" y2="16" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
            <line x1="16" y1="20" x2="20" y2="20" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
            <circle cx="11" cy="18" r="5.5" fill="#10B981" stroke="#080C10" strokeWidth="1.5" />
            <path d="M9 18L10.5 19.5L13.5 16.5" stroke="white" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
            <defs>
              <linearGradient id="logo_grad" x1="6" y1="4" x2="26" y2="28" gradientUnits="userSpaceOnUse">
                <stop stopColor="#0284C7" />
                <stop stopColor="#1E3A8A" />
              </linearGradient>
            </defs>
          </svg>
          <span className="text-xl font-bold tracking-wider text-white">
            Vita<span className="text-emerald-500">CV</span>
          </span>
        </Link>

        <nav className="flex items-center gap-4">
          {user ? (
            <>
              <Link
                href="/dashboard"
                className="flex items-center gap-1.5 rounded-lg px-3.5 py-2 text-sm font-medium text-gray-300 transition-colors hover:bg-white/5 hover:text-white"
              >
                <LayoutDashboard className="h-4.5 w-4.5" />
                <span>Dashboard</span>
              </Link>
              <Link
                href="/builder"
                className="flex items-center gap-1.5 rounded-lg px-3.5 py-2 text-sm font-medium text-gray-300 transition-colors hover:bg-white/5 hover:text-white"
              >
                <Sparkles className="h-4.5 w-4.5 text-emerald-400" />
                <span>Resume Builder</span>
              </Link>
              <Link
                href="/analyze"
                className="flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-emerald-500 to-cyan-500 px-4 py-2 text-sm font-medium text-white shadow-md shadow-emerald-500/10 transition-all hover:opacity-95 hover:shadow-emerald-500/20"
              >
                <FileText className="h-4.5 w-4.5" />
                <span>Scan Resume</span>
              </Link>

              <div className="relative ml-2 flex items-center gap-2 rounded-full bg-white/5 py-1.5 pl-3 pr-3.5 border border-white/5">
                <UserIcon className="h-4 w-4 text-emerald-400" />
                <span className="text-xs font-semibold text-gray-200">{user.name}</span>
                <button
                  onClick={handleLogout}
                  title="Logout"
                  className="ml-2 rounded-md p-1 text-gray-400 transition-colors hover:bg-white/5 hover:text-white"
                >
                  <LogOut className="h-4 w-4" />
                </button>
              </div>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="rounded-lg px-3.5 py-2 text-sm font-medium text-gray-300 transition-colors hover:text-white"
              >
                Sign In
              </Link>
              <Link
                href="/register"
                className="rounded-lg bg-emerald-500 px-4 py-2 text-sm font-medium text-white shadow-md shadow-emerald-500/10 transition-all hover:bg-emerald-600 hover:shadow-emerald-500/20"
              >
                Get Started
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
