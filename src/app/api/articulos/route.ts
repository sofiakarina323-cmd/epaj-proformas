import { NextRequest, NextResponse } from 'next/server';
import { query, execute } from '@/lib/db';

export async function GET() {
  const articulos = await query('SELECT * FROM articulos WHERE activo = 1 ORDER BY codigo');
  return NextResponse.json(articulos);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { codigo, nombre, descripcion, precio_base, unidad, categoria } = body;
  try {
    const result = await execute(
      `INSERT INTO articulos (codigo, nombre, descripcion, precio_base, unidad, categoria) VALUES (?, ?, ?, ?, ?, ?)`,
      [codigo, nombre, descripcion, precio_base, unidad, categoria]
    );
    return NextResponse.json({ id: result.lastInsertRowid });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 400 });
  }
}
