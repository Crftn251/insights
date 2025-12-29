import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const [pagesResult, igResult] = await Promise.all([
      supabase.from('pages').select('*').eq('user_id', user.id),
      supabase.from('ig_accounts').select('*').eq('user_id', user.id),
    ]);

    const accounts = [
      ...(pagesResult.data || []).map((p) => ({
        id: p.id,
        type: 'page' as const,
        name: p.name || `Page ${p.page_id}`,
        platform: 'facebook' as const,
        ref: p.page_id,
      })),
      ...(igResult.data || []).map((ig) => ({
        id: ig.id,
        type: 'ig' as const,
        name: ig.username || `IG ${ig.ig_business_id}`,
        platform: 'instagram' as const,
        ref: ig.ig_business_id,
      })),
    ];

    return NextResponse.json({ accounts });
  } catch (error: any) {
    console.error('Accounts error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch accounts' },
      { status: 500 }
    );
  }
}

