import React from "react";
import { Card, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import Link from "next/link";

interface RequestCardProps {
  id: string;
  nombre_negocio: string;
  nombre_completo: string;
  alcaldia: string;
  fecha: string;
  status: "Pendiente" | "En revision" | "Rechazado" | "Aprobado";
}

export const RequestCard: React.FC<RequestCardProps> = ({
  id,
  nombre_negocio,
  nombre_completo,
  alcaldia,
  fecha,
  status
}) => {
  const statusVariants: Record<string, "neutral" | "warning" | "error" | "success"> = {
    Pendiente: "neutral",
    "En revision": "warning",
    Rechazado: "error",
    Aprobado: "success"
  };

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardContent className="p-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="text-lg font-bold text-[var(--dark-blue)]">{nombre_negocio}</h3>
            <p className="text-sm text-[var(--grey)]">{nombre_completo}</p>
          </div>
          <Badge variant={statusVariants[status] || "neutral"}>{status}</Badge>
        </div>
        
        <div className="flex items-center gap-4 text-sm text-[var(--dark-grey)] mb-6">
          <div className="flex items-center gap-1">
            <span>📍</span>
            <span>{alcaldia}</span>
          </div>
          <div className="flex items-center gap-1">
            <span>📅</span>
            <span>{fecha}</span>
          </div>
        </div>

        <Link href={`/requests/${id}`} passHref>
          <Button variant="outline" className="w-full">
            Ver Detalles
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
};
