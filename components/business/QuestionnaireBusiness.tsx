"use client";

import React, { useState } from "react";

const BOROUGHS = [
  "Álvaro Obregón", "Azcapotzalco", "Benito Juárez", "Coyoacán", "Cuajimalpa",
  "Cuauhtémoc", "Gustavo A. Madero", "Iztacalco", "Iztapalapa", "Magdalena Contreras",
  "Miguel Hidalgo", "Milpa Alta", "Tláhuac", "Tlalpan", "Venustiano Carranza", "Xochimilco"
];

const OPERATION_MODES = [
  "Local físico", "Venta a domicilio", "Bazares / Tianguis",
  "Venta a negocios (B2B)", "Venta ambulante", "Otro"
];

const SAT_STATUS = [
  { id: "formal", label: "Formal / Registrado" },
  { id: "process", label: "En proceso" },
  { id: "interested", label: "No, pero me interesa" },
  { id: "notInterested", label: "No me interesa" },
];

const QuestionnaireBusiness: React.FC = () => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    // Step 1: Propietario
    owner_full_name: "",
    owner_age: "",
    owner_gender: "",
    owner_email: "",
    owner_whatsapp: "",
    // Step 2: Ubicación
    borough_code: "",
    neighborhood: "",
    google_maps_url: "",
    operation_days_hours: "",
    // Step 3: El Negocio
    business_name: "",
    business_description: "",
    business_start_range: "",
    operation_modes: [] as string[],
    employees_women_count: "0",
    employees_men_count: "0",
    // Step 4: Impacto y Mundial
    sat_status: "",
    adaptation_for_world_cup: "",
    support_usage: "",
    // Step 5: Capacitación
    training_campus_preference: ""
  });

  const totalSteps = 5;

  const nextStep = () => {
    setStep((prev) => Math.min(prev + 1, totalSteps));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const prevStep = () => {
    setStep((prev) => Math.max(prev - 1, 1));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const isNextDisabled = () => {
    if (step === 1) {
      return !formData.owner_full_name || !formData.owner_age || !formData.owner_gender || !formData.owner_whatsapp;
    }
    if (step === 2) {
      return !formData.borough_code || !formData.neighborhood || !formData.google_maps_url || !formData.operation_days_hours;
    }
    if (step === 3) {
      return !formData.business_name || !formData.business_description || !formData.business_start_range;
    }
    if (step === 4) {
      return !formData.sat_status || !formData.adaptation_for_world_cup || !formData.support_usage;
    }
    if (step === 5) {
      return !formData.training_campus_preference;
    }
    return false;
  };

  return (
    <div className="mx-auto max-w-2xl w-full bg-white p-6 md:p-10 font-sans shadow-xl rounded-3xl relative border border-gray-100 mb-10 text-black">
      {/* Header */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <div className="space-y-1">
            <span className="text-xs font-bold uppercase tracking-wider text-gray-400">Registro de Negocio</span>
            <h1 className="text-xl font-bold text-[#1C42E8]">Sello Ola México</h1>
          </div>
          <span className="text-sm font-bold text-[#1C42E8]">Paso {step} de {totalSteps}</span>
        </div>
        <div className="flex space-x-1">
          {[1, 2, 3, 4, 5].map((s) => (
            <div
              key={s}
              className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${
                s < step ? "bg-[#1C42E8]" : s === step ? "bg-[#E8C247]" : "bg-gray-200"
              }`}
            />
          ))}
        </div>
      </div>

      {/* Form Steps */}
      <form className="space-y-6">

        {/* Step 1: Datos del Propietario */}
        {step === 1 && (
          <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <h2 className="text-2xl font-bold text-[#1C42E8] mb-6">Datos del Propietario</h2>
            <div>
              <label className="block text-sm font-semibold mb-2 text-gray-900">Nombre completo</label>
              <input
                type="text"
                className="w-full p-4 border-2 border-gray-100 rounded-2xl focus:border-[#1C42E8] outline-none transition-all text-gray-900 bg-gray-50/30"
                value={formData.owner_full_name}
                onChange={(e) => setFormData({...formData, owner_full_name: e.target.value})}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold mb-2 text-gray-900">Edad</label>
                <input
                  type="number"
                  className="w-full p-4 border-2 border-gray-100 rounded-2xl focus:border-[#1C42E8] outline-none text-gray-900 bg-gray-50/30"
                  value={formData.owner_age}
                  onChange={(e) => setFormData({...formData, owner_age: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-2 text-gray-900">Género</label>
                <select
                  className="w-full p-4 border-2 border-gray-100 rounded-2xl outline-none focus:border-[#1C42E8] text-gray-900 bg-gray-50/30 cursor-pointer"
                  value={formData.owner_gender}
                  onChange={(e) => setFormData({...formData, owner_gender: e.target.value})}
                >
                  <option value="">Selecciona</option>
                  <option value="Mujer">Mujer</option>
                  <option value="Hombre">Hombre</option>
                  <option value="Otro">Otro</option>
                </select>
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold mb-2 text-gray-900">WhatsApp</label>
              <input
                type="tel"
                placeholder="55 0000 0000"
                className="w-full p-4 border-2 border-gray-100 rounded-2xl focus:border-[#1C42E8] outline-none text-gray-900 bg-gray-50/30"
                value={formData.owner_whatsapp}
                onChange={(e) => setFormData({...formData, owner_whatsapp: e.target.value})}
              />
            </div>
          </div>
        )}

        {/* Step 2: Ubicación */}
        {step === 2 && (
          <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <h2 className="text-2xl font-bold text-[#1C42E8] mb-6">Ubicación y Horarios</h2>
            <div>
              <label className="block text-sm font-semibold mb-2 text-gray-900">Alcaldía (CDMX)</label>
              <select
                className="w-full p-4 border-2 border-gray-100 rounded-2xl outline-none focus:border-[#1C42E8] text-gray-900 bg-gray-50/30 cursor-pointer appearance-auto"
                value={formData.borough_code}
                onChange={(e) => setFormData({...formData, borough_code: e.target.value})}
              >
                <option value="">Selecciona alcaldía</option>
                {BOROUGHS.map(b => <option key={b} value={b}>{b}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold mb-2 text-gray-900">Colonia</label>
              <input
                type="text"
                className="w-full p-4 border-2 border-gray-100 rounded-2xl focus:border-[#1C42E8] outline-none text-gray-900 bg-gray-50/30"
                value={formData.neighborhood}
                onChange={(e) => setFormData({...formData, neighborhood: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-2 text-gray-900">URL de Google Maps</label>
              <input
                type="url"
                placeholder="https://goo.gl/maps/..."
                className="w-full p-4 border-2 border-gray-100 rounded-2xl focus:border-[#1C42E8] outline-none text-gray-900 bg-gray-50/30"
                value={formData.google_maps_url}
                onChange={(e) => setFormData({...formData, google_maps_url: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-2 text-gray-900">Días y Horarios de atención</label>
              <textarea
                placeholder="Ej. Lunes a Viernes 9:00 - 18:00"
                className="w-full p-4 border-2 border-gray-100 rounded-2xl focus:border-[#1C42E8] outline-none text-gray-900 bg-gray-50/30 h-24 resize-none"
                value={formData.operation_days_hours}
                onChange={(e) => setFormData({...formData, operation_days_hours: e.target.value})}
              />
            </div>
          </div>
        )}

        {/* Step 3: El Negocio */}
        {step === 3 && (
          <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <h2 className="text-2xl font-bold text-[#1C42E8] mb-6">Perfil del Negocio</h2>
            <div>
              <label className="block text-sm font-semibold mb-2 text-gray-900">Nombre del Negocio</label>
              <input
                type="text"
                className="w-full p-4 border-2 border-gray-100 rounded-2xl focus:border-[#1C42E8] outline-none text-gray-900 bg-gray-50/30"
                value={formData.business_name}
                onChange={(e) => setFormData({...formData, business_name: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-2 text-gray-900">Descripción (Máx. 150 car.)</label>
              <textarea
                maxLength={150}
                className="w-full p-4 border-2 border-gray-100 rounded-2xl focus:border-[#1C42E8] outline-none text-gray-900 bg-gray-50/30 h-20 resize-none"
                value={formData.business_description}
                onChange={(e) => setFormData({...formData, business_description: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-2 text-gray-900">¿Cuánto tiempo lleva operando?</label>
              <select
                className="w-full p-4 border-2 border-gray-100 rounded-2xl outline-none focus:border-[#1C42E8] text-gray-900 bg-gray-50/30 cursor-pointer"
                value={formData.business_start_range}
                onChange={(e) => setFormData({...formData, business_start_range: e.target.value})}
              >
                <option value="">Selecciona rango</option>
                <option value="MENOS_1_ANO">Menos de 1 año</option>
                <option value="A1_A3">1 a 3 años</option>
                <option value="A3_A5">3 a 5 años</option>
                <option value="MAS_5">Más de 5 años</option>
              </select>
            </div>
          </div>
        )}

        {/* Step 4: Impacto y Mundial */}
        {step === 4 && (
          <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <h2 className="text-2xl font-bold text-[#1C42E8] mb-6">Impacto Social y Mundial 2026</h2>
            <div>
              <label className="block text-sm font-semibold mb-2 text-gray-900">Situación ante el SAT</label>
              <div className="grid gap-2">
                {SAT_STATUS.map(opt => (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setFormData({...formData, sat_status: opt.id})}
                    className={`p-4 rounded-2xl border-2 transition-all text-left text-sm font-medium ${
                      formData.sat_status === opt.id ? "border-[#1C42E8] bg-[#1C42E8]/5 text-[#1C42E8]" : "border-gray-100 text-gray-700"
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold mb-2 text-gray-900">¿Cómo te adaptarás para el Mundial 2026?</label>
              <textarea
                placeholder="Ej. Menú en inglés, pago con tarjeta, etc."
                className="w-full p-4 border-2 border-gray-100 rounded-2xl focus:border-[#1C42E8] outline-none text-gray-900 bg-gray-50/30 h-24 resize-none"
                value={formData.adaptation_for_world_cup}
                onChange={(e) => setFormData({...formData, adaptation_for_world_cup: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-2 text-gray-900">¿En qué invertirías el apoyo de Fundación Coppel?</label>
              <textarea
                placeholder="Ej. Remodelación, marketing, inventario..."
                className="w-full p-4 border-2 border-gray-100 rounded-2xl focus:border-[#1C42E8] outline-none text-gray-900 bg-gray-50/30 h-24 resize-none"
                value={formData.support_usage}
                onChange={(e) => setFormData({...formData, support_usage: e.target.value})}
              />
            </div>
          </div>
        )}

        {/* Step 5: Capacitación */}
        {step === 5 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <h2 className="text-2xl font-bold text-[#1C42E8] mb-6">Preferencia de Capacitación</h2>
            <div className="grid gap-4">
              {[
                {
                  id: "HUB_AZTECA",
                  label: "Hub Azteca",
                  desc: "Cercanía estratégica al Estadio Azteca.",
                  icon: "🏟️"
                },
                {
                  id: "MIDE",
                  label: "MIDE",
                  desc: "Centro Histórico, corazón financiero y cultural.",
                  icon: "🏦"
                },
              ].map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setFormData({ ...formData, training_campus_preference: opt.id })}
                  className={`p-6 rounded-3xl border-2 transition-all text-left flex gap-4 cursor-pointer touch-manipulation ${
                    formData.training_campus_preference === opt.id ? "border-[#1C42E8] bg-[#1C42E8]/5 ring-2 ring-[#1C42E8]/20" : "border-gray-100 text-gray-700 bg-gray-50/10"
                  }`}
                >
                  <div className="text-3xl shrink-0">{opt.icon}</div>
                  <div className="space-y-1">
                    <div className="font-bold text-lg text-gray-900">{opt.label}</div>
                    <div className="text-sm text-gray-600 leading-tight">{opt.desc}</div>
                  </div>
                </button>
              ))}
            </div>
            <div className="p-4 bg-[#DF757F]/10 rounded-2xl border border-[#DF757F]/20 text-[#DF757F] text-sm italic font-medium flex gap-3">
              <span className="shrink-0 text-lg">📢</span>
              <p>Al completar este registro, tu negocio será evaluado para recibir el sello de calidad Ola México.</p>
            </div>
          </div>
        )}

        {/* Navigation */}
        <div className="mt-10 flex gap-4 pt-6 border-t border-gray-50">
          {step > 1 && (
            <button
              type="button"
              onClick={prevStep}
              className="flex-1 p-4 rounded-2xl border-2 border-[#1C42E8] text-[#1C42E8] font-bold transition-all active:scale-95 cursor-pointer touch-manipulation"
            >
              Atrás
            </button>
          )}
          <button
            type="button"
            onClick={step === totalSteps ? () => console.log("Final Data:", formData) : nextStep}
            disabled={isNextDisabled()}
            className={`flex-[2] p-4 rounded-2xl font-bold text-white transition-all active:scale-95 shadow-md shadow-[#1C42E8]/20 cursor-pointer touch-manipulation ${
              isNextDisabled() ? "bg-gray-300 cursor-not-allowed" : "bg-[#1C42E8] hover:shadow-lg"
            }`}
          >
            {step === totalSteps ? "Enviar Solicitud" : "Siguiente"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default QuestionnaireBusiness;
