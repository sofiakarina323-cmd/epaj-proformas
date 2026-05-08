// Script de migración: SQLite (local) → Supabase PostgreSQL
// Uso: node scripts/migrate.mjs

import Database from 'better-sqlite3';
import postgres from 'postgres';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');

// Leer .env.local manualmente
const envPath = path.join(root, '.env.local');
if (!fs.existsSync(envPath)) {
  console.error('❌ No se encontró .env.local');
  process.exit(1);
}
const env = {};
for (const line of fs.readFileSync(envPath, 'utf-8').split('\n')) {
  const t = line.trim();
  if (!t || t.startsWith('#')) continue;
  const idx = t.indexOf('=');
  if (idx === -1) continue;
  env[t.slice(0, idx).trim()] = t.slice(idx + 1).trim();
}

// Conectar a Supabase
const sql = postgres({
  host: env.DB_HOST,
  port: Number(env.DB_PORT),
  user: env.DB_USER,
  password: env.DB_PASSWORD,
  database: env.DB_NAME ?? 'postgres',
  ssl: 'require',
  prepare: false,
});

// Abrir SQLite
const dbPath = path.join(root, 'data', 'epaj.db');
if (!fs.existsSync(dbPath)) {
  console.error('❌ No se encontró data/epaj.db');
  process.exit(1);
}
const sqlite = new Database(dbPath, { readonly: true });

async function migrate() {
  console.log('🚀 Iniciando migración SQLite → Supabase...\n');

  // 1. Configuración
  const config = sqlite.prepare('SELECT * FROM configuracion').all();
  for (const row of config) {
    await sql`
      INSERT INTO configuracion (clave, valor)
      VALUES (${row.clave}, ${row.valor})
      ON CONFLICT (clave) DO UPDATE SET valor = EXCLUDED.valor
    `;
  }
  console.log(`✓ Configuración: ${config.length} registros`);

  // 2. Clientes
  const clientes = sqlite.prepare('SELECT * FROM clientes').all();
  for (const c of clientes) {
    await sql`
      INSERT INTO clientes (id, codigo, nombre, direccion, ruc, telefono, email, created_at)
      VALUES (${c.id}, ${c.codigo}, ${c.nombre}, ${c.direccion ?? null}, ${c.ruc ?? null},
              ${c.telefono ?? null}, ${c.email ?? null}, ${c.created_at ?? null})
      ON CONFLICT (id) DO NOTHING
    `;
  }
  if (clientes.length > 0) {
    const maxId = Math.max(...clientes.map(c => c.id));
    await sql`SELECT setval('clientes_id_seq', ${maxId})`;
  }
  console.log(`✓ Clientes: ${clientes.length} registros`);

  // 3. Artículos
  const articulos = sqlite.prepare('SELECT * FROM articulos').all();
  for (const a of articulos) {
    await sql`
      INSERT INTO articulos (id, codigo, nombre, descripcion, precio_base, unidad, categoria, activo, created_at)
      VALUES (${a.id}, ${a.codigo}, ${a.nombre}, ${a.descripcion ?? null}, ${a.precio_base},
              ${a.unidad}, ${a.categoria ?? null}, ${a.activo ?? 1}, ${a.created_at ?? null})
      ON CONFLICT (id) DO NOTHING
    `;
  }
  if (articulos.length > 0) {
    const maxId = Math.max(...articulos.map(a => a.id));
    await sql`SELECT setval('articulos_id_seq', ${maxId})`;
  }
  console.log(`✓ Artículos: ${articulos.length} registros`);

  // 4. Proformas
  const proformas = sqlite.prepare('SELECT * FROM proformas').all();
  for (const p of proformas) {
    await sql`
      INSERT INTO proformas (id, numero, fecha, valido_hasta, cliente_id, comercial,
                             descuento, forma_pago, tiempo_entrega, garantia, nota, estado, created_at)
      VALUES (${p.id}, ${p.numero}, ${p.fecha}, ${p.valido_hasta ?? null}, ${p.cliente_id ?? null},
              ${p.comercial ?? null}, ${p.descuento ?? 0}, ${p.forma_pago ?? null},
              ${p.tiempo_entrega ?? null}, ${p.garantia ?? null}, ${p.nota ?? null},
              ${p.estado ?? 'borrador'}, ${p.created_at ?? null})
      ON CONFLICT (id) DO NOTHING
    `;
  }
  if (proformas.length > 0) {
    const maxId = Math.max(...proformas.map(p => p.id));
    await sql`SELECT setval('proformas_id_seq', ${maxId})`;
  }
  console.log(`✓ Proformas: ${proformas.length} registros`);

  // 5. Items de proformas
  const items = sqlite.prepare('SELECT * FROM proforma_items').all();
  for (const it of items) {
    await sql`
      INSERT INTO proforma_items (id, proforma_id, articulo_id, codigo_articulo,
                                  descripcion, cantidad, precio_unitario, orden)
      VALUES (${it.id}, ${it.proforma_id}, ${it.articulo_id ?? null}, ${it.codigo_articulo},
              ${it.descripcion}, ${it.cantidad}, ${it.precio_unitario}, ${it.orden ?? 0})
      ON CONFLICT (id) DO NOTHING
    `;
  }
  if (items.length > 0) {
    const maxId = Math.max(...items.map(i => i.id));
    await sql`SELECT setval('proforma_items_id_seq', ${maxId})`;
  }
  console.log(`✓ Items de proformas: ${items.length} registros`);

  console.log('\n✅ ¡Migración completada exitosamente!');
  await sql.end();
  sqlite.close();
}

migrate().catch(err => {
  console.error('\n❌ Error en migración:', err.message);
  process.exit(1);
});
