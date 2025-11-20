"use client";

import React, { useRef, useEffect, useState } from "react";
import mapboxgl from "mapbox-gl";
import MapboxGeocoder from "@mapbox/mapbox-gl-geocoder";
import "mapbox-gl/dist/mapbox-gl.css";
import "@mapbox/mapbox-gl-geocoder/dist/mapbox-gl-geocoder.css";
import { getAllCrimes } from "@/services/apiService";
import type { Crime } from "@/services/apiService";

const mapboxToken = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN;
if (mapboxToken) {
  mapboxgl.accessToken = mapboxToken;
} else {
  console.warn("Mapbox token not found in environment variables!");
}

const MapComponent = () => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<mapboxgl.Map | null>(null);
  const [crimes, setCrimes] = useState<Crime[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);

  useEffect(() => {
    const fetchCrimes = async () => {
      try {
        const crimeData = await getAllCrimes();
        console.log("Fetched Crimes:", crimeData);
        
    const userLat = userLocation ? userLocation[1] : 0;
    const userLon = userLocation ? userLocation[0] : 0;
    const filteredCrimes = crimeData.filter(crime => {
        const distance = haversine(userLat, userLon, crime.latitude, crime.longitude);
        return distance <= 1;
    });
    setCrimes(filteredCrimes);
    
      } catch (err) {
        console.error("Error fetching crimes:", err);
      }
    };

    fetchCrimes();

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation([position.coords.longitude, position.coords.latitude]);
        },
        (err) => {
          console.warn("Error getting user location:", err);
        }
      );
    }
  }, []);

  useEffect(() => {
    if (!mapboxgl.accessToken) {
      setError("Mapbox access token is missing. Please check your .env.local file.");
      return;
    }
    if (!mapContainerRef.current || !userLocation) return;

    try {
      const mapInstance = new mapboxgl.Map({
        container: mapContainerRef.current,
        style: "mapbox://styles/mapbox/streets-v11",
        center: userLocation,
        zoom: 11,
      });

      mapInstance.addControl(new mapboxgl.NavigationControl(), "top-right");
      mapInstance.addControl(
        new mapboxgl.GeolocateControl({
          positionOptions: { enableHighAccuracy: true },
          trackUserLocation: true,
          showUserHeading: true,
        }),
        "top-right"
      );

      const geocoder = new MapboxGeocoder({
        accessToken: mapboxgl.accessToken,
        mapboxgl: mapboxgl,
        marker: false,
        placeholder: "Search for a location...",
      });
      mapInstance.addControl(geocoder, "top-left");

      crimes.forEach((crime) => {
        if (crime.latitude && crime.longitude) {
          new mapboxgl.Marker()
            .setLngLat([crime.longitude, crime.latitude])
            .setPopup(new mapboxgl.Popup().setHTML(`
              <div>
                <strong>${crime.crimeType}</strong>
                <p>${crime.description.substring(0, 100)}${crime.description.length > 100 ? "..." : ""}</p>
                <a href="/crimes/${crime.id}" style="color: #4F46E5; font-weight: 500;">View details</a>
              </div>
            `))
            .addTo(mapInstance);
        }
      });

      setMap(mapInstance);
      return () => mapInstance.remove();
    } catch (err) {
      console.error("Map initialization error:", err);
      setError(`Failed to initialize map: ${err instanceof Error ? err.message : String(err)}`);
    }
  }, [crimes, userLocation]);

  if (error) {
    return (
      <div className="flex items-center justify-center w-full h-full bg-red-50 p-4">
        <div className="text-red-500 text-center">
          <h3 className="font-bold text-lg mb-2">Map Error</h3>
          <p>{error}</p>
          <p className="text-sm mt-2">Check your console for more details.</p>
        </div>
      </div>
    );
  }

  return (
    <div ref={mapContainerRef} className="w-full h-full relative">
      {!map && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 bg-opacity-50">
          <div className="text-center">
            <div className="spinner-border animate-spin inline-block w-8 h-8 border-4 rounded-full text-indigo-600"></div>
            <p className="mt-2">Loading map...</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default MapComponent;
