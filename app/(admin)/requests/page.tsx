"use client";

import React, { useState } from "react";
import { RequestCard } from "@/components/admin/RequestCard";
import { Input } from "@/components/ui/Input";

const MOCK_REQUESTS = [
  {
    id: "1",
    nombre_negocio: "Tacos El Pastorcito",
    nombre_completo: "Juan Pérez García",
    alcaldia: "Cuauhtémoc",
    fecha: "2026-04-06",
    status: "Pendiente" as const
  },
  {
    id: "2",
    nombre_negocio: "Café de la Selva",
    nombre_completo: "María Elena Ruiz",
    alcaldia: "Coyoacán",
    fecha: "2026-04-05",
    status: "En revision" as const
  },
  {
    id: "3",
    nombre_negocio: "Artesanías Mexicanas",
    nombre_completo: "Ricardo Santos",
    alcaldia: "Benito Juárez",
    fecha: "2026-04-04",
    status: "Aprobado" as const
  },
  {
    id: "4",
    nombre_negocio: "Antojitos Doña Lucha",
    nombre_completo: "Lucía Méndez",
    alcaldia: "Iztapalapa",
    fecha: "2026-04-03",
    status: "Rechazado" as const
  }
];

export default function AdminRequestsPage() {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredRequests = MOCK_REQUESTS.filter(req => 
    req.nombre_negocio.toLowerCase().includes(searchTerm.toLowerCase()) ||
    req.nombre_completo.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <main className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-[var(--dark-blue)]">
              Panel de Administración
            </h1>
            <p className="text-xl text-[var(--grey)]">
              Gestiona las solicitudes de alta de negocios.
            </p>
          </div>
          
          <div className="w-full md:w-96">
            <Input 
              placeholder="Buscar por negocio o solicitante..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredRequests.map(req => (
            <RequestCard key={req.id} {...req} />
          ))}
        </div>
        
        {filteredRequests.length === 0 && (
          <div className="text-center py-20">
            <p className="text-xl text-[var(--grey)]">No se encontraron solicitudes que coincidan con tu búsqueda.</p>
          </div>
        )}
      </div>
    </main>
  );
}
