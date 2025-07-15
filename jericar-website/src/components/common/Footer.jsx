import React from 'react';

const Footer = () => {
  return (
    <footer className="bg-gray-800 text-white py-6 mt-auto">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="mb-4 md:mb-0">
            <p className="text-sm">© 2025 Jericar Viagens - Todos os direitos reservados</p>
            <p className="text-xs text-gray-400">Sistema desenvolvido por Manus AI</p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="text-sm">
              <p>📞 +55 88 98183-2294</p>
              <p className="text-xs text-gray-400">Atendimento: Seg-Sex 09:00-16:00</p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

