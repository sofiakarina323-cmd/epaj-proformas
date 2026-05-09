import type { Viewport } from 'next';
import ProformaClient from './ProformaClient';

// ✅ Viewport específico de esta ruta: el navegador móvil escala el contenido
// para que un layout de 820px quepa en pantalla. Definido en el server component
// para que llegue al HTML inicial ANTES del primer paint del navegador.
export const viewport: Viewport = {
  width: 820,
  initialScale: 1,
  userScalable: true,
};

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <ProformaClient id={id} />;
}
