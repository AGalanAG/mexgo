'use client';

import React, { useState, useEffect, useMemo } from 'react';
import NavbarBusiness from '@/components/business/NavbarBusiness';
import Footer from '@/components/tourist/Footer';
import { LSM_VIDEOS, type LessonVideo } from '@/data/lsm-videos';
import { Link } from '@/i18n/routing';
import type { BusinessInsight, CourseRecommendation } from '@/types/types';
import { CourseCard, type Course, type Category } from '@/components/business/CourseCard';
import { getStoredAccessToken } from '@/lib/client-auth';
import {
  ArrowBack as ArrowBackIcon,
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
  LocalFireDepartment as FireIcon,
  AutoGraph as GraphIcon,
} from '@mui/icons-material';

// ─── Types ───────────────────────────────────────────────────────────────────

interface Lesson {
  id: string;
  title: string;
  icon: React.ReactNode;
}

interface LearningModuleRow {
  id: string;
  title: string;
  category: string;
  estimated_minutes: number;
}

interface LearningProgressRow {
  module_id: string;
  progress_percent: number;
  status: string;
}

interface BusinessMeResponse {
  ok: boolean;
  data?: {
    businessId: string;
  };
}

interface LearningModulesResponse {
  ok: boolean;
  data?: {
    items: LearningModuleRow[];
  };
}

interface LearningProgressResponse {
  ok: boolean;
  data?: {
    summary?: {
      totalModules: number;
      completedModules: number;
      overallProgress: number;
    };
    items: LearningProgressRow[];
  };
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
  const [topCursos, setTopCursos] = useState<CourseRecommendation[]>([]);
  const [businessLearningModules, setBusinessLearningModules] = useState<LearningModuleRow[]>([]);
  const [businessLearningProgress, setBusinessLearningProgress] = useState<LearningProgressRow[]>([]);
  const [businessLearningSummary, setBusinessLearningSummary] = useState({
    totalModules: 0,
    completedModules: 0,
    overallProgress: 0,
  });
  const [loadingBusinessProgress, setLoadingBusinessProgress] = useState(true);

  useEffect(() => {
    // Leer recomendaciones IA desde sessionStorage si el dashboard ya las cargo
    const cached = sessionStorage.getItem('mexgo_business_insight');
    if (cached) {
      try {
        const parsed = JSON.parse(cached) as BusinessInsight;
        if (parsed.cursos_recomendados) {
          setTopCursos(parsed.cursos_recomendados.slice(0, 3));
        }
      } catch (err) {
        console.error('Error parsing cached insight:', err);
      }
    }
  }, []);

  const courses = selectedCat ? COURSES.filter((c) => c.categoryId === selectedCat.id) : [];

  const progressByModuleId = useMemo(() => {
    return new Map(businessLearningProgress.map((item) => [item.module_id, item]));
  }, [businessLearningProgress]);

  const trackedModules = useMemo(() => {
    return businessLearningModules.slice(0, 6).map((module) => {
      const progress = progressByModuleId.get(module.id);
      return {
        id: module.id,
        title: module.title,
        category: module.category,
        estimatedMinutes: module.estimated_minutes,
        progressPercent: Number(progress?.progress_percent ?? 0),
        status: progress?.status ?? 'PENDING',
      };
    });
  }, [businessLearningModules, progressByModuleId]);

  useEffect(() => {
    let cancelled = false;

    async function loadBusinessLearningProgress() {
      try {
        setLoadingBusinessProgress(true);
        const accessToken = getStoredAccessToken();
        if (!accessToken) {
          return;
        }

        const businessResponse = await fetch('/api/businesses/me', {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
          cache: 'no-store',
        });

        const businessPayload = (await businessResponse.json()) as BusinessMeResponse;
        const businessId = businessPayload.data?.businessId;
        if (!businessResponse.ok || !businessId) {
          return;
        }

        const [modulesResponse, progressResponse] = await Promise.all([
          fetch('/api/learning/modules', {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
            cache: 'no-store',
          }),
          fetch(`/api/learning/completions?businessId=${encodeURIComponent(businessId)}`, {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
            cache: 'no-store',
          }),
        ]);

        const modulesPayload = (await modulesResponse.json()) as LearningModulesResponse;
        const progressPayload = (await progressResponse.json()) as LearningProgressResponse;

        if (cancelled) {
          return;
        }

        if (modulesResponse.ok && modulesPayload.data?.items) {
          setBusinessLearningModules(modulesPayload.data.items);
        }

        if (progressResponse.ok && progressPayload.data?.items) {
          setBusinessLearningProgress(progressPayload.data.items);
          setBusinessLearningSummary({
            totalModules: Number(progressPayload.data.summary?.totalModules ?? 0),
            completedModules: Number(progressPayload.data.summary?.completedModules ?? 0),
            overallProgress: Number(progressPayload.data.summary?.overallProgress ?? 0),
          });
        }
      } finally {
        if (!cancelled) {
          setLoadingBusinessProgress(false);
        }
      }
    }

    void loadBusinessLearningProgress();

    return () => {
      cancelled = true;
    };
  }, []);

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

          {/* ── Recomendados IA ── */}
          {!selectedCat && !selectedCourse && !selectedLesson && topCursos.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-orange-100 flex items-center justify-center text-orange-600">
                  <FireIcon sx={{ fontSize: 18 }} />
                </div>
                <h2 className="text-lg font-black text-gray-900 uppercase tracking-wide">
                  Recomendados para ti
                </h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {topCursos.map((rec) => (
                  <div
                    key={rec.slug}
                    className="bg-white rounded-2xl p-5 border border-orange-100 shadow-sm hover:shadow-md transition-all group relative overflow-hidden"
                  >
                    <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
                      <GraphIcon sx={{ fontSize: 40 }} />
                    </div>
                    <div className="flex flex-col h-full">
                      <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-md w-fit mb-2 ${
                        rec.prioridad === 'alta' ? 'bg-red-100 text-red-600' : 'bg-orange-100 text-orange-600'
                      }`}>
                        Prioridad {rec.prioridad}
                      </span>
                      <h3 className="font-black text-gray-900 text-sm leading-tight mb-2">
                        {rec.titulo}
                      </h3>
                      <p className="text-xs text-gray-500 leading-relaxed mb-4 flex-1">
                        {rec.razon}
                      </p>
                      <button className="w-full py-2 bg-blue-700 hover:bg-blue-800 text-white text-[11px] font-black rounded-xl transition-colors">
                        Empezar módulo
                      </button>
                    </div>
                  </div>
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
                <h2 className="text-xl font-black text-blue-700">Progreso del negocio</h2>
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div className="rounded-xl bg-blue-50 p-4">
                      <p className="text-xs uppercase tracking-wider font-black text-blue-500">Modulos con avance</p>
                      <p className="text-2xl font-black text-blue-800 mt-1">{businessLearningSummary.totalModules}</p>
                    </div>
                    <div className="rounded-xl bg-green-50 p-4">
                      <p className="text-xs uppercase tracking-wider font-black text-green-600">Modulos completados</p>
                      <p className="text-2xl font-black text-green-800 mt-1">{businessLearningSummary.completedModules}</p>
                    </div>
                    <div className="rounded-xl bg-amber-50 p-4">
                      <p className="text-xs uppercase tracking-wider font-black text-amber-600">Progreso global</p>
                      <p className="text-2xl font-black text-amber-800 mt-1">{businessLearningSummary.overallProgress}%</p>
                    </div>
                  </div>

                  {loadingBusinessProgress ? (
                    <p className="text-sm text-gray-500 font-medium">Cargando progreso del negocio...</p>
                  ) : trackedModules.length === 0 ? (
                    <p className="text-sm text-gray-500 font-medium">Aun no hay modulos con progreso registrado.</p>
                  ) : (
                    <div className="space-y-3">
                      {trackedModules.map((module) => (
                        <div key={module.id} className="rounded-xl border border-gray-100 p-3">
                          <div className="flex items-center justify-between gap-3">
                            <div>
                              <p className="text-sm font-black text-gray-800">{module.title}</p>
                              <p className="text-xs text-gray-400 font-semibold uppercase tracking-wide">
                                {module.category} - {module.estimatedMinutes} min
                              </p>
                            </div>
                            <span className="text-xs font-black px-2 py-1 rounded-full bg-gray-100 text-gray-700">
                              {module.status}
                            </span>
                          </div>
                          <div className="mt-2 h-2 bg-gray-100 rounded-full overflow-hidden">
                            <div className="h-full bg-blue-600 rounded-full" style={{ width: `${module.progressPercent}%` }} />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </section>

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
