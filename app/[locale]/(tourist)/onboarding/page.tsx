import Questionnaire from "@/components/tourist/Questionnaire";
import HomeNavbar from "@/components/tourist/HomeNavbar";
import Footer from "@/components/tourist/Footer";

export default function OnboardingPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <div className="relative flex-1 flex flex-col overflow-hidden">
        {/* Background image with overlay — same as register page */}
        <div
          className="absolute inset-0 z-0"
          style={{
            backgroundImage: "url('/fondoLanding/angel-independencia-paseo-de-reforma.webp')",
            backgroundSize: "cover",
            backgroundPosition: "center",
            backgroundAttachment: "fixed",
          }}
        >
          <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px]" />
        </div>

        <HomeNavbar />

        <main className="relative z-10 flex-1 flex flex-col items-center justify-center py-24 md:py-32 px-4">
          {/* Header title */}
          <div className="text-center px-4 mb-10 animate-in fade-in slide-in-from-top-4 duration-700">
            <h1 className="text-4xl md:text-6xl font-extrabold text-white mb-4 drop-shadow-2xl">
              Mex<span className="text-[var(--secondary)]">GO</span>
            </h1>
            <p className="text-white/80 text-base md:text-lg font-medium drop-shadow-md">
              Personaliza tu experiencia para el Mundial 2026
            </p>
            <div className="w-20 h-1.5 bg-[var(--secondary)] mx-auto rounded-full shadow-lg shadow-[var(--secondary)]/20 mt-4" />
          </div>

          <Questionnaire />
        </main>
      </div>

      <Footer />
    </div>
  );
}
