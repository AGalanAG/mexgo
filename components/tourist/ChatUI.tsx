'use client'

import { useState, useRef, useEffect } from 'react'
import type { ChatMessage, ChatResponse } from '@/types/types'

export default function ChatUI() {
  const [historial, setHistorial] = useState<ChatMessage[]>([])
  const [input, setInput] = useState('')
  const [cargando, setCargando] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [historial, cargando])

  async function enviar() {
    const mensaje = input.trim()
    if (!mensaje || cargando) return

    const nuevoHistorial: ChatMessage[] = [
      ...historial,
      { role: 'user', text: mensaje },
    ]
    setHistorial(nuevoHistorial)
    setInput('')
    setCargando(true)

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mensaje, historial }),
      })
      const data: ChatResponse = await res.json()

      setHistorial([
        ...nuevoHistorial,
        { role: 'model', text: data.respuesta },
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
        {historial.length === 0 && (
          <p className="text-center text-zinc-400 text-sm mt-16">
            Hola, soy tu asistente MexGo. ¿Qué quieres visitar hoy?
          </p>
        )}
        {historial.map((m, i) => (
          <div
            key={i}
            className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-xs rounded-2xl px-4 py-2 text-sm leading-relaxed ${
                m.role === 'user'
                  ? 'bg-green-600 text-white rounded-br-sm'
                  : 'bg-zinc-100 text-zinc-800 rounded-bl-sm'
              }`}
            >
              {m.text}
            </div>
          </div>
        ))}
        {cargando && (
          <div className="flex justify-start">
            <div className="bg-zinc-100 text-zinc-400 rounded-2xl rounded-bl-sm px-4 py-2 text-sm">
              ...
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="border-t border-zinc-200 px-4 py-3 flex gap-2">
        <input
          className="flex-1 rounded-full border border-zinc-300 px-4 py-2 text-sm outline-none focus:border-green-500 transition-colors"
          placeholder="Escribe un mensaje..."
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={onKeyDown}
          disabled={cargando}
        />
        <button
          onClick={enviar}
          disabled={cargando || !input.trim()}
          className="rounded-full bg-green-600 px-5 py-2 text-sm font-medium text-white disabled:opacity-40 hover:bg-green-700 transition-colors"
        >
          Enviar
        </button>
      </div>
    </div>
  )
}
