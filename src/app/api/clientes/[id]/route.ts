import { NextRequest, NextResponse } from 'next/server';
import { execute } from '@/lib/db';

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await req.json();
  const { codigo, nombre, direccion, ruc, telefono, email } = body;
  await execute(
    `UPDATE clientes SET codigo=?, nombre=?, direccion=?, ruc=?, telefono=?, email=? WHERE id=?`,
    [codigo, nombre, direccion, ruc, telefono, email, id]
  );
  return NextResponse.json({ ok: true });
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await execute(`DELETE FROM clientes WHERE id=?`, [id]);
  return NextResponse.json({ ok: true });
}
