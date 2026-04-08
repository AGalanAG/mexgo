"use client";

import React, { useState, useEffect, Suspense } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter, useSearchParams } from 'next/navigation';
import { Link } from '@/i18n/routing';
import HomeNavbar from '@/components/tourist/HomeNavbar';
import Footer from '@/components/tourist/Footer';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';

function RegisterContent() {
  const t = useTranslations('Register');
  const router = useRouter();
  const searchParams = useSearchParams();
  const type = searchParams.get('type') as 'tourist' | 'business' | null;

  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: ''
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFakeRegister = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.email || !formData.password || !formData.name) return;

    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setIsSuccess(true);
      setTimeout(() => {
        router.push(type === 'business' ? '/profile' : '/onboarding');
      }, 2000);
    }, 1500);
  };

  const colorClass = type === 'business' ? 'bg-[var(--coppel-blue)]' : 'bg-[var(--green)]';
  const hoverColorClass = type === 'business' ? 'hover:bg-[var(--dark-blue)]' : 'hover:bg-[var(--dark-green)]';

  return (
    <div className="max-w-md mx-auto w-full px-4">
      <Card className="p-8 shadow-2xl border-none bg-white/95 backdrop-blur-md">
        {isSuccess ? (
          <div className="text-center py-10 animate-in zoom-in duration-300">
            <div className={`w-20 h-20 rounded-full ${type === 'business' ? 'bg-blue-100 text-blue-600' : 'bg-green-100 text-green-600'} flex items-center justify-center mx-auto mb-6 text-4xl`}>
              ✓
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">{t('form.success')}</h2>
            <p className="text-gray-500">{t('form.redirecting')}</p>
          </div>
        ) : (
          <>
            <div className="text-center mb-8">
              <h2 className="text-3xl font-extrabold text-gray-900 mb-2">
                {type === 'business' ? t('business.title') : t('tourist.title')}
              </h2>
              <p className="text-gray-500 text-sm">{t('subtitle')}</p>
            </div>

            <form onSubmit={handleFakeRegister} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider pl-1">{t('form.name')}</label>
                <Input 
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Ej. Juan Pérez" 
                  className="w-full bg-gray-50 border-gray-100 focus:bg-white transition-all"
                  required
                />
              </div>
              

              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider pl-1">{t('form.email')}</label>
                <Input 
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="usuario@correo.com" 
                  className="w-full bg-gray-50 border-gray-100 focus:bg-white transition-all"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider pl-1">{t('form.password')}</label>
                <Input 
                  name="password"
                  type="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  placeholder="••••••••" 
                  className="w-full bg-gray-50 border-gray-100 focus:bg-white transition-all"
                  required
                />
              </div>

              <Button 
                type="submit"
                disabled={isLoading}
                className={`w-full py-6 text-base font-bold shadow-xl ${colorClass} ${hoverColorClass} text-white mt-6 transition-all active:scale-[0.98] disabled:opacity-70`}
              >
                {isLoading ? (
                  <span className="flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ...
                  </span>
                ) : t('form.submit')}
              </Button>

              <div className="relative my-8">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-gray-100"></span>
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-white px-4 text-gray-400 font-medium tracking-widest italic">O</span>
                </div>
              </div>

              <button 
                type="button"
                className="w-full py-3 px-4 border border-gray-200 rounded-xl flex items-center justify-center gap-3 hover:bg-gray-50 transition-all font-medium text-gray-700 text-sm"
              >
                <img src="https://www.google.com/favicon.ico" alt="Google" className="w-4 h-4" />
                {t('form.google')}
              </button>

              <p className="text-center text-xs text-gray-500 mt-8">
                {t('form.alreadyHaveAccount')}{' '}
                <Link href="/" className="text-gray-900 hover:underline font-bold">
                  Inicia sesión
                </Link>
              </p>
            </form>
          </>
        )}
      </Card>
    </div>
  );
}

export default function RegisterPage() {
  const t = useTranslations('Register');

  return (
    <div className="min-h-screen flex flex-col">
      {/* Contenedor Principal con Background Full */}
      <div className="relative flex-1 flex flex-col overflow-hidden">
        {/* Background Image que abarca todo */}
        <div 
          className="absolute inset-0 z-0"
          style={{ 
            backgroundImage: "url('/fondoLanding/angel-independencia-paseo-de-reforma.webp')", 
            backgroundSize: 'cover', 
            backgroundPosition: 'center',
            backgroundAttachment: 'fixed'
          }}
        >
          <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px]" />
        </div>
        
        <HomeNavbar />

        {/* Contenido Principal */}
        <main className="relative z-10 flex-1 flex flex-col items-center justify-center py-24 md:py-32">
          <div className="text-center px-4 mb-10 animate-in fade-in slide-in-from-top-4 duration-700">
            <h1 className="text-4xl md:text-6xl font-extrabold text-white mb-4 drop-shadow-2xl">
              Mex<span className="text-[var(--secondary)]">GO</span>
            </h1>
            <div className="w-20 h-1.5 bg-[var(--secondary)] mx-auto rounded-full shadow-lg shadow-[var(--secondary)]/20" />
          </div>

          <Suspense fallback={<div className="text-center text-white py-20 font-bold">Cargando...</div>}>
            <RegisterContent />
          </Suspense>
        </main>
      </div>

      <Footer />
    </div>
  );
}
