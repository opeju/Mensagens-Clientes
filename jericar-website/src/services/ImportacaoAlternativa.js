// Serviço alternativo de importação mais robusto
const ImportacaoAlternativa = {
  
  // Função para forçar salvamento direto das mensagens
  salvarMensagemDireta: function(dadosCliente, dadosServico, mensagemTexto) {
    try {
      console.log('🔧 SALVAMENTO DIRETO - Iniciando...');
      
      // Criar mensagem com estrutura exata
      const mensagem = {
        id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
        cliente: {
          nome: dadosCliente.nome || '',
          reserva: dadosCliente.reserva || '',
          dataServicos: dadosCliente.dataServicos || '',
          quantidadePessoas: dadosCliente.quantidadePessoas || ''
        },
        servicos: [{
          tipo: dadosServico.tipo || '',
          operacao: dadosServico.operacao || '',
          horarioEmbarque: dadosServico.horarioEmbarque || '',
          horarioTermino: dadosServico.horarioTermino || '',
          localEmbarque: dadosServico.localEmbarque || '',
          localDesembarque: dadosServico.localDesembarque || '',
          observacoes: dadosServico.observacoes || ''
        }],
        mensagem: mensagemTexto || '',
        status: 'pendente',
        dataCriacao: new Date().toISOString(),
        dataEnvio: null,
        dataConfirmacao: null,
        observacoes: ''
      };

      console.log('🔧 Mensagem criada:', mensagem);

      // Recuperar mensagens existentes
      let mensagensExistentes = [];
      try {
        const mensagensSalvas = localStorage.getItem('mensagensSalvas');
        if (mensagensSalvas) {
          mensagensExistentes = JSON.parse(mensagensSalvas);
        }
      } catch (e) {
        console.log('🔧 Erro ao recuperar mensagens existentes, criando array novo');
        mensagensExistentes = [];
      }

      console.log('🔧 Mensagens existentes:', mensagensExistentes.length);

      // Adicionar nova mensagem
      mensagensExistentes.push(mensagem);

      // Salvar no localStorage
      localStorage.setItem('mensagensSalvas', JSON.stringify(mensagensExistentes));

      console.log('🔧 Mensagem salva! Total de mensagens:', mensagensExistentes.length);

      // Verificar se foi salvo corretamente
      const verificacao = localStorage.getItem('mensagensSalvas');
      const verificacaoParsed = JSON.parse(verificacao);
      console.log('🔧 Verificação - Total após salvamento:', verificacaoParsed.length);

      return {
        sucesso: true,
        mensagem: mensagem,
        totalMensagens: verificacaoParsed.length
      };

    } catch (error) {
      console.error('🔧 Erro no salvamento direto:', error);
      return {
        sucesso: false,
        erro: error.message
      };
    }
  },

  // Função para processar dados do Excel e salvar diretamente
  processarESalvarDados: function(dadosExcel) {
    console.log('🔧 PROCESSAMENTO ALTERNATIVO - Iniciando...');
    console.log('🔧 Dados recebidos:', dadosExcel);

    const resultados = {
      sucessos: [],
      erros: [],
      totalProcessados: 0
    };

    dadosExcel.forEach((linha, index) => {
      try {
        console.log(`🔧 Processando linha ${index + 1}:`, linha);

        // Mapear dados do cliente
        const dadosCliente = {
          nome: linha['Nome do Cliente'] || linha.nome || '',
          reserva: linha['Número da Reserva'] || linha.reserva || '',
          dataServicos: linha['Data dos Serviços'] || linha.data || '',
          quantidadePessoas: linha['Quantidade de Pessoas'] || linha.pessoas || ''
        };

        // Mapear dados do serviço
        const dadosServico = {
          tipo: linha['Tipo de Serviço'] || linha.tipoServico || '',
          operacao: linha['Operação'] || linha.operacao || '',
          horarioEmbarque: linha['Horário Embarque'] || linha.horarioEmbarque || '',
          horarioTermino: linha['Horário Término'] || linha.horarioTermino || '',
          localEmbarque: linha['Local Embarque'] || linha.localEmbarque || '',
          localDesembarque: linha['Local Desembarque'] || linha.localDesembarque || '',
          observacoes: linha['Observações'] || linha.observacoes || ''
        };

        // Gerar mensagem simples
        const mensagemTexto = `Olá ${dadosCliente.nome}! Sua reserva ${dadosCliente.reserva} está confirmada para ${dadosCliente.dataServicos}. Detalhes: ${dadosServico.tipo} - ${dadosServico.operacao}. Embarque: ${dadosServico.horarioEmbarque} em ${dadosServico.localEmbarque}.`;

        // Salvar diretamente
        const resultado = this.salvarMensagemDireta(dadosCliente, dadosServico, mensagemTexto);

        if (resultado.sucesso) {
          resultados.sucessos.push({
            linha: index + 1,
            cliente: dadosCliente.nome,
            reserva: dadosCliente.reserva,
            mensagem: resultado.mensagem
          });
        } else {
          resultados.erros.push({
            linha: index + 1,
            erro: resultado.erro
          });
        }

        resultados.totalProcessados++;

      } catch (error) {
        console.error(`🔧 Erro na linha ${index + 1}:`, error);
        resultados.erros.push({
          linha: index + 1,
          erro: error.message
        });
        resultados.totalProcessados++;
      }
    });

    console.log('🔧 Processamento concluído:', resultados);
    return resultados;
  },

  // Função para verificar mensagens salvas
  verificarMensagensSalvas: function() {
    try {
      const mensagens = localStorage.getItem('mensagensSalvas');
      if (!mensagens) {
        return { total: 0, mensagens: [] };
      }

      const mensagensParsed = JSON.parse(mensagens);
      return {
        total: mensagensParsed.length,
        mensagens: mensagensParsed
      };
    } catch (error) {
      console.error('Erro ao verificar mensagens:', error);
      return { total: 0, mensagens: [], erro: error.message };
    }
  },

  // Função para limpar todas as mensagens
  limparTodasMensagens: function() {
    localStorage.removeItem('mensagensSalvas');
    return { sucesso: true, mensagem: 'Todas as mensagens foram removidas' };
  }
};

export default ImportacaoAlternativa;

