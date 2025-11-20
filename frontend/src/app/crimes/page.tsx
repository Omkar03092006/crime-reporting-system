"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { getAllCrimes, isAuthenticated } from '@/services/apiService';
import { Crime } from '@/services/apiService';
import { useRouter } from 'next/navigation';
import { getCurrentUser } from '@/services/authService';

export default function CrimesPage() {
  const router = useRouter();
  const [crimes, setCrimes] = useState<Crime[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [selectedCrime, setSelectedCrime] = useState<Crime | null>(null);

  useEffect(() => {
    const user = getCurrentUser();
    if (!user) {
      router.push('/login');
      return;
    }

    setIsLoggedIn(isAuthenticated());
    
    const fetchCrimes = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const crimeData = await getAllCrimes();
        setCrimes(Array.isArray(crimeData) ? crimeData : []);
      } catch (err: any) {
        console.error('Error fetching crimes:', err);
        if (err?.response?.status === 401) {
          router.push('/login');
          return;
        }
        setError(err?.response?.data?.message || err?.message || 'Failed to load crimes');
      } finally {
        setIsLoading(false);
      }
    };

    fetchCrimes();
  }, [router]);

  // Format date for display
  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Unknown date';
    const date = new Date(dateString);
    if (Number.isNaN(date.getTime())) return 'Unknown date';
    return date.toLocaleString();
  };

  // Get appropriate badge color based on crime type
  const getCrimeTypeBadgeColor = (crimeType: string | undefined) => {
    if (!crimeType) return 'bg-gray-900/50 text-gray-200 border-gray-700';
    
    switch (crimeType.toLowerCase()) {
      case 'theft':
        return 'bg-yellow-900/50 text-yellow-200 border-yellow-700';
      case 'assault':
        return 'bg-red-900/50 text-red-200 border-red-700';
      case 'burglary':
        return 'bg-orange-900/50 text-orange-200 border-orange-700';
      case 'vandalism':
        return 'bg-blue-900/50 text-blue-200 border-blue-700';
      case 'fraud':
        return 'bg-purple-900/50 text-purple-200 border-purple-700';
      case 'kidnapping':
        return 'bg-red-900/50 text-red-200 border-red-700';
      default:
        return 'bg-gray-900/50 text-gray-200 border-gray-700';
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-900 flex justify-center items-center">
        <div className="text-center">
          <div className="relative w-24 h-24 mb-8">
            <div className="absolute inset-0 rounded-full border-4 border-blue-500/30 animate-ping" />
            <div className="absolute inset-0 rounded-full border-4 border-red-500/30 animate-pulse" />
            <div className="absolute inset-2 rounded-full border-2 border-dashed border-white/20 animate-spin" />
          </div>
          <p className="text-gray-400 text-xl">Loading crimes...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
        <div className="bg-red-900/50 border border-red-700 text-red-200 px-6 py-4 rounded-lg max-w-lg w-full">
          <h3 className="text-lg font-semibold mb-2">Error Loading Crimes</h3>
          <p>{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 text-red-200 hover:text-white transition-colors flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row justify-between items-center mb-8 gap-4">
          <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-red-500">
            All Reported Crimes
          </h1>
          <div className="flex gap-4">
            <button
              onClick={() => router.push('/profile')}
              className="group relative bg-gradient-to-r from-blue-600 to-blue-700 text-white px-4 py-2 rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-300 shadow-lg hover:shadow-blue-500/25"
            >
              <div className="absolute inset-0 bg-black/20 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <div className="relative flex items-center">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                View Profile
              </div>
            </button>
            <button
              onClick={() => router.push('/report')}
              className="group relative bg-gradient-to-r from-red-600 to-red-700 text-white px-4 py-2 rounded-xl hover:from-red-700 hover:to-red-800 transition-all duration-300 shadow-lg hover:shadow-red-500/25"
            >
              <div className="absolute inset-0 bg-black/20 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <div className="relative flex items-center">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Report Crime
              </div>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {crimes.map((crime) => (
            <div key={crime?.id} className="group bg-black/50 backdrop-blur-sm rounded-xl p-6 border border-gray-800 shadow-2xl hover:shadow-xl hover:shadow-blue-500/10 transition-all duration-300">
              <div className="flex items-center justify-between mb-4">
                <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getCrimeTypeBadgeColor(crime?.crimeType)}`}>
                  {crime?.crimeType || 'Unknown'}
                </span>
                <span className="text-gray-400 text-sm">
                  ID: #{crime?.id}
                </span>
              </div>
              <p className="text-gray-300 mb-4 line-clamp-2">{crime?.description || 'No description available'}</p>
              <div className="space-y-3 text-sm mb-4">
                <div className="flex items-start text-gray-400">
                  <svg className="w-5 h-5 mr-2 mt-0.5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <span>
                    <div className="font-medium text-gray-300">Location</div>
                    <div>{crime?.location || 'Location not specified'}</div>
                  </span>
                </div>
                <div className="flex items-start text-gray-400">
                  <svg className="w-5 h-5 mr-2 mt-0.5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <span>
                    <div className="font-medium text-gray-300">Reported On</div>
                    <div>{formatDate(crime?.reportedAt || crime?.createdAt)}</div>
                  </span>
                </div>
              </div>
              <button
                onClick={() => router.push(`/crimes/${crime?.id}`)}
                className="w-full group-hover:bg-blue-600/20 border border-blue-500/30 text-blue-400 hover:text-blue-300 px-4 py-2 rounded-lg transition-all duration-300 flex items-center justify-center gap-2 mt-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
                View Details
              </button>
            </div>
          ))}
        </div>

        {crimes.length === 0 && !isLoading && !error && (
          <div className="text-center py-12">
            <div className="w-20 h-20 mx-auto mb-4 text-gray-400">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                  d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M12 12h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-300 mb-2">No Crimes Reported Yet</h3>
            <p className="text-gray-400 mb-6">Be the first to report a crime in your area.</p>
            <button
              onClick={() => router.push('/report')}
              className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-xl 
                hover:bg-blue-700 transition-all duration-300 shadow-lg"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Report a Crime
            </button>
          </div>
        )}
      </div>

      {selectedCrime && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-gray-900 rounded-xl max-w-2xl w-full p-6 border border-gray-800 shadow-2xl">
            <div className="flex justify-between items-start mb-4">
              <h2 className="text-2xl font-bold text-white">{selectedCrime.crimeType}</h2>
              <button
                onClick={() => setSelectedCrime(null)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}