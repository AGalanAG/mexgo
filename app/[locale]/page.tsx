import HomeNavbar from '@/components/tourist/HomeNavbar';
import Footer from '@/components/tourist/Footer';
import { getTranslations } from 'next-intl/server';
import Link from 'next/link';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import SearchIcon from '@mui/icons-material/Search';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import ExploreIcon from '@mui/icons-material/Explore';

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
            <LocationOnIcon className="text-gray-400 ml-3 mr-1 shrink-0" fontSize="small" />
            <input
              type="text"
              placeholder={t('hero.searchPlaceholder')}
              className="flex-1 bg-transparent outline-none text-gray-800 placeholder-gray-400"
            />
            <button className="p-3 bg-white text-gray-400 hover:text-[var(--primary)] rounded-full transition-colors">
              <SearchIcon fontSize="small" />
            </button>
          </div>

          <p className="text-sm md:text-base font-medium mb-6 drop-shadow-md">
            {t('hero.subtitle')}
          </p>

          <Link href="/discover" className="inline-block bg-[var(--secondary)] hover:brightness-105 text-[var(--primary)] px-8 py-3 rounded-md font-bold transition-all shadow-lg shadow-[var(--secondary)]/30">
            {t('hero.cta')}
          </Link>
        </div>
      </section>

      {/* SECCIÓN OUR SERVICE */}
      <section className="pt-20 bg-white text-center">
        <h2 className="text-3xl font-bold text-[var(--primary)] mb-3">{t('services.title')}</h2>
        <div className="w-16 h-1.5 bg-[var(--secondary)] rounded-full mx-auto mb-12" />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-3xl mx-auto px-4 mb-16">
          <div className="card-base p-10 flex flex-col items-center border-t-4 border-[var(--secondary)] bg-surface">
            <div className="w-14 h-14 rounded-full bg-[var(--primary)] flex items-center justify-center mb-5">
              <AutoAwesomeIcon style={{ color: 'white', fontSize: 28 }} />
            </div>
            <h3 className="font-bold text-lg mb-2 text-[var(--primary)]">{t('services.item1.title')}</h3>
            <p className="text-sm text-[var(--text-secondary)] text-center">{t('services.item1.desc')}</p>
          </div>

          <div className="card-base p-10 flex flex-col items-center border-t-4 border-[var(--primary)] bg-surface">
            <div className="w-14 h-14 rounded-full bg-[var(--secondary)] flex items-center justify-center mb-5">
              <ExploreIcon style={{ color: 'var(--primary)', fontSize: 28 }} />
            </div>
            <h3 className="font-bold text-lg mb-2 text-[var(--primary)]">{t('services.item3.title')}</h3>
            <p className="text-sm text-[var(--text-secondary)] text-center">{t('services.item3.desc')}</p>
          </div>
        </div>

        <div className="bg-[#F8F9FA] py-16 px-4 text-center">
          <p className="text-3xl font-bold italic max-w-2xl mx-auto" style={{ color: 'var(--primary)' }}>
            &ldquo;{t('bestService.title1')}<br />{t('bestService.title2')}&rdquo;
          </p>
        </div>
      </section>


      <Footer />
    </div>
  );
}
