'use client';

import React, { useState, useEffect, useRef } from 'react';
import { getStoredAccessToken } from '@/lib/client-auth';
import type { ChatMessagePayload } from '@/types/types';
import {
  SmartToy as SmartToyIcon,
  Send as SendIcon,
} from '@mui/icons-material';

interface BusinessChatProps {
  businessId: string;
}

const SUGERENCIAS = [
  '¿Cuál es mi alerta más urgente?',
  '¿Qué curso me conviene tomar primero?',
  '¿Cómo puedo mejorar mis ventas esta semana?',
  '¿Qué turistas visitan mi zona?',
];

export default function BusinessChat({ businessId }: BusinessChatProps) {
  const [mensajes, setMensajes] = useState<{ role: 'user' | 'model'; text: string }[]>([]);
  const [historial, setHistorial] = useState<ChatMessagePayload[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const saved = sessionStorage.getItem(`mxg_chat_${businessId}`);
    if (saved) {
      try {
        const parsed = JSON.parse(saved) as ChatMessagePayload[];
        setHistorial(parsed);
        setMensajes(parsed.map((m) => ({ role: m.role, text: m.text })));
      } catch {
        // ignore
      }
    }
  }, [businessId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [mensajes, loading]);

  async function handleSend(texto?: string) {
    const msg = (texto ?? input).trim();
    if (!msg || loading) return;
    setInput('');
    setLoading(true);

    setMensajes((prev) => [...prev, { role: 'user', text: msg }]);

    const token = getStoredAccessToken();
    try {
      const res = await fetch(`/api/business/${businessId}/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ mensaje: msg, historial }),
      });
      const data = await res.json();
      if (data.ok) {
        setHistorial(data.data.historial_actualizado);
        sessionStorage.setItem(
          `mxg_chat_${businessId}`,
          JSON.stringify(data.data.historial_actualizado),
        );
        setMensajes((prev) => [...prev, { role: 'model', text: data.data.respuesta }]);
      } else {
        setMensajes((prev) => [
          ...prev,
          { role: 'model', text: 'Lo siento, hubo un error. Intenta de nuevo.' },
        ]);
      }
    } catch {
      setMensajes((prev) => [
        ...prev,
        { role: 'model', text: 'Lo siento, hubo un error de conexión.' },
      ]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
      {/* Header */}
      <div
        className="px-7 py-5 flex items-center gap-3"
        style={{ background: 'linear-gradient(135deg, #0a0f1e, var(--dark-blue))' }}
      >
        <div className="w-9 h-9 rounded-xl bg-white/15 flex items-center justify-center shrink-0">
          <SmartToyIcon sx={{ fontSize: 20 }} className="text-white" />
        </div>
        <div>
          <h2 className="font-black text-white text-base leading-tight">MexGo Advisor</h2>
          <p className="text-white/50 text-xs font-medium">Consultor IA de tu negocio</p>
        </div>
        <div className="ml-auto flex items-center gap-1.5">
          <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
          <span className="text-white/50 text-xs font-bold">En línea</span>
        </div>
      </div>

      {/* Messages */}
      <div className="h-80 overflow-y-auto px-5 py-5 bg-gray-50/50">
        {mensajes.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full gap-4">
            <p className="text-gray-400 text-sm text-center font-medium">
              Pregúntale a MexGo Advisor sobre tu negocio
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 w-full max-w-md">
              {SUGERENCIAS.map((s) => (
                <button
                  key={s}
                  onClick={() => handleSend(s)}
                  className="text-left text-xs font-medium text-[var(--accent)] bg-[var(--accent)]/5 border border-[var(--accent)]/15 rounded-xl px-3 py-2.5 hover:bg-[var(--accent)]/10 transition-colors"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {mensajes.map((m, i) => (
              <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div
                  className={`max-w-[80%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap ${
                    m.role === 'user'
                      ? 'bg-[var(--accent)] text-white rounded-br-sm'
                      : 'bg-white border border-gray-100 text-gray-700 rounded-bl-sm shadow-sm'
                  }`}
                >
                  {m.text}
                </div>
              </div>
            ))}
            {loading && (
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
        )}
      </div>

      {/* Input */}
      <div className="px-5 py-4 border-t border-gray-100 flex gap-3">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleSend();
            }
          }}
          placeholder="Escribe tu pregunta..."
          disabled={loading}
          className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-[var(--accent)] focus:ring-1 focus:ring-[var(--accent)] transition-colors disabled:opacity-50"
        />
        <button
          onClick={() => handleSend()}
          disabled={!input.trim() || loading}
          className="w-10 h-10 rounded-xl bg-[var(--accent)] hover:bg-[var(--dark-green)] disabled:opacity-40 disabled:cursor-not-allowed text-white flex items-center justify-center transition-all shrink-0 shadow-md shadow-[var(--accent)]/20"
        >
          <SendIcon sx={{ fontSize: 18 }} />
        </button>
      </div>
    </div>
  );
}
