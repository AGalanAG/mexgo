'use client';

import { useEffect, useRef } from 'react';

export interface MapMarker {
  lng: number;
  lat: number;
  label?: string;
  color?: string;
}

interface MapboxMapProps {
  center?: [number, number]; // [lng, lat]
  zoom?: number;
  markers?: MapMarker[];
  className?: string;
  onMapLoad?: (map: any) => void;
}

export default function MapboxMap({
  center = [-99.1620, 19.4194],
  zoom = 12,
  markers = [],
  className = '',
  onMapLoad,
}: MapboxMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
    if (!token) return;

    let cancelled = false;

    (async () => {
      const mapboxgl = (await import('mapbox-gl')).default;
      if (cancelled || !containerRef.current) return;

      mapboxgl.accessToken = token;

      const map = new mapboxgl.Map({
        container: containerRef.current,
        style: 'mapbox://styles/mapbox/light-v11',
        center,
        zoom,
        attributionControl: false,
      });

      mapRef.current = map;

      map.addControl(new mapboxgl.NavigationControl({ showCompass: false }), 'top-right');
      map.addControl(new mapboxgl.AttributionControl({ compact: true }), 'bottom-right');

      map.on('load', () => {
        if (cancelled) return;

        markers.forEach((marker) => {
          const el = document.createElement('div');
          el.style.cssText = `
            width: 14px;
            height: 14px;
            border-radius: 50%;
            background: ${marker.color ?? '#004891'};
            border: 2.5px solid white;
            box-shadow: 0 2px 8px rgba(0,0,0,0.35);
            cursor: pointer;
          `;

          const m = new mapboxgl.Marker(el).setLngLat([marker.lng, marker.lat]);

          if (marker.label) {
            m.setPopup(
              new mapboxgl.Popup({ offset: 18, closeButton: false })
                .setText(marker.label)
            );
            el.addEventListener('mouseenter', () => m.getPopup()?.addTo(map));
            el.addEventListener('mouseleave', () => m.getPopup()?.remove());
          }

          m.addTo(map);
        });

        onMapLoad?.(map);
      });
    })();

    return () => {
      cancelled = true;
      mapRef.current?.remove();
      mapRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const hasToken = !!process.env.NEXT_PUBLIC_MAPBOX_TOKEN;

  if (!hasToken) {
    return (
      <div className={`relative overflow-hidden bg-gray-100 ${className}`}>
        <div
          className="absolute inset-0 bg-cover bg-center opacity-80"
          style={{
            backgroundImage:
              "url('https://maps.wikimedia.org/osm-intl/12/19.4194/-99.1620.png')",
          }}
        />
        <div className="absolute bottom-3 right-3 bg-white/90 backdrop-blur px-3 py-1 rounded-full text-[9px] font-bold text-gray-500 uppercase tracking-widest shadow">
          OpenStreetMap · preview
        </div>
      </div>
    );
  }

  return <div ref={containerRef} className={`w-full h-full ${className}`} />;
}
