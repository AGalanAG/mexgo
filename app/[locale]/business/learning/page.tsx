'use client';

import React, { useState } from 'react';
import NavbarBusiness from '@/components/business/NavbarBusiness';
import Footer from '@/components/tourist/Footer';
import { Link } from '@/i18n/routing';
import {
  ArrowBack as ArrowBackIcon,
  Favorite as HeartIcon,
  FavoriteBorder as HeartOutlineIcon,
  Star as StarIcon,
  Group as GroupIcon,
  PlayArrow as PlayIcon,
  RocketLaunch as RocketIcon,
  AccountBalance as FinanceIcon,
  TrendingUp as SellIcon,
  Gavel as FormalIcon,
  PhoneAndroid as DigitalIcon,
  EmojiEvents as ProfIcon,
  FamilyRestroom as FamilyIcon,
  Savings as EduFinanceIcon,
  Flag as LeaderIcon,
  Bolt as MinuteIcon,
  SmartToy as AIIcon,
} from '@mui/icons-material';

// ─── Types ───────────────────────────────────────────────────────────────────

interface Category {
  id: string;
  title: string;
  color: string;       // bg color of the circle icon
  icon: React.ReactNode;
}

interface Course {
  id: number;
  categoryId: string;
  title: string;
  imageUrl: string;    // placeholder portrait photo
  progress: number;    // 0-100
  rating: number;
  enrolled: number;
}

// ─── Data ────────────────────────────────────────────────────────────────────

const CATEGORIES: Category[] = [
  { id: 'activa',      title: 'Activa tu negocio',       color: '#22c55e', icon: <PlayIcon sx={{ fontSize: 26, color: '#fff' }} /> },
  { id: 'impulsa',     title: 'Impulsa tu negocio',      color: '#a855f7', icon: <RocketIcon sx={{ fontSize: 26, color: '#fff' }} /> },
  { id: 'finanzas',    title: 'Finanzas para tu negocio',color: '#14b8a6', icon: <FinanceIcon sx={{ fontSize: 26, color: '#fff' }} /> },
  { id: 'vende',       title: 'Vende más',               color: '#3b82f6', icon: <SellIcon sx={{ fontSize: 26, color: '#fff' }} /> },
  { id: 'formaliza',   title: 'Formalízate',             color: '#6366f1', icon: <FormalIcon sx={{ fontSize: 26, color: '#fff' }} /> },
  { id: 'digitaliza',  title: 'Digitalízate',            color: '#f97316', icon: <DigitalIcon sx={{ fontSize: 26, color: '#fff' }} /> },
  { id: 'profesional', title: 'Profesionalízate',        color: '#ec4899', icon: <ProfIcon sx={{ fontSize: 26, color: '#fff' }} /> },
  { id: 'familia',     title: 'Empresas familiares',     color: '#db2777', icon: <FamilyIcon sx={{ fontSize: 26, color: '#fff' }} /> },
  { id: 'edufin',      title: 'Educación financiera',    color: '#1e3a8a', icon: <EduFinanceIcon sx={{ fontSize: 26, color: '#fff' }} /> },
  { id: 'lider',       title: 'Desarróllate como líder', color: '#9ca3af', icon: <LeaderIcon sx={{ fontSize: 26, color: '#fff' }} /> },
  { id: 'minuto',      title: 'Lecciones en un minuto',  color: '#eab308', icon: <MinuteIcon sx={{ fontSize: 26, color: '#fff' }} /> },
  { id: 'ia',          title: 'Inteligencia Artificial', color: '#2563eb', icon: <AIIcon sx={{ fontSize: 26, color: '#fff' }} /> },
];

// Placeholder portrait photos from UI avatars (color + initials)
const PHOTOS = [
  'https://randomuser.me/api/portraits/men/32.jpg',
  'https://randomuser.me/api/portraits/women/44.jpg',
  'https://randomuser.me/api/portraits/men/65.jpg',
  'https://randomuser.me/api/portraits/men/22.jpg',
  'https://randomuser.me/api/portraits/men/55.jpg',
  'https://randomuser.me/api/portraits/women/68.jpg',
  'https://randomuser.me/api/portraits/men/71.jpg',
  'https://randomuser.me/api/portraits/women/12.jpg',
  'https://randomuser.me/api/portraits/men/18.jpg',
  'https://randomuser.me/api/portraits/women/29.jpg',
];

// BG blob colors alternating yellow / blue like in mockup
const BLOB_COLORS = ['#f5d120', '#1e3a8a'];

const COURSE_TITLES: Record<string, string[]> = {
  activa:      ['Aprovechar el cambio a favor de mi negocio', '¿Cómo establecer un plan de vida?', '¿Cómo lograr clientes satisfechos?', 'Genera promociones y publicidad', '¿Cómo hacer mejor las compras de tu negocio?'],
  impulsa:     ['Planear para el futuro', 'Utiliza Facebook e Instagram en tu negocio', 'Barreras de prevención de COVID-19', 'Primeros pasos para iniciar mi negocio', '¿Cómo innovar en tiempos críticos?'],
  finanzas:    ['Control de ingresos y egresos', 'Crédito responsable para tu negocio', 'Ahorro empresarial', 'Inversión inteligente', 'Flujo de caja efectivo'],
  vende:       ['Técnicas de ventas exitosas', 'Atención al cliente de excelencia', 'Marketing digital básico', 'Fidelización de clientes', 'Estrategias de precio'],
  formaliza:   ['Registro ante el SAT', 'Obligaciones fiscales básicas', 'Contratos y acuerdos legales', 'Protección de marca', 'IMSS para tu negocio'],
  digitaliza:  ['Crea tu tienda en línea', 'Redes sociales para vender', 'Pagos digitales y e-commerce', 'Herramientas de productividad', 'Seguridad digital'],
  profesional: ['Liderazgo efectivo', 'Gestión del tiempo', 'Comunicación asertiva', 'Trabajo en equipo', 'Mejora continua'],
  familia:     ['Roles en la empresa familiar', 'Conflictos y resolución', 'Sucesión y herencia del negocio', 'Profesionalización familiar', 'Gobierno corporativo'],
  edufin:      ['Educación financiera básica', 'Presupuesto personal y empresarial', 'Deudas y créditos', 'Pensión y retiro', 'Seguros para tu negocio'],
  lider:       ['Inteligencia emocional', 'Motivación de equipos', 'Toma de decisiones', 'Negociación efectiva', 'Resiliencia empresarial'],
  minuto:      ['1 minuto: ventas', '1 minuto: finanzas', '1 minuto: liderazgo', '1 minuto: digital', '1 minuto: clientes'],
  ia:          ['IA para pequeños negocios', 'ChatGPT en tu empresa', 'Automatización con IA', 'Análisis de datos básico', 'Futuro del trabajo con IA'],
};

const COURSES: Course[] = CATEGORIES.flatMap((cat, ci) =>
  (COURSE_TITLES[cat.id] ?? []).map((title, i) => ({
    id: ci * 10 + i,
    categoryId: cat.id,
    title,
    imageUrl: PHOTOS[(ci + i) % PHOTOS.length],
    blobColor: BLOB_COLORS[(ci + i) % BLOB_COLORS.length],
    progress: i === 0 && ci === 0 ? 40 : 0,
    rating: parseFloat((4.4 + Math.random() * 0.3).toFixed(1)),
    enrolled: 800 + Math.floor(Math.random() * 1200),
  }))
);

// ─── Sub-components ──────────────────────────────────────────────────────────

function CategoryCard({ cat, onClick }: { cat: Category; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-4 bg-white rounded-2xl px-5 py-4 shadow-sm border border-gray-100 hover:shadow-md hover:border-blue-100 hover:-translate-y-0.5 transition-all duration-200 text-left w-full group"
    >
      {/* Yellow corner dot */}
      <span className="absolute -top-1.5 -left-1.5 w-3 h-3 rounded-full bg-yellow-400" />

      {/* Icon circle with dashed border */}
      <div
        className="relative shrink-0 w-14 h-14 rounded-full flex items-center justify-center"
        style={{ background: cat.color }}
      >
        {/* Dashed ring */}
        <svg className="absolute inset-0 w-full h-full" viewBox="0 0 56 56">
          <circle
            cx="28" cy="28" r="26"
            fill="none"
            stroke={cat.color}
            strokeOpacity="0.35"
            strokeWidth="2"
            strokeDasharray="4 3"
          />
        </svg>
        {cat.icon}
      </div>

      <span className="font-bold text-gray-800 text-sm leading-tight group-hover:text-blue-700 transition-colors">
        {cat.title}
      </span>
    </button>
  );
}

function CourseCard({ course, category }: { course: Course & { blobColor?: string }; category: Category }) {
  const [fav, setFav] = useState(false);
  const blob = (course as any).blobColor ?? '#f5d120';

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-all duration-200 overflow-hidden flex flex-col">
      {/* Photo area */}
      <div className="relative h-44 bg-gray-50 flex items-end justify-center overflow-hidden">
        {/* Blob shape */}
        <div
          className="absolute bottom-0 left-1/2 -translate-x-1/2 w-36 h-36 rounded-full opacity-90"
          style={{ background: blob }}
        />
        {/* Overlapping second blob */}
        <div
          className="absolute bottom-0 left-1/2 translate-x-2 w-28 h-28 rounded-full opacity-80"
          style={{ background: blob === '#f5d120' ? '#1e3a8a' : '#f5d120' }}
        />
        <img
          src={course.imageUrl}
          alt={course.title}
          className="relative z-10 h-40 w-auto object-contain object-bottom"
          onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
        />
      </div>

      {/* Content */}
      <div className="p-4 flex flex-col gap-3 flex-1">
        <div className="flex items-start justify-between gap-2">
          <button className="text-left text-blue-700 font-bold text-sm leading-snug underline hover:text-blue-900 transition-colors">
            {course.title}
          </button>
          <button
            onClick={() => setFav(!fav)}
            className="shrink-0 mt-0.5 text-blue-300 hover:text-red-400 transition-colors"
          >
            {fav ? <HeartIcon sx={{ fontSize: 18 }} className="text-red-400" /> : <HeartOutlineIcon sx={{ fontSize: 18 }} />}
          </button>
        </div>

        {/* Progress */}
        <div>
          <div className="flex justify-between text-[11px] text-gray-400 font-medium mb-1">
            <span>Avance</span>
            <span>{course.progress}%</span>
          </div>
          <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-blue-600 rounded-full transition-all"
              style={{ width: `${course.progress}%` }}
            />
          </div>
        </div>

        {/* Footer meta */}
        <div className="flex items-center gap-2 flex-wrap mt-auto">
          <span
            className="text-[10px] font-bold px-2.5 py-1 rounded-full text-white"
            style={{ background: category.color }}
          >
            {category.title}
          </span>
          <span className="flex items-center gap-0.5 text-[11px] font-bold text-yellow-500">
            <StarIcon sx={{ fontSize: 13 }} />
            {course.rating}
          </span>
          <span className="flex items-center gap-0.5 text-[11px] text-gray-400">
            <GroupIcon sx={{ fontSize: 13 }} />
            {course.enrolled.toLocaleString()}
          </span>
        </div>
      </div>
    </div>
  );
}

// ─── Page ────────────────────────────────────────────────────────────────────

export default function LearningPage() {
  const [selectedCat, setSelectedCat] = useState<Category | null>(null);

  const courses = selectedCat
    ? COURSES.filter((c) => c.categoryId === selectedCat.id)
    : [];

  return (
    <div className="flex flex-col min-h-screen bg-[#f4f6fb]">
      <NavbarBusiness />

      <main className="flex-1 pt-24 md:pt-20 pb-20 px-4">
        <div className="max-w-6xl mx-auto space-y-8">

          {/* ── Header ── */}
          <div className="flex items-center gap-3">
            {selectedCat && (
              <button
                onClick={() => setSelectedCat(null)}
                className="text-blue-700 hover:opacity-70 transition-opacity shrink-0"
              >
                <ArrowBackIcon sx={{ fontSize: 22 }} />
              </button>
            )}
            <div>
              <h1 className="text-2xl md:text-3xl font-black text-blue-700">
                {selectedCat ? selectedCat.title : 'Módulos de aprendizaje'}
              </h1>
              {selectedCat && (
                <p className="text-sm text-gray-400 mt-0.5">
                  {courses.length} cursos disponibles
                </p>
              )}
            </div>
          </div>

          {/* ── Category grid ── */}
          {!selectedCat && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {CATEGORIES.map((cat) => (
                <div key={cat.id} className="relative">
                  <CategoryCard cat={cat} onClick={() => setSelectedCat(cat)} />
                </div>
              ))}
            </div>
          )}

          {/* ── Courses grid ── */}
          {selectedCat && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {courses.map((course) => (
                <CourseCard key={course.id} course={course} category={selectedCat} />
              ))}
            </div>
          )}

        </div>
      </main>

      <Footer />
    </div>
  );
}