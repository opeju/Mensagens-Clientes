// Serviço de exportação de mensagens
const ExportacaoService = {

  // Exportar mensagens de uma data específica para TXT
  exportarMensagensDia: function(data, mensagens) {
    try {
      console.log('📤 Exportando mensagens do dia:', data);
      
      // Filtrar mensagens da data específica
      const mensagensDoDia = mensagens.filter(msg => {
        return msg.cliente && msg.cliente.dataServicos === data;
      });

      if (mensagensDoDia.length === 0) {
        throw new Error(`Nenhuma mensagem encontrada para a data ${data}`);
      }

      // Gerar conteúdo do arquivo
      const conteudo = this.gerarConteudoTXT(data, mensagensDoDia);
      
      // Criar e baixar arquivo
      const dataFormatada = this.formatarDataParaNome(data);
      const nomeArquivo = `mensagens_jericar_${dataFormatada}.txt`;
      
      this.baixarArquivo(conteudo, nomeArquivo);

      return {
        sucesso: true,
        totalMensagens: mensagensDoDia.length,
        nomeArquivo: nomeArquivo,
        data: data
      };

    } catch (error) {
      console.error('📤 Erro na exportação:', error);
      return {
        sucesso: false,
        erro: error.message
      };
    }
  },

  // Gerar conteúdo do arquivo TXT
  gerarConteudoTXT: function(data, mensagens) {
    const dataFormatada = this.formatarDataParaExibicao(data);
    
    let conteudo = `# MENSAGENS JERICAR VIAGENS - ${dataFormatada}\n`;
    conteudo += `# Exportado em: ${new Date().toLocaleString('pt-BR')}\n`;
    conteudo += `# Total de mensagens: ${mensagens.length}\n\n`;
    conteudo += `${'='.repeat(80)}\n\n`;

    mensagens.forEach((mensagem, index) => {
      conteudo += `MENSAGEM ${index + 1}\n`;
      conteudo += `${'-'.repeat(40)}\n\n`;
      
      // Dados do cliente
      conteudo += `CLIENTE: ${mensagem.cliente.nome}\n`;
      conteudo += `RESERVA: ${mensagem.cliente.reserva}\n`;
      conteudo += `DATA: ${this.formatarDataParaExibicao(mensagem.cliente.dataServicos)}\n`;
      conteudo += `PESSOAS: ${mensagem.cliente.quantidadePessoas}\n\n`;
      
      // Dados dos serviços
      if (mensagem.servicos && mensagem.servicos.length > 0) {
        conteudo += `SERVIÇOS:\n`;
        mensagem.servicos.forEach((servico, servicoIndex) => {
          conteudo += `  ${servicoIndex + 1}. ${servico.tipo}\n`;
          if (servico.operacao) {
            conteudo += `     Modalidade: ${servico.operacao}\n`;
          }
          conteudo += `     Embarque: ${servico.horarioEmbarque} em ${servico.localEmbarque}\n`;
          conteudo += `     Desembarque: ${servico.localDesembarque}\n`;
          if (servico.horarioTermino) {
            conteudo += `     Término: ${servico.horarioTermino}\n`;
          }
          if (servico.observacoes) {
            conteudo += `     Observações: ${servico.observacoes}\n`;
          }
          conteudo += `\n`;
        });
      }
      
      // Status da mensagem
      conteudo += `STATUS: ${this.formatarStatus(mensagem.status)}\n`;
      conteudo += `CRIADA EM: ${new Date(mensagem.dataCriacao).toLocaleString('pt-BR')}\n`;
      
      if (mensagem.dataEnvio) {
        conteudo += `ENVIADA EM: ${new Date(mensagem.dataEnvio).toLocaleString('pt-BR')}\n`;
      }
      
      if (mensagem.dataConfirmacao) {
        conteudo += `CONFIRMADA EM: ${new Date(mensagem.dataConfirmacao).toLocaleString('pt-BR')}\n`;
      }
      
      conteudo += `\n`;
      
      // Mensagem formatada
      conteudo += `MENSAGEM PARA WHATSAPP:\n`;
      conteudo += `${'-'.repeat(30)}\n`;
      conteudo += `${mensagem.mensagem}\n`;
      conteudo += `${'-'.repeat(30)}\n\n`;
      
      if (index < mensagens.length - 1) {
        conteudo += `${'='.repeat(80)}\n\n`;
      }
    });

    conteudo += `\n# FIM DO ARQUIVO\n`;
    conteudo += `# Jericar Viagens - Sistema de Confirmação de Serviços\n`;

    return conteudo;
  },

  // Exportar mensagens de uma data específica para Excel (CSV)
  exportarMensagensDiaCSV: function(data, mensagens) {
    try {
      console.log('📤 Exportando mensagens do dia para CSV:', data);
      
      // Filtrar mensagens da data específica
      const mensagensDoDia = mensagens.filter(msg => {
        return msg.cliente && msg.cliente.dataServicos === data;
      });

      if (mensagensDoDia.length === 0) {
        throw new Error(`Nenhuma mensagem encontrada para a data ${data}`);
      }

      // Gerar conteúdo CSV
      const conteudo = this.gerarConteudoCSV(mensagensDoDia);
      
      // Criar e baixar arquivo
      const dataFormatada = this.formatarDataParaNome(data);
      const nomeArquivo = `mensagens_jericar_${dataFormatada}.csv`;
      
      this.baixarArquivo(conteudo, nomeArquivo, 'text/csv');

      return {
        sucesso: true,
        totalMensagens: mensagensDoDia.length,
        nomeArquivo: nomeArquivo,
        data: data
      };

    } catch (error) {
      console.error('📤 Erro na exportação CSV:', error);
      return {
        sucesso: false,
        erro: error.message
      };
    }
  },

  // Gerar conteúdo CSV
  gerarConteudoCSV: function(mensagens) {
    // Cabeçalho CSV
    let csv = 'Cliente,Reserva,Data,Pessoas,Tipo Serviço,Modalidade,Horário Embarque,Local Embarque,Local Desembarque,Horário Término,Observações,Status,Data Criação,Data Envio,Data Confirmação\n';
    
    mensagens.forEach(mensagem => {
      const cliente = mensagem.cliente || {};
      const servico = (mensagem.servicos && mensagem.servicos[0]) || {};
      
      const linha = [
        this.escaparCSV(cliente.nome || ''),
        this.escaparCSV(cliente.reserva || ''),
        cliente.dataServicos || '',
        cliente.quantidadePessoas || '',
        this.escaparCSV(servico.tipo || ''),
        this.escaparCSV(servico.operacao || ''),
        servico.horarioEmbarque || '',
        this.escaparCSV(servico.localEmbarque || ''),
        this.escaparCSV(servico.localDesembarque || ''),
        servico.horarioTermino || '',
        this.escaparCSV(servico.observacoes || ''),
        this.formatarStatus(mensagem.status),
        mensagem.dataCriacao ? new Date(mensagem.dataCriacao).toLocaleString('pt-BR') : '',
        mensagem.dataEnvio ? new Date(mensagem.dataEnvio).toLocaleString('pt-BR') : '',
        mensagem.dataConfirmacao ? new Date(mensagem.dataConfirmacao).toLocaleString('pt-BR') : ''
      ];
      
      csv += linha.join(',') + '\n';
    });
    
    return csv;
  },

  // Escapar valores para CSV
  escaparCSV: function(valor) {
    if (!valor) return '';
    const valorStr = valor.toString();
    if (valorStr.includes(',') || valorStr.includes('"') || valorStr.includes('\n')) {
      return '"' + valorStr.replace(/"/g, '""') + '"';
    }
    return valorStr;
  },

  // Formatar status para exibição
  formatarStatus: function(status) {
    const statusMap = {
      'pendente': 'Pendente',
      'enviada': 'Enviada',
      'confirmada': 'Confirmada'
    };
    return statusMap[status] || status;
  },

  // Formatar data para nome de arquivo
  formatarDataParaNome: function(data) {
    return data.replace(/-/g, '_');
  },

  // Formatar data para exibição
  formatarDataParaExibicao: function(data) {
    try {
      if (!data) return '';
      
      // Se já está no formato DD/MM/YYYY, retorna como está
      if (data.includes('/')) {
        return data;
      }
      
      // Se está no formato YYYY-MM-DD, converte para DD/MM/YYYY
      if (data.includes('-')) {
        const [ano, mes, dia] = data.split('-');
        return `${dia}/${mes}/${ano}`;
      }
      
      return data;
    } catch (error) {
      return data;
    }
  },

  // Baixar arquivo
  baixarArquivo: function(conteudo, nomeArquivo, tipoMime = 'text/plain') {
    const blob = new Blob([conteudo], { type: `${tipoMime};charset=utf-8` });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = nomeArquivo;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  },

  // Obter estatísticas de mensagens por data
  obterEstatisticasPorData: function(mensagens) {
    const estatisticas = {};
    
    mensagens.forEach(mensagem => {
      const data = mensagem.cliente?.dataServicos;
      if (data) {
        if (!estatisticas[data]) {
          estatisticas[data] = {
            total: 0,
            pendentes: 0,
            enviadas: 0,
            confirmadas: 0
          };
        }
        
        estatisticas[data].total++;
        estatisticas[data][mensagem.status]++;
      }
    });
    
    return estatisticas;
  }
};

export default ExportacaoService;

