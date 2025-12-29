'use client';

import { useState } from 'react';
// Note: Using img tag instead of Next Image for external URLs
import { ExternalLink } from 'lucide-react';

interface Post {
  id: string;
  platform: string;
  post_id: string;
  created_time: string;
  caption: string;
  media_type: string;
  permalink: string;
  like_count: number;
  comment_count: number;
  thumbnail_url?: string;
  metrics?: {
    impressions?: number;
    reach?: number;
    engagements?: number;
  };
}

interface PostsTableProps {
  posts: Post[];
  loading?: boolean;
}

export function PostsTable({ posts, loading }: PostsTableProps) {
  const [sortBy, setSortBy] = useState<'created_time' | 'like_count' | 'comment_count'>('created_time');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="animate-pulse space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-20 bg-gray-200 rounded"></div>
          ))}
        </div>
      </div>
    );
  }

  if (posts.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-6 text-center text-gray-500">
        Keine Posts gefunden
      </div>
    );
  }

  const sortedPosts = [...posts].sort((a, b) => {
    let aVal: number | string = 0;
    let bVal: number | string = 0;

    if (sortBy === 'created_time') {
      aVal = a.created_time;
      bVal = b.created_time;
    } else if (sortBy === 'like_count') {
      aVal = a.like_count;
      bVal = b.like_count;
    } else {
      aVal = a.comment_count;
      bVal = b.comment_count;
    }

    if (sortOrder === 'asc') {
      return aVal > bVal ? 1 : -1;
    } else {
      return aVal < bVal ? 1 : -1;
    }
  });

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="p-4 border-b">
        <h3 className="text-lg font-semibold">Posts</h3>
        <div className="mt-2 flex gap-2">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="px-2 py-1 text-sm border rounded"
          >
            <option value="created_time">Datum</option>
            <option value="like_count">Likes</option>
            <option value="comment_count">Kommentare</option>
          </select>
          <button
            onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
            className="px-2 py-1 text-sm border rounded"
          >
            {sortOrder === 'asc' ? '↑' : '↓'}
          </button>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Thumbnail
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Caption
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Datum
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Likes
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Kommentare
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Impressions
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Aktionen
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {sortedPosts.map((post) => (
              <tr key={post.id} className="hover:bg-gray-50">
                <td className="px-4 py-3">
                  {post.thumbnail_url ? (
                    <img
                      src={post.thumbnail_url}
                      alt="Post thumbnail"
                      width={60}
                      height={60}
                      className="rounded object-cover"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                  ) : (
                    <div className="w-15 h-15 bg-gray-200 rounded"></div>
                  )}
                </td>
                <td className="px-4 py-3 text-sm max-w-xs truncate">
                  {post.caption || '-'}
                </td>
                <td className="px-4 py-3 text-sm">
                  {new Date(post.created_time).toLocaleDateString('de-DE')}
                </td>
                <td className="px-4 py-3 text-sm">{post.like_count}</td>
                <td className="px-4 py-3 text-sm">{post.comment_count}</td>
                <td className="px-4 py-3 text-sm">
                  {post.metrics?.impressions || '-'}
                </td>
                <td className="px-4 py-3">
                  <a
                    href={post.permalink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

