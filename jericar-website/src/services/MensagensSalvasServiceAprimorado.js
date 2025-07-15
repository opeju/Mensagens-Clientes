// Serviço aprimorado para gerenciar mensagens salvas com filtros avançados
export const MensagensSalvasServiceAprimorado = {
  // Chave para localStorage
  STORAGE_KEY: 'jericar_mensagens_salvas',

  // Filtrar mensagens com filtros avançados
  filtrarMensagensAvancado: (filtros) => {
    let mensagens = MensagensSalvasServiceAprimorado.obterMensagens();

    // Filtro por data específica
    if (filtros.data) {
      mensagens = mensagens.filter(msg => {
        // Normalizar as datas para comparação
        let dataServico = msg.cliente.dataServicos;
        let dataFiltro = filtros.data;
        
        // Converter DD/MM/YYYY para YYYY-MM-DD se necessário
        if (dataServico && dataServico.includes('/')) {
          const [dia, mes, ano] = dataServico.split('/');
          dataServico = `${ano}-${mes.padStart(2, '0')}-${dia.padStart(2, '0')}`;
        }
        
        // Converter YYYY-MM-DD para DD/MM/YYYY se necessário para comparação
        if (dataFiltro && dataFiltro.includes('-')) {
          const [ano, mes, dia] = dataFiltro.split('-');
          const dataFiltroFormatada = `${dia}/${mes}/${ano}`;
          
          // Comparar ambos os formatos
          return dataServico === dataFiltro || 
                 msg.cliente.dataServicos === dataFiltroFormatada ||
                 dataServico === dataFiltroFormatada;
        }
        
        return dataServico === dataFiltro || msg.cliente.dataServicos === dataFiltro;
      });
    }

    // Filtro por período (data início e fim)
    if (filtros.dataInicio && filtros.dataFim) {
      mensagens = mensagens.filter(msg => {
        const dataServico = new Date(msg.cliente.dataServicos);
        const inicio = new Date(filtros.dataInicio);
        const fim = new Date(filtros.dataFim);
        return dataServico >= inicio && dataServico <= fim;
      });
    } else if (filtros.dataInicio) {
      mensagens = mensagens.filter(msg => {
        const dataServico = new Date(msg.cliente.dataServicos);
        const inicio = new Date(filtros.dataInicio);
        return dataServico >= inicio;
      });
    } else if (filtros.dataFim) {
      mensagens = mensagens.filter(msg => {
        const dataServico = new Date(msg.cliente.dataServicos);
        const fim = new Date(filtros.dataFim);
        return dataServico <= fim;
      });
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

    // Filtro por quantidade de pessoas
    if (filtros.quantidadePessoas && filtros.quantidadePessoas !== 'todas') {
      mensagens = mensagens.filter(msg => {
        const qtd = parseInt(msg.cliente.quantidadePessoas);
        switch (filtros.quantidadePessoas) {
          case '1': return qtd === 1;
          case '2': return qtd === 2;
          case '3-5': return qtd >= 3 && qtd <= 5;
          case '6+': return qtd >= 6;
          default: return true;
        }
      });
    }

    // Filtro por tipo de serviço
    if (filtros.tipoServico && filtros.tipoServico.trim()) {
      const tipoFiltro = filtros.tipoServico.toLowerCase().trim();
      mensagens = mensagens.filter(msg => 
        msg.servicos.some(servico => 
          servico.tipo.toLowerCase().includes(tipoFiltro)
        )
      );
    }

    // Filtro por local de embarque
    if (filtros.localEmbarque && filtros.localEmbarque.trim()) {
      const localFiltro = filtros.localEmbarque.toLowerCase().trim();
      mensagens = mensagens.filter(msg => 
        msg.servicos.some(servico => 
          servico.localEmbarque.toLowerCase().includes(localFiltro)
        )
      );
    }

    // Filtro por local de desembarque
    if (filtros.localDesembarque && filtros.localDesembarque.trim()) {
      const localFiltro = filtros.localDesembarque.toLowerCase().trim();
      mensagens = mensagens.filter(msg => 
        msg.servicos.some(servico => 
          servico.localDesembarque.toLowerCase().includes(localFiltro)
        )
      );
    }

    // Ordenação
    const ordenarPor = filtros.ordenarPor || 'dataCriacao';
    const ordem = filtros.ordem || 'desc';

    mensagens.sort((a, b) => {
      let valorA, valorB;

      switch (ordenarPor) {
        case 'dataCriacao':
          valorA = new Date(a.dataCriacao);
          valorB = new Date(b.dataCriacao);
          break;
        case 'dataServicos':
          valorA = new Date(a.cliente.dataServicos);
          valorB = new Date(b.cliente.dataServicos);
          break;
        case 'nomeCliente':
          valorA = a.cliente.nome.toLowerCase();
          valorB = b.cliente.nome.toLowerCase();
          break;
        case 'status':
          const statusOrder = { 'pendente': 1, 'enviada': 2, 'confirmada': 3 };
          valorA = statusOrder[a.status] || 0;
          valorB = statusOrder[b.status] || 0;
          break;
        case 'reserva':
          valorA = a.cliente.reserva.toLowerCase();
          valorB = b.cliente.reserva.toLowerCase();
          break;
        default:
          valorA = new Date(a.dataCriacao);
          valorB = new Date(b.dataCriacao);
      }

      if (valorA < valorB) return ordem === 'asc' ? -1 : 1;
      if (valorA > valorB) return ordem === 'asc' ? 1 : -1;
      return 0;
    });

    return mensagens;
  },

  // Obter todas as mensagens
  obterMensagens: () => {
    try {
      const dados = localStorage.getItem(MensagensSalvasServiceAprimorado.STORAGE_KEY);
      return dados ? JSON.parse(dados) : [];
    } catch (error) {
      console.error('Erro ao carregar mensagens:', error);
      return [];
    }
  },

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
      status: 'pendente',
      dataCriacao: new Date().toISOString(),
      dataEnvio: null,
      dataConfirmacao: null,
      observacoes: ''
    };

    const mensagens = MensagensSalvasServiceAprimorado.obterMensagens();
    mensagens.unshift(mensagem);
    
    if (mensagens.length > 100) {
      mensagens.splice(100);
    }

    localStorage.setItem(MensagensSalvasServiceAprimorado.STORAGE_KEY, JSON.stringify(mensagens));
    return mensagem;
  },

  // Atualizar status da mensagem
  atualizarStatus: (id, novoStatus) => {
    const mensagens = MensagensSalvasServiceAprimorado.obterMensagens();
    const mensagem = mensagens.find(msg => msg.id === id);
    
    if (mensagem) {
      mensagem.status = novoStatus;
      
      if (novoStatus === 'enviada' && !mensagem.dataEnvio) {
        mensagem.dataEnvio = new Date().toISOString();
      }
      
      if (novoStatus === 'confirmada' && !mensagem.dataConfirmacao) {
        mensagem.dataConfirmacao = new Date().toISOString();
      }

      localStorage.setItem(MensagensSalvasServiceAprimorado.STORAGE_KEY, JSON.stringify(mensagens));
      return true;
    }
    return false;
  },

  // Atualizar observações
  atualizarObservacoes: (id, observacoes) => {
    const mensagens = MensagensSalvasServiceAprimorado.obterMensagens();
    const mensagem = mensagens.find(msg => msg.id === id);
    
    if (mensagem) {
      mensagem.observacoes = observacoes;
      localStorage.setItem(MensagensSalvasServiceAprimorado.STORAGE_KEY, JSON.stringify(mensagens));
      return true;
    }
    return false;
  },

  // Excluir mensagem
  excluirMensagem: (id) => {
    const mensagens = MensagensSalvasServiceAprimorado.obterMensagens();
    const novasMensagens = mensagens.filter(msg => msg.id !== id);
    localStorage.setItem(MensagensSalvasServiceAprimorado.STORAGE_KEY, JSON.stringify(novasMensagens));
    return true;
  },

  // Obter estatísticas avançadas
  obterEstatisticasAvancadas: () => {
    const mensagens = MensagensSalvasServiceAprimorado.obterMensagens();
    
    const stats = {
      total: mensagens.length,
      pendentes: mensagens.filter(msg => msg.status === 'pendente').length,
      enviadas: mensagens.filter(msg => msg.status === 'enviada').length,
      confirmadas: mensagens.filter(msg => msg.status === 'confirmada').length
    };

    // Estatísticas por período
    const hoje = new Date().toISOString().split('T')[0];
    const ontem = new Date();
    ontem.setDate(ontem.getDate() - 1);
    const ontemStr = ontem.toISOString().split('T')[0];

    stats.hoje = mensagens.filter(msg => msg.cliente.dataServicos === hoje).length;
    stats.ontem = mensagens.filter(msg => msg.cliente.dataServicos === ontemStr).length;

    // Próximos 7 dias
    const seteDiasFrente = new Date();
    seteDiasFrente.setDate(seteDiasFrente.getDate() + 7);
    stats.proximosSete = mensagens.filter(msg => {
      const dataServico = new Date(msg.cliente.dataServicos);
      const agora = new Date();
      return dataServico >= agora && dataServico <= seteDiasFrente;
    }).length;

    // Estatísticas por tipo de serviço
    const tiposServico = {};
    mensagens.forEach(msg => {
      msg.servicos.forEach(servico => {
        const tipo = servico.tipo;
        tiposServico[tipo] = (tiposServico[tipo] || 0) + 1;
      });
    });
    stats.tiposServico = tiposServico;

    // Estatísticas por local
    const locaisEmbarque = {};
    mensagens.forEach(msg => {
      msg.servicos.forEach(servico => {
        const local = servico.localEmbarque;
        locaisEmbarque[local] = (locaisEmbarque[local] || 0) + 1;
      });
    });
    stats.locaisEmbarque = locaisEmbarque;

    // Taxa de confirmação
    const totalEnviadas = stats.enviadas + stats.confirmadas;
    stats.taxaConfirmacao = totalEnviadas > 0 ? (stats.confirmadas / totalEnviadas * 100).toFixed(1) : 0;

    return stats;
  },

  // Exportar mensagens filtradas
  exportarMensagensFiltradas: (filtros) => {
    const mensagensFiltradas = MensagensSalvasServiceAprimorado.filtrarMensagensAvancado(filtros);
    const dados = {
      mensagens: mensagensFiltradas,
      filtros,
      dataExportacao: new Date().toISOString(),
      total: mensagensFiltradas.length,
      versao: '1.1'
    };

    return JSON.stringify(dados, null, 2);
  },

  // Gerar relatório
  gerarRelatorio: (filtros) => {
    const mensagens = MensagensSalvasServiceAprimorado.filtrarMensagensAvancado(filtros);
    const stats = MensagensSalvasServiceAprimorado.obterEstatisticasAvancadas();

    const relatorio = {
      periodo: {
        inicio: filtros.dataInicio || 'Não especificado',
        fim: filtros.dataFim || 'Não especificado'
      },
      resumo: {
        totalMensagens: mensagens.length,
        pendentes: mensagens.filter(msg => msg.status === 'pendente').length,
        enviadas: mensagens.filter(msg => msg.status === 'enviada').length,
        confirmadas: mensagens.filter(msg => msg.status === 'confirmada').length
      },
      detalhes: mensagens.map(msg => ({
        cliente: msg.cliente.nome,
        reserva: msg.cliente.reserva,
        dataServicos: msg.cliente.dataServicos,
        quantidadeServicos: msg.servicos.length,
        status: msg.status,
        dataCriacao: msg.dataCriacao,
        dataEnvio: msg.dataEnvio,
        dataConfirmacao: msg.dataConfirmacao
      })),
      geradoEm: new Date().toISOString()
    };

    return relatorio;
  }
};


export default MensagensSalvasServiceAprimorado;

