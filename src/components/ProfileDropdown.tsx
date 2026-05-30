'use client';

import Image from 'next/image';
import Link from 'next/link';
import type { ReactNode } from 'react';
import { useEffect, useRef, useState } from 'react';
import { LayoutDashboard } from 'lucide-react';
import type { Role } from '@prisma/client';

interface ProfileDropdownProps {
  userName: string;
  userEmail?: string;
  avatarUrl?: string;
  userRole?: Role;
  onLogout: () => void;
}

export function ProfileDropdown({ userName, userEmail, avatarUrl, userRole, onLogout }: ProfileDropdownProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const isAdmin = userRole === 'ADMIN';

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    function handleEsc(event: KeyboardEvent) {
      if (event.key === 'Escape') setOpen(false);
    }

    document.addEventListener('keydown', handleEsc);
    return () => document.removeEventListener('keydown', handleEsc);
  }, []);

  const initials = userName
    .split(' ')
    .filter(Boolean)
    .map((word) => word[0])
    .slice(0, 2)
    .join('')
    .toUpperCase() || 'U';

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        aria-label="Menu do perfil"
        aria-expanded={open}
        className="group flex items-center gap-2.5 rounded-xl border border-white/10 bg-white/[0.04] px-3 py-1.5 transition-all duration-200 hover:border-brand/40 hover:bg-white/[0.07]"
      >
        <div className="flex h-8 w-8 items-center justify-center overflow-hidden rounded-full border border-brand/40 bg-brand/20 text-xs font-bold text-brand transition-all duration-200 group-hover:shadow-led-brand">
          {avatarUrl ? (
            <Image src={avatarUrl} alt={userName} width={32} height={32} className="h-full w-full object-cover" />
          ) : (
            initials
          )}
        </div>

        <span className="hidden text-sm font-medium text-white/80 transition-colors group-hover:text-white sm:block">
          {userName.split(' ')[0] || userEmail || 'Perfil'}
        </span>

        <svg
          className={`h-3.5 w-3.5 text-white/30 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2.5}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      <div
        className={`absolute right-0 z-50 mt-2 w-56 origin-top-right transition-all duration-200 ${
          open ? 'translate-y-0 scale-100 opacity-100 pointer-events-auto' : '-translate-y-2 scale-95 opacity-0 pointer-events-none'
        }`}
      >
        <div className="overflow-hidden rounded-2xl border border-white/[0.08] bg-[#111]/90 shadow-[0_20px_60px_rgba(0,0,0,0.6),inset_0_1px_0_rgba(255,255,255,0.06)] backdrop-blur-xl">
          <div className="border-b border-white/[0.06] px-4 py-3">
            <p className="truncate text-sm font-medium text-white">{userName}</p>
            {userEmail ? <p className="mt-0.5 truncate text-xs text-white/40">{userEmail}</p> : null}
          </div>

          <div className="py-1.5">
            <DropdownItem href="/perfil" icon={<UserIcon />} label="Meu Perfil" onClick={() => setOpen(false)} />
            <DropdownItem href="/perfil/seguranca" icon={<SettingsIcon />} label="Configurações" onClick={() => setOpen(false)} />
            {isAdmin ? (
              <DropdownItem
                href="/admin"
                icon={<LayoutDashboard className="h-4 w-4" />}
                label="Painel Admin"
                onClick={() => setOpen(false)}
                premium
              />
            ) : null}
          </div>

          <div className="border-t border-white/[0.06] py-1.5">
            <button
              type="button"
              onClick={() => {
                setOpen(false);
                onLogout();
              }}
              className="flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm text-red-400/80 transition-all duration-150 hover:bg-red-500/[0.08] hover:text-red-400"
            >
              <LogoutIcon />
              Sair
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function DropdownItem({
  href,
  icon,
  label,
  onClick,
  premium,
}: {
  href: string;
  icon: ReactNode;
  label: string;
  onClick: () => void;
  premium?: boolean;
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className={`group flex items-center gap-3 px-4 py-2.5 text-sm transition-all duration-150 ${
        premium
          ? 'text-orange-300/85 hover:bg-orange-500/[0.08] hover:text-orange-300'
          : 'text-white/60 hover:bg-white/[0.05] hover:text-white'
      }`}
    >
      <span className={`transition-colors ${premium ? 'text-orange-400/80' : 'text-white/30 group-hover:text-brand'}`}>
        {icon}
      </span>
      {label}
    </Link>
  );
}

const UserIcon = () => (
  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
  </svg>
);

const SettingsIcon = () => (
  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);

const LogoutIcon = () => (
  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
  </svg>
);
