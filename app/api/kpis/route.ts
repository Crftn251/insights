import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { z } from 'zod';
import { subDays, format } from 'date-fns';

const querySchema = z.object({
  account: z.string().optional(),
  platform: z.enum(['facebook', 'instagram']).optional(),
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
      from: searchParams.get('from'),
      to: searchParams.get('to'),
    });

    // Build query
    let metricsQuery = supabase
      .from('daily_metrics')
      .select('*')
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

    // Calculate KPIs
    const totalImpressions = metrics?.reduce((sum, m) => sum + (m.impressions || 0), 0) || 0;
    const totalReach = metrics?.reduce((sum, m) => sum + (m.reach || 0), 0) || 0;
    const totalEngagements = metrics?.reduce((sum, m) => sum + (m.engagements || 0), 0) || 0;
    const totalProfileViews = metrics?.reduce((sum, m) => sum + (m.profile_views || 0), 0) || 0;
    const totalLinkClicks = metrics?.reduce((sum, m) => sum + (m.link_clicks || 0), 0) || 0;
    const totalVideoViews = metrics?.reduce((sum, m) => sum + (m.video_views || 0), 0) || 0;

    // Get follower counts (first and last day)
    const firstDay = metrics?.[0];
    const lastDay = metrics?.[metrics.length - 1];
    const followerCount = lastDay?.follower_count || 0;
    const previousFollowerCount = firstDay?.follower_count || 0;
    const followerGrowth = followerCount - previousFollowerCount;

    // Engagement rate
    const engagementRate = totalReach > 0 ? (totalEngagements / totalReach) * 100 : 0;

    // Calculate previous period for comparison
    const fromDate = new Date(query.from);
    const toDate = new Date(query.to);
    const daysDiff = Math.ceil((toDate.getTime() - fromDate.getTime()) / (1000 * 60 * 60 * 24));
    const prevFrom = format(subDays(fromDate, daysDiff + 1), 'yyyy-MM-dd');
    const prevTo = format(subDays(fromDate, 1), 'yyyy-MM-dd');

    let prevMetricsQuery = supabase
      .from('daily_metrics')
      .select('*')
      .eq('user_id', user.id)
      .gte('date', prevFrom)
      .lte('date', prevTo)
      .order('date', { ascending: true });

    if (query.account) {
      prevMetricsQuery = prevMetricsQuery.eq('account_ref', query.account);
    }
    if (query.platform) {
      prevMetricsQuery = prevMetricsQuery.eq('platform', query.platform);
    }

    const { data: prevMetrics } = await prevMetricsQuery;

    const prevImpressions = prevMetrics?.reduce((sum, m) => sum + (m.impressions || 0), 0) || 0;
    const prevReach = prevMetrics?.reduce((sum, m) => sum + (m.reach || 0), 0) || 0;
    const prevEngagements = prevMetrics?.reduce((sum, m) => sum + (m.engagements || 0), 0) || 0;
    const prevProfileViews = prevMetrics?.reduce((sum, m) => sum + (m.profile_views || 0), 0) || 0;
    const prevLinkClicks = prevMetrics?.reduce((sum, m) => sum + (m.link_clicks || 0), 0) || 0;
    const prevVideoViews = prevMetrics?.reduce((sum, m) => sum + (m.video_views || 0), 0) || 0;

    return NextResponse.json({
      impressions: {
        value: totalImpressions,
        previous: prevImpressions,
        delta: totalImpressions - prevImpressions,
        deltaPercent: prevImpressions > 0 ? ((totalImpressions - prevImpressions) / prevImpressions) * 100 : 0,
      },
      reach: {
        value: totalReach,
        previous: prevReach,
        delta: totalReach - prevReach,
        deltaPercent: prevReach > 0 ? ((totalReach - prevReach) / prevReach) * 100 : 0,
      },
      engagementRate: {
        value: engagementRate,
        previous: prevReach > 0 ? (prevEngagements / prevReach) * 100 : 0,
        delta: 0,
        deltaPercent: 0,
      },
      followerGrowth: {
        value: followerGrowth,
        previous: 0,
        delta: followerGrowth,
        deltaPercent: previousFollowerCount > 0 ? (followerGrowth / previousFollowerCount) * 100 : 0,
      },
      linkClicks: {
        value: totalLinkClicks,
        previous: prevLinkClicks,
        delta: totalLinkClicks - prevLinkClicks,
        deltaPercent: prevLinkClicks > 0 ? ((totalLinkClicks - prevLinkClicks) / prevLinkClicks) * 100 : 0,
      },
      videoViews: {
        value: totalVideoViews,
        previous: prevVideoViews,
        delta: totalVideoViews - prevVideoViews,
        deltaPercent: prevVideoViews > 0 ? ((totalVideoViews - prevVideoViews) / prevVideoViews) * 100 : 0,
      },
      profileViews: {
        value: totalProfileViews,
        previous: prevProfileViews,
        delta: totalProfileViews - prevProfileViews,
        deltaPercent: prevProfileViews > 0 ? ((totalProfileViews - prevProfileViews) / prevProfileViews) * 100 : 0,
      },
    });
  } catch (error: any) {
    console.error('KPIs error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch KPIs' },
      { status: 400 }
    );
  }
}

