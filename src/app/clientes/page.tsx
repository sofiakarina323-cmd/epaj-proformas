'use client';

import { useEffect, useState } from 'react';
import { Plus, Pencil, Trash2, X, Check, Users } from 'lucide-react';

interface Cliente {
  id: number; codigo: string; nombre: string; direccion: string;
  ruc: string; telefono: string; email: string;
}

const empty = { codigo: '', nombre: '', direccion: '', ruc: '', telefono: '', email: '' };
const inputCls = 'mt-1.5 w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:border-teal-500 transition-all bg-white';
const labelCls = 'block text-[11px] font-semibold text-slate-500 uppercase tracking-wider';

export default function ClientesPage() {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [form, setForm] = useState({ ...empty });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const load = () => fetch('/api/clientes').then(r => r.json()).then(setClientes);
  useEffect(() => { load(); }, []);

  const openNew = () => { setForm({ ...empty }); setEditId(null); setShowForm(true); setError(''); };
  const openEdit = (c: Cliente) => { setForm({ codigo: c.codigo, nombre: c.nombre, direccion: c.direccion, ruc: c.ruc, telefono: c.telefono, email: c.email }); setEditId(c.id); setShowForm(true); setError(''); };
  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));

  const save = async () => {
    if (!form.codigo || !form.nombre) { setError('Código y nombre son requeridos'); return; }
    setLoading(true);
    const res = await fetch(editId ? `/api/clientes/${editId}` : '/api/clientes', {
      method: editId ? 'PUT' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });
    setLoading(false);
    if (res.ok) { setShowForm(false); load(); }
    else { const d = await res.json(); setError(d.error || 'Error al guardar'); }
  };
  const remove = async (id: number) => {
    if (!confirm('¿Eliminar este cliente?')) return;
    await fetch(`/api/clientes/${id}`, { method: 'DELETE' });
    load();
  };

  return (
    <div className="p-5 sm:p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-widest text-slate-400 mb-1">Directorio</p>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900">Clientes</h1>
        </div>
        <button onClick={openNew}
          className="flex items-center gap-2 text-white px-4 py-2.5 rounded-xl text-sm font-semibold transition-all hover:shadow-md active:scale-95"
          style={{ background: 'linear-gradient(135deg, #0d9488, #0ea5e9)' }}>
          <Plus size={15} /><span className="hidden sm:inline">Nuevo</span> Cliente
        </button>
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg">
            <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100">
              <h2 className="font-bold text-lg text-slate-900">{editId ? 'Editar Cliente' : 'Nuevo Cliente'}</h2>
              <button onClick={() => setShowForm(false)} className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 transition-colors"><X size={18} /></button>
            </div>
            <div className="p-6 space-y-4">
              {error && <div className="text-red-600 text-sm bg-red-50 border border-red-100 px-4 py-2.5 rounded-xl">{error}</div>}
              <div className="grid grid-cols-2 gap-4">
                <div><label className={labelCls}>Código *</label>
                  <input className={inputCls} value={form.codigo} onChange={e => set('codigo', e.target.value.toUpperCase())} placeholder="EC101" /></div>
                <div><label className={labelCls}>Nombre *</label>
                  <input className={inputCls} value={form.nombre} onChange={e => set('nombre', e.target.value)} placeholder="Nombre del cliente" /></div>
              </div>
              <div><label className={labelCls}>Dirección</label>
                <input className={inputCls} value={form.direccion} onChange={e => set('direccion', e.target.value)} placeholder="Dirección completa" /></div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className={labelCls}>RUC / Cédula</label>
                  <input className={inputCls} value={form.ruc} onChange={e => set('ruc', e.target.value)} placeholder="1724014863001" /></div>
                <div><label className={labelCls}>Teléfono</label>
                  <input className={inputCls} value={form.telefono} onChange={e => set('telefono', e.target.value)} placeholder="+593 99 000 0000" /></div>
              </div>
              <div><label className={labelCls}>Email</label>
                <input type="email" className={inputCls} value={form.email} onChange={e => set('email', e.target.value)} placeholder="cliente@ejemplo.com" /></div>
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

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr style={{ borderBottom: '1px solid #F1F5F9' }}>
              {['Código','Nombre','RUC','Teléfono','Email',''].map((h,i) => (
                <th key={i} className={`px-5 py-3.5 text-left text-[11px] font-semibold uppercase tracking-wider text-slate-400 bg-slate-50/80${i===2?' hidden md:table-cell':i===3||i===4?' hidden lg:table-cell':''}`}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {clientes.length === 0 && (
              <tr><td colSpan={6} className="text-center py-16">
                <Users size={28} className="mx-auto mb-2 text-slate-200" />
                <p className="text-slate-400 text-sm">No hay clientes. Crea el primero.</p>
              </td></tr>
            )}
            {clientes.map((c,i) => (
              <tr key={c.id} className="hover:bg-slate-50/70 transition-colors"
                style={{ borderBottom: i < clientes.length-1 ? '1px solid #F8FAFC' : 'none' }}>
                <td className="px-5 py-3.5 font-mono text-[11px] font-bold tracking-wide text-indigo-600">{c.codigo}</td>
                <td className="px-5 py-3.5 font-semibold text-slate-800">{c.nombre}</td>
                <td className="px-5 py-3.5 text-slate-500 text-sm hidden md:table-cell">{c.ruc || '—'}</td>
                <td className="px-5 py-3.5 text-slate-500 text-sm hidden lg:table-cell">{c.telefono || '—'}</td>
                <td className="px-5 py-3.5 text-slate-500 text-sm hidden lg:table-cell">{c.email || '—'}</td>
                <td className="px-5 py-3.5">
                  <div className="flex gap-1.5 justify-end">
                    <button onClick={() => openEdit(c)} className="p-2 rounded-xl text-blue-500 hover:bg-blue-50 transition-colors"><Pencil size={14} /></button>
                    <button onClick={() => remove(c.id)} className="p-2 rounded-xl text-red-400 hover:bg-red-50 transition-colors"><Trash2 size={14} /></button>
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
