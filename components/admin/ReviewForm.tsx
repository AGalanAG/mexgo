"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { TextArea } from "@/components/ui/Input";

interface ReviewFormProps {
  requestId: string;
}

export const ReviewForm: React.FC<ReviewFormProps> = ({ requestId }) => {
  const [feedback, setFeedback] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAction = async (action: "approve" | "reject") => {
    if (action === "reject" && !feedback.trim()) {
      alert("La retroalimentación es obligatoria al rechazar.");
      return;
    }

    setIsSubmitting(true);
    console.log(`Action: ${action}, Request: ${requestId}, Feedback: ${feedback}`);
    
    // Simulación de delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    alert(`Solicitud ${action === "approve" ? "Aprobada" : "Rechazada"} con éxito (Simulación)`);
    setIsSubmitting(false);

    // Aquí iría la conexión con Supabase (comentada)
    /*
    const { data, error } = await supabase
      .from('business_request_reviews')
      .insert([{
        request_id: requestId,
        action: action,
        feedback: feedback,
        reviewer_id: user.id
      }]);
    
    if (!error) {
       await supabase
         .from('business_requests')
         .update({ status: action === 'approve' ? 'Aprobado' : 'Rechazado' })
         .eq('id', requestId);
    }
    */
  };

  return (
    <Card className="border-2 border-[var(--coppel-blue)]/20">
      <CardHeader>
        <h2 className="text-xl font-bold text-[var(--dark-blue)]">Panel de Revisión</h2>
      </CardHeader>
      <CardContent className="space-y-4">
        <TextArea
          label="Retroalimentación / Comentarios"
          placeholder="Escribe aquí las observaciones para el solicitante..."
          value={feedback}
          onChange={(e) => setFeedback(e.target.value)}
          className="min-h-[120px]"
        />
        
        <div className="grid grid-cols-2 gap-4">
          <Button
            variant="danger"
            disabled={isSubmitting}
            onClick={() => handleAction("reject")}
          >
            Rechazar
          </Button>
          <Button
            variant="primary"
            disabled={isSubmitting}
            onClick={() => handleAction("approve")}
          >
            Aprobar Negocio
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
