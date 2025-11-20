'use client';

import { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import { getAllCrimes } from '@/services/apiService';
import { useRouter } from 'next/navigation';
import 'mapbox-gl/dist/mapbox-gl.css';

// Add custom CSS for Mapbox popups
const customPopupStyle = `
.mapboxgl-popup-content {
  padding: 16px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.15);
  min-width: 220px;
  background: white;
}

.mapboxgl-popup-close-button {
  font-size: 20px;
  padding: 4px 8px;
  color: #666;
  right: 4px;
  top: 4px;
}

.mapboxgl-popup-close-button:hover {
  color: #000;
  background: none;
}
`;

const mapboxToken = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN;

type Crime = {
  id: number;
  latitude: number;
  longitude: number;
  crimeType: string;
  description: string;
};

const HomeMap = () => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const markersRef = useRef<mapboxgl.Marker[]>([]);
  const [crimes, setCrimes] = useState<Crime[]>([]);
  const router = useRouter();

  // Add custom styles to head
  useEffect(() => {
    const styleElement = document.createElement('style');
    styleElement.textContent = customPopupStyle;
    document.head.appendChild(styleElement);

    return () => {
      document.head.removeChild(styleElement);
    };
  }, []);

  // Initialize map
  useEffect(() => {
    if (!mapboxToken || !mapContainerRef.current) {
      console.error('Map initialization failed: Missing token or container');
      return;
    }

    try {
      mapboxgl.accessToken = mapboxToken;
      
      const map = new mapboxgl.Map({
        container: mapContainerRef.current,
        style: 'mapbox://styles/mapbox/streets-v11',
        center: [78.9629, 20.5937],
        zoom: 4,
      });

      // Add navigation controls
      map.addControl(new mapboxgl.NavigationControl(), 'top-right');

      // Add geolocate control
      const geolocate = new mapboxgl.GeolocateControl({
        positionOptions: {
          enableHighAccuracy: true
        },
        trackUserLocation: true,
        showUserHeading: true
      });

      map.addControl(geolocate, 'top-right');

      // Wait for map to load before triggering geolocation
      map.on('load', () => {
        setTimeout(() => {
          geolocate.trigger();
        }, 1000);
      });

      mapRef.current = map;

      return () => {
        markersRef.current.forEach(marker => marker.remove());
        map.remove();
      };
    } catch (error) {
      console.error('Error initializing map:', error);
    }
  }, []);

  // Fetch crimes
  useEffect(() => {
    let isMounted = true;

    const fetchCrimes = async () => {
      try {
        const data = await getAllCrimes();
        if (isMounted) {
          setCrimes(Array.isArray(data) ? data : []);
        }
      } catch (error) {
        console.error('Error fetching crimes:', error);
        if (isMounted) {
          setCrimes([]);
        }
      }
    };

    fetchCrimes();

    return () => {
      isMounted = false;
    };
  }, []);

  // Update markers when crimes change
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !crimes.length) return;

    try {
      // Clear existing markers
      markersRef.current.forEach(marker => marker.remove());
      markersRef.current = [];

      // Add new markers
      crimes.forEach((crime) => {
        if (!crime.latitude || !crime.longitude) return;

        const popup = new mapboxgl.Popup({ 
          closeButton: true,
          maxWidth: '300px',
          className: 'custom-popup'
        })
        .setHTML(`
          <div class="p-4">
            <div class="bg-gray-100 px-3 py-1 rounded-full text-sm font-medium text-gray-800 mb-3">
              ${crime.crimeType || 'Unknown Crime'}
            </div>
            <p class="text-gray-700 text-base mb-4" style="line-height: 1.5;">
              ${crime.description || 'No description available'}
            </p>
            <button 
              onclick="window.location.href='/crimes/${crime.id}'"
              class="w-full bg-blue-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-600 transition-colors duration-200 shadow-sm"
              style="outline: none; border: none;"
            >
              View Details
            </button>
          </div>
        `);

        const marker = new mapboxgl.Marker({ 
          color: '#FF5252',
          scale: 0.8
        })
        .setLngLat([crime.longitude, crime.latitude])
        .setPopup(popup)
        .addTo(map);

        markersRef.current.push(marker);
      });
    } catch (error) {
      console.error('Error updating markers:', error);
    }
  }, [crimes]);

  return (
    <div className="w-full h-[400px] rounded-lg shadow-lg overflow-hidden mb-8">
      <div ref={mapContainerRef} className="w-full h-full" />
    </div>
  );
};

export default HomeMap; 