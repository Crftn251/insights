import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const appId = process.env.META_APP_ID;
  const redirectUri = process.env.META_REDIRECT_URI || 'http://localhost:3000/api/meta/callback';

  const scopes = [
    'pages_read_engagement',
    'pages_read_user_content',
    'pages_show_list',
    'instagram_basic',
    'instagram_manage_insights',
    'business_management',
  ].join(',');

  const state = Buffer.from(JSON.stringify({ userId: user.id })).toString(
    'base64'
  );

  const authorizationUrl = `https://www.facebook.com/v21.0/dialog/oauth?client_id=${appId}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${scopes}&state=${state}&response_type=code`;

  return NextResponse.json({ authorizationUrl });
}

