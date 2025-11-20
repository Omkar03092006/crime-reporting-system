"use client";

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { getCrimeById, isAuthenticated, deleteCrime } from '@/services/apiService';
import { Crime } from '@/services/apiService';
import dynamic from 'next/dynamic';
import { getCurrentUser } from '@/services/authService';
import 'mapbox-gl/dist/mapbox-gl.css';

// Import MapComponent with no SSR to avoid hydration issues
const MapComponent = dynamic(() => import('@/components/MapComponent'), {
  ssr: false,
  loading: () => (
    <div className="h-[300px] bg-gray-800/50 animate-pulse rounded-lg flex items-center justify-center">
      <div className="text-gray-400">Loading map...</div>
    </div>
  ),
});

export default function CrimeDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const [crime, setCrime] = useState<Crime | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);

  useEffect(() => {
    const user = getCurrentUser();
    setCurrentUser(user);

    const fetchCrime = async () => {
      if (!params?.id) return;
      
      try {
        const crimeId = parseInt(params.id as string);
        const crimeData = await getCrimeById(crimeId);
        setCrime(crimeData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load crime details');
        console.error('Error fetching crime:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCrime();
  }, [params?.id, router]);

  // Format date for display
  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Unknown date';
    const date = new Date(dateString);
    if (Number.isNaN(date.getTime())) return 'Unknown date';
    return date.toLocaleString();
  };

  // Get appropriate badge color based on crime type
  const getCrimeTypeBadgeColor = (crimeType: string) => {
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

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this crime report?')) {
      return;
    }

    try {
      setIsDeleting(true);
      await deleteCrime(parseInt(params.id as string));
      router.push('/crimes');
    } catch (err: any) {
      setError(err?.message || 'Failed to delete crime');
      setIsDeleting(false);
    }
  };

  // Debug information
  useEffect(() => {
    if (crime && currentUser) {
      console.log('Crime reportedBy:', crime.reportedBy);
      console.log('Current user:', currentUser);
    }
  }, [crime, currentUser]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-900 flex justify-center items-center">
        <div className="text-center">
          <div className="relative w-24 h-24 mb-8">
            <div className="absolute inset-0 rounded-full border-4 border-blue-500/30 animate-ping" />
            <div className="absolute inset-0 rounded-full border-4 border-red-500/30 animate-pulse" />
            <div className="absolute inset-2 rounded-full border-2 border-dashed border-white/20 animate-spin" />
          </div>
          <p className="text-gray-400 text-xl">Loading crime details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
        <div className="bg-red-900/50 border border-red-700 text-red-200 px-6 py-4 rounded-lg max-w-lg w-full">
          <h3 className="text-lg font-semibold mb-2">Error Loading Crime Details</h3>
          <p>{error}</p>
          <button
            onClick={() => router.back()}
            className="mt-4 text-red-200 hover:text-white transition-colors flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Crimes
          </button>
        </div>
      </div>
    );
  }

  if (!crime) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
        <div className="bg-yellow-900/50 border border-yellow-700 text-yellow-200 px-6 py-4 rounded-lg max-w-lg w-full">
          <h3 className="text-lg font-semibold mb-2">Crime Not Found</h3>
          <p>The requested crime could not be found.</p>
          <button
            onClick={() => router.back()}
            className="mt-4 text-yellow-200 hover:text-white transition-colors flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Crimes
          </button>
        </div>
      </div>
    );
  }

  // Check if the current user is the one who reported the crime
  const isOwnCrime = currentUser && crime.reportedBy && currentUser.id === crime.reportedBy.id;

  return (
    <div className="min-h-screen bg-gray-900 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Navigation and Actions */}
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={() => router.back()}
            className="group relative bg-gray-800 text-white px-4 py-2 rounded-xl hover:bg-gray-700 transition-all duration-300 shadow-lg flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Crimes
          </button>

          {isOwnCrime && (
            <button
              onClick={handleDelete}
              disabled={isDeleting}
              className="group relative bg-red-600 text-white px-4 py-2 rounded-xl hover:bg-red-700 transition-all duration-300 shadow-lg flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isDeleting ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                  Deleting...
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  Delete Report
                </>
              )}
            </button>
          )}
        </div>

        {/* Crime Details Card */}
        <div className="bg-black/50 backdrop-blur-sm rounded-xl border border-gray-800 shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="border-b border-gray-800 p-6">
            <div className="flex items-center justify-between mb-4">
              <span className={`px-4 py-2 rounded-full text-sm font-medium border ${getCrimeTypeBadgeColor(crime.crimeType)}`}>
                {crime.crimeType}
              </span>
              <span className="text-gray-400">ID: #{crime.id}</span>
            </div>
            <h1 className="text-3xl font-bold text-white">Crime Report Details</h1>
          </div>

          {/* Content */}
          <div className="p-6 space-y-6">
            {/* Description */}
            <div className="space-y-2">
              <h2 className="text-xl font-semibold text-white">Description</h2>
              <p className="text-gray-300">{crime.description}</p>
            </div>

            {/* Location Map */}
            {crime.latitude && crime.longitude && (
              <div className="space-y-2">
                <h2 className="text-xl font-semibold text-white">Location Map</h2>
                <div className="h-[300px] rounded-lg overflow-hidden">
                  <MapComponent
                    center={[crime.longitude, crime.latitude]}
                    zoom={15}
                    markers={[
                      {
                        longitude: crime.longitude,
                        latitude: crime.latitude,
                        crimeType: crime.crimeType,
                        description: crime.description,
                      },
                    ]}
                  />
                </div>
              </div>
            )}

            {/* Location Details */}
            <div className="space-y-2">
              <h2 className="text-xl font-semibold text-white">Location</h2>
              <div className="flex items-center text-gray-300">
                <svg className="w-5 h-5 mr-2 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                {crime.location || 'Location not specified'}
              </div>
              {crime.latitude && crime.longitude && (
                <div className="text-gray-400 mt-1">
                  Coordinates: {crime.latitude}, {crime.longitude}
                </div>
              )}
            </div>

            {/* Date Information */}
            <div className="space-y-2">
              <h2 className="text-xl font-semibold text-white">Timestamps</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <div className="text-gray-400">Reported On</div>
                  <div className="text-gray-300 flex items-center">
                    <svg className="w-5 h-5 mr-2 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    {formatDate(crime.reportedAt || crime.createdAt)}
                  </div>
                </div>
                {crime.updatedAt && (
                  <div className="space-y-1">
                    <div className="text-gray-400">Last Updated</div>
                    <div className="text-gray-300 flex items-center">
                      <svg className="w-5 h-5 mr-2 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      {formatDate(crime.updatedAt)}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Status */}
            <div className="space-y-2">
              <h2 className="text-xl font-semibold text-white">Status</h2>
              <div className="flex items-center text-gray-300">
                <svg className="w-5 h-5 mr-2 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {crime.status || 'Under Investigation'}
              </div>
            </div>

            {/* Reporter Information (only shown if it's the user's own crime) */}
            {isOwnCrime && (
              <div className="space-y-2">
                <h2 className="text-xl font-semibold text-white">Reporter Information</h2>
                <div className="flex items-center text-gray-300">
                  <svg className="w-5 h-5 mr-2 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  Reported by you
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}