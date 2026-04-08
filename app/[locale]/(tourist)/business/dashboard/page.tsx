'use client';

import React from 'react';
import { Link } from '@/i18n/routing';
import NavbarBusiness from '@/components/business/NavbarBusiness';
import Footer from '@/components/tourist/Footer';
import {
  School as SchoolIcon,
  SupportAgent as SupportAgentIcon,
  TrendingUp as TrendingUpIcon,
  People as PeopleIcon,
  ArrowForward as ArrowForwardIcon,
  LocationOn as LocationIcon,
  CheckCircle as CheckIcon,
  RadioButtonUnchecked as EmptyIcon,
  EmojiEvents as TrophyIcon,
} from '@mui/icons-material';

const MOCK = {
  nombre: 'Tacos El Pastorcito',
  alcaldia: 'Coyoacán',
  modulos_completados: 2,
  modulos_total: 11,
  visitas: 450,
};

const MODULOS_PREVIEW = [
  { label: 'Atención a Personas con Discapacidad', done: false, active: true },
  { label: 'Protección Civil y Evacuación', done: false },
  { label: 'Diversidad e Inclusión', done: false },
  { label: 'Accesibilidad Universal en Espacios', done: false },
  { label: 'Salud Mental y Bienestar para Emprendedores', done: false },
];

export default function BusinessDashboardPage() {
  const { modulos_completados: done, modulos_total: total } = MOCK;
  const progress = Math.round((done / total) * 100);

  return (
    <div className="flex flex-col min-h-screen" style={{ background: 'var(--background)' }}>
      <NavbarBusiness />

      <main className="flex-1 pt-24 md:pt-20 pb-24 px-4">
        <div className="max-w-5xl mx-auto space-y-6">

          {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
              HERO — negocio info
          ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
          <div className="relative rounded-[2rem] overflow-hidden shadow-2xl">
            {/* Background layers */}
            <div
              className="absolute inset-0"
              style={{ background: 'linear-gradient(150deg, #0a0f2e 0%, var(--coppel-blue) 60%, #1a3a6b 100%)' }}
            />
            {/* Geometric accent */}
            <div className="absolute inset-0 overflow-hidden">
              <div className="absolute -right-16 -top-16 w-72 h-72 rounded-full border border-white/5" />
              <div className="absolute -right-8 -top-8  w-48 h-48 rounded-full border border-white/8" />
              <div className="absolute right-20 bottom-0 w-32 h-32 rounded-full bg-[var(--secondary)]/10 blur-2xl" />
              <div className="absolute left-0 bottom-0 w-64 h-24 bg-[var(--coppel-blue)]/20 blur-3xl" />
            </div>

            <div className="relative z-10 p-7 md:p-9">
              <div className="flex flex-col md:flex-row md:items-start gap-7">

                {/* Avatar + info */}
                <div className="flex items-center gap-5">
                  <div
                    className="w-16 h-16 md:w-20 md:h-20 rounded-2xl flex items-center justify-center shadow-xl shrink-0"
                    style={{ background: 'linear-gradient(135deg, var(--secondary), var(--coppel-yellow))' }}
                  >
                    <span className="text-3xl font-black text-[var(--dark-blue)]">
                      {MOCK.nombre.charAt(0)}
                    </span>
                  </div>
                  <div>
                    <span className="text-white/40 text-[10px] font-black uppercase tracking-[0.2em] block mb-0.5">
                      Mi negocio
                    </span>
                    <h1 className="text-white font-black text-2xl md:text-3xl leading-tight">
                      {MOCK.nombre}
                    </h1>
                    <p className="text-white/50 text-xs font-medium mt-1.5 flex items-center gap-1">
                      <LocationIcon sx={{ fontSize: 13 }} />
                      {MOCK.alcaldia}, CDMX
                    </p>
                  </div>
                </div>

                {/* Divider */}
                <div className="hidden md:block w-px self-stretch bg-white/10" />

                {/* Quick stats row */}
                <div className="flex gap-6 md:gap-8 flex-wrap">
                  {[
                    { icon: <TrendingUpIcon sx={{ fontSize: 18 }} />, val: MOCK.visitas.toString(), lbl: 'Visitas' },
                    { icon: <SchoolIcon sx={{ fontSize: 18 }} />,     val: `${done}/${total}`,      lbl: 'Módulos' },
                    { icon: <PeopleIcon sx={{ fontSize: 18 }} />,     val: '1,280',                 lbl: 'Comunidad' },
                  ].map((s) => (
                    <div key={s.lbl} className="flex flex-col">
                      <div className="flex items-center gap-1.5 text-white/40 text-xs font-bold mb-1">
                        {s.icon} {s.lbl}
                      </div>
                      <span className="text-white font-black text-xl">{s.val}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
              PROGRESO FORMATIVO (prominent)
          ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
          <div className="bg-white rounded-[2rem] border border-gray-100 shadow-sm overflow-hidden">
            {/* Header */}
            <div className="px-7 pt-7 pb-5 flex items-center justify-between border-b border-gray-50">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-[var(--coppel-blue)]/10 flex items-center justify-center text-[var(--coppel-blue)]">
                  <SchoolIcon sx={{ fontSize: 20 }} />
                </div>
                <div>
                  <h2 className="font-black text-gray-900 text-base leading-tight">Progreso formativo</h2>
                  <p className="text-[11px] text-gray-400 font-medium">Capacitación inclusiva — MexGO Negocios</p>
                </div>
              </div>
              <Link
                href="/business/learning"
                className="text-[11px] font-black text-[var(--coppel-blue)] hover:underline flex items-center gap-1"
              >
                Ver todos <ArrowForwardIcon sx={{ fontSize: 14 }} />
              </Link>
            </div>

            <div className="px-7 py-6 space-y-5">
              {/* Big progress bar */}
              <div>
                <div className="flex items-end justify-between mb-2.5">
                  <div>
                    <span className="text-4xl font-black text-gray-900">{progress}<span className="text-2xl text-gray-300">%</span></span>
                  </div>
                  <span className="text-sm font-bold text-gray-400">
                    {done} de {total} módulos
                  </span>
                </div>
                {/* Segmented bar */}
                <div className="flex gap-1">
                  {Array.from({ length: total }, (_, i) => (
                    <div
                      key={i}
                      className={`h-3 flex-1 rounded-full transition-all duration-300 ${
                        i < done
                          ? 'bg-[var(--coppel-blue)]'
                          : i === done
                          ? 'bg-[var(--secondary)]'
                          : 'bg-gray-100'
                      }`}
                    />
                  ))}
                </div>
                <div className="flex justify-between mt-1.5">
                  <span className="text-[10px] text-gray-300 font-bold">Inicio</span>
                  <span className="text-[10px] text-gray-300 font-bold">Certificación</span>
                </div>
              </div>

              {/* Module checklist preview */}
              <div className="space-y-2">
                {MODULOS_PREVIEW.map((m) => (
                  <div
                    key={m.label}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                      m.active
                        ? 'bg-[var(--coppel-blue)]/6 border border-[var(--coppel-blue)]/15'
                        : m.done
                        ? 'bg-gray-50/80'
                        : 'opacity-45'
                    }`}
                  >
                    {m.done ? (
                      <CheckIcon sx={{ fontSize: 18 }} className="text-[var(--coppel-blue)] shrink-0" />
                    ) : m.active ? (
                      <div className="w-4 h-4 rounded-full border-2 border-[var(--secondary)] shrink-0 flex items-center justify-center">
                        <div className="w-1.5 h-1.5 rounded-full bg-[var(--secondary)]" />
                      </div>
                    ) : (
                      <EmptyIcon sx={{ fontSize: 18 }} className="text-gray-200 shrink-0" />
                    )}
                    <span className={`text-sm font-${m.active ? 'bold' : 'medium'} ${m.done ? 'text-gray-400 line-through' : m.active ? 'text-gray-900' : 'text-gray-400'}`}>
                      {m.label}
                    </span>
                    {m.active && (
                      <span className="ml-auto text-[10px] font-black text-[var(--secondary)] bg-[var(--secondary)]/10 px-2 py-0.5 rounded-full">
                        En curso
                      </span>
                    )}
                  </div>
                ))}
              </div>

              <Link
                href="/business/learning"
                className="flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-[var(--coppel-blue)] text-white font-black text-sm hover:brightness-110 transition-all shadow-md shadow-[var(--coppel-blue)]/20 active:scale-[0.98]"
              >
                Continuar capacitación <ArrowForwardIcon sx={{ fontSize: 18 }} />
              </Link>
            </div>
          </div>

          {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
              ACTION CARDS
          ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Learning card */}
            <Link
              href="/business/learning"
              className="group bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 flex items-start gap-5 p-6"
            >
              <div className="w-11 h-11 rounded-xl bg-[var(--green)]/10 flex items-center justify-center text-[var(--green)] shrink-0">
                <SchoolIcon sx={{ fontSize: 24 }} />
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="text-gray-900 font-black text-base mb-1">Módulos de Aprendizaje</h2>
                <p className="text-gray-400 text-sm leading-relaxed mb-4">
                  Capacitaciones inclusivas: lengua de señas, primeros auxilios, protección civil y más.
                </p>
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-gray-300">{done}/{total} completados</span>
                  <span className="flex items-center gap-1 text-xs font-black text-[var(--coppel-blue)] group-hover:gap-2 transition-all">
                    Ir a módulos <ArrowForwardIcon sx={{ fontSize: 15 }} />
                  </span>
                </div>
              </div>
            </Link>

            {/* Support card */}
            <Link
              href="/business/support"
              className="group bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 flex items-start gap-5 p-6"
            >
              <div className="w-11 h-11 rounded-xl bg-[var(--coppel-blue)]/10 flex items-center justify-center text-[var(--coppel-blue)] shrink-0">
                <SupportAgentIcon sx={{ fontSize: 24 }} />
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="text-gray-900 font-black text-base mb-1">Soporte</h2>
                <p className="text-gray-400 text-sm leading-relaxed mb-4">
                  Resuelve dudas sobre tu registro, módulos o cualquier apoyo que necesites.
                </p>
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-[var(--green)]">Disponible</span>
                  <span className="flex items-center gap-1 text-xs font-black text-[var(--coppel-blue)] group-hover:gap-2 transition-all">
                    Ir a soporte <ArrowForwardIcon sx={{ fontSize: 15 }} />
                  </span>
                </div>
              </div>
            </Link>
          </div>

          {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
              MUNDIAL BANNER
          ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
          <div
            className="rounded-[2rem] p-6 md:p-8 flex flex-col sm:flex-row items-start sm:items-center gap-5 shadow-lg relative overflow-hidden"
            style={{ background: 'linear-gradient(130deg, #0d1b4b, var(--coppel-blue))' }}
          >
            <div className="absolute inset-0 overflow-hidden">
              <div className="absolute right-0 top-0 w-64 h-64 rounded-full bg-white/3 -translate-y-1/2 translate-x-1/3" />
            </div>
            <div className="w-14 h-14 rounded-2xl bg-white/10 flex items-center justify-center text-white shrink-0 relative z-10">
              <TrophyIcon sx={{ fontSize: 30 }} />
            </div>
            <div className="flex-1 relative z-10">
              <p className="text-white font-black text-lg leading-snug">Mundial 2026 — ¡Prepárate!</p>
              <p className="text-white/50 text-sm mt-1 leading-relaxed">
                Completa tus módulos de capacitación para aparecer en el directorio turístico de MexGO.
              </p>
            </div>
            <Link
              href="/business/learning"
              className="relative z-10 shrink-0 bg-[var(--secondary)] text-[var(--dark-blue)] font-black text-sm px-5 py-2.5 rounded-xl hover:brightness-110 transition-all whitespace-nowrap shadow-lg shadow-[var(--secondary)]/20"
            >
              Empezar →
            </Link>
          </div>

        </div>
      </main>

      <Footer />
    </div>
  );
}
