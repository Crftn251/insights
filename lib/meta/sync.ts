'use server';

import { createServiceRoleClient } from '@/lib/supabase/server';
import { MetaGraphClient } from './client';
import { subDays, format, parseISO } from 'date-fns';

interface SyncResult {
  success: boolean;
  message: string;
  pages?: number;
  igAccounts?: number;
  metrics?: number;
  posts?: number;
}

export async function syncMetaData(
  userId: string,
  accountId?: string
): Promise<SyncResult> {
  const supabase = createServiceRoleClient();

  // Get connected accounts
  let query = supabase
    .from('connected_accounts')
    .select('*')
    .eq('user_id', userId)
    .eq('provider', 'meta');

  if (accountId) {
    query = query.eq('id', accountId);
  }

  const { data: accounts, error: accountsError } = await query;

  if (accountsError || !accounts || accounts.length === 0) {
    return {
      success: false,
      message: 'Keine verbundenen Meta-Accounts gefunden',
    };
  }

  let totalPages = 0;
  let totalIGAccounts = 0;
  let totalMetrics = 0;
  let totalPosts = 0;

  for (const account of accounts) {
    const token = account.token as { access_token: string };
    if (!token?.access_token) continue;

    const client = new MetaGraphClient(token.access_token);

    try {
      // Get pages
      const pages = await client.getPages();
      totalPages += pages.length;

      for (const page of pages) {
        // Upsert page
        await supabase.from('pages').upsert({
          user_id: userId,
          page_id: page.id,
          name: page.name,
        });

        // Get IG Business Account
        const igAccount = await client.getInstagramBusinessAccount(page.id);
        if (igAccount) {
          totalIGAccounts += 1;
          await supabase.from('ig_accounts').upsert({
            user_id: userId,
            ig_business_id: igAccount.id,
            username: igAccount.username,
          });

          // Sync IG metrics (last 90 days)
          const until = format(new Date(), 'yyyy-MM-dd');
          const since = format(subDays(new Date(), 90), 'yyyy-MM-dd');

          const igMetrics = await client.getIGAccountInsights(
            igAccount.id,
            [
              'impressions',
              'reach',
              'profile_views',
              'follower_count',
            ],
            since,
            until
          ).catch(() => []);

          // Process insights
          for (const insight of igMetrics) {
            if (insight.values && insight.values.length > 0) {
              for (const value of insight.values) {
                const date = format(parseISO(value.end_time), 'yyyy-MM-dd');
                const metricValue = value.value || 0;

                await supabase.from('daily_metrics').upsert(
                  {
                    user_id: userId,
                    account_ref: igAccount.id,
                    platform: 'instagram',
                    date,
                    [insight.name]: metricValue,
                  },
                  { onConflict: 'user_id,account_ref,platform,date' }
                );
              }
            }
          }

          // Sync posts
          const media = await client.getMediaList(igAccount.id, 30);
          totalPosts += media.length;

          for (const item of media) {
            await supabase.from('posts').upsert({
              user_id: userId,
              platform: 'instagram',
              post_id: item.id,
              created_time: item.timestamp,
              caption: item.caption,
              media_type: item.media_type,
              permalink: item.permalink,
              like_count: item.like_count || 0,
              comment_count: item.comments_count || 0,
              thumbnail_url: item.thumbnail_url,
            });

            // Get post insights
            try {
              const postInsights = await client.getMediaInsights(item.id, [
                'impressions',
                'reach',
                'engagement',
                'saved',
                'video_views',
              ]);

              for (const insight of postInsights) {
                if (insight.values && insight.values.length > 0) {
                  const value = insight.values[0].value || 0;
                  const date = format(new Date(), 'yyyy-MM-dd');

                  await supabase.from('post_metrics_daily').upsert(
                    {
                      user_id: userId,
                      platform: 'instagram',
                      post_id: item.id,
                      date,
                      [insight.name]: value,
                    },
                    { onConflict: 'user_id,platform,post_id,date' }
                  );
                }
              }
            } catch (err) {
              console.error(`Error fetching insights for post ${item.id}:`, err);
            }
          }
        }

        // Sync page metrics
        const pageMetrics = await client.getPageInsights(
          page.id,
          ['page_impressions', 'page_reach', 'page_engaged_users'],
          format(subDays(new Date(), 90), 'yyyy-MM-dd'),
          format(new Date(), 'yyyy-MM-dd')
        ).catch(() => []);

        for (const insight of pageMetrics) {
          if (insight.values && insight.values.length > 0) {
            for (const value of insight.values) {
              const date = format(parseISO(value.end_time), 'yyyy-MM-dd');
              const metricValue = value.value || 0;

              await supabase.from('daily_metrics').upsert(
                {
                  user_id: userId,
                  account_ref: page.id,
                  platform: 'facebook',
                  date,
                  [insight.name]: metricValue,
                },
                { onConflict: 'user_id,account_ref,platform,date' }
              );
            }
          }
        }
      }

      totalMetrics += 1;
    } catch (error) {
      console.error(`Error syncing account ${account.id}:`, error);
    }
  }

  return {
    success: true,
    message: 'Synchronisierung abgeschlossen',
    pages: totalPages,
    igAccounts: totalIGAccounts,
    metrics: totalMetrics,
    posts: totalPosts,
  };
}

