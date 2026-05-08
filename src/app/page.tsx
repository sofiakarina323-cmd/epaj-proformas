'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { FileText, Package, Users, Plus, ArrowRight, TrendingUp } from 'lucide-react';

export default function Dashboard() {
  const [stats, setStats] = useState({ proformas: 0, articulos: 0, clientes: 0 });

  useEffect(() => {
    fetch('/api/init').then(() => {
      Promise.all([
        fetch('/api/proformas').then(r => r.json()),
        fetch('/api/articulos').then(r => r.json()),
        fetch('/api/clientes').then(r => r.json()),
      ]).then(([p, a, c]) => setStats({ proformas: p.length, articulos: a.length, clientes: c.length }));
    });
  }, []);

  return (
    <div className="p-5 sm:p-8 max-w-4xl">

      {/* Header */}
      <div className="mb-8">
        <p className="text-[11px] font-semibold uppercase tracking-widest mb-1.5" style={{ color: '#0d9488' }}>Panel principal</p>
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 leading-tight">Bienvenido a EPAJ</h1>
        <p className="text-slate-500 text-sm mt-1.5 hidden sm:block">Sistema de gestión de presupuestos · Ingeniería Acústica & Sonido</p>
      </div>

      {/* CTA Nueva Proforma */}
      <Link href="/proformas/nueva"
        className="flex items-center justify-between p-5 sm:p-6 rounded-2xl mb-8 text-white group transition-all hover:shadow-lg hover:shadow-teal-500/20 hover:-translate-y-0.5 active:translate-y-0"
        style={{ background: 'linear-gradient(135deg, #0f766e 0%, #0369a1 60%, #6366f1 100%)' }}>
        <div>
          <div className="font-bold text-lg tracking-tight">Nueva Proforma</div>
          <div className="text-white/70 text-sm mt-0.5">Crea un presupuesto profesional en minutos</div>
        </div>
        <div className="bg-white/15 group-hover:bg-white/25 transition-all p-3 rounded-xl shrink-0">
          <Plus size={22} />
        </div>
      </Link>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 sm:gap-5 mb-8">
        <StatCard icon={FileText} label="Proformas" value={stats.proformas} href="/proformas"
          color="#0d9488" bg="rgba(13,148,136,0.08)" />
        <StatCard icon={Package} label="Artículos" value={stats.articulos} href="/articulos"
          color="#6366f1" bg="rgba(99,102,241,0.08)" />
        <StatCard icon={Users} label="Clientes" value={stats.clientes} href="/clientes"
          color="#f59e0b" bg="rgba(245,158,11,0.08)" />
      </div>

      {/* Quick links */}
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-widest text-slate-400 mb-3">Accesos rápidos</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {[
            { href: '/proformas', icon: FileText, label: 'Historial de proformas', sub: 'Todas tus cotizaciones', color: '#0d9488' },
            { href: '/articulos', icon: Package, label: 'Catálogo de artículos', sub: 'Productos y servicios', color: '#6366f1' },
            { href: '/clientes', icon: Users, label: 'Base de clientes', sub: 'Gestión de clientes', color: '#f59e0b' },
            { href: '/configuracion', icon: TrendingUp, label: 'Configuración', sub: 'Datos de empresa y plantillas', color: '#64748b' },
          ].map(({ href, icon: Icon, label, sub, color }) => (
            <Link key={href} href={href}
              className="flex items-center gap-3.5 bg-white hover:bg-slate-50 border border-slate-100 hover:border-slate-200 rounded-2xl px-4 py-3.5 group transition-all">
              <div className="p-2 rounded-xl shrink-0 transition-colors" style={{ background: `${color}12` }}>
                <Icon size={16} style={{ color }} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-semibold text-slate-800 truncate">{label}</div>
                <div className="text-xs text-slate-400 mt-0.5">{sub}</div>
              </div>
              <ArrowRight size={14} className="text-slate-300 group-hover:text-slate-500 transition-colors shrink-0" />
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, href, color, bg }: {
  icon: React.ElementType; label: string; value: number;
  href: string; color: string; bg: string;
}) {
  return (
    <Link href={href} className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-100 hover:shadow-md hover:-translate-y-0.5 transition-all group">
      <div className="p-2.5 rounded-xl inline-flex mb-3 sm:mb-4" style={{ background: bg }}>
        <Icon size={16} style={{ color }} />
      </div>
      <div className="text-2xl sm:text-3xl font-bold text-slate-900 mb-0.5 tabular-nums">{value}</div>
      <div className="text-xs sm:text-sm text-slate-500 font-medium">{label}</div>
    </Link>
  );
}
