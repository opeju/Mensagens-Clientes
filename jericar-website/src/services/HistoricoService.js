// Serviço para gerenciar histórico de autocomplete
export const HistoricoService = {
  // Chaves para localStorage
  KEYS: {
    TIPOS_SERVICO: 'jericar_historico_tipos_servico',
    LOCAIS_EMBARQUE: 'jericar_historico_locais_embarque',
    LOCAIS_DESEMBARQUE: 'jericar_historico_locais_desembarque'
  },

  // Salvar item no histórico
  salvarItem: (tipo, valor) => {
    if (!valor || valor.trim().length < 2) return;

    const key = HistoricoService.KEYS[tipo];
    if (!key) return;

    const historico = HistoricoService.obterHistorico(tipo);
    const valorLimpo = valor.trim();
    
    // Verificar se já existe
    const existente = historico.find(item => 
      item.valor.toLowerCase() === valorLimpo.toLowerCase()
    );

    if (existente) {
      // Incrementar frequência e atualizar último uso
      existente.frequencia++;
      existente.ultimoUso = new Date().toISOString();
    } else {
      // Adicionar novo item
      historico.push({
        valor: valorLimpo,
        frequencia: 1,
        ultimoUso: new Date().toISOString(),
        dataCriacao: new Date().toISOString()
      });
    }

    // Manter apenas os 50 itens mais usados
    const historicoOrdenado = historico
      .sort((a, b) => b.frequencia - a.frequencia)
      .slice(0, 50);

    localStorage.setItem(key, JSON.stringify(historicoOrdenado));
  },

  // Obter histórico completo
  obterHistorico: (tipo) => {
    const key = HistoricoService.KEYS[tipo];
    if (!key) return [];

    try {
      const dados = localStorage.getItem(key);
      return dados ? JSON.parse(dados) : [];
    } catch (error) {
      console.error('Erro ao carregar histórico:', error);
      return [];
    }
  },

  // Buscar sugestões baseadas em termo
  buscarSugestoes: (tipo, termo, limite = 5) => {
    if (!termo || termo.length < 1) {
      // Se não há termo, retornar os mais usados
      return HistoricoService.obterHistorico(tipo)
        .sort((a, b) => b.frequencia - a.frequencia)
        .slice(0, limite)
        .map(item => item.valor);
    }

    const historico = HistoricoService.obterHistorico(tipo);
    const termoLower = termo.toLowerCase();

    return historico
      .filter(item => 
        item.valor.toLowerCase().includes(termoLower)
      )
      .sort((a, b) => {
        // Priorizar correspondências exatas no início
        const aExato = a.valor.toLowerCase().startsWith(termoLower);
        const bExato = b.valor.toLowerCase().startsWith(termoLower);
        
        if (aExato && !bExato) return -1;
        if (!aExato && bExato) return 1;
        
        // Depois por frequência
        return b.frequencia - a.frequencia;
      })
      .slice(0, limite)
      .map(item => item.valor);
  },

  // Remover item do histórico
  removerItem: (tipo, valor) => {
    const key = HistoricoService.KEYS[tipo];
    if (!key) return;

    const historico = HistoricoService.obterHistorico(tipo);
    const novoHistorico = historico.filter(item => 
      item.valor.toLowerCase() !== valor.toLowerCase()
    );

    localStorage.setItem(key, JSON.stringify(novoHistorico));
  },

  // Limpar histórico completo
  limparHistorico: (tipo) => {
    const key = HistoricoService.KEYS[tipo];
    if (!key) return;

    localStorage.removeItem(key);
  },

  // Obter estatísticas do histórico
  obterEstatisticas: (tipo) => {
    const historico = HistoricoService.obterHistorico(tipo);
    
    if (historico.length === 0) {
      return {
        total: 0,
        maisUsado: null,
        totalUsos: 0
      };
    }

    const maisUsado = historico.reduce((prev, current) => 
      prev.frequencia > current.frequencia ? prev : current
    );

    const totalUsos = historico.reduce((sum, item) => sum + item.frequencia, 0);

    return {
      total: historico.length,
      maisUsado: maisUsado.valor,
      totalUsos
    };
  },

  // Exportar histórico para backup
  exportarHistorico: () => {
    const dados = {
      tiposServico: HistoricoService.obterHistorico('TIPOS_SERVICO'),
      locaisEmbarque: HistoricoService.obterHistorico('LOCAIS_EMBARQUE'),
      locaisDesembarque: HistoricoService.obterHistorico('LOCAIS_DESEMBARQUE'),
      dataExportacao: new Date().toISOString()
    };

    return JSON.stringify(dados, null, 2);
  },

  // Importar histórico de backup
  importarHistorico: (dadosJson) => {
    try {
      const dados = JSON.parse(dadosJson);
      
      if (dados.tiposServico) {
        localStorage.setItem(HistoricoService.KEYS.TIPOS_SERVICO, 
          JSON.stringify(dados.tiposServico));
      }
      
      if (dados.locaisEmbarque) {
        localStorage.setItem(HistoricoService.KEYS.LOCAIS_EMBARQUE, 
          JSON.stringify(dados.locaisEmbarque));
      }
      
      if (dados.locaisDesembarque) {
        localStorage.setItem(HistoricoService.KEYS.LOCAIS_DESEMBARQUE, 
          JSON.stringify(dados.locaisDesembarque));
      }

      return true;
    } catch (error) {
      console.error('Erro ao importar histórico:', error);
      return false;
    }
  }
};

