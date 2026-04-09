'use client';

import React, { useState, useEffect } from 'react';
import { Link } from '@/i18n/routing';
import NavbarBusiness from '@/components/business/NavbarBusiness';
import Footer from '@/components/tourist/Footer';
import { getStoredAccessToken } from '@/lib/client-auth';
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
  TipsAndUpdates as RecomendacionesIcon,
} from '@mui/icons-material';

const MOCK = {
  nombre: 'Cargando...',
  alcaldia: '...',
  modulos_completados: 0,
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
  const [businessName, setBusinessName] = useState(MOCK.nombre);
  const [borough, setBorough] = useState(MOCK.alcaldia);

  useEffect(() => {
    const token = getStoredAccessToken();
    if (!token) return;
    fetch('/api/businesses/me', {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((res) => {
        if (res.ok && res.data?.businessName) {
          setBusinessName(res.data.businessName);
          setBorough(res.data.borough || 'CDMX');
        }
      })
      .catch(() => {});
  }, []);

  const done     = MOCK.modulos_completados;
  const total    = MOCK.modulos_total;
  const progress = Math.round((done / total) * 100);

  return (
    <div className="flex flex-col min-h-screen" style={{ background: 'var(--background)' }}>
      <NavbarBusiness />

      <main className="flex-1 pt-24 md:pt-20 pb-24 px-4">
        <div className="max-w-5xl mx-auto space-y-6">

          {/* ── Hero ── */}
          <div className="relative rounded-3xl overflow-hidden shadow-xl">
            <div
              className="absolute inset-0"
              style={{ background: 'linear-gradient(150deg, #0a0f1e 0%, var(--dark-blue) 60%, #0d2a10 100%)' }}
            />
            {/* Geometric accents */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
              <div className="absolute -right-12 -top-12 w-64 h-64 rounded-full border border-[var(--secondary)]/10" />
              <div className="absolute -right-4 -top-4  w-40 h-40 rounded-full border border-[var(--secondary)]/8" />
              <div className="absolute right-24 bottom-0 w-28 h-28 rounded-full bg-[var(--green)]/10 blur-2xl" />
              <div className="absolute left-0 top-0 w-48 h-48 bg-[var(--secondary)]/5 blur-3xl" />
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
                      {businessName.charAt(0)}
                    </span>
                  </div>
                  <div>
                    <span className="text-white/40 text-[10px] font-black uppercase tracking-[0.2em] block mb-0.5">
                      Mi negocio
                    </span>
                    <h1 className="text-white font-black text-2xl md:text-3xl leading-tight">
                      {businessName}
                    </h1>
                    <p className="text-white/50 text-xs font-medium mt-1.5 flex items-center gap-1">
                      <LocationIcon sx={{ fontSize: 13 }} />
                      {borough}, CDMX
                    </p>
                  </div>
                </div>

                {/* Divider */}
                <div className="hidden md:block w-px self-stretch bg-white/10" />

                {/* Quick stats */}
                <div className="flex gap-6 md:gap-8 flex-wrap">
                  {[
                    { icon: <TrendingUpIcon sx={{ fontSize: 18 }} />, val: MOCK.visitas.toString(), lbl: 'Turistas zona' },
                    { icon: <SchoolIcon sx={{ fontSize: 18 }} />,     val: `${done}/${total}`,      lbl: 'Módulos' },
                    { icon: <PeopleIcon sx={{ fontSize: 18 }} />,     val: '1,280',                 lbl: 'Comunidad' },
                  ].map((s) => (
                    <div key={s.lbl} className="flex flex-col">
                      <div className="flex items-center gap-1.5 text-[var(--secondary)]/60 text-xs font-bold mb-1">
                        {s.icon} {s.lbl}
                      </div>
                      <span className="text-white font-black text-xl">{s.val}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* ── Progreso formativo ── */}
          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="px-7 pt-7 pb-5 flex items-center justify-between border-b border-gray-50">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-[var(--accent)]/10 flex items-center justify-center text-[var(--accent)]">
                  <SchoolIcon sx={{ fontSize: 20 }} />
                </div>
                <div>
                  <h2 className="font-black text-gray-900 text-base leading-tight">Progreso formativo</h2>
                  <p className="text-[11px] text-gray-400 font-medium">Capacitación inclusiva — MexGO Negocios</p>
                </div>
              </div>
              <Link
                href="/business/learning"
                className="text-[11px] font-black text-[var(--accent)] hover:underline flex items-center gap-1"
              >
                Ver todos <ArrowForwardIcon sx={{ fontSize: 14 }} />
              </Link>
            </div>

            <div className="px-7 py-6 space-y-5">
              {/* Big progress */}
              <div>
                <div className="flex items-end justify-between mb-2.5">
                  <span className="text-4xl font-black text-gray-900">
                    {progress}<span className="text-2xl text-gray-300">%</span>
                  </span>
                  <span className="text-sm font-bold text-gray-400">{done} de {total} módulos</span>
                </div>
                {/* Segmented bar — amarillo=done, verde=active, gris=pending */}
                <div className="flex gap-1">
                  {Array.from({ length: total }, (_, i) => (
                    <div
                      key={i}
                      className={`h-3 flex-1 rounded-full transition-all duration-300 ${
                        i < done
                          ? 'bg-[var(--secondary)]'
                          : i === done
                          ? 'bg-[var(--green)]'
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

              {/* Module checklist */}
              <div className="space-y-2">
                {MODULOS_PREVIEW.map((m) => (
                  <div
                    key={m.label}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                      m.active
                        ? 'bg-[var(--green)]/6 border border-[var(--green)]/20'
                        : m.done
                        ? 'bg-gray-50/80'
                        : 'opacity-45'
                    }`}
                  >
                    {m.done ? (
                      <CheckIcon sx={{ fontSize: 18 }} className="text-[var(--secondary)] shrink-0" />
                    ) : m.active ? (
                      <div className="w-4 h-4 rounded-full border-2 border-[var(--green)] shrink-0 flex items-center justify-center">
                        <div className="w-1.5 h-1.5 rounded-full bg-[var(--green)]" />
                      </div>
                    ) : (
                      <EmptyIcon sx={{ fontSize: 18 }} className="text-gray-200 shrink-0" />
                    )}
                    <span className={`text-sm font-${m.active ? 'bold' : 'medium'} ${
                      m.done ? 'text-gray-400 line-through' : m.active ? 'text-gray-900' : 'text-gray-400'
                    }`}>
                      {m.label}
                    </span>
                    {m.active && (
                      <span className="ml-auto text-[10px] font-black text-[var(--green)] bg-[var(--green)]/10 px-2 py-0.5 rounded-full">
                        En curso
                      </span>
                    )}
                  </div>
                ))}
              </div>

              <Link
                href="/business/learning"
                className="flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-[var(--accent)] hover:bg-[var(--dark-green)] text-white font-black text-sm transition-all shadow-md shadow-[var(--accent)]/20 active:scale-[0.98]"
              >
                Continuar capacitación <ArrowForwardIcon sx={{ fontSize: 18 }} />
              </Link>
            </div>
          </div>

          {/* ── Action cards ── */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <Link
              href="/business/learning"
              className="group bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 flex items-start gap-5 p-6"
            >
              <div className="w-11 h-11 rounded-xl bg-[var(--green)]/12 flex items-center justify-center text-[var(--accent)] shrink-0">
                <SchoolIcon sx={{ fontSize: 24 }} />
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="text-gray-900 font-black text-base mb-1">Aprendizaje</h2>
                <p className="text-gray-400 text-sm leading-relaxed mb-4">
                  Capacitaciones inclusivas: lengua de señas, primeros auxilios y más.
                </p>
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-gray-300">{done}/{total} completados</span>
                  <span className="flex items-center gap-1 text-xs font-black text-[var(--accent)] group-hover:gap-2 transition-all">
                    Ver <ArrowForwardIcon sx={{ fontSize: 15 }} />
                  </span>
                </div>
              </div>
            </Link>

            <Link
              href="/business/recomendaciones"
              className="group bg-white rounded-2xl border border-[var(--accent)]/20 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 flex items-start gap-5 p-6 relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-[var(--accent)]/3 to-transparent pointer-events-none" />
              <div className="w-11 h-11 rounded-xl bg-[var(--accent)]/12 flex items-center justify-center text-[var(--accent)] shrink-0 relative z-10">
                <RecomendacionesIcon sx={{ fontSize: 24 }} />
              </div>
              <div className="flex-1 min-w-0 relative z-10">
                <h2 className="text-gray-900 font-black text-base mb-1">Recomendaciones IA</h2>
                <p className="text-gray-400 text-sm leading-relaxed mb-4">
                  Análisis de tu zona, alertas y cursos sugeridos por inteligencia artificial.
                </p>
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-black text-[var(--accent)] bg-[var(--accent)]/8 px-2 py-0.5 rounded-full">Gemini AI</span>
                  <span className="flex items-center gap-1 text-xs font-black text-[var(--accent)] group-hover:gap-2 transition-all">
                    Ver <ArrowForwardIcon sx={{ fontSize: 15 }} />
                  </span>
                </div>
              </div>
            </Link>

            <Link
              href="/business/support"
              className="group bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 flex items-start gap-5 p-6"
            >
              <div className="w-11 h-11 rounded-xl bg-[var(--secondary)]/12 flex items-center justify-center text-[var(--dark-blue)] shrink-0">
                <SupportAgentIcon sx={{ fontSize: 24 }} />
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="text-gray-900 font-black text-base mb-1">Soporte</h2>
                <p className="text-gray-400 text-sm leading-relaxed mb-4">
                  Resuelve dudas sobre tu registro, módulos o cualquier apoyo.
                </p>
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-[var(--green)]">Disponible</span>
                  <span className="flex items-center gap-1 text-xs font-black text-[var(--accent)] group-hover:gap-2 transition-all">
                    Ver <ArrowForwardIcon sx={{ fontSize: 15 }} />
                  </span>
                </div>
              </div>
            </Link>
          </div>

          {/* ── Mundial 2026 banner ── */}
          <div
            className="rounded-3xl p-6 md:p-8 flex flex-col sm:flex-row items-start sm:items-center gap-5 shadow-lg relative overflow-hidden"
            style={{ background: 'linear-gradient(135deg, #0a0f1e, var(--dark-blue))' }}
          >
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
              <div className="absolute right-0 top-0 w-56 h-56 rounded-full bg-[var(--secondary)]/5 -translate-y-1/2 translate-x-1/3" />
              <div className="absolute left-0 bottom-0 w-32 h-32 bg-[var(--green)]/8 blur-2xl" />
            </div>
            <div className="w-14 h-14 rounded-2xl bg-[var(--secondary)]/15 flex items-center justify-center text-[var(--secondary)] shrink-0 relative z-10">
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
              className="relative z-10 shrink-0 bg-[var(--green)] hover:bg-[var(--dark-green)] text-white font-black text-sm px-5 py-2.5 rounded-xl transition-all whitespace-nowrap shadow-lg shadow-[var(--green)]/20"
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
