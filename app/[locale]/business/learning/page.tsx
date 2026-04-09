'use client';

import React, { useState } from 'react';
import NavbarBusiness from '@/components/business/NavbarBusiness';
import Footer from '@/components/tourist/Footer';
import { LSM_VIDEOS, type LessonVideo } from '@/data/lsm-videos';
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
  Psychology as CogIcon,
  PlayCircle as PlayCircleIcon,
  // Lesson icons
  EmojiEmotions as ExpresionesIcon,
  Filter1 as NumerosIcon,
  HistoryEdu as PersonajesIcon,
  Work as ProfesionesIcon,
  Palette as ColoresIcon,
  School as EducacionIcon,
  Home as FamiliaLessonIcon,
  Person as PronombresIcon,
  Handshake as SaludosIcon,
  Laptop as TecnologiaIcon,
  Public as ContinentesIcon,
  HearingDisabled as SordasIcon,
  LocationCity as LugaresIcon,
  HealthAndSafety as ProteccionIcon,
  Schedule as TemporalidadIcon,
  RecordVoiceOver as VerbosIcon,
} from '@mui/icons-material';

// ─── Types ───────────────────────────────────────────────────────────────────

interface Category {
  id: string;
  title: string;
  color: string;
  icon: React.ReactNode;
}

interface Course {
  id: number;
  categoryId: string;
  title: string;
  imageUrl: string;
  progress: number;
  rating: number;
  enrolled: number;
  blobColor?: string;
  hasLessons?: boolean;
}

interface Lesson {
  id: string;
  title: string;
  icon: React.ReactNode;
}
// ─── LSM Lessons ─────────────────────────────────────────────────────────────

const LSM_LESSONS: Lesson[] = [
  { id: 'juridico',    title: 'Ámbito Jurídico',                  icon: <FormalIcon         sx={{ fontSize: 36, color: '#c8bfa8' }} /> },
  { id: 'gobierno',    title: 'Dependencias del Gobierno Federal', icon: <FinanceIcon         sx={{ fontSize: 36, color: '#c8bfa8' }} /> },
  { id: 'expresiones', title: 'Expresiones',                      icon: <ExpresionesIcon     sx={{ fontSize: 36, color: '#c8bfa8' }} /> },
  { id: 'numeros',     title: 'Números',                          icon: <NumerosIcon         sx={{ fontSize: 36, color: '#c8bfa8' }} /> },
  { id: 'personajes',  title: 'Personajes Históricos',            icon: <PersonajesIcon      sx={{ fontSize: 36, color: '#c8bfa8' }} /> },
  { id: 'profesiones', title: 'Profesiones',                      icon: <ProfesionesIcon     sx={{ fontSize: 36, color: '#c8bfa8' }} /> },
  { id: 'colores',     title: 'Colores',                          icon: <ColoresIcon         sx={{ fontSize: 36, color: '#c8bfa8' }} /> },
  { id: 'educacion',   title: 'Educación',                        icon: <EducacionIcon       sx={{ fontSize: 36, color: '#c8bfa8' }} /> },
  { id: 'familia',     title: 'Familia',                          icon: <FamiliaLessonIcon   sx={{ fontSize: 36, color: '#c8bfa8' }} /> },
  { id: 'pronombres',  title: 'Pronombres',                       icon: <PronombresIcon      sx={{ fontSize: 36, color: '#c8bfa8' }} /> },
  { id: 'saludos',     title: 'Saludos',                          icon: <SaludosIcon         sx={{ fontSize: 36, color: '#c8bfa8' }} /> },
  { id: 'tecnologia',  title: 'Tecnología',                       icon: <TecnologiaIcon      sx={{ fontSize: 36, color: '#c8bfa8' }} /> },
  { id: 'continentes', title: 'Continentes y países',             icon: <ContinentesIcon     sx={{ fontSize: 36, color: '#c8bfa8' }} /> },
  { id: 'sordas',      title: 'Educación para personas sordas',   icon: <SordasIcon          sx={{ fontSize: 36, color: '#c8bfa8' }} /> },
  { id: 'lugares',     title: 'Lugares de la Ciudad de México',   icon: <LugaresIcon         sx={{ fontSize: 36, color: '#c8bfa8' }} /> },
  { id: 'proteccion',  title: 'Protección Civil',                 icon: <ProteccionIcon      sx={{ fontSize: 36, color: '#c8bfa8' }} /> },
  { id: 'temporal',    title: 'Temporalidad',                     icon: <TemporalidadIcon    sx={{ fontSize: 36, color: '#c8bfa8' }} /> },
  { id: 'verbos',      title: 'Verbos',                           icon: <VerbosIcon          sx={{ fontSize: 36, color: '#c8bfa8' }} /> },
];
// ─── Categories ──────────────────────────────────────────────────────────────

const CATEGORIES: Category[] = [
  { id: 'flexibilidad', title: 'Flexibilidad Cognitiva',  color: '#7c1535', icon: <CogIcon       sx={{ fontSize: 26, color: '#fff' }} /> },
  { id: 'activa',       title: 'Activa tu negocio',       color: '#22c55e', icon: <PlayIcon      sx={{ fontSize: 26, color: '#fff' }} /> },
  { id: 'impulsa',      title: 'Impulsa tu negocio',      color: '#a855f7', icon: <RocketIcon    sx={{ fontSize: 26, color: '#fff' }} /> },
  { id: 'finanzas',     title: 'Finanzas para tu negocio',color: '#14b8a6', icon: <FinanceIcon   sx={{ fontSize: 26, color: '#fff' }} /> },
  { id: 'vende',        title: 'Vende más',               color: '#3b82f6', icon: <SellIcon      sx={{ fontSize: 26, color: '#fff' }} /> },
  { id: 'formaliza',    title: 'Formalízate',             color: '#6366f1', icon: <FormalIcon    sx={{ fontSize: 26, color: '#fff' }} /> },
  { id: 'digitaliza',   title: 'Digitalízate',            color: '#f97316', icon: <DigitalIcon   sx={{ fontSize: 26, color: '#fff' }} /> },
  { id: 'profesional',  title: 'Profesionalízate',        color: '#ec4899', icon: <ProfIcon      sx={{ fontSize: 26, color: '#fff' }} /> },
  { id: 'familia',      title: 'Empresas familiares',     color: '#db2777', icon: <FamilyIcon    sx={{ fontSize: 26, color: '#fff' }} /> },
  { id: 'edufin',       title: 'Educación financiera',    color: '#1e3a8a', icon: <EduFinanceIcon sx={{ fontSize: 26, color: '#fff' }} /> },
  { id: 'lider',        title: 'Desarróllate como líder', color: '#9ca3af', icon: <LeaderIcon    sx={{ fontSize: 26, color: '#fff' }} /> },
  { id: 'minuto',       title: 'Lecciones en un minuto',  color: '#eab308', icon: <MinuteIcon    sx={{ fontSize: 26, color: '#fff' }} /> },
  { id: 'ia',           title: 'Inteligencia Artificial', color: '#2563eb', icon: <AIIcon        sx={{ fontSize: 26, color: '#fff' }} /> },
];

const BLOB_COLORS = ['#f5d120', '#1e3a8a'];

const COURSE_TITLES: Record<string, Array<{ title: string; imageUrl?: string; hasLessons?: boolean }>> = {
  flexibilidad: [
    { title: 'LSM — Lengua de Señas Mexicana',       imageUrl: '/LSM/LSMSImbol.webp', hasLessons: true },
    { title: 'Lectura fácil y comunicación inclusiva' },
    { title: 'Pictogramas y sistemas alternativos' },
    { title: 'Apoyos visuales para la comprensión' },
  ],
  activa:      [{ title: 'Aprovechar el cambio a favor de mi negocio' }, { title: '¿Cómo establecer un plan de vida?' }, { title: '¿Cómo lograr clientes satisfechos?' }, { title: 'Genera promociones y publicidad' }, { title: '¿Cómo hacer mejor las compras de tu negocio?' }],
  impulsa:     [{ title: 'Planear para el futuro' }, { title: 'Utiliza Facebook e Instagram en tu negocio' }, { title: 'Barreras de prevención de COVID-19' }, { title: 'Primeros pasos para iniciar mi negocio' }, { title: '¿Cómo innovar en tiempos críticos?' }],
  finanzas:    [{ title: 'Control de ingresos y egresos' }, { title: 'Crédito responsable para tu negocio' }, { title: 'Ahorro empresarial' }, { title: 'Inversión inteligente' }, { title: 'Flujo de caja efectivo' }],
  vende:       [{ title: 'Técnicas de ventas exitosas' }, { title: 'Atención al cliente de excelencia' }, { title: 'Marketing digital básico' }, { title: 'Fidelización de clientes' }, { title: 'Estrategias de precio' }],
  formaliza:   [{ title: 'Registro ante el SAT' }, { title: 'Obligaciones fiscales básicas' }, { title: 'Contratos y acuerdos legales' }, { title: 'Protección de marca' }, { title: 'IMSS para tu negocio' }],
  digitaliza:  [{ title: 'Crea tu tienda en línea' }, { title: 'Redes sociales para vender' }, { title: 'Pagos digitales y e-commerce' }, { title: 'Herramientas de productividad' }, { title: 'Seguridad digital' }],
  profesional: [{ title: 'Liderazgo efectivo' }, { title: 'Gestión del tiempo' }, { title: 'Comunicación asertiva' }, { title: 'Trabajo en equipo' }, { title: 'Mejora continua' }],
  familia:     [{ title: 'Roles en la empresa familiar' }, { title: 'Conflictos y resolución' }, { title: 'Sucesión y herencia del negocio' }, { title: 'Profesionalización familiar' }, { title: 'Gobierno corporativo' }],
  edufin:      [{ title: 'Educación financiera básica' }, { title: 'Presupuesto personal y empresarial' }, { title: 'Deudas y créditos' }, { title: 'Pensión y retiro' }, { title: 'Seguros para tu negocio' }],
  lider:       [{ title: 'Inteligencia emocional' }, { title: 'Motivación de equipos' }, { title: 'Toma de decisiones' }, { title: 'Negociación efectiva' }, { title: 'Resiliencia empresarial' }],
  minuto:      [{ title: '1 minuto: ventas' }, { title: '1 minuto: finanzas' }, { title: '1 minuto: liderazgo' }, { title: '1 minuto: digital' }, { title: '1 minuto: clientes' }],
  ia:          [{ title: 'IA para pequeños negocios' }, { title: 'ChatGPT en tu empresa' }, { title: 'Automatización con IA' }, { title: 'Análisis de datos básico' }, { title: 'Futuro del trabajo con IA' }],
};

const COURSES: Course[] = CATEGORIES.flatMap((cat, ci) =>
  (COURSE_TITLES[cat.id] ?? []).map((item, i) => ({
    id: ci * 10 + i,
    categoryId: cat.id,
    title: item.title,
    imageUrl: item.imageUrl ?? '',
    blobColor: BLOB_COLORS[(ci + i) % BLOB_COLORS.length],
    progress: 0,
    rating: parseFloat((4.4 + Math.random() * 0.3).toFixed(1)),
    enrolled: 800 + Math.floor(Math.random() * 1200),
    hasLessons: item.hasLessons ?? false,
  }))
);

// ─── Sub-components ──────────────────────────────────────────────────────────

function CategoryCard({ cat, onClick }: { cat: Category; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-4 bg-white rounded-2xl px-5 py-4 shadow-sm border border-gray-100 hover:shadow-md hover:border-blue-100 hover:-translate-y-0.5 transition-all duration-200 text-left w-full group"
    >
      <span className="absolute -top-1.5 -left-1.5 w-3 h-3 rounded-full bg-yellow-400" />
      <div
        className="relative shrink-0 w-14 h-14 rounded-full flex items-center justify-center"
        style={{ background: cat.color }}
      >
        <svg className="absolute inset-0 w-full h-full" viewBox="0 0 56 56">
          <circle cx="28" cy="28" r="26" fill="none" stroke={cat.color} strokeOpacity="0.35" strokeWidth="2" strokeDasharray="4 3" />
        </svg>
        {cat.icon}
      </div>
      <span className="font-bold text-gray-800 text-sm leading-tight group-hover:text-blue-700 transition-colors">
        {cat.title}
      </span>
    </button>
  );
}

function CourseCard({ course, category, onLessonsClick }: {
  course: Course;
  category: Category;
  onLessonsClick?: () => void;
}) {
  const [fav, setFav] = useState(false);
  const blob = course.blobColor ?? '#f5d120';
  const hasImage = !!course.imageUrl;

  return (
    <div
      className={`bg-white rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-all duration-200 overflow-hidden flex flex-col ${course.hasLessons ? 'cursor-pointer hover:-translate-y-1' : ''}`}
      onClick={course.hasLessons ? onLessonsClick : undefined}
    >
      {/* Photo / image area */}
      <div className="relative h-44 bg-gray-50 flex items-end justify-center overflow-hidden">
        {hasImage ? (
          <img src={course.imageUrl} alt={course.title} className="w-full h-full object-cover" />
        ) : (
          <>
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-36 h-36 rounded-full opacity-90" style={{ background: blob }} />
            <div className="absolute bottom-0 left-1/2 translate-x-2 w-28 h-28 rounded-full opacity-80" style={{ background: blob === '#f5d120' ? '#1e3a8a' : '#f5d120' }} />
          </>
        )}
        {course.hasLessons && (
          <div className="absolute top-2 right-2 bg-white/90 text-[10px] font-black px-2 py-0.5 rounded-full text-[#7c1535] shadow-sm">
            Ver lecciones →
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4 flex flex-col gap-3 flex-1">
        <div className="flex items-start justify-between gap-2">
          <span className="text-left text-blue-700 font-bold text-sm leading-snug underline">
            {course.title}
          </span>
          <button
            onClick={(e) => { e.stopPropagation(); setFav(!fav); }}
            className="shrink-0 mt-0.5 text-blue-300 hover:text-red-400 transition-colors"
          >
            {fav
              ? <HeartIcon sx={{ fontSize: 18 }} className="text-red-400" />
              : <HeartOutlineIcon sx={{ fontSize: 18 }} />}
          </button>
        </div>

        <div>
          <div className="flex justify-between text-[11px] text-gray-400 font-medium mb-1">
            <span>Avance</span><span>{course.progress}%</span>
          </div>
          <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
            <div className="h-full bg-blue-600 rounded-full" style={{ width: `${course.progress}%` }} />
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap mt-auto">
          <span className="text-[10px] font-bold px-2.5 py-1 rounded-full text-white" style={{ background: category.color }}>
            {category.title}
          </span>
          <span className="flex items-center gap-0.5 text-[11px] font-bold text-yellow-500">
            <StarIcon sx={{ fontSize: 13 }} />{course.rating}
          </span>
          <span className="flex items-center gap-0.5 text-[11px] text-gray-400">
            <GroupIcon sx={{ fontSize: 13 }} />{course.enrolled.toLocaleString()}
          </span>
        </div>
      </div>
    </div>
  );
}

function LessonCard({ lesson, onSelect }: { lesson: Lesson; onSelect: () => void }) {
  return (
    <button
      onClick={onSelect}
      className="flex flex-col items-center justify-between rounded-2xl p-4 text-center hover:brightness-110 active:scale-95 transition-all duration-150"
      style={{ background: 'var(--primary)', minHeight: 150 }}
    >
      <div className="flex-1 flex items-center justify-center py-2">
        {lesson.icon}
      </div>
      {/* Yellow divider — palette secondary */}
      <div className="w-full h-px my-2" style={{ background: 'linear-gradient(90deg, transparent, var(--secondary) 40%, var(--secondary) 60%, transparent)' }} />
      <p className="text-white font-bold text-[11px] leading-snug underline underline-offset-2 decoration-white/50">
        {lesson.title}
      </p>
    </button>
  );
}

// ─── Video View ───────────────────────────────────────────────────────────────

function VideoCard({ video }: { video: LessonVideo }) {
  const [playing, setPlaying] = React.useState(false);

  return (
    <div className="flex flex-col overflow-hidden rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all">
      {/* Title bar */}
      <div
        className="px-3 py-2"
        style={{ background: 'var(--dark-blue)' }}
      >
        <p className="text-white font-black text-xs leading-tight truncate">{video.label}</p>
      </div>

      {/* Video / thumbnail */}
      <div
        className="relative bg-gray-900 flex items-center justify-center overflow-hidden"
        style={{ aspectRatio: '16/9' }}
      >
        {video.youtubeId && playing ? (
          <iframe
            className="absolute inset-0 w-full h-full"
            src={`https://www.youtube.com/embed/${video.youtubeId}?autoplay=1`}
            allow="autoplay; encrypted-media"
            allowFullScreen
          />
        ) : (
          <>
            {/* Thumbnail or gradient placeholder */}
            {video.youtubeId ? (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img
                src={`https://img.youtube.com/vi/${video.youtubeId}/mqdefault.jpg`}
                alt={video.label}
                className="absolute inset-0 w-full h-full object-cover opacity-70"
              />
            ) : (
              <div
                className="absolute inset-0"
                style={{ background: 'linear-gradient(135deg, var(--primary) 0%, var(--dark-blue) 100%)' }}
              />
            )}
            {/* Play button */}
            <button
              onClick={() => video.youtubeId && setPlaying(true)}
              className="relative z-10 w-14 h-14 rounded-full bg-white/15 hover:bg-white/25 border-2 border-white/40 flex items-center justify-center transition-all active:scale-95"
            >
              <PlayCircleIcon sx={{ fontSize: 36 }} className="text-white" />
            </button>
          </>
        )}
      </div>
    </div>
  );
}

function LessonVideoView({ lesson, onBack }: { lesson: Lesson; onBack: () => void }) {
  const videos = LSM_VIDEOS[lesson.id] ?? [];

  return (
    <div className="space-y-6">
      {/* Two-panel hero */}
      <div className="flex rounded-2xl overflow-hidden shadow-lg" style={{ minHeight: 160 }}>
        {/* Left panel: dark-blue + title */}
        <div
          className="flex-1 flex flex-col justify-center px-8 py-6 relative overflow-hidden"
          style={{ background: 'var(--dark-blue)' }}
        >
          {/* Subtle grid pattern overlay */}
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: 'repeating-linear-gradient(45deg, rgba(255,255,255,0.06) 0, rgba(255,255,255,0.06) 1px, transparent 0, transparent 50%)',
              backgroundSize: '18px 18px',
            }}
          />
          <button
            onClick={onBack}
            className="flex items-center gap-1.5 text-white/60 hover:text-white text-xs font-bold mb-3 transition-colors relative z-10"
          >
            <ArrowBackIcon sx={{ fontSize: 15 }} /> Atrás
          </button>
          <h1 className="text-white font-black text-3xl md:text-4xl leading-tight relative z-10">
            {lesson.title}
          </h1>
          <p className="text-white/40 text-xs font-bold mt-2 relative z-10">
            {videos.length} videos disponibles
          </p>
        </div>
        {/* Right panel: primary + icon */}
        <div
          className="w-48 md:w-64 flex flex-col items-center justify-center gap-3 relative overflow-hidden"
          style={{ background: 'var(--primary)' }}
        >
          <div className="text-white/20 absolute inset-0 flex items-center justify-center">
            <div className="w-48 h-48 rounded-full border-4 border-white/10" />
          </div>
          <div className="relative z-10 scale-[2.5] opacity-90">
            {lesson.icon}
          </div>
          <div
            className="relative z-10 w-3/4 h-0.5"
            style={{ background: 'linear-gradient(90deg, transparent, var(--secondary), transparent)' }}
          />
        </div>
      </div>

      {/* Video grid */}
      {videos.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {videos.map((v) => (
            <VideoCard key={v.id} video={v} />
          ))}
        </div>
      ) : (
        <div className="text-center py-16 text-gray-400">
          <p className="font-bold">Próximamente</p>
          <p className="text-sm mt-1">Los videos de este tema estarán disponibles pronto.</p>
        </div>
      )}
    </div>
  );
}

// ─── Page ────────────────────────────────────────────────────────────────────

export default function LearningPage() {
  const [selectedCat,    setSelectedCat]    = useState<Category | null>(null);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);

  const courses = selectedCat ? COURSES.filter((c) => c.categoryId === selectedCat.id) : [];

  function handleBack() {
    if (selectedLesson) { setSelectedLesson(null); return; }
    if (selectedCourse) { setSelectedCourse(null); return; }
    setSelectedCat(null);
  }

  return (
    <div className="flex flex-col min-h-screen bg-[#f4f6fb]">
      <NavbarBusiness />

      <main className="flex-1 pt-24 md:pt-20 pb-20 px-4 min-h-screen">
        <div className="max-w-6xl mx-auto space-y-8">

          {/* ── Back header (only when no lesson video view, which has its own back) ── */}
          {(selectedCat || selectedCourse) && !selectedLesson && (
            <div className="flex items-center gap-3">
              <button onClick={handleBack} className="text-[var(--primary)] hover:opacity-70 transition-opacity shrink-0">
                <ArrowBackIcon sx={{ fontSize: 22 }} />
              </button>
              <div>
                <h1 className="text-2xl md:text-3xl font-black text-[var(--primary)]">
                  {selectedCourse ? selectedCourse.title : selectedCat?.title}
                </h1>
                <p className="text-sm text-gray-400 mt-0.5">
                  {selectedCourse
                    ? `${LSM_LESSONS.length} lecciones disponibles`
                    : `${courses.length} cursos disponibles`}
                </p>
              </div>
            </div>
          )}

          {/* ── Lesson video view ── */}
          {selectedLesson && (
            <LessonVideoView
              lesson={selectedLesson}
              onBack={() => setSelectedLesson(null)}
            />
          )}

          {/* ── LSM Lessons grid ── */}
          {selectedCourse && !selectedLesson && (
            <div className="rounded-3xl p-6 md:p-8" style={{ background: 'var(--dark-blue)' }}>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                {LSM_LESSONS.map((lesson) => (
                  <LessonCard
                    key={lesson.id}
                    lesson={lesson}
                    onSelect={() => setSelectedLesson(lesson)}
                  />
                ))}
              </div>
            </div>
          )}

          {/* ── Courses grid ── */}
          {selectedCat && !selectedCourse && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {courses.map((course) => (
                <CourseCard
                  key={course.id}
                  course={course}
                  category={selectedCat}
                  onLessonsClick={() => setSelectedCourse(course)}
                />
              ))}
            </div>
          )}

          {/* ── Home view ── */}
          {!selectedCat && !selectedCourse && (
            <>
              <section className="space-y-4">
                <h2 className="text-xl font-black text-blue-700">Continuar aprendiendo</h2>
                <div className="w-72">
                  <CourseCard
                    course={{ id: 9999, categoryId: 'activa', title: 'Aprovechar el cambio a favor de mi negocio.', imageUrl: '', blobColor: '#f5d120', progress: 40, rating: 4.5, enrolled: 1867, hasLessons: false }}
                    category={CATEGORIES[1]}
                  />
                </div>
              </section>

              <section className="space-y-4">
                <h2 className="text-xl font-black text-blue-700">Te recomendamos</h2>
                <div className="flex gap-4 overflow-x-auto pb-2 -mx-1 px-1">
                  {[
                    { title: '¿Cómo lograr clientes satisfechos?',        blob: '#f5d120', rating: 4.6, enrolled: 1317 },
                    { title: 'Genera promociones y publicidad',            blob: '#f5d120', rating: 4.6, enrolled: 891  },
                    { title: 'Utiliza Facebook e Instagram en tu negocio', blob: '#1e3a8a', rating: 4.6, enrolled: 1024 },
                    { title: 'Planear para el futuro.',                    blob: '#f5d120', rating: 4.5, enrolled: 1013 },
                    { title: '¿Cómo establecer un plan de vida?',          blob: '#1e3a8a', rating: 4.6, enrolled: 1347 },
                  ].map((item, i) => (
                    <div key={i} className="shrink-0 w-64">
                      <CourseCard
                        course={{ id: 8000 + i, categoryId: 'activa', title: item.title, imageUrl: '', blobColor: item.blob, progress: 0, rating: item.rating, enrolled: item.enrolled, hasLessons: false }}
                        category={CATEGORIES[1]}
                      />
                    </div>
                  ))}
                </div>
              </section>

              <h2 className="text-xl font-black text-blue-700">Módulos de aprendizaje</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {CATEGORIES.map((cat) => (
                  <div key={cat.id} className="relative">
                    <CategoryCard cat={cat} onClick={() => setSelectedCat(cat)} />
                  </div>
                ))}
              </div>
            </>
          )}

        </div>
      </main>

      <Footer />
    </div>
  );
}