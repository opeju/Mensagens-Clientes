import React, { useState } from 'react';
import ExcelService from '../../services/ExcelService';
import MensagensSalvasServiceAprimorado from '../../services/MensagensSalvasServiceAprimorado';
import ImportacaoTXTComponent from './ImportacaoTXT';

const ImportacaoExcel = () => {
  const [tipoImportacao, setTipoImportacao] = useState('excel');
  const [etapaAtual, setEtapaAtual] = useState('upload'); // upload, preview, resultado
  const [arquivo, setArquivo] = useState(null);
  const [resultadoProcessamento, setResultadoProcessamento] = useState(null);
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState('');

  const handleFileChange = (event) => {
    const arquivoSelecionado = event.target.files[0];
    
    if (!arquivoSelecionado) return;
    
    // Validar tipo de arquivo
    const tiposPermitidos = [
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-excel'
    ];
    
    if (!tiposPermitidos.includes(arquivoSelecionado.type)) {
      setErro('Por favor, selecione um arquivo Excel (.xlsx ou .xls)');
      return;
    }
    
    // Validar tamanho (máximo 5MB)
    if (arquivoSelecionado.size > 5 * 1024 * 1024) {
      setErro('Arquivo muito grande. Máximo permitido: 5MB');
      return;
    }
    
    setArquivo(arquivoSelecionado);
    setErro('');
  };

  const processarArquivo = async () => {
    if (!arquivo) return;
    
    setCarregando(true);
    setErro('');
    
    try {
      const resultado = await ExcelService.processarArquivoCompleto(arquivo);
      
      if (resultado.sucesso) {
        setResultadoProcessamento(resultado);
        setEtapaAtual('preview');
      } else {
        setErro(resultado.erro);
      }
    } catch (error) {
      setErro('Erro ao processar arquivo: ' + error.message);
    } finally {
      setCarregando(false);
    }
  };

  const confirmarImportacao = () => {
    if (!resultadoProcessamento?.geracao?.mensagensGeradas) return;
    
    try {
      // As mensagens já foram geradas no processamento, agora vamos salvá-las
      const mensagensGeradas = resultadoProcessamento.geracao.mensagensGeradas;
      
      // Salvar todas as mensagens geradas no localStorage
      mensagensGeradas.forEach(item => {
        const clienteData = {
          nome: item.dadosOriginais.nome,
          reserva: item.dadosOriginais.reserva,
          dataServicos: item.dadosOriginais.data,
          quantidadePessoas: item.dadosOriginais.pessoas
        };
        
        const servicos = [{
          tipo: item.dadosOriginais.tipoServico,
          operacao: item.dadosOriginais.operacao,
          horarioEmbarque: item.dadosOriginais.horarioEmbarque,
          horarioTermino: item.dadosOriginais.horarioTermino || '',
          localEmbarque: item.dadosOriginais.localEmbarque,
          localDesembarque: item.dadosOriginais.localDesembarque,
          observacoes: item.dadosOriginais.observacoes || ''
        }];
        
        MensagensSalvasServiceAprimorado.salvarMensagem(
          clienteData,
          servicos,
          item.mensagem
        );
      });
      
      console.log(`${mensagensGeradas.length} mensagens salvas com sucesso!`);
      setEtapaAtual('resultado');
    } catch (error) {
      setErro('Erro ao salvar mensagens: ' + error.message);
    }
  };

  const reiniciar = () => {
    setEtapaAtual('upload');
    setArquivo(null);
    setResultadoProcessamento(null);
    setErro('');
  };

  const downloadTemplate = () => {
    ExcelService.downloadTemplate();
  };

  const formatarTamanhoArquivo = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="importacao-excel">
      <style jsx>{`
        .importacao-excel {
          max-width: 900px;
          margin: 0 auto;
          padding: 20px;
        }
        
        .tipo-importacao-section {
          background: white;
          border-radius: 12px;
          padding: 30px;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
          margin-bottom: 20px;
          text-align: center;
        }
        
        .tipo-tabs {
          display: flex;
          gap: 10px;
          justify-content: center;
          margin-top: 20px;
        }
        
        .tipo-tab {
          padding: 15px 30px;
          border: 2px solid #dee2e6;
          background: white;
          border-radius: 8px;
          cursor: pointer;
          font-size: 16px;
          font-weight: 500;
          transition: all 0.3s ease;
        }
        
        .tipo-tab:hover {
          border-color: #007bff;
          background: #f8f9fa;
        }
        
        .tipo-tab.ativo {
          background: linear-gradient(135deg, #007bff, #0056b3);
          color: white;
          border-color: #007bff;
        }
        
        .excel-importacao {
          background: white;
          border-radius: 12px;
          padding: 30px;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }
      `}</style>

      {/* Seleção do Tipo de Importação */}
      <div className="tipo-importacao-section">
        <h2>📊 Importação em Lote</h2>
        <p>Escolha o formato de arquivo para importar múltiplos serviços</p>
        
        <div className="tipo-tabs">
          <button 
            className={`tipo-tab ${tipoImportacao === 'excel' ? 'ativo' : ''}`}
            onClick={() => setTipoImportacao('excel')}
          >
            📊 Excel (.xlsx)
          </button>
          <button 
            className={`tipo-tab ${tipoImportacao === 'txt' ? 'ativo' : ''}`}
            onClick={() => setTipoImportacao('txt')}
          >
            📄 Texto (.txt)
          </button>
        </div>
      </div>

      {/* Renderizar componente baseado no tipo selecionado */}
      {tipoImportacao === 'txt' ? (
        <ImportacaoTXTComponent />
      ) : (
        <div className="excel-importacao">
          {/* Header */}
          <div className="header-section">
            <h3>📊 Importação via Excel</h3>
            <p>Importe múltiplos serviços usando planilha Excel</p>
          </div>

          {/* Indicador de Etapas */}
          <div className="etapas-indicador">
        <div className={`etapa ${etapaAtual === 'upload' ? 'ativa' : etapaAtual !== 'upload' ? 'concluida' : ''}`}>
          <div className="etapa-numero">1</div>
          <div className="etapa-label">Upload do Arquivo</div>
        </div>
        <div className="etapa-linha"></div>
        <div className={`etapa ${etapaAtual === 'preview' ? 'ativa' : etapaAtual === 'resultado' ? 'concluida' : ''}`}>
          <div className="etapa-numero">2</div>
          <div className="etapa-label">Preview e Validação</div>
        </div>
        <div className="etapa-linha"></div>
        <div className={`etapa ${etapaAtual === 'resultado' ? 'ativa' : ''}`}>
          <div className="etapa-numero">3</div>
          <div className="etapa-label">Resultado</div>
        </div>
      </div>

      {/* Conteúdo por Etapa */}
      {etapaAtual === 'upload' && (
        <div className="etapa-content">
          {/* Download Template */}
          <div className="template-section">
            <h3>📋 1. Baixe o Template</h3>
            <p>Primeiro, baixe nossa planilha modelo com exemplos e instruções:</p>
            <button onClick={downloadTemplate} className="btn-template">
              📥 Baixar Template Excel
            </button>
          </div>

          {/* Upload Area */}
          <div className="upload-section">
            <h3>📤 2. Faça Upload da Planilha</h3>
            <div className="upload-area">
              <input
                type="file"
                id="file-input"
                accept=".xlsx,.xls"
                onChange={handleFileChange}
                style={{ display: 'none' }}
              />
              <label htmlFor="file-input" className="upload-label">
                <div className="upload-icon">📁</div>
                <div className="upload-text">
                  {arquivo ? (
                    <>
                      <strong>{arquivo.name}</strong>
                      <br />
                      <small>{formatarTamanhoArquivo(arquivo.size)}</small>
                    </>
                  ) : (
                    <>
                      Clique aqui ou arraste o arquivo Excel
                      <br />
                      <small>Formatos aceitos: .xlsx, .xls (máx. 5MB)</small>
                    </>
                  )}
                </div>
              </label>
            </div>

            {erro && (
              <div className="error-message">
                ⚠️ {erro}
              </div>
            )}

            {arquivo && (
              <div className="file-info">
                <h4>Arquivo Selecionado:</h4>
                <div className="file-details">
                  <div><strong>Nome:</strong> {arquivo.name}</div>
                  <div><strong>Tamanho:</strong> {formatarTamanhoArquivo(arquivo.size)}</div>
                  <div><strong>Tipo:</strong> {arquivo.type}</div>
                </div>
                
                <button 
                  onClick={processarArquivo} 
                  disabled={carregando}
                  className="btn-processar"
                >
                  {carregando ? '⏳ Processando...' : '🚀 Processar Arquivo'}
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {etapaAtual === 'preview' && resultadoProcessamento && (
        <div className="etapa-content">
          <h3>👀 Preview dos Dados Importados</h3>
          
          {/* Resumo */}
          <div className="resumo-grid">
            <div className="resumo-card sucesso">
              <div className="resumo-numero">{resultadoProcessamento.resumo.dadosValidos}</div>
              <div className="resumo-label">Registros Válidos</div>
            </div>
            <div className="resumo-card erro">
              <div className="resumo-numero">{resultadoProcessamento.resumo.dadosInvalidos}</div>
              <div className="resumo-label">Registros com Erro</div>
            </div>
            <div className="resumo-card info">
              <div className="resumo-numero">{resultadoProcessamento.geracao?.totalSucesso || 0}</div>
              <div className="resumo-label">Mensagens a Gerar</div>
            </div>
            <div className="resumo-card total">
              <div className="resumo-numero">{resultadoProcessamento.resumo.totalLinhas}</div>
              <div className="resumo-label">Total de Linhas</div>
            </div>
          </div>

          {/* Dados Válidos */}
          {resultadoProcessamento.validacao.validos.length > 0 && (
            <div className="dados-section">
              <h4>✅ Dados Válidos ({resultadoProcessamento.validacao.validos.length})</h4>
              <div className="dados-preview">
                {resultadoProcessamento.validacao.validos.slice(0, 5).map((dados, index) => (
                  <div key={index} className="dados-item valido">
                    <div className="dados-header">
                      <strong>{dados.nome}</strong> - {dados.reserva}
                    </div>
                    <div className="dados-detalhes">
                      {dados.data} | {dados.pessoas} pessoa(s) | {dados.tipoServico}
                    </div>
                  </div>
                ))}
                {resultadoProcessamento.validacao.validos.length > 5 && (
                  <div className="dados-mais">
                    ... e mais {resultadoProcessamento.validacao.validos.length - 5} registros
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Dados Inválidos */}
          {resultadoProcessamento.validacao.invalidos.length > 0 && (
            <div className="dados-section">
              <h4>❌ Dados com Problemas ({resultadoProcessamento.validacao.invalidos.length})</h4>
              <div className="dados-preview">
                {resultadoProcessamento.validacao.invalidos.slice(0, 3).map((dados, index) => (
                  <div key={index} className="dados-item invalido">
                    <div className="dados-header">
                      <strong>Linha {dados.linhaOriginal}:</strong> {dados.nome || 'Nome não informado'}
                    </div>
                    <div className="dados-erros">
                      {dados.erros.map((erro, i) => (
                        <div key={i} className="erro-item">• {erro}</div>
                      ))}
                    </div>
                  </div>
                ))}
                {resultadoProcessamento.validacao.invalidos.length > 3 && (
                  <div className="dados-mais erro">
                    ... e mais {resultadoProcessamento.validacao.invalidos.length - 3} registros com problemas
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Ações */}
          <div className="acoes-preview">
            <button onClick={reiniciar} className="btn-secondary">
              ⬅️ Voltar
            </button>
            {resultadoProcessamento.resumo.dadosValidos > 0 && (
              <button onClick={confirmarImportacao} className="btn-primary">
                ✅ Prosseguir ({resultadoProcessamento.resumo.dadosValidos} registros válidos)
              </button>
            )}
          </div>
        </div>
      )}

      {etapaAtual === 'resultado' && resultadoProcessamento && (
        <div className="etapa-content">
          <div className="resultado-sucesso">
            <div className="resultado-icon">🎉</div>
            <h3>Importação Concluída com Sucesso!</h3>
            <p>
              {resultadoProcessamento.geracao?.totalSucesso || 0} mensagens foram importadas 
              e estão disponíveis na aba "Mensagens do Dia".
            </p>
            
            <div className="resultado-stats">
              <div className="stat-item">
                <strong>{resultadoProcessamento.resumo.totalLinhas}</strong>
                <span>Linhas Processadas</span>
              </div>
              <div className="stat-item">
                <strong>{resultadoProcessamento.geracao?.totalSucesso || 0}</strong>
                <span>Mensagens Criadas</span>
              </div>
              <div className="stat-item">
                <strong>{resultadoProcessamento.resumo.dadosInvalidos}</strong>
                <span>Registros Ignorados</span>
              </div>
            </div>
            
            <div className="resultado-acoes">
              <button onClick={reiniciar} className="btn-primary">
                📊 Nova Importação
              </button>
              <button 
                onClick={() => window.location.hash = '#mensagens-do-dia'} 
                className="btn-secondary"
              >
                📋 Ver Mensagens
              </button>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .importacao-excel {
          padding: 20px;
          max-width: 1000px;
          margin: 0 auto;
        }

        .header-section h2 {
          margin: 0 0 5px 0;
          color: #2563eb;
          font-size: 24px;
        }

        .header-section p {
          margin: 0 0 30px 0;
          color: #6b7280;
          font-size: 14px;
        }

        .etapas-indicador {
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 40px;
          padding: 20px;
          background: #f8fafc;
          border-radius: 12px;
        }

        .etapa {
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
        }

        .etapa-numero {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: bold;
          margin-bottom: 8px;
          background: #e5e7eb;
          color: #6b7280;
        }

        .etapa.ativa .etapa-numero {
          background: #3b82f6;
          color: white;
        }

        .etapa.concluida .etapa-numero {
          background: #10b981;
          color: white;
        }

        .etapa-label {
          font-size: 12px;
          color: #6b7280;
          font-weight: 600;
        }

        .etapa.ativa .etapa-label {
          color: #3b82f6;
        }

        .etapa-linha {
          width: 60px;
          height: 2px;
          background: #e5e7eb;
          margin: 0 20px;
        }

        .etapa-content {
          background: white;
          border-radius: 12px;
          padding: 30px;
          border: 2px solid #e5e7eb;
        }

        .template-section {
          margin-bottom: 40px;
          padding-bottom: 30px;
          border-bottom: 1px solid #e5e7eb;
        }

        .template-section h3 {
          margin: 0 0 10px 0;
          color: #1f2937;
        }

        .template-section p {
          margin: 0 0 15px 0;
          color: #6b7280;
        }

        .btn-template {
          background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
          color: white;
          border: none;
          padding: 12px 24px;
          border-radius: 8px;
          font-weight: 600;
          cursor: pointer;
          transition: transform 0.2s;
        }

        .btn-template:hover {
          transform: translateY(-2px);
        }

        .upload-section h3 {
          margin: 0 0 15px 0;
          color: #1f2937;
        }

        .upload-area {
          border: 3px dashed #d1d5db;
          border-radius: 12px;
          padding: 40px;
          text-align: center;
          transition: all 0.3s;
          cursor: pointer;
        }

        .upload-area:hover {
          border-color: #3b82f6;
          background: #f8fafc;
        }

        .upload-label {
          cursor: pointer;
          display: block;
        }

        .upload-icon {
          font-size: 48px;
          margin-bottom: 15px;
        }

        .upload-text {
          color: #6b7280;
          font-size: 16px;
        }

        .upload-text strong {
          color: #1f2937;
        }

        .error-message {
          background: #fef2f2;
          border: 1px solid #fecaca;
          color: #dc2626;
          padding: 12px;
          border-radius: 8px;
          margin-top: 15px;
        }

        .file-info {
          margin-top: 20px;
          padding: 20px;
          background: #f0f9ff;
          border-radius: 8px;
          border: 1px solid #bae6fd;
        }

        .file-info h4 {
          margin: 0 0 10px 0;
          color: #0c4a6e;
        }

        .file-details {
          margin-bottom: 15px;
        }

        .file-details div {
          margin-bottom: 5px;
          color: #374151;
          font-size: 14px;
        }

        .btn-processar {
          background: linear-gradient(135deg, #10b981 0%, #059669 100%);
          color: white;
          border: none;
          padding: 12px 24px;
          border-radius: 8px;
          font-weight: 600;
          cursor: pointer;
          transition: transform 0.2s;
        }

        .btn-processar:hover:not(:disabled) {
          transform: translateY(-2px);
        }

        .btn-processar:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .resumo-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 15px;
          margin-bottom: 30px;
        }

        .resumo-card {
          padding: 20px;
          border-radius: 12px;
          text-align: center;
          color: white;
        }

        .resumo-card.sucesso {
          background: linear-gradient(135deg, #10b981 0%, #059669 100%);
        }

        .resumo-card.erro {
          background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
        }

        .resumo-card.info {
          background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
        }

        .resumo-card.total {
          background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%);
        }

        .resumo-numero {
          font-size: 32px;
          font-weight: bold;
          margin-bottom: 5px;
        }

        .resumo-label {
          font-size: 14px;
          opacity: 0.9;
        }

        .dados-section {
          margin-bottom: 30px;
        }

        .dados-section h4 {
          margin: 0 0 15px 0;
          color: #1f2937;
        }

        .dados-preview {
          background: #f9fafb;
          border-radius: 8px;
          padding: 15px;
        }

        .dados-item {
          background: white;
          border-radius: 6px;
          padding: 12px;
          margin-bottom: 10px;
          border-left: 4px solid #10b981;
        }

        .dados-item.invalido {
          border-left-color: #ef4444;
        }

        .dados-header {
          font-size: 14px;
          margin-bottom: 5px;
        }

        .dados-detalhes {
          font-size: 12px;
          color: #6b7280;
        }

        .dados-erros {
          margin-top: 8px;
        }

        .erro-item {
          font-size: 12px;
          color: #dc2626;
          margin-bottom: 3px;
        }

        .dados-mais {
          text-align: center;
          color: #6b7280;
          font-style: italic;
          padding: 10px;
        }

        .dados-mais.erro {
          color: #dc2626;
        }

        .acoes-preview {
          display: flex;
          justify-content: space-between;
          gap: 15px;
          margin-top: 30px;
        }

        .btn-primary {
          background: linear-gradient(135deg, #10b981 0%, #059669 100%);
          color: white;
          border: none;
          padding: 12px 24px;
          border-radius: 8px;
          font-weight: 600;
          cursor: pointer;
          transition: transform 0.2s;
        }

        .btn-primary:hover {
          transform: translateY(-2px);
        }

        .btn-secondary {
          background: #6b7280;
          color: white;
          border: none;
          padding: 12px 24px;
          border-radius: 8px;
          font-weight: 600;
          cursor: pointer;
          transition: transform 0.2s;
        }

        .btn-secondary:hover {
          transform: translateY(-2px);
        }

        .resultado-sucesso {
          text-align: center;
          padding: 40px;
        }

        .resultado-icon {
          font-size: 64px;
          margin-bottom: 20px;
        }

        .resultado-sucesso h3 {
          margin: 0 0 15px 0;
          color: #10b981;
          font-size: 24px;
        }

        .resultado-sucesso p {
          margin: 0 0 30px 0;
          color: #6b7280;
          font-size: 16px;
        }

        .resultado-stats {
          display: flex;
          justify-content: center;
          gap: 40px;
          margin-bottom: 30px;
        }

        .stat-item {
          text-align: center;
        }

        .stat-item strong {
          display: block;
          font-size: 24px;
          color: #1f2937;
          margin-bottom: 5px;
        }

        .stat-item span {
          font-size: 14px;
          color: #6b7280;
        }

        .resultado-acoes {
          display: flex;
          justify-content: center;
          gap: 15px;
        }

        @media (max-width: 768px) {
          .importacao-excel {
            padding: 15px;
          }
          
          .etapas-indicador {
            flex-direction: column;
            gap: 20px;
          }
          
          .etapa-linha {
            width: 2px;
            height: 30px;
            margin: 10px 0;
          }
          
          .resumo-grid {
            grid-template-columns: 1fr 1fr;
          }
          
          .acoes-preview {
            flex-direction: column;
          }
          
          .resultado-stats {
            flex-direction: column;
            gap: 20px;
          }
        }
      `}</style>
        </div>
      )}
    </div>
  );
};

export default ImportacaoExcel;

