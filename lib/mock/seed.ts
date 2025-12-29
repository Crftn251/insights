'use server';

import { createServiceRoleClient } from '@/lib/supabase/server';
import { subDays, format, addDays } from 'date-fns';

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomFloat(min: number, max: number): number {
  return Math.random() * (max - min) + min;
}

export async function seedMockData(userId: string) {
  const supabase = createServiceRoleClient();

  // Create mock pages
  const mockPageId = `mock_page_${Date.now()}`;
  const mockIGId = `mock_ig_${Date.now()}`;

  await supabase.from('pages').upsert({
    user_id: userId,
    page_id: mockPageId,
    name: 'Mock Facebook Page',
  });

  await supabase.from('ig_accounts').upsert({
    user_id: userId,
    ig_business_id: mockIGId,
    username: 'mock_instagram_account',
  });

  // Generate 90 days of metrics
  const today = new Date();
  const metrics = [];

  for (let i = 0; i < 90; i++) {
    const date = subDays(today, i);
    const dateStr = format(date, 'yyyy-MM-dd');

    // Facebook metrics
    const fbImpressions = randomInt(1000, 10000);
    const fbReach = Math.floor(fbImpressions * randomFloat(0.6, 0.9));
    const fbEngagements = Math.floor(fbReach * randomFloat(0.05, 0.15));

    metrics.push({
      user_id: userId,
      account_ref: mockPageId,
      platform: 'facebook',
      date: dateStr,
      impressions: fbImpressions,
      reach: fbReach,
      engagements: fbEngagements,
      profile_views: randomInt(50, 500),
      follower_count: randomInt(1000, 5000),
      link_clicks: randomInt(10, 200),
      video_views: randomInt(100, 2000),
    });

    // Instagram metrics
    const igImpressions = randomInt(2000, 15000);
    const igReach = Math.floor(igImpressions * randomFloat(0.7, 0.95));
    const igEngagements = Math.floor(igReach * randomFloat(0.08, 0.2));

    metrics.push({
      user_id: userId,
      account_ref: mockIGId,
      platform: 'instagram',
      date: dateStr,
      impressions: igImpressions,
      reach: igReach,
      engagements: igEngagements,
      profile_views: randomInt(100, 800),
      follower_count: randomInt(2000, 10000),
      link_clicks: randomInt(20, 300),
      video_views: randomInt(200, 3000),
    });
  }

  // Insert metrics in batches
  for (const metric of metrics) {
    await supabase.from('daily_metrics').upsert(metric, {
      onConflict: 'user_id,account_ref,platform,date',
    });
  }

  // Generate 30 mock posts
  const mediaTypes = ['IMAGE', 'VIDEO', 'CAROUSEL_ALBUM'];
  const posts = [];

  for (let i = 0; i < 30; i++) {
    const postDate = subDays(today, randomInt(0, 90));
    const postId = `mock_post_${Date.now()}_${i}`;
    const mediaType = mediaTypes[randomInt(0, mediaTypes.length - 1)];
    const likeCount = randomInt(50, 2000);
    const commentCount = randomInt(5, 200);

    posts.push({
      user_id: userId,
      platform: 'instagram',
      post_id: postId,
      created_time: postDate.toISOString(),
      caption: `Mock Instagram Post ${i + 1} - This is a sample caption for testing purposes.`,
      media_type: mediaType,
      permalink: `https://instagram.com/p/${postId}`,
      like_count: likeCount,
      comment_count: commentCount,
      thumbnail_url: `https://picsum.photos/400/400?random=${i}`,
    });

    // Generate post metrics for each post
    const postMetricsDate = format(postDate, 'yyyy-MM-dd');
    const impressions = randomInt(500, 5000);
    const reach = Math.floor(impressions * randomFloat(0.7, 0.95));
    const engagements = likeCount + commentCount + randomInt(10, 100);

    await supabase.from('post_metrics_daily').upsert(
      {
        user_id: userId,
        platform: 'instagram',
        post_id: postId,
        date: postMetricsDate,
        impressions,
        reach,
        engagements,
        saves: randomInt(10, 200),
        video_views: mediaType === 'VIDEO' ? randomInt(1000, 10000) : 0,
      },
      { onConflict: 'user_id,platform,post_id,date' }
    );
  }

  // Insert posts
  for (const post of posts) {
    await supabase.from('posts').upsert(post, {
      onConflict: 'user_id,platform,post_id',
    });
  }

  return {
    success: true,
    message: 'Mock data seeded successfully',
    pages: 1,
    igAccounts: 1,
    metrics: metrics.length,
    posts: posts.length,
  };
}

