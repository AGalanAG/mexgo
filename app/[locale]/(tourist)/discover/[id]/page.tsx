'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { useRouter } from '@/i18n/routing';
import Navbar from '@/components/tourist/Navbar';
import type { NegocioConScore, ItineraryStop } from '@/types/types';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import StarIcon from '@mui/icons-material/Star';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import { motion } from 'framer-motion';
import MapboxMap from '@/components/tourist/MapboxMap';
import { getStoredAccessToken } from '@/lib/client-auth';

/**
 * Interface for place details
 */
interface PlaceDetails {
  id: string;
  name: string;
  rating: number;
  user_ratings_total: number;
  address: string;
  description: string;
  opening_hours: string[];
  photos: string[];
  lng: number;
  lat: number;
}

export default function PlaceDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [place, setPlace] = useState<PlaceDetails | null>(null);
  const [adding, setAdding] = useState(false);
  const [addError, setAddError] = useState('');

  async function handleAddToItinerary() {
    if (!place) return;
    setAdding(true);
    setAddError('');

    try {
      const token = getStoredAccessToken();
      const today = new Date().toISOString().split('T')[0];

      if (token) {
        const res = await fetch('/api/itinerary', {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({ negocio_id: place.id, nombre: place.name, dia: today, hora: '10:00' }),
        });
        if (!res.ok) {
          const data = await res.json() as { error?: { message?: string } };
          setAddError(data.error?.message || 'No se pudo agregar');
          setAdding(false);
          return;
        }
        // Keep localStorage in sync so ChatUI / Gemini sees the new stop
        const resData = await res.json() as { ok: boolean; data?: ItineraryStop };
        if (resData.ok && resData.data) {
          const raw = localStorage.getItem('mexgo_itinerary');
          const itinerary: ItineraryStop[] = raw ? JSON.parse(raw) : [];
          localStorage.setItem('mexgo_itinerary', JSON.stringify([...itinerary, resData.data]));
        }
      } else {
        // Sin token: solo localStorage
        const raw = localStorage.getItem('mexgo_itinerary');
        const itinerary: ItineraryStop[] = raw ? JSON.parse(raw) : [];
        if (itinerary.some(s => s.businessProfileId === place.id)) {
          router.push('/trips');
          return;
        }
        const newStop: ItineraryStop = {
          id: `stop-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
          itineraryId: 'local',
          routeDate: today,
          stopOrder: itinerary.length + 1,
          stopType: 'BUSINESS',
          businessProfileId: place.id,
          label: place.name,
          startTime: '10:00',
          latitude: Number(place.lat),
          longitude: Number(place.lng),
          createdAt: new Date().toISOString(),
        };
        localStorage.setItem('mexgo_itinerary', JSON.stringify([...itinerary, newStop]));
      }

      router.push('/trips');
    } catch (err) {
      console.error('Error adding to itinerary:', err);
      setAddError('No se pudo agregar al itinerario. Intenta de nuevo.');
      setAdding(false);
    }
  }

  useEffect(() => {
    function applyNegocio(found: NegocioConScore) {
      setPlace({
        id: found.id,
        name: found.businessName,
        rating: 4.5,
        user_ratings_total: found.score ?? 0,
        address: `${found.neighborhood}, ${found.boroughCode}`,
        description: found.businessDescription,
        opening_hours: found.operationDaysHours
          ? found.operationDaysHours.split(',').map(h => h.trim())
          : ['Horario no disponible'],
        photos: found.coverImageUrl
          ? [found.coverImageUrl]
          : ['https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=1200&q=80'],
        lng: found.longitude,
        lat: found.latitude,
      });
    }

    // Try localStorage first (fast path)
    const stored = localStorage.getItem('mexgo_recommendations');
    if (stored) {
      const recommendations: NegocioConScore[] = JSON.parse(stored);
      const found = recommendations.find(r => r.id === id);
      if (found) { applyNegocio(found); return; }
    }

    // Fallback: fetch from API when navigating directly to this URL
    fetch('/api/directory/businesses')
      .then(r => r.json())
      .then((payload: { ok: boolean; data?: { items?: Array<{ businessId: string; businessName: string; businessDescription: string; borough: string; neighborhood: string; latitude: number; longitude: number; operationDaysHours: string | null; coverImageUrl: string | null; publicScore?: number }> } }) => {
        if (!payload.ok) return;
        const item = (payload.data?.items ?? []).find(b => b.businessId === id);
        if (!item) return;
        applyNegocio({
          id: item.businessId,
          businessRequestId: item.businessId,
          ownerUserId: 'public-directory',
          businessName: item.businessName,
          businessDescription: item.businessDescription,
          boroughCode: item.borough,
          neighborhood: item.neighborhood,
          latitude: Number(item.latitude),
          longitude: Number(item.longitude),
          locationSource: 'directory',
          operationDaysHours: item.operationDaysHours ?? 'Horario no disponible',
          socialLinks: [],
          coverImageUrl: item.coverImageUrl ?? undefined,
          isActive: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          score: Number(item.publicScore ?? 0),
          reasons: [],
          estimatedWalkMinutes: 10,
        });
      })
      .catch(() => { /* leave spinner */ });
  }, [id]);

  if (!place) {
    return (
      <div className="flex flex-col min-h-screen bg-white">
        <Navbar  />
        <main className="pt-32 flex flex-col items-center justify-center">
          <div className="w-12 h-12 border-4 border-[var(--primary)] border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-[var(--primary)] font-black uppercase tracking-widest text-xs">Cargando detalles...</p>
        </main>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-white">
      {/* Navbar fija */}
      <Navbar  />

      <main className="pt-24 pb-16 px-4 bg-[var(--background)]">
        {/* Navigation */}
        <div className="max-w-5xl mx-auto mb-6">
          <button 
            onClick={() => router.back()}
            className="group flex items-center gap-2 text-[var(--primary)] font-bold hover:text-[var(--light-blue)] transition-colors text-xs uppercase tracking-widest"
          >
            <ArrowBackIcon sx={{ fontSize: 18 }} className="group-hover:-translate-x-1 transition-transform" /> 
            Back
          </button>
        </div>

        {/* Premium Compact Container */}
        <section className="max-w-5xl mx-auto">
          {/* Header Section */}
          <div className="text-center mb-10">
            <h1 className="text-2xl md:text-5xl font-black text-[var(--primary)] mb-3 tracking-tight" style={{ fontFamily: 'var(--font-display, inherit)' }}>
              {place.name}
            </h1>
            <div className="flex items-center justify-center gap-2">
              <div className="flex text-[var(--secondary)]">
                {[...Array(5)].map((_, i) => (
                  <StarIcon key={i} sx={{ fontSize: 18 }} className={i < Math.floor(place.rating) ? 'text-[var(--secondary)]' : 'text-gray-200'} />
                ))}
              </div>
              <span className="font-bold text-[var(--primary)] text-sm">{place.rating}</span>
              <span className="text-gray-400 text-xs font-medium">({place.user_ratings_total.toLocaleString()} reviews)</span>
            </div>
          </div>

          {/* Symmetrical 50/50 Content Block */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-0 shadow-2xl rounded-[2rem] overflow-hidden bg-white border border-gray-100">
            
            {/* Left: Main Visual */}
            <div className="relative h-[300px] md:h-[450px] lg:h-[550px]">
              <img 
                src={place.photos[0]} 
                alt={place.name} 
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"></div>
              <div className="absolute bottom-6 left-6 right-6">
                <p className="text-white text-sm italic font-medium leading-relaxed opacity-90">
                  "{place.description}"
                </p>
              </div>
            </div>

            {/* Right: Integrated Info & Action */}
            <div className="p-6 md:p-12 flex flex-col justify-between bg-white border-l border-gray-50 h-auto lg:h-[550px]">
              <div>
                <h4 className="text-[var(--primary)] font-black uppercase tracking-[0.2em] text-[10px] mb-8 border-b border-gray-100 pb-2">Business Details</h4>
                
                <div className="space-y-8">
                  <div className="flex items-start gap-5">
                    <div className="mt-1 bg-[var(--background)] p-2.5 rounded-lg text-[var(--primary)] border border-gray-100">
                      <LocationOnIcon sx={{ fontSize: 20 }} />
                    </div>
                    <div>
                      <p className="text-[9px] font-black text-gray-400 uppercase mb-1 tracking-wider">Location</p>
                      <p className="text-sm text-gray-700 font-bold leading-tight">{place.address}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-5">
                    <div className="mt-1 bg-[var(--background)] p-2.5 rounded-lg text-[var(--primary)] border border-gray-100">
                      <AccessTimeIcon sx={{ fontSize: 20 }} />
                    </div>
                    <div>
                      <p className="text-[9px] font-black text-gray-400 uppercase mb-1 tracking-wider">Service Hours</p>
                      <div className="grid grid-cols-2 gap-x-4 gap-y-1 mt-1">
                        {place.opening_hours.map((hour, i) => (
                          <p key={i} className="text-[11px] text-gray-600 font-semibold">{hour}</p>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                {/* Interactive Map */}
                <div className="w-full h-[120px] md:h-[140px] rounded-2xl overflow-hidden border border-gray-100 shadow-inner mt-4 lg:mt-0">
                  <MapboxMap
                    center={[place.lng, place.lat]}
                    zoom={15}
                    markers={[{ lng: place.lng, lat: place.lat, label: place.name, color: '#004891' }]}
                    className="w-full h-full"
                  />
                </div>

                {addError && (
                  <p className="text-red-500 text-xs font-bold text-center">{addError}</p>
                )}
                <motion.button
                  onClick={handleAddToItinerary}
                  disabled={adding}
                  whileHover={{ scale: adding ? 1 : 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full bg-[var(--primary)] text-white font-black py-4 rounded-xl shadow-lg transition-all text-xs uppercase tracking-[0.2em] disabled:opacity-60"
                >
                  {adding ? 'Agregando...' : 'Agregar al Itinerario'}
                </motion.button>
              </div>
            </div>
          </div>
        </section>

        {/* Small Elegant Gallery: Centered */}
        <section className="max-w-5xl mx-auto mt-12 flex flex-wrap justify-center gap-4">
          {place.photos.map((photo, idx) => (
            <motion.div 
              key={idx} 
              whileHover={{ y: -5 }}
              className="w-[180px] aspect-[4/3] rounded-2xl overflow-hidden shadow-sm border border-white flex-shrink-0"
            >
              <img src={photo} alt={`${place.name} ${idx}`} className="w-full h-full object-cover" />
            </motion.div>
          ))}
        </section>
      </main>
    </div>
  );
}
