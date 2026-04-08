import React from "react";
import { ReviewForm } from "@/components/admin/ReviewForm";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import Link from "next/link";
import { Button } from "@/components/ui/Button";

// Mock para obtener detalles (normalmente vendría de Supabase)
const getRequestDetails = (id: string) => ({
  id,
  nombre_completo: "Juan Pérez García",
  edad: 45,
  genero: "Masculino",
  correo: "juan.perez@example.com",
  whatsapp: "5512345678",
  alcaldia: "Cuauhtémoc",
  colonia: "Roma Norte",
  maps_link: "https://goo.gl/maps/xyz123",
  mujeres_empleadas: 3,
  hombres_empleados: 2,
  nombre_negocio: "Tacos El Pastorcito",
  descripcion_negocio: "Los mejores tacos al pastor de la zona con una receta secreta familiar de hace 30 años.",
  antiguedad: "Mas de 5 anos",
  tiempo_continuo: 12,
  horarios: "Lunes a Sábado 14:00 - 02:00",
  formas_venta: ["Cuento con local o espacio", "Realizo ventas a domicilio por app o por mi cuenta"],
  otra_forma_venta: "",
  estatus_sat: "Si, es formal y esta registrado",
  redes_sociales: "@tacoselpastorcito_cdmx",
  adaptacion_mundial: "Pondremos pantallas gigantes, decoraremos con banderas de los países participantes y ofreceremos combos especiales 'Mundialista'.",
  uso_apoyo: "Compra de un refrigerador industrial y renovación de la fachada del local.",
  sede_capacitacion: "MIDE (Centro Historico)",
  comentarios: "Espero poder ser parte de este gran evento.",
  status: "Pendiente" as const,
  fecha: "2026-04-06"
});

export default async function RequestDetailPage({ params }: { params: { id: string } }) {
  const { id } = params;
  const request = getRequestDetails(id);

  return (
    <main className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <Link href="/requests">
            <Button variant="outline">← Volver a la lista</Button>
          </Link>
          <div className="flex items-center gap-3">
            <span className="text-[var(--grey)]">Estado actual:</span>
            <Badge variant="neutral">{request.status}</Badge>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <Card>
              <CardHeader>
                <h1 className="text-2xl font-bold text-[var(--dark-blue)]">
                  Detalles de la Solicitud: {request.nombre_negocio}
                </h1>
              </CardHeader>
              <CardContent className="space-y-6">
                <section>
                  <h3 className="font-bold text-[var(--coppel-blue)] border-b pb-2 mb-4">Información del Solicitante</h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div><span className="text-[var(--grey)]">Nombre:</span> {request.nombre_completo}</div>
                    <div><span className="text-[var(--grey)]">Edad:</span> {request.edad}</div>
                    <div><span className="text-[var(--grey)]">Género:</span> {request.genero}</div>
                    <div><span className="text-[var(--grey)]">WhatsApp:</span> {request.whatsapp}</div>
                    <div className="col-span-2"><span className="text-[var(--grey)]">Correo:</span> {request.correo}</div>
                  </div>
                </section>

                <section>
                  <h3 className="font-bold text-[var(--coppel-blue)] border-b pb-2 mb-4">Ubicación y Equipo</h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div><span className="text-[var(--grey)]">Alcaldía:</span> {request.alcaldia}</div>
                    <div><span className="text-[var(--grey)]">Colonia:</span> {request.colonia}</div>
                    <div className="col-span-2">
                      <span className="text-[var(--grey)]">Maps:</span> 
                      <a href={request.maps_link} target="_blank" className="text-[var(--light-blue)] ml-1 underline">{request.maps_link}</a>
                    </div>
                    <div><span className="text-[var(--grey)]">Mujeres Empleadas:</span> {request.mujeres_empleadas}</div>
                    <div><span className="text-[var(--grey)]">Hombres Empleados:</span> {request.hombres_empleados}</div>
                  </div>
                </section>

                <section>
                  <h3 className="font-bold text-[var(--coppel-blue)] border-b pb-2 mb-4">Negocio y Operación</h3>
                  <div className="space-y-4 text-sm">
                    <div><span className="text-[var(--grey)] block mb-1">Descripción:</span> {request.descripcion_negocio}</div>
                    <div className="grid grid-cols-2 gap-4">
                      <div><span className="text-[var(--grey)]">Antigüedad:</span> {request.antiguedad}</div>
                      <div><span className="text-[var(--grey)]">Operando continuo:</span> {request.tiempo_continuo} años</div>
                    </div>
                    <div><span className="text-[var(--grey)] block mb-1">Horarios:</span> {request.horarios}</div>
                    <div>
                      <span className="text-[var(--grey)] block mb-1">Formas de venta:</span>
                      <div className="flex flex-wrap gap-2 mt-1">
                        {request.formas_venta.map(f => <Badge key={f} variant="info">{f}</Badge>)}
                      </div>
                    </div>
                    <div><span className="text-[var(--grey)]">Estatus SAT:</span> {request.estatus_sat}</div>
                    <div><span className="text-[var(--grey)]">Redes Sociales:</span> {request.redes_sociales}</div>
                  </div>
                </section>

                <section>
                  <h3 className="font-bold text-[var(--coppel-blue)] border-b pb-2 mb-4">Mundial 2026 y Capacitación</h3>
                  <div className="space-y-4 text-sm">
                    <div><span className="text-[var(--grey)] block mb-1">Adaptación Mundial:</span> {request.adaptacion_mundial}</div>
                    <div><span className="text-[var(--grey)] block mb-1">Uso de Apoyo:</span> {request.uso_apoyo}</div>
                    <div><span className="text-[var(--grey)]">Sede Capacitación:</span> {request.sede_capacitacion}</div>
                  </div>
                </section>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <ReviewForm requestId={id} />
          </div>
        </div>
      </div>
    </main>
  );
}
