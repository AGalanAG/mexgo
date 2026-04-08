"use client";

import React from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";

export default function TicketsPage() {
  type Priority = "Baja" | "Media" | "Alta" | "Crítica";

  const tickets: { id: string; title: string; priority: Priority; status: string; user: string; time: string }[] = [
    { id: "TK-101", title: "Error en carga de imagen", priority: "Alta", status: "Abierto", user: "Negocio12", time: "Hace 2 horas" },
    { id: "TK-102", title: "Problema con Google Auth", priority: "Crítica", status: "En proceso", user: "Turista88", time: "Hace 4 horas" },
    { id: "TK-103", title: "Lentitud en API recommend", priority: "Media", status: "Abierto", user: "System", time: "Hace 1 día" },
  ];

  const priorityColors: Record<Priority, "neutral" | "info" | "warning" | "error"> = {
    "Baja": "neutral",
    "Media": "info",
    "Alta": "warning",
    "Crítica": "error"
  };

  return (
    <main className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-extrabold text-[var(--dark-blue)]">
            Tickets Técnicos
          </h1>
          <Button variant="primary">+ Nuevo Ticket</Button>
        </div>

        <div className="grid grid-cols-1 gap-4">
          {tickets.map(ticket => (
            <Card key={ticket.id}>
              <CardContent className="p-6 flex flex-col md:flex-row justify-between items-center gap-4">
                <div className="flex gap-4 items-start">
                  <div className="bg-[var(--coppel-blue)]/10 p-3 rounded-lg">
                    <span className="text-[var(--coppel-blue)] font-bold">{ticket.id}</span>
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-[var(--dark-blue)]">{ticket.title}</h3>
                    <p className="text-sm text-[var(--grey)]">Reportado por {ticket.user} • {ticket.time}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-4">
                  <div className="flex flex-col items-end">
                    <span className="text-xs text-[var(--grey)] mb-1">Prioridad</span>
                    <Badge variant={priorityColors[ticket.priority]}>{ticket.priority}</Badge>
                  </div>
                  <div className="flex flex-col items-end">
                    <span className="text-xs text-[var(--grey)] mb-1">Estado</span>
                    <Badge variant="neutral">{ticket.status}</Badge>
                  </div>
                  <Button variant="outline" size="sm">Atender</Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </main>
  );
}
