"use client";

import React from 'react';
import { useLogin } from '@/context/LoginContext';
import { useTranslations } from 'next-intl';
import { useRouter } from '@/i18n/routing';

export default function GlobalRegisterModal() {
  const { isRegisterOpen, closeRegister } = useLogin();
  const t = useTranslations('Register');
  const router = useRouter();

  if (!isRegisterOpen) return null;

  const handleSelect = (type: 'tourist' | 'business') => {
    closeRegister();
    router.push(`/register?type=${type}`);
  };

  return (
    <div 
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm transition-all animate-in fade-in"
      onClick={closeRegister}
    >
      <div 
        className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-8 md:p-12">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h2 className="text-3xl font-extrabold text-gray-900 mb-2">{t('title')}</h2>
              <p className="text-gray-500">{t('subtitle')}</p>
            </div>
            <button 
              onClick={closeRegister}
              className="w-10 h-10 rounded-full hover:bg-gray-100 flex items-center justify-center transition-colors text-gray-400 text-2xl"
            >
              ×
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Turista */}
            <div 
              onClick={() => handleSelect('tourist')}
              className="group p-8 rounded-2xl border-2 border-gray-100 hover:border-[var(--green)] hover:bg-green-50/30 cursor-pointer transition-all flex flex-col items-center text-center"
            >
              <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mb-4 text-3xl group-hover:scale-110 transition-transform">
                ✈️
              </div>
              <h3 className="text-xl font-bold mb-2 text-gray-900">{t('tourist.title')}</h3>
              <p className="text-sm text-gray-500 mb-6">{t('tourist.description')}</p>
              <button className="mt-auto w-full py-3 rounded-xl bg-[var(--green)] text-white font-bold hover:brightness-110 transition-all text-sm">
                {t('tourist.cta')}
              </button>
            </div>

            {/* Negocio */}
            <div 
              onClick={() => handleSelect('business')}
              className="group p-8 rounded-2xl border-2 border-gray-100 hover:border-[var(--coppel-blue)] hover:bg-blue-50/30 cursor-pointer transition-all flex flex-col items-center text-center"
            >
              <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center mb-4 text-3xl group-hover:scale-110 transition-transform">
                🏢
              </div>
              <h3 className="text-xl font-bold mb-2 text-gray-900">{t('business.title')}</h3>
              <p className="text-sm text-gray-500 mb-6">{t('business.description')}</p>
              <button className="mt-auto w-full py-3 rounded-xl bg-[var(--coppel-blue)] text-white font-bold hover:brightness-110 transition-all text-sm">
                {t('business.cta')}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
