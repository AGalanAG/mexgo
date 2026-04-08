import HomeNavbar from '@/components/tourist/HomeNavbar';
import Footer from '@/components/tourist/Footer';
import PlaceCard from '@/components/tourist/PlaceCard';
import {getTranslations} from 'next-intl/server';
//import {Link} from '@/i18n/routing';
import Link from 'next/link';

export default async function Home() {
  const t = await getTranslations('Home');

  return (
    <div className="flex flex-col min-h-screen w-full bg-white">
      
      {/* 1. SECCIÓN HERO */}
      <section 
        className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden"
        style={{ 
          backgroundImage: "url('/fondoLanding/angel-independencia-paseo-de-reforma.webp' )", 
          backgroundSize: 'cover', 
          backgroundPosition: 'center' 
        }}
      >
        {/* Filtro Rectangle 3 */}
        <div 
          className="absolute left-0 top-0 w-[1752px] h-[1161px] pointer-events-none z-0"
          style={{ 
            background: 'linear-gradient(180deg, rgba(0, 0, 0, 0.81) -3.79%, rgba(158, 158, 158, 0) 73.81%, rgba(114, 114, 114, 0) 78.41%, rgba(14, 14, 14, 0.649064) 96.21%)' 
          }}
        ></div>

        {/* Componente Navbar Separado */}
        <HomeNavbar />

        {/* Hero Content */}
        <div className="text-center text-white z-10 px-4 w-full max-w-4xl mt-16">
          <h1 className="text-5xl md:text-7xl font-extrabold mb-8 drop-shadow-lg text-white"
              dangerouslySetInnerHTML={{ __html: t('hero.title') }} 
          />
          
          {/* Search Bar */}
          <div className="bg-white rounded-full p-2 flex items-center shadow-lg mb-8 max-w-3xl mx-auto">
            <span className="text-gray-400 pl-4 pr-2">📍</span>
            <input 
              type="text" 
              placeholder={t('hero.searchPlaceholder')} 
              className="flex-1 bg-transparent outline-none text-gray-800 placeholder-gray-400"
            />
            <button className="p-3 bg-white text-gray-600 hover:text-black rounded-full">
              🔍
            </button>
          </div>

          <p className="text-sm md:text-base font-medium mb-6 drop-shadow-md">
            {t('hero.subtitle')}
          </p>

          <Link href="/discover" className="inline-block bg-[var(--green)] hover:bg-[var(--dark-green)] text-white px-8 py-3 rounded-md font-bold transition-colors">
            {t('hero.cta')}
          </Link>
        </div>
      </section>

      {/* SECCIÓN OUR SERVICE */}
      <section className="pt-20 bg-white text-center">
        <h2 className="text-3xl font-bold text-gray-900 mb-12">{t('services.title')}</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto px-4 mb-16">
          <div className="card-base p-10 flex flex-col items-center shadow-sm border border-gray-100 bg-white">
            <span className="text-4xl mb-4 text-gray-400">✈️</span>
            <h3 className="font-bold text-lg mb-2 text-gray-900">{t('services.item1.title')}</h3>
            <p className="text-sm text-gray-500">{t('services.item1.desc')}</p>
          </div>
          
          <div className="card-base p-10 flex flex-col items-center shadow-sm border border-gray-100 bg-white">
            <span className="text-4xl mb-4 text-[var(--light-blue)]">🏨</span>
            <h3 className="font-bold text-lg mb-2 text-gray-900">{t('services.item2.title')}</h3>
            <p className="text-sm text-gray-500">{t('services.item2.desc')}</p>
          </div>
          
          <div className="card-base p-10 flex flex-col items-center shadow-sm border border-gray-100 bg-white">
            <span className="text-4xl mb-4 text-[var(--red)]">🧭</span>
            <h3 className="font-bold text-lg mb-2 text-gray-900">{t('services.item3.title')}</h3>
            <p className="text-sm text-gray-500">{t('services.item3.desc')}</p>
          </div>
        </div>

        <div className="bg-[#F8F9FA] py-16 px-4">
          <h2 className="text-3xl font-bold text-gray-900 mb-4" dangerouslySetInnerHTML={{ __html: t('bestService.title') }} />
          <p className="text-sm text-gray-500 max-w-2xl mx-auto mb-8">
            {t('bestService.subtitle')}
          </p>
          <div className="flex justify-center items-center gap-4">
            <button className="w-8 h-8 rounded-full bg-gray-800 text-white">&lt;</button>
            <span className="text-sm font-medium">1 / 5</span>
            <button className="w-8 h-8 rounded-full bg-gray-800 text-white">&gt;</button>
          </div>
        </div>
      </section>

      {/* SECCIÓN BEST TOURS */}
      <section className="py-20 bg-[#F4F6F5]">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-12">{t('bestTours.title')}</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 justify-items-center">
            <PlaceCard 
              title="Palacio de Bellas Artes" 
              location="CDMX, México" 
              imageUrl="https://images.unsplash.com/photo-1585464231875-d9ef1f5ad396?q=80&w=2070&auto=format&fit=crop" 
            />
            <PlaceCard 
              title="Teotihuacán" 
              location="Edomex, México" 
              imageUrl="https://images.unsplash.com/photo-1512813195386-6cf811ad3542?q=80&w=2070&auto=format&fit=crop" 
            />
            <PlaceCard 
              title="Xochimilco" 
              location="CDMX, México" 
              imageUrl="https://images.unsplash.com/photo-1518105779142-d975b22f1b0a?q=80&w=2070&auto=format&fit=crop" 
            />
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
