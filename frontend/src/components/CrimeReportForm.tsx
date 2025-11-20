"use client";

import React, { useState, useEffect, useRef } from "react";
import mapboxgl from "mapbox-gl";
import MapboxGeocoder from "@mapbox/mapbox-gl-geocoder";
import "mapbox-gl/dist/mapbox-gl.css";
import "@mapbox/mapbox-gl-geocoder/dist/mapbox-gl-geocoder.css";
import { reportCrime } from "@/services/apiService";
import { getCurrentUser } from "@/services/authService";
import { useRouter } from "next/navigation";

// Move Mapbox initialization to client-side only
let mapboxToken: string | undefined;
if (typeof window !== 'undefined') {
  mapboxToken = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN;
  if (mapboxToken) {
    mapboxgl.accessToken = mapboxToken;
  } else {
    console.warn("Mapbox token not found in environment variables!");
  }
}

interface CrimeReportFormProps {
  onSuccess?: () => void;
}

const CrimeReportForm = ({ onSuccess }: CrimeReportFormProps) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [address, setAddress] = useState('');
  const crimeTypeOptions = [
    'Vandalism/तोड़फोड़',
    'Kidnapping/अपहरण',
    'Murder/हत्या',
    'Theft/चोरी',
    'Assault/हमला',
    'Fraud/धोखाधड़ी',
    'Robbery/डकैती',
    'Arson/आगजनी',
  ];

  const [selectedCrimeType, setSelectedCrimeType] = useState('');
  const [customCrimeType, setCustomCrimeType] = useState('');
  const [description, setDescription] = useState('');
  const [isClient, setIsClient] = useState(false);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const router = useRouter();

  // Handle client-side initialization
  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    // Check if user is authenticated
    const user = getCurrentUser();
    if (!user) {
      router.push('/login');
      return;
    }

    // Load saved location if available
    const savedLocation = localStorage.getItem('userLocation');
    if (savedLocation) {
      try {
        setLocation(JSON.parse(savedLocation));
      } catch (e) {
        console.warn('Failed to parse saved location');
      }
    }
  }, [router]);

  useEffect(() => {
    if (!isClient) return; // Only run on client-side

    if (!mapboxgl.accessToken) {
      setError("Mapbox access token is missing.");
      return;
    }
    if (!mapContainerRef.current) return;

    const map = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: "mapbox://styles/mapbox/streets-v11",
      center: [78.9629, 20.5937], // Default center (India)
      zoom: 4,
    });

    map.addControl(new mapboxgl.NavigationControl(), "top-right");

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const newLocation = { 
            lat: position.coords.latitude, 
            lng: position.coords.longitude 
          };
          setLocation(newLocation);
          new mapboxgl.Marker()
            .setLngLat([position.coords.longitude, position.coords.latitude])
            .addTo(map);
          map.flyTo({
            center: [position.coords.longitude, position.coords.latitude],
            zoom: 14,
          });
        },
        (error) => {
          setError("Geolocation is required to report a crime. Please enable it.");
        }
      );
    } else {
      setError("Geolocation is not supported by your browser.");
    }

    mapRef.current = map;
    return () => map.remove();
  }, [isClient]); // Only re-run when isClient changes

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (!location) {
        throw new Error('Please select a location on the map');
      }

      const finalCrimeType =
        selectedCrimeType === 'other'
          ? customCrimeType.trim()
          : selectedCrimeType;

      if (!finalCrimeType) {
        throw new Error('Please select or enter a crime type');
      }

      if (!description) {
        throw new Error('Please provide a description');
      }

      const crimeData = {
        crimeType: finalCrimeType,
        description,
        location: address || `${location.lat}, ${location.lng}`,
        latitude: location.lat,
        longitude: location.lng
      };

      await reportCrime(crimeData);
      
      // Clear form
      setSelectedCrimeType('');
      setCustomCrimeType('');
      setDescription('');
      setLocation(null);
      setAddress('');
      
      // Redirect to crimes page
      router.push('/crimes');
    } catch (err: any) {
      setError(err.message || 'Failed to report crime. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Report a Crime</h2>
      {error && <p className="text-red-500">{error}</p>}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-3">
          <select
            value={selectedCrimeType}
            onChange={(e) => setSelectedCrimeType(e.target.value)}
            className="w-full p-2 border rounded bg-white text-gray-900"
          >
            <option value="" disabled>
              Select crime type / अपराध का प्रकार चुनें
            </option>
            {crimeTypeOptions.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
            <option value="other">Other / अन्य</option>
          </select>

          {selectedCrimeType === 'other' && (
            <input
              type="text"
              placeholder="Enter crime type / अपराध का प्रकार दर्ज करें"
              value={customCrimeType}
              onChange={(e) => setCustomCrimeType(e.target.value)}
              className="w-full p-2 border rounded"
            />
          )}
        </div>
        <textarea
          placeholder="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full p-2 border rounded"
        />
        <p className="text-gray-600">Latitude: {location?.lat || "Fetching..."}</p>
        <p className="text-gray-600">Longitude: {location?.lng || "Fetching..."}</p>
        <div ref={mapContainerRef} className="w-full h-64 border rounded" />
        <button type="submit" className="w-full bg-blue-500 text-white p-2 rounded" disabled={loading}>
          {loading ? 'Submitting...' : 'Submit'}
        </button>
      </form>
    </div>
  );
};

export default CrimeReportForm;
