"use client";

import React, { useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { getAllCrimes } from "@/services/apiService";

const mapboxToken = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN;
if (mapboxToken) {
  mapboxgl.accessToken = mapboxToken;
} else {
  console.warn("Mapbox token not found in environment variables!");
}

const CrimeDetailMap = () => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  
    const [userLocation, setUserLocation] = useState<[number, number] | null>(null);

    useEffect(() => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    setUserLocation([position.coords.longitude, position.coords.latitude]);
                },
                (error) => {
                    console.error("Error getting location:", error.message);
                    setError("Location access denied. Enable GPS and reload.");
                }
            );
        } else {
            setError("Geolocation is not supported by this browser.");
        }
    }, []);
    
  const [crimes, setCrimes] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!mapboxgl.accessToken) {
      setError("Mapbox access token is missing.");
      return;
    }
    if (!mapContainerRef.current) return;

    const map = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: "mapbox://styles/mapbox/streets-v11",
      center: [78.9629, 20.5937],
      zoom: 4,
    });

    map.addControl(new mapboxgl.NavigationControl(), "top-right");

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const userCoords: [number, number] = [
            position.coords.longitude,
            position.coords.latitude,
          ];
          setUserLocation(userCoords);
          map.setCenter(userCoords);
          map.setZoom(14);
          new mapboxgl.Marker().setLngLat(userCoords).addTo(map);
          fetchNearbyCrimes(userCoords);
        },
        (error) => {
          console.error("Geolocation error:", error);
          let errorMessage = "Unknown error retrieving location.";
          if (error.code === 1) {
            errorMessage = "Location access denied. Please enable location permissions.";
          } else if (error.code === 2) {
            errorMessage = "Location unavailable. Try again later.";
          } else if (error.code === 3) {
            errorMessage = "Location request timed out. Move to an open area and retry.";
          }
          setError(errorMessage);
        }
      );
    } else {
      setError("Geolocation is not supported by your browser.");
    }

    mapRef.current = map;
    return () => map.remove();
  }, []);

  const fetchNearbyCrimes = async (userCoords: [number, number]) => {
    try {
      const response = await getAllCrimes();
      setCrimes(response);
      addMarkers(response);
    } catch (err) {
      setError("Failed to fetch crime data.");
    }
  };

  const addMarkers = (filteredCrimes: any[]) => {
    if (!mapRef.current) return;
    filteredCrimes.forEach((crime) => {
      new mapboxgl.Marker()
        .setLngLat([crime.longitude, crime.latitude])
        .setPopup(new mapboxgl.Popup().setText(crime.crimeType))
        .addTo(mapRef.current!);
    });
  };

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Nearby Crimes</h2>
      {error && <p className="text-red-500">{error}</p>}
      <div ref={mapContainerRef} className="w-full h-64 border rounded" />
    </div>
  );
};

export default CrimeDetailMap;