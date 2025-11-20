"use client";

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { getCurrentUser } from '@/services/authService';
import { getAllCrimes, Crime } from '@/services/apiService';
import HomeMap from '@/components/HomeMap';

export default function Home() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [showContent, setShowContent] = useState(false);
  const [recentCrimes, setRecentCrimes] = useState<Crime[]>([]);
  const [allCrimes, setAllCrimes] = useState<Crime[]>([]);
  const [bannerIndex, setBannerIndex] = useState(0);
  const [crimeStats, setCrimeStats] = useState({ total: 0, active: 0, resolved: 0 });
  const [topZones, setTopZones] = useState<string[]>([]);
  const [tipIndex, setTipIndex] = useState(0);

  useEffect(() => {
    const user = getCurrentUser();
    if (!user) {
      router.push('/login');
      return;
    }

    // Simulate loading animation
    setTimeout(() => {
      setLoading(false);
    }, 2000);

    setTimeout(() => {
      setShowContent(true);
    }, 2500);
  }, [router]);

  useEffect(() => {
    const user = getCurrentUser();
    if (!user) return;

    const fetchRecentCrimes = async () => {
      try {
        const data = await getAllCrimes();
        const list = Array.isArray(data) ? data : [];
        setAllCrimes(list);
        const sorted = list
          .filter((crime) => typeof crime?.id === 'number')
          .sort((a, b) => (b?.id ?? 0) - (a?.id ?? 0));
        setRecentCrimes(sorted.slice(0, 5));
        setBannerIndex(0);

        const resolved = list.filter((crime) => (crime.status || '').toUpperCase() === 'RESOLVED').length;
        const active = list.filter(
          (crime) => (crime.status || 'PENDING').toUpperCase() === 'UNDER_INVESTIGATION'
        ).length;
        setCrimeStats({
          total: list.length,
          active,
          resolved,
        });

        const zoneMap: Record<string, number> = {};
        list.forEach((crime) => {
          if (!crime.location) return;
          zoneMap[crime.location] = (zoneMap[crime.location] || 0) + 1;
        });
        const ranked = Object.entries(zoneMap)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 3)
          .map(([loc]) => loc);
        setTopZones(ranked);
      } catch (err) {
        console.error('Unable to load recent crimes for banner:', err);
      }
    };

    fetchRecentCrimes();
  }, []);

  useEffect(() => {
    if (recentCrimes.length <= 1) return;
    const interval = setInterval(() => {
      setBannerIndex((prev) => (prev + 1) % recentCrimes.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [recentCrimes]);

  const formatTimestamp = (dateString?: string) => {
    if (!dateString) return 'Unknown timestamp';
    const date = new Date(dateString);
    if (Number.isNaN(date.getTime())) return 'Unknown timestamp';
    return date.toLocaleString();
  };

  const activeCrime = recentCrimes[bannerIndex];
  const safetyTips = useMemo(
    () => [
      'Keep your GPS enabled while travelling at night for faster response.',
      'Share live location with a trusted contact before entering unfamiliar areas.',
      'If you witness an incident, record details safely and report immediately.',
      'Avoid confronting suspects directly—use the app to alert authorities.',
    ],
    []
  );

  useEffect(() => {
    if (safetyTips.length <= 1) return;
    const timer = setInterval(() => {
      setTipIndex((prev) => (prev + 1) % safetyTips.length);
    }, 7000);
    return () => clearInterval(timer);
  }, [safetyTips]);

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="relative w-32 h-32 mb-8">
            {/* Animated Globe */}
            <div className="absolute inset-0 rounded-full border-4 border-blue-500/30 animate-ping" />
            <div className="absolute inset-0 rounded-full border-4 border-red-500/30 animate-pulse" />
            <div className="absolute inset-2 rounded-full border-2 border-dashed border-white/20 animate-spin" />
            <div className="absolute inset-0 flex items-center justify-center">
              <svg className="w-16 h-16 text-red-500 animate-bounce" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
          </div>
          <h2 className="text-2xl font-bold text-white mb-2 animate-pulse">Crime Reporting System</h2>
          <p className="text-gray-400">Initializing secure connection...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className={`transition-opacity duration-500 ${showContent ? 'opacity-100' : 'opacity-0'}`}>
        {/* Header Section */}
        <div className="bg-gradient-to-b from-black via-slate-950 to-gray-900 py-4 px-4 sm:px-6 lg:px-8 mb-4">
          <div className="max-w-7xl mx-auto flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <Image src="/logo.svg" alt="Shield logo" width={52} height={52} priority className="drop-shadow-lg" />
              <div>
                <h1 className="text-3xl sm:text-4xl font-bold mb-1 bg-clip-text text-transparent bg-gradient-to-r from-yellow-300 via-orange-400 to-red-600">
                  Crime Reporting System
                </h1>
                <p className="text-gray-400 max-w-2xl">
                  Monitor and report incidents in your area. Together we can make our community safer.
                </p>
              </div>
            </div>
            <button
              onClick={() => router.push('/profile')}
              className="hidden sm:inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/5 px-4 py-2 text-sm font-medium text-white hover:bg-white/10 transition"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                />
              </svg>
              View Profile
            </button>
          </div>
        </div>

        {/* Announcement Banner */}
        {activeCrime && (
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 mb-6">
            <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-r from-yellow-500/90 via-orange-600/90 to-red-700/90 shadow-xl">
              <div className="p-6 md:p-8">
                <p className="text-xs uppercase tracking-[0.3em] text-white/70 mb-3 flex items-center gap-2">
                  <span className="inline-flex h-2 w-2 rounded-full bg-green-300 animate-pulse" />
                  Live Update · Incident #{activeCrime.id}
                </p>
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                  <div className="space-y-2 max-w-2xl">
                    <h3 className="text-2xl font-semibold text-white">
                      {activeCrime.crimeType || 'Crime Report'}
                    </h3>
                    <p className="text-white/80 line-clamp-2">
                      {activeCrime.description || 'No description provided.'}
                    </p>
                    <div className="text-sm text-white/70 flex flex-wrap items-center gap-x-4 gap-y-1">
                      <span>Reported {formatTimestamp(activeCrime.reportedAt || activeCrime.createdAt)}</span>
                      {activeCrime.location && (
                        <span className="inline-flex items-center gap-1">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 11c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.5 10.5c0 7.5-7.5 12-7.5 12s-7.5-4.5-7.5-12a7.5 7.5 0 1115 0z" />
                          </svg>
                          {activeCrime.location}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-3">
                    <button
                      onClick={() => router.push(`/crimes/${activeCrime.id}`)}
                      className="inline-flex items-center justify-center gap-2 rounded-xl bg-white/90 px-5 py-3 text-sm font-semibold text-indigo-900 shadow-md hover:bg-white transition"
                    >
                      View Details
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                    <button
                      onClick={() => router.push('/crimes')}
                      className="inline-flex items-center justify-center rounded-xl border border-white/40 px-5 py-3 text-sm font-semibold text-white/90 hover:bg-white/10 transition"
                    >
                      View All Reports
                    </button>
                  </div>
                </div>
              </div>
              {recentCrimes.length > 1 && (
                <div className="flex gap-2 pb-4 px-6">
                  {recentCrimes.map((crime, idx) => (
                    <button
                      key={crime.id}
                      onClick={() => setBannerIndex(idx)}
                      className={`h-1.5 flex-1 rounded-full transition ${idx === bannerIndex ? 'bg-white' : 'bg-white/40 hover:bg-white/60'}`}
                      aria-label={`View incident ${crime.id}`}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Map + Side Panels */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-6 grid gap-6 lg:grid-cols-[260px_minmax(0,1.4fr)_260px]">
          {/* Left analytics */}
          <div className="space-y-4">
            {[
              { label: 'Total Reports', value: crimeStats.total, accent: 'from-blue-500/20 to-blue-800/30' },
              { label: 'Under Investigation', value: crimeStats.active, accent: 'from-yellow-500/20 to-yellow-800/30' },
              { label: 'Resolved', value: crimeStats.resolved, accent: 'from-green-500/20 to-emerald-700/30' },
            ].map((card) => (
              <div
                key={card.label}
                className={`rounded-2xl border border-white/5 bg-gradient-to-br ${card.accent} p-4 shadow-xl`}
              >
                <p className="text-xs text-white/70">{card.label}</p>
                <p className="text-3xl font-semibold">{card.value}</p>
              </div>
            ))}
          </div>

          {/* Map Section */}
          <div className="bg-black/50 backdrop-blur-sm rounded-xl p-4 shadow-2xl border border-gray-800">
            <HomeMap />
          </div>

          {/* Right safety + hotspots */}
          <div className="space-y-4">
            <div className="bg-black/40 backdrop-blur-xl rounded-2xl border border-gray-800 shadow-2xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold">Safety Briefing</h2>
                <span className="text-[10px] uppercase tracking-widest text-white/60">Live tip</span>
              </div>
              <p className="text-sm text-white/80 min-h-[60px] transition-opacity duration-500">
                {safetyTips[tipIndex]}
              </p>
            </div>

            <div className="bg-black/40 backdrop-blur-xl rounded-2xl border border-gray-800 shadow-2xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold">Hotspot Radar</h2>
                <span className="text-[10px] text-white/60">Top zones</span>
              </div>
              {topZones.length === 0 ? (
                <p className="text-xs text-white/60">No hotspots identified yet. Stay alert!</p>
              ) : (
                <ol className="space-y-2 text-xs">
                  {topZones.map((zone, index) => (
                    <li key={zone} className="flex items-start gap-2">
                      <span className="text-white/40">{index + 1}.</span>
                      <div>
                        <p className="text-white font-medium">{zone}</p>
                        <p className="text-white/50">Monitor this area for suspicious activity.</p>
                      </div>
                    </li>
                  ))}
                </ol>
              )}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 mb-8">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <button
              onClick={() => router.push('/report')}
              className="group relative bg-gradient-to-r from-red-600 to-red-700 text-white p-4 rounded-xl hover:from-red-700 hover:to-red-800 transition-all duration-300 shadow-lg hover:shadow-red-500/25"
            >
              <div className="absolute inset-0 bg-black/20 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <div className="relative flex flex-col items-center">
                <svg className="w-8 h-8 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="font-medium">Report Crime</span>
              </div>
            </button>

            <button
              onClick={() => router.push('/profile')}
              className="group relative bg-gradient-to-r from-blue-600 to-blue-700 text-white p-4 rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-300 shadow-lg hover:shadow-blue-500/25"
            >
              <div className="absolute inset-0 bg-black/20 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <div className="relative flex flex-col items-center">
                <svg className="w-8 h-8 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                <span className="font-medium">View Profile</span>
              </div>
            </button>

            <button
              onClick={() => router.push('/crimes')}
              className="group relative bg-gradient-to-r from-purple-600 to-purple-700 text-white p-4 rounded-xl hover:from-purple-700 hover:to-purple-800 transition-all duration-300 shadow-lg hover:shadow-purple-500/25"
            >
              <div className="absolute inset-0 bg-black/20 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <div className="relative flex flex-col items-center">
                <svg className="w-8 h-8 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                <span className="font-medium">View All Crimes</span>
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}