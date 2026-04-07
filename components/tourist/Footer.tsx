import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-primary text-white py-12 mt-12">
      <div className="container-responsive">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8 text-center md:text-left">
          <div>
            <div className="flex items-center gap-2 mb-4 justify-center md:justify-start">
              <div className="w-8 h-8 bg-secondary rounded-full flex items-center justify-center">
                <span className="text-primary font-bold">M</span>
              </div>
              <h3 className="text-xl font-bold">MexGo</h3>
            </div>
            <p className="text-white/70 text-sm">
              Conectando el turismo con el impacto social. Una iniciativa de Fundación Coppel y Hola México.
            </p>
          </div>
          <div>
            <h4 className="font-bold mb-4">Explora</h4>
            <ul className="text-white/70 text-sm space-y-2">
              <li><a href="#" className="hover:text-secondary transition-colors">Destinos</a></li>
              <li><a href="#" className="hover:text-secondary transition-colors">Cultura</a></li>
              <li><a href="#" className="hover:text-secondary transition-colors">Gastronomía</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold mb-4">Soporte</h4>
            <ul className="text-white/70 text-sm space-y-2">
              <li><a href="#" className="hover:text-secondary transition-colors">Ayuda</a></li>
              <li><a href="#" className="hover:text-secondary transition-colors">Términos</a></li>
              <li><a href="#" className="hover:text-secondary transition-colors">Privacidad</a></li>
            </ul>
          </div>
        </div>
        <div className="border-t border-white/10 pt-8 text-center text-white/50 text-xs">
          © {new Date().getFullYear()} MexGo. Todos los derechos reservados.
        </div>
      </div>
    </footer>
  );
};

export default Footer;
