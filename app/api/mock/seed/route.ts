import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { seedMockData } from '@/lib/mock/seed';

export async function POST(request: NextRequest) {
  // Only allow in mock mode
  if (process.env.MOCK_META !== 'true') {
    return NextResponse.json(
      { error: 'Mock mode not enabled' },
      { status: 403 }
    );
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const result = await seedMockData(user.id);
    return NextResponse.json(result);
  } catch (error: any) {
    console.error('Mock seed error:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Seed failed' },
      { status: 500 }
    );
  }
}

