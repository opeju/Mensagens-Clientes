// Serviço para gerenciar contatos de emergência personalizados
export const ContatosService = {
  // Chave para armazenamento local
  STORAGE_KEY: 'jericar_contatos_emergencia',

  // Contatos padrão do sistema
  CONTATOS_PADRAO: [
    {
      id: 'default_1',
      nome: 'Central Jericar',
      telefone: '+55 88 98183-2294',
      tiposServico: ['todos'],
      horarioFuncionamento: '24h',
      ativo: true,
      padrao: true
    },
    {
      id: 'default_2', 
      nome: 'Plantão Noturno',
      telefone: '+55 88 99999-1111',
      tiposServico: ['transfer', 'city tour'],
      horarioFuncionamento: '18:00-06:00',
      ativo: true,
      padrao: true
    },
    {
      id: 'default_3',
      nome: 'Emergência Fins de Semana',
      telefone: '+55 88 99999-2222', 
      tiposServico: ['todos'],
      horarioFuncionamento: 'Sáb-Dom',
      ativo: true,
      padrao: true
    }
  ],

  // Tipos de serviço disponíveis
  TIPOS_SERVICO: [
    'Transfer',
    'Aéreo',
    'Hospedagem',
    'Passeio',
    'Outros',
    'Todos'
  ],

  // Obter todos os contatos (padrão + personalizados, excluindo os removidos)
  obterTodosContatos: function() {
    const contatosPersonalizados = this.obterContatosPersonalizados();
    const contatosRemovidosPadrao = JSON.parse(localStorage.getItem('jericar_contatos_padrao_removidos') || '[]');
    
    // Filtrar contatos padrão que não foram removidos
    const contatosPadraoAtivos = this.CONTATOS_PADRAO.filter(contato => 
      !contatosRemovidosPadrao.includes(contato.id)
    );
    
    return [...contatosPadraoAtivos, ...contatosPersonalizados];
  },

  // Obter apenas contatos personalizados
  obterContatosPersonalizados: function() {
    try {
      const dados = localStorage.getItem(this.STORAGE_KEY);
      return dados ? JSON.parse(dados) : [];
    } catch (error) {
      console.error('Erro ao carregar contatos:', error);
      return [];
    }
  },

  // Salvar contatos personalizados
  salvarContatosPersonalizados: function(contatos) {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(contatos));
      return true;
    } catch (error) {
      console.error('Erro ao salvar contatos:', error);
      return false;
    }
  },

  // Adicionar novo contato
  adicionarContato: function(contato) {
    const contatos = this.obterContatosPersonalizados();
    const novoContato = {
      id: 'custom_' + Date.now(),
      nome: contato.nome,
      telefone: contato.telefone,
      tiposServico: contato.tiposServico || ['todos'],
      horarioFuncionamento: contato.horarioFuncionamento || '24h',
      ativo: true,
      padrao: false,
      dataCriacao: new Date().toISOString()
    };
    
    contatos.push(novoContato);
    return this.salvarContatosPersonalizados(contatos) ? novoContato : null;
  },

  // Editar contato existente (incluindo contatos padrão)
  editarContato: function(id, dadosAtualizados) {
    // Verificar se é um contato padrão
    const contatoPadraoIndex = this.CONTATOS_PADRAO.findIndex(c => c.id === id);
    
    if (contatoPadraoIndex !== -1) {
      // Se é um contato padrão, vamos "convertê-lo" para personalizado
      const contatoPadrao = this.CONTATOS_PADRAO[contatoPadraoIndex];
      const contatos = this.obterContatosPersonalizados();
      
      // Criar uma versão editada como contato personalizado
      const contatoEditado = {
        ...contatoPadrao,
        ...dadosAtualizados,
        id: 'custom_' + Date.now(), // Novo ID para evitar conflitos
        padrao: false,
        dataAtualizacao: new Date().toISOString()
      };
      
      contatos.push(contatoEditado);
      
      // Marcar o contato padrão como removido
      const contatosRemovidosPadrao = JSON.parse(localStorage.getItem('jericar_contatos_padrao_removidos') || '[]');
      contatosRemovidosPadrao.push(id);
      localStorage.setItem('jericar_contatos_padrao_removidos', JSON.stringify(contatosRemovidosPadrao));
      
      return this.salvarContatosPersonalizados(contatos);
    } else {
      // Contato personalizado normal
      const contatos = this.obterContatosPersonalizados();
      const indice = contatos.findIndex(c => c.id === id);
      
      if (indice === -1) return false;
      
      contatos[indice] = {
        ...contatos[indice],
        ...dadosAtualizados,
        dataAtualizacao: new Date().toISOString()
      };
      
      return this.salvarContatosPersonalizados(contatos);
    }
  },

  // Remover contato (incluindo contatos padrão)
  removerContato: function(id) {
    // Verificar se é um contato padrão
    const contatoPadraoIndex = this.CONTATOS_PADRAO.findIndex(c => c.id === id);
    
    if (contatoPadraoIndex !== -1) {
      // Se é um contato padrão, marcar como removido
      const contatosRemovidosPadrao = JSON.parse(localStorage.getItem('jericar_contatos_padrao_removidos') || '[]');
      contatosRemovidosPadrao.push(id);
      localStorage.setItem('jericar_contatos_padrao_removidos', JSON.stringify(contatosRemovidosPadrao));
      return true;
    } else {
      // Contato personalizado normal
      const contatos = this.obterContatosPersonalizados();
      const contatosFiltrados = contatos.filter(c => c.id !== id);
      return this.salvarContatosPersonalizados(contatosFiltrados);
    }
  },

  // Ativar/desativar contato (incluindo contatos padrão)
  alternarStatusContato: function(id) {
    // Verificar se é um contato padrão
    const contatoPadraoIndex = this.CONTATOS_PADRAO.findIndex(c => c.id === id);
    
    if (contatoPadraoIndex !== -1) {
      // Se é um contato padrão, criar uma versão personalizada com status alterado
      const contatoPadrao = this.CONTATOS_PADRAO[contatoPadraoIndex];
      const contatos = this.obterContatosPersonalizados();
      
      // Criar versão personalizada com status alterado
      const contatoComStatusAlterado = {
        ...contatoPadrao,
        id: 'custom_' + Date.now(),
        ativo: !contatoPadrao.ativo,
        padrao: false,
        dataAtualizacao: new Date().toISOString()
      };
      
      contatos.push(contatoComStatusAlterado);
      
      // Marcar o contato padrão como removido
      const contatosRemovidosPadrao = JSON.parse(localStorage.getItem('jericar_contatos_padrao_removidos') || '[]');
      contatosRemovidosPadrao.push(id);
      localStorage.setItem('jericar_contatos_padrao_removidos', JSON.stringify(contatosRemovidosPadrao));
      
      return this.salvarContatosPersonalizados(contatos);
    } else {
      // Contato personalizado normal
      const contatos = this.obterContatosPersonalizados();
      const indice = contatos.findIndex(c => c.id === id);
      
      if (indice === -1) return false;
      
      contatos[indice].ativo = !contatos[indice].ativo;
      return this.salvarContatosPersonalizados(contatos);
    }
  },

  // Obter contatos por tipo de serviço
  obterContatosPorTipoServico: function(tipoServico) {
    const todosContatos = this.obterTodosContatos();
    return todosContatos.filter(contato => {
      if (!contato.ativo) return false;
      
      return contato.tiposServico.includes('todos') || 
             contato.tiposServico.includes('Todos') ||
             contato.tiposServico.some(tipo => 
               tipo.toLowerCase().includes(tipoServico.toLowerCase())
             );
    });
  },

  // Obter contato recomendado baseado no serviço e horário
  obterContatoRecomendado: function(tipoServico, horario, dataServicos) {
    const contatosDisponiveis = this.obterContatosPorTipoServico(tipoServico);
    
    if (contatosDisponiveis.length === 0) {
      return this.CONTATOS_PADRAO[0]; // Fallback para central
    }

    // Se não há horário, retorna o primeiro disponível
    if (!horario || !dataServicos) {
      return contatosDisponiveis[0];
    }

    // Lógica de horário comercial (pode ser expandida)
    const data = new Date(dataServicos + 'T' + horario);
    const diaSemana = data.getDay();
    const hora = parseInt(horario.split(':')[0]);
    
    const isHorarioComercial = (diaSemana >= 1 && diaSemana <= 5) && (hora >= 9 && hora <= 17);
    
    // Priorizar contatos com horário adequado
    const contatoIdeal = contatosDisponiveis.find(contato => {
      if (contato.horarioFuncionamento === '24h') return true;
      
      if (isHorarioComercial && contato.horarioFuncionamento.includes('09:00-17:00')) {
        return true;
      }
      
      if (!isHorarioComercial && contato.horarioFuncionamento.includes('18:00-06:00')) {
        return true;
      }
      
      return false;
    });
    
    return contatoIdeal || contatosDisponiveis[0];
  },

  // Validar dados do contato
  validarContato: function(contato) {
    const erros = [];
    
    if (!contato.nome || contato.nome.trim().length < 3) {
      erros.push('Nome deve ter pelo menos 3 caracteres');
    }
    
    if (!contato.telefone || !this.validarTelefone(contato.telefone)) {
      erros.push('Telefone deve ter entre 10-15 dígitos em formato válido');
    }
    
    if (!contato.tiposServico || contato.tiposServico.length === 0) {
      erros.push('Selecione pelo menos um tipo de serviço');
    }
    
    return erros;
  },

  // Validar formato de telefone (versão mais flexível)
  validarTelefone: function(telefone) {
    if (!telefone) return false;
    
    // Remover todos os caracteres não numéricos
    const numeros = telefone.replace(/\D/g, '');
    
    // Aceitar diferentes formatos mais flexíveis:
    // 10 dígitos (telefone fixo): 8533334444
    // 11 dígitos (celular): 85999998888
    // 12 dígitos com código do país (fixo): 558533334444
    // 13 dígitos com código do país (celular): 5585999998888
    // 14+ dígitos com código internacional
    
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

  // Formatar telefone automaticamente
  formatarTelefone: function(telefone) {
    // Remove tudo que não é número
    const numeros = telefone.replace(/\D/g, '');
    
    // Se começar com 55, assume que já tem código do país
    if (numeros.startsWith('55') && numeros.length >= 12) {
      const ddd = numeros.substring(2, 4);
      const numero = numeros.substring(4);
      
      if (numero.length === 9) {
        return `+55 ${ddd} ${numero.substring(0, 5)}-${numero.substring(5)}`;
      } else if (numero.length === 8) {
        return `+55 ${ddd} ${numero.substring(0, 4)}-${numero.substring(4)}`;
      }
    }
    
    // Se não tem código do país, adiciona +55
    if (numeros.length >= 10) {
      const ddd = numeros.substring(0, 2);
      const numero = numeros.substring(2);
      
      if (numero.length === 9) {
        return `+55 ${ddd} ${numero.substring(0, 5)}-${numero.substring(5)}`;
      } else if (numero.length === 8) {
        return `+55 ${ddd} ${numero.substring(0, 4)}-${numero.substring(4)}`;
      }
    }
    
    return telefone; // Retorna original se não conseguir formatar
  },

  // Obter estatísticas dos contatos
  obterEstatisticas: function() {
    const todosContatos = this.obterTodosContatos();
    const contatosAtivos = todosContatos.filter(c => c.ativo);
    const contatosPersonalizados = this.obterContatosPersonalizados();
    
    return {
      total: todosContatos.length,
      ativos: contatosAtivos.length,
      personalizados: contatosPersonalizados.length,
      padrao: this.CONTATOS_PADRAO.length
    };
  }
};

