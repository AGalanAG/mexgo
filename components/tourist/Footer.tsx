import React from 'react';
import Image from 'next/image';

const Footer: React.FC = () => {
  return (
    <footer className="bg-zinc-950 text-white py-12 md:py-16 border-t border-white/5">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 md:gap-12 mb-12 md:mb-16">
          
          {/* Columna 1: MexGo y Logo Fundación */}
          <div className="md:col-span-4 flex flex-col gap-6">
            <div className="flex flex-col gap-4">
              <div className="font-bold text-4xl leading-tight tracking-tighter text-white">
                Mex<br />GO
              </div>
              {/* Descripción: Oculta en móvil, visible en desktop */}
              <p className="hidden md:block text-sm text-gray-400 leading-relaxed max-w-sm">
                Transformando el turismo en México a través de experiencias auténticas con impacto social. Una iniciativa impulsada por Fundación Coppel.
              </p>
            </div>
            
            {/* Logo Fundación Coppel: Siempre visible */}
            <div className="pt-2">
              <Image 
                src="/fundacionCoppel/Fundacion Coppel-WhiteYellow@4x-convertido-de-png.webp" 
                alt="Fundación Coppel" 
                width={140} 
                height={40} 
                className="object-contain opacity-70 hover:opacity-100 transition-opacity grayscale brightness-200"
              />
            </div>
          </div>

          {/* Columna 2: Descubrir - OCULTO EN MÓVIL */}
          <div className="hidden md:block md:col-span-2">
            <h4 className="font-bold text-xs uppercase tracking-widest text-gray-300 mb-6">Descubrir</h4>
            <ul className="space-y-4 text-sm text-gray-400">
              <li><a href="#" className="hover:text-white transition-colors">Destinos</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Experiencias</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Gastronomía</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Cultura</a></li>
            </ul>
          </div>

          {/* Columna 3: Empresa - OCULTO EN MÓVIL */}
          <div className="hidden md:block md:col-span-2">
            <h4 className="font-bold text-xs uppercase tracking-widest text-gray-300 mb-6">Empresa</h4>
            <ul className="space-y-4 text-sm text-gray-400">
              <li><a href="#" className="hover:text-white transition-colors">Sobre Nosotros</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Impacto Social</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Alianzas</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Contacto</a></li>
            </ul>
          </div>

          {/* Columna 4: Suscripción y Logo Derecha */}
          <div className="md:col-span-4 flex flex-col items-start md:items-end gap-8">
            {/* Newsletter: OCULTO EN MÓVIL */}
            <div className="hidden md:block w-full max-w-xs">
              <h4 className="font-bold text-xs uppercase tracking-widest text-gray-300 mb-6 md:text-right">Newsletter</h4>
              <p className="text-sm text-gray-400 mb-4 md:text-right">Recibe las mejores rutas en tu correo.</p>
              <div className="flex gap-2">
                <input 
                  type="email" 
                  placeholder="Tu email" 
                  className="bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-sm w-full focus:outline-none focus:ring-1 focus:ring-white/30"
                />
                <button className="bg-white text-black px-4 py-2 rounded-lg font-bold text-sm hover:bg-gray-200 transition-all">
                  OK
                </button>
              </div>
            </div>

            {/* Logo Coppel Emprende: Siempre visible */}
            <div className="md:mt-auto">
              <Image 
                src="/logosCoppel/Coppel Emprende _RGB_Secundario_White.png" 
                alt="Coppel Emprende" 
                width={130} 
                height={40} 
                className="object-contain opacity-60 hover:opacity-100 transition-opacity grayscale brightness-200"
              />
            </div>
          </div>

        </div>

        {/* Línea inferior (Siempre visible) */}
        <div className="border-t border-white/5 pt-8 flex flex-col md:flex-row justify-between items-center gap-6 text-[10px] uppercase tracking-widest text-gray-600 font-medium text-center md:text-left">
          <div className="flex flex-col md:flex-row items-center gap-4 md:gap-8">
            <p>© {new Date().getFullYear()} MexGo Project</p>
            <div className="flex gap-6">
              <a href="#" className="hover:text-white transition-colors">Privacidad</a>
              <a href="#" className="hover:text-white transition-colors">Términos</a>
            </div>
          </div>
          <div className="flex gap-4">
               <div className="w-6 h-6 rounded-full bg-white/5 flex items-center justify-center hover:bg-white hover:text-black cursor-pointer transition-all">f</div>
               <div className="w-6 h-6 rounded-full bg-white/5 flex items-center justify-center hover:bg-white hover:text-black cursor-pointer transition-all">i</div>
               <div className="w-6 h-6 rounded-full bg-white/5 flex items-center justify-center hover:bg-white hover:text-black cursor-pointer transition-all">x</div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;