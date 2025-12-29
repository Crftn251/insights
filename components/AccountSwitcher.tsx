'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';

interface Account {
  id: string;
  type: 'page' | 'ig';
  name: string;
  platform: 'facebook' | 'instagram';
  ref: string;
}

export function AccountSwitcher({
  value,
  onChange,
}: {
  value?: string;
  onChange: (account: Account | null) => void;
}) {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    async function loadAccounts() {
      try {
        const res = await fetch('/api/accounts');
        if (!res.ok) throw new Error('Failed to fetch accounts');
        const data = await res.json();
        setAccounts(data.accounts || []);
        setLoading(false);

        if (data.accounts && data.accounts.length > 0 && !value) {
          onChange(data.accounts[0]);
        }
      } catch (error) {
        console.error('Error loading accounts:', error);
        setLoading(false);
      }
    }

    loadAccounts();
  }, [value, onChange]);

  if (loading) {
    return (
      <div className="animate-pulse bg-gray-200 h-10 w-48 rounded"></div>
    );
  }

  if (accounts.length === 0) {
    return null;
  }

  const selectedAccount = accounts.find((a) => a.ref === value) || accounts[0];

  return (
    <select
      value={selectedAccount?.ref || ''}
      onChange={(e) => {
        const account = accounts.find((a) => a.ref === e.target.value);
        onChange(account || null);
      }}
      className="px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
    >
      {accounts.map((account) => (
        <option key={account.id} value={account.ref}>
          {account.name} ({account.platform})
        </option>
      ))}
    </select>
  );
}

