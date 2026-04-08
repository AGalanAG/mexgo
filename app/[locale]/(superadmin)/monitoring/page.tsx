"use client";

import React from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";

export default function MonitoringPage() {
  const metrics = [
    { label: "Negocios Activos", value: "1,240", change: "+12%", trend: "up" },
    { label: "Solicitudes Pendientes", value: "45", change: "-5%", trend: "down" },
    { label: "Saturación Promedio", value: "68%", change: "+2%", trend: "up" },
    { label: "Tickets Técnicos", value: "12", change: "0%", trend: "neutral" },
  ];

  const recentLogs = [
    { id: 1, action: "Aprobación de Negocio", user: "Admin1", target: "Tacos El Pastor", time: "Hace 5 min" },
    { id: 2, action: "Inicio de Sesión", user: "SuperAdmin", target: "Sistema", time: "Hace 12 min" },
    { id: 3, action: "Error de API", user: "System", target: "/api/recommend", time: "Hace 15 min" },
    { id: 4, action: "Actualización de Perfil", user: "User123", target: "Itinerario", time: "Hace 22 min" },
  ];

  return (
    <main className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-extrabold text-[var(--dark-blue)] mb-8">
          Monitoreo del Sistema (SuperAdmin)
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {metrics.map((m, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <p className="text-sm font-medium text-[var(--grey)]">{m.label}</p>
                <div className="flex items-end justify-between mt-2">
                  <p className="text-3xl font-bold text-[var(--dark-blue)]">{m.value}</p>
                  <span className={`text-sm font-bold ${
                    m.trend === 'up' ? 'text-[var(--green)]' : 
                    m.trend === 'down' ? 'text-[var(--red)]' : 'text-[var(--grey)]'
                  }`}>
                    {m.change}
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <Card className="lg:col-span-2">
            <CardHeader>
              <h2 className="text-xl font-bold text-[var(--dark-blue)]">Saturación por Zona</h2>
            </CardHeader>
            <CardContent className="h-64 flex items-center justify-center bg-gray-100 rounded-b-xl border-t">
              <p className="text-[var(--grey)] italic">[ Gráfico de Saturación en Tiempo Real ]</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <h2 className="text-xl font-bold text-[var(--dark-blue)]">Audit Logs Recientes</h2>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentLogs.map(log => (
                  <div key={log.id} className="border-b pb-3 last:border-0 last:pb-0">
                    <div className="flex justify-between items-start">
                      <p className="text-sm font-bold text-[var(--dark-grey)]">{log.action}</p>
                      <span className="text-xs text-[var(--grey)]">{log.time}</span>
                    </div>
                    <p className="text-xs text-[var(--grey)]">Por: {log.user} en {log.target}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  );
}
