'use client'

import { useState, useRef, useEffect } from 'react'
import { Link } from '@/i18n/routing'
import type { ChatMessagePayload, ChatResponse, ItineraryStop, TouristStoredProfile } from '@/types/types'
import { toGeminiProfile } from '@/types/types'
import { MOCK_TOURIST_PROFILE } from '@/lib/mockPerfil'
import { getStoredAccessToken } from '@/lib/client-auth'
import { SmartToy as SmartToyIcon, Send as SendIcon } from '@mui/icons-material'

const SUGERENCIAS = [
  '¿Qué lugares me recomiendas en CDMX?',
  '¿Cómo llego al Zócalo desde Coyoacán?',
  'Agrega Teotihuacán a mi itinerario',
  '¿Qué comer cerca de Bellas Artes?',
]

type RichMessage = ChatMessagePayload & {
  eventosAgregados?: ItineraryStop[]
  eventosEditados?: ItineraryStop[]
  eventosEliminados?: { id: string; label?: string; eliminado: boolean }[]
  negociosRecomendados?: import('@/types/types').NegocioConScore[]
  error?: boolean
}

function leerPerfil(): TouristStoredProfile {
  try {
    const stored = localStorage.getItem('mexgo_tourist_profile')
    if (stored) return JSON.parse(stored) as TouristStoredProfile
  } catch { /* ignore */ }
  return MOCK_TOURIST_PROFILE
}

const CHAT_LS_KEY = 'mexgo_chat_history'
const ITINERARY_LS_KEY = 'mexgo_itinerary'
const MAX_HISTORIAL_API = 20 // máximo de mensajes que se envían a Gemini (10 turnos)

function leerItinerario() {
  try {
    const raw = localStorage.getItem(ITINERARY_LS_KEY)
    return raw ? JSON.parse(raw) : []
  } catch { return [] }
}

function sincronizarItinerario(fn: (prev: import('@/types/types').ItineraryStop[]) => import('@/types/types').ItineraryStop[]) {
  try {
    const prev = leerItinerario()
    localStorage.setItem(ITINERARY_LS_KEY, JSON.stringify(fn(prev)))
  } catch { /* ignore */ }
}

export default function ChatUI() {
  const [historial, setHistorial] = useState<ChatMessagePayload[]>([])
  const [mensajes, setMensajes] = useState<RichMessage[]>([])
  const [input, setInput] = useState('')
  const [cargando, setCargando] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  // Cargar historial guardado al montar
  useEffect(() => {
    try {
      const raw = localStorage.getItem(CHAT_LS_KEY)
      if (raw) {
        const { historial: h, mensajes: m } = JSON.parse(raw)
        if (Array.isArray(h)) setHistorial(h)
        if (Array.isArray(m)) setMensajes(m)
      }
    } catch { /* ignore */ }
  }, [])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [mensajes, cargando])

  function limpiarChat() {
    setHistorial([])
    setMensajes([])
    localStorage.removeItem(CHAT_LS_KEY)
  }

  async function enviarMensaje(texto?: string) {
    const mensaje = (texto ?? input).trim()
    if (!mensaje || cargando) return

    const msgUsuario: RichMessage = { role: 'user', text: mensaje }
    const nuevoHistorial: ChatMessagePayload[] = [...historial, { role: 'user', text: mensaje }]

    setMensajes(prev => [...prev, msgUsuario])
    setHistorial(nuevoHistorial)
    setInput('')
    setCargando(true)

    try {
      const accessToken = getStoredAccessToken()
      if (!accessToken) {
        throw new Error('AUTH_REQUIRED')
      }

      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          mensaje,
          historial: nuevoHistorial.slice(-MAX_HISTORIAL_API),
          perfil: toGeminiProfile(leerPerfil()),
          itinerario: leerItinerario(),
        }),
      })

      if (!res.ok) throw new Error(`HTTP ${res.status}`)

      const data: ChatResponse = await res.json()

      // Sincronizar itinerario en localStorage según lo que hizo Gemini
      if (data.eventosAgregados?.length) {
        sincronizarItinerario(prev => [...prev, ...data.eventosAgregados!])
      }
      if (data.eventosEliminados?.length) {
        const idsEliminados = new Set(data.eventosEliminados.filter(e => e.eliminado).map(e => e.id))
        sincronizarItinerario(prev => prev.filter(s => !idsEliminados.has(s.id)))
      }
      if (data.eventosEditados?.length) {
        const mapaEdits = new Map(data.eventosEditados.map(e => [e.id, e]))
        sincronizarItinerario(prev => prev.map(s => mapaEdits.has(s.id) ? { ...s, ...mapaEdits.get(s.id) } : s))
      }

      const msgModelo: RichMessage = {
        role: 'model',
        text: data.respuesta,
        eventosAgregados: data.eventosAgregados,
        eventosEditados: data.eventosEditados,
        eventosEliminados: data.eventosEliminados,
        negociosRecomendados: data.negociosRecomendados,
      }

      const nuevoHistorialFinal = [...nuevoHistorial, { role: 'model' as const, text: data.respuesta }]
      setHistorial(nuevoHistorialFinal)
      setMensajes(prev => {
        const nuevos = [...prev, msgModelo]
        // Persistir historial + mensajes
        try {
          localStorage.setItem(CHAT_LS_KEY, JSON.stringify({
            historial: nuevoHistorialFinal,
            mensajes: nuevos,
          }))
        } catch { /* ignore */ }
        return nuevos
      })
    } catch (error) {
      if (error instanceof Error && error.message === 'AUTH_REQUIRED') {
        const localeMatch = window.location.pathname.match(/^\/(en|es|fr)(?:\/|$)/)
        const locale = localeMatch?.[1] ?? 'es'
        window.location.assign(`/${locale}?login=1`)
        return
      }

      setMensajes(prev => [
        ...prev,
        { role: 'model', text: 'Hubo un error al conectar con el asistente. Intenta de nuevo.', error: true },
      ])
    } finally {
      setCargando(false)
    }
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      void enviarMensaje()
    }
  }

  return (
    <div className="flex flex-col h-full bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
      {/* Header */}
      <div
        className="px-6 py-4 flex items-center gap-3 shrink-0"
        style={{ background: 'linear-gradient(135deg, var(--dark-blue) 0%, var(--primary) 100%)' }}
      >
        <div className="w-10 h-10 rounded-2xl bg-white/10 flex items-center justify-center shrink-0 backdrop-blur-sm">
          <SmartToyIcon sx={{ fontSize: 22 }} className="text-white" />
        </div>
        <div>
          <h2 className="font-black text-white text-sm leading-tight">MexGo Asistente</h2>
          <p className="text-white/50 text-[11px] font-medium">Tu guía turístico con IA</p>
        </div>
        <div className="ml-auto flex items-center gap-2">
          {mensajes.length > 0 && (
            <button
              onClick={limpiarChat}
              title="Limpiar chat"
              className="text-white/30 hover:text-red-400 text-xs font-bold transition-colors"
            >
              Limpiar
            </button>
          )}
        </div>
      </div>

      {/* Mensajes */}
      <div className="flex-1 overflow-y-auto px-5 py-5 bg-gray-50/50 space-y-4">
        {mensajes.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full gap-4">
            <p className="text-gray-400 text-sm text-center font-medium">
              Hola, soy tu asistente MexGo — ¿qué quieres visitar?
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 w-full max-w-md">
              {SUGERENCIAS.map((s) => (
                <button
                  key={s}
                  onClick={() => enviarMensaje(s)}
                  className="text-left text-xs font-semibold text-[var(--primary)] bg-[var(--primary)]/5 border border-[var(--primary)]/20 rounded-xl px-3 py-2.5 hover:bg-[var(--primary)]/10 transition-colors"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {mensajes.map((m, i) => (
          <div key={i} className={`flex flex-col gap-2 ${m.role === 'user' ? 'items-end' : 'items-start'}`}>
            {/* Burbuja */}
            <div
              className={`max-w-[82%] px-4 py-3 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap ${
                m.role === 'user'
                  ? 'bg-[var(--primary)] text-white rounded-br-sm font-medium'
                  : m.error
                  ? 'bg-red-50 text-red-600 border border-red-200 rounded-bl-sm'
                  : 'bg-white border border-gray-100 text-gray-700 rounded-bl-sm shadow-sm font-medium'
              }`}
            >
              {m.text}
            </div>

            {/* Paradas agregadas */}
            {m.eventosAgregados && m.eventosAgregados.length > 0 && (
              <Link href="/trips" target="_blank" rel="noopener noreferrer"
                className="w-full max-w-sm flex flex-col gap-2 bg-[var(--accent)]/10 border border-[var(--accent)]/30 rounded-2xl p-3 hover:shadow-md hover:border-[var(--accent)] transition-all group shadow-sm"
              >
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-lg">🗓️</span>
                  <p className="font-bold text-sm text-[var(--accent)]">{m.eventosAgregados.length} parada{m.eventosAgregados.length > 1 ? 's' : ''} agregada{m.eventosAgregados.length > 1 ? 's' : ''}</p>
                  <span className="ml-auto text-[var(--accent)] text-xs font-bold opacity-0 group-hover:opacity-100 transition-opacity">Ver Trips →</span>
                </div>
                {m.eventosAgregados.map(e => (
                  <div key={e.id} className="flex items-center gap-2 text-xs text-gray-600">
                    <span className="w-5 h-5 rounded-full bg-[var(--accent)]/20 flex items-center justify-center shrink-0">✅</span>
                    <span className="font-medium truncate">{e.label}</span>
                    <span className="ml-auto shrink-0 text-gray-400">{e.startTime ?? ''}</span>
                  </div>
                ))}
              </Link>
            )}

            {/* Paradas editadas */}
            {m.eventosEditados && m.eventosEditados.length > 0 && (
              <Link href="/trips" target="_blank" rel="noopener noreferrer"
                className="w-full max-w-sm flex flex-col gap-2 bg-[var(--primary)]/10 border border-[var(--primary)]/30 rounded-2xl p-3 hover:shadow-md hover:border-[var(--primary)] transition-all group shadow-sm"
              >
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-lg">✏️</span>
                  <p className="font-bold text-sm text-[var(--primary)]">{m.eventosEditados.length} parada{m.eventosEditados.length > 1 ? 's' : ''} editada{m.eventosEditados.length > 1 ? 's' : ''}</p>
                  <span className="ml-auto text-[var(--primary)] text-xs font-bold opacity-0 group-hover:opacity-100 transition-opacity">Ver Trips →</span>
                </div>
                {m.eventosEditados.map(e => (
                  <div key={e.id} className="flex items-center gap-2 text-xs text-gray-600">
                    <span className="w-5 h-5 rounded-full bg-[var(--primary)]/20 flex items-center justify-center shrink-0">✏️</span>
                    <span className="font-medium truncate">{e.label}</span>
                    <span className="ml-auto shrink-0 text-gray-400">{e.startTime ?? ''}</span>
                  </div>
                ))}
              </Link>
            )}

            {/* Paradas eliminadas */}
            {m.eventosEliminados && m.eventosEliminados.some(e => e.eliminado) && (
              <div className="w-full max-w-sm flex flex-col gap-2 bg-red-50 border border-red-200 rounded-2xl p-3 shadow-sm">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-lg">🗑️</span>
                  <p className="font-bold text-sm text-red-600">{m.eventosEliminados.filter(e => e.eliminado).length} parada{m.eventosEliminados.filter(e => e.eliminado).length > 1 ? 's' : ''} eliminada{m.eventosEliminados.filter(e => e.eliminado).length > 1 ? 's' : ''}</p>
                </div>
                {m.eventosEliminados.filter(e => e.eliminado).map(e => (
                  <div key={e.id} className="flex items-center gap-2 text-xs text-red-500">
                    <span className="w-5 h-5 rounded-full bg-red-100 flex items-center justify-center shrink-0">🗑️</span>
                    <span className="font-medium truncate">{e.label ?? e.id}</span>
                  </div>
                ))}
              </div>
            )}

            {/* Tarjetas de negocios recomendados */}
            {m.negociosRecomendados && m.negociosRecomendados.length > 0 && (
              <div className="w-full max-w-sm space-y-2">
                {m.negociosRecomendados.slice(0, 3).map((negocio) => (
                  <Link
                    key={negocio.id}
                    href={`/discover/${negocio.id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 bg-white border border-gray-100 rounded-2xl p-3 hover:shadow-md hover:border-[var(--primary)]/30 transition-all group shadow-sm"
                  >
                    <div className="w-10 h-10 rounded-xl bg-[var(--primary)]/10 flex items-center justify-center shrink-0 text-lg">
                      🏪
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-sm text-[var(--primary)] truncate">{negocio.businessName}</p>
                      <p className="text-xs text-gray-400 truncate">{negocio.neighborhood}, {negocio.boroughCode}</p>
                    </div>
                    <span className="text-[var(--primary)] text-xs font-bold shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                      Ver →
                    </span>
                  </Link>
                ))}
              </div>
            )}
          </div>
        ))}

        {cargando && (
          <div className="flex justify-start">
            <div className="bg-white border border-gray-100 shadow-sm rounded-2xl rounded-bl-sm px-4 py-3 flex items-center gap-2">
              <div className="flex gap-1">
                {[0, 1, 2].map((i) => (
                  <div
                    key={i}
                    className="w-1.5 h-1.5 rounded-full bg-gray-400 animate-bounce"
                    style={{ animationDelay: `${i * 0.15}s` }}
                  />
                ))}
              </div>
              <span className="text-xs text-gray-400 font-medium">MexGo está pensando...</span>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input area */}
      <div className="px-4 py-3 border-t border-gray-100/80 bg-white flex gap-2 shrink-0">
        <input
          className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-[var(--primary)] focus:ring-1 focus:ring-[var(--primary)] transition-colors disabled:opacity-50"
          placeholder="Escribe tu pregunta..."
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={onKeyDown}
          disabled={cargando}
        />
        <button
          onClick={() => void enviarMensaje()}
          disabled={cargando || !input.trim()}
          className="w-10 h-10 rounded-xl bg-[var(--primary)] hover:bg-[var(--dark-blue)] disabled:opacity-40 disabled:cursor-not-allowed text-white flex items-center justify-center transition-all shrink-0 shadow-md shadow-[var(--primary)]/20"
        >
          <SendIcon sx={{ fontSize: 18 }} />
        </button>
      </div>
    </div>
  )
}
