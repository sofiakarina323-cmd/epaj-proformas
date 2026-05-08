'use client';

import { useEffect, useState, useRef, use } from 'react';
import { useRouter } from 'next/navigation';
import {
  Printer, ArrowLeft, Pencil, Download, ChevronDown,
  FileImage, FileText, Loader2, Images, Upload, X,
} from 'lucide-react';
import Link from 'next/link';

interface ProformaData {
  id: number; numero: string; fecha: string; valido_hasta: string;
  cliente_nombre: string; cliente_codigo: string; cliente_direccion: string;
  cliente_ruc: string; cliente_telefono: string; comercial: string;
  descuento: number; forma_pago: string; tiempo_entrega: string;
  garantia: string; nota: string; estado: string; items: ProformaItem[];
}
interface ProformaItem { id: number; codigo_articulo: string; descripcion: string; cantidad: number; precio_unitario: number; }
interface ProformaImage { id: number; proforma_id: number; filename: string; url_path: string; caption: string; orden: number; }
interface Config { [key: string]: string; }

const fmt = (n: number) => n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const fmtDate = (s: string) => { if (!s) return ''; const [y, m, d] = s.split('T')[0].split('-'); return `${d}/${m}/${y}`; };

export default function ProformaPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [data, setData] = useState<ProformaData | null>(null);
  const [config, setConfig] = useState<Config>({});
  const [downloading, setDownloading] = useState<'pdf' | 'png' | null>(null);
  const [dropOpen, setDropOpen] = useState(false);
  const [showImagesPage, setShowImagesPage] = useState(false);
  const [proformaImages, setProformaImages] = useState<ProformaImage[]>([]);
  const [uploading, setUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const sheet1Ref = useRef<HTMLDivElement>(null);
  const sheet2Ref = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    Promise.all([
      fetch(`/api/proformas/${id}`).then(r => r.json()),
      fetch('/api/config').then(r => r.json()),
      fetch(`/api/proformas/${id}/images`).then(r => r.json()),
    ]).then(([p, c, imgs]) => {
      setData(p);
      setConfig(c);
      setProformaImages(imgs);
      if (imgs.length > 0) setShowImagesPage(true);
    });
  }, [id]);

  useEffect(() => {
    if (!dropOpen) return;
    const close = () => setDropOpen(false);
    document.addEventListener('click', close);
    return () => document.removeEventListener('click', close);
  }, [dropOpen]);

  const handleFileUpload = async (files: FileList) => {
    if (!files.length) return;
    setUploading(true);
    for (const file of Array.from(files)) {
      const fd = new FormData();
      fd.append('file', file);
      const res = await fetch(`/api/proformas/${id}/images`, { method: 'POST', body: fd });
      const img = await res.json();
      setProformaImages(prev => [
        ...prev,
        { id: img.id, proforma_id: Number(id), filename: img.filename, url_path: img.url_path, caption: img.caption, orden: prev.length },
      ]);
    }
    setUploading(false);
  };

  const handleDeleteImage = async (imgId: number) => {
    await fetch(`/api/proformas/${id}/images/${imgId}`, { method: 'DELETE' });
    setProformaImages(prev => prev.filter(i => i.id !== imgId));
  };

  const handleCaptionChange = (imgId: number, caption: string) => {
    setProformaImages(prev => prev.map(i => i.id === imgId ? { ...i, caption } : i));
  };

  const handleCaptionSave = async (imgId: number, caption: string) => {
    await fetch(`/api/proformas/${id}/images/${imgId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ caption }),
    });
  };

  const handleDownload = async (format: 'png' | 'pdf') => {
    if (!sheet1Ref.current || !data) return;
    setDropOpen(false);
    setDownloading(format);
    try {
      const { toCanvas } = await import('html-to-image');

      const zero = (el: HTMLElement) => {
        el.style.marginLeft = '0'; el.style.marginRight = '0';
        el.style.marginTop = '0'; el.style.marginBottom = '0';
      };
      const restore = (el: HTMLElement) => {
        el.style.marginLeft = ''; el.style.marginRight = '';
        el.style.marginTop = ''; el.style.marginBottom = '';
      };

      const el1 = sheet1Ref.current;
      zero(el1);
      const canvas1 = await toCanvas(el1, { pixelRatio: 2, backgroundColor: '#ffffff' });
      restore(el1);

      let canvas2: HTMLCanvasElement | null = null;
      if (showImagesPage && proformaImages.length > 0 && sheet2Ref.current) {
        const el2 = sheet2Ref.current;
        zero(el2);
        canvas2 = await toCanvas(el2, { pixelRatio: 2, backgroundColor: '#ffffff' });
        restore(el2);
      }

      if (format === 'png') {
        if (canvas2) {
          const gap = 40;
          const combined = document.createElement('canvas');
          combined.width = Math.max(canvas1.width, canvas2.width);
          combined.height = canvas1.height + gap + canvas2.height;
          const ctx = combined.getContext('2d')!;
          ctx.fillStyle = '#f1f5f9';
          ctx.fillRect(0, 0, combined.width, combined.height);
          ctx.drawImage(canvas1, 0, 0);
          ctx.drawImage(canvas2, 0, canvas1.height + gap);
          const link = document.createElement('a');
          link.download = `${data.numero}.png`;
          link.href = combined.toDataURL('image/png');
          link.click();
        } else {
          const link = document.createElement('a');
          link.download = `${data.numero}.png`;
          link.href = canvas1.toDataURL('image/png');
          link.click();
        }
      } else {
        const jsPDF = (await import('jspdf')).default;
        const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
        const pageW = pdf.internal.pageSize.getWidth();
        const pageH = pdf.internal.pageSize.getHeight();

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const addToPdf = (canvas: HTMLCanvasElement, newPage: boolean) => {
          const ratio = pageW / canvas.width;
          const totalH = canvas.height * ratio;
          if (newPage) pdf.addPage();
          if (totalH <= pageH + 3) {
            pdf.addImage(canvas.toDataURL('image/jpeg', 0.95), 'JPEG', 0, 0, pageW, Math.min(totalH, pageH));
          } else {
            const sliceH = Math.floor(pageH / ratio);
            let y = 0; let first = true;
            while (y < canvas.height) {
              const remaining = canvas.height - y;
              if (remaining < 10) break;
              const h = Math.min(sliceH, remaining);
              const sc = document.createElement('canvas');
              sc.width = canvas.width; sc.height = h;
              const ctx = sc.getContext('2d')!;
              ctx.fillStyle = '#ffffff'; ctx.fillRect(0, 0, sc.width, h);
              ctx.drawImage(canvas, 0, -y);
              if (!first) pdf.addPage();
              pdf.addImage(sc.toDataURL('image/jpeg', 0.95), 'JPEG', 0, 0, pageW, h * ratio);
              y += h; first = false;
            }
          }
        };

        addToPdf(canvas1, false);
        if (canvas2) addToPdf(canvas2, true);
        pdf.save(`${data.numero}.pdf`);
      }
    } catch (err) {
      console.error('Error al exportar:', err);
    } finally {
      setDownloading(null);
    }
  };

  if (!data) return <div className="p-8 text-slate-400">Cargando...</div>;

  const subtotal = data.items.reduce((s, it) => s + it.cantidad * it.precio_unitario, 0);
  const total = subtotal - (data.descuento || 0);

  return (
    <div>
      {/* Toolbar */}
      <div className="no-print flex items-center justify-between px-4 sm:px-8 py-3 bg-white border-b shadow-sm sticky top-0 z-20 gap-3">
        <button onClick={() => router.push('/proformas')} className="flex items-center gap-2 text-slate-500 hover:text-slate-800 text-sm transition-colors shrink-0">
          <ArrowLeft size={16} /> <span className="hidden sm:inline">Volver</span>
        </button>

        <div className="flex items-center gap-2 shrink-0 flex-wrap justify-end">
          <span className="text-xs px-2.5 py-1 rounded-full font-semibold hidden sm:inline-flex"
            style={{ background: data.estado === 'final' ? '#dcfce7' : '#fef3c7', color: data.estado === 'final' ? '#15803d' : '#92400e' }}>
            {data.estado}
          </span>

          {/* Toggle segunda hoja */}
          <button
            onClick={() => setShowImagesPage(o => !o)}
            title={showImagesPage ? 'Ocultar segunda hoja' : 'Agregar segunda hoja con imágenes'}
            className={`flex items-center gap-1.5 border px-3 py-2 rounded-xl text-sm font-medium transition-all ${
              showImagesPage
                ? 'bg-teal-50 border-teal-300 text-teal-700'
                : 'border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            <Images size={14} />
            <span className="hidden sm:inline">{showImagesPage ? 'Con imágenes' : 'Agregar imágenes'}</span>
          </button>

          <Link href={`/proformas/${id}/editar`}
            className="flex items-center gap-1.5 border border-slate-200 text-slate-600 hover:bg-slate-50 px-3 py-2 rounded-xl text-sm font-medium transition-colors">
            <Pencil size={14} /> <span className="hidden sm:inline">Editar</span>
          </Link>

          {/* Menú exportar */}
          <div className="relative" onClick={e => e.stopPropagation()}>
            <button
              onClick={() => setDropOpen(o => !o)}
              disabled={!!downloading}
              className="flex items-center gap-1.5 text-white px-3 py-2 rounded-xl text-sm font-semibold transition-all disabled:opacity-60"
              style={{ background: 'linear-gradient(135deg, #7c6fa0, #3b82f6, #0d9488)' }}
            >
              {downloading ? <Loader2 size={14} className="animate-spin" /> : <Download size={14} />}
              <span>{downloading ? 'Generando…' : 'Exportar'}</span>
              {!downloading && <ChevronDown size={13} className={`transition-transform ${dropOpen ? 'rotate-180' : ''}`} />}
            </button>

            {dropOpen && (
              <div className="absolute right-0 top-full mt-1.5 bg-white border border-slate-200 rounded-xl shadow-xl py-1.5 w-52 z-50">
                <div className="px-3 py-1.5 text-[11px] font-semibold text-slate-400 uppercase tracking-widest">Exportar como</div>

                <button onClick={() => { setDropOpen(false); window.print(); }}
                  className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-slate-700 hover:bg-slate-50 transition-colors">
                  <div className="p-1.5 rounded-lg bg-indigo-50 shrink-0"><Printer size={14} className="text-indigo-500" /></div>
                  <div className="text-left">
                    <div className="font-semibold">Imprimir / PDF</div>
                    <div className="text-xs text-slate-400">Diálogo del sistema</div>
                  </div>
                </button>

                <button onClick={() => handleDownload('pdf')}
                  className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-slate-700 hover:bg-slate-50 transition-colors">
                  <div className="p-1.5 rounded-lg bg-red-50 shrink-0"><FileText size={14} className="text-red-500" /></div>
                  <div className="text-left">
                    <div className="font-semibold">PDF</div>
                    <div className="text-xs text-slate-400">{showImagesPage && proformaImages.length > 0 ? '2 páginas con imágenes' : 'Descarga directa'}</div>
                  </div>
                </button>

                <button onClick={() => handleDownload('png')}
                  className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-slate-700 hover:bg-slate-50 transition-colors">
                  <div className="p-1.5 rounded-lg bg-blue-50 shrink-0"><FileImage size={14} className="text-blue-500" /></div>
                  <div className="text-left">
                    <div className="font-semibold">PNG</div>
                    <div className="text-xs text-slate-400">Imagen alta resolución</div>
                  </div>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ─── Hoja 1: Proforma ─── */}
      <div
        ref={sheet1Ref}
        className="bg-white mx-auto my-8 shadow-lg print:shadow-none print:my-0"
        style={{ width: '210mm', minHeight: '297mm', padding: '18mm 18mm 14mm' }}>

        <div className="flex justify-between items-start mb-5">
          <div className="flex items-start gap-4">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo-light.png" alt="EPAJ" width={70} height={70} className="shrink-0" crossOrigin="anonymous" />
            <div>
              <div className="text-base font-bold text-slate-900 leading-tight">{config.empresa_nombre}</div>
              <div className="text-xs text-slate-500 mt-1 leading-relaxed">
                {config.empresa_direccion}<br />
                RUC: {config.empresa_ruc}<br />
                Tel {config.empresa_telefono}<br />
                {config.empresa_email}
              </div>
              <a className="text-xs font-medium" style={{ color: '#0d9488' }}
                href={`https://${config.empresa_web}`} target="_blank">{config.empresa_web}</a>
            </div>
          </div>
          <div className="text-right text-xs text-slate-600 space-y-0.5 mt-1">
            <div><span className="font-semibold text-slate-800">Código cliente</span> {data.cliente_codigo}</div>
            <div><span className="font-semibold text-slate-800">Fecha:</span> {fmtDate(data.fecha)}</div>
            <div><span className="font-semibold text-slate-800">Cliente:</span> {data.cliente_nombre}</div>
            {data.cliente_direccion && <div><span className="font-semibold text-slate-800">Dirección:</span> {data.cliente_direccion}</div>}
            {data.cliente_ruc && <div><span className="font-semibold text-slate-800">RUC:</span> {data.cliente_ruc}</div>}
            {data.cliente_telefono && <div><span className="font-semibold text-slate-800">Teléfono:</span> {data.cliente_telefono}</div>}
          </div>
        </div>

        <div className="h-1 rounded-full mb-4" style={{ background: 'linear-gradient(90deg, #7c6fa0, #3b82f6, #14b8a6)' }} />

        <div className="mb-4">
          <div className="text-xs text-slate-400 uppercase tracking-widest mb-0.5">Presupuesto de venta</div>
          <div className="text-sm font-bold" style={{ color: '#0d9488' }}>{data.numero}</div>
        </div>

        <div className="grid grid-cols-3 gap-3 text-xs text-slate-600 mb-5 bg-slate-50 rounded-xl p-3">
          <div><span className="font-semibold text-slate-700 block mb-0.5">Número de práctica</span>{fmtDate(data.fecha)}</div>
          <div><span className="font-semibold text-slate-700 block mb-0.5">Comercial</span>{data.comercial || '—'}</div>
          <div><span className="font-semibold text-slate-700 block mb-0.5">Válido hasta</span>{fmtDate(data.valido_hasta)}</div>
        </div>

        <table className="w-full text-xs mb-4" style={{ borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: 'linear-gradient(90deg, #1e293b, #334155)', color: 'white' }}>
              <th className="px-3 py-2.5 text-left font-semibold rounded-tl-lg" style={{ width: '16%' }}>ARTÍCULO</th>
              <th className="px-3 py-2.5 text-left font-semibold">DESCRIPCIÓN</th>
              <th className="px-3 py-2.5 text-center font-semibold" style={{ width: '10%' }}>CANT.</th>
              <th className="px-3 py-2.5 text-right font-semibold" style={{ width: '16%' }}>PRECIO UNIT.</th>
              <th className="px-3 py-2.5 text-right font-semibold rounded-tr-lg" style={{ width: '15%' }}>SUBTOTAL</th>
            </tr>
          </thead>
          <tbody>
            {data.items.map((it, idx) => (
              <tr key={it.id} style={{ background: idx % 2 === 0 ? '#f8fafc' : 'white', borderBottom: '1px solid #e2e8f0' }}>
                <td className="px-3 py-2 font-bold align-top" style={{ color: '#0d9488', fontSize: '10px' }}>{it.codigo_articulo}</td>
                <td className="px-3 py-2 text-slate-600 align-top leading-relaxed" style={{ whiteSpace: 'pre-wrap' }}>{it.descripcion}</td>
                <td className="px-3 py-2 text-center text-slate-600 align-top">{it.cantidad}</td>
                <td className="px-3 py-2 text-right text-slate-600 align-top">$ {fmt(it.precio_unitario)}</td>
                <td className="px-3 py-2 text-right font-semibold text-slate-700 align-top">$ {fmt(it.cantidad * it.precio_unitario)}</td>
              </tr>
            ))}
            <tr style={{ borderTop: '2px solid #e2e8f0', background: 'white' }}>
              <td colSpan={3} />
              <td className="px-3 py-2 text-right text-slate-500">Total mercancía</td>
              <td className="px-3 py-2 text-right font-semibold text-slate-700">$ {fmt(subtotal)}</td>
            </tr>
            <tr style={{ background: 'white' }}>
              <td colSpan={3} />
              <td className="px-3 py-1.5 text-right text-slate-400">Descuento</td>
              <td className="px-3 py-1.5 text-right text-slate-500">$ {fmt(data.descuento || 0)}</td>
            </tr>
            <tr style={{ background: '#f0fdfa', borderTop: '1px solid #99f6e4' }}>
              <td colSpan={3} />
              <td className="px-3 py-2.5 text-right font-bold text-slate-800">Importe Final</td>
              <td className="px-3 py-2.5 text-right font-bold text-lg" style={{ color: '#0d9488' }}>$ {fmt(total)}</td>
            </tr>
          </tbody>
        </table>

        <div className="text-xs text-slate-500 mb-4">
          <span className="font-semibold text-slate-700">Modalidad de pago </span>
          <span className="font-bold text-slate-800">NO DEFINIDO</span>
        </div>

        <div className="h-px bg-slate-200 my-5" />

        <div className="text-xs text-slate-600 space-y-3">
          {data.forma_pago && (
            <div className="grid gap-2" style={{ gridTemplateColumns: '130px 1fr' }}>
              <span className="font-semibold text-slate-700">Forma de pago</span>
              <span>{data.forma_pago}</span>
            </div>
          )}
          <div className="grid gap-2" style={{ gridTemplateColumns: '130px 1fr' }}>
            <span className="font-semibold text-slate-700">Tiempo de entrega</span>
            <span className="font-bold uppercase tracking-wide">{data.tiempo_entrega}</span>
          </div>
          <div className="grid gap-2" style={{ gridTemplateColumns: '130px 1fr' }}>
            <span className="font-semibold text-slate-700">Garantía</span>
            <span>{data.garantia}</span>
          </div>
          {config.datos_bancarios && (
            <div className="grid gap-2" style={{ gridTemplateColumns: '130px 1fr' }}>
              <span className="font-semibold text-slate-700">Datos Bancarios</span>
              <span style={{ whiteSpace: 'pre-wrap' }}>{config.datos_bancarios}</span>
            </div>
          )}
          <div className="grid gap-2" style={{ gridTemplateColumns: '130px 1fr' }}>
            <span className="font-semibold text-slate-700">Validez Proforma</span>
            <span>{config.validez_proforma_default || '1 mes'}</span>
          </div>
          {data.nota && (
            <div className="grid gap-2" style={{ gridTemplateColumns: '130px 1fr' }}>
              <span className="font-semibold text-slate-700">NOTA</span>
              <span>{data.nota}</span>
            </div>
          )}
        </div>
      </div>

      {/* ─── Panel gestión de imágenes (no-print) ─── */}
      {showImagesPage && (
        <div className="no-print mx-auto mb-6 bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden"
          style={{ width: '210mm', maxWidth: 'calc(100vw - 2rem)' }}>
          <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Images size={16} className="text-teal-500" />
              <span className="text-sm font-semibold text-slate-700">Segunda hoja — galería de imágenes</span>
            </div>
            <span className="text-xs text-slate-400">{proformaImages.length} imagen{proformaImages.length !== 1 ? 'es' : ''}</span>
          </div>

          <div className="p-6">
            {/* Drop zone */}
            <div
              onClick={() => fileInputRef.current?.click()}
              onDragOver={e => { e.preventDefault(); setIsDragging(true); }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={e => { e.preventDefault(); setIsDragging(false); handleFileUpload(e.dataTransfer.files); }}
              className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all ${
                isDragging ? 'border-teal-400 bg-teal-50' : 'border-slate-200 hover:border-teal-300 hover:bg-slate-50'
              }`}
            >
              {uploading ? (
                <div className="flex items-center justify-center gap-2 text-teal-600">
                  <Loader2 size={18} className="animate-spin" />
                  <span className="text-sm">Subiendo imágenes…</span>
                </div>
              ) : (
                <>
                  <Upload size={20} className="mx-auto text-slate-400 mb-2" />
                  <p className="text-sm text-slate-500">Arrastra imágenes aquí o <span className="text-teal-600 font-medium">haz clic para seleccionar</span></p>
                  <p className="text-xs text-slate-400 mt-1">PNG, JPG, JPEG, WEBP — puedes seleccionar varias</p>
                </>
              )}
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept="image/png,image/jpeg,image/webp"
                className="hidden"
                onChange={e => e.target.files && handleFileUpload(e.target.files)}
              />
            </div>

            {/* Thumbnails con captions */}
            {proformaImages.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mt-5">
                {proformaImages.map(img => (
                  <div key={img.id} className="group relative">
                    <div className="relative rounded-xl overflow-hidden bg-slate-100 aspect-video">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={img.url_path} alt={img.caption || ''} className="w-full h-full object-cover" />
                      <button
                        onClick={() => handleDeleteImage(img.id)}
                        className="absolute top-1.5 right-1.5 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-md hover:bg-red-600"
                        title="Eliminar imagen"
                      >
                        <X size={11} />
                      </button>
                    </div>
                    <input
                      type="text"
                      value={img.caption}
                      placeholder="Agregar descripción…"
                      onChange={e => handleCaptionChange(img.id, e.target.value)}
                      onBlur={e => handleCaptionSave(img.id, e.target.value)}
                      className="w-full mt-2 text-xs px-2.5 py-1.5 border border-slate-200 rounded-lg focus:outline-none focus:border-teal-400 transition-colors bg-slate-50 focus:bg-white"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ─── Hoja 2: Galería de imágenes ─── */}
      {showImagesPage && proformaImages.length > 0 && (
        <div
          ref={sheet2Ref}
          className="bg-white mx-auto my-8 shadow-lg print:shadow-none print:my-0 print-page-break"
          style={{ width: '210mm', minHeight: '297mm', padding: '18mm 18mm 14mm' }}
        >
          {/* Mismo header que hoja 1 */}
          <div className="flex justify-between items-start mb-5">
            <div className="flex items-start gap-4">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/logo-light.png" alt="EPAJ" width={70} height={70} className="shrink-0" crossOrigin="anonymous" />
              <div>
                <div className="text-base font-bold text-slate-900 leading-tight">{config.empresa_nombre}</div>
                <div className="text-xs text-slate-500 mt-1 leading-relaxed">
                  {config.empresa_direccion}<br />
                  RUC: {config.empresa_ruc}<br />
                  Tel {config.empresa_telefono}
                </div>
              </div>
            </div>
            <div className="text-right text-xs text-slate-600 space-y-0.5 mt-1">
              <div><span className="font-semibold text-slate-800">Proforma:</span> {data.numero}</div>
              <div><span className="font-semibold text-slate-800">Cliente:</span> {data.cliente_nombre}</div>
              <div><span className="font-semibold text-slate-800">Fecha:</span> {fmtDate(data.fecha)}</div>
            </div>
          </div>

          <div className="h-1 rounded-full mb-5" style={{ background: 'linear-gradient(90deg, #7c6fa0, #3b82f6, #14b8a6)' }} />

          <div className="mb-5">
            <div className="text-xs text-slate-400 uppercase tracking-widest mb-0.5">Anexo</div>
            <div className="text-sm font-bold" style={{ color: '#0d9488' }}>GALERÍA DE PROYECTO</div>
          </div>

          {/* Grid 2 columnas */}
          <div className="grid grid-cols-2 gap-5">
            {proformaImages.map(img => (
              <div key={img.id}>
                <div className="w-full overflow-hidden rounded-lg" style={{ aspectRatio: '4/3' }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={img.url_path}
                    alt={img.caption || 'Imagen de proyecto'}
                    className="w-full h-full object-cover"
                    crossOrigin="anonymous"
                  />
                </div>
                {img.caption && (
                  <p className="text-xs text-slate-500 text-center mt-2 italic leading-relaxed">{img.caption}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      <style>{`
        @media print {
          .no-print { display: none !important; }
          body { background: white !important; margin: 0; }
          * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
          div[style*="210mm"] { margin: 0 !important; box-shadow: none !important; width: 100% !important; min-height: auto !important; }
          .print-page-break { page-break-before: always !important; break-before: page !important; }
        }
        @page { margin: 0; size: A4; }
      `}</style>
    </div>
  );
}
