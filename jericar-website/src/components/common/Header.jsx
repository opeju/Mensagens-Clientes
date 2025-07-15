import React from 'react';

const Header = () => {
  return (
    <header className="header-enhanced">
      <div className="container mx-auto px-4 header-content">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-3 animate-slide-in">
            <div className="text-4xl animate-bounce-hover">⭐</div>
            <div>
              <h1 className="text-3xl font-bold">JERICAR VIAGENS</h1>
              <p className="text-blue-100 text-sm">Sistema de Confirmação de Serviços</p>
            </div>
          </div>
          <div className="hidden md:block text-right animate-fade-in">
            <p className="text-blue-100 text-sm">Transfer • City Tours • Passeios</p>
            <p className="text-blue-200 text-xs">Profissionalismo e Qualidade</p>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;

