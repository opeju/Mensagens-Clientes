// Serviço para gerenciar mensagens salvas
export const MensagensSalvasService = {
  // Chave para localStorage
  STORAGE_KEY: 'jericar_mensagens_salvas',

  // Salvar nova mensagem
  salvarMensagem: (dadosCliente, servicos, mensagemGerada) => {
    const mensagem = {
      id: Date.now().toString(),
      cliente: {
        nome: dadosCliente.nome,
        reserva: dadosCliente.reserva,
        dataServicos: dadosCliente.dataServicos,
        quantidadePessoas: dadosCliente.quantidadePessoas
      },
      servicos: servicos.map(servico => ({
        tipo: servico.tipo,
        operacao: servico.operacao,
        horarioEmbarque: servico.horarioEmbarque,
        horarioTermino: servico.horarioTermino,
        localEmbarque: servico.localEmbarque,
        localDesembarque: servico.localDesembarque,
        contatoEmergencia: servico.contatoEmergencia,
        prazoEspera: servico.prazoEspera
      })),
      mensagem: mensagemGerada,
      status: 'pendente', // pendente, enviada, confirmada
      dataCriacao: new Date().toISOString(),
      dataEnvio: null,
      dataConfirmacao: null,
      observacoes: ''
    };

    const mensagens = MensagensSalvasService.obterMensagens();
    mensagens.unshift(mensagem); // Adicionar no início
    
    // Manter apenas as últimas 100 mensagens
    if (mensagens.length > 100) {
      mensagens.splice(100);
    }

    localStorage.setItem(MensagensSalvasService.STORAGE_KEY, JSON.stringify(mensagens));
    return mensagem;
  },

  // Obter todas as mensagens
  obterMensagens: () => {
    try {
      const dados = localStorage.getItem(MensagensSalvasService.STORAGE_KEY);
      return dados ? JSON.parse(dados) : [];
    } catch (error) {
      console.error('Erro ao carregar mensagens:', error);
      return [];
    }
  },

  // Obter mensagem por ID
  obterMensagemPorId: (id) => {
    const mensagens = MensagensSalvasService.obterMensagens();
    return mensagens.find(msg => msg.id === id);
  },

  // Atualizar status da mensagem
  atualizarStatus: (id, novoStatus) => {
    const mensagens = MensagensSalvasService.obterMensagens();
    const mensagem = mensagens.find(msg => msg.id === id);
    
    if (mensagem) {
      mensagem.status = novoStatus;
      
      if (novoStatus === 'enviada' && !mensagem.dataEnvio) {
        mensagem.dataEnvio = new Date().toISOString();
      }
      
      if (novoStatus === 'confirmada' && !mensagem.dataConfirmacao) {
        mensagem.dataConfirmacao = new Date().toISOString();
      }

      localStorage.setItem(MensagensSalvasService.STORAGE_KEY, JSON.stringify(mensagens));
      return true;
    }
    return false;
  },

  // Atualizar observações
  atualizarObservacoes: (id, observacoes) => {
    const mensagens = MensagensSalvasService.obterMensagens();
    const mensagem = mensagens.find(msg => msg.id === id);
    
    if (mensagem) {
      mensagem.observacoes = observacoes;
      localStorage.setItem(MensagensSalvasService.STORAGE_KEY, JSON.stringify(mensagens));
      return true;
    }
    return false;
  },

  // Excluir mensagem
  excluirMensagem: (id) => {
    const mensagens = MensagensSalvasService.obterMensagens();
    const novasMensagens = mensagens.filter(msg => msg.id !== id);
    localStorage.setItem(MensagensSalvasService.STORAGE_KEY, JSON.stringify(novasMensagens));
    return true;
  },

  // Filtrar mensagens
  filtrarMensagens: (filtros) => {
    let mensagens = MensagensSalvasService.obterMensagens();

    // Filtro por data
    if (filtros.data) {
      mensagens = mensagens.filter(msg => 
        msg.cliente.dataServicos === filtros.data
      );
    }

    // Filtro por status
    if (filtros.status && filtros.status !== 'todos') {
      mensagens = mensagens.filter(msg => 
        msg.status === filtros.status
      );
    }

    // Filtro por busca (nome do cliente ou número da reserva)
    if (filtros.busca && filtros.busca.trim()) {
      const termoBusca = filtros.busca.toLowerCase().trim();
      mensagens = mensagens.filter(msg => 
        msg.cliente.nome.toLowerCase().includes(termoBusca) ||
        msg.cliente.reserva.toLowerCase().includes(termoBusca)
      );
    }

    return mensagens;
  },

  // Obter estatísticas
  obterEstatisticas: () => {
    const mensagens = MensagensSalvasService.obterMensagens();
    
    const stats = {
      total: mensagens.length,
      pendentes: mensagens.filter(msg => msg.status === 'pendente').length,
      enviadas: mensagens.filter(msg => msg.status === 'enviada').length,
      confirmadas: mensagens.filter(msg => msg.status === 'confirmada').length
    };

    // Mensagens por data
    const hoje = new Date().toISOString().split('T')[0];
    stats.hoje = mensagens.filter(msg => 
      msg.cliente.dataServicos === hoje
    ).length;

    // Mensagens dos últimos 7 dias
    const seteDiasAtras = new Date();
    seteDiasAtras.setDate(seteDiasAtras.getDate() - 7);
    stats.ultimaSemana = mensagens.filter(msg => 
      new Date(msg.dataCriacao) >= seteDiasAtras
    ).length;

    return stats;
  },

  // Exportar mensagens para backup
  exportarMensagens: () => {
    const mensagens = MensagensSalvasService.obterMensagens();
    const dados = {
      mensagens,
      dataExportacao: new Date().toISOString(),
      versao: '1.0'
    };

    return JSON.stringify(dados, null, 2);
  },

  // Importar mensagens de backup
  importarMensagens: (dadosJson, substituir = false) => {
    try {
      const dados = JSON.parse(dadosJson);
      
      if (!dados.mensagens || !Array.isArray(dados.mensagens)) {
        throw new Error('Formato de dados inválido');
      }

      if (substituir) {
        localStorage.setItem(MensagensSalvasService.STORAGE_KEY, 
          JSON.stringify(dados.mensagens));
      } else {
        const mensagensExistentes = MensagensSalvasService.obterMensagens();
        const mensagensImportadas = dados.mensagens;
        
        // Evitar duplicatas baseado no ID
        const idsExistentes = new Set(mensagensExistentes.map(msg => msg.id));
        const novasMensagens = mensagensImportadas.filter(msg => 
          !idsExistentes.has(msg.id)
        );

        const todasMensagens = [...mensagensExistentes, ...novasMensagens];
        localStorage.setItem(MensagensSalvasService.STORAGE_KEY, 
          JSON.stringify(todasMensagens));
      }

      return true;
    } catch (error) {
      console.error('Erro ao importar mensagens:', error);
      return false;
    }
  },

  // Limpar todas as mensagens
  limparTodasMensagens: () => {
    localStorage.removeItem(MensagensSalvasService.STORAGE_KEY);
  },

  // Obter mensagens por período
  obterMensagensPorPeriodo: (dataInicio, dataFim) => {
    const mensagens = MensagensSalvasService.obterMensagens();
    
    return mensagens.filter(msg => {
      const dataServico = new Date(msg.cliente.dataServicos);
      const inicio = new Date(dataInicio);
      const fim = new Date(dataFim);
      
      return dataServico >= inicio && dataServico <= fim;
    });
  }
};

