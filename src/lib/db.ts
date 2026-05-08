import postgres from 'postgres';

// Parámetros individuales para evitar problemas de URL-encoding con caracteres
// especiales en la contraseña (%, !, &, etc.) al usar connection strings.
const sql = postgres({
  host: process.env.DB_HOST!,
  port: Number(process.env.DB_PORT ?? 6543),
  user: process.env.DB_USER!,
  password: process.env.DB_PASSWORD!,
  database: process.env.DB_NAME ?? 'postgres',
  ssl: 'require',
  prepare: false, // requerido para PgBouncer (Supabase pooler)
});

// Convierte ? a $1, $2, ... (compatibilidad con el código SQLite original)
function toPositional(query: string): string {
  let i = 0;
  return query.replace(/\?/g, () => `$${++i}`);
}

export async function query<T = unknown>(sqlStr: string, params: unknown[] = []): Promise<T[]> {
  const result = await sql.unsafe(toPositional(sqlStr), params as never[]);
  return result as unknown as T[];
}

export async function queryOne<T = unknown>(sqlStr: string, params: unknown[] = []): Promise<T | undefined> {
  const results = await query<T>(sqlStr, params);
  return results[0];
}

export async function execute(sqlStr: string, params: unknown[] = []): Promise<{ lastInsertRowid: number }> {
  const isInsert = sqlStr.trim().toUpperCase().startsWith('INSERT');
  const finalSql = isInsert && !sqlStr.toUpperCase().includes('RETURNING')
    ? `${toPositional(sqlStr)} RETURNING id`
    : toPositional(sqlStr);
  const result = await sql.unsafe(finalSql, params as never[]);
  const firstRow = result[0] as unknown as { id?: number } | undefined;
  return { lastInsertRowid: isInsert ? Number(firstRow?.id ?? 0) : 0 };
}

// No-op: tablas gestionadas en Supabase dashboard
export async function initDb(): Promise<void> {}
