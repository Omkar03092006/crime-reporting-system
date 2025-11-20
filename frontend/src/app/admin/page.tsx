'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  adminLogin,
  adminLogout,
  fetchAllCrimesForAdmin,
  updateCrimeStatus,
  getAdminToken,
  deleteCrimeAsAdmin,
} from '@/services/adminService';
import { Crime } from '@/services/apiService';
import { useRouter } from 'next/navigation';

const statusOptions = [
  { value: 'PENDING', label: 'Pending Review' },
  { value: 'UNDER_INVESTIGATION', label: 'Under Investigation' },
  { value: 'RESOLVED', label: 'Resolved' },
];

const AdminPage = () => {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [credentials, setCredentials] = useState({ username: 'admin', password: 'admin@1787' });
  const [crimes, setCrimes] = useState<Crime[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [savingStatusId, setSavingStatusId] = useState<number | null>(null);

  const fetchCrimes = async () => {
    try {
      setLoading(true);
      const data = await fetchAllCrimesForAdmin();
      const sorted = data.slice().sort((a, b) => (b?.id ?? 0) - (a?.id ?? 0));
      setCrimes(sorted);
    } catch (err: any) {
      if (err?.response?.status === 401) {
        setIsAuthenticated(false);
        setError('Session expired. Please log in again.');
      } else {
        setError(err?.response?.data?.error || err.message || 'Failed to load crimes');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (getAdminToken()) {
      setIsAuthenticated(true);
      fetchCrimes();
    }
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      setLoading(true);
      await adminLogin(credentials.username, credentials.password);
      setIsAuthenticated(true);
      await fetchCrimes();
    } catch (err: any) {
      setError(err?.response?.data?.error || err?.message || 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await adminLogout();
    } catch {
      // ignore
    } finally {
      setIsAuthenticated(false);
      setCrimes([]);
    }
  };

  const handleStatusChange = async (crimeId: number, status: string) => {
    try {
      setSavingStatusId(crimeId);
      const updated = await updateCrimeStatus(crimeId, status);

      if (status === 'RESOLVED') {
        await deleteCrimeAsAdmin(crimeId);
        setCrimes((prev) => prev.filter((crime) => crime.id !== crimeId));
      } else {
        setCrimes((prev) => prev.map((crime) => (crime.id === crimeId ? { ...crime, status: updated.status } : crime)));
      }
    } catch (err: any) {
      setError(err?.response?.data?.error || err?.message || 'Failed to update status');
    } finally {
      setSavingStatusId(null);
    }
  };

  const filteredCrimes = useMemo(() => {
    return crimes.filter((crime) => {
      const matchesStatus = statusFilter === 'ALL' || crime.status === statusFilter;
      const query = searchTerm.toLowerCase();
      const matchesSearch =
        !query ||
        crime.crimeType?.toLowerCase().includes(query) ||
        crime.description?.toLowerCase().includes(query) ||
        crime.location?.toLowerCase().includes(query) ||
        String(crime.id).includes(query);
      return matchesStatus && matchesSearch;
    });
  }, [crimes, statusFilter, searchTerm]);

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center px-4">
        <div className="w-full max-w-md bg-slate-900/60 border border-white/10 rounded-2xl p-6 shadow-2xl">
          <h1 className="text-2xl font-semibold text-white mb-4 text-center">Admin Console</h1>
          {error && (
            <div className="mb-4 rounded-xl border border-red-500/40 bg-red-500/10 px-4 py-2 text-sm text-red-200">
              {error}
            </div>
          )}
          <form className="space-y-4" onSubmit={handleLogin}>
            <div>
              <label className="text-sm text-white/70 mb-1 block">Username</label>
              <input
                type="text"
                value={credentials.username}
                onChange={(e) => setCredentials((prev) => ({ ...prev, username: e.target.value }))}
                className="w-full rounded-xl border border-white/10 bg-slate-950 px-4 py-2 text-white focus:border-blue-500 outline-none"
                required
              />
            </div>
            <div>
              <label className="text-sm text-white/70 mb-1 block">Password</label>
              <input
                type="password"
                value={credentials.password}
                onChange={(e) => setCredentials((prev) => ({ ...prev, password: e.target.value }))}
                className="w-full rounded-xl border border-white/10 bg-slate-950 px-4 py-2 text-white focus:border-blue-500 outline-none"
                required
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-blue-600/80 hover:bg-blue-600 transition-colors text-white py-2 font-semibold"
            >
              {loading ? 'Signing in...' : 'Login'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-semibold">Admin Dashboard</h1>
            <p className="text-white/60">Monitor live crime reports and update investigation progress.</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => router.push('/')}
              className="rounded-xl border border-white/20 px-4 py-2 text-sm hover:bg-white/5 transition"
            >
              Back to Home
            </button>
            <button
              onClick={handleLogout}
              className="rounded-xl border border-red-400/50 text-red-200 px-4 py-2 text-sm hover:bg-red-400/10 transition"
            >
              Logout
            </button>
          </div>
        </div>

        {error && (
          <div className="rounded-xl border border-yellow-500/40 bg-yellow-500/10 px-4 py-2 text-sm text-yellow-200">
            {error}
          </div>
        )}

        <div className="grid gap-4 md:grid-cols-3">
          <div className="rounded-2xl border border-white/10 bg-slate-900/50 p-4">
            <p className="text-sm text-white/60">Total Reports</p>
            <p className="text-3xl font-semibold">{crimes.length}</p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-slate-900/50 p-4">
            <p className="text-sm text-white/60">Under Investigation</p>
            <p className="text-3xl font-semibold">
              {crimes.filter((crime) => crime.status === 'UNDER_INVESTIGATION').length}
            </p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-slate-900/50 p-4">
            <p className="text-sm text-white/60">Resolved</p>
            <p className="text-3xl font-semibold">{crimes.filter((crime) => crime.status === 'RESOLVED').length}</p>
          </div>
        </div>

        <div className="rounded-2xl border border-white/10 bg-slate-900/40 p-4 space-y-4">
          <div className="flex flex-col md:flex-row gap-4">
            <input
              type="text"
              placeholder="Search by ID, type, location…"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1 rounded-xl border border-white/10 bg-slate-950 px-4 py-2 text-white focus:border-blue-500 outline-none"
            />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="rounded-xl border border-white/10 bg-slate-950 px-4 py-2 text-white focus:border-blue-500 outline-none"
            >
              <option value="ALL">All statuses</option>
              {statusOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="text-white/70 uppercase text-xs">
                  <th className="py-3">ID</th>
                  <th className="py-3">Type</th>
                  <th className="py-3">Location</th>
                  <th className="py-3">Timestamp</th>
                  <th className="py-3">Reporter</th>
                  <th className="py-3">Status</th>
                  <th className="py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading && (
                  <tr>
                    <td colSpan={7} className="py-10 text-center text-white/60">
                      Loading reports…
                    </td>
                  </tr>
                )}
                {!loading && filteredCrimes.length === 0 && (
                  <tr>
                    <td colSpan={7} className="py-10 text-center text-white/60">
                      No reports found.
                    </td>
                  </tr>
                )}
                {filteredCrimes.map((crime) => (
                  <tr key={crime.id} className="border-t border-white/5">
                    <td className="py-4 font-semibold text-white">#{crime.id}</td>
                    <td className="py-4">
                      <div className="font-medium">{crime.crimeType}</div>
                      <p className="text-xs text-white/50 line-clamp-2">{crime.description}</p>
                    </td>
                    <td className="py-4 text-white/80">{crime.location || 'N/A'}</td>
                    <td className="py-4 text-white/70">
                      {crime.reportedAt ? new Date(crime.reportedAt).toLocaleString() : 'Unknown'}
                    </td>
                    <td className="py-4 text-white/80">{crime.reportedBy?.name || 'Citizen'}</td>
                    <td className="py-4">
                      <select
                        value={crime.status || 'PENDING'}
                        onChange={(e) => handleStatusChange(crime.id, e.target.value)}
                        className="rounded-lg bg-slate-950 border border-white/10 px-3 py-2 text-xs uppercase tracking-wide"
                      >
                        {statusOptions.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => router.push(`/crimes/${crime.id}`)}
                          className="rounded-lg border border-white/20 px-3 py-1 text-xs text-white/80 hover:bg-white/10 transition"
                        >
                          View
                        </button>
                        {savingStatusId === crime.id && (
                          <span className="text-xs text-blue-300">Saving...</span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminPage;
