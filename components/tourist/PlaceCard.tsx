"use client";
import React, { useState } from 'react';
import { Heart, Plus, Calendar } from 'lucide-react';
import { motion } from 'framer-motion';

interface PlaceCardProps {
  title: string;
  location: string;
  imageUrl: string;
}

const PlaceCard: React.FC<PlaceCardProps> = ({ title, location, imageUrl }) => {
  const [isFavorite, setIsFavorite] = useState(false);
  const [inItinerary, setInItinerary] = useState(false);

  return (
    <div className="card-base w-full max-w-[280px] flex-shrink-0 group overflow-hidden">
      <div className="relative h-48 overflow-hidden">
        <img 
          src={imageUrl} 
          alt={title} 
          className="w-full h-full object-cover transition-transform group-hover:scale-110" 
        />
        
        {/* Heart / Favorite Button */}
        <button 
          onClick={() => setIsFavorite(!isFavorite)}
          className={`absolute top-3 right-3 p-2 rounded-full backdrop-blur-sm transition-all shadow-sm ${
            isFavorite ? 'bg-red-500 text-white' : 'bg-white/80 text-gray-500 hover:text-red-500'
          }`}
          title={isFavorite ? "Quitar de favoritos" : "Agregar a favoritos"}
        >
          <Heart className={`w-5 h-5 ${isFavorite ? 'fill-current' : ''}`} />
        </button>

        {/* Itinerary Slider Overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/70 to-transparent">
          <div className="flex items-center justify-between">
            <span className="text-white text-xs font-medium">Añadir al itinerario</span>
            <div 
              className={`relative w-12 h-6 rounded-full cursor-pointer transition-colors ${inItinerary ? 'bg-accent' : 'bg-white/30'}`}
              onClick={() => setInItinerary(!inItinerary)}
            >
              <motion.div 
                className="absolute top-1 left-1 w-4 h-4 bg-white rounded-full shadow-sm"
                animate={{ x: inItinerary ? 24 : 0 }}
                transition={{ type: 'spring', stiffness: 500, damping: 30 }}
              />
            </div>
          </div>
        </div>
      </div>
      
      <div className="p-4">
        <h3 className="text-primary font-bold text-lg mb-1 truncate" title={title}>{title}</h3>
        <p className="text-text-secondary text-sm flex items-center gap-1 mb-3">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" />
          </svg>
          <span className="truncate">{location}</span>
        </p>
        
        <div className="flex gap-2">
          <button className="flex-1 py-2 bg-background-main text-primary text-xs font-bold rounded hover:bg-primary hover:text-white transition-colors">
            Ver detalles
          </button>
        </div>
      </div>
    </div>
  );
};

export default PlaceCard;
