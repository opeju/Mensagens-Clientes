import React, { useState, useEffect } from 'react';
import { ContatosService } from '../../services/ContatosService';

const ContatosEmergenciaManager = () => {
  const [contatos, setContatos] = useState([]);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [contatoEditando, setContatoEditando] = useState(null);
  const [estatisticas, setEstatisticas] = useState({});
  const [filtroTipo, setFiltroTipo] = useState('todos');
  
  const [formulario, setFormulario] = useState({
    nome: '',
    telefone: '',
    tiposServico: [],
    horarioFuncionamento: '24h'
  });

  const [erros, setErros] = useState([]);

  useEffect(() => {
    carregarDados();
  }, []);

  const carregarDados = () => {
    const todosContatos = ContatosService.obterTodosContatos();
    const stats = ContatosService.obterEstatisticas();
    setContatos(todosContatos);
    setEstatisticas(stats);
  };

  const limparFormulario = () => {
    setFormulario({
      nome: '',
      telefone: '',
      tiposServico: [],
      horarioFuncionamento: '24h'
    });
    setErros([]);
    setContatoEditando(null);
  };

  const abrirFormulario = (contato = null) => {
    if (contato) {
      console.log('Editando contato:', contato);
      
      setContatoEditando(contato);
      setFormulario({
        nome: contato.nome,
        telefone: contato.telefone,
        tiposServico: contato.tiposServico,
        horarioFuncionamento: contato.horarioFuncionamento
      });
    } else {
      limparFormulario();
    }
    setMostrarFormulario(true);
  };

  const fecharFormulario = () => {
    setMostrarFormulario(false);
    limparFormulario();
  };

  const handleInputChange = (campo, valor) => {
    if (campo === 'telefone') {
      valor = ContatosService.formatarTelefone(valor);
    }
    
    setFormulario(prev => ({
      ...prev,
      [campo]: valor
    }));
  };

  const handleTipoServicoChange = (tipo) => {
    setFormulario(prev => {
      const tipos = prev.tiposServico.includes(tipo)
        ? prev.tiposServico.filter(t => t !== tipo)
        : [...prev.tiposServico, tipo];
      
      return { ...prev, tiposServico: tipos };
    });
  };

  const salvarContato = () => {
    const errosValidacao = ContatosService.validarContato(formulario);
    
    if (errosValidacao.length > 0) {
      setErros(errosValidacao);
      return;
    }

    let sucesso = false;
    
    if (contatoEditando) {
      sucesso = ContatosService.editarContato(contatoEditando.id, formulario);
    } else {
      const novoContato = ContatosService.adicionarContato(formulario);
      sucesso = !!novoContato;
    }

    if (sucesso) {
      carregarDados();
      fecharFormulario();
      alert(contatoEditando ? 'Contato atualizado com sucesso!' : 'Contato adicionado com sucesso!');
    } else {
      alert('Erro ao salvar contato. Tente novamente.');
    }
  };

  const removerContato = (id, nome) => {
    if (confirm(`Tem certeza que deseja remover o contato "${nome}"?`)) {
      if (ContatosService.removerContato(id)) {
        carregarDados();
        alert('Contato removido com sucesso!');
      } else {
        alert('Erro ao remover contato.');
      }
    }
  };

  const alternarStatus = (id) => {
    console.log('Alterando status do contato:', id);
    const contato = contatos.find(c => c.id === id);
    console.log('Contato encontrado:', contato);
    
    if (ContatosService.alternarStatusContato(id)) {
      carregarDados();
      const novoStatus = !contato.ativo;
      alert(`Contato ${novoStatus ? 'ativado' : 'desativado'} com sucesso!`);
    } else {
      alert('Erro ao alterar status do contato.');
    }
  };

  const contatosFiltrados = contatos.filter(contato => {
    if (filtroTipo === 'todos') return true;
    if (filtroTipo === 'padrao') return contato.padrao;
    if (filtroTipo === 'personalizados') return !contato.padrao;
    if (filtroTipo === 'ativos') return contato.ativo;
    if (filtroTipo === 'inativos') return !contato.ativo;
    return true;
  });

  return (
    <div className="contatos-manager">
      {/* Header com Estatísticas */}
      <div className="header-section">
        <div className="title-section">
          <h2>⚙️ Gerenciar Contatos de Emergência</h2>
          <p>Configure contatos personalizados para diferentes tipos de serviço</p>
        </div>
        
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-number">{estatisticas.total}</div>
            <div className="stat-label">Total de Contatos</div>
          </div>
          <div className="stat-card">
            <div className="stat-number">{estatisticas.ativos}</div>
            <div className="stat-label">Contatos Ativos</div>
          </div>
          <div className="stat-card">
            <div className="stat-number">{estatisticas.personalizados}</div>
            <div className="stat-label">Personalizados</div>
          </div>
          <div className="stat-card">
            <div className="stat-number">{estatisticas.padrao}</div>
            <div className="stat-label">Padrão do Sistema</div>
          </div>
        </div>
      </div>

      {/* Controles */}
      <div className="controls-section">
        <div className="filters">
          <select 
            value={filtroTipo} 
            onChange={(e) => setFiltroTipo(e.target.value)}
            className="filter-select"
          >
            <option value="todos">Todos os Contatos</option>
            <option value="ativos">Apenas Ativos</option>
            <option value="inativos">Apenas Inativos</option>
            <option value="personalizados">Personalizados</option>
            <option value="padrao">Padrão do Sistema</option>
          </select>
        </div>
        
        <button 
          onClick={() => abrirFormulario()}
          className="btn-primary"
        >
          ➕ Adicionar Contato
        </button>
      </div>

      {/* Lista de Contatos */}
      <div className="contatos-list">
        {contatosFiltrados.map(contato => (
          <div key={contato.id} className={`contato-card ${!contato.ativo ? 'inativo' : ''}`}>
            <div className="contato-header">
              <div className="contato-info">
                <h3>{contato.nome}</h3>
                <p className="telefone">{contato.telefone}</p>
              </div>
              <div className="contato-badges">
                {contato.padrao && <span className="badge badge-default">Padrão</span>}
                <span className={`badge ${contato.ativo ? 'badge-active' : 'badge-inactive'}`}>
                  {contato.ativo ? 'Ativo' : 'Inativo'}
                </span>
              </div>
            </div>
            
            <div className="contato-details">
              <div className="detail-item">
                <strong>Tipos de Serviço:</strong>
                <div className="tipos-servico">
                  {contato.tiposServico.map(tipo => (
                    <span key={tipo} className="tipo-badge">{tipo}</span>
                  ))}
                </div>
              </div>
              <div className="detail-item">
                <strong>Horário:</strong> {contato.horarioFuncionamento}
              </div>
            </div>
            
            <div className="contato-actions">
              <button 
                onClick={() => abrirFormulario(contato)}
                className="btn-secondary"
                title="Editar contato"
              >
                ✏️ Editar
              </button>
              <button 
                onClick={() => alternarStatus(contato.id)}
                className={`btn-toggle ${contato.ativo ? 'btn-deactivate' : 'btn-activate'}`}
                title={contato.ativo ? 'Desativar contato' : 'Ativar contato'}
              >
                {contato.ativo ? '⏸️ Desativar' : '▶️ Ativar'}
              </button>
              <button 
                onClick={() => removerContato(contato.id, contato.nome)}
                className="btn-danger"
                title="Remover contato permanentemente"
              >
                🗑️ Remover
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Modal do Formulário */}
      {mostrarFormulario && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>{contatoEditando ? 'Editar Contato' : 'Adicionar Novo Contato'}</h3>
              <button onClick={fecharFormulario} className="btn-close">✕</button>
            </div>
            
            <div className="modal-body">
              {erros.length > 0 && (
                <div className="error-list">
                  {erros.map((erro, index) => (
                    <div key={index} className="error-item">• {erro}</div>
                  ))}
                </div>
              )}
              
              <div className="form-group">
                <label>Nome/Descrição *</label>
                <input
                  type="text"
                  value={formulario.nome}
                  onChange={(e) => handleInputChange('nome', e.target.value)}
                  placeholder="Ex: Central Noturna, Supervisor Fins de Semana"
                />
              </div>
              
              <div className="form-group">
                <label>Telefone *</label>
                <input
                  type="text"
                  value={formulario.telefone}
                  onChange={(e) => handleInputChange('telefone', e.target.value)}
                  placeholder="+55 88 98183-2294"
                />
              </div>
              
              <div className="form-group">
                <label>Tipos de Serviço *</label>
                <div className="checkbox-grid">
                  {ContatosService.TIPOS_SERVICO.map(tipo => (
                    <label key={tipo} className="checkbox-item">
                      <input
                        type="checkbox"
                        checked={formulario.tiposServico.includes(tipo)}
                        onChange={() => handleTipoServicoChange(tipo)}
                      />
                      {tipo}
                    </label>
                  ))}
                </div>
              </div>
              
              <div className="form-group">
                <label>Horário de Funcionamento</label>
                <select
                  value={formulario.horarioFuncionamento}
                  onChange={(e) => handleInputChange('horarioFuncionamento', e.target.value)}
                >
                  <option value="24h">24 horas</option>
                  <option value="09:00-17:00">Horário Comercial (09:00-17:00)</option>
                  <option value="18:00-06:00">Plantão Noturno (18:00-06:00)</option>
                  <option value="Sáb-Dom">Fins de Semana</option>
                  <option value="Seg-Sex">Dias Úteis</option>
                </select>
              </div>
            </div>
            
            <div className="modal-footer">
              <button onClick={fecharFormulario} className="btn-secondary">
                Cancelar
              </button>
              <button onClick={salvarContato} className="btn-primary">
                {contatoEditando ? 'Atualizar' : 'Adicionar'} Contato
              </button>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .contatos-manager {
          padding: 20px;
          max-width: 1200px;
          margin: 0 auto;
        }

        .header-section {
          margin-bottom: 30px;
        }

        .title-section h2 {
          margin: 0 0 5px 0;
          color: #2563eb;
          font-size: 24px;
        }

        .title-section p {
          margin: 0;
          color: #6b7280;
          font-size: 14px;
        }

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 15px;
          margin-top: 20px;
        }

        .stat-card {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          padding: 20px;
          border-radius: 12px;
          text-align: center;
        }

        .stat-number {
          font-size: 32px;
          font-weight: bold;
          margin-bottom: 5px;
        }

        .stat-label {
          font-size: 14px;
          opacity: 0.9;
        }

        .controls-section {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
          gap: 15px;
        }

        .filter-select {
          padding: 10px 15px;
          border: 2px solid #e5e7eb;
          border-radius: 8px;
          font-size: 14px;
          background: white;
        }

        .btn-primary {
          background: linear-gradient(135deg, #10b981 0%, #059669 100%);
          color: white;
          border: none;
          padding: 12px 20px;
          border-radius: 8px;
          font-weight: 600;
          cursor: pointer;
          transition: transform 0.2s;
        }

        .btn-primary:hover {
          transform: translateY(-2px);
        }

        .contatos-list {
          display: grid;
          gap: 20px;
        }

        .contato-card {
          background: white;
          border: 2px solid #e5e7eb;
          border-radius: 12px;
          padding: 20px;
          transition: all 0.3s;
        }

        .contato-card:hover {
          border-color: #3b82f6;
          box-shadow: 0 4px 12px rgba(59, 130, 246, 0.15);
        }

        .contato-card.inativo {
          opacity: 0.6;
          background: #f9fafb;
        }

        .contato-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 15px;
        }

        .contato-info h3 {
          margin: 0 0 5px 0;
          color: #1f2937;
          font-size: 18px;
        }

        .telefone {
          margin: 0;
          color: #6b7280;
          font-family: monospace;
          font-size: 14px;
        }

        .contato-badges {
          display: flex;
          gap: 8px;
        }

        .badge {
          padding: 4px 8px;
          border-radius: 6px;
          font-size: 12px;
          font-weight: 600;
        }

        .badge-default {
          background: #fbbf24;
          color: #92400e;
        }

        .badge-active {
          background: #10b981;
          color: white;
        }

        .badge-inactive {
          background: #ef4444;
          color: white;
        }

        .contato-details {
          margin-bottom: 15px;
        }

        .detail-item {
          margin-bottom: 10px;
        }

        .detail-item strong {
          color: #374151;
          font-size: 14px;
        }

        .tipos-servico {
          display: flex;
          flex-wrap: wrap;
          gap: 6px;
          margin-top: 5px;
        }

        .tipo-badge {
          background: #e0e7ff;
          color: #3730a3;
          padding: 2px 8px;
          border-radius: 4px;
          font-size: 12px;
        }

        .contato-actions {
          display: flex;
          gap: 10px;
          flex-wrap: wrap;
        }

        .contato-padrao-info {
          padding: 10px;
          background: #f3f4f6;
          border-radius: 6px;
          border-left: 4px solid #6b7280;
        }

        .info-text {
          color: #6b7280;
          font-size: 12px;
          font-style: italic;
        }

        .btn-secondary {
          background: #6b7280;
          color: white;
          border: none;
          padding: 8px 12px;
          border-radius: 6px;
          font-size: 12px;
          cursor: pointer;
        }

        .btn-toggle {
          border: none;
          padding: 8px 12px;
          border-radius: 6px;
          font-size: 12px;
          cursor: pointer;
        }

        .btn-activate {
          background: #10b981;
          color: white;
        }

        .btn-deactivate {
          background: #f59e0b;
          color: white;
        }

        .btn-danger {
          background: #ef4444;
          color: white;
          border: none;
          padding: 8px 12px;
          border-radius: 6px;
          font-size: 12px;
          cursor: pointer;
        }

        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
        }

        .modal-content {
          background: white;
          border-radius: 12px;
          width: 90%;
          max-width: 600px;
          max-height: 90vh;
          overflow-y: auto;
        }

        .modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 20px;
          border-bottom: 1px solid #e5e7eb;
        }

        .modal-header h3 {
          margin: 0;
          color: #1f2937;
        }

        .btn-close {
          background: none;
          border: none;
          font-size: 20px;
          cursor: pointer;
          color: #6b7280;
        }

        .modal-body {
          padding: 20px;
        }

        .error-list {
          background: #fef2f2;
          border: 1px solid #fecaca;
          border-radius: 8px;
          padding: 15px;
          margin-bottom: 20px;
        }

        .error-item {
          color: #dc2626;
          font-size: 14px;
          margin-bottom: 5px;
        }

        .form-group {
          margin-bottom: 20px;
        }

        .form-group label {
          display: block;
          margin-bottom: 8px;
          font-weight: 600;
          color: #374151;
        }

        .form-group input, .form-group select {
          width: 100%;
          padding: 12px;
          border: 2px solid #e5e7eb;
          border-radius: 8px;
          font-size: 14px;
        }

        .form-group input:focus, .form-group select:focus {
          outline: none;
          border-color: #3b82f6;
        }

        .checkbox-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 10px;
        }

        .checkbox-item {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 14px;
          cursor: pointer;
        }

        .checkbox-item input {
          width: auto;
        }

        .modal-footer {
          display: flex;
          justify-content: flex-end;
          gap: 10px;
          padding: 20px;
          border-top: 1px solid #e5e7eb;
        }

        @media (max-width: 768px) {
          .contatos-manager {
            padding: 15px;
          }
          
          .controls-section {
            flex-direction: column;
            align-items: stretch;
          }
          
          .contato-header {
            flex-direction: column;
            gap: 10px;
          }
          
          .contato-actions {
            justify-content: center;
          }
        }
      `}</style>
    </div>
  );
};

export default ContatosEmergenciaManager;

