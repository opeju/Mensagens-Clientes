import React, { useState } from 'react';
import ImportacaoTXT from '../../services/ImportacaoTXT';

const ImportacaoTXTComponent = () => {
  const [etapaAtual, setEtapaAtual] = useState('upload');
  const [arquivo, setArquivo] = useState(null);
  const [resultadoProcessamento, setResultadoProcessamento] = useState(null);
  const [erro, setErro] = useState('');
  const [processando, setProcessando] = useState(false);

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    setErro('');
    
    if (file) {
      // Validar tipo de arquivo
      if (!file.name.toLowerCase().endsWith('.txt')) {
        setErro('Por favor, selecione um arquivo .txt');
        return;
      }
      
      // Validar tamanho (máx 1MB)
      if (file.size > 1024 * 1024) {
        setErro('Arquivo muito grande. Máximo permitido: 1MB');
        return;
      }
      
      setArquivo(file);
    }
  };

  const processarArquivo = async () => {
    if (!arquivo) return;
    
    setProcessando(true);
    setErro('');
    
    try {
      const resultado = await ImportacaoTXT.processarArquivoCompleto(arquivo);
      
      if (resultado.sucesso) {
        setResultadoProcessamento(resultado);
        setEtapaAtual('resultado');
      } else {
        setErro(resultado.erro);
      }
    } catch (error) {
      setErro('Erro ao processar arquivo: ' + error.message);
    } finally {
      setProcessando(false);
    }
  };

  const downloadTemplate = () => {
    ImportacaoTXT.gerarTemplateTXT();
  };

  const reiniciar = () => {
    setEtapaAtual('upload');
    setArquivo(null);
    setResultadoProcessamento(null);
    setErro('');
    setProcessando(false);
  };

  const formatarTamanhoArquivo = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const irParaMensagens = () => {
    // Recarregar a página para atualizar a aba de mensagens
    window.location.reload();
  };

  return (
    <div className="importacao-txt">
      <style jsx>{`
        .importacao-txt {
          max-width: 900px;
          margin: 0 auto;
          padding: 20px;
        }
        
        .etapas-header {
          display: flex;
          justify-content: center;
          margin-bottom: 30px;
          gap: 20px;
        }
        
        .etapa {
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 15px;
          border-radius: 10px;
          min-width: 120px;
        }
        
        .etapa.ativa {
          background: linear-gradient(135deg, #007bff, #0056b3);
          color: white;
        }
        
        .etapa.inativa {
          background: #f8f9fa;
          color: #6c757d;
        }
        
        .etapa-numero {
          width: 30px;
          height: 30px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: bold;
          margin-bottom: 8px;
        }
        
        .etapa.ativa .etapa-numero {
          background: rgba(255, 255, 255, 0.2);
        }
        
        .etapa.inativa .etapa-numero {
          background: #dee2e6;
        }
        
        .etapa-content {
          background: white;
          border-radius: 12px;
          padding: 30px;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
          margin-bottom: 20px;
        }
        
        .template-section {
          background: #e8f4fd;
          border: 2px dashed #007bff;
          border-radius: 8px;
          padding: 20px;
          margin-bottom: 25px;
          text-align: center;
        }
        
        .upload-section {
          background: #f8f9fa;
          border-radius: 8px;
          padding: 20px;
        }
        
        .upload-area {
          border: 2px dashed #007bff;
          border-radius: 8px;
          padding: 40px;
          text-align: center;
          background: white;
          cursor: pointer;
          transition: all 0.3s ease;
        }
        
        .upload-area:hover {
          border-color: #0056b3;
          background: #f8f9fa;
        }
        
        .upload-icon {
          font-size: 48px;
          margin-bottom: 15px;
        }
        
        .upload-text {
          font-size: 16px;
          color: #495057;
        }
        
        .btn-template {
          background: linear-gradient(135deg, #28a745, #20c997);
          color: white;
          border: none;
          padding: 12px 24px;
          border-radius: 6px;
          font-size: 16px;
          cursor: pointer;
          transition: all 0.3s ease;
        }
        
        .btn-template:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 8px rgba(40, 167, 69, 0.3);
        }
        
        .btn-primary {
          background: linear-gradient(135deg, #007bff, #0056b3);
          color: white;
          border: none;
          padding: 12px 24px;
          border-radius: 6px;
          font-size: 16px;
          cursor: pointer;
          transition: all 0.3s ease;
        }
        
        .btn-primary:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 8px rgba(0, 123, 255, 0.3);
        }
        
        .btn-secondary {
          background: #6c757d;
          color: white;
          border: none;
          padding: 12px 24px;
          border-radius: 6px;
          font-size: 16px;
          cursor: pointer;
          margin-right: 10px;
        }
        
        .error-message {
          background: #f8d7da;
          color: #721c24;
          padding: 12px;
          border-radius: 6px;
          margin: 15px 0;
          border: 1px solid #f5c6cb;
        }
        
        .file-info {
          background: #d1ecf1;
          border: 1px solid #bee5eb;
          border-radius: 6px;
          padding: 15px;
          margin: 15px 0;
        }
        
        .resultado-sucesso {
          text-align: center;
          padding: 20px;
        }
        
        .resultado-icon {
          font-size: 64px;
          margin-bottom: 20px;
        }
        
        .resultado-stats {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
          gap: 15px;
          margin: 20px 0;
        }
        
        .stat-item {
          background: #f8f9fa;
          padding: 15px;
          border-radius: 8px;
          text-align: center;
        }
        
        .preview-dados {
          background: #f8f9fa;
          border-radius: 8px;
          padding: 15px;
          margin: 15px 0;
          max-height: 300px;
          overflow-y: auto;
        }
        
        .registro-preview {
          background: white;
          border: 1px solid #dee2e6;
          border-radius: 6px;
          padding: 10px;
          margin: 10px 0;
          font-size: 14px;
        }
        
        .loading {
          display: flex;
          align-items: center;
          gap: 10px;
          color: #007bff;
        }
        
        .spinner {
          width: 20px;
          height: 20px;
          border: 2px solid #f3f3f3;
          border-top: 2px solid #007bff;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }
        
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>

      <div className="etapas-header">
        <div className={`etapa ${etapaAtual === 'upload' ? 'ativa' : 'inativa'}`}>
          <div className="etapa-numero">1</div>
          <div>Upload do Arquivo</div>
        </div>
        <div className={`etapa ${etapaAtual === 'resultado' ? 'ativa' : 'inativa'}`}>
          <div className="etapa-numero">2</div>
          <div>Resultado</div>
        </div>
      </div>

      {etapaAtual === 'upload' && (
        <div className="etapa-content">
          <h2>📄 Importação via Arquivo TXT</h2>
          <p>Importe múltiplos serviços usando um arquivo de texto estruturado</p>

          {/* Template Section */}
          <div className="template-section">
            <h3>📋 1. Baixe o Template</h3>
            <p>Primeiro, baixe nosso template TXT com exemplos e instruções:</p>
            <button onClick={downloadTemplate} className="btn-template">
              📥 Baixar Template TXT
            </button>
          </div>

          {/* Upload Section */}
          <div className="upload-section">
            <h3>📤 2. Faça Upload do Arquivo</h3>
            <div className="upload-area">
              <input
                type="file"
                id="file-input-txt"
                accept=".txt"
                onChange={handleFileChange}
                style={{ display: 'none' }}
              />
              <label htmlFor="file-input-txt" className="upload-label">
                <div className="upload-icon">📄</div>
                <div className="upload-text">
                  {arquivo ? (
                    <>
                      <strong>{arquivo.name}</strong>
                      <br />
                      <small>{formatarTamanhoArquivo(arquivo.size)}</small>
                    </>
                  ) : (
                    <>
                      Clique aqui ou arraste o arquivo TXT
                      <br />
                      <small>Formato aceito: .txt (máx. 1MB)</small>
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
                <div><strong>Nome:</strong> {arquivo.name}</div>
                <div><strong>Tamanho:</strong> {formatarTamanhoArquivo(arquivo.size)}</div>
                <div><strong>Tipo:</strong> {arquivo.type || 'text/plain'}</div>
              </div>
            )}

            <div style={{ marginTop: '20px', textAlign: 'center' }}>
              {processando ? (
                <div className="loading">
                  <div className="spinner"></div>
                  Processando arquivo...
                </div>
              ) : (
                <button 
                  onClick={processarArquivo} 
                  disabled={!arquivo}
                  className="btn-primary"
                >
                  🚀 Processar Arquivo
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {etapaAtual === 'resultado' && resultadoProcessamento && (
        <div className="etapa-content">
          <div className="resultado-sucesso">
            <div className="resultado-icon">🎉</div>
            <h3>Importação TXT Concluída com Sucesso!</h3>
            <p>
              {resultadoProcessamento.resumo.mensagensSalvas} mensagens foram importadas 
              e estão disponíveis na aba "Mensagens do Dia".
            </p>
            
            <div className="resultado-stats">
              <div className="stat-item">
                <strong>{resultadoProcessamento.resumo.totalLinhas}</strong>
                <div>Linhas Processadas</div>
              </div>
              <div className="stat-item">
                <strong>{resultadoProcessamento.resumo.registrosEncontrados}</strong>
                <div>Registros Encontrados</div>
              </div>
              <div className="stat-item">
                <strong>{resultadoProcessamento.resumo.registrosValidos}</strong>
                <div>Registros Válidos</div>
              </div>
              <div className="stat-item">
                <strong>{resultadoProcessamento.resumo.mensagensGeradas}</strong>
                <div>Mensagens Geradas</div>
              </div>
              <div className="stat-item">
                <strong>{resultadoProcessamento.resumo.mensagensSalvas}</strong>
                <div>Mensagens Salvas</div>
              </div>
            </div>

            {resultadoProcessamento.resumo.registrosInvalidos > 0 && (
              <div className="error-message">
                ⚠️ {resultadoProcessamento.resumo.registrosInvalidos} registros foram ignorados devido a erros de validação.
              </div>
            )}

            <div style={{ marginTop: '30px' }}>
              <button onClick={irParaMensagens} className="btn-primary">
                📋 Ver Mensagens Importadas
              </button>
              <button onClick={reiniciar} className="btn-secondary">
                🔄 Nova Importação
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ImportacaoTXTComponent;

