import Navbar from '@/components/tourist/Navbar';
import {getTranslations} from 'next-intl/server';

export default async function Home() {
  const t = await getTranslations('Home');

  return (
    <div className="flex flex-col min-h-screen w-full bg-white">
      
      {/* 1. SECCIÓN HERO */}
      <section 
        className="relative min-h-screen flex flex-col items-center justify-center bg-black/40 bg-blend-overlay"
        style={{ 
          backgroundImage: "url('/fondoLanding/angel-independencia-paseo-de-reforma.jpg')", 
          backgroundSize: 'cover', 
          backgroundPosition: 'center' 
        }}
      >
        {/* Componente Navbar Separado */}
        <Navbar />

        {/* Hero Content */}
        <div className="text-center text-white z-10 px-4 w-full max-w-4xl mt-16">
          <h1 className="text-5xl md:text-7xl font-extrabold mb-8 drop-shadow-lg text-white" 
              dangerouslySetInnerHTML={{ __html: t('hero.title') }} 
          />
          
          {/* Search Bar */}
          <div className="bg-white rounded-full p-2 flex items-center shadow-lg mb-8 max-w-3xl mx-auto border border-gray-200">
            <span className="text-gray-400 pl-4 pr-2">📍</span>
            <input 
              type="text" 
              placeholder={t('hero.searchPlaceholder')} 
              className="flex-1 bg-transparent outline-none text-black placeholder-gray-400"
            />
            <button className="p-3 bg-white text-gray-600 hover:text-black rounded-full">
              🔍
            </button>
          </div>

          <p className="text-sm md:text-base font-medium mb-6 drop-shadow-md">
            {t('hero.subtitle')}
          </p>

          <button className="bg-[#0ABF4F] hover:bg-[#005E3E] text-white px-8 py-3 rounded-md font-bold transition-colors shadow-lg">
            {t('hero.cta')}
          </button>
        </div>
      </section>

      {/* SECCIÓN OUR SERVICE */}
      <section className="py-24 bg-white text-center">
        <h2 className="text-4xl font-bold text-black mb-16">{t('services.title')}</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto px-4">
          <div className="bg-white p-10 flex flex-col items-center shadow-xl rounded-3xl border border-gray-100 hover:scale-105 transition-transform">
            <span className="text-5xl mb-6">✈️</span>
            <h3 className="font-bold text-xl mb-4 text-black">{t('services.item1.title')}</h3>
            <p className="text-gray-600 leading-relaxed">{t('services.item1.desc')}</p>
          </div>
          
          <div className="bg-white p-10 flex flex-col items-center shadow-xl rounded-3xl border border-gray-100 hover:scale-105 transition-transform">
            <span className="text-5xl mb-6">🏨</span>
            <h3 className="font-bold text-xl mb-4 text-black">{t('services.item2.title')}</h3>
            <p className="text-gray-600 leading-relaxed">{t('services.item2.desc')}</p>
          </div>
          
          <div className="bg-white p-10 flex flex-col items-center shadow-xl rounded-3xl border border-gray-100 hover:scale-105 transition-transform">
            <span className="text-5xl mb-6">🧭</span>
            <h3 className="font-bold text-xl mb-4 text-black">{t('services.item3.title')}</h3>
            <p className="text-gray-600 leading-relaxed">{t('services.item3.desc')}</p>
          </div>
        </div>

        <div className="mt-20 bg-[#F8F9FA] py-20 px-4 rounded-[4rem] mx-4 shadow-inner">
          <h2 className="text-3xl font-bold text-black mb-6" dangerouslySetInnerHTML={{ __html: t('bestService.title') }} />
          <p className="text-gray-600 max-w-2xl mx-auto mb-10 text-lg">
            {t('bestService.subtitle')}
          </p>
          <div className="flex justify-center items-center gap-6">
            <button className="w-12 h-12 rounded-full bg-black text-white hover:bg-gray-800 transition-colors shadow-md flex items-center justify-center font-bold">←</button>
            <span className="text-black font-bold text-lg">1 / 5</span>
            <button className="w-12 h-12 rounded-full bg-black text-white hover:bg-gray-800 transition-colors shadow-md flex items-center justify-center font-bold">→</button>
          </div>
        </div>
      </section>

      {/* SECCIÓN BEST TOURS */}
      <section className="py-24 bg-[#F4F6F5]">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold text-black mb-12">{t('bestTours.title')}</h2>
          <div className="p-12 bg-white/50 rounded-3xl border border-dashed border-gray-300 text-gray-400 italic leading-relaxed">
            {t('bestTours.comingSoon')}
          </div>
        </div>
      </section>
    </div>
  );
}
