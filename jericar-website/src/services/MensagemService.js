// Serviço para geração e formatação de mensagens
export const MensagemService = {
  // Gerar mensagem formatada para WhatsApp
  gerarMensagem: (clienteData, servicos) => {
    const formatarData = (data) => {
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
      
      // Se é um objeto Date, formata
      if (data instanceof Date) {
        return data.toLocaleDateString('pt-BR');
      }
      
      return data; // Retorna como está se não conseguir formatar
    };

    const servicosTexto = servicos.map(servico => {
      let texto = `
🚐 *${servico.tipo.toUpperCase()}*
• Embarque: ${servico.horarioEmbarque} - ${servico.localEmbarque}
• Término: ${servico.horarioTermino} - ${servico.localDesembarque}
• Operação: ${servico.operacao}`;

      if (servico.operacao === 'compartilhado' && servico.prazoEspera) {
        texto += `\n• Prazo de espera: ${servico.prazoEspera}`;
      }

      texto += `\n• Emergência: ${servico.contatoEmergencia}`;
      
      return texto;
    }).join('\n');

    const mensagem = `
🌟 *JERICAR VIAGENS* 🌟

Olá, ${clienteData.nome}! 

Preciso que confirme URGENTEMENTE os dados dos seus serviços:

📋 *DADOS DA RESERVA:*
• Reserva: ${clienteData.numeroReserva}
• Data: ${formatarData(clienteData.dataServicos)}
• Passageiros: ${clienteData.quantidadePessoas}
${servicosTexto}

Por favor, responda:
✅ *SIM* - se as informações estão corretas
❌ *NÃO* - se precisa de alterações

Aguardo sua confirmação! 🙏
    `.trim();

    return mensagem;
  },

  // Gerar preview da mensagem (versão resumida)
  gerarPreview: (clienteData, servicos) => {
    if (!clienteData.nome || servicos.length === 0) {
      return 'Preencha os dados para ver o preview';
    }

    const servicosResumo = servicos.map(s => s.tipo || 'Serviço').join(', ');
    return `${clienteData.nome} - ${servicosResumo} - ${servicos.length} serviço(s)`;
  },

  // Validar se mensagem pode ser gerada
  podeGerarMensagem: (clienteData, servicos) => {
    const temDadosCliente = clienteData.nome && clienteData.numeroReserva && 
                           clienteData.dataServicos && clienteData.quantidadePessoas;
    
    const temServicos = servicos.length > 0;
    
    const servicosValidos = servicos.every(servico => 
      servico.tipo && servico.horarioEmbarque && servico.horarioTermino &&
      servico.localEmbarque && servico.localDesembarque && servico.contatoEmergencia
    );

    return temDadosCliente && temServicos && servicosValidos;
  },

  // Obter estatísticas da mensagem
  obterEstatisticas: (mensagem) => {
    if (!mensagem) return null;

    return {
      caracteres: mensagem.length,
      linhas: mensagem.split('\n').length,
      palavras: mensagem.split(/\s+/).filter(p => p.length > 0).length,
      estimativaWhatsApp: Math.ceil(mensagem.length / 160) // Estimativa de SMS
    };
  }
};

