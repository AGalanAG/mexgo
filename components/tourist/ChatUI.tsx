'use client'

import { useState, useRef, useEffect } from 'react'
import { Link } from '@/i18n/routing'
import type { ChatMessagePayload, ChatResponse, ItineraryStop, TouristProfile } from '@/types/types'
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
  eventoAgregado?: ItineraryStop
  eventoEditado?: ItineraryStop
  eventoEliminado?: { id: string; label?: string; eliminado: boolean }
  error?: boolean
}

function leerPerfil(): TouristProfile {
  try {
    const stored = localStorage.getItem('mexgo_tourist_profile')
    if (stored) return JSON.parse(stored) as TouristProfile
  } catch { /* ignore */ }
  return MOCK_TOURIST_PROFILE
}

const CHAT_LS_KEY = 'mexgo_chat_history'
const ITINERARY_LS_KEY = 'mexgo_itinerary'

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
          historial,
          perfil: leerPerfil(),
          itinerario: leerItinerario(),
        }),
      })

      if (!res.ok) throw new Error(`HTTP ${res.status}`)

      const data: ChatResponse = await res.json()

      // Sincronizar itinerario en localStorage según lo que hizo Gemini
      if (data.eventoAgregado) {
        sincronizarItinerario(prev => [...prev, data.eventoAgregado!])
      }
      if (data.eventoEliminado?.eliminado) {
        sincronizarItinerario(prev => prev.filter(s => s.id !== data.eventoEliminado!.id))
      }
      if (data.eventoEditado) {
        sincronizarItinerario(prev =>
          prev.map(s => s.id === data.eventoEditado!.id ? { ...s, ...data.eventoEditado } : s)
        )
      }

      const msgModelo: RichMessage = {
        role: 'model',
        text: data.respuesta,
        eventoAgregado: data.eventoAgregado,
        eventoEditado: data.eventoEditado,
        eventoEliminado: data.eventoEliminado,
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
    <div className="flex flex-col h-full">
      {/* Header */}
      <div
        className="px-7 py-5 flex items-center gap-3 shrink-0 bg-[var(--primary)]"
      >
        <div className="w-9 h-9 rounded-xl bg-white/15 flex items-center justify-center shrink-0">
          <SmartToyIcon sx={{ fontSize: 20 }} className="text-white" />
        </div>
        <div>
          <h2 className="font-black text-white text-base leading-tight">MexGo Asistente</h2>
          <p className="text-white/50 text-xs font-medium">Tu guía turístico con IA</p>
        </div>
        <div className="ml-auto flex items-center gap-3">
          {mensajes.length > 0 && (
            <button
              onClick={limpiarChat}
              title="Limpiar chat"
              className="text-white/40 hover:text-red-400 text-xs font-bold transition-colors"
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
                  className="text-left text-xs font-medium text-[var(--primary)] bg-[var(--primary)]/5 border border-[var(--primary)]/15 rounded-xl px-3 py-2.5 hover:bg-[var(--primary)]/10 transition-colors"
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
              className={`max-w-[80%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap ${
                m.role === 'user'
                  ? 'bg-[var(--primary)] text-white rounded-br-sm'
                  : m.error
                  ? 'bg-red-50 text-red-600 border border-red-200 rounded-bl-sm'
                  : 'bg-white border border-gray-100 text-gray-700 rounded-bl-sm shadow-sm'
              }`}
            >
              {m.text}
            </div>

            {/* Card evento agregado */}
            {m.eventoAgregado && (
              <Link href="/trips" target="_blank" rel="noopener noreferrer"
                className="w-full max-w-sm flex items-center gap-3 bg-[var(--accent)]/10 border border-[var(--accent)]/30 rounded-2xl p-3 hover:shadow-md hover:border-[var(--accent)] transition-all group"
              >
                <div className="w-10 h-10 rounded-xl bg-[var(--accent)]/20 flex items-center justify-center shrink-0 text-lg">✅</div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-sm text-[var(--accent)] truncate">{m.eventoAgregado.label}</p>
                  <p className="text-xs text-gray-500">
                    📅 {m.eventoAgregado.routeDate}{m.eventoAgregado.startTime && ` · ${m.eventoAgregado.startTime}`}
                  </p>
                </div>
                <span className="text-[var(--accent)] text-xs font-bold shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">Ver Trips →</span>
              </Link>
            )}

            {/* Card evento editado */}
            {m.eventoEditado && (
              <Link href="/trips" target="_blank" rel="noopener noreferrer"
                className="w-full max-w-sm flex items-center gap-3 bg-[var(--primary)]/10 border border-[var(--primary)]/30 rounded-2xl p-3 hover:shadow-md hover:border-[var(--primary)] transition-all group"
              >
                <div className="w-10 h-10 rounded-xl bg-[var(--primary)]/20 flex items-center justify-center shrink-0 text-lg">✏️</div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-sm text-[var(--primary)] truncate">{m.eventoEditado.label}</p>
                  <p className="text-xs text-gray-500">
                    📅 {m.eventoEditado.routeDate}{m.eventoEditado.startTime && ` · ${m.eventoEditado.startTime}`}
                  </p>
                </div>
                <span className="text-[var(--primary)] text-xs font-bold shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">Ver Trips →</span>
              </Link>
            )}

            {/* Card evento eliminado */}
            {m.eventoEliminado?.eliminado && (
              <div className="w-full max-w-sm flex items-center gap-3 bg-red-50 border border-red-200 rounded-2xl p-3">
                <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center shrink-0 text-lg">🗑️</div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-sm text-red-600 truncate">
                    {m.eventoEliminado.label ?? 'Parada eliminada'}
                  </p>
                  <p className="text-xs text-red-400">Eliminado del itinerario</p>
                </div>
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

      {/* Input */}
      <div className="px-5 py-4 border-t border-gray-100 flex gap-3 shrink-0">
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
