// Serviço de validações para o sistema
export const ValidationService = {
  // Validar dados do cliente
  validarCliente: (cliente) => {
    const erros = [];
    
    if (!cliente.nome || cliente.nome.trim().length < 2) {
      erros.push('Nome deve ter pelo menos 2 caracteres');
    }
    
    if (!cliente.numeroReserva || cliente.numeroReserva.trim().length < 3) {
      erros.push('Número da reserva deve ter pelo menos 3 caracteres');
    }
    
    if (!cliente.dataServicos) {
      erros.push('Data dos serviços é obrigatória');
    } else {
      // Converter data do formato DD/MM/YYYY para Date
      let dataServicos;
      
      if (cliente.dataServicos.includes('/')) {
        // Formato DD/MM/YYYY
        const [dia, mes, ano] = cliente.dataServicos.split('/');
        dataServicos = new Date(ano, mes - 1, dia);
      } else if (cliente.dataServicos.includes('-')) {
        // Formato YYYY-MM-DD
        dataServicos = new Date(cliente.dataServicos);
      } else {
        erros.push('Formato de data inválido. Use DD/MM/YYYY');
        return erros;
      }
      
      const hoje = new Date();
      hoje.setHours(0, 0, 0, 0);
      dataServicos.setHours(0, 0, 0, 0);
      
      // Permitir datas de hoje em diante
      if (dataServicos < hoje) {
        erros.push('Data dos serviços não pode ser no passado');
      }
    }
    
    if (!cliente.quantidadePessoas || cliente.quantidadePessoas < 1) {
      erros.push('Quantidade de pessoas deve ser pelo menos 1');
    }
    
    return erros;
  },

  // Validar serviço
  validarServico: (servico) => {
    const erros = [];
    
    if (!servico.tipo || servico.tipo.trim().length < 3) {
      erros.push('Tipo de serviço deve ter pelo menos 3 caracteres');
    }
    
    if (!servico.horarioEmbarque || servico.horarioEmbarque.trim() === '') {
      erros.push('Horário de embarque é obrigatório');
    } else if (!ValidationService.validarHorario(servico.horarioEmbarque)) {
      erros.push('Horário de embarque deve estar no formato HH:MM válido');
    }
    
    if (!servico.horarioTermino || servico.horarioTermino.trim() === '') {
      erros.push('Horário de término é obrigatório');
    } else if (!ValidationService.validarHorario(servico.horarioTermino)) {
      erros.push('Horário de término deve estar no formato HH:MM válido');
    }
    
    if (servico.horarioEmbarque && servico.horarioTermino && 
        ValidationService.validarHorario(servico.horarioEmbarque) && 
        ValidationService.validarHorario(servico.horarioTermino)) {
      if (servico.horarioEmbarque >= servico.horarioTermino) {
        erros.push('Horário de término deve ser posterior ao embarque');
      }
    }
    
    if (!servico.localEmbarque || servico.localEmbarque.trim().length < 3) {
      erros.push('Local de embarque deve ter pelo menos 3 caracteres');
    }
    
    if (!servico.localDesembarque || servico.localDesembarque.trim().length < 3) {
      erros.push('Local de desembarque deve ter pelo menos 3 caracteres');
    }
    
    if (!servico.contatoEmergencia || servico.contatoEmergencia.trim() === '') {
      erros.push('Contato de emergência é obrigatório');
    }
    
    if (servico.operacao === 'compartilhado' && (!servico.prazoEspera || servico.prazoEspera.trim() === '')) {
      erros.push('Prazo de espera é obrigatório para serviços compartilhados');
    }
    
    return erros;
  },

  // Formatar número de telefone
  formatarTelefone: (telefone) => {
    const numeros = telefone.replace(/\D/g, '');
    
    if (numeros.length === 11) {
      return `+55 ${numeros.substring(0, 2)} ${numeros.substring(2, 7)}-${numeros.substring(7)}`;
    } else if (numeros.length === 13 && numeros.startsWith('55')) {
      return `+${numeros.substring(0, 2)} ${numeros.substring(2, 4)} ${numeros.substring(4, 9)}-${numeros.substring(9)}`;
    }
    
    return telefone;
  },

  // Validar formato de telefone
  validarTelefone: (telefone) => {
    if (!telefone) return false;
    
    // Remover todos os caracteres não numéricos
    const numeros = telefone.replace(/\D/g, '');
    
    // Aceitar diferentes formatos mais flexíveis:
    // 10 dígitos (telefone fixo): 8533334444
    // 11 dígitos (celular): 85999998888
    // 12 dígitos com código do país (fixo): 558533334444
    // 13 dígitos com código do país (celular): 5585999998888
    // 14 dígitos com código internacional: 555585999998888
    
    if (numeros.length >= 10 && numeros.length <= 15) {
      // Se tem 12+ dígitos e começa com 55, é válido (Brasil)
      if (numeros.length >= 12 && numeros.startsWith('55')) {
        return true;
      }
      // Se tem 10-11 dígitos, é válido (número nacional)
      if (numeros.length >= 10 && numeros.length <= 11) {
        return true;
      }
      // Aceitar outros formatos internacionais
      if (numeros.length >= 12) {
        return true;
      }
    }
    
    return false;
  },

  // Validar formato de data (YYYY-MM-DD)
  validarData: (data) => {
    if (!data) return false;
    
    // Verificar formato YYYY-MM-DD
    const regexData = /^\d{4}-\d{2}-\d{2}$/;
    if (!regexData.test(data)) return false;
    
    // Verificar se é uma data válida usando uma abordagem que não seja afetada pelo fuso horário
    const [ano, mes, dia] = data.split('-').map(Number);
    
    // Verificar se os valores estão em ranges válidos
    if (ano < 1900 || ano > 2100) return false;
    if (mes < 1 || mes > 12) return false;
    if (dia < 1 || dia > 31) return false;
    
    // Verificar se o dia é válido para o mês/ano específico
    // Criar data usando UTC para evitar problemas de fuso horário
    const dataObj = new Date(Date.UTC(ano, mes - 1, dia));
    
    return dataObj.getUTCFullYear() === ano &&
           dataObj.getUTCMonth() === mes - 1 &&
           dataObj.getUTCDate() === dia;
  },

  // Validar formato de horário (HH:MM)
  validarHorario: (horario) => {
    if (!horario) return false;
    
    // Verificar formato HH:MM
    const regexHorario = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
    if (!regexHorario.test(horario)) return false;
    
    const [horas, minutos] = horario.split(':').map(Number);
    return horas >= 0 && horas <= 23 && minutos >= 0 && minutos <= 59;
  }
};

