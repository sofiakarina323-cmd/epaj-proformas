'use client';

import { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import { Trash2, Search, Plus, ArrowLeft } from 'lucide-react';

interface Articulo { id: number; codigo: string; nombre: string; descripcion: string; precio_base: number; unidad: string; }
interface Cliente { id: number; codigo: string; nombre: string; direccion: string; ruc: string; telefono: string; }
interface Item { articulo_id?: number; codigo_articulo: string; descripcion: string; cantidad: number; precio_unitario: number; }

export default function EditarProformaPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [articulos, setArticulos] = useState<Articulo[]>([]);
  const [clientes, setClientes] = useState<Cliente[]>([]);

  const [numero, setNumero] = useState('');
  const [fecha, setFecha] = useState('');
  const [validoHasta, setValidoHasta] = useState('');
  const [clienteId, setClienteId] = useState('');
  const [comercial, setComercial] = useState('');
  const [descuento, setDescuento] = useState(0);
  const [formaPago, setFormaPago] = useState('');
  const [tiempoEntrega, setTiempoEntrega] = useState('');
  const [garantia, setGarantia] = useState('');
  const [nota, setNota] = useState('');
  const [items, setItems] = useState<Item[]>([]);
  const [busqueda, setBusqueda] = useState('');
  const [showCatalogo, setShowCatalogo] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    Promise.all([
      fetch(`/api/proformas/${id}`).then(r => r.json()),
      fetch('/api/articulos').then(r => r.json()),
      fetch('/api/clientes').then(r => r.json()),
    ]).then(([p, a, c]) => {
      setNumero(p.numero); setFecha(p.fecha); setValidoHasta(p.valido_hasta || '');
      setClienteId(String(p.cliente_id || '')); setComercial(p.comercial || '');
      setDescuento(p.descuento || 0); setFormaPago(p.forma_pago || '');
      setTiempoEntrega(p.tiempo_entrega || ''); setGarantia(p.garantia || '');
      setNota(p.nota || ''); setItems(p.items || []);
      setArticulos(a); setClientes(c);
    });
  }, [id]);

  const articulosFiltrados = articulos.filter(a =>
    !busqueda || a.codigo.toLowerCase().includes(busqueda.toLowerCase()) || a.nombre.toLowerCase().includes(busqueda.toLowerCase())
  );

  const agregarArticulo = (a: Articulo) => {
    setItems(prev => [...prev, { articulo_id: a.id, codigo_articulo: a.codigo, descripcion: a.descripcion || a.nombre, cantidad: 1, precio_unitario: a.precio_base }]);
    setShowCatalogo(false); setBusqueda('');
  };

  const updateItem = (idx: number, field: keyof Item, value: string | number) =>
    setItems(prev => prev.map((it, i) => i === idx ? { ...it, [field]: value } : it));

  const removeItem = (idx: number) => setItems(prev => prev.filter((_, i) => i !== idx));

  const subtotal = items.reduce((s, it) => s + it.cantidad * it.precio_unitario, 0);
  const total = subtotal - descuento;

  const guardar = async (estado: string) => {
    setSaving(true);
    await fetch(`/api/proformas/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ numero, fecha, valido_hasta: validoHasta, cliente_id: clienteId || null, comercial, descuento, forma_pago: formaPago, tiempo_entrega: tiempoEntrega, garantia, nota, estado, items }),
    });
    setSaving(false);
    router.push(`/proformas/${id}`);
  };

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <button onClick={() => router.push(`/proformas/${id}`)} className="p-2 hover:bg-slate-100 rounded-lg text-slate-500"><ArrowLeft size={18} /></button>
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Editar Proforma</h1>
            <p className="text-slate-500 text-sm">{numero}</p>
          </div>
        </div>
        <div className="flex gap-3">
          <button onClick={() => guardar('borrador')} disabled={saving} className="px-4 py-2 text-sm border border-slate-300 rounded-lg text-slate-700 font-semibold hover:bg-slate-50">Guardar borrador</button>
          <button onClick={() => guardar('final')} disabled={saving} className="px-4 py-2 text-sm bg-[#0d9488] text-white rounded-lg font-bold hover:bg-[#0f766e] disabled:opacity-50">
            {saving ? 'Guardando...' : 'Guardar y ver →'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm space-y-4">
          <h2 className="font-bold text-slate-700 text-sm uppercase tracking-wide">Datos Generales</h2>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Número</label><input className="mt-1 w-full border rounded-lg px-3 py-2 text-sm" value={numero} onChange={e => setNumero(e.target.value)} /></div>
            <div><label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Fecha</label><input type="date" className="mt-1 w-full border rounded-lg px-3 py-2 text-sm" value={fecha} onChange={e => setFecha(e.target.value)} /></div>
            <div><label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Válido hasta</label><input type="date" className="mt-1 w-full border rounded-lg px-3 py-2 text-sm" value={validoHasta} onChange={e => setValidoHasta(e.target.value)} /></div>
            <div><label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Comercial</label><input className="mt-1 w-full border rounded-lg px-3 py-2 text-sm" value={comercial} onChange={e => setComercial(e.target.value)} /></div>
          </div>
        </div>
        <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm space-y-4">
          <h2 className="font-bold text-slate-700 text-sm uppercase tracking-wide">Cliente</h2>
          <select className="w-full border rounded-lg px-3 py-2 text-sm" value={clienteId} onChange={e => setClienteId(e.target.value)}>
            <option value="">— Sin cliente —</option>
            {clientes.map(c => <option key={c.id} value={c.id}>{c.codigo} · {c.nombre}</option>)}
          </select>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm mb-6">
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <h2 className="font-bold text-slate-700 text-sm uppercase tracking-wide">Artículos / Servicios</h2>
          <div className="flex gap-2">
            <button onClick={() => setShowCatalogo(true)} className="flex items-center gap-2 text-sm bg-purple-100 hover:bg-purple-200 text-purple-700 px-3 py-1.5 rounded-lg font-semibold">
              <Search size={14} /> Catálogo
            </button>
            <button onClick={() => setItems(prev => [...prev, { codigo_articulo: '', descripcion: '', cantidad: 1, precio_unitario: 0 }])} className="flex items-center gap-2 text-sm border border-slate-300 hover:bg-slate-50 text-slate-600 px-3 py-1.5 rounded-lg font-semibold">
              <Plus size={14} /> Ítem libre
            </button>
          </div>
        </div>

        {showCatalogo && (
          <div className="px-6 py-4 bg-purple-50 border-b">
            <input autoFocus className="w-full border rounded-lg px-3 py-2 text-sm mb-3" placeholder="Buscar..." value={busqueda} onChange={e => setBusqueda(e.target.value)} />
            <div className="max-h-48 overflow-y-auto space-y-1">
              {articulosFiltrados.map(a => (
                <button key={a.id} onClick={() => agregarArticulo(a)} className="w-full text-left px-3 py-2 rounded-lg hover:bg-white text-sm flex justify-between">
                  <span><span className="font-mono text-xs font-bold text-purple-700">{a.codigo}</span><span className="ml-2">{a.nombre}</span></span>
                  <span className="font-semibold">${a.precio_base.toFixed(2)}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        <table className="w-full text-sm">
          <thead>
            <tr className="bg-slate-50 border-b text-left">
              <th className="px-4 py-3 font-semibold text-slate-600 w-28">Artículo</th>
              <th className="px-4 py-3 font-semibold text-slate-600">Descripción</th>
              <th className="px-4 py-3 font-semibold text-slate-600 w-24 text-center">Cant.</th>
              <th className="px-4 py-3 font-semibold text-slate-600 w-32 text-right">Precio Unit.</th>
              <th className="px-4 py-3 font-semibold text-slate-600 w-32 text-right">Subtotal</th>
              <th className="px-4 py-3 w-10"></th>
            </tr>
          </thead>
          <tbody>
            {items.length === 0 && <tr><td colSpan={6} className="text-center py-10 text-slate-400">Sin artículos</td></tr>}
            {items.map((it, idx) => (
              <tr key={idx} className="border-b last:border-0">
                <td className="px-4 py-2"><input className="w-full border rounded px-2 py-1 text-xs font-mono font-bold text-purple-700 uppercase" value={it.codigo_articulo} onChange={e => updateItem(idx, 'codigo_articulo', e.target.value.toUpperCase())} /></td>
                <td className="px-4 py-2"><textarea className="w-full border rounded px-2 py-1 text-sm resize-none" rows={2} value={it.descripcion} onChange={e => updateItem(idx, 'descripcion', e.target.value)} /></td>
                <td className="px-4 py-2"><input type="number" step="0.01" className="w-full border rounded px-2 py-1 text-sm text-center" value={it.cantidad} onChange={e => updateItem(idx, 'cantidad', parseFloat(e.target.value) || 0)} /></td>
                <td className="px-4 py-2"><input type="number" step="0.01" className="w-full border rounded px-2 py-1 text-sm text-right" value={it.precio_unitario} onChange={e => updateItem(idx, 'precio_unitario', parseFloat(e.target.value) || 0)} /></td>
                <td className="px-4 py-2 text-right font-semibold">${(it.cantidad * it.precio_unitario).toFixed(2)}</td>
                <td className="px-4 py-2"><button onClick={() => removeItem(idx)} className="p-1 hover:bg-red-100 text-red-500 rounded"><Trash2 size={14} /></button></td>
              </tr>
            ))}
          </tbody>
        </table>

        {items.length > 0 && (
          <div className="px-6 py-4 border-t bg-slate-50 flex justify-end">
            <div className="w-72 space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-slate-600">Total mercancía</span><span className="font-semibold">${subtotal.toFixed(2)}</span></div>
              <div className="flex justify-between items-center"><span className="text-slate-600">Descuento ($)</span><input type="number" step="0.01" className="border rounded px-2 py-1 text-sm w-28 text-right" value={descuento} onChange={e => setDescuento(parseFloat(e.target.value) || 0)} /></div>
              <div className="flex justify-between border-t pt-2 font-bold text-base"><span>Importe Final</span><span className="text-purple-700">${total.toFixed(2)}</span></div>
            </div>
          </div>
        )}
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 space-y-4">
        <h2 className="font-bold text-slate-700 text-sm uppercase tracking-wide">Condiciones</h2>
        <div><label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Forma de pago</label><textarea className="mt-1 w-full border rounded-lg px-3 py-2 text-sm resize-none" rows={3} value={formaPago} onChange={e => setFormaPago(e.target.value)} /></div>
        <div className="grid grid-cols-2 gap-4">
          <div><label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Tiempo de entrega</label><input className="mt-1 w-full border rounded-lg px-3 py-2 text-sm" value={tiempoEntrega} onChange={e => setTiempoEntrega(e.target.value)} /></div>
          <div><label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Garantía</label><input className="mt-1 w-full border rounded-lg px-3 py-2 text-sm" value={garantia} onChange={e => setGarantia(e.target.value)} /></div>
        </div>
        <div><label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Nota</label><textarea className="mt-1 w-full border rounded-lg px-3 py-2 text-sm resize-none" rows={2} value={nota} onChange={e => setNota(e.target.value)} /></div>
      </div>
    </div>
  );
}
