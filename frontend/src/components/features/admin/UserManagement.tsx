'use client';
import React, { useEffect, useState, useCallback } from 'react';
import { fetchAllUsers, updateUserRole, UserRecord } from '@/lib/api';

const ROLES: UserRecord['role'][] = ['User', 'Delivery Boy', 'Admin'];
const ROLE_COLORS: Record<string, string> = {
  Admin: 'bg-red-100 text-red-700',
  'Delivery Boy': 'bg-blue-100 text-blue-700',
  User: 'bg-green-100 text-green-700',
};
const ROLE_ICONS: Record<string, string> = {
  Admin: 'admin_panel_settings',
  'Delivery Boy': 'local_shipping',
  User: 'person',
};

export default function UserManagement() {
  const [users, setUsers] = useState<UserRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [filterRole, setFilterRole] = useState<'All' | UserRecord['role']>('All');
  const [searchQ, setSearchQ] = useState('');

  const loadUsers = useCallback(async () => {
    setLoading(true);
    try { setUsers(await fetchAllUsers()); }
    catch { /* ignore */ }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { loadUsers(); }, [loadUsers]);

  const handleRoleChange = async (userId: string, newRole: UserRecord['role']) => {
    setUpdatingId(userId);
    try {
      const updated = await updateUserRole(userId, newRole);
      setUsers(prev => prev.map(u => u._id === userId ? { ...u, role: updated.role } : u));
    } catch { alert('Failed to update role'); }
    finally { setUpdatingId(null); }
  };

  const filtered = users
    .filter(u => filterRole === 'All' || u.role === filterRole)
    .filter(u => u.name.toLowerCase().includes(searchQ.toLowerCase()) || u.email.toLowerCase().includes(searchQ.toLowerCase()));

  const roleCounts = ROLES.reduce((acc, r) => ({ ...acc, [r]: users.filter(u => u.role === r).length }), {} as Record<string, number>);

  if (loading) return <div className="space-y-4">{[1, 2, 3, 4, 5].map(i => <div key={i} className="h-16 bg-surface-container-lowest rounded-2xl animate-pulse" />)}</div>;

  return (
    <div className="space-y-8">
      {/* Stats Row */}
      <div className="grid grid-cols-3 gap-4">
        {ROLES.map(r => (
          <div key={r} className="bg-surface-container-lowest rounded-2xl p-4 border border-outline-variant/10 text-center">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center mx-auto mb-2 ${ROLE_COLORS[r]}`}>
              <span className="material-symbols-outlined text-base">{ROLE_ICONS[r]}</span>
            </div>
            <p className="text-2xl font-extrabold font-headline">{roleCounts[r] || 0}</p>
            <p className="text-xs text-on-surface-variant font-label">{r}s</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1 max-w-xs text-left">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant">search</span>
          <input value={searchQ} onChange={e => setSearchQ(e.target.value)} placeholder="Search users..." className="w-full pl-10 pr-4 py-2.5 bg-surface-container-low rounded-xl text-sm font-body focus:outline-none focus:ring-2 focus:ring-primary/30" />
        </div>
        <div className="flex gap-2">
          {(['All', ...ROLES] as const).map(r => (
            <button key={r} onClick={() => setFilterRole(r as any)}
              className={`px-4 py-2 rounded-full text-sm font-bold transition-all ${filterRole === r ? 'bg-primary text-on-primary' : 'bg-surface-container-low text-on-surface-variant hover:bg-surface-container-high'}`}>
              {r}
            </button>
          ))}
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-surface-container-lowest rounded-2xl shadow-sm border border-outline-variant/10 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="text-on-surface-variant text-xs font-label uppercase bg-surface-container-low">
                <th className="px-6 py-3">User</th>
                <th className="px-6 py-3">Email</th>
                <th className="px-6 py-3">Role</th>
                <th className="px-6 py-3">Joined</th>
                <th className="px-6 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(u => (
                <tr key={u._id} className="border-t border-outline-variant/10 hover:bg-surface-container-low/30 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-extrabold font-headline ${ROLE_COLORS[u.role]}`}>
                        {u.name.charAt(0).toUpperCase()}
                      </div>
                      <span className="font-bold text-sm">{u.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-on-surface-variant">{u.email}</td>
                  <td className="px-6 py-4">
                    <span className={`flex items-center gap-1.5 w-fit px-3 py-1 rounded-full text-xs font-bold ${ROLE_COLORS[u.role]}`}>
                      <span className="material-symbols-outlined text-sm">{ROLE_ICONS[u.role]}</span>
                      {u.role}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-on-surface-variant">
                    {new Date(u.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex gap-1.5 justify-end">
                      {ROLES.filter(r => r !== u.role).map(r => (
                        <button key={r} onClick={() => handleRoleChange(u._id, r)} disabled={updatingId === u._id}
                          className="px-3 py-1.5 rounded-xl text-xs font-bold border border-outline-variant/20 hover:bg-surface-container-high transition-all disabled:opacity-50 flex items-center gap-1">
                          {updatingId === u._id ? '...' : <span className="material-symbols-outlined text-[14px]">{ROLE_ICONS[r]}</span>}
                          {r}
                        </button>
                      ))}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
