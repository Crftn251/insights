import { NextRequest, NextResponse } from 'next/server';
import { createServiceRoleClient } from '@/lib/supabase/server';
import { syncMetaData } from '@/lib/meta/sync';

export async function GET(request: NextRequest) {
  // Verify cron secret
  const authHeader = request.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET;

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const supabase = createServiceRoleClient();

    // Get all users with connected accounts
    const { data: accounts, error } = await supabase
      .from('connected_accounts')
      .select('user_id')
      .eq('provider', 'meta');

    if (error) {
      throw error;
    }

    const userIds = [...new Set(accounts?.map((a) => a.user_id) || [])];
    const results = [];

    for (const userId of userIds) {
      try {
        const result = await syncMetaData(userId);
        results.push({ userId, ...result });
      } catch (err: any) {
        results.push({ userId, success: false, message: err.message });
      }
    }

    return NextResponse.json({
      success: true,
      synced: results.length,
      results,
    });
  } catch (error: any) {
    console.error('Cron sync error:', error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}

