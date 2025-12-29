import { NextRequest, NextResponse } from 'next/server';
import { createClient, createServiceRoleClient } from '@/lib/supabase/server';
import { MetaGraphClient } from '@/lib/meta/client';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const code = searchParams.get('code');
  const state = searchParams.get('state');
  const error = searchParams.get('error');

  if (error) {
    return NextResponse.redirect(
      new URL(`/dashboard?error=${encodeURIComponent(error)}`, request.url)
    );
  }

  if (!code || !state) {
    return NextResponse.redirect(
      new URL('/dashboard?error=missing_params', request.url)
    );
  }

  try {
    const { userId } = JSON.parse(
      Buffer.from(state, 'base64').toString('utf-8')
    );

    // Exchange code for token
    const tokenResponse = await fetch(
      `https://graph.facebook.com/v21.0/oauth/access_token?client_id=${process.env.META_APP_ID}&redirect_uri=${encodeURIComponent(process.env.META_REDIRECT_URI || 'http://localhost:3000/api/meta/callback')}&client_secret=${process.env.META_APP_SECRET}&code=${code}`
    );

    if (!tokenResponse.ok) {
      throw new Error('Token exchange failed');
    }

    const tokenData = await tokenResponse.json();
    const shortLivedToken = tokenData.access_token;

    // Exchange for long-lived token
    const client = new MetaGraphClient(shortLivedToken);
    const longLivedToken = await client.getLongLivedToken(shortLivedToken);

    // Get user info to verify token
    const userInfoResponse = await fetch(
      `https://graph.facebook.com/v21.0/me?access_token=${longLivedToken.access_token}&fields=id,name`
    );
    const userInfo = await userInfoResponse.json();

    // Save connected account
    const supabase = createServiceRoleClient();
    const expiresAt = longLivedToken.expires_in
      ? new Date(Date.now() + longLivedToken.expires_in * 1000)
      : null;

    const { error: insertError } = await supabase
      .from('connected_accounts')
      .upsert({
        user_id: userId,
        provider: 'meta',
        page_id: null,
        token: {
          access_token: longLivedToken.access_token,
          token_type: longLivedToken.token_type || 'bearer',
        },
        token_expires_at: expiresAt,
        scopes: [
          'pages_read_engagement',
          'pages_read_user_content',
          'pages_show_list',
          'instagram_basic',
          'instagram_manage_insights',
          'business_management',
        ],
      });

    if (insertError) {
      throw insertError;
    }

    // Trigger initial sync
    const { syncMetaData } = await import('@/lib/meta/sync');
    await syncMetaData(userId).catch((err) => {
      console.error('Initial sync failed:', err);
    });

    return NextResponse.redirect(
      new URL('/dashboard?connected=success', request.url)
    );
  } catch (err: any) {
    console.error('Callback error:', err);
    return NextResponse.redirect(
      new URL(
        `/dashboard?error=${encodeURIComponent(err.message || 'callback_failed')}`,
        request.url
      )
    );
  }
}

