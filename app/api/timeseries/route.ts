import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { z } from 'zod';

const querySchema = z.object({
  account: z.string().optional(),
  platform: z.enum(['facebook', 'instagram']).optional(),
  metric: z.enum(['impressions', 'reach', 'engagements', 'profile_views', 'follower_count', 'link_clicks', 'video_views']),
  from: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  to: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
});

export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const searchParams = request.nextUrl.searchParams;
    const query = querySchema.parse({
      account: searchParams.get('account') || undefined,
      platform: searchParams.get('platform') || undefined,
      metric: searchParams.get('metric'),
      from: searchParams.get('from'),
      to: searchParams.get('to'),
    });

    let metricsQuery = supabase
      .from('daily_metrics')
      .select('date, ' + query.metric)
      .eq('user_id', user.id)
      .gte('date', query.from)
      .lte('date', query.to)
      .order('date', { ascending: true });

    if (query.account) {
      metricsQuery = metricsQuery.eq('account_ref', query.account);
    }
    if (query.platform) {
      metricsQuery = metricsQuery.eq('platform', query.platform);
    }

    const { data: metrics, error } = await metricsQuery;

    if (error) throw error;

    const timeseries = metrics?.map((m) => ({
      date: m.date,
      value: m[query.metric as keyof typeof m] || 0,
    })) || [];

    return NextResponse.json({ data: timeseries });
  } catch (error: any) {
    console.error('Timeseries error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch timeseries' },
      { status: 400 }
    );
  }
}

