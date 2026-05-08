'use client';

import { useEffect, useState } from 'react';
import { Plus, Pencil, Trash2, X, Check, Package } from 'lucide-react';

interface Articulo {
  id: number; codigo: string; nombre: string; descripcion: string;
  precio_base: number; unidad: string; categoria: string;
}

const UNIDADES = ['unidad', 'm²', 'm lineal', 'hora', 'global', 'proyecto', 'kg', 'm³'];
const CATEGORIAS = ['Material', 'Servicio', 'Material+Instalación', 'Mano de obra', 'Consultoría', 'Otro'];
const empty = { codigo: '', nombre: '', descripcion: '', precio_base: 0, unidad: 'global', categoria: 'Material' };
const inputCls = 'mt-1.5 w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:border-teal-500 transition-all bg-white';
const labelCls = 'block text-[11px] font-semibold text-slate-500 uppercase tracking-wider';
const CAT_COLORS: Record<string, { bg: string; text: string }> = {
  'Material': { bg: '#eff6ff', text: '#3b82f6' },
  'Servicio': { bg: '#f0fdf4', text: '#22c55e' },
  'Material+Instalación': { bg: '#fef3c7', text: '#d97706' },
  'Mano de obra': { bg: '#fdf4ff', text: '#a855f7' },
  'Consultoría': { bg: 'rgba(13,148,136,0.08)', text: '#0d9488' },
  'Otro': { bg: '#f8fafc', text: '#64748b' },
};

export default function ArticulosPage() {
  const [articulos, setArticulos] = useState<Articulo[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [form, setForm] = useState({ ...empty });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const load = () => fetch('/api/articulos').then(r => r.json()).then(setArticulos);
  useEffect(() => { load(); }, []);

  const openNew = () => { setForm({ ...empty }); setEditId(null); setShowForm(true); setError(''); };
  const openEdit = (a: Articulo) => {
    setForm({ codigo: a.codigo, nombre: a.nombre, descripcion: a.descripcion, precio_base: a.precio_base, unidad: a.unidad, categoria: a.categoria });
    setEditId(a.id); setShowForm(true); setError('');
  };
  const save = async () => {
    if (!form.codigo || !form.nombre) { setError('Código y nombre son requeridos'); return; }
    setLoading(true);
    const res = await fetch(editId ? `/api/articulos/${editId}` : '/api/articulos', {
      method: editId ? 'PUT' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });
    setLoading(false);
    if (res.ok) { setShowForm(false); load(); }
    else { const d = await res.json(); setError(d.error || 'Error al guardar'); }
  };
  const remove = async (id: number) => {
    if (!confirm('¿Eliminar este artículo?')) return;
    await fetch(`/api/articulos/${id}`, { method: 'DELETE' });
    load();
  };
  const cs = (cat: string) => CAT_COLORS[cat] || CAT_COLORS['Otro'];

  return (
    <div className="p-5 sm:p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-widest text-slate-400 mb-1">Inventario</p>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900">Catálogo de Artículos</h1>
        </div>
        <button onClick={openNew}
          className="flex items-center gap-2 text-white px-4 py-2.5 rounded-xl text-sm font-semibold transition-all hover:shadow-md active:scale-95"
          style={{ background: 'linear-gradient(135deg, #0d9488, #0ea5e9)' }}>
          <Plus size={15} /><span className="hidden sm:inline">Nuevo</span> Artículo
        </button>
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg">
            <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100">
              <h2 className="font-bold text-lg text-slate-900">{editId ? 'Editar Artículo' : 'Nuevo Artículo'}</h2>
              <button onClick={() => setShowForm(false)} className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 transition-colors"><X size={18} /></button>
            </div>
            <div className="p-6 space-y-4">
              {error && <div className="text-red-600 text-sm bg-red-50 border border-red-100 px-4 py-2.5 rounded-xl">{error}</div>}
              <div className="grid grid-cols-2 gap-4">
                <div><label className={labelCls}>Código *</label>
                  <input className={inputCls} value={form.codigo} onChange={e => setForm(f => ({ ...f, codigo: e.target.value.toUpperCase() }))} placeholder="SOUNDDOOR" /></div>
                <div><label className={labelCls}>Nombre *</label>
                  <input className={inputCls} value={form.nombre} onChange={e => setForm(f => ({ ...f, nombre: e.target.value }))} placeholder="SoundDoor Panel" /></div>
              </div>
              <div><label className={labelCls}>Descripción</label>
                <textarea className={`${inputCls} resize-none`} rows={3} value={form.descripcion} onChange={e => setForm(f => ({ ...f, descripcion: e.target.value }))} placeholder="Descripción técnica..." /></div>
              <div className="grid grid-cols-3 gap-4">
                <div><label className={labelCls}>Precio ($)</label>
                  <input type="number" step="0.01" className={inputCls} value={form.precio_base} onChange={e => setForm(f => ({ ...f, precio_base: parseFloat(e.target.value) || 0 }))} /></div>
                <div><label className={labelCls}>Unidad</label>
                  <select className={inputCls} value={form.unidad} onChange={e => setForm(f => ({ ...f, unidad: e.target.value }))}>
                    {UNIDADES.map(u => <option key={u}>{u}</option>)}</select></div>
                <div><label className={labelCls}>Categoría</label>
                  <select className={inputCls} value={form.categoria} onChange={e => setForm(f => ({ ...f, categoria: e.target.value }))}>
                    {CATEGORIAS.map(c => <option key={c}>{c}</option>)}</select></div>
              </div>
            </div>
            <div className="px-6 py-4 border-t border-slate-100 flex justify-end gap-3">
              <button onClick={() => setShowForm(false)} className="px-4 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-xl transition-colors">Cancelar</button>
              <button onClick={save} disabled={loading}
                className="flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white rounded-xl disabled:opacity-50"
                style={{ background: 'linear-gradient(135deg, #0d9488, #0ea5e9)' }}>
                <Check size={15} />{loading ? 'Guardando...' : 'Guardar'}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="sm:hidden space-y-3">
        {articulos.length === 0 && (
          <div className="bg-white rounded-2xl border border-slate-100 py-16 text-center shadow-sm">
            <Package size={28} className="mx-auto mb-3 text-slate-200" />
            <p className="text-slate-500 font-medium">No hay artículos</p>
          </div>
        )}
        {articulos.map(a => (
          <div key={a.id} className="bg-white rounded-2xl border border-slate-100 p-4 shadow-sm">
            <div className="flex items-start justify-between mb-1.5">
              <div>
                <span className="font-mono text-[11px] font-bold tracking-wider" style={{ color: '#0d9488' }}>{a.codigo}</span>
                <div className="font-semibold text-slate-800 text-sm mt-0.5">{a.nombre}</div>
              </div>
              <div className="flex gap-1.5">
                <button onClick={() => openEdit(a)} className="p-2 rounded-xl hover:bg-blue-50 text-blue-500 transition-colors"><Pencil size={14} /></button>
                <button onClick={() => remove(a.id)} className="p-2 rounded-xl hover:bg-red-50 text-red-500 transition-colors"><Trash2 size={14} /></button>
              </div>
            </div>
            {a.descripcion && <p className="text-xs text-slate-400 mb-2.5 line-clamp-2">{a.descripcion}</p>}
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs px-2.5 py-0.5 rounded-full font-semibold border"
                style={{ background: cs(a.categoria).bg, color: cs(a.categoria).text, borderColor: `${cs(a.categoria).text}30` }}>
                {a.categoria}
              </span>
              <span className="font-bold text-slate-800 text-sm tabular-nums">${a.precio_base.toFixed(2)}</span>
              <span className="text-slate-400 text-xs">/ {a.unidad}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="hidden sm:block bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr style={{ borderBottom: '1px solid #F1F5F9' }}>
              {['Código','Nombre','Descripción','Categoría','Precio','Unidad',''].map((h,i) => (
                <th key={i} className={`px-5 py-3.5 text-left text-[11px] font-semibold uppercase tracking-wider text-slate-400 bg-slate-50/80${i===2?' hidden md:table-cell':''}`}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {articulos.length === 0 && (
              <tr><td colSpan={7} className="text-center py-16">
                <Package size={28} className="mx-auto mb-2 text-slate-200" />
                <p className="text-slate-400 text-sm">No hay artículos. Crea el primero.</p>
              </td></tr>
            )}
            {articulos.map((a,i) => (
              <tr key={a.id} className="hover:bg-slate-50/70 transition-colors"
                style={{ borderBottom: i < articulos.length-1 ? '1px solid #F8FAFC' : 'none' }}>
                <td className="px-5 py-3.5 font-mono text-[11px] font-bold tracking-wide" style={{ color: '#0d9488' }}>{a.codigo}</td>
                <td className="px-5 py-3.5 font-semibold text-slate-800">{a.nombre}</td>
                <td className="px-5 py-3.5 text-slate-400 text-sm hidden md:table-cell max-w-xs truncate">{a.descripcion}</td>
                <td className="px-5 py-3.5">
                  <span className="text-xs px-2.5 py-1 rounded-full font-semibold border"
                    style={{ background: cs(a.categoria).bg, color: cs(a.categoria).text, borderColor: `${cs(a.categoria).text}30` }}>
                    {a.categoria}
                  </span>
                </td>
                <td className="px-5 py-3.5 font-bold text-slate-800 tabular-nums">${a.precio_base.toFixed(2)}</td>
                <td className="px-5 py-3.5 text-slate-400 text-sm">{a.unidad}</td>
                <td className="px-5 py-3.5">
                  <div className="flex gap-1.5 justify-end">
                    <button onClick={() => openEdit(a)} className="p-2 rounded-xl text-blue-500 hover:bg-blue-50 transition-colors"><Pencil size={14} /></button>
                    <button onClick={() => remove(a.id)} className="p-2 rounded-xl text-red-400 hover:bg-red-50 transition-colors"><Trash2 size={14} /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
