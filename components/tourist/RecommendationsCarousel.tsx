import React from 'react';
import PlaceCard from './PlaceCard';

const RecommendationsCarousel: React.FC = () => {
  // Mock data
  const recommendations = [
    { title: 'Chichén Itzá', location: 'Yucatán', imageUrl: 'https://placehold.co/400x300/004891/white?text=Chichen+Itza' },
    { title: 'Tulum', location: 'Quintana Roo', imageUrl: 'https://placehold.co/400x300/006341/white?text=Tulum' },
    { title: 'San Miguel de Allende', location: 'Guanajuato', imageUrl: 'https://placehold.co/400x300/FFD400/004891?text=San+Miguel' },
    { title: 'Oaxaca de Juárez', location: 'Oaxaca', imageUrl: 'https://placehold.co/400x300/E2001A/white?text=Oaxaca' },
  ];

  return (
    <section className="py-12 bg-background-main">
      <div className="container-responsive">
        <h2 className="text-2xl font-bold mb-6">Recomendaciones para ti</h2>
        
        <div className="flex gap-6 overflow-x-auto pb-6 no-scrollbar snap-x">
          {recommendations.map((place, idx) => (
            <div key={idx} className="snap-start">
              <PlaceCard {...place} />
            </div>
          ))}
        </div>
        
        <div className="mt-8 text-center">
          <button className="btn-primary">
            Descubrir más
          </button>
        </div>
      </div>
    </section>
  );
};

export default RecommendationsCarousel;
