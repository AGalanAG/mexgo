import React from 'react';

const ItineraryCard: React.FC = () => {
  return (
    <section className="py-12">
      <div className="container-responsive">
        <h2 className="text-2xl font-bold mb-6">Tu próximo itinerario</h2>
        <div className="card-base p-6 cursor-pointer border-l-4 border-secondary group relative">
          <div className="flex flex-col md:flex-row gap-6 items-center">
            <div className="w-full md:w-1/3 h-48 rounded-lg overflow-hidden">
              <img 
                src="https://placehold.co/600x400/004891/white?text=Itinerario+Maya" 
                alt="Itinerario" 
                className="w-full h-full object-cover group-hover:scale-105 transition-transform" 
              />
            </div>
            <div className="flex-1">
              <span className="inline-block px-3 py-1 bg-secondary/20 text-primary text-xs font-bold rounded-full mb-3 uppercase tracking-wider">
                Recomendado
              </span>
              <h3 className="text-2xl font-bold mb-2 text-primary">Ruta del Mundo Maya</h3>
              <p className="text-text-secondary mb-4 leading-relaxed">
                Explora las maravillas de la península de Yucatán en este viaje de 7 días. Incluye visitas a Chichén Itzá, cenotes sagrados y playas cristalinas.
              </p>
              <div className="flex gap-4 items-center">
                <span className="flex items-center gap-1 text-sm text-text-secondary">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                  </svg>
                  7 días
                </span>
                <span className="flex items-center gap-1 text-sm text-text-secondary">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" />
                  </svg>
                  Yucatán & Quintana Roo
                </span>
              </div>
            </div>
          </div>
          <div className="absolute top-6 right-6 opacity-0 group-hover:opacity-100 transition-opacity">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6 text-primary">
              <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
            </svg>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ItineraryCard;
