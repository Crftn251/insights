import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { z } from 'zod';

const querySchema = z.object({
  platform: z.enum(['facebook', 'instagram']).optional(),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  offset: z.coerce.number().int().min(0).default(0),
  sortBy: z.enum(['created_time', 'like_count', 'comment_count']).default('created_time'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
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
      platform: searchParams.get('platform') || undefined,
      limit: searchParams.get('limit'),
      offset: searchParams.get('offset'),
      sortBy: searchParams.get('sortBy'),
      sortOrder: searchParams.get('sortOrder'),
    });

    let postsQuery = supabase
      .from('posts')
      .select('*')
      .eq('user_id', user.id)
      .order(query.sortBy, { ascending: query.sortOrder === 'asc' })
      .range(query.offset, query.offset + query.limit - 1);

    if (query.platform) {
      postsQuery = postsQuery.eq('platform', query.platform);
    }

    const { data: posts, error } = await postsQuery;

    if (error) throw error;

    // Get post metrics for each post
    const postsWithMetrics = await Promise.all(
      (posts || []).map(async (post) => {
        const { data: metrics } = await supabase
          .from('post_metrics_daily')
          .select('*')
          .eq('user_id', user.id)
          .eq('platform', post.platform)
          .eq('post_id', post.post_id)
          .order('date', { ascending: false })
          .limit(1)
          .single();

        return {
          ...post,
          metrics: metrics || null,
        };
      })
    );

    // Get total count
    let countQuery = supabase
      .from('posts')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id);

    if (query.platform) {
      countQuery = countQuery.eq('platform', query.platform);
    }

    const { count } = await countQuery;

    return NextResponse.json({
      posts: postsWithMetrics,
      total: count || 0,
      limit: query.limit,
      offset: query.offset,
    });
  } catch (error: any) {
    console.error('Posts error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch posts' },
      { status: 400 }
    );
  }
}

