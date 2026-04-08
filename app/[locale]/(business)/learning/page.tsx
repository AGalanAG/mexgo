'use client';

import React, { useState } from 'react';
import NavbarBusiness from '@/components/business/NavbarBusiness';
import Footer from '@/components/tourist/Footer';
import { Link } from '@/i18n/routing';
import {
  ArrowBack as ArrowBackIcon,
  CheckCircle as CheckCircleIcon,
  LockOutlined as LockIcon,
  School as SchoolIcon,
  PlayArrow as PlayIcon,
  AccessibilityNew as AccessibilityIcon,
  Healing as HealingIcon,
  VolunteerActivism as InclusionIcon,
  Security as CivilProtectionIcon,
  RecordVoiceOver as SignLanguageIcon,
  Groups as DiversityIcon,
  Accessibility as WheelchairIcon,
  Psychology as MentalHealthIcon,
  HealthAndSafety as SafetyIcon,
  SentimentSatisfied as WelcomeIcon,
  WorkspacePremium as CertIcon,
} from '@mui/icons-material';

interface Module {
  id: number;
  title: string;
  desc: string;
  duration: string;
  category: string;
  status: 'done' | 'active' | 'locked';
  icon: React.ReactNode;
}

const MODULES: Module[] = [
  {
    id: 1,
    title: 'Lengua de Señas Mexicana — Nivel Básico',
    desc: 'Aprende vocabulario esencial para atender a clientes con discapacidad auditiva: saludos, precios, productos y orientación.',
    duration: '2 h',
    category: 'Comunicación inclusiva',
    status: 'done',
    icon: <SignLanguageIcon sx={{ fontSize: 28 }} />,
  },
  {
    id: 2,
    title: 'Primeros Auxilios para Negocios',
    desc: 'Protocolos básicos de actuación ante emergencias médicas: RCP, manejo de heridas, shock y traslado seguro de personas.',
    duration: '3 h',
    category: 'Seguridad',
    status: 'done',
    icon: <HealingIcon sx={{ fontSize: 28 }} />,
  },
  {
    id: 3,
    title: 'Atención a Personas con Discapacidad',
    desc: 'Buenas prácticas para recibir y orientar a personas con discapacidad física, visual, auditiva o cognitiva en tu establecimiento.',
    duration: '1.5 h',
    category: 'Inclusión',
    status: 'active',
    icon: <WheelchairIcon sx={{ fontSize: 28 }} />,
  },
  {
    id: 4,
    title: 'Protección Civil y Evacuación',
    desc: 'Rutas de evacuación, uso de extintores, puntos de reunión y cómo actuar ante sismos, incendios o inundaciones.',
    duration: '2.5 h',
    category: 'Protección civil',
    status: 'locked',
    icon: <CivilProtectionIcon sx={{ fontSize: 28 }} />,
  },
  {
    id: 5,
    title: 'Diversidad e Inclusión en el Trabajo',
    desc: 'Construye un ambiente laboral libre de discriminación. Conoce tus obligaciones legales y mejora la cultura organizacional.',
    duration: '2 h',
    category: 'Inclusión',
    status: 'locked',
    icon: <DiversityIcon sx={{ fontSize: 28 }} />,
  },
  {
    id: 6,
    title: 'Accesibilidad Universal en Espacios',
    desc: 'Adapta tu negocio para garantizar acceso digno: rampas, señalética, iluminación y espacios para personas con movilidad reducida.',
    duration: '1.5 h',
    category: 'Accesibilidad',
    status: 'locked',
    icon: <AccessibilityIcon sx={{ fontSize: 28 }} />,
  },
  {
    id: 7,
    title: 'Salud Mental y Bienestar para Emprendedores',
    desc: 'Herramientas para manejar el estrés, identificar el burnout y mantener el bienestar emocional al frente de tu negocio.',
    duration: '2 h',
    category: 'Bienestar',
    status: 'locked',
    icon: <MentalHealthIcon sx={{ fontSize: 28 }} />,
  },
  {
    id: 8,
    title: 'Cultura de Bienvenida Turística',
    desc: 'Hospitalidad, comunicación intercultural y manejo de expectativas para recibir visitantes nacionales e internacionales.',
    duration: '1.5 h',
    category: 'Turismo',
    status: 'locked',
    icon: <WelcomeIcon sx={{ fontSize: 28 }} />,
  },
  {
    id: 9,
    title: 'Voluntariado en la Comunidad',
    desc: 'Cómo vincular tu negocio con causas sociales locales, programas de apoyo y redes de colaboración comunitaria.',
    duration: '1 h',
    category: 'Comunidad',
    status: 'locked',
    icon: <InclusionIcon sx={{ fontSize: 28 }} />,
  },
  {
    id: 10,
    title: 'Seguridad Alimentaria e Higiene',
    desc: 'Normas de manejo higiénico de alimentos, cadena de frío, etiquetado y protocolos para prevenir intoxicaciones.',
    duration: '2 h',
    category: 'Seguridad',
    status: 'locked',
    icon: <SafetyIcon sx={{ fontSize: 28 }} />,
  },
  {
    id: 11,
    title: 'Certificación Final — Evaluación Integral',
    desc: 'Evaluación integradora para obtener la certificación del programa. Requiere completar todos los módulos anteriores.',
    duration: '1 h',
    category: 'Certificación',
    status: 'locked',
    icon: <CertIcon sx={{ fontSize: 28 }} />,
  },
];

const CATEGORY_COLORS: Record<string, string> = {
  'Comunicación inclusiva': 'bg-blue-50 text-blue-700 border-blue-100',
  'Seguridad':              'bg-red-50 text-red-600 border-red-100',
  'Inclusión':              'bg-purple-50 text-purple-700 border-purple-100',
  'Protección civil':       'bg-orange-50 text-orange-700 border-orange-100',
  'Accesibilidad':          'bg-teal-50 text-teal-700 border-teal-100',
  'Bienestar':              'bg-pink-50 text-pink-700 border-pink-100',
  'Turismo':                'bg-green-50 text-green-700 border-green-100',
  'Comunidad':              'bg-yellow-50 text-yellow-700 border-yellow-100',
  'Certificación':          'bg-[var(--primary)]/8 text-[var(--primary)] border-[var(--primary)]/20',
};

const STATUS_META = {
  done:   { label: 'Completado',  bar: 'bg-[var(--green)]',         text: 'text-[var(--green)]',        badge: 'bg-[var(--green)]/12 text-[var(--green)]' },
  active: { label: 'En curso',    bar: 'bg-[var(--primary)]',   text: 'text-[var(--primary)]',  badge: 'bg-[var(--primary)]/12 text-[var(--primary)]' },
  locked: { label: 'Bloqueado',   bar: 'bg-gray-200',               text: 'text-gray-300',              badge: 'bg-gray-100 text-gray-400' },
};

export default function LearningPage() {
  const [filter, setFilter] = useState<'all' | 'done' | 'active' | 'locked'>('all');

  const done   = MODULES.filter((m) => m.status === 'done').length;
  const active = MODULES.filter((m) => m.status === 'active').length;
  const total  = MODULES.length;
  const progress = Math.round((done / total) * 100);

  const visible = filter === 'all' ? MODULES : MODULES.filter((m) => m.status === filter);

  return (
    <div className="flex flex-col min-h-screen bg-[var(--background)]">
      <NavbarBusiness />

      <main className="flex-1 pt-24 md:pt-20 pb-20 px-4">
        <div className="max-w-6xl mx-auto space-y-8">

          {/* ── Page header ── */}
          <div className="flex items-start gap-3">
            <Link href="/business/dashboard" className="mt-1 text-[var(--primary)] hover:opacity-70 transition-opacity shrink-0">
              <ArrowBackIcon sx={{ fontSize: 22 }} />
            </Link>
            <div>
              <h1 className="text-2xl md:text-3xl font-black text-[var(--primary)]">
                Módulos de Aprendizaje
              </h1>
              <p className="text-sm text-gray-400 font-medium mt-0.5">
                Programa de capacitación inclusiva — MexGO Negocios
              </p>
            </div>
          </div>

          {/* ── Progress banner ── */}
          <div
            className="rounded-3xl p-6 md:p-8 shadow-lg relative overflow-hidden"
            style={{ background: 'linear-gradient(130deg, var(--primary), var(--dark-blue))' }}
          >
            <div className="absolute right-0 top-0 w-56 h-56 rounded-full bg-white/5 -translate-y-1/3 translate-x-1/3" />
            <div className="relative z-10 flex flex-col md:flex-row md:items-center gap-6">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-white/15 flex items-center justify-center text-white shrink-0">
                  <SchoolIcon sx={{ fontSize: 30 }} />
                </div>
                <div className="text-white">
                  <p className="font-black text-xl">{done} de {total} módulos completados</p>
                  <p className="text-white/55 text-sm">{active > 0 ? `${active} módulo en curso` : 'Continúa donde lo dejaste'}</p>
                </div>
              </div>
              <div className="flex-1 md:max-w-xs">
                <div className="flex justify-between text-white/60 text-xs font-bold mb-2">
                  <span>Progreso</span>
                  <span>{progress}%</span>
                </div>
                <div className="h-2.5 bg-white/20 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[var(--secondary)] rounded-full transition-all duration-700"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
              <Link
                href="#modulos"
                className="shrink-0 bg-[var(--secondary)] text-[var(--dark-blue)] font-black text-sm px-5 py-2.5 rounded-xl hover:brightness-110 transition-all text-center"
              >
                Continuar
              </Link>
            </div>
          </div>

          {/* ── Filter tabs ── */}
          <div id="modulos" className="flex gap-2 flex-wrap">
            {([
              { key: 'all',    label: 'Todos',      count: total },
              { key: 'done',   label: 'Completados', count: done },
              { key: 'active', label: 'En curso',    count: active },
              { key: 'locked', label: 'Pendientes',  count: total - done - active },
            ] as const).map((tab) => (
              <button
                key={tab.key}
                onClick={() => setFilter(tab.key)}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-bold transition-all border ${
                  filter === tab.key
                    ? 'bg-[var(--primary)] text-white border-[var(--primary)] shadow-md shadow-[var(--primary)]/20'
                    : 'bg-white text-gray-500 border-gray-100 hover:border-gray-200'
                }`}
              >
                {tab.label}
                <span className={`text-[10px] font-black px-1.5 py-0.5 rounded-full ${filter === tab.key ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-400'}`}>
                  {tab.count}
                </span>
              </button>
            ))}
          </div>

          {/* ── Module grid ── */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {visible.map((mod) => {
              const s = STATUS_META[mod.status];
              const catColor = CATEGORY_COLORS[mod.category] ?? 'bg-gray-50 text-gray-500 border-gray-100';
              const isLocked = mod.status === 'locked';

              return (
                <div
                  key={mod.id}
                  className={`group bg-white rounded-3xl border-2 flex flex-col overflow-hidden transition-all duration-200 ${
                    isLocked
                      ? 'border-gray-100 opacity-65'
                      : 'border-gray-100 hover:border-[var(--primary)]/30 hover:shadow-lg hover:-translate-y-1'
                  }`}
                >
                  {/* Color top bar */}
                  <div className={`h-1 w-full ${s.bar}`} />

                  <div className="p-5 flex flex-col flex-1 gap-4">
                    {/* Icon + status */}
                    <div className="flex items-start justify-between">
                      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border ${catColor}`}>
                        {mod.icon}
                      </div>
                      {isLocked
                        ? <LockIcon sx={{ fontSize: 18 }} className="text-gray-300 mt-1" />
                        : mod.status === 'done'
                          ? <CheckCircleIcon sx={{ fontSize: 18 }} className={`${s.text} mt-1`} />
                          : <PlayIcon sx={{ fontSize: 18 }} className={`${s.text} mt-1`} />
                      }
                    </div>

                    {/* Title + desc */}
                    <div className="flex-1">
                      <p className="font-black text-sm text-gray-900 leading-snug mb-2">{mod.title}</p>
                      <p className="text-xs text-gray-400 leading-relaxed line-clamp-3">{mod.desc}</p>
                    </div>

                    {/* Meta */}
                    <div className="flex items-center justify-between gap-2 pt-1 border-t border-gray-50">
                      <span className={`text-[10px] font-black px-2 py-0.5 rounded-full border ${catColor}`}>
                        {mod.category}
                      </span>
                      <span className="text-[10px] font-bold text-gray-300 uppercase tracking-wide">
                        {mod.duration}
                      </span>
                    </div>

                    {/* CTA */}
                    {!isLocked && (
                      <button className={`w-full py-2.5 rounded-xl text-xs font-black transition-all ${
                        mod.status === 'done'
                          ? 'bg-[var(--green)]/10 text-[var(--green)] hover:bg-[var(--green)]/20'
                          : 'bg-[var(--primary)] text-white hover:brightness-110 shadow-md shadow-[var(--primary)]/20'
                      }`}>
                        {mod.status === 'done' ? 'Ver de nuevo' : 'Iniciar módulo'}
                      </button>
                    )}
                    {isLocked && (
                      <div className="w-full py-2.5 rounded-xl text-xs font-black text-gray-300 bg-gray-50 text-center select-none">
                        Completa los anteriores
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

        </div>
      </main>

      <Footer />
    </div>
  );
}
