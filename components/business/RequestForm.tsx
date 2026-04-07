"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { Input, TextArea } from "@/components/ui/Input";

const ALCALDIAS = [
  "Alvaro Obregon", "Azcapotzalco", "Benito Juarez", "Coyoacan", "Cuajimalpa",
  "Cuauhtemoc", "Gustavo A. Madero", "Iztapalapa", "Magdalena Contreras",
  "Miguel Hidalgo", "Milpa Alta", "Tlahuac", "Tlalpan", "Venustiano Carranza",
  "Xochimilco", "Otro"
];

const ANTIGUEDAD_OPCIONES = [
  "Menos de un ano", "1-3 anos", "3-5 anos", "Mas de 5 anos"
];

const FORMAS_VENTA = [
  "Cuento con local o espacio",
  "Realizo ventas a domicilio por app o por mi cuenta",
  "Vendo en bazares, eventos o tianguis",
  "Vendo a otros negocios o distribuidores",
  "Realizo venta ambulante o en via publica",
  "Otro"
];

const ESTATUS_SAT = [
  "Si, es formal y esta registrado",
  "Estoy en proceso de registrarlo",
  "No esta registrado pero me interesa",
  "Tal vez",
  "No y no me interesa"
];

const SEDES_CAPACITACION = [
  "HUB AZTECA (Coyoacan)",
  "MIDE (Centro Historico)"
];

export const RequestForm = () => {
  const [formData, setFormData] = useState({
    nombre_completo: "",
    edad: "",
    genero: "",
    correo: "",
    whatsapp: "",
    alcaldia: "",
    colonia: "",
    maps_link: "",
    mujeres_empleadas: 0,
    hombres_empleados: 0,
    nombre_negocio: "",
    descripcion_negocio: "",
    antiguedad: "",
    tiempo_continuo: "",
    horarios: "",
    formas_venta: [] as string[],
    otra_forma_venta: "",
    estatus_sat: "",
    redes_sociales: "",
    adaptacion_mundial: "",
    uso_apoyo: "",
    sede_capacitacion: "",
    comentarios: ""
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleCheckboxChange = (option: string) => {
    setFormData(prev => {
      const current = prev.formas_venta;
      if (current.includes(option)) {
        return { ...prev, formas_venta: current.filter(o => o !== option) };
      } else {
        return { ...prev, formas_venta: [...current, option] };
      }
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Form submitted:", formData);
    alert("Solicitud enviada (Simulación)");
    // Aquí iría la conexión con Supabase (comentada)
    /*
    const { data, error } = await supabase
      .from('business_requests')
      .insert([formData]);
    */
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-4xl mx-auto space-y-8 pb-12">
      <Card>
        <CardHeader>
          <h2 className="text-xl font-bold text-[var(--dark-blue)]">1. Información del Solicitante</h2>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input 
            label="Nombre Completo" 
            name="nombre_completo" 
            value={formData.nombre_completo} 
            onChange={handleChange} 
            required 
          />
          <Input 
            label="Edad" 
            name="edad" 
            type="number" 
            value={formData.edad} 
            onChange={handleChange} 
            required 
          />
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-[var(--dark-grey)]">Género</label>
            <select 
              name="genero" 
              className="px-4 py-2 rounded-lg border-2 border-[var(--light-grey)] outline-none"
              value={formData.genero}
              onChange={handleChange}
              required
            >
              <option value="">Selecciona...</option>
              <option value="Masculino">Masculino</option>
              <option value="Femenino">Femenino</option>
              <option value="Otro">Otro</option>
            </select>
          </div>
          <Input 
            label="Correo Electrónico" 
            name="correo" 
            type="email" 
            value={formData.correo} 
            onChange={handleChange} 
            required 
          />
          <Input 
            label="WhatsApp" 
            name="whatsapp" 
            value={formData.whatsapp} 
            onChange={handleChange} 
            required 
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <h2 className="text-xl font-bold text-[var(--dark-blue)]">2. Ubicación y Equipo</h2>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-[var(--dark-grey)]">Alcaldía</label>
            <select 
              name="alcaldia" 
              className="px-4 py-2 rounded-lg border-2 border-[var(--light-grey)] outline-none"
              value={formData.alcaldia}
              onChange={handleChange}
              required
            >
              <option value="">Selecciona...</option>
              {ALCALDIAS.map(a => <option key={a} value={a}>{a}</option>)}
            </select>
          </div>
          <Input 
            label="Colonia" 
            name="colonia" 
            value={formData.colonia} 
            onChange={handleChange} 
            required 
          />
          <Input 
            label="Link de Google Maps (Opcional)" 
            name="maps_link" 
            placeholder="https://goo.gl/maps/..." 
            value={formData.maps_link} 
            onChange={handleChange} 
          />
          <div className="grid grid-cols-2 gap-2">
            <Input 
              label="Mujeres Empleadas" 
              name="mujeres_empleadas" 
              type="number" 
              value={formData.mujeres_empleadas} 
              onChange={handleChange} 
              required 
            />
            <Input 
              label="Hombres Empleados" 
              name="hombres_empleados" 
              type="number" 
              value={formData.hombres_empleados} 
              onChange={handleChange} 
              required 
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <h2 className="text-xl font-bold text-[var(--dark-blue)]">3. Detalles del Negocio</h2>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input 
            label="Nombre del Negocio" 
            name="nombre_negocio" 
            value={formData.nombre_negocio} 
            onChange={handleChange} 
            required 
          />
          <TextArea 
            label="Descripción del Negocio (Máx 150 caracteres)" 
            name="descripcion_negocio" 
            maxLength={150} 
            value={formData.descripcion_negocio} 
            onChange={handleChange} 
            required 
          />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-[var(--dark-grey)]">Antigüedad del Negocio</label>
              <select 
                name="antiguedad" 
                className="px-4 py-2 rounded-lg border-2 border-[var(--light-grey)] outline-none"
                value={formData.antiguedad}
                onChange={handleChange}
                required
              >
                <option value="">Selecciona...</option>
                {ANTIGUEDAD_OPCIONES.map(o => <option key={o} value={o}>{o}</option>)}
              </select>
            </div>
            <Input 
              label="Tiempo operando continuamente (años)" 
              name="tiempo_continuo" 
              type="number" 
              value={formData.tiempo_continuo} 
              onChange={handleChange} 
              required 
            />
          </div>
          <TextArea 
            label="Días y Horarios de Operación" 
            name="horarios" 
            placeholder="Ej: Lunes a Viernes 9:00 - 18:00" 
            value={formData.horarios} 
            onChange={handleChange} 
            required 
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <h2 className="text-xl font-bold text-[var(--dark-blue)]">4. Operación y Legal</h2>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-[var(--dark-grey)]">Formas de operación/venta (Múltiple)</label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {FORMAS_VENTA.map(o => (
                <label key={o} className="flex items-center gap-2 text-sm">
                  <input 
                    type="checkbox" 
                    checked={formData.formas_venta.includes(o)} 
                    onChange={() => handleCheckboxChange(o)}
                  />
                  {o}
                </label>
              ))}
            </div>
          </div>
          {formData.formas_venta.includes("Otro") && (
            <Input 
              label="Especifique otra forma de venta" 
              name="otra_forma_venta" 
              value={formData.otra_forma_venta} 
              onChange={handleChange} 
            />
          )}
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-[var(--dark-grey)]">Estatus ante SAT</label>
            <select 
              name="estatus_sat" 
              className="px-4 py-2 rounded-lg border-2 border-[var(--light-grey)] outline-none"
              value={formData.estatus_sat}
              onChange={handleChange}
              required
            >
              <option value="">Selecciona...</option>
              {ESTATUS_SAT.map(o => <option key={o} value={o}>{o}</option>)}
            </select>
          </div>
          <Input 
            label="Redes Sociales (Links o @usuarios)" 
            name="redes_sociales" 
            placeholder="FB, IG, TikTok..." 
            value={formData.redes_sociales} 
            onChange={handleChange} 
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <h2 className="text-xl font-bold text-[var(--dark-blue)]">5. Proyección y Capacitación</h2>
        </CardHeader>
        <CardContent className="space-y-4">
          <TextArea 
            label="¿Cómo adaptaría e impulsaría su negocio para el Mundial 2026?" 
            name="adaptacion_mundial" 
            value={formData.adaptacion_mundial} 
            onChange={handleChange} 
            required 
          />
          <TextArea 
            label="¿En qué usaría el apoyo económico?" 
            name="uso_apoyo" 
            value={formData.uso_apoyo} 
            onChange={handleChange} 
            required 
          />
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-[var(--dark-grey)]">Sede preferida para capacitación presencial</label>
            <select 
              name="sede_capacitacion" 
              className="px-4 py-2 rounded-lg border-2 border-[var(--light-grey)] outline-none"
              value={formData.sede_capacitacion}
              onChange={handleChange}
              required
            >
              <option value="">Selecciona...</option>
              {SEDES_CAPACITACION.map(o => <option key={o} value={o}>{o}</option>)}
            </select>
          </div>
          <TextArea 
            label="Dudas o comentarios adicionales" 
            name="comentarios" 
            value={formData.comentarios} 
            onChange={handleChange} 
          />
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button type="submit" size="lg" className="w-full md:w-auto">
          Enviar Solicitud
        </Button>
      </div>
    </form>
  );
};
