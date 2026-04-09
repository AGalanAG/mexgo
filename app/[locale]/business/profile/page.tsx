'use client';

import React, { useEffect, useMemo, useState } from 'react';
import {
  Apartment as ApartmentIcon,
  Badge as BadgeIcon,
  Business as BusinessIcon,
  Description as DescriptionIcon,
  LocationOn as LocationOnIcon,
  Numbers as NumbersIcon,
} from '@mui/icons-material';

import NavbarBusiness from '@/components/business/NavbarBusiness';
import Footer from '@/components/tourist/Footer';
import { clearSession, getStoredAccessToken } from '@/lib/client-auth';
import { useLocale } from 'next-intl';

type DbRecord = Record<string, unknown>;

interface BusinessProfileApiData {
  ownerUserId: string;
  request: DbRecord | null;
  businessProfile: DbRecord | null;
}

const REQUEST_FIELD_LABELS: Record<string, string> = {
  id: 'ID de solicitud',
  owner_user_id: 'Usuario propietario',
  owner_full_name: 'Nombre completo del propietario',
  owner_age: 'Edad del propietario',
  owner_gender: 'Genero del propietario',
  owner_email: 'Correo del propietario',
  owner_whatsapp: 'WhatsApp',
  borough_code: 'Alcaldia',
  neighborhood: 'Colonia',
  google_maps_url: 'URL de Google Maps',
  latitude: 'Latitud',
  longitude: 'Longitud',
  geocode_source: 'Fuente de geocodificacion',
  geocode_confidence: 'Confianza de geocodificacion',
  training_campus_hint: 'Sede sugerida',
  employees_women_count: 'Mujeres empleadas',
  employees_men_count: 'Hombres empleados',
  business_name: 'Nombre del negocio',
  business_description: 'Descripcion del negocio',
  business_start_range: 'Antiguedad del negocio',
  continuous_operation_time: 'Tiempo de operacion continua',
  operation_days_hours: 'Dias y horarios de operacion',
  operation_modes: 'Formas de operacion',
  operation_modes_other: 'Otra forma de operacion',
  sat_status: 'Estatus SAT',
  social_links: 'Redes sociales',
  accessibility_needs: 'Necesidades de accesibilidad',
  adaptation_for_world_cup: 'Adaptacion para Mundial 2026',
  support_usage: 'Uso esperado del apoyo',
  training_campus_preference: 'Sede de capacitacion preferida',
  additional_comments: 'Comentarios adicionales',
  status: 'Estatus de solicitud',
  lock_acquired_at: 'Revision iniciada en',
  lock_expires_at: 'Revision expira en',
  submitted_at: 'Fecha de envio',
  updated_at: 'Ultima actualizacion',
};

const BUSINESS_PROFILE_FIELD_LABELS: Record<string, string> = {
  id: 'ID de perfil',
  owner_user_id: 'Usuario propietario',
  business_name: 'Nombre del negocio',
  business_description: 'Descripcion del negocio',
  category_code: 'Categoria',
  phone: 'Telefono',
  email: 'Correo del negocio',
  borough: 'Alcaldia',
  neighborhood: 'Colonia',
  latitude: 'Latitud',
  longitude: 'Longitud',
  status: 'Estatus',
  is_public: 'Visible en directorio',
  created_at: 'Fecha de creacion',
  updated_at: 'Ultima actualizacion',
};

function toTitleCaseFallback(key: string) {
  return key
    .split('_')
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

function formatDbValue(value: unknown) {
  if (value === null || value === undefined || value === '') {
    return 'No registrado';
  }

  if (Array.isArray(value)) {
    return value.length > 0 ? value.map((item) => String(item)).join(', ') : 'No registrado';
  }

  if (typeof value === 'boolean') {
    return value ? 'Si' : 'No';
  }

  if (typeof value === 'string') {
    const timestampPattern = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}/;
    if (timestampPattern.test(value)) {
      const parsedDate = new Date(value);
      if (!Number.isNaN(parsedDate.getTime())) {
        return parsedDate.toLocaleString('es-MX');
      }
    }

    return value;
  }

  if (typeof value === 'object') {
    return JSON.stringify(value);
  }

  return String(value);
}

function DataList({
  data,
  labels,
}: {
  data: DbRecord;
  labels: Record<string, string>;
}) {
  const keys = Object.keys(data);

  return (
    <dl className="grid grid-cols-1 md:grid-cols-2 gap-3">
      {keys.map((key) => (
        <div
          key={key}
          className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm"
        >
          <dt className="text-[11px] uppercase tracking-wider font-black text-gray-400">
            {labels[key] || toTitleCaseFallback(key)}
          </dt>
          <dd className="mt-1 text-sm text-gray-800 font-medium break-words">
            {formatDbValue(data[key])}
          </dd>
        </div>
      ))}
    </dl>
  );
}

export default function BusinessProfilePage() {
  const locale = useLocale();
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [payload, setPayload] = useState<BusinessProfileApiData | null>(null);

  useEffect(() => {
    const accessToken = getStoredAccessToken();
    if (!accessToken) {
      window.location.assign(`/${locale}`);
      return;
    }

    const loadBusinessProfile = async () => {
      try {
        const response = await fetch('/api/business/profile', {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });

        const result = await response.json();

        if (response.status === 401 || response.status === 403) {
          clearSession();
          window.location.assign(`/${locale}`);
          return;
        }

        if (!response.ok || !result?.ok) {
          throw new Error(result?.error?.message || 'No fue posible cargar el perfil del negocio');
        }

        setPayload(result.data as BusinessProfileApiData);
      } catch (error) {
        setErrorMessage(error instanceof Error ? error.message : 'Error inesperado al cargar perfil');
      } finally {
        setIsLoading(false);
      }
    };

    loadBusinessProfile();
  }, [locale]);

  const businessName = useMemo(() => {
    const fromRequest = payload?.request?.business_name;
    if (typeof fromRequest === 'string' && fromRequest.trim()) {
      return fromRequest;
    }

    const fromProfile = payload?.businessProfile?.business_name;
    if (typeof fromProfile === 'string' && fromProfile.trim()) {
      return fromProfile;
    }

    return 'Mi perfil de negocio';
  }, [payload]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-[var(--primary)] font-bold">
        Cargando perfil del negocio...
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-[var(--background)]">
      <NavbarBusiness />

      <main className="flex-1 pt-24 md:pt-20 pb-20 px-4">
        <div className="max-w-6xl mx-auto space-y-6">
          <section
            className="rounded-3xl p-6 md:p-8 text-white shadow-xl relative overflow-hidden"
            style={{ background: 'linear-gradient(135deg, #0a0f1e 0%, var(--dark-blue) 70%, #0f3512 100%)' }}
          >
            <div className="absolute right-0 top-0 w-56 h-56 rounded-full bg-white/5 -translate-y-1/2 translate-x-1/3" />
            <div className="relative z-10 flex items-start gap-4">
              <div className="w-14 h-14 rounded-2xl bg-[var(--secondary)]/15 flex items-center justify-center text-[var(--secondary)] shrink-0">
                <BusinessIcon sx={{ fontSize: 30 }} />
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-white/50 font-black mb-1">Negocios MexGO</p>
                <h1 className="text-2xl md:text-3xl font-black leading-tight">Perfil de negocio</h1>
                <p className="text-white/75 text-sm mt-2 max-w-2xl">
                  Esta vista concentra la informacion registrada en base de datos para tu negocio.
                </p>
                <p className="text-white mt-2 font-bold">{businessName}</p>
              </div>
            </div>
          </section>

          {errorMessage && (
            <section className="rounded-2xl border border-red-200 bg-red-50 text-red-700 px-5 py-4 font-medium">
              {errorMessage}
            </section>
          )}

          <section className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 md:p-7">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-[var(--accent)]/10 text-[var(--accent)] flex items-center justify-center">
                <DescriptionIcon sx={{ fontSize: 22 }} />
              </div>
              <div>
                <h2 className="text-lg font-black text-gray-900">Solicitud registrada</h2>
                <p className="text-xs text-gray-400 font-semibold">Formulario de alta capturado durante el registro</p>
              </div>
            </div>

            {payload?.request ? (
              <DataList data={payload.request} labels={REQUEST_FIELD_LABELS} />
            ) : (
              <p className="text-sm text-gray-500 font-medium">No existe una solicitud registrada para este usuario.</p>
            )}
          </section>

          <section className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 md:p-7">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-[var(--secondary)]/15 text-[var(--dark-blue)] flex items-center justify-center">
                <ApartmentIcon sx={{ fontSize: 22 }} />
              </div>
              <div>
                <h2 className="text-lg font-black text-gray-900">Perfil publicado</h2>
                <p className="text-xs text-gray-400 font-semibold">Informacion del perfil oficial en el directorio</p>
              </div>
            </div>

            {payload?.businessProfile ? (
              <DataList data={payload.businessProfile} labels={BUSINESS_PROFILE_FIELD_LABELS} />
            ) : (
              <p className="text-sm text-gray-500 font-medium">
                Aun no hay perfil publicado. Se mostrara aqui al completar el registro del negocio.
              </p>
            )}
          </section>

          <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <article className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
              <div className="flex items-center gap-2 text-[var(--accent)] font-black text-sm">
                <BadgeIcon sx={{ fontSize: 18 }} /> Estado de solicitud
              </div>
              <p className="mt-2 text-gray-800 text-sm font-medium">
                {formatDbValue(payload?.request?.status)}
              </p>
            </article>

            <article className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
              <div className="flex items-center gap-2 text-[var(--accent)] font-black text-sm">
                <LocationOnIcon sx={{ fontSize: 18 }} /> Ubicacion registrada
              </div>
              <p className="mt-2 text-gray-800 text-sm font-medium">
                {formatDbValue(payload?.request?.borough_code)} - {formatDbValue(payload?.request?.neighborhood)}
              </p>
            </article>

            <article className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
              <div className="flex items-center gap-2 text-[var(--accent)] font-black text-sm">
                <NumbersIcon sx={{ fontSize: 18 }} /> Equipo registrado
              </div>
              <p className="mt-2 text-gray-800 text-sm font-medium">
                Mujeres: {formatDbValue(payload?.request?.employees_women_count)} | Hombres: {formatDbValue(payload?.request?.employees_men_count)}
              </p>
            </article>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}
