"use client";

import React, { useState, useMemo } from "react";
import { useTranslations } from "next-intl";

const CITIES_DATA: Record<string, string[]> = {
  CDMX: [
    "Álvaro Obregón", "Azcapotzalco", "Benito Juárez", "Coyoacán", "Cuajimalpa de Morelos",
    "Cuauhtémoc", "Gustavo A. Madero", "Iztacalco", "Iztapalapa", "Magdalena Contreras",
    "Miguel Hidalgo", "Milpa Alta", "Tláhuac", "Tlalpan", "Venustiano Carranza", "Xochimilco"
  ],
  Monterrey: [
    "Monterrey", "San Pedro Garza García", "Santa Catarina", "Guadalupe", "Apodaca",
    "San Nicolás de los Garza", "Escobedo", "García", "Juárez", "Cadereyta Jiménez"
  ],
  Guadalajara: [
    "Guadalajara", "Zapopan", "Tlaquepaque", "Tonalá", "Tlajomulco de Zúñiga", "El Salto"
  ]
};

interface QuestionnaireState {
  country: string;
  companions_count: string;
  is_adult: string;
  stay_duration: string;
  city: string;
  borough: string;
  trip_motives: string[];
  priority_factor: string;
}

const Questionnaire: React.FC = () => {
  const t = useTranslations("Questionnaire");
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<QuestionnaireState>({
    country: "",
    companions_count: "",
    is_adult: "",
    stay_duration: "",
    city: "",
    borough: "",
    trip_motives: [],
    priority_factor: "",
  });

  const totalSteps = 4;

  const nextStep = () => {
    setStep((prev) => Math.min(prev + 1, totalSteps));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const prevStep = () => {
    setStep((prev) => Math.max(prev - 1, 1));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleMotiveChange = (motive: string) => {
    setFormData((prev) => {
      const motives = prev.trip_motives.includes(motive)
        ? prev.trip_motives.filter((m) => m !== motive)
        : [...prev.trip_motives, motive];
      return { ...prev, trip_motives: motives };
    });
  };

  const boroughs = useMemo(() => {
    return formData.city ? CITIES_DATA[formData.city] : [];
  }, [formData.city]);

  const isNextDisabled = () => {
    if (step === 1) return !formData.country || !formData.companions_count || !formData.is_adult;
    if (step === 2) return !formData.stay_duration || !formData.city || !formData.borough;
    if (step === 3) return formData.trip_motives.length < 2 || formData.trip_motives.length > 3;
    if (step === 4) return !formData.priority_factor;
    return false;
  };

  return (
    <div className="mx-auto max-w-lg w-full bg-white p-6 md:p-10 font-sans shadow-xl rounded-3xl relative border border-gray-100 mb-10 text-black">
      {/* Header with Progress Bar */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <span className="text-sm font-bold text-[#1C42E8]">{t('steps', {step, total: totalSteps})}</span>
          <div className="flex space-x-1">
            {[1, 2, 3, 4].map((s) => (
              <div
                key={s}
                className={`h-2 w-10 rounded-full transition-all duration-300 ${
                  s < step ? "bg-[#1C42E8]" : s === step ? "bg-[#E8C247]" : "bg-gray-200"
                }`}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Step 1: Perfil y Origen */}
      {step === 1 && (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <h2 className="text-2xl font-bold text-[#1C42E8]">{t('tourist.step1.title')}</h2>
          <div>
            <label className="block text-sm font-semibold mb-2 text-gray-900">{t('tourist.step1.countryLabel')}</label>
            <input
              type="text"
              className="w-full p-4 border-2 border-gray-100 rounded-2xl focus:border-[#1C42E8] outline-none transition-all text-gray-900 bg-gray-50/30"
              placeholder={t('tourist.step1.countryPlaceholder')}
              value={formData.country}
              onChange={(e) => setFormData({ ...formData, country: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-2 text-gray-900">{t('tourist.step1.companionsLabel')}</label>
            <div className="grid gap-3">
              {[
                { id: "solo", label: t('tourist.step1.companionsOptions.solo') },
                { id: "small", label: t('tourist.step1.companionsOptions.small') },
                { id: "large", label: t('tourist.step1.companionsOptions.large') }
              ].map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setFormData({ ...formData, companions_count: opt.id })}
                  className={`p-4 rounded-2xl border-2 transition-all text-left font-medium cursor-pointer touch-manipulation ${
                    formData.companions_count === opt.id ? "border-[#1C42E8] bg-[#1C42E8]/5 text-[#1C42E8]" : "border-gray-100 text-gray-700 hover:border-gray-200"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-sm font-semibold mb-2 text-gray-900">
              {formData.companions_count === "solo" ? t('tourist.step1.isAdultSolo') : t('tourist.step1.isAdultGroup')}
            </label>
            <div className="flex gap-3">
              {[
                { id: "Si", label: t('tourist.step1.ageOptions.yes') },
                { id: "No", label: t('tourist.step1.ageOptions.no') }
              ].map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setFormData({ ...formData, is_adult: opt.id })}
                  className={`flex-1 p-4 rounded-2xl border-2 transition-all font-medium cursor-pointer touch-manipulation ${
                    formData.is_adult === opt.id ? "border-[#1C42E8] bg-[#1C42E8]/5 text-[#1C42E8]" : "border-gray-100 text-gray-700"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Step 2: Logística */}
      {step === 2 && (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <h2 className="text-2xl font-bold text-[#1C42E8]">{t('tourist.step2.title')}</h2>
          <div>
            <label className="block text-sm font-semibold mb-2 text-gray-900">{t('tourist.step2.durationLabel')}</label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[
                { id: "1-3", label: t('tourist.step2.durationOptions.1-3') },
                { id: "4-7", label: t('tourist.step2.durationOptions.4-7') },
                { id: "8-14", label: t('tourist.step2.durationOptions.8-14') },
                { id: "15+", label: t('tourist.step2.durationOptions.15+') }
              ].map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setFormData({ ...formData, stay_duration: opt.id })}
                  className={`p-4 rounded-2xl border-2 transition-all text-left font-medium cursor-pointer touch-manipulation ${
                    formData.stay_duration === opt.id ? "border-[#1C42E8] bg-[#1C42E8]/5 text-[#1C42E8]" : "border-gray-100 text-gray-700"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold mb-2 text-gray-900">{t('tourist.step2.cityLabel')}</label>
              <select
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value, borough: "" })}
                className="w-full p-4 border-2 border-gray-100 rounded-2xl outline-none focus:border-[#1C42E8] text-gray-900 bg-gray-50/30 cursor-pointer appearance-none"
                style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' fill=\'none\' viewBox=\'0 0 24 24\' stroke=\'%231C42E8\'%3E%3Cpath stroke-linecap=\'round\' stroke-linejoin=\'round\' stroke-width=\'2\' d=\'M19 9l-7 7-7-7\' /%3E%3C/svg%3E")', backgroundRepeat: 'no-repeat', backgroundPosition: 'right 1rem center', backgroundSize: '1.5rem' }}
              >
                <option value="">{t('tourist.step2.cityPlaceholder')}</option>
                {Object.keys(CITIES_DATA).map(city => (
                  <option key={city} value={city}>{city}</option>
                ))}
              </select>
            </div>
            {formData.city && (
              <div className="animate-in fade-in duration-300">
                <label className="block text-sm font-semibold mb-2 text-gray-900">{t('tourist.step2.boroughLabel')}</label>
                <select
                  value={formData.borough}
                  onChange={(e) => setFormData({ ...formData, borough: e.target.value })}
                  className="w-full p-4 border-2 border-gray-100 rounded-2xl outline-none focus:border-[#1C42E8] text-gray-900 bg-gray-50/30 cursor-pointer appearance-none"
                  style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' fill=\'none\' viewBox=\'0 0 24 24\' stroke=\'%231C42E8\'%3E%3Cpath stroke-linecap=\'round\' stroke-linejoin=\'round\' stroke-width=\'2\' d=\'M19 9l-7 7-7-7\' /%3E%3C/svg%3E")', backgroundRepeat: 'no-repeat', backgroundPosition: 'right 1rem center', backgroundSize: '1.5rem' }}
                >
                  <option value="">{t('tourist.step2.boroughPlaceholder')}</option>
                  {boroughs.map(b => (
                    <option key={b} value={b}>{b}</option>
                  ))}
                </select>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Step 3: Motivos */}
      {step === 3 && (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <h2 className="text-2xl font-bold text-[#1C42E8]">{t('tourist.step3.title')}</h2>
          <p className="text-sm text-gray-600">{t('tourist.step3.description')}</p>
          <div className="grid gap-3">
            {[
              { id: "cultural", label: t('tourist.step3.motives.cultural') },
              { id: "historical", label: t('tourist.step3.motives.historical') },
              { id: "sports", label: t('tourist.step3.motives.sports') },
              { id: "relaxation", label: t('tourist.step3.motives.relaxation') },
              { id: "gastronomy", label: t('tourist.step3.motives.gastronomy') },
              { id: "nightlife", label: t('tourist.step3.motives.nightlife') }
            ].map((opt) => (
              <button
                key={opt.id}
                type="button"
                onClick={() => handleMotiveChange(opt.id)}
                className={`p-4 rounded-2xl border-2 transition-all text-left flex justify-between items-center font-medium cursor-pointer touch-manipulation ${
                  formData.trip_motives.includes(opt.id) ? "border-[#E8C247] bg-[#E8C247]/10 text-gray-900 shadow-sm" : "border-gray-100 text-gray-700 bg-gray-50/10"
                }`}
              >
                <span className="pr-4">{opt.label}</span>
                {formData.trip_motives.includes(opt.id) && (
                  <div className="bg-[#E8C247] rounded-full p-1 shrink-0">
                    <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Step 4: Factores de elección */}
      {step === 4 && (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <h2 className="text-2xl font-bold text-[#1C42E8]">{t('tourist.step4.title')}</h2>
          <p className="text-sm text-gray-600">{t('tourist.step4.description')}</p>
          <div className="grid gap-4">
            {[
              {
                id: "prox",
                label: t('tourist.step4.factors.proximity.label'),
                desc: t('tourist.step4.factors.proximity.desc'),
                icon: "📍"
              },
              {
                id: "pref",
                label: t('tourist.step4.factors.preference.label'),
                desc: t('tourist.step4.factors.preference.desc'),
                icon: "⭐️"
              },
            ].map((opt) => (
              <button
                key={opt.id}
                type="button"
                onClick={() => setFormData({ ...formData, priority_factor: opt.id })}
                className={`p-6 rounded-3xl border-2 transition-all text-left flex gap-4 cursor-pointer touch-manipulation ${
                  formData.priority_factor === opt.id ? "border-[#1C42E8] bg-[#1C42E8]/5 ring-2 ring-[#1C42E8]/20" : "border-gray-100 text-gray-700 bg-gray-50/10"
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
            <span className="shrink-0 text-lg">💡</span>
            <p>{t('tourist.step4.olaMexicoTip')}</p>
          </div>
        </div>
      )}

      {/* Navigation Buttons */}
      <div className="mt-10 flex gap-4 pt-4 border-t border-gray-50">
        {step > 1 && (
          <button
            type="button"
            onClick={prevStep}
            className="flex-1 p-4 rounded-2xl border-2 border-[#1C42E8] text-[#1C42E8] font-bold hover:bg-[#1C42E8]/5 transition-all cursor-pointer touch-manipulation active:scale-95"
          >
            {t('back')}
          </button>
        )}
        <button
          type="button"
          onClick={step === totalSteps ? () => console.log("Final Data:", formData) : nextStep}
          disabled={isNextDisabled()}
          className={`flex-[2] p-4 rounded-2xl font-bold text-white transition-all cursor-pointer touch-manipulation ${
            isNextDisabled() ? "bg-gray-300 cursor-not-allowed" : "bg-[#1C42E8] hover:shadow-lg active:scale-95 shadow-md shadow-[#1C42E8]/20"
          }`}
        >
          {step === totalSteps ? t('createItinerary') : t('next')}
        </button>
      </div>
    </div>
  );
};

export default Questionnaire;
