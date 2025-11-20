import { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

interface MapComponentProps {
  center?: [number, number];
  zoom?: number;
  markers?: Array<{
    longitude: number;
    latitude: number;
    crimeType: string;
    description: string;
  }>;
  onMarkerClick?: (marker: any) => void;
  onMapClick?: (lngLat: { lng: number; lat: number }) => void;
  showLocationButton?: boolean;
}

const MapComponent: React.FC<MapComponentProps> = ({
  center = [-0.127758, 51.507351], // Default to London
  zoom = 10,
  markers = [],
  onMarkerClick,
  onMapClick,
  showLocationButton = false,
}) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);

  useEffect(() => {
    if (!mapContainer.current) return;

    mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN || '';

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/dark-v11',
      center: center,
      zoom: zoom,
    });

    const mapInstance = map.current;

    // Add navigation controls
    mapInstance.addControl(new mapboxgl.NavigationControl());

    // Add markers
    markers.forEach((marker) => {
      const markerColor = getMarkerColor(marker.crimeType);
      
      // Create marker element
      const el = document.createElement('div');
      el.className = 'marker';
      el.style.backgroundColor = markerColor;
      el.style.width = '20px';
      el.style.height = '20px';
      el.style.borderRadius = '50%';
      el.style.border = '2px solid white';
      el.style.cursor = 'pointer';

      // Add popup
      const popup = new mapboxgl.Popup({ offset: 25 })
        .setHTML(`
          <div style="color: black;">
            <strong>${marker.crimeType}</strong>
            <p>${marker.description}</p>
          </div>
        `);

      // Add marker to map
      new mapboxgl.Marker(el)
        .setLngLat([marker.longitude, marker.latitude])
        .setPopup(popup)
        .addTo(mapInstance);

      if (onMarkerClick) {
        el.addEventListener('click', () => onMarkerClick(marker));
      }
    });

    if (onMapClick) {
      mapInstance.on('click', (e) => {
        onMapClick(e.lngLat);
      });
    }

    return () => {
      if (map.current) {
        map.current.remove();
      }
    };
  }, [center, zoom, markers, onMarkerClick, onMapClick]);

  const getMarkerColor = (crimeType: string): string => {
    switch (crimeType.toLowerCase()) {
      case 'theft':
        return '#EAB308'; // Yellow
      case 'assault':
        return '#DC2626'; // Red
      case 'burglary':
        return '#EA580C'; // Orange
      case 'vandalism':
        return '#2563EB'; // Blue
      case 'fraud':
        return '#9333EA'; // Purple
      case 'kidnapping':
        return '#DC2626'; // Red
      default:
        return '#6B7280'; // Gray
    }
  };

  const handleLocationClick = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const newLocation: [number, number] = [
            position.coords.longitude,
            position.coords.latitude,
          ];
          setUserLocation(newLocation);
          map.current?.flyTo({
            center: newLocation,
            zoom: 14,
            essential: true,
          });
        },
        (error) => {
          console.error('Error getting location:', error);
        }
      );
    }
  };

  return (
    <div className="relative w-full h-full">
      <div ref={mapContainer} className="w-full h-full rounded-lg" />
      {showLocationButton && (
        <button
          onClick={handleLocationClick}
          className="absolute top-2 right-2 bg-white/10 backdrop-blur-sm text-white px-3 py-2 rounded-lg 
            shadow-lg border border-white/20 hover:bg-white/20 transition-all duration-300 flex items-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
              d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
              d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          My Location
        </button>
      )}
    </div>
  );
};

export default MapComponent; 