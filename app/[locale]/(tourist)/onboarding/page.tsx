import Questionnaire from "@/components/tourist/Questionnaire";

export default function OnboardingPage() {
  return (
    <main className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-7xl mx-auto flex flex-col items-center">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-[#1C42E8] mb-2">Bienvenido a MexGo</h1>
          <p className="text-gray-600">Personaliza tu experiencia para el Mundial 2026</p>
        </div>
        
        <Questionnaire />
        
        <footer className="mt-12 text-center text-gray-400 text-xs">
          © 2026 Los Mossitos | Patrocinado por Fundación Coppel
        </footer>
      </div>
    </main>
  );
}
