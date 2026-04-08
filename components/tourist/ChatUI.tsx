'use client'

import { useState, useRef, useEffect } from 'react'
import { Link } from '@/i18n/routing'
import type { ChatMessagePayload, ChatResponse, ItineraryStop, NegocioConScore, TouristProfile } from '@/types/types'
import { MOCK_TOURIST_PROFILE } from '@/lib/mockPerfil'

type RichMessage = ChatMessagePayload & {
  recomendaciones?: NegocioConScore[]
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

export default function ChatUI() {
  const [historial, setHistorial] = useState<ChatMessagePayload[]>([])
  const [mensajes, setMensajes] = useState<RichMessage[]>([])
  const [input, setInput] = useState('')
  const [cargando, setCargando] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [mensajes, cargando])

  async function enviar() {
    const mensaje = input.trim()
    if (!mensaje || cargando) return

    const msgUsuario: RichMessage = { role: 'user', text: mensaje }
    const nuevoHistorial: ChatMessagePayload[] = [...historial, { role: 'user', text: mensaje }]

    setMensajes(prev => [...prev, msgUsuario])
    setHistorial(nuevoHistorial)
    setInput('')
    setCargando(true)

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mensaje, historial, perfil: leerPerfil() }),
      })

      if (!res.ok) throw new Error(`HTTP ${res.status}`)

      const data: ChatResponse = await res.json()

      const msgModelo: RichMessage = {
        role: 'model',
        text: data.respuesta,
        recomendaciones: data.negociosRecomendados,
        eventoAgregado: data.eventoAgregado,
        eventoEditado: data.eventoEditado,
        eventoEliminado: data.eventoEliminado,
      }

      setHistorial([...nuevoHistorial, { role: 'model', text: data.respuesta }])
      setMensajes(prev => [...prev, msgModelo])
    } catch {
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
      enviar()
    }
  }

  return (
    <div className="flex flex-col h-full max-w-2xl mx-auto w-full">
      {/* Mensajes */}
      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-4">
        {mensajes.length === 0 && (
          <div className="text-center mt-16 space-y-2">
            <p className="text-4xl">🇲🇽</p>
            <p className="text-[var(--text-primary)] font-semibold">Hola, soy tu asistente MexGo</p>
            <p className="text-[var(--text-secondary)] text-sm">¿Qué quieres visitar durante el Mundial 2026?</p>
          </div>
        )}

        {mensajes.map((m, i) => (
          <div key={i} className={`flex flex-col gap-2 ${m.role === 'user' ? 'items-end' : 'items-start'}`}>
            {/* Burbuja de texto */}
            <div
              className={`max-w-xs md:max-w-sm rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                m.role === 'user'
                  ? 'bg-[var(--primary)] text-white rounded-br-sm'
                  : m.error
                  ? 'bg-red-50 text-red-600 border border-red-200 rounded-bl-sm'
                  : 'bg-gray-100 text-[var(--text-primary)] rounded-bl-sm'
              }`}
            >
              {m.text}
            </div>

            {/* Cards de recomendaciones */}
            {m.recomendaciones && m.recomendaciones.length > 0 && (
              <div className="w-full max-w-sm space-y-2">
                {m.recomendaciones.map(n => (
                  <Link
                    key={n.id}
                    href={`/discover/${n.id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 bg-white border border-gray-200 rounded-2xl p-3 shadow-sm hover:shadow-md hover:border-[var(--primary)] transition-all group"
                  >
                    <div className="w-10 h-10 rounded-xl bg-[var(--primary)]/10 flex items-center justify-center shrink-0 text-lg">
                      🏪
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-sm text-[var(--primary)] truncate">{n.businessName}</p>
                      <p className="text-xs text-[var(--text-secondary)] truncate">{n.neighborhood}, {n.boroughCode}</p>
                    </div>
                    <span className="text-[var(--primary)] text-xs font-bold opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                      Ver →
                    </span>
                  </Link>
                ))}
              </div>
            )}

            {/* Card evento agregado */}
            {m.eventoAgregado && (
              <Link href="/trips" target="_blank" rel="noopener noreferrer"
                className="w-full max-w-sm flex items-center gap-3 bg-[var(--accent)]/10 border border-[var(--accent)]/30 rounded-2xl p-3 hover:shadow-md hover:border-[var(--accent)] transition-all group"
              >
                <div className="w-10 h-10 rounded-xl bg-[var(--accent)]/20 flex items-center justify-center shrink-0 text-lg">✅</div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-sm text-[var(--accent)] truncate">{m.eventoAgregado.label}</p>
                  <p className="text-xs text-[var(--text-secondary)]">
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
                  <p className="text-xs text-[var(--text-secondary)]">
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
            <div className="bg-gray-100 text-[var(--text-secondary)] rounded-2xl rounded-bl-sm px-4 py-2.5 text-sm flex gap-1 items-center">
              <span className="animate-bounce [animation-delay:0ms]">•</span>
              <span className="animate-bounce [animation-delay:150ms]">•</span>
              <span className="animate-bounce [animation-delay:300ms]">•</span>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="border-t border-gray-200 px-4 py-3 flex gap-2">
        <input
          className="flex-1 rounded-full border border-gray-300 px-4 py-2 text-sm outline-none focus:border-[var(--primary)] transition-colors bg-white text-[var(--text-primary)] placeholder-gray-400"
          placeholder="Escribe un mensaje..."
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={onKeyDown}
          disabled={cargando}
        />
        <button
          onClick={enviar}
          disabled={cargando || !input.trim()}
          className="rounded-full bg-[var(--primary)] px-5 py-2 text-sm font-semibold text-white disabled:opacity-40 hover:brightness-110 transition-all active:scale-95"
        >
          Enviar
        </button>
      </div>
    </div>
  )
}
