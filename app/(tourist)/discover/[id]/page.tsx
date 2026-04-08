'use client';

import React from 'react';
import { useParams, useRouter } from 'next/navigation';
import Navbar from '@/components/tourist/Navbar';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import StarIcon from '@mui/icons-material/Star';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import { motion } from 'framer-motion';

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
}

/**
 * Mock data for the specific place (this would come from the backend/lib)
 */
const MOCK_PLACES_DETAILS: Record<string, PlaceDetails> = {
  '1': {
    id: '1',
    name: 'Sabores de Antaño',
    rating: 4.7,
    user_ratings_total: 842,
    address: 'Calle Colima 124, Colonia Roma Norte, CDMX',
    description: 'A traditional Mexican eatery where every dish tells a story. Specializing in mole and handmade tortillas, this local gem offers an authentic experience away from the tourist traps.',
    opening_hours: ['Mon: 13:00 - 22:00', 'Tue-Sat: 09:00 - 22:00', 'Sun: 09:00 - 18:00'],
    photos: [
      'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=1200&q=80',
      'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800&q=80',
      'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=800&q=80'
    ]
  },
};

export default function PlaceDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  
  // Get data or use fallback
  const place = MOCK_PLACES_DETAILS[id as string] || MOCK_PLACES_DETAILS['1'];

  return (
    <div className="flex flex-col min-h-screen bg-white">
      {/* Navbar fija */}
      <Navbar variant="light" />

      <main className="pt-24 pb-16 px-4 bg-[var(--background)]">
        {/* Navigation & Breadcrumb */}
        <div className="max-w-5xl mx-auto mb-6 flex justify-between items-center">
          <button 
            onClick={() => router.back()}
            className="group flex items-center gap-2 text-[var(--primary)] font-bold hover:text-[var(--light-blue)] transition-colors text-xs uppercase tracking-widest"
          >
            <ArrowBackIcon sx={{ fontSize: 18 }} className="group-hover:-translate-x-1 transition-transform" /> 
            Back
          </button>
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Discover / {place.name}</span>
        </div>

        {/* Premium Compact Container */}
        <section className="max-w-5xl mx-auto">
          {/* Header Section */}
          <div className="text-center mb-10">
            <h1 className="text-3xl md:text-5xl font-black text-[var(--primary)] mb-3 tracking-tight" style={{ fontFamily: 'var(--font-display, inherit)' }}>
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
            <div className="relative h-[450px] lg:h-[550px]">
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
            <div className="p-8 md:p-12 flex flex-col justify-between bg-white border-l border-gray-50 h-[450px] lg:h-[550px]">
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
                {/* Compact Map Integration */}
                <div className="w-full h-[140px] rounded-2xl overflow-hidden relative border border-gray-100 group shadow-inner">
                  <img 
                    src="https://api.mapbox.com/styles/v1/mapbox/light-v10/static/-99.1620,19.4194,14,0/500x200?access_token=none" 
                    className="w-full h-full object-cover grayscale-[50%] group-hover:grayscale-0 transition-all duration-700"
                    alt="Map Location"
                  />
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[var(--primary)] drop-shadow-lg">
                    <LocationOnIcon sx={{ fontSize: 32 }} />
                  </div>
                </div>

                <motion.button 
                  whileHover={{ scale: 1.02, backgroundColor: 'var(--medium-blue)' }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full bg-[var(--primary)] text-white font-black py-4 rounded-xl shadow-lg transition-all text-xs uppercase tracking-[0.2em]"
                >
                  Add to Itinerary
                </motion.button>
              </div>
            </div>
          </div>
        </section>

        {/* Small Elegant Gallery */}
        <section className="max-w-5xl mx-auto mt-12 grid grid-cols-4 gap-4">
          {place.photos.map((photo, idx) => (
            <motion.div 
              key={idx} 
              whileHover={{ y: -5 }}
              className="aspect-[4/3] rounded-2xl overflow-hidden shadow-sm border border-white"
            >
              <img src={photo} alt={`${place.name} ${idx}`} className="w-full h-full object-cover" />
            </motion.div>
          ))}
        </section>
      </main>
    </div>
  );
}
