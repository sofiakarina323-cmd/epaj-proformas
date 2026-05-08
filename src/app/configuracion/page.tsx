'use client';

import { useEffect, useState } from 'react';
import { Check, Building2, CreditCard, Settings2 } from 'lucide-react';

const inputCls = 'mt-1.5 w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:border-teal-500 transition-all bg-white';
const labelCls = 'block text-[11px] font-semibold text-slate-500 uppercase tracking-wider';

export default function ConfiguracionPage() {
  const [config, setConfig] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => { fetch('/api/config').then(r => r.json()).then(setConfig); }, []);
  const set = (k: string, v: string) => setConfig(c => ({ ...c, [k]: v }));
  const save = async () => {
    setSaving(true);
    await fetch('/api/config', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(config) });
    setSaving(false); setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const Field = ({ label, k, multiline = false, placeholder = '' }: { label: string; k: string; multiline?: boolean; placeholder?: string }) => (
    <div>
      <label className={labelCls}>{label}</label>
      {multiline
        ? <textarea className={`${inputCls} resize-none`} rows={4} value={config[k] || ''} onChange={e => set(k, e.target.value)} placeholder={placeholder} />
        : <input className={inputCls} value={config[k] || ''} onChange={e => set(k, e.target.value)} placeholder={placeholder} />
      }
    </div>
  );

  return (
    <div className="p-5 sm:p-8 max-w-3xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-widest text-slate-400 mb-1">Ajustes</p>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900">Configuración</h1>
        </div>
        <button onClick={save} disabled={saving}
          className="flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white rounded-xl transition-all disabled:opacity-60 hover:shadow-md"
          style={{ background: saved ? 'linear-gradient(135deg, #22c55e, #16a34a)' : 'linear-gradient(135deg, #0d9488, #0ea5e9)' }}>
          {saved ? <><Check size={15} /> Guardado</> : saving ? 'Guardando...' : 'Guardar cambios'}
        </button>
      </div>

      <div className="space-y-5">
        <section className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="flex items-center gap-3 px-6 py-4 border-b border-slate-100 bg-slate-50/60">
            <div className="p-2 rounded-xl bg-teal-50"><Building2 size={16} className="text-teal-600" /></div>
            <h2 className="font-bold text-slate-800">Datos de la Empresa</h2>
          </div>
          <div className="p-6 space-y-5">
            <Field label="Nombre de la empresa" k="empresa_nombre" />
            <Field label="Dirección" k="empresa_direccion" />
            <div className="grid grid-cols-2 gap-4">
              <Field label="RUC" k="empresa_ruc" />
              <Field label="Teléfono" k="empresa_telefono" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Email" k="empresa_email" />
              <Field label="Sitio web" k="empresa_web" />
            </div>
          </div>
        </section>

        <section className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="flex items-center gap-3 px-6 py-4 border-b border-slate-100 bg-slate-50/60">
            <div className="p-2 rounded-xl bg-indigo-50"><Settings2 size={16} className="text-indigo-600" /></div>
            <h2 className="font-bold text-slate-800">Condiciones por Defecto</h2>
          </div>
          <div className="p-6 space-y-5">
            <Field label="Forma de pago (opciones)" k="forma_pago_opciones" multiline placeholder="Opción #1: ..." />
            <Field label="Tiempo de entrega" k="tiempo_entrega_default" placeholder="20-25 DÍAS LABORABLES" />
            <div className="grid grid-cols-2 gap-4">
              <Field label="Garantía" k="garantia_default" placeholder="12 meses" />
              <Field label="Validez de la proforma" k="validez_proforma_default" placeholder="1 mes" />
            </div>
          </div>
        </section>

        <section className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="flex items-center gap-3 px-6 py-4 border-b border-slate-100 bg-slate-50/60">
            <div className="p-2 rounded-xl bg-amber-50"><CreditCard size={16} className="text-amber-600" /></div>
            <h2 className="font-bold text-slate-800">Datos Bancarios</h2>
          </div>
          <div className="p-6">
            <Field label="Datos bancarios (aparecen en la proforma)" k="datos_bancarios" multiline placeholder="Beneficiario: ...&#10;Banco Pichincha: #..." />
          </div>
        </section>
      </div>
    </div>
  );
}
