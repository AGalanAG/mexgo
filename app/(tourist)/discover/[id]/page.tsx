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
    name: 'Palacio de Bellas Artes',
    rating: 4.8,
    user_ratings_total: 12500,
    address: 'Av. Juárez S/N, Centro Histórico, CDMX',
    description: 'The Palacio de Bellas Artes is the most important cultural center in Mexico City as well as the rest of the country of Mexico. It is located on the east side of the historic center of Mexico City next to the Alameda Central park.',
    opening_hours: ['Mon: Closed', 'Tue-Sun: 10:00 - 18:00'],
    photos: [
      'https://images.unsplash.com/photo-1518638150340-f706e86654de?w=1200&q=80',
      'https://images.unsplash.com/photo-1585464231875-d9ef1f5ad396?w=800&q=80'
    ]
  },
  // Default for others
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

      <main className="pt-20 pb-20">
        {/* Back Button */}
        <div className="max-w-5xl mx-auto px-4 py-4">
          <button 
            onClick={() => router.back()}
            className="flex items-center gap-2 text-[var(--primary)] font-bold hover:opacity-70 transition-opacity"
          >
            <ArrowBackIcon fontSize="small" /> Back to Discover
          </button>
        </div>

        {/* Hero Gallery (Simplified for now) */}
        <section className="w-full h-[300px] md:h-[450px] relative overflow-hidden px-4 max-w-7xl mx-auto">
          <div 
            className="w-full h-full rounded-[var(--radius-xl)] shadow-lg bg-cover bg-center"
            style={{ backgroundImage: `url(${place.photos[0]})` }}
          >
            <div className="absolute inset-0 bg-black/10 rounded-[var(--radius-xl)]"></div>
          </div>
        </section>

        {/* Content Section */}
        <section className="max-w-5xl mx-auto px-6 mt-8">
          <div className="flex flex-col md:flex-row justify-between items-start gap-8">
            
            {/* Left Column: Info */}
            <div className="flex-1">
              <h1 className="text-3xl md:text-4xl font-black text-[var(--primary)] mb-2" style={{ fontFamily: 'var(--font-display, inherit)' }}>
                {place.name}
              </h1>
              
              {/* Rating Section (Google Places Style) */}
              <div className="flex items-center gap-2 mb-6">
                <div className="flex text-yellow-400">
                  {[...Array(5)].map((_, i) => (
                    <StarIcon key={i} fontSize="small" className={i < Math.floor(place.rating) ? 'text-yellow-400' : 'text-gray-200'} />
                  ))}
                </div>
                <span className="font-bold text-gray-700">{place.rating}</span>
                <span className="text-gray-400 text-sm">({place.user_ratings_total.toLocaleString()} reviews)</span>
              </div>

              <p className="text-gray-600 leading-relaxed mb-8">
                {place.description}
              </p>

              {/* Photos Grid Placeholder */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
                {place.photos.map((photo, idx) => (
                  <div key={idx} className="aspect-square rounded-xl bg-gray-100 overflow-hidden shadow-sm">
                    <img src={photo} alt={`${place.name} ${idx}`} className="w-full h-full object-cover" />
                  </div>
                ))}
              </div>
            </div>

            {/* Right Column: Details Card */}
            <aside className="w-full md:w-[320px] bg-[var(--background)] p-6 rounded-[var(--radius-xl)] border border-gray-100 shadow-sm sticky top-24">
              <h4 className="font-bold text-[var(--primary)] mb-4 uppercase tracking-wider text-xs">Information</h4>
              
              <div className="space-y-6">
                {/* Address */}
                <div className="flex gap-3">
                  <LocationOnIcon className="text-[var(--color-accent)]" fontSize="small" />
                  <div>
                    <p className="text-xs font-bold text-gray-500 uppercase mb-1">Address</p>
                    <p className="text-sm text-gray-700 font-medium">{place.address}</p>
                  </div>
                </div>

                {/* Hours */}
                <div className="flex gap-3">
                  <AccessTimeIcon className="text-[var(--color-accent)]" fontSize="small" />
                  <div>
                    <p className="text-xs font-bold text-gray-500 uppercase mb-1">Opening Hours</p>
                    <ul className="text-sm text-gray-700 space-y-1">
                      {place.opening_hours.map((hour, i) => (
                        <li key={i}>{hour}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>

              <motion.button 
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full mt-8 bg-[var(--color-accent)] text-white font-bold py-3 rounded-xl shadow-md hover:brightness-110 transition-all"
              >
                Add to Itinerary
              </motion.button>
            </aside>
          </div>
        </section>
      </main>
    </div>
  );
}
