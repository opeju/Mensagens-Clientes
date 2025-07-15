import React, { useState } from 'react';
import ImportacaoAlternativa from '../../services/ImportacaoAlternativa';

const DebugImportacao = () => {
  const [debugInfo, setDebugInfo] = useState('');
  const [mensagensLocalStorage, setMensagensLocalStorage] = useState([]);

  const verificarLocalStorage = () => {
    try {
      const resultado = ImportacaoAlternativa.verificarMensagensSalvas();
      const info = {
        chaves: Object.keys(localStorage),
        totalMensagens: resultado.total,
        mensagens: resultado.mensagens.slice(0, 3) // Mostrar apenas as 3 primeiras
      };
      
      setDebugInfo(JSON.stringify(info, null, 2));
      setMensagensLocalStorage(resultado.mensagens);
    } catch (error) {
      setDebugInfo('Erro ao verificar localStorage: ' + error.message);
    }
  };

  const limparLocalStorage = () => {
    ImportacaoAlternativa.limparTodasMensagens();
    setDebugInfo('localStorage limpo');
    setMensagensLocalStorage([]);
  };

  const adicionarMensagemTeste = () => {
    const dadosCliente = {
      nome: 'Teste Manual',
      reserva: 'TEST001',
      dataServicos: '2025-07-15',
      quantidadePessoas: '2'
    };

    const dadosServico = {
      tipo: 'Transfer',
      operacao: 'Aeroporto → Hotel',
      horarioEmbarque: '14:00',
      horarioTermino: '15:00',
      localEmbarque: 'Aeroporto',
      localDesembarque: 'Hotel',
      observacoes: 'Teste manual'
    };

    const mensagemTexto = 'Mensagem de teste criada manualmente via debug';

    const resultado = ImportacaoAlternativa.salvarMensagemDireta(dadosCliente, dadosServico, mensagemTexto);
    
    if (resultado.sucesso) {
      setDebugInfo(`Mensagem de teste adicionada! Total: ${resultado.totalMensagens}`);
      verificarLocalStorage();
    } else {
      setDebugInfo(`Erro ao adicionar mensagem: ${resultado.erro}`);
    }
  };

  const importarDadosUsuario = () => {
    // Simular dados do arquivo do usuário
    const dadosUsuario = [
      {
        'Nome do Cliente': 'João Silva Santos',
        'Número da Reserva': 'RES123456',
        'Data dos Serviços': '2025-07-15',
        'Quantidade de Pessoas': 2,
        'Tipo de Serviço': 'Transfer Aeroporto',
        'Operação': 'Privativo',
        'Horário Embarque': '14:30',
        'Horário Término': '15:30',
        'Local Embarque': 'Hotel Praia Mar',
        'Local Desembarque': 'Aeroporto Internacional',
        'Observações': 'Cliente VIP'
      },
      {
        'Nome do Cliente': 'Maria Oliveira',
        'Número da Reserva': 'RES789012',
        'Data dos Serviços': '2025-07-16',
        'Quantidade de Pessoas': 4,
        'Tipo de Serviço': 'City Tour Fortaleza',
        'Operação': 'Compartilhado',
        'Horário Embarque': '09:00',
        'Horário Término': '17:00',
        'Local Embarque': 'Hotel Beach Park',
        'Local Desembarque': 'Hotel Beach Park',
        'Observações': 'Incluir almoço'
      }
    ];

    const resultado = ImportacaoAlternativa.processarESalvarDados(dadosUsuario);
    setDebugInfo(`Importação alternativa concluída! Sucessos: ${resultado.sucessos.length}, Erros: ${resultado.erros.length}`);
    verificarLocalStorage();
  };

  const forcarRecarregamento = () => {
    window.location.reload();
  };

  return (
    <div style={{ 
      position: 'fixed', 
      top: '10px', 
      right: '10px', 
      background: 'white', 
      border: '2px solid #007bff', 
      padding: '15px', 
      borderRadius: '8px',
      maxWidth: '400px',
      maxHeight: '500px',
      overflow: 'auto',
      zIndex: 9999,
      fontSize: '12px'
    }}>
      <h4>🔧 Debug Importação</h4>
      
      <div style={{ marginBottom: '10px' }}>
        <button onClick={verificarLocalStorage} style={{ marginRight: '5px', padding: '5px 10px', fontSize: '10px' }}>
          🔍 Verificar
        </button>
        <button onClick={limparLocalStorage} style={{ marginRight: '5px', padding: '5px 10px', fontSize: '10px' }}>
          🗑️ Limpar
        </button>
        <button onClick={adicionarMensagemTeste} style={{ marginRight: '5px', padding: '5px 10px', fontSize: '10px' }}>
          ➕ Teste
        </button>
        <button onClick={importarDadosUsuario} style={{ marginRight: '5px', padding: '5px 10px', fontSize: '10px', background: '#28a745', color: 'white' }}>
          📊 Importar Dados
        </button>
        <button onClick={forcarRecarregamento} style={{ padding: '5px 10px', fontSize: '10px' }}>
          🔄 Recarregar
        </button>
      </div>

      {debugInfo && (
        <div style={{ 
          background: '#f8f9fa', 
          padding: '10px', 
          borderRadius: '4px',
          marginBottom: '10px',
          maxHeight: '200px',
          overflow: 'auto'
        }}>
          <strong>Debug Info:</strong>
          <pre style={{ fontSize: '10px', margin: '5px 0' }}>{debugInfo}</pre>
        </div>
      )}

      {mensagensLocalStorage.length > 0 && (
        <div style={{ 
          background: '#e8f5e8', 
          padding: '10px', 
          borderRadius: '4px',
          maxHeight: '150px',
          overflow: 'auto'
        }}>
          <strong>Mensagens Encontradas ({mensagensLocalStorage.length}):</strong>
          {mensagensLocalStorage.map((msg, index) => (
            <div key={index} style={{ 
              border: '1px solid #ccc', 
              padding: '5px', 
              margin: '5px 0',
              borderRadius: '3px',
              fontSize: '10px'
            }}>
              <div><strong>Cliente:</strong> {msg.cliente?.nome}</div>
              <div><strong>Data:</strong> {msg.cliente?.dataServicos}</div>
              <div><strong>Status:</strong> {msg.status}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default DebugImportacao;

