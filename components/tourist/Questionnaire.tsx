"use client";

import React, { useState, useMemo } from "react";
<<<<<<< HEAD
import { getStoredAccessToken } from "@/lib/client-auth";
import { useTranslations, useLocale } from "next-intl";
import { useRouter, usePathname, routing } from "@/i18n/routing";
import LanguageIcon from '@mui/icons-material/Language';
=======
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/routing";
>>>>>>> feat/xavier-qa-ui

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

const ACCESSIBILITY_OPTIONS = [
  'none',
  'deaf',
  'mute',
  'deaf_mute',
  'low_vision',
  'blindness',
  'mobility',
  'other',
] as const;

interface QuestionnaireState {
  country: string;
  companions_count: string;
  is_adult: string;
  accessibility_needs: string[];
  stay_duration: string;
  city: string;
  borough: string;
  trip_motives: string[];
  priority_factor: string;
}

const Questionnaire: React.FC = () => {
  const t = useTranslations("Questionnaire");
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<QuestionnaireState>({
    country: "",
    companions_count: "",
    is_adult: "",
    accessibility_needs: [],
    stay_duration: "",
    city: "",
    borough: "",
    trip_motives: [],
    priority_factor: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

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

  const handleAccessibilityNeedChange = (need: string) => {
    setFormData((prev) => {
      if (need === 'none') {
        return { ...prev, accessibility_needs: ['none'] };
      }

      const withoutNone = prev.accessibility_needs.filter((item) => item !== 'none');
      const accessibility_needs = withoutNone.includes(need)
        ? withoutNone.filter((item) => item !== need)
        : [...withoutNone, need];

      return { ...prev, accessibility_needs };
    });
  };

  const handleFinish = async () => {
    const accessToken = getStoredAccessToken();
    if (!accessToken) {
      alert("Inicia sesion para guardar tu cuestionario.");
      return;
    }

    const questionnairePayload = {
      country: formData.country,
      companions_count: formData.companions_count,
      is_adult: formData.is_adult,
      accessibility_needs: formData.accessibility_needs,
      stay_duration: formData.stay_duration,
      city: formData.city,
      borough: formData.borough,
      trip_motives: formData.trip_motives,
      // priority_factor no tiene columna dedicada y se persiste en payload JSON.
      payload: {
        priority_factor: formData.priority_factor,
      },
    };

    try {
      setIsSubmitting(true);

      const response = await fetch('/api/tourist/questionnaire', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify(questionnairePayload),
      });

      const result = await response.json();
      if (!response.ok || !result?.ok) {
        const errorMessage = result?.error?.message || 'No fue posible guardar tu cuestionario';
        throw new Error(errorMessage);
      }

      localStorage.setItem('mexgo_tourist_profile', JSON.stringify(formData));
      router.push('/trips');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Error inesperado al guardar cuestionario';
      alert(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const boroughs = useMemo(() => {
    return formData.city ? CITIES_DATA[formData.city] : [];
  }, [formData.city]);

  const isNextDisabled = () => {
    if (step === 1) return !formData.country || !formData.companions_count || !formData.is_adult || formData.accessibility_needs.length === 0;
    if (step === 2) return !formData.stay_duration || !formData.city || !formData.borough;
    if (step === 3) return formData.trip_motives.length < 2 || formData.trip_motives.length > 3;
    if (step === 4) return !formData.priority_factor;
    return false;
  };

  return (
    <div className="mx-auto max-w-lg w-full bg-white p-6 md:p-10 font-sans shadow-xl rounded-3xl relative border border-gray-100 mb-10 text-black">
      {/* Header with Progress Bar and Language Switcher */}
      <div className="mb-8">
        <div className="flex justify-between items-start mb-6">
          <div className="space-y-1">
            <span className="text-xs font-bold uppercase tracking-wider text-gray-400 block">{t('steps', {step, total: totalSteps})}</span>
            <div className="flex space-x-1">
              {[1, 2, 3, 4].map((s) => (
                <div
                  key={s}
                  className={`h-1.5 w-8 rounded-full transition-all duration-300 ${
                    s < step ? "bg-[#1C42E8]" : s === step ? "bg-[#E8C247]" : "bg-gray-100"
                  }`}
                />
              ))}
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => router.push('/trips')}
              className="text-xs font-bold text-gray-300 hover:text-gray-500 border border-gray-200 hover:border-gray-300 px-3 py-1.5 rounded-xl transition-all"
            >
              Saltar (demo) →
            </button>
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
              {(['solo', 'small', 'large'] as const).map((key) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setFormData({ ...formData, companions_count: key })}
                  className={`p-4 rounded-2xl border-2 transition-all text-left font-medium cursor-pointer touch-manipulation ${
                    formData.companions_count === key ? "border-[#1C42E8] bg-[#1C42E8]/5 text-[#1C42E8]" : "border-gray-100 text-gray-700 hover:border-gray-200"
                  }`}
                >
                  {t(`tourist.step1.companionsOptions.${key}`)}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-sm font-semibold mb-2 text-gray-900">
              {formData.companions_count === 'solo' ? t('tourist.step1.isAdultSolo') : t('tourist.step1.isAdultGroup')}
            </label>
            <div className="flex gap-3">
              {(['yes', 'no'] as const).map((key) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setFormData({ ...formData, is_adult: key })}
                  className={`flex-1 p-4 rounded-2xl border-2 transition-all font-medium cursor-pointer touch-manipulation ${
                    formData.is_adult === key ? "border-[#1C42E8] bg-[#1C42E8]/5 text-[#1C42E8]" : "border-gray-100 text-gray-700"
                  }`}
                >
                  {t(`tourist.step1.ageOptions.${key}`)}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-sm font-semibold mb-2 text-gray-900">
              {t('tourist.step1.accessibilityLabel')}
            </label>
            <p className="text-xs text-gray-500 mb-3">{t('tourist.step1.accessibilityHint')}</p>
            <div className="grid gap-3">
              {ACCESSIBILITY_OPTIONS.map((key) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => handleAccessibilityNeedChange(key)}
                  className={`p-4 rounded-2xl border-2 transition-all text-left flex justify-between items-center font-medium cursor-pointer touch-manipulation ${
                    formData.accessibility_needs.includes(key)
                      ? "border-[#E8C247] bg-[#E8C247]/10 text-gray-900 shadow-sm"
                      : "border-gray-100 text-gray-700 bg-gray-50/10"
                  }`}
                >
                  <span className="pr-4">{t(`tourist.step1.accessibilityOptions.${key}`)}</span>
                  {formData.accessibility_needs.includes(key) && (
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
        </div>
      )}

      {/* Step 2: Logística */}
      {step === 2 && (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <h2 className="text-2xl font-bold text-[#1C42E8]">{t('tourist.step2.title')}</h2>
          <div>
            <label className="block text-sm font-semibold mb-2 text-gray-900">{t('tourist.step2.durationLabel')}</label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {(['1-3', '4-7', '8-14', '15+'] as const).map((key) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setFormData({ ...formData, stay_duration: key })}
                  className={`p-4 rounded-2xl border-2 transition-all text-left font-medium cursor-pointer touch-manipulation ${
                    formData.stay_duration === key ? "border-[#1C42E8] bg-[#1C42E8]/5 text-[#1C42E8]" : "border-gray-100 text-gray-700"
                  }`}
                >
                  {t(`tourist.step2.durationOptions.${key}`)}
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
            {(['cultural', 'historical', 'sports', 'relaxation', 'gastronomy', 'nightlife'] as const).map((key) => (
              <button
                key={key}
                type="button"
                onClick={() => handleMotiveChange(key)}
                className={`p-4 rounded-2xl border-2 transition-all text-left flex justify-between items-center font-medium cursor-pointer touch-manipulation ${
                  formData.trip_motives.includes(key) ? "border-[#E8C247] bg-[#E8C247]/10 text-gray-900 shadow-sm" : "border-gray-100 text-gray-700 bg-gray-50/10"
                }`}
              >
                <span className="pr-4">{t(`tourist.step3.motives.${key}`)}</span>
                {formData.trip_motives.includes(key) && (
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
            {([
              { id: "proximity", icon: "📍" },
              { id: "preference", icon: "⭐️" },
            ] as const).map((opt) => (
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
                  <div className="font-bold text-lg text-gray-900">{t(`tourist.step4.factors.${opt.id}.label`)}</div>
                  <div className="text-sm text-gray-600 leading-tight">{t(`tourist.step4.factors.${opt.id}.desc`)}</div>
                </div>
              </button>
            ))}
          </div>
          <p className="text-xs text-gray-400 text-center mt-2">{t('tourist.step4.olaMexicoTip')}</p>
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
          onClick={step === totalSteps ? handleFinish : nextStep}
          disabled={isNextDisabled() || isSubmitting}
          className={`flex-[2] p-4 rounded-2xl font-bold text-white transition-all cursor-pointer touch-manipulation ${
            isNextDisabled() || isSubmitting ? "bg-gray-300 cursor-not-allowed" : "bg-[#1C42E8] hover:shadow-lg active:scale-95 shadow-md shadow-[#1C42E8]/20"
          }`}
        >
          {step === totalSteps ? (isSubmitting ? "Guardando..." : "Crear Itinerario") : "Siguiente"}
        </button>
      </div>
    </div>
  );
};

export default Questionnaire;
