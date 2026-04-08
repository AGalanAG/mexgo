import QuestionnaireBusiness from "@/components/business/QuestionnaireBusiness";

export default function BusinessRequestPage() {
  return (
    <main className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-7xl mx-auto flex flex-col items-center">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-[#1C42E8] mb-2">Registro de Negocio</h1>
          <p className="text-gray-600">Únete a la red Ola México y prepárate para el Mundial 2026</p>
        </div>
        
        <QuestionnaireBusiness />
        
        <footer className="mt-12 text-center text-gray-400 text-xs">
          © 2026 Los Mossitos | Patrocinado por Fundación Coppel
        </footer>
      </div>
    </main>
  );
}
