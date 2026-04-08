"use client";

import React, { useState } from "react";
import { useTranslations } from "next-intl";

const BOROUGHS = [
  "Álvaro Obregón", "Azcapotzalco", "Benito Juárez", "Coyoacán", "Cuajimalpa",
  "Cuauhtémoc", "Gustavo A. Madero", "Iztacalco", "Iztapalapa", "Magdalena Contreras",
  "Miguel Hidalgo", "Milpa Alta", "Tláhuac", "Tlalpan", "Venustiano Carranza", "Xochimilco"
];

const QuestionnaireBusiness: React.FC = () => {
  const t = useTranslations("Questionnaire");
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
            <span className="text-xs font-bold uppercase tracking-wider text-gray-400">{t('business.title')}</span>
            <h1 className="text-xl font-bold text-[#1C42E8]">{t('business.subtitle')}</h1>
          </div>
          <span className="text-sm font-bold text-[#1C42E8]">{t('steps', {step, total: totalSteps})}</span>
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
            <h2 className="text-2xl font-bold text-[#1C42E8] mb-6">{t('business.step1.title')}</h2>
            <div>
              <label className="block text-sm font-semibold mb-2 text-gray-900">{t('business.step1.nameLabel')}</label>
              <input
                type="text"
                className="w-full p-4 border-2 border-gray-100 rounded-2xl focus:border-[#1C42E8] outline-none transition-all text-gray-900 bg-gray-50/30"
                value={formData.owner_full_name}
                onChange={(e) => setFormData({...formData, owner_full_name: e.target.value})}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold mb-2 text-gray-900">{t('business.step1.ageLabel')}</label>
                <input
                  type="number"
                  className="w-full p-4 border-2 border-gray-100 rounded-2xl focus:border-[#1C42E8] outline-none text-gray-900 bg-gray-50/30"
                  value={formData.owner_age}
                  onChange={(e) => setFormData({...formData, owner_age: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-2 text-gray-900">{t('business.step1.genderLabel')}</label>
                <select 
                  className="w-full p-4 border-2 border-gray-100 rounded-2xl outline-none focus:border-[#1C42E8] text-gray-900 bg-gray-50/30 cursor-pointer"
                  value={formData.owner_gender}
                  onChange={(e) => setFormData({...formData, owner_gender: e.target.value})}
                >
                  <option value="">{t('business.step1.genderOptions.placeholder')}</option>
                  <option value="Mujer">{t('business.step1.genderOptions.female')}</option>
                  <option value="Hombre">{t('business.step1.genderOptions.male')}</option>
                  <option value="Otro">{t('business.step1.genderOptions.other')}</option>
                </select>
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold mb-2 text-gray-900">{t('business.step1.whatsappLabel')}</label>
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
            <h2 className="text-2xl font-bold text-[#1C42E8] mb-6">{t('business.step2.title')}</h2>
            <div>
              <label className="block text-sm font-semibold mb-2 text-gray-900">{t('business.step2.boroughLabel')}</label>
              <select 
                className="w-full p-4 border-2 border-gray-100 rounded-2xl outline-none focus:border-[#1C42E8] text-gray-900 bg-gray-50/30 cursor-pointer appearance-auto"
                value={formData.borough_code}
                onChange={(e) => setFormData({...formData, borough_code: e.target.value})}
              >
                <option value="">{t('business.step2.boroughPlaceholder')}</option>
                {BOROUGHS.map(b => <option key={b} value={b}>{b}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold mb-2 text-gray-900">{t('business.step2.neighborhoodLabel')}</label>
              <input
                type="text"
                className="w-full p-4 border-2 border-gray-100 rounded-2xl focus:border-[#1C42E8] outline-none text-gray-900 bg-gray-50/30"
                value={formData.neighborhood}
                onChange={(e) => setFormData({...formData, neighborhood: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-2 text-gray-900">{t('business.step2.mapsLabel')}</label>
              <input
                type="url"
                placeholder="https://goo.gl/maps/..."
                className="w-full p-4 border-2 border-gray-100 rounded-2xl focus:border-[#1C42E8] outline-none text-gray-900 bg-gray-50/30"
                value={formData.google_maps_url}
                onChange={(e) => setFormData({...formData, google_maps_url: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-2 text-gray-900">{t('business.step2.hoursLabel')}</label>
              <textarea
                placeholder={t('business.step2.hoursPlaceholder')}
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
            <h2 className="text-2xl font-bold text-[#1C42E8] mb-6">{t('business.step3.title')}</h2>
            <div>
              <label className="block text-sm font-semibold mb-2 text-gray-900">{t('business.step3.nameLabel')}</label>
              <input
                type="text"
                className="w-full p-4 border-2 border-gray-100 rounded-2xl focus:border-[#1C42E8] outline-none text-gray-900 bg-gray-50/30"
                value={formData.business_name}
                onChange={(e) => setFormData({...formData, business_name: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-2 text-gray-900">{t('business.step3.descLabel')}</label>
              <textarea
                maxLength={150}
                className="w-full p-4 border-2 border-gray-100 rounded-2xl focus:border-[#1C42E8] outline-none text-gray-900 bg-gray-50/30 h-20 resize-none"
                value={formData.business_description}
                onChange={(e) => setFormData({...formData, business_description: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-2 text-gray-900">{t('business.step3.timeLabel')}</label>
              <select 
                className="w-full p-4 border-2 border-gray-100 rounded-2xl outline-none focus:border-[#1C42E8] text-gray-900 bg-gray-50/30 cursor-pointer"
                value={formData.business_start_range}
                onChange={(e) => setFormData({...formData, business_start_range: e.target.value})}
              >
                <option value="">{t('business.step3.timeOptions.placeholder')}</option>
                <option value="MENOS_1_ANO">{t('business.step3.timeOptions.less1')}</option>
                <option value="A1_A3">{t('business.step3.timeOptions.1-3')}</option>
                <option value="A3_A5">{t('business.step3.timeOptions.3-5')}</option>
                <option value="MAS_5">{t('business.step3.timeOptions.more5')}</option>
              </select>
            </div>
          </div>
        )}

        {/* Step 4: Impacto y Mundial */}
        {step === 4 && (
          <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <h2 className="text-2xl font-bold text-[#1C42E8] mb-6">{t('business.step4.title')}</h2>
            <div>
              <label className="block text-sm font-semibold mb-2 text-gray-900">{t('business.step4.satLabel')}</label>
              <div className="grid gap-2">
                {[
                  { id: "formal", label: t('business.step4.satOptions.formal') },
                  { id: "process", label: t('business.step4.satOptions.process') },
                  { id: "interested", label: t('business.step4.satOptions.interested') },
                  { id: "notInterested", label: t('business.step4.satOptions.notInterested') }
                ].map(opt => (
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
              <label className="block text-sm font-semibold mb-2 text-gray-900">{t('business.step4.adaptationLabel')}</label>
              <textarea
                placeholder={t('business.step4.adaptationPlaceholder')}
                className="w-full p-4 border-2 border-gray-100 rounded-2xl focus:border-[#1C42E8] outline-none text-gray-900 bg-gray-50/30 h-24 resize-none"
                value={formData.adaptation_for_world_cup}
                onChange={(e) => setFormData({...formData, adaptation_for_world_cup: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-2 text-gray-900">{t('business.step4.supportLabel')}</label>
              <textarea
                placeholder={t('business.step4.supportPlaceholder')}
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
            <h2 className="text-2xl font-bold text-[#1C42E8] mb-6">{t('business.step5.title')}</h2>
            <div className="grid gap-4">
              {[
                {
                  id: "HUB_AZTECA",
                  label: t('business.step5.campuses.hub.label'),
                  desc: t('business.step5.campuses.hub.desc'),
                  icon: "🏟️"
                },
                {
                  id: "MIDE",
                  label: t('business.step5.campuses.mide.label'),
                  desc: t('business.step5.campuses.mide.desc'),
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
              <p>{t('business.step5.footerTip')}</p>
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
              {t('back')}
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
            {step === totalSteps ? t('business.sendRequest') : t('next')}
          </button>
        </div>
      </form>
    </div>
  );
};

export default QuestionnaireBusiness;
