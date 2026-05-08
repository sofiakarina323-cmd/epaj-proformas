import { NextRequest, NextResponse } from 'next/server';
import { query, execute } from '@/lib/db';

export async function GET() {
  const proformas = await query(`
    SELECT p.*, c.nombre as cliente_nombre, c.codigo as cliente_codigo
    FROM proformas p
    LEFT JOIN clientes c ON p.cliente_id = c.id
    ORDER BY p.created_at DESC
  `);
  return NextResponse.json(proformas);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { numero, fecha, valido_hasta, cliente_id, comercial, descuento, forma_pago, tiempo_entrega, garantia, nota, items } = body;

  try {
    const result = await execute(
      `INSERT INTO proformas (numero, fecha, valido_hasta, cliente_id, comercial, descuento, forma_pago, tiempo_entrega, garantia, nota)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [numero, fecha, valido_hasta, cliente_id, comercial, descuento || 0, forma_pago, tiempo_entrega, garantia, nota]
    );

    const proformaId = result.lastInsertRowid;

    if (items && Array.isArray(items)) {
      for (let idx = 0; idx < items.length; idx++) {
        const item = items[idx] as { articulo_id?: number; codigo_articulo: string; descripcion: string; cantidad: number; precio_unitario: number };
        await execute(
          `INSERT INTO proforma_items (proforma_id, articulo_id, codigo_articulo, descripcion, cantidad, precio_unitario, orden)
           VALUES (?, ?, ?, ?, ?, ?, ?)`,
          [proformaId, item.articulo_id || null, item.codigo_articulo, item.descripcion, item.cantidad, item.precio_unitario, idx]
        );
      }
    }

    return NextResponse.json({ id: proformaId });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 400 });
  }
}
