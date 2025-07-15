import React from 'react';

const TabNavigation = ({ tabs, activeTab, onTabChange }) => {
  // Usar tabs passadas como prop ou fallback para as originais
  const tabsToRender = tabs || [
    {
      id: 'gerador',
      label: '📝 Gerador de Mensagens',
      description: 'Criar novas mensagens de confirmação'
    },
    {
      id: 'mensagens',
      label: '📋 Mensagens do Dia',
      description: 'Gerenciar mensagens salvas'
    }
  ];

  return (
    <div className="mb-6 animate-fade-in">
      <div className="tab-navigation">
        {tabsToRender.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`tab-button transition-all hover-lift ${
              activeTab === tab.id ? 'active' : ''
            }`}
          >
            <div className="text-center">
              <div className="font-semibold">{tab.label}</div>
              <div className="text-xs opacity-80 mt-1">{tab.description}</div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

export default TabNavigation;

