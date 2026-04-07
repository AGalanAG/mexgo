import React from 'react';

interface PlaceCardProps {
  title: string;
  location: string;
  imageUrl: string;
}

const PlaceCard: React.FC<PlaceCardProps> = ({ title, location, imageUrl }) => {
  return (
    <div className="card-base w-64 flex-shrink-0 group">
      <div className="relative h-40 overflow-hidden">
        <img 
          src={imageUrl} 
          alt={title} 
          className="w-full h-full object-cover transition-transform group-hover:scale-110" 
        />
        <button 
          className="absolute top-3 right-3 p-2 bg-white/80 backdrop-blur-sm rounded-full text-gray-500 hover:text-red-500 transition-colors shadow-sm"
          title="Agregar a favoritos"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z" />
          </svg>
        </button>
      </div>
      <div className="p-4">
        <h3 className="text-primary font-bold text-lg mb-1 truncate">{title}</h3>
        <p className="text-text-secondary text-sm flex items-center gap-1">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" />
          </svg>
          {location}
        </p>
      </div>
    </div>
  );
};

export default PlaceCard;
