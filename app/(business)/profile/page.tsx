import React from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";

export default function BusinessProfilePage() {
  const business = {
    nombre_negocio: "Tacos El Pastorcito",
    status: "Aprobado",
    visitas_totales: 450,
    saturacion_actual: "45%",
    redes_sociales: "@tacoselpastorcito_cdmx",
    horarios: "Lunes a Sábado 14:00 - 02:00",
  };

  return (
    <main className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start mb-12 gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-[var(--dark-blue)]">
              Mi Negocio: {business.nombre_negocio}
            </h1>
            <p className="text-xl text-[var(--grey)]">
              Gestiona tu visibilidad y revisa tus estadísticas.
            </p>
          </div>
          <Badge variant="success" className="text-lg px-4 py-1">{business.status}</Badge>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <p className="text-sm font-medium text-[var(--grey)]">Visitas Totales</p>
              <p className="text-3xl font-bold text-[var(--dark-blue)]">{business.visitas_totales}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <p className="text-sm font-medium text-[var(--grey)]">Saturación Actual</p>
              <p className="text-3xl font-bold text-[var(--dark-blue)]">{business.saturacion_actual}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <p className="text-sm font-medium text-[var(--grey)]">Sello Ola México</p>
              <Badge variant="info">Activo ✅</Badge>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Card>
            <CardHeader>
              <h2 className="text-xl font-bold text-[var(--dark-blue)]">Información Pública</h2>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <span className="text-sm font-bold text-[var(--grey)] block">Horarios:</span>
                <p>{business.horarios}</p>
              </div>
              <div>
                <span className="text-sm font-bold text-[var(--grey)] block">Redes Sociales:</span>
                <p>{business.redes_sociales}</p>
              </div>
              <Button variant="outline" className="w-full">Editar Información</Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <h2 className="text-xl font-bold text-[var(--dark-blue)]">Promociones Mundial 2026</h2>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 bg-[var(--coppel-blue)]/5 rounded-lg border border-[var(--coppel-blue)]/20">
                <p className="font-bold text-[var(--dark-blue)]">Combo Goleador</p>
                <p className="text-sm text-[var(--dark-grey)]">5 Tacos + Bebida por $150 MXN</p>
              </div>
              <Button variant="primary" className="w-full">Agregar Promoción</Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  );
}
