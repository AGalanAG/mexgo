'use client';

import React, { useState, useEffect } from 'react';
import NavbarBusiness from '@/components/business/NavbarBusiness';
import Footer from '@/components/tourist/Footer';
import BusinessChat from '@/components/business/BusinessChat';
import { getStoredAccessToken } from '@/lib/client-auth';
import type { BusinessInsight, CourseRecommendation } from '@/types/types';
import { DEMO_INSIGHT, DEMO_BUSINESS_ID } from '@/constants/demo-data';
import {
  People as PeopleIcon,
  TrendingUp as TrendingUpIcon,
  Public as GlobalIcon,
  Warning as AlertIcon,
  Lightbulb as OpIcon,
  School as SchoolIcon,
  EmojiEvents as BadgeIcon,
  SmartToy as AIIcon,
  AccessibilityNew as AccessIcon,
} from '@mui/icons-material';

// ─── Helpers ──────────────────────────────────────────────────────────────────

const PRIORIDAD_COLOR: Record<CourseRecommendation['prioridad'], string> = {
  alta:  'bg-red-100 text-red-600',
  media: 'bg-orange-100 text-orange-600',
  baja:  'bg-gray-100 text-gray-500',
};

function SkeletonCard() {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-5 animate-pulse space-y-3">
      <div className="h-3 bg-gray-100 rounded-full w-1/3" />
      <div className="h-5 bg-gray-100 rounded-full w-2/3" />
      <div className="h-3 bg-gray-100 rounded-full w-full" />
      <div className="h-3 bg-gray-100 rounded-full w-4/5" />
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function RecomendacionesPage() {
  const [businessId, setBusinessId] = useState<string | null>(null);
  const [insight, setInsight] = useState<BusinessInsight | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const token = getStoredAccessToken();
    if (!token) {
      setError('Sesión no encontrada. Vuelve a iniciar sesión.');
      setLoading(false);
      return;
    }

    fetch('/api/businesses/me', { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => r.json())
      .then((res) => {
        if (!res.ok || !res.data?.businessId) throw new Error('Negocio no encontrado');
        const bId = res.data.businessId as string;
        setBusinessId(bId);
        return fetch(`/api/business/${bId}/insight`, {
          headers: { Authorization: `Bearer ${token}` },
        });
      })
      .then((r) => r.json())
      .then((res) => {
        if (res.ok && res.data?.insight) setInsight(res.data.insight as BusinessInsight);
        else throw new Error('No se pudo obtener el informe');
      })
      .catch(() => {
        // Sin Supabase o error de red → mostrar datos demo
        setBusinessId(DEMO_BUSINESS_ID);
        setInsight(DEMO_INSIGHT);
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="flex flex-col min-h-screen" style={{ background: 'var(--background)' }}>
      <NavbarBusiness />

      <main className="flex-1 pt-24 md:pt-20 pb-24 px-4">
        <div className="max-w-5xl mx-auto space-y-8">

          {/* ── Header ── */}
          <div>
            <div className="flex items-center gap-3 mb-1">
              <div className="w-10 h-10 rounded-xl bg-[var(--accent)]/10 flex items-center justify-center text-[var(--accent)]">
                <AIIcon sx={{ fontSize: 22 }} />
              </div>
              <h1 className="text-2xl md:text-3xl font-black text-gray-900">Recomendaciones IA</h1>
            </div>
            <p className="text-gray-400 text-sm pl-13 ml-[52px]">
              Análisis personalizado de tu negocio y zona, generado por Gemini AI
            </p>
          </div>

          {/* ── Error ── */}
          {error && (
            <div className="bg-red-50 border border-red-100 rounded-2xl px-6 py-4 text-sm text-red-600 font-medium">
              {error}
            </div>
          )}

          {/* ══════════════════════════════════════════════════════════════════
              ZONA 1 — ESTADÍSTICAS DE TU ZONA
          ══════════════════════════════════════════════════════════════════ */}
          <section className="space-y-4">
            <h2 className="font-black text-gray-800 text-lg flex items-center gap-2">
              <span className="w-1 h-5 rounded-full bg-[var(--secondary)]" />
              Estadísticas de tu zona
            </h2>

            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {[1, 2, 3].map((i) => <SkeletonCard key={i} />)}
              </div>
            ) : insight ? (
              <>
                {/* Stat cards row */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex items-center gap-4">
                    <div className="w-11 h-11 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 shrink-0">
                      <PeopleIcon sx={{ fontSize: 22 }} />
                    </div>
                    <div>
                      <p className="text-[11px] font-black uppercase tracking-widest text-gray-400 mb-0.5">Turistas en zona</p>
                      <p className="text-2xl font-black text-gray-900">{insight.zona.totalTuristasRegistrados.toLocaleString()}</p>
                      <p className="text-[11px] text-gray-400 font-medium">últimos 30 días</p>
                    </div>
                  </div>

                  <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex items-center gap-4">
                    <div className="w-11 h-11 rounded-xl bg-purple-50 flex items-center justify-center text-purple-600 shrink-0">
                      <GlobalIcon sx={{ fontSize: 22 }} />
                    </div>
                    <div>
                      <p className="text-[11px] font-black uppercase tracking-widest text-gray-400 mb-0.5">Países top</p>
                      <p className="text-sm font-black text-gray-900 leading-snug">
                        {insight.zona.paisesTop.slice(0, 3).join(', ') || '—'}
                      </p>
                      <p className="text-[11px] text-gray-400 font-medium">principales orígenes</p>
                    </div>
                  </div>

                  <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex items-center gap-4">
                    <div className="w-11 h-11 rounded-xl bg-green-50 flex items-center justify-center text-green-600 shrink-0">
                      <TrendingUpIcon sx={{ fontSize: 22 }} />
                    </div>
                    <div>
                      <p className="text-[11px] font-black uppercase tracking-widest text-gray-400 mb-0.5">Saturación zona</p>
                      <p className="text-2xl font-black text-gray-900">
                        {insight.zona.promedioSaturacionZona > 0.6 ? 'Alta' : insight.zona.promedioSaturacionZona > 0.3 ? 'Media' : 'Baja'}
                      </p>
                      <p className="text-[11px] text-gray-400 font-medium">actividad turística</p>
                    </div>
                  </div>
                </div>

                {/* Accesibilidad + motivos */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Accesibilidad breakdown */}
                  <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-3">
                    <h3 className="text-sm font-black text-gray-700 flex items-center gap-2">
                      <AccessIcon sx={{ fontSize: 16 }} className="text-[var(--accent)]" />
                      Necesidades de accesibilidad
                    </h3>
                    <div className="space-y-2.5">
                      {Object.entries(insight.zona.accessibilityBreakdown)
                        .filter(([, v]) => v > 0)
                        .sort(([, a], [, b]) => b - a)
                        .map(([k, v]) => (
                          <div key={k}>
                            <div className="flex justify-between text-xs font-medium text-gray-600 mb-1">
                              <span className="capitalize">{k.replace(/_/g, ' ')}</span>
                              <span className="font-black">{v}%</span>
                            </div>
                            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-[var(--accent)] rounded-full transition-all"
                                style={{ width: `${v}%` }}
                              />
                            </div>
                          </div>
                        ))}
                    </div>
                  </div>

                  {/* Motivos + estadia */}
                  <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-4">
                    <h3 className="text-sm font-black text-gray-700">Motivos de viaje</h3>
                    <div className="flex flex-wrap gap-2">
                      {insight.zona.motivosTop.map((motivo) => (
                        <span
                          key={motivo}
                          className="text-xs font-bold px-3 py-1.5 bg-[var(--secondary)]/10 text-[var(--dark-blue)] rounded-full capitalize"
                        >
                          {motivo.replace(/_/g, ' ')}
                        </span>
                      ))}
                    </div>
                    <div className="pt-2 border-t border-gray-50">
                      <p className="text-[11px] text-gray-400 font-medium mb-0.5">Estadía promedio</p>
                      <p className="text-sm font-black text-gray-800">{insight.zona.estadiaPromedio}</p>
                    </div>
                  </div>
                </div>
              </>
            ) : null}
          </section>

          {/* ══════════════════════════════════════════════════════════════════
              ZONA 2 — RECOMENDACIONES IA
          ══════════════════════════════════════════════════════════════════ */}
          <section className="space-y-5">
            <h2 className="font-black text-gray-800 text-lg flex items-center gap-2">
              <span className="w-1 h-5 rounded-full bg-[var(--accent)]" />
              Análisis IA
            </h2>

            {loading ? (
              <div className="space-y-4">
                <SkeletonCard />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <SkeletonCard />
                  <SkeletonCard />
                </div>
              </div>
            ) : insight ? (
              <>
                {/* Resumen */}
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                  <p className="text-sm leading-relaxed text-gray-600 italic">
                    &ldquo;{insight.resumen}&rdquo;
                  </p>
                </div>

                {/* Alertas + Oportunidades */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Alertas */}
                  {insight.alertas.length > 0 && (
                    <div className="bg-white rounded-2xl border border-yellow-100 shadow-sm p-5 space-y-3">
                      <h3 className="text-sm font-black text-gray-800 flex items-center gap-2">
                        <AlertIcon sx={{ fontSize: 16 }} className="text-yellow-500" />
                        Alertas de tu zona
                      </h3>
                      <div className="space-y-2">
                        {insight.alertas.map((alerta, i) => (
                          <div key={i} className="flex gap-2.5 text-xs text-gray-600 bg-yellow-50 rounded-xl px-4 py-3 border border-yellow-100/50">
                            <span className="shrink-0 font-black text-yellow-500">!</span>
                            {alerta}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Oportunidades */}
                  {insight.oportunidades.length > 0 && (
                    <div className="bg-white rounded-2xl border border-green-100 shadow-sm p-5 space-y-3">
                      <h3 className="text-sm font-black text-gray-800 flex items-center gap-2">
                        <OpIcon sx={{ fontSize: 16 }} className="text-green-500" />
                        Oportunidades detectadas
                      </h3>
                      <div className="space-y-2">
                        {insight.oportunidades.map((op, i) => (
                          <div key={i} className="flex gap-2.5 text-xs text-gray-600 bg-green-50 rounded-xl px-4 py-3 border border-green-100/50">
                            <span className="shrink-0 font-black text-green-600">→</span>
                            {op}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Cursos recomendados */}
                {insight.cursos_recomendados.length > 0 && (
                  <div className="space-y-3">
                    <h3 className="text-sm font-black text-gray-700 flex items-center gap-2">
                      <SchoolIcon sx={{ fontSize: 16 }} className="text-[var(--accent)]" />
                      Cursos recomendados para ti
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {insight.cursos_recomendados.map((rec) => (
                        <div
                          key={rec.slug}
                          className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-3 hover:shadow-md transition-shadow"
                        >
                          <div className="flex items-start justify-between gap-2">
                            <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-md ${PRIORIDAD_COLOR[rec.prioridad]}`}>
                              Prioridad {rec.prioridad}
                            </span>
                            {rec.impacto_insignia && (
                              <span className="flex items-center gap-1 text-[10px] font-bold text-[var(--secondary)] bg-[var(--secondary)]/10 px-2 py-0.5 rounded-full shrink-0">
                                <BadgeIcon sx={{ fontSize: 11 }} />
                                {rec.impacto_insignia}
                              </span>
                            )}
                          </div>
                          <h4 className="font-black text-gray-900 text-sm leading-snug">{rec.titulo}</h4>
                          <p className="text-xs text-gray-500 leading-relaxed">{rec.razon}</p>
                          <button className="w-full py-2 bg-[var(--accent)] hover:bg-[var(--dark-green)] text-white text-xs font-black rounded-xl transition-colors">
                            Empezar módulo
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            ) : null}
          </section>

          {/* ══════════════════════════════════════════════════════════════════
              ZONA 3 — CHAT CONVERSACIONAL
          ══════════════════════════════════════════════════════════════════ */}
          <section className="space-y-4">
            <h2 className="font-black text-gray-800 text-lg flex items-center gap-2">
              <span className="w-1 h-5 rounded-full bg-blue-400" />
              Conversa con MexGo Advisor
            </h2>

            {loading ? (
              <div className="bg-white rounded-3xl border border-gray-100 shadow-sm h-96 animate-pulse" />
            ) : businessId ? (
              <BusinessChat businessId={businessId} />
            ) : (
              <div className="bg-gray-50 rounded-3xl border border-gray-100 p-8 text-center text-sm text-gray-400 font-medium">
                El chat estará disponible cuando se cargue tu negocio.
              </div>
            )}
          </section>

        </div>
      </main>

      <Footer />
    </div>
  );
}
