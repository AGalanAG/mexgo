"use client";

import React, { useState } from "react";
import { getStoredAccessToken } from "@/lib/client-auth";
import { useRouter } from "@/i18n/routing";

const ALCALDIAS = [
  "Álvaro Obregón", "Azcapotzalco", "Benito Juárez", "Coyoacán", "Cuajimalpa",
  "Cuauhtémoc", "Gustavo A. Madero", "Iztapalapa", "Magdalena Contreras",
  "Miguel Hidalgo", "Milpa Alta", "Tláhuac", "Tlalpan", "Venustiano Carranza",
  "Xochimilco", "Otro"
];

const FORMAS_OPERACION = [
  "Cuento con local o espacio",
  "Realizo ventas a domicilio a través de una aplicación de entregas o por mi cuenta",
  "Vendo en bazares o eventos o tianguis",
  "Vendo a otros negocios o distribuidores (restaurantes, tiendas, mercados, etc.)",
  "Realizo venta ambulante / en vía pública",
];

const SAT_STATUS = [
  { id: "si_formal", label: "Sí, es formal y está registrado" },
  { id: "en_proceso", label: "Estoy en proceso de registrarlo" },
  { id: "no_pero_interesa", label: "No está registrado pero me interesa" },
  { id: "tal_vez", label: "Tal vez" },
  { id: "no_no_interesa", label: "No y no me interesa" },
];

const ACCESSIBILITY_NEEDS_OPTIONS = [
  { id: 'none', label: 'Ninguna' },
  { id: 'deaf', label: 'Sordera' },
  { id: 'mute', label: 'Mudez' },
  { id: 'deaf_mute', label: 'Sordomudez' },
  { id: 'low_vision', label: 'Baja visión' },
  { id: 'blindness', label: 'Ceguera' },
  { id: 'mobility', label: 'Movilidad reducida' },
  { id: 'other', label: 'Otra condición' },
] as const;

const SEDES_CAPACITACION = [
  {
    id: "HUB_AZTECA",
    label: "HUB AZTECA",
    sublabel: "A un costado del Estadio Azteca",
    desc: "C. San Julio 6 Circuito Estadio Azteca, Santa Úrsula, Coyoacán 04600",
    icon: "Sede 1",
  },
  {
    id: "MIDE",
    label: "MIDE",
    sublabel: "Museo Interactivo de Economía",
    desc: "C. de Tacuba 17, Centro, Cuauhtémoc, 06000 Ciudad de México, CDMX",
    icon: "Sede 2",
  },
];

interface FormState {
  // Step 1
  nombre_completo: string;
  edad: string;
  genero: string;
  accessibility_needs: string[];
  // Step 2
  alcaldia: string;
  colonia_y_maps: string;
  sede_previa: string;
  // Step 3
  mujeres_empleadas: string;
  hombres_empleados: string;
  nombre_negocio: string;
  descripcion_negocio: string;
  antiguedad: string;
  tiempo_continuo: string;
  horarios: string;
  // Step 4
  formas_operacion: string[];
  otra_forma_venta: string;
  sat_status: string;
  redes_sociales: string;
  // Step 5
  adaptacion_mundial: string;
  uso_apoyo: string;
  sede_presencial: string;
  correo_electronico: string;
  whatsapp: string;
}

// Reusable styled input
const Field = ({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) => (
  <div>
    <label className="block text-sm font-semibold mb-2 text-gray-800">
      {label}{required && <span className="text-[#E8C247] ml-1">*</span>}
    </label>
    {children}
  </div>
);

const inputCls = "w-full p-4 border-2 border-gray-100 rounded-2xl focus:border-[#004891] outline-none transition-all text-gray-900 bg-gray-50/50 placeholder:text-gray-400 text-sm";
const selectCls = "w-full p-4 border-2 border-gray-100 rounded-2xl outline-none focus:border-[#004891] text-gray-900 bg-gray-50/50 cursor-pointer text-sm";

const QuestionnaireBusiness: React.FC = () => {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const totalSteps = 5;

  const [formData, setFormData] = useState<FormState>({
    nombre_completo: "", edad: "", genero: "", accessibility_needs: [],
    alcaldia: "", colonia_y_maps: "", sede_previa: "",
    mujeres_empleadas: "", hombres_empleados: "",
    nombre_negocio: "", descripcion_negocio: "", antiguedad: "", tiempo_continuo: "", horarios: "",
    formas_operacion: [], otra_forma_venta: "", sat_status: "", redes_sociales: "",
    adaptacion_mundial: "", uso_apoyo: "", sede_presencial: "",
    correo_electronico: "", whatsapp: "",
  });

  const set = (field: keyof FormState, value: string) =>
    setFormData((prev) => ({ ...prev, [field]: value }));

  const toggleForma = (opt: string) =>
    setFormData((prev) => ({
      ...prev,
      formas_operacion: prev.formas_operacion.includes(opt)
        ? prev.formas_operacion.filter((o) => o !== opt)
        : [...prev.formas_operacion, opt],
    }));

  const toggleAccessibilityNeed = (need: string) =>
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

  const nextStep = () => { setStep((p) => Math.min(p + 1, totalSteps)); window.scrollTo({ top: 0, behavior: "smooth" }); };
  const prevStep = () => { setStep((p) => Math.max(p - 1, 1)); window.scrollTo({ top: 0, behavior: "smooth" }); };

  const isNextDisabled = () => {
    if (step === 1) {
      return !formData.nombre_completo || !formData.edad || !formData.genero || formData.accessibility_needs.length === 0 || !formData.correo_electronico || !formData.whatsapp;
    }
    if (step === 2) {
      return !formData.alcaldia || !formData.colonia_y_maps || !formData.sede_previa;
    }
    if (step === 3) {
      return !formData.mujeres_empleadas || !formData.hombres_empleados || !formData.nombre_negocio || !formData.descripcion_negocio || !formData.antiguedad || !formData.tiempo_continuo || !formData.horarios;
    }
    if (step === 4) {
      return formData.formas_operacion.length === 0 || !formData.sat_status || !formData.redes_sociales;
    }
    if (step === 5) {
      return !formData.adaptacion_mundial || !formData.uso_apoyo || !formData.sede_presencial;
    }
    return false;
  };

  const STEP_LABELS = [
    "Datos del Propietario",
    "Ubicación",
    "Tu Negocio",
    "Operación y Legal",
    "Proyección",
  ];

  const parseGoogleMapsUrl = (raw: string) => {
    const match = raw.match(/https?:\/\/\S+/i);
    return match ? match[0] : null;
  };

  const handleSubmit = async () => {
    const accessToken = getStoredAccessToken();
    if (!accessToken) {
      alert("Inicia sesion para enviar tu solicitud.");
      return;
    }

    const socialLinks = formData.redes_sociales
      .split(/[,\n]/)
      .map((item) => item.trim())
      .filter((item) => item.length > 0);

    const payload = {
      owner_full_name: formData.nombre_completo,
      owner_age: Number(formData.edad),
      owner_gender: formData.genero,
      owner_email: formData.correo_electronico,
      owner_whatsapp: formData.whatsapp,
      borough_code: formData.alcaldia,
      neighborhood: formData.colonia_y_maps,
      google_maps_url: parseGoogleMapsUrl(formData.colonia_y_maps),
      operation_days_hours: formData.horarios,
      business_name: formData.nombre_negocio,
      business_description: formData.descripcion_negocio,
      business_start_range: formData.antiguedad,
      continuous_operation_time: formData.tiempo_continuo,
      operation_modes: formData.formas_operacion,
      operation_modes_other: formData.otra_forma_venta || null,
      employees_women_count: Number(formData.mujeres_empleadas),
      employees_men_count: Number(formData.hombres_empleados),
      sat_status: formData.sat_status,
      social_links: socialLinks,
      accessibility_needs: formData.accessibility_needs,
      adaptation_for_world_cup: formData.adaptacion_mundial,
      support_usage: formData.uso_apoyo,
      training_campus_preference: formData.sede_presencial,
      additional_comments: `Sede previa sugerida: ${formData.sede_previa}`,
    };

    try {
      setIsSubmitting(true);

      const response = await fetch("/api/requests", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json();
      if (!response.ok || !result?.ok) {
        const errorMessage = result?.error?.message || "No fue posible enviar la solicitud";
        throw new Error(errorMessage);
      }

      alert("Solicitud enviada correctamente.");
      router.push("/business/profile");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Error inesperado al enviar solicitud";
      alert(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl w-full bg-white p-6 md:p-10 font-sans shadow-xl rounded-3xl relative border border-gray-100 mb-10 text-black">
      {/* ── Header / Progress ── */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <div className="space-y-0.5">
            <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">
              Registro de Negocio
            </span>
            <h1 className="text-lg font-black text-[#004891] leading-tight">
              Cuestionario de Solicitud
            </h1>
            <p className="text-xs text-gray-400 font-medium">{STEP_LABELS[step - 1]}</p>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <button
              type="button"
              onClick={() => router.push('/business/profile')}
              className="text-xs font-bold text-gray-300 hover:text-gray-500 border border-gray-200 hover:border-gray-300 px-3 py-1.5 rounded-xl transition-all"
            >
              Saltar (demo) →
            </button>
            <span className="text-sm font-bold text-[#004891]">
              Paso {step} de {totalSteps}
            </span>
          </div>
        </div>
        <div className="flex space-x-1">
          {Array.from({ length: totalSteps }, (_, i) => i + 1).map((s) => (
            <div
              key={s}
              className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${
                s < step ? "bg-[#004891]" : s === step ? "bg-[#E8C247]" : "bg-gray-100"
              }`}
            />
          ))}
        </div>
      </div>

      <form className="space-y-5">

        {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
            PASO 1 — Datos del Propietario
        ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
        {step === 1 && (
          <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <h2 className="text-2xl font-black text-[#004891] mb-6">Datos del Propietario</h2>

            <Field label="1. Nombre Completo (exactamente como aparece en su identificación oficial)" required>
              <input
                type="text"
                className={inputCls}
                placeholder="Juan Pérez López"
                value={formData.nombre_completo}
                onChange={(e) => set("nombre_completo", e.target.value)}
              />
            </Field>

            <div className="grid grid-cols-2 gap-4">
              <Field label="2. Edad" required>
                <input
                  type="number"
                  min={18}
                  max={120}
                  className="w-full p-4 border-2 border-gray-100 rounded-2xl focus:border-[#1C42E8] outline-none text-gray-900 bg-gray-50/30"
                  value={formData.edad}
                  onChange={(e) => set("edad", e.target.value)}
                />
              </Field>
              <Field label="3. Género" required>
                <select
                  className={selectCls}
                  value={formData.genero}
                  onChange={(e) => set("genero", e.target.value)}
                >
                  <option value="">Selecciona...</option>
                  <option value="Mujer">Mujer</option>
                  <option value="Hombre">Hombre</option>
                  <option value="Otro">Otro</option>
                </select>
              </Field>
            </div>

            <Field label="4. ¿Tienes alguna necesidad de accesibilidad o capacidad diferente?" required>
              <p className="text-xs text-gray-500 mb-2">Selecciona todas las que apliquen. Si no aplica, selecciona Ninguna.</p>
              <div className="grid gap-2 mt-1">
                {ACCESSIBILITY_NEEDS_OPTIONS.map((opt) => (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => toggleAccessibilityNeed(opt.id)}
                    className={`p-3 rounded-2xl border-2 transition-all text-left text-sm font-medium cursor-pointer ${
                      formData.accessibility_needs.includes(opt.id)
                        ? "border-[#E8C247] bg-[#E8C247]/10 text-gray-900"
                        : "border-gray-100 text-gray-700 hover:border-gray-200"
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </Field>

            <div>
              <label className="block text-sm font-semibold mb-2 text-gray-900">Correo electrónico</label>
              <input
                type="email"
                placeholder="ejemplo@correo.com"
                className="w-full p-4 border-2 border-gray-100 rounded-2xl focus:border-[#1C42E8] outline-none text-gray-900 bg-gray-50/30"
                value={formData.correo_electronico}
                onChange={(e) => set("correo_electronico", e.target.value)}
              />
            </div>

            <Field label="4. WhatsApp" required>
              <input
                type="tel"
                className={inputCls}
                placeholder="55 1234 5678"
                value={formData.whatsapp}
                onChange={(e) => set("whatsapp", e.target.value)}
              />
            </Field>
          </div>
        )}

        {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
            PASO 2 — Ubicación
        ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
        {step === 2 && (
          <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <h2 className="text-2xl font-black text-[#004891] mb-6">Ubicación y Sede</h2>

            <Field label="6. ¿A qué alcaldía pertenece tu negocio?" required>
              <select
                className={selectCls}
                value={formData.alcaldia}
                onChange={(e) => set("alcaldia", e.target.value)}
              >
                <option value="">Selecciona alcaldía...</option>
                {ALCALDIAS.map((a) => (
                  <option key={a} value={a}>{a}</option>
                ))}
              </select>
            </Field>

            <Field label="7. ¿En qué colonia está tu negocio? Si además cuentas con el link de Google Maps, agrégalo después de escribir tu colonia." required>
              <textarea
                className={`${inputCls} h-24 resize-none`}
                placeholder="Ej: Colonia Del Valle. https://goo.gl/maps/..."
                value={formData.colonia_y_maps}
                onChange={(e) => set("colonia_y_maps", e.target.value)}
              />
            </Field>

            <Field label="¿Qué sede te queda mejor para las capacitaciones presenciales?" required>
              <div className="grid gap-3 mt-1">
                {SEDES_CAPACITACION.map((sede) => (
                  <button
                    key={sede.id}
                    type="button"
                    onClick={() => set("sede_previa", sede.id)}
                    className={`p-4 rounded-2xl border-2 transition-all text-left flex gap-4 items-start cursor-pointer touch-manipulation ${
                      formData.sede_previa === sede.id
                        ? "border-[#004891] bg-[#004891]/5 ring-2 ring-[#004891]/10"
                        : "border-gray-100 bg-gray-50/30 hover:border-gray-200"
                    }`}
                  >
                    <span className="text-2xl shrink-0 mt-0.5">{sede.icon}</span>
                    <div>
                      <p className="font-black text-sm text-gray-900">{sede.label} <span className="font-medium text-gray-500">— {sede.sublabel}</span></p>
                      <p className="text-xs text-gray-400 mt-0.5 leading-snug">{sede.desc}</p>
                    </div>
                  </button>
                ))}
              </div>
            </Field>
          </div>
        )}

        {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
            PASO 3 — Tu Negocio
        ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
        {step === 3 && (
          <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <h2 className="text-2xl font-black text-[#004891] mb-6">Tu Negocio</h2>

            <Field label="8. ¿Cuántas mujeres y cuántos hombres son empleados en tu negocio?" required>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-wide block mb-1.5">👩 Mujeres</label>
                  <input type="number" min={0} className={inputCls} placeholder="0"
                    value={formData.mujeres_empleadas}
                    onChange={(e) => set("mujeres_empleadas", e.target.value)} />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-wide block mb-1.5">👨 Hombres</label>
                  <input type="number" min={0} className={inputCls} placeholder="0"
                    value={formData.hombres_empleados}
                    onChange={(e) => set("hombres_empleados", e.target.value)} />
                </div>
              </div>
            </Field>

            <Field label="9. Nombre de tu negocio" required>
              <input type="text" className={inputCls} placeholder="Ej. Tacos El Huarache"
                value={formData.nombre_negocio}
                onChange={(e) => set("nombre_negocio", e.target.value)} />
            </Field>

            <Field label="10. Describe tu negocio en un párrafo (máximo 150 caracteres). Cuéntanos qué vendes o qué servicios ofreces." required>
              <div className="relative">
                <textarea
                  maxLength={150}
                  className={`${inputCls} h-20 resize-none`}
                  placeholder="Ej. Vendemos tacos de canasta artesanales en el mercado local, especializados en recetas tradicionales..."
                  value={formData.descripcion_negocio}
                  onChange={(e) => set("descripcion_negocio", e.target.value)}
                />
                <span className={`absolute bottom-3 right-4 text-xs font-bold ${formData.descripcion_negocio.length >= 140 ? "text-[#E8C247]" : "text-gray-300"}`}>
                  {formData.descripcion_negocio.length}/150
                </span>
              </div>
            </Field>

            <Field label="11. ¿Cuándo iniciaste con tu negocio?" required>
              <div className="grid grid-cols-2 gap-2">
                {["Menos de un año", "1-3 años", "3-5 años", "Más de 5 años"].map((opt) => (
                  <button
                    key={opt} type="button"
                    onClick={() => set("antiguedad", opt)}
                    className={`p-3 rounded-2xl border-2 transition-all text-sm font-semibold text-left cursor-pointer ${
                      formData.antiguedad === opt
                        ? "border-[#004891] bg-[#004891]/5 text-[#004891]"
                        : "border-gray-100 text-gray-700 hover:border-gray-200"
                    }`}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </Field>

            <Field label="12. ¿Cuánto tiempo lleva operando tu negocio de forma continua?" required>
              <input type="text" className={inputCls} placeholder="Ej. 2 años y 3 meses"
                value={formData.tiempo_continuo}
                onChange={(e) => set("tiempo_continuo", e.target.value)} />
            </Field>

            <Field label="13. ¿Qué días y en qué horarios opera tu negocio?" required>
              <textarea
                className={`${inputCls} h-20 resize-none`}
                placeholder="Ej. Lunes a Viernes 9:00 - 18:00, Sábado 10:00 - 14:00"
                value={formData.horarios}
                onChange={(e) => set("horarios", e.target.value)}
              />
            </Field>
          </div>
        )}

        {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
            PASO 4 — Operación y Legal
        ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
        {step === 4 && (
          <div className="space-y-5 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <h2 className="text-2xl font-black text-[#004891] mb-6">Operación y Legal</h2>

            <Field label="14. Selecciona todas las que apliquen ¿Cuál de las siguientes opciones describe mejor la manera en la que opera tu negocio?" required>
              <div className="grid gap-2 mt-1">
                {FORMAS_OPERACION.map((opt) => (
                  <button
                    key={opt} type="button"
                    onClick={() => toggleForma(opt)}
                    className={`p-4 rounded-2xl border-2 transition-all text-left flex justify-between items-center text-sm font-medium cursor-pointer touch-manipulation ${
                      formData.formas_operacion.includes(opt)
                        ? "border-[#E8C247] bg-[#E8C247]/10 text-gray-900"
                        : "border-gray-100 text-gray-700 bg-gray-50/30 hover:border-gray-200"
                    }`}
                  >
                    <span className="pr-3">{opt}</span>
                    {formData.formas_operacion.includes(opt) && (
                      <div className="bg-[#E8C247] rounded-full p-1 shrink-0">
                        <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </Field>

            <Field label="15. Si tienes otra forma de venta no enlistada anteriormente, compártela">
              <input type="text" className={inputCls} placeholder="Describe tu forma de venta..."
                value={formData.otra_forma_venta}
                onChange={(e) => set("otra_forma_venta", e.target.value)} />
            </Field>

            <Field label="16. ¿Tu negocio está dado de alta ante el SAT?" required>
              <div className="grid gap-2 mt-1">
                {SAT_STATUS.map((opt) => (
                  <button
                    key={opt.id} type="button"
                    onClick={() => set("sat_status", opt.id)}
                    className={`p-4 rounded-2xl border-2 transition-all text-left text-sm font-medium cursor-pointer ${
                      formData.sat_status === opt.id
                        ? "border-[#004891] bg-[#004891]/5 text-[#004891]"
                        : "border-gray-100 text-gray-700 hover:border-gray-200"
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </Field>

            <Field label="17. Si tienes redes sociales de negocio, compártenos cuáles y cómo podemos encontrarte" required>
              <input type="text" className={inputCls} placeholder="@mi_negocio en Instagram, FB: Mi Negocio..."
                value={formData.redes_sociales}
                onChange={(e) => set("redes_sociales", e.target.value)} />
            </Field>
          </div>
        )}

        {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
            PASO 5 — Proyección y Capacitación
        ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
        {step === 5 && (
          <div className="space-y-5 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <h2 className="text-2xl font-black text-[#004891] mb-6">Proyección y Capacitación</h2>

            <Field label="18. ¿Cómo consideras que podrías adaptar e impulsar tu negocio de cara al Mundial de Fútbol 2026?" required>
              <textarea
                className={`${inputCls} h-28 resize-none`}
                placeholder="Ej. Menú en inglés, pago con tarjeta, señalética bilingüe, productos temáticos..."
                value={formData.adaptacion_mundial}
                onChange={(e) => set("adaptacion_mundial", e.target.value)}
              />
            </Field>

            <Field label="19. ¿En caso de que tu negocio sea seleccionado para ganar el apoyo económico, en qué ocuparías ese apoyo?" required>
              <textarea
                className={`${inputCls} h-28 resize-none`}
                placeholder="Ej. Remodelación del local, marketing digital, compra de inventario..."
                value={formData.uso_apoyo}
                onChange={(e) => set("uso_apoyo", e.target.value)}
              />
            </Field>

            <Field label="20. ¿Qué sede preferirías para tomar las capacitaciones PRESENCIALES?" required>
              <div className="grid gap-3 mt-1">
                {[
                  {
                    id: "HUB_AZTECA_PRES",
                    label: "HUB AZTECA",
                    sublabel: "A un costado del Estadio Azteca",
                    desc: "C. San Julio 6 Circuito Estadio Azteca, Santa Úrsula, Coyoacán 04600",
                    icon: "🏟️",
                  },
                  {
                    id: "MIDE_PRES",
                    label: "MIDE",
                    sublabel: "Museo Interactivo de Economía — Centro Histórico",
                    desc: "C. de Tacuba 17, Centro, Cuauhtémoc, 06000 Ciudad de México, CDMX",
                    icon: "🏛️",
                  },
                ].map((sede) => (
                  <button
                    key={sede.id} type="button"
                    onClick={() => set("sede_presencial", sede.id)}
                    className={`p-4 rounded-2xl border-2 transition-all text-left flex gap-4 items-start cursor-pointer touch-manipulation ${
                      formData.sede_presencial === sede.id
                        ? "border-[#004891] bg-[#004891]/5 ring-2 ring-[#004891]/10"
                        : "border-gray-100 bg-gray-50/30 hover:border-gray-200"
                    }`}
                  >
                    <span className="text-2xl shrink-0 mt-0.5">{sede.icon}</span>
                    <div>
                      <p className="font-black text-sm text-gray-900">
                        {sede.label} <span className="font-medium text-gray-500">— {sede.sublabel}</span>
                      </p>
                      <p className="text-xs text-gray-400 mt-0.5 leading-snug">{sede.desc}</p>
                    </div>
                  </button>
                ))}
              </div>
            </Field>


          </div>
        )}

        {/* ── Navigation ── */}
        <div className="mt-10 flex gap-4 pt-6 border-t border-gray-50">
          {step > 1 && (
            <button
              type="button"
              onClick={prevStep}
              className="flex-1 p-4 rounded-2xl border-2 border-[#004891] text-[#004891] font-bold transition-all active:scale-95 cursor-pointer touch-manipulation hover:bg-[#004891]/5"
            >
              Atrás
            </button>
          )}
          <button
            type="button"
            onClick={
              step === totalSteps
                ? handleSubmit
                : nextStep
            }
            disabled={isNextDisabled() || isSubmitting}
            className={`flex-[2] p-4 rounded-2xl font-bold text-white transition-all active:scale-95 shadow-md shadow-[#1C42E8]/20 cursor-pointer touch-manipulation ${
              isNextDisabled() || isSubmitting ? "bg-gray-300 cursor-not-allowed" : "bg-[#1C42E8] hover:shadow-lg"
            }`}
          >
            {step === totalSteps ? (isSubmitting ? "Enviando..." : "Enviar Solicitud") : "Siguiente"}
          </button>
        </div>
      </form>
      
    </div>
  );
};

export default QuestionnaireBusiness;
