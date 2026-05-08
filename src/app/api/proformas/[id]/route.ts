import { NextRequest, NextResponse } from 'next/server';
import { queryOne, query, execute } from '@/lib/db';

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const proforma = await queryOne<Record<string, unknown>>(`
    SELECT p.*, c.nombre as cliente_nombre, c.codigo as cliente_codigo,
           c.direccion as cliente_direccion, c.ruc as cliente_ruc, c.telefono as cliente_telefono
    FROM proformas p
    LEFT JOIN clientes c ON p.cliente_id = c.id
    WHERE p.id = ?
  `, [id]);

  if (!proforma) return NextResponse.json({ error: 'No encontrado' }, { status: 404 });

  const items = await query('SELECT * FROM proforma_items WHERE proforma_id = ? ORDER BY orden', [id]);
  return NextResponse.json({ ...proforma, items });
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await req.json();
  const { numero, fecha, valido_hasta, cliente_id, comercial, descuento, forma_pago, tiempo_entrega, garantia, nota, estado, items } = body;

  await execute(
    `UPDATE proformas SET numero=?, fecha=?, valido_hasta=?, cliente_id=?, comercial=?,
     descuento=?, forma_pago=?, tiempo_entrega=?, garantia=?, nota=?, estado=? WHERE id=?`,
    [numero, fecha, valido_hasta, cliente_id, comercial, descuento || 0, forma_pago, tiempo_entrega, garantia, nota, estado || 'borrador', id]
  );

  if (items !== undefined && Array.isArray(items)) {
    await execute('DELETE FROM proforma_items WHERE proforma_id = ?', [id]);
    for (let idx = 0; idx < items.length; idx++) {
      const item = items[idx] as { articulo_id?: number; codigo_articulo: string; descripcion: string; cantidad: number; precio_unitario: number };
      await execute(
        `INSERT INTO proforma_items (proforma_id, articulo_id, codigo_articulo, descripcion, cantidad, precio_unitario, orden)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [id, item.articulo_id || null, item.codigo_articulo, item.descripcion, item.cantidad, item.precio_unitario, idx]
      );
    }
  }

  return NextResponse.json({ ok: true });
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await execute('DELETE FROM proformas WHERE id=?', [id]);
  return NextResponse.json({ ok: true });
}
