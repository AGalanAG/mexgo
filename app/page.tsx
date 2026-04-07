import React from 'react';
import Navbar from '@/components/tourist/Navbar';
import SearchBar from '@/components/tourist/SearchBar';
import RecommendationsCarousel from '@/components/tourist/RecommendationsCarousel';
import ItineraryCard from '@/components/tourist/ItineraryCard';
import Footer from '@/components/tourist/Footer';

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      
      <main className="flex-1 mt-16">
        {/* Hero & Search Section */}
        <section className="bg-gradient-to-b from-white to-background-main py-12">
          <div className="container-responsive">
            <div className="text-center mb-10">
              <h1 className="text-4xl md:text-5xl font-bold mb-4">
                Explora el corazón de México
              </h1>
              <p className="text-lg text-text-secondary max-w-2xl mx-auto">
                Descubre destinos únicos, vive experiencias auténticas y crea recuerdos inolvidables con MexGo.
              </p>
            </div>
            <SearchBar />
          </div>
        </section>
        
        {/* Recommendations Section */}
        <RecommendationsCarousel />
        
        {/* Itinerary Section */}
        <ItineraryCard />
      </main>
      
      <Footer />
    </div>
  );
}
