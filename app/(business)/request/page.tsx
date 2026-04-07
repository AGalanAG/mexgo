import { RequestForm } from "@/components/business/RequestForm";

export default function BusinessRequestPage() {
  return (
    <main className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto text-center mb-12">
        <h1 className="text-4xl font-extrabold text-[var(--dark-blue)] sm:text-5xl md:text-6xl">
          Registra tu <span className="text-[var(--coppel-blue)]">Negocio</span>
        </h1>
        <p className="mt-3 max-w-2xl mx-auto text-xl text-[var(--grey)] sm:mt-4">
          Únete a la plataforma oficial de MexGo y conecta con turistas de todo el mundo durante el Mundial 2026.
        </p>
      </div>

      <RequestForm />
    </main>
  );
}
