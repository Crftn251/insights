'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { createClient } from '@/lib/supabase/client';
import { format, subDays } from 'date-fns';
import { KPICard } from '@/components/KPICard';
import { AccountSwitcher } from '@/components/AccountSwitcher';
import { DateRangePicker } from '@/components/DateRangePicker';
import { MetricsChart } from '@/components/MetricsChart';
import { PostsTable } from '@/components/PostsTable';
import { LogOut, RefreshCw, Link2 } from 'lucide-react';

interface Account {
  id: string;
  type: 'page' | 'ig';
  name: string;
  platform: 'facebook' | 'instagram';
  ref: string;
}

export default function DashboardPage() {
  const router = useRouter();
  const supabase = createClient();
  const [selectedAccount, setSelectedAccount] = useState<Account | null>(null);
  const [dateRange, setDateRange] = useState({
    from: format(subDays(new Date(), 6), 'yyyy-MM-dd'),
    to: format(new Date(), 'yyyy-MM-dd'),
  });
  const [selectedMetric, setSelectedMetric] = useState('impressions');
  const [syncing, setSyncing] = useState(false);

  // Check auth
  useEffect(() => {
    async function checkAuth() {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        router.push('/login');
      }
    }
    checkAuth();
  }, [supabase, router]);

  // Fetch KPIs
  const { data: kpis, isLoading: kpisLoading } = useQuery({
    queryKey: ['kpis', selectedAccount?.ref, selectedAccount?.platform, dateRange],
    queryFn: async () => {
      if (!selectedAccount) return null;
      const params = new URLSearchParams({
        account: selectedAccount.ref,
        platform: selectedAccount.platform,
        from: dateRange.from,
        to: dateRange.to,
      });
      const res = await fetch(`/api/kpis?${params}`);
      if (!res.ok) throw new Error('Failed to fetch KPIs');
      return res.json();
    },
    enabled: !!selectedAccount,
  });

  // Fetch timeseries
  const { data: timeseries, isLoading: timeseriesLoading } = useQuery({
    queryKey: ['timeseries', selectedAccount?.ref, selectedAccount?.platform, dateRange, selectedMetric],
    queryFn: async () => {
      if (!selectedAccount) return null;
      const params = new URLSearchParams({
        account: selectedAccount.ref,
        platform: selectedAccount.platform,
        metric: selectedMetric,
        from: dateRange.from,
        to: dateRange.to,
      });
      const res = await fetch(`/api/timeseries?${params}`);
      if (!res.ok) throw new Error('Failed to fetch timeseries');
      const data = await res.json();
      return data.data || [];
    },
    enabled: !!selectedAccount,
  });

  // Fetch posts
  const { data: postsData, isLoading: postsLoading } = useQuery({
    queryKey: ['posts', selectedAccount?.platform],
    queryFn: async () => {
      const params = new URLSearchParams({
        platform: selectedAccount?.platform || 'instagram',
        limit: '20',
      });
      const res = await fetch(`/api/posts?${params}`);
      if (!res.ok) throw new Error('Failed to fetch posts');
      return res.json();
    },
    enabled: !!selectedAccount,
  });

  const handleConnect = async () => {
    const res = await fetch('/api/meta/start', { method: 'POST' });
    const data = await res.json();
    if (data.authorizationUrl) {
      window.location.href = data.authorizationUrl;
    }
  };

  const handleSync = async () => {
    setSyncing(true);
    try {
      const res = await fetch('/api/sync', { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        alert('Synchronisierung erfolgreich!');
        window.location.reload();
      } else {
        alert(`Fehler: ${data.message}`);
      }
    } catch (error) {
      alert('Synchronisierung fehlgeschlagen');
    } finally {
      setSyncing(false);
    }
  };

  const [mockModeEnabled, setMockModeEnabled] = useState(false);

  useEffect(() => {
    // Check if mock mode is enabled
    fetch('/api/mock/seed', { method: 'OPTIONS' })
      .then((res) => {
        if (res.status !== 403) {
          setMockModeEnabled(true);
        }
      })
      .catch(() => {});
  }, []);

  const handleSeedMock = async () => {
    setSyncing(true);
    try {
      const res = await fetch('/api/mock/seed', { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        alert('Mock-Daten erfolgreich erstellt!');
        window.location.reload();
      } else {
        alert(`Fehler: ${data.message}`);
      }
    } catch (error) {
      alert('Fehler beim Erstellen der Mock-Daten');
    } finally {
      setSyncing(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-900">Insights Dashboard</h1>
            <div className="flex items-center gap-4">
              <button
                onClick={handleConnect}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                <Link2 className="w-4 h-4" />
                Meta verbinden
              </button>
              <button
                onClick={handleSync}
                disabled={syncing}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
              >
                <RefreshCw className={`w-4 h-4 ${syncing ? 'animate-spin' : ''}`} />
                Sync
              </button>
              {mockModeEnabled && (
                <button
                  onClick={handleSeedMock}
                  disabled={syncing}
                  className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 disabled:opacity-50"
                >
                  Mock Daten
                </button>
              )}
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded"
              >
                <LogOut className="w-4 h-4" />
                Abmelden
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Controls */}
        <div className="mb-6 flex items-center gap-4 flex-wrap">
          <AccountSwitcher
            value={selectedAccount?.ref}
            onChange={setSelectedAccount}
          />
          <DateRangePicker value={dateRange} onChange={setDateRange} />
        </div>

        {!selectedAccount && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
            <p className="text-yellow-800">
              Bitte verbinde zuerst einen Meta-Account oder lade Mock-Daten.
            </p>
          </div>
        )}

        {selectedAccount && (
          <>
            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              {kpisLoading ? (
                [...Array(4)].map((_, i) => (
                  <div key={i} className="animate-pulse bg-gray-200 h-32 rounded-lg"></div>
                ))
              ) : kpis ? (
                <>
                  <KPICard
                    title="Impressions"
                    value={kpis.impressions.value}
                    previous={kpis.impressions.previous}
                    delta={kpis.impressions.delta}
                    deltaPercent={kpis.impressions.deltaPercent}
                  />
                  <KPICard
                    title="Reach"
                    value={kpis.reach.value}
                    previous={kpis.reach.previous}
                    delta={kpis.reach.delta}
                    deltaPercent={kpis.reach.deltaPercent}
                  />
                  <KPICard
                    title="Engagement Rate"
                    value={`${kpis.engagementRate.value.toFixed(2)}%`}
                    previous={kpis.engagementRate.previous}
                    delta={kpis.engagementRate.delta}
                    deltaPercent={kpis.engagementRate.deltaPercent}
                  />
                  <KPICard
                    title="Follower Growth"
                    value={kpis.followerGrowth.value}
                    previous={kpis.followerGrowth.previous}
                    delta={kpis.followerGrowth.delta}
                    deltaPercent={kpis.followerGrowth.deltaPercent}
                  />
                  <KPICard
                    title="Link Clicks"
                    value={kpis.linkClicks.value}
                    previous={kpis.linkClicks.previous}
                    delta={kpis.linkClicks.delta}
                    deltaPercent={kpis.linkClicks.deltaPercent}
                  />
                  <KPICard
                    title="Video Views"
                    value={kpis.videoViews.value}
                    previous={kpis.videoViews.previous}
                    delta={kpis.videoViews.delta}
                    deltaPercent={kpis.videoViews.deltaPercent}
                  />
                </>
              ) : null}
            </div>

            {/* Chart */}
            <div className="mb-6">
              <div className="mb-4">
                <select
                  value={selectedMetric}
                  onChange={(e) => setSelectedMetric(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-md"
                >
                  <option value="impressions">Impressions</option>
                  <option value="reach">Reach</option>
                  <option value="engagements">Engagements</option>
                  <option value="profile_views">Profile Views</option>
                  <option value="follower_count">Follower Count</option>
                  <option value="link_clicks">Link Clicks</option>
                  <option value="video_views">Video Views</option>
                </select>
              </div>
              {timeseriesLoading ? (
                <div className="animate-pulse bg-gray-200 h-64 rounded-lg"></div>
              ) : timeseries && timeseries.length > 0 ? (
                <MetricsChart data={timeseries} metric={selectedMetric} />
              ) : (
                <div className="bg-white rounded-lg shadow p-6 text-center text-gray-500">
                  Keine Daten verfügbar
                </div>
              )}
            </div>

            {/* Posts Table */}
            <div className="mb-6">
              {postsLoading ? (
                <div className="animate-pulse bg-gray-200 h-64 rounded-lg"></div>
              ) : postsData ? (
                <PostsTable posts={postsData.posts || []} />
              ) : null}
            </div>
          </>
        )}
      </main>
    </div>
  );
}

