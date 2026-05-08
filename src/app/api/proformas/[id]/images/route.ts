import { NextRequest, NextResponse } from 'next/server';
import { query, execute } from '@/lib/db';
import { supabase } from '@/lib/supabase';
import path from 'path';

const BUCKET = 'proforma-images';

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const images = await query('SELECT * FROM proforma_images WHERE proforma_id = ? ORDER BY orden, id', [id]);
  return NextResponse.json(images);
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const formData = await req.formData();
  const file = formData.get('file') as File | null;
  const caption = (formData.get('caption') as string) || '';

  if (!file) return NextResponse.json({ error: 'No file' }, { status: 400 });

  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  const ext = path.extname(file.name).toLowerCase() || '.jpg';
  const filename = `${Date.now()}${ext}`;
  const storagePath = `${id}/${filename}`;

  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(storagePath, buffer, { contentType: file.type, upsert: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const { data: { publicUrl } } = supabase.storage.from(BUCKET).getPublicUrl(storagePath);

  const result = await execute(
    'INSERT INTO proforma_images (proforma_id, filename, url_path, caption) VALUES (?, ?, ?, ?)',
    [id, filename, publicUrl, caption]
  );

  return NextResponse.json({ id: result.lastInsertRowid, url_path: publicUrl, caption, filename });
}
