import { NextRequest, NextResponse } from 'next/server';
import { query, execute } from '@/lib/db';

export async function GET() {
  const clientes = await query('SELECT * FROM clientes ORDER BY nombre');
  return NextResponse.json(clientes);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { codigo, nombre, direccion, ruc, telefono, email } = body;
  try {
    const result = await execute(
      `INSERT INTO clientes (codigo, nombre, direccion, ruc, telefono, email) VALUES (?, ?, ?, ?, ?, ?)`,
      [codigo, nombre, direccion, ruc, telefono, email]
    );
    return NextResponse.json({ id: result.lastInsertRowid });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 400 });
  }
}
