import { NextRequest, NextResponse } from 'next/server';
import { query, execute } from '@/lib/db';

export async function GET() {
  const rows = await query<{ clave: string; valor: string }>('SELECT * FROM configuracion');
  const config = Object.fromEntries(rows.map(r => [r.clave, r.valor]));
  return NextResponse.json(config);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  for (const [clave, valor] of Object.entries(body)) {
    // PostgreSQL: INSERT ... ON CONFLICT DO UPDATE (equivalente a INSERT OR REPLACE de SQLite)
    await execute(
      `INSERT INTO configuracion (clave, valor) VALUES (?, ?) ON CONFLICT (clave) DO UPDATE SET valor = EXCLUDED.valor`,
      [clave, String(valor)]
    );
  }
  return NextResponse.json({ ok: true });
}
