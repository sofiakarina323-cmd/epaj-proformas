'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Trash2, Search, ChevronDown } from 'lucide-react';

interface Articulo { id: number; codigo: string; nombre: string; descripcion: string; precio_base: number; unidad: string; categoria: string; }
interface Cliente { id: number; codigo: string; nombre: string; direccion: string; ruc: string; telefono: string; }
interface Item { articulo_id?: number; codigo_articulo: string; descripcion: string; cantidad: number; precio_unitario: number; }

const today = () => new Date().toISOString().split('T')[0];
const addDays = (d: string, n: number) => { const dt = new Date(d); dt.setDate(dt.getDate() + n); return dt.toISOString().split('T')[0]; };
const nextNum = () => `H00-ECV${new Date().getFullYear()}-${Date.now().toString().slice(-3)}`;

export default function NuevaProformaPage() {
  const router = useRouter();
  const [articulos, setArticulos] = useState<Articulo[]>([]);
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [config, setConfig] = useState<Record<string, string>>({});

  // Inicializados a vacío para evitar hydration mismatch — se setean en useEffect
  const [numero, setNumero] = useState('');
  const [fecha, setFecha] = useState('');
  const [validoHasta, setValidoHasta] = useState('');
  const [clienteId, setClienteId] = useState('');
  const [comercial, setComercial] = useState('');
  const [descuento, setDescuento] = useState(0);
  const [formaPago, setFormaPago] = useState('');
  const [tiempoEntrega, setTiempoEntrega] = useState('20-25 DÍAS LABORABLES');
  const [garantia, setGarantia] = useState('12 meses');
  const [nota, setNota] = useState('');
  const [items, setItems] = useState<Item[]>([]);

  const [busqueda, setBusqueda] = useState('');
  const [showCatalogo, setShowCatalogo] = useState(false);
  const [saving, setSaving] = useState(false);

  // Setea valores dinámicos solo en cliente
  useEffect(() => {
    setNumero(nextNum());
    setFecha(today());
    setValidoHasta(addDays(today(), 30));
  }, []);

  useEffect(() => {
    fetch('/api/articulos').then(r => r.json()).then(setArticulos);
    fetch('/api/clientes').then(r => r.json()).then(setClientes);
    fetch('/api/config').then(r => r.json()).then((c: Record<string, string>) => {
      setConfig(c);
      setFormaPago(c.forma_pago_opciones || '');
      setTiempoEntrega(c.tiempo_entrega_default || '20-25 DÍAS LABORABLES');
      setGarantia(c.garantia_default || '12 meses');
    });
  }, []);

  const articulosFiltrados = articulos.filter(a =>
    !busqueda || a.codigo.toLowerCase().includes(busqueda.toLowerCase()) || a.nombre.toLowerCase().includes(busqueda.toLowerCase())
  );

  const agregarArticulo = (a: Articulo) => {
    setItems(prev => [...prev, { articulo_id: a.id, codigo_articulo: a.codigo, descripcion: a.descripcion || a.nombre, cantidad: 1, precio_unitario: a.precio_base }]);
    setShowCatalogo(false);
    setBusqueda('');
  };

  const agregarItemVacio = () => {
    setItems(prev => [...prev, { codigo_articulo: '', descripcion: '', cantidad: 1, precio_unitario: 0 }]);
  };

  const updateItem = (idx: number, field: keyof Item, value: string | number) => {
    setItems(prev => prev.map((it, i) => i === idx ? { ...it, [field]: value } : it));
  };

  const removeItem = (idx: number) => setItems(prev => prev.filter((_, i) => i !== idx));

  const subtotal = items.reduce((s, it) => s + it.cantidad * it.precio_unitario, 0);
  const total = subtotal - descuento;

  const guardar = async (estado: 'borrador' | 'final') => {
    setSaving(true);
    const res = await fetch('/api/proformas', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ numero, fecha, valido_hasta: validoHasta, cliente_id: clienteId || null, comercial, descuento, forma_pago: formaPago, tiempo_entrega: tiempoEntrega, garantia, nota, estado, items }),
    });
    setSaving(false);
    if (res.ok) {
      const { id } = await res.json();
      router.push(`/proformas/${id}`);
    }
  };

  const cliente = clientes.find(c => String(c.id) === String(clienteId));

  return (
    <div className="p-4 sm:p-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-5 sm:mb-6">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-800">Nueva Proforma</h1>
          <p className="text-slate-400 text-xs sm:text-sm font-mono">{numero}</p>
        </div>
        <div className="flex gap-2 sm:gap-3">
          <button onClick={() => guardar('borrador')} disabled={saving} className="hidden sm:block px-4 py-2 text-sm border border-slate-300 rounded-xl hover:bg-slate-50 text-slate-700 font-semibold">
            Borrador
          </button>
          <button onClick={() => guardar('final')} disabled={saving} className="px-3 sm:px-4 py-2 text-sm bg-[#0d9488] text-white rounded-xl font-semibold hover:bg-[#0f766e] disabled:opacity-50">
            {saving ? 'Guardando...' : 'Generar →'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mb-4 sm:mb-6">
        {/* Datos generales */}
        <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm space-y-4">
          <h2 className="font-bold text-slate-700 text-sm uppercase tracking-wide">Datos Generales</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Número</label>
              <input className="mt-1 w-full border rounded-lg px-3 py-2 text-sm" value={numero} onChange={e => setNumero(e.target.value)} />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Fecha</label>
              <input type="date" className="mt-1 w-full border rounded-lg px-3 py-2 text-sm" value={fecha} onChange={e => setFecha(e.target.value)} />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Válido hasta</label>
              <input type="date" className="mt-1 w-full border rounded-lg px-3 py-2 text-sm" value={validoHasta} onChange={e => setValidoHasta(e.target.value)} />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Comercial</label>
              <input className="mt-1 w-full border rounded-lg px-3 py-2 text-sm" value={comercial} onChange={e => setComercial(e.target.value)} placeholder="Nombre del comercial" />
            </div>
          </div>
        </div>

        {/* Cliente */}
        <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm space-y-4">
          <h2 className="font-bold text-slate-700 text-sm uppercase tracking-wide">Cliente</h2>
          <div>
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Seleccionar cliente</label>
            <select className="mt-1 w-full border rounded-lg px-3 py-2 text-sm" value={clienteId} onChange={e => setClienteId(e.target.value)}>
              <option value="">— Selecciona cliente —</option>
              {clientes.map(c => <option key={c.id} value={c.id}>{c.codigo} · {c.nombre}</option>)}
            </select>
          </div>
          {cliente && (
            <div className="bg-purple-50 rounded-xl px-4 py-3 text-sm space-y-1">
              <div className="font-semibold text-purple-900">{cliente.nombre}</div>
              {cliente.ruc && <div className="text-purple-700">RUC: {cliente.ruc}</div>}
              {cliente.direccion && <div className="text-purple-700">{cliente.direccion}</div>}
              {cliente.telefono && <div className="text-purple-700">{cliente.telefono}</div>}
            </div>
          )}
        </div>
      </div>

      {/* Ítems */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm mb-4 sm:mb-6">
        <div className="flex items-center justify-between px-4 sm:px-6 py-3 sm:py-4 border-b">
          <h2 className="font-bold text-slate-700 text-sm uppercase tracking-wide">Artículos</h2>
          <div className="flex gap-2">
            <button onClick={() => setShowCatalogo(s => !s)} className="flex items-center gap-1.5 text-sm bg-teal-50 hover:bg-teal-100 text-teal-700 px-3 py-1.5 rounded-xl font-semibold transition-colors">
              <Search size={14} /> <span className="hidden sm:inline">Catálogo</span>
            </button>
            <button onClick={agregarItemVacio} className="flex items-center gap-1.5 text-sm border border-slate-300 hover:bg-slate-50 text-slate-600 px-3 py-1.5 rounded-xl font-semibold">
              <Plus size={14} /> <span className="hidden sm:inline">Libre</span>
            </button>
          </div>
        </div>

        {showCatalogo && (
          <div className="px-4 sm:px-6 py-4 bg-teal-50/50 border-b">
            <div className="relative mb-3">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input autoFocus className="w-full border rounded-xl pl-9 pr-3 py-2 text-sm bg-white" placeholder="Buscar por código o nombre..." value={busqueda} onChange={e => setBusqueda(e.target.value)} />
            </div>
            <div className="max-h-52 overflow-y-auto space-y-1">
              {articulosFiltrados.map(a => (
                <button key={a.id} onClick={() => agregarArticulo(a)} className="w-full text-left px-3 py-2.5 rounded-xl hover:bg-white text-sm flex items-center justify-between transition-colors">
                  <div className="min-w-0 mr-2">
                    <span className="font-mono text-xs font-bold text-teal-600">{a.codigo}</span>
                    <span className="ml-2 text-slate-700 truncate">{a.nombre}</span>
                  </div>
                  <span className="font-semibold text-slate-700 shrink-0">${a.precio_base.toFixed(2)}</span>
                </button>
              ))}
              {articulosFiltrados.length === 0 && <p className="text-slate-400 text-sm text-center py-4">Sin resultados</p>}
            </div>
          </div>
        )}

        {/* Cards de ítems en móvil */}
        <div className="sm:hidden divide-y divide-slate-100">
          {items.length === 0 && <p className="text-center py-10 text-slate-400 text-sm">Agrega artículos del catálogo</p>}
          {items.map((it, idx) => (
            <div key={idx} className="p-4 space-y-3">
              <div className="flex items-center gap-2">
                <input className="flex-1 border rounded-xl px-3 py-2 text-xs font-mono font-bold text-teal-600 uppercase" value={it.codigo_articulo} onChange={e => updateItem(idx, 'codigo_articulo', e.target.value.toUpperCase())} placeholder="CÓDIGO" />
                <button onClick={() => removeItem(idx)} className="p-2 bg-red-50 text-red-500 rounded-xl"><Trash2 size={14} /></button>
              </div>
              <textarea className="w-full border rounded-xl px-3 py-2 text-sm resize-none" rows={2} value={it.descripcion} onChange={e => updateItem(idx, 'descripcion', e.target.value)} placeholder="Descripción..." />
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs text-slate-400 mb-1 block">Cantidad</label>
                  <input type="number" step="0.01" className="w-full border rounded-xl px-3 py-2 text-sm text-center" value={it.cantidad} onChange={e => updateItem(idx, 'cantidad', parseFloat(e.target.value) || 0)} />
                </div>
                <div>
                  <label className="text-xs text-slate-400 mb-1 block">Precio unit. $</label>
                  <input type="number" step="0.01" className="w-full border rounded-xl px-3 py-2 text-sm text-right" value={it.precio_unitario} onChange={e => updateItem(idx, 'precio_unitario', parseFloat(e.target.value) || 0)} />
                </div>
              </div>
              <div className="text-right font-bold text-teal-700">${(it.cantidad * it.precio_unitario).toFixed(2)}</div>
            </div>
          ))}
        </div>

        {/* Tabla en desktop */}
        <div className="hidden sm:block overflow-x-auto">
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
              {items.length === 0 && (
                <tr><td colSpan={6} className="text-center py-10 text-slate-400">Agrega artículos del catálogo o crea ítems libres</td></tr>
              )}
              {items.map((it, idx) => (
                <tr key={idx} className="border-b last:border-0">
                  <td className="px-4 py-2">
                    <input className="w-full border rounded px-2 py-1 text-xs font-mono font-bold text-teal-600 uppercase" value={it.codigo_articulo} onChange={e => updateItem(idx, 'codigo_articulo', e.target.value.toUpperCase())} placeholder="CÓDIGO" />
                  </td>
                  <td className="px-4 py-2">
                    <textarea className="w-full border rounded px-2 py-1 text-sm resize-none" rows={2} value={it.descripcion} onChange={e => updateItem(idx, 'descripcion', e.target.value)} placeholder="Descripción detallada..." />
                  </td>
                  <td className="px-4 py-2">
                    <input type="number" step="0.01" className="w-full border rounded px-2 py-1 text-sm text-center" value={it.cantidad} onChange={e => updateItem(idx, 'cantidad', parseFloat(e.target.value) || 0)} />
                  </td>
                  <td className="px-4 py-2">
                    <input type="number" step="0.01" className="w-full border rounded px-2 py-1 text-sm text-right" value={it.precio_unitario} onChange={e => updateItem(idx, 'precio_unitario', parseFloat(e.target.value) || 0)} />
                  </td>
                  <td className="px-4 py-2 text-right font-semibold text-slate-700">
                    ${(it.cantidad * it.precio_unitario).toFixed(2)}
                  </td>
                  <td className="px-4 py-2">
                    <button onClick={() => removeItem(idx)} className="p-1 hover:bg-red-100 text-red-500 rounded"><Trash2 size={14} /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {items.length > 0 && (
          <div className="px-4 sm:px-6 py-4 border-t bg-slate-50">
            <div className="space-y-2 text-sm sm:max-w-xs sm:ml-auto">
              <div className="flex justify-between">
                <span className="text-slate-500">Total mercancía</span>
                <span className="font-semibold">${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500">Descuento ($)</span>
                <input type="number" step="0.01" className="border rounded-lg px-2 py-1 text-sm w-28 text-right" value={descuento} onChange={e => setDescuento(parseFloat(e.target.value) || 0)} />
              </div>
              <div className="flex justify-between border-t pt-2 font-bold text-base">
                <span>Importe Final</span>
                <span style={{ color: '#0d9488' }}>${total.toFixed(2)}</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Condiciones */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 sm:p-6 space-y-4">
        <h2 className="font-bold text-slate-700 text-sm uppercase tracking-wide">Condiciones</h2>
        <div>
          <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Forma de pago</label>
          <textarea className="mt-1 w-full border rounded-lg px-3 py-2 text-sm resize-none" rows={3} value={formaPago} onChange={e => setFormaPago(e.target.value)} />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Tiempo de entrega</label>
            <input className="mt-1 w-full border rounded-lg px-3 py-2 text-sm" value={tiempoEntrega} onChange={e => setTiempoEntrega(e.target.value)} />
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Garantía</label>
            <input className="mt-1 w-full border rounded-lg px-3 py-2 text-sm" value={garantia} onChange={e => setGarantia(e.target.value)} />
          </div>
        </div>
        <div>
          <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Nota</label>
          <textarea className="mt-1 w-full border rounded-lg px-3 py-2 text-sm resize-none" rows={2} value={nota} onChange={e => setNota(e.target.value)} placeholder="Notas adicionales para el cliente..." />
        </div>
      </div>

      <div className="flex justify-end gap-3 mt-6">
        <button onClick={() => guardar('borrador')} disabled={saving} className="px-6 py-2.5 text-sm border border-slate-300 rounded-lg hover:bg-slate-50 text-slate-700 font-semibold">
          Guardar borrador
        </button>
        <button onClick={() => guardar('final')} disabled={saving} className="px-6 py-2.5 text-sm bg-[#0d9488] text-white rounded-lg font-bold hover:bg-[#0f766e] disabled:opacity-50">
          {saving ? 'Guardando...' : 'Generar Proforma →'}
        </button>
      </div>
    </div>
  );
}
