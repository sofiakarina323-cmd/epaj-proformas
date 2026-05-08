import { NextRequest, NextResponse } from 'next/server';
import { queryOne, execute } from '@/lib/db';
import { supabase } from '@/lib/supabase';

const BUCKET = 'proforma-images';

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ imgId: string }> }) {
  const { imgId } = await params;
  const { caption } = await req.json();
  await execute('UPDATE proforma_images SET caption = ? WHERE id = ?', [caption ?? '', imgId]);
  return NextResponse.json({ ok: true });
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string; imgId: string }> }) {
  const { id, imgId } = await params;
  const img = await queryOne<{ filename: string }>('SELECT filename FROM proforma_images WHERE id = ?', [imgId]);
  if (img) {
    await supabase.storage.from(BUCKET).remove([`${id}/${img.filename}`]);
    await execute('DELETE FROM proforma_images WHERE id = ?', [imgId]);
  }
  return NextResponse.json({ ok: true });
}
