'use client';

import React, { useState } from 'react';
import NavbarBusiness from '@/components/business/NavbarBusiness';
import Footer from '@/components/tourist/Footer';
import { Link } from '@/i18n/routing';
import {
  ArrowBack as ArrowBackIcon,
  SupportAgent as SupportAgentIcon,
  Chat as ChatIcon,
  Email as EmailIcon,
  WhatsApp as WhatsAppIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
} from '@mui/icons-material';

const FAQS = [
  {
    q: '¿Cómo sé si mi negocio fue aceptado en el programa?',
    a: 'Recibirás una notificación por correo electrónico una vez que tu solicitud sea revisada por el equipo de Fundación Coppel. El proceso puede tomar hasta 5 días hábiles.',
  },
  {
    q: '¿Puedo modificar mi registro después de enviarlo?',
    a: 'Sí, puedes actualizar tu información de perfil desde tu pestaña de perfil. Si necesitas cambiar datos del cuestionario original, contacta a soporte.',
  },
  {
    q: '¿Qué incluye el apoyo económico de Fundación Coppel?',
    a: 'Los negocios seleccionados reciben un apoyo directo para invertir en mejoras relacionadas con el Mundial 2026. El monto y condiciones se comunicarán en la notificación de aceptación.',
  },
  {
    q: '¿Las capacitaciones son obligatorias?',
    a: 'Los módulos de aprendizaje son altamente recomendados y forman parte del criterio de evaluación para mantener tu certificación activa.',
  },
  {
    q: '¿Qué pasa si no puedo asistir a la capacitación presencial?',
    a: 'Los módulos online están siempre disponibles. Para las sesiones presenciales, contáctanos con anticipación para reorganizar tu asistencia.',
  },
];

const CONTACT_CHANNELS = [
  {
    icon: <WhatsAppIcon sx={{ fontSize: 28 }} />,
    title: 'WhatsApp',
    desc: 'Respuesta en menos de 2 horas (Lun-Vie 9:00-18:00)',
    cta: 'Escribir mensaje',
    href: 'https://wa.me/5255000000',
    color: 'text-[#25D366] bg-[#25D366]/10 border-[#25D366]/20',
    ctaColor: 'bg-[#25D366] text-white',
  },
  {
    icon: <EmailIcon sx={{ fontSize: 28 }} />,
    title: 'Correo electrónico',
    desc: 'soporte@olamexicomex.go.mx — Respuesta en 24-48h',
    cta: 'Enviar correo',
    href: 'mailto:soporte@olamexicomex.go.mx',
    color: 'text-[var(--primary)] bg-[var(--primary)]/10 border-[var(--primary)]/20',
    ctaColor: 'bg-[var(--primary)] text-white',
  },
  {
    icon: <ChatIcon sx={{ fontSize: 28 }} />,
    title: 'Chat en vivo',
    desc: 'Disponible dentro de la plataforma (próximamente)',
    cta: 'Próximamente',
    href: '#',
    color: 'text-gray-400 bg-gray-50 border-gray-100',
    ctaColor: 'bg-gray-200 text-gray-400 cursor-not-allowed',
    disabled: true,
  },
];

export default function SupportPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <div className="flex flex-col min-h-screen bg-[var(--background)]">
      <NavbarBusiness />

      <main className="flex-1 pt-24 md:pt-20 pb-20 px-4">
        <div className="max-w-3xl mx-auto space-y-8">

          {/* Header */}
          <div className="flex items-center gap-3">
            <Link href="/business/profile" className="text-[var(--primary)] hover:opacity-70 transition-opacity">
              <ArrowBackIcon sx={{ fontSize: 22 }} />
            </Link>
            <div>
              <h1 className="text-2xl font-black text-[var(--primary)]">Soporte</h1>
              <p className="text-sm text-gray-400 font-medium">Estamos para ayudarte — Fundación Coppel</p>
            </div>
          </div>

          {/* Hero */}
          <div
            className="rounded-3xl p-8 text-white shadow-lg relative overflow-hidden"
            style={{ background: 'linear-gradient(135deg, var(--primary), var(--dark-blue))' }}
          >
            <div className="absolute right-0 top-0 w-48 h-48 rounded-full bg-white/5 -translate-y-1/2 translate-x-1/2" />
            <div className="relative z-10 flex items-center gap-5">
              <div className="w-16 h-16 rounded-2xl bg-white/15 flex items-center justify-center shrink-0">
                <SupportAgentIcon sx={{ fontSize: 36 }} />
              </div>
              <div>
                <h2 className="font-black text-xl leading-tight mb-1">¿Cómo podemos ayudarte?</h2>
                <p className="text-white/70 text-sm leading-relaxed">
                  Nuestro equipo está disponible para resolver cualquier duda sobre tu registro, los módulos de capacitación o cualquier apoyo que necesites.
                </p>
              </div>
            </div>
          </div>

          {/* Contact channels */}
          <div className="space-y-3">
            <h2 className="text-xs font-black text-gray-400 uppercase tracking-widest">Canales de contacto</h2>
            <div className="grid gap-3">
              {CONTACT_CHANNELS.map((ch) => (
                <div
                  key={ch.title}
                  className={`bg-white rounded-2xl border-2 p-5 flex items-center gap-5 transition-all ${ch.color} ${!ch.disabled ? 'hover:shadow-md hover:-translate-y-0.5' : ''}`}
                >
                  <div className={`w-14 h-14 rounded-xl flex items-center justify-center border-2 shrink-0 ${ch.color}`}>
                    {ch.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-black text-gray-900 text-sm">{ch.title}</p>
                    <p className="text-xs text-gray-400 font-medium mt-0.5 leading-snug">{ch.desc}</p>
                  </div>
                  <a
                    href={ch.href}
                    target={ch.disabled ? undefined : '_blank'}
                    rel="noopener noreferrer"
                    className={`shrink-0 text-xs font-black px-4 py-2 rounded-xl transition-all ${ch.ctaColor} ${ch.disabled ? 'pointer-events-none' : 'hover:brightness-110 active:scale-95'}`}
                  >
                    {ch.cta}
                  </a>
                </div>
              ))}
            </div>
          </div>

          {/* FAQ */}
          <div className="space-y-3">
            <h2 className="text-xs font-black text-gray-400 uppercase tracking-widest">Preguntas frecuentes</h2>
            <div className="space-y-2">
              {FAQS.map((faq, i) => (
                <div
                  key={i}
                  className={`bg-white rounded-2xl border-2 overflow-hidden transition-all ${
                    openFaq === i ? 'border-[var(--primary)]/30 shadow-sm' : 'border-gray-100'
                  }`}
                >
                  <button
                    className="w-full text-left px-6 py-4 flex items-center justify-between gap-4 cursor-pointer"
                    onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  >
                    <span className="font-bold text-sm text-gray-900 leading-snug">{faq.q}</span>
                    {openFaq === i
                      ? <ExpandLessIcon className="text-[var(--primary)] shrink-0" sx={{ fontSize: 20 }} />
                      : <ExpandMoreIcon className="text-gray-300 shrink-0" sx={{ fontSize: 20 }} />
                    }
                  </button>
                  {openFaq === i && (
                    <div className="px-6 pb-5 animate-in fade-in slide-in-from-top-2 duration-300">
                      <p className="text-sm text-gray-500 leading-relaxed border-t border-gray-50 pt-3">{faq.a}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

        </div>
      </main>

      <Footer />
    </div>
  );
}
