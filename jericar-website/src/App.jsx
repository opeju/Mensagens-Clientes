import React, { useState } from 'react';
import Layout from './components/common/Layout';
import TabNavigation from './components/common/TabNavigation';
import GeradorMensagensAprimorado from './pages/GeradorMensagensAprimorado';
import MensagensDoDiaAprimorada from './pages/MensagensDoDiaAprimorada';
import ContatosEmergenciaManager from './components/contatos/ContatosEmergenciaManager';
import './App.css';
import './styles/custom.css';

function App() {
  const [activeTab, setActiveTab] = useState('gerador');

  const tabs = [
    { 
      id: 'gerador', 
      label: '📝 Gerador de Mensagens',
      description: 'Criar novas mensagens de confirmação'
    },
    { 
      id: 'mensagens', 
      label: '📋 Mensagens do Dia',
      description: 'Gerenciar mensagens salvas'
    },
    { 
      id: 'configuracoes', 
      label: '⚙️ Configurações',
      description: 'Gerenciar contatos de emergência'
    }
  ];

  const renderActiveTab = () => {
    switch (activeTab) {
      case 'gerador':
        return <GeradorMensagensAprimorado />;
      case 'mensagens':
        return <MensagensDoDiaAprimorada />;
      case 'configuracoes':
        return <ContatosEmergenciaManager />;
      default:
        return <GeradorMensagensAprimorado />;
    }
  };

  return (
    <Layout>
      <TabNavigation 
        tabs={tabs}
        activeTab={activeTab} 
        onTabChange={setActiveTab} 
      />
      <div className="tab-content">
        {renderActiveTab()}
      </div>
    </Layout>
  );
}

export default App;

