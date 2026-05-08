'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Plus, Eye, Trash2, FileText } from 'lucide-react';

interface Proforma {
  id: number; numero: string; fecha: string; cliente_nombre: string;
  cliente_codigo: string; comercial: string; estado: string;
}

const fmtDate = (s: string) => {
  if (!s) return '';
  const [y, m, d] = s.split('T')[0].split('-');
  return `${d}/${m}/${y}`;
};

function Badge({ estado }: { estado: string }) {
  const isFinal = estado === 'final';
  return (
    <span className={`inline-flex items-center text-xs px-2.5 py-0.5 rounded-full font-semibold border ${
      isFinal
        ? 'bg-emerald-50 text-emerald-700 border-emerald-100'
        : 'bg-amber-50 text-amber-700 border-amber-100'
    }`}>
      {estado}
    </span>
  );
}

export default function ProformasPage() {
  const [proformas, setProformas] = useState<Proforma[]>([]);

  const load = () => fetch('/api/proformas').then(r => r.json()).then(setProformas);
  useEffect(() => { load(); }, []);

  const remove = async (id: number) => {
    if (!confirm('¿Eliminar esta proforma?')) return;
    await fetch(`/api/proformas/${id}`, { method: 'DELETE' });
    load();
  };

  return (
    <div className="p-5 sm:p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-widest text-slate-400 mb-1">Documentos</p>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900">Proformas</h1>
        </div>
        <Link href="/proformas/nueva"
          className="flex items-center gap-2 text-white px-4 py-2.5 rounded-xl text-sm font-semibold transition-all hover:shadow-md hover:shadow-teal-500/20 active:scale-95"
          style={{ background: 'linear-gradient(135deg, #0d9488, #0ea5e9)' }}>
          <Plus size={15} />
          <span className="hidden sm:inline">Nueva</span> Proforma
        </Link>
      </div>

      {/* Empty state */}
      {proformas.length === 0 && (
        <div className="bg-white rounded-2xl border border-slate-100 py-20 text-center shadow-sm">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-slate-50 mb-4">
            <FileText size={24} className="text-slate-300" />
          </div>
          <p className="text-slate-500 font-medium mb-1">No hay proformas todavía</p>
          <p className="text-slate-400 text-sm mb-4">Crea tu primera proforma para comenzar</p>
          <Link href="/proformas/nueva"
            className="inline-flex items-center gap-1.5 text-sm font-semibold px-4 py-2 rounded-xl text-white transition-all"
            style={{ background: 'linear-gradient(135deg, #0d9488, #0ea5e9)' }}>
            <Plus size={14} /> Nueva Proforma
          </Link>
        </div>
      )}

      {/* Mobile cards */}
      <div className="sm:hidden space-y-3">
        {proformas.map(p => (
          <div key={p.id} className="bg-white rounded-2xl border border-slate-100 p-4 shadow-sm">
            <div className="flex items-start justify-between mb-2">
              <div>
                <div className="font-mono text-[11px] font-bold tracking-wider" style={{ color: '#0d9488' }}>{p.numero}</div>
                <div className="font-semibold text-slate-800 text-sm mt-0.5">
                  {p.cliente_nombre || <span className="italic text-slate-400">Sin cliente</span>}
                </div>
              </div>
              <Badge estado={p.estado} />
            </div>
            <div className="text-xs text-slate-400 mb-3.5">
              {fmtDate(p.fecha)}{p.comercial ? ` · ${p.comercial}` : ''}
            </div>
            <div className="flex gap-2">
              <Link href={`/proformas/${p.id}`}
                className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-sm font-semibold transition-colors"
                style={{ background: 'rgba(13,148,136,0.08)', color: '#0d9488' }}>
                <Eye size={14} /> Ver
              </Link>
              <button onClick={() => remove(p.id)}
                className="flex items-center justify-center gap-1.5 px-4 py-2 bg-red-50 text-red-500 hover:bg-red-100 rounded-xl text-sm font-semibold transition-colors">
                <Trash2 size={14} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Desktop table */}
      {proformas.length > 0 && (
        <div className="hidden sm:block bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr style={{ borderBottom: '1px solid #F1F5F9' }}>
                <th className="px-5 py-3.5 text-left text-[11px] font-semibold uppercase tracking-wider text-slate-400 bg-slate-50/80">Número</th>
                <th className="px-5 py-3.5 text-left text-[11px] font-semibold uppercase tracking-wider text-slate-400 bg-slate-50/80">Fecha</th>
                <th className="px-5 py-3.5 text-left text-[11px] font-semibold uppercase tracking-wider text-slate-400 bg-slate-50/80">Cliente</th>
                <th className="px-5 py-3.5 text-left text-[11px] font-semibold uppercase tracking-wider text-slate-400 bg-slate-50/80">Comercial</th>
                <th className="px-5 py-3.5 text-left text-[11px] font-semibold uppercase tracking-wider text-slate-400 bg-slate-50/80">Estado</th>
                <th className="px-5 py-3.5 bg-slate-50/80"></th>
              </tr>
            </thead>
            <tbody>
              {proformas.map((p, i) => (
                <tr key={p.id} className="hover:bg-slate-50/70 transition-colors" style={{ borderBottom: i < proformas.length - 1 ? '1px solid #F8FAFC' : 'none' }}>
                  <td className="px-5 py-3.5 font-mono text-[11px] font-bold tracking-wide" style={{ color: '#0d9488' }}>{p.numero}</td>
                  <td className="px-5 py-3.5 text-slate-500 text-sm">{fmtDate(p.fecha)}</td>
                  <td className="px-5 py-3.5">
                    <div className="font-medium text-slate-800">{p.cliente_nombre || <span className="text-slate-400 italic text-sm">Sin cliente</span>}</div>
                    {p.cliente_codigo && <div className="text-xs text-slate-400 mt-0.5">{p.cliente_codigo}</div>}
                  </td>
                  <td className="px-5 py-3.5 text-slate-500 text-sm">{p.comercial || '—'}</td>
                  <td className="px-5 py-3.5"><Badge estado={p.estado} /></td>
                  <td className="px-5 py-3.5">
                    <div className="flex gap-1.5 justify-end">
                      <Link href={`/proformas/${p.id}`}
                        className="p-2 rounded-xl transition-colors hover:bg-teal-50"
                        style={{ color: '#0d9488' }}>
                        <Eye size={15} />
                      </Link>
                      <button onClick={() => remove(p.id)}
                        className="p-2 rounded-xl text-red-400 hover:bg-red-50 hover:text-red-600 transition-colors">
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
