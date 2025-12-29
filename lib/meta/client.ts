interface MetaToken {
  access_token: string;
  token_type?: string;
  expires_in?: number;
}

interface Page {
  id: string;
  name: string;
  access_token: string;
}

interface InstagramBusinessAccount {
  id: string;
  username: string;
}

interface Insight {
  name: string;
  period: string;
  values: Array<{ value: number; end_time: string }>;
}

interface Media {
  id: string;
  caption?: string;
  media_type: string;
  permalink: string;
  thumbnail_url?: string;
  timestamp: string;
  like_count?: number;
  comments_count?: number;
}

export class MetaGraphClient {
  private baseUrl = 'https://graph.facebook.com/v21.0';
  private accessToken: string;

  constructor(accessToken: string) {
    this.accessToken = accessToken;
  }

  private async request<T>(
    endpoint: string,
    params: Record<string, string | number> = {}
  ): Promise<T> {
    const url = new URL(`${this.baseUrl}${endpoint}`);
    url.searchParams.set('access_token', this.accessToken);
    Object.entries(params).forEach(([key, value]) => {
      url.searchParams.set(key, String(value));
    });

    const response = await fetch(url.toString(), {
      headers: {
        Accept: 'application/json',
      },
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(
        error.error?.message || `HTTP ${response.status}: ${response.statusText}`
      );
    }

    return response.json();
  }

  async getPages(): Promise<Page[]> {
    try {
      const data = await this.request<{ data: Page[] }>('/me/accounts', {
        fields: 'id,name,access_token',
      });
      return data.data || [];
    } catch (error) {
      console.error('Error fetching pages:', error);
      throw error;
    }
  }

  async getInstagramBusinessAccount(
    pageId: string
  ): Promise<InstagramBusinessAccount | null> {
    try {
      const data = await this.request<{
        instagram_business_account?: { id: string; username: string };
      }>(`/${pageId}`, {
        fields: 'instagram_business_account{id,username}',
      });
      return data.instagram_business_account || null;
    } catch (error) {
      console.error('Error fetching IG business account:', error);
      return null;
    }
  }

  async getPageInsights(
    pageId: string,
    metrics: string[],
    since: string,
    until: string
  ): Promise<Insight[]> {
    try {
      const data = await this.request<{ data: Insight[] }>(
        `/${pageId}/insights`,
        {
          metric: metrics.join(','),
          since,
          until,
          period: 'day',
        }
      );
      return data.data || [];
    } catch (error) {
      console.error('Error fetching page insights:', error);
      throw error;
    }
  }

  async getIGAccountInsights(
    igBusinessId: string,
    metrics: string[],
    since: string,
    until: string
  ): Promise<Insight[]> {
    try {
      const data = await this.request<{ data: Insight[] }>(
        `/${igBusinessId}/insights`,
        {
          metric: metrics.join(','),
          since,
          until,
          period: 'day',
        }
      );
      return data.data || [];
    } catch (error) {
      console.error('Error fetching IG account insights:', error);
      throw error;
    }
  }

  async getMediaList(
    igBusinessId: string,
    limit: number = 25
  ): Promise<Media[]> {
    try {
      const data = await this.request<{ data: Media[] }>(
        `/${igBusinessId}/media`,
        {
          fields:
            'id,caption,media_type,permalink,thumbnail_url,timestamp,like_count,comments_count',
          limit,
        }
      );
      return data.data || [];
    } catch (error) {
      console.error('Error fetching media list:', error);
      throw error;
    }
  }

  async getMediaInsights(
    mediaId: string,
    metrics: string[]
  ): Promise<Insight[]> {
    try {
      const data = await this.request<{ data: Insight[] }>(
        `/${mediaId}/insights`,
        {
          metric: metrics.join(','),
        }
      );
      return data.data || [];
    } catch (error) {
      console.error('Error fetching media insights:', error);
      throw error;
    }
  }

  async exchangeShortLivedToken(
    shortLivedToken: string
  ): Promise<MetaToken> {
    try {
      const response = await fetch(
        `${this.baseUrl}/oauth/access_token?grant_type=fb_exchange_token&client_id=${process.env.META_APP_ID}&client_secret=${process.env.META_APP_SECRET}&fb_exchange_token=${shortLivedToken}`
      );

      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(
          error.error?.message || `HTTP ${response.status}: ${response.statusText}`
        );
      }

      return response.json();
    } catch (error) {
      console.error('Error exchanging token:', error);
      throw error;
    }
  }

  async getLongLivedToken(shortLivedToken: string): Promise<MetaToken> {
    return this.exchangeShortLivedToken(shortLivedToken);
  }
}

