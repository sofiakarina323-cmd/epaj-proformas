'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { FileText, Package, Users, Settings, LayoutDashboard, Plus, X } from 'lucide-react';
import Image from 'next/image';

const nav = [
  { href: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/proformas/nueva', icon: Plus, label: 'Nueva Proforma', highlight: true },
  { href: '/proformas', icon: FileText, label: 'Proformas' },
  { href: '/articulos', icon: Package, label: 'Catálogo' },
  { href: '/clientes', icon: Users, label: 'Clientes' },
  { href: '/configuracion', icon: Settings, label: 'Configuración' },
];

interface SidebarProps {
  onNavigate?: () => void;
}

export default function Sidebar({ onNavigate }: SidebarProps) {
  const pathname = usePathname();

  return (
    <div className="h-full w-full flex flex-col" style={{ background: '#0F172A' }}>
      {/* Logo */}
      <div className="flex items-center justify-between px-5 py-5" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <div className="flex items-center gap-3 min-w-0">
          <Image src="/logo-dark.png" alt="EPAJ" width={36} height={36} className="rounded-full shrink-0" />
          <div className="min-w-0">
            <div className="text-white font-bold text-sm leading-tight tracking-wide">EPAJ</div>
            <div className="text-[11px] leading-tight truncate font-medium" style={{ color: 'rgba(255,255,255,0.28)' }}>Ing. Acústica & Sonido</div>
          </div>
        </div>
        {onNavigate && (
          <button
            type="button"
            onClick={onNavigate}
            aria-label="Cerrar menú"
            className="lg:hidden p-2 -mr-1 rounded-lg cursor-pointer touch-manipulation transition-colors hover:bg-white/10"
            style={{ color: 'rgba(255,255,255,0.4)' }}
          >
            <X size={18} />
          </button>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 py-4 px-3 space-y-0.5 overflow-y-auto">
        {nav.map(({ href, icon: Icon, label, highlight }) => {
          const active = href === '/' ? pathname === '/' : pathname.startsWith(href);

          if (highlight) return (
            <Link key={href} href={href} onClick={onNavigate}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold text-white my-2 transition-opacity hover:opacity-90 active:opacity-75"
              style={{ background: 'linear-gradient(135deg, #0d9488 0%, #0ea5e9 100%)' }}>
              <Icon size={15} className="shrink-0" />
              {label}
            </Link>
          );

          return (
            <Link key={href} href={href} onClick={onNavigate}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all"
              style={{
                background: active ? 'rgba(20, 184, 166, 0.1)' : 'transparent',
                color: active ? '#2dd4bf' : 'rgba(255,255,255,0.42)',
                fontWeight: active ? 600 : 450,
                borderLeft: active ? '2px solid #14b8a6' : '2px solid transparent',
              }}>
              <Icon size={15} className="shrink-0" />
              {label}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="px-5 py-4" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
        <div className="text-[11px] font-medium" style={{ color: 'rgba(255,255,255,0.18)' }}>v1.0 · Proformas EPAJ</div>
      </div>
    </div>
  );
}
