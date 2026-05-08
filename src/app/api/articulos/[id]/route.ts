import { NextRequest, NextResponse } from 'next/server';
import { queryOne, execute } from '@/lib/db';

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const art = await queryOne('SELECT * FROM articulos WHERE id=?', [id]);
  return NextResponse.json(art);
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await req.json();
  const { codigo, nombre, descripcion, precio_base, unidad, categoria } = body;
  await execute(
    `UPDATE articulos SET codigo=?, nombre=?, descripcion=?, precio_base=?, unidad=?, categoria=? WHERE id=?`,
    [codigo, nombre, descripcion, precio_base, unidad, categoria, id]
  );
  return NextResponse.json({ ok: true });
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await execute(`UPDATE articulos SET activo=0 WHERE id=?`, [id]);
  return NextResponse.json({ ok: true });
}
