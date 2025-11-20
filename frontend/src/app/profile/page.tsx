// Modify this file: /app/profile/page.tsx

'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getCurrentUser, logout } from '@/services/authService';
import { getUserCrimes, Crime } from '@/services/apiService';

const ProfilePage = () => {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [locationAccess, setLocationAccess] = useState<boolean>(false);
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [userCrimes, setUserCrimes] = useState<Crime[]>([]);
  const [userStats, setUserStats] = useState({ total: 0, active: 0 });
  const [notificationsEnabled, setNotificationsEnabled] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    return localStorage.getItem('notificationsEnabled') === 'true';
  });
  const [emergencyContact, setEmergencyContact] = useState<string>(() => {
    if (typeof window === 'undefined') return '';
    return localStorage.getItem('emergencyContact') || '';
  });
  const [savingPrefs, setSavingPrefs] = useState(false);

  useEffect(() => {
    const currentUser = getCurrentUser();
    if (!currentUser) {
      router.push('/login');
      return;
    }
    setUser(currentUser);
    
    // Check if location access is enabled
    const hasLocationAccess = localStorage.getItem('locationAccess') === 'true';
    setLocationAccess(hasLocationAccess);

    // If location access is enabled, get the saved location
    if (hasLocationAccess) {
      const savedLocation = localStorage.getItem('userLocation');
      if (savedLocation) {
        setLocation(JSON.parse(savedLocation));
      }
    }
  }, [router]);

  useEffect(() => {
    const loadUserCrimes = async () => {
      try {
        const crimes = await getUserCrimes();
        setUserCrimes(crimes);
        setUserStats({
          total: crimes.length,
          active: crimes.filter((crime) => (crime.status || '').toUpperCase() !== 'RESOLVED').length,
        });
      } catch (err) {
        console.error('Unable to load user crimes:', err);
      }
    };
    loadUserCrimes();
  }, []);

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  const requestLocationAccess = () => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const newLocation = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };
          setLocation(newLocation);
          setLocationAccess(true);
          localStorage.setItem('locationAccess', 'true');
          localStorage.setItem('userLocation', JSON.stringify(newLocation));
        },
        (error) => {
          console.error("Error getting location:", error.message);
          let errorMessage = "Could not access location. ";
          
          switch (error.code) {
            case error.PERMISSION_DENIED:
              errorMessage += "Please enable location access in your browser settings.";
              break;
            case error.POSITION_UNAVAILABLE:
              errorMessage += "Location information is unavailable.";
              break;
            case error.TIMEOUT:
              errorMessage += "Request timed out. Please try again.";
              break;
            default:
              errorMessage += "Please check your browser settings and try again.";
          }
          
          alert(errorMessage);
          setLocationAccess(false);
          localStorage.setItem('locationAccess', 'false');
          localStorage.removeItem('userLocation');
        },
        {
          enableHighAccuracy: true,
          timeout: 5000,
          maximumAge: 0
        }
      );
    } else {
      alert("Geolocation is not supported by your browser");
    }
  };

  const disableLocationAccess = () => {
    setLocationAccess(false);
    setLocation(null);
    localStorage.setItem('locationAccess', 'false');
    localStorage.removeItem('userLocation');
  };

  const handleSavePreferences = () => {
    setSavingPrefs(true);
    setTimeout(() => {
      localStorage.setItem('notificationsEnabled', notificationsEnabled ? 'true' : 'false');
      localStorage.setItem('emergencyContact', emergencyContact);
      setSavingPrefs(false);
    }, 500);
  };

  return (
    <div className="min-h-screen bg-gray-900 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header with actions */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 relative">
          <div className="relative">
            <h1 className="text-4xl font-bold text-white mb-2 relative z-10">Your Profile</h1>
            <div className="absolute -top-4 left-0 w-20 h-20 bg-blue-500/10 rounded-full filter blur-xl animate-pulse"></div>
            <div className="absolute -top-4 left-10 w-20 h-20 bg-purple-500/10 rounded-full filter blur-xl animate-pulse delay-100"></div>
          </div>
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => router.push('/')}
              className="group relative bg-gray-800 text-white px-4 py-2 rounded-xl hover:bg-gray-700 
              transition-all duration-300 shadow-lg flex items-center justify-center gap-2 overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10 opacity-0 
              group-hover:opacity-100 transition-opacity duration-300" />
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              Home
            </button>
            <button
              onClick={() => router.push('/crimes')}
              className="group relative bg-gray-800 text-white px-4 py-2 rounded-xl hover:bg-gray-700 
              transition-all duration-300 shadow-lg flex items-center justify-center gap-2 overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-green-500/10 to-emerald-500/10 opacity-0 
              group-hover:opacity-100 transition-opacity duration-300" />
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              View Crimes
            </button>
            <button
              onClick={handleLogout}
              className="group relative bg-gray-800 text-white px-4 py-2 rounded-xl hover:bg-gray-700 
              transition-all duration-300 shadow-lg flex items-center justify-center gap-2 overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-red-500/10 to-orange-500/10 opacity-0 
              group-hover:opacity-100 transition-opacity duration-300" />
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              Logout
            </button>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[260px_minmax(0,1.8fr)]">
          {/* Left column: snapshot + preferences */}
          <div className="space-y-4">
            {[
              { label: 'Total Reports', value: userStats.total, accent: 'from-blue-500/20 to-blue-900/30' },
              { label: 'Active Cases', value: userStats.active, accent: 'from-amber-500/20 to-amber-900/30' },
              { label: 'Nearby Alerts', value: locationAccess ? 'Live' : 'Off', accent: 'from-emerald-500/20 to-emerald-900/30' },
            ].map((card) => (
              <div
                key={card.label}
                className={`rounded-2xl border border-white/5 bg-gradient-to-br ${card.accent} p-4 shadow-lg`}
              >
                <p className="text-xs text-white/70">{card.label}</p>
                <p className="text-2xl font-semibold">{card.value}</p>
              </div>
            ))}

            {/* Preferences stacked below stats on the left */}
            <div className="space-y-4">
              <div className="bg-black/40 backdrop-blur-xl rounded-2xl border border-gray-800 shadow-2xl p-4 space-y-3">
                <div className="flex items-center gap-3">
                  <svg className="w-5 h-5 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 17h5l-1.405-1.405M15 17l-1.793 1.793a1 1 0 01-1.414 0L10 17m5 0l2-2m-3-6a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M18 10c0 4.418-6 8-6 8s-6-3.582-6-8a6 6 0 1112 0z"
                    />
                  </svg>
                  <div>
                    <h3 className="text-sm font-semibold text-white">Emergency Preferences</h3>
                    <p className="text-xs text-white/60">Get notified when incidents occur nearby.</p>
                  </div>
                </div>
                <label className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={notificationsEnabled}
                    onChange={(e) => setNotificationsEnabled(e.target.checked)}
                    className="h-4 w-4 rounded border-white/10 bg-gray-900 text-blue-500 focus:ring-blue-500"
                  />
                  <span className="text-xs text-white/80">Enable real-time alerts</span>
                </label>
                <div>
                  <label className="text-xs text-white/60 mb-1 block">Emergency contact number</label>
                  <input
                    type="tel"
                    value={emergencyContact}
                    onChange={(e) => setEmergencyContact(e.target.value)}
                    placeholder="Enter phone number"
                    className="w-full rounded-xl border border-white/10 bg-gray-900 px-3 py-2 text-sm text-white focus:border-blue-500 outline-none"
                  />
                </div>
                <button
                  onClick={handleSavePreferences}
                  disabled={savingPrefs}
                  className="rounded-xl bg-blue-600/80 hover:bg-blue-600 transition-colors text-white px-3 py-1.5 text-xs"
                >
                  {savingPrefs ? 'Saving...' : 'Save Preferences'}
                </button>
              </div>

              <div className="bg-black/40 backdrop-blur-xl rounded-2xl border border-gray-800 shadow-2xl p-4 space-y-3">
                <h3 className="text-sm font-semibold text-white">Need assistance?</h3>
                <p className="text-xs text-white/70">
                  Our safety desk is available 24x7 for urgent escalations. Share feedback or request support whenever
                  needed.
                </p>
                <div className="flex flex-col gap-2">
                  <button
                    onClick={() => router.push('/report')}
                    className="rounded-xl border border-white/20 px-3 py-1.5 text-xs text-white/90 hover:bg-white/10 transition"
                  >
                    Report anonymously
                  </button>
                  <button
                    onClick={() => window.open('tel:112')}
                    className="rounded-xl bg-red-600/80 hover:bg-red-600 px-3 py-1.5 text-xs font-semibold"
                  >
                    Emergency 112
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Right column: account, location, reports */}
          <div className="space-y-6">
        {/* Account Information Card */}
        <div className="bg-black/50 backdrop-blur-sm rounded-xl border border-gray-800 shadow-2xl p-6 transform hover:scale-[1.02] transition-all duration-300">
          <div className="flex items-center gap-3 mb-6">
            <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            <h2 className="text-xl font-semibold text-white">Account Information</h2>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">Name</label>
              <p className="text-base text-white bg-gray-800/50 rounded-lg px-4 py-2 border border-gray-700">
                {user?.name || 'Not provided'}
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">Email</label>
              <p className="text-base text-white bg-gray-800/50 rounded-lg px-4 py-2 border border-gray-700">
                {user?.email || 'Not provided'}
              </p>
            </div>
          </div>
        </div>

        {/* Location Settings Card */}
        <div className="bg-black/50 backdrop-blur-sm rounded-xl border border-gray-800 shadow-2xl p-6 transform hover:scale-[1.02] transition-all duration-300">
          <div className="flex items-center gap-3 mb-6">
            <svg className="w-6 h-6 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <h2 className="text-xl font-semibold text-white">Location Settings</h2>
          </div>
          <div className="space-y-4">
            <div className="flex items-center">
              {locationAccess ? (
                <div className="flex items-center text-green-400">
                  <svg className="h-5 w-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="text-base font-medium">Location access enabled</span>
                </div>
              ) : (
                <div className="flex items-center text-gray-400">
                  <svg className="h-5 w-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                  <span className="text-base font-medium">Location access disabled</span>
                </div>
              )}
            </div>

            {location && (
              <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4 animate-fadeIn">
                <p className="text-sm text-gray-400 mb-2">Your current location:</p>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-400">Latitude</p>
                    <p className="text-lg font-mono text-white">{location.lat.toFixed(6)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">Longitude</p>
                    <p className="text-lg font-mono text-white">{location.lng.toFixed(6)}</p>
                  </div>
                </div>
              </div>
            )}

            <div className="mt-4">
              {locationAccess ? (
                <button
                  onClick={disableLocationAccess}
                  className="bg-red-500/10 text-red-400 border border-red-500/20 px-4 py-2 rounded-lg font-medium 
                    hover:bg-red-500/20 transition-all duration-300 flex items-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  Disable Location Access
                </button>
              ) : (
                <button
                  onClick={requestLocationAccess}
                  className="bg-blue-500/10 text-blue-400 border border-blue-500/20 px-4 py-2 rounded-lg font-medium 
                    hover:bg-blue-500/20 transition-all duration-300 flex items-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  </svg>
                  Enable Location Access
                </button>
              )}
              <p className="mt-3 text-sm text-gray-400">
                {locationAccess 
                  ? "Your location will be used to show nearby crimes and make reporting easier."
                  : "Enable location access to see nearby crimes and quickly report incidents in your area."}
              </p>
            </div>
          </div>
        </div>

        {/* Recent Reports */}
        <div className="bg-black/40 backdrop-blur-xl rounded-2xl border border-gray-800 shadow-2xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-white">Recent Reports</h2>
            <button
              onClick={() => router.push('/report')}
              className="text-sm text-blue-300 hover:text-white transition-colors"
            >
              File new report
            </button>
          </div>
          {userCrimes.length === 0 ? (
            <p className="text-white/60">You haven&apos;t reported anything yet. Stay vigilant!</p>
          ) : (
            <div className="space-y-4">
              {userCrimes.slice(0, 4).map((crime) => (
                <div key={crime.id} className="border border-white/5 rounded-xl p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div>
                    <p className="text-white font-semibold">{crime.crimeType}</p>
                    <p className="text-sm text-white/60 line-clamp-2">{crime.description}</p>
                  </div>
                  <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                    <span className="text-xs uppercase tracking-widest text-white/60">
                      {(crime.status || 'Pending').replace(/_/g, ' ')}
                    </span>
                    <button
                      onClick={() => router.push(`/crimes/${crime.id}`)}
                      className="rounded-lg border border-white/10 px-4 py-2 text-sm text-white/80 hover:bg-white/10 transition"
                    >
                      View details
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;