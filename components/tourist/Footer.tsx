import React from 'react';
import Image from 'next/image';

const Footer: React.FC = () => {
  return (
    <footer className="bg-[var(--primary)] text-white py-10 border-t-4 border-[var(--secondary)]">
      <div className="max-w-7xl mx-auto px-6">

        {/* Contenido principal */}
        <div className="flex flex-col md:flex-row justify-between items-center md:items-start gap-8 mb-10">

          {/* Logo + descripción */}
          <div className="flex flex-col gap-4 items-center md:items-start text-center md:text-left">
            <div className="font-extrabold text-4xl tracking-tighter">
              Mex<span className="text-[var(--secondary)]">GO</span>
            </div>
            <p className="text-sm text-white/60 leading-relaxed max-w-xs">
              Transformando el turismo en México a través de experiencias auténticas con impacto social.
            </p>
          </div>

          {/* Logos Coppel */}
          <div className="flex flex-col sm:flex-row items-center gap-8">
            <Image
              src="/fundacionCoppel/Fundacion Coppel-WhiteYellow@4x-convertido-de-png.webp"
              alt="Fundación Coppel"
              width={140}
              height={40}
              className="object-contain opacity-70 hover:opacity-100 transition-opacity"
            />
            <Image
              src="/logosCoppel/Coppel Emprende _RGB_Secundario_White.png"
              alt="Coppel Emprende"
              width={130}
              height={40}
              className="object-contain opacity-60 hover:opacity-100 transition-opacity"
            />
          </div>

        </div>

        {/* Línea inferior */}
        <div className="border-t border-white/10 pt-6 flex flex-col md:flex-row justify-between items-center gap-4 text-[10px] uppercase tracking-widest text-white/40 font-medium">
          <div className="flex items-center gap-6">
            <p>© {new Date().getFullYear()} MexGo Project</p>
            <a href="#" className="hover:text-[var(--secondary)] transition-colors">Privacidad</a>
            <a href="#" className="hover:text-[var(--secondary)] transition-colors">Términos</a>
          </div>
          <div className="flex gap-3">
            <div className="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center hover:bg-[var(--secondary)] hover:text-[var(--primary)] cursor-pointer transition-all font-bold text-xs">f</div>
            <div className="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center hover:bg-[var(--secondary)] hover:text-[var(--primary)] cursor-pointer transition-all font-bold text-xs">i</div>
            <div className="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center hover:bg-[var(--secondary)] hover:text-[var(--primary)] cursor-pointer transition-all font-bold text-xs">x</div>
          </div>
        </div>

      </div>
    </footer>
  );
};

export default Footer;
