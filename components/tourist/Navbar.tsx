import React from 'react';

const Navbar: React.FC = () => {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-surface shadow-sm h-16 flex items-center">
      <div className="container-responsive flex items-center justify-between">
        <div className="flex items-center gap-2">
          {/* Logo Placeholder */}
          <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
            <span className="text-secondary font-bold text-xl">M</span>
          </div>
          <span className="text-primary font-bold text-xl hidden sm:block">MexGo</span>
        </div>
        
        <div className="flex gap-4 sm:gap-6">
          <button className="text-primary font-semibold hover:text-accent transition-colors">
            Descubrir
          </button>
          <button className="text-primary font-semibold hover:text-accent transition-colors">
            Itinerario
          </button>
          <button className="text-primary font-semibold hover:text-accent transition-colors">
            Más
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
