const BASE_URL = import.meta.env.VITE_API_URL || '/api';


// Serviço para comunicação com a API do servidor
const ApiService = {
  // URL base da API (será definida automaticamente)
  baseURL: BASE_URL,

  // Fazer requisição HTTP
  async request(endpoint, options = {}) {
    try {
      const url = `${this.baseURL}${endpoint}`;
      const config = {
        headers: {
          'Content-Type': 'application/json',
          ...options.headers
        },
        ...options
      };

      console.log(`🌐 API Request: ${config.method || 'GET'} ${url}`);
      
      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.erro || `HTTP ${response.status}`);
      }

      console.log(`✅ API Response: ${url}`, data);
      return data;

    } catch (error) {
      console.error(`❌ API Error: ${endpoint}`, error);
      throw error;
    }
  },

  // Métodos HTTP
  async get(endpoint) {
    return this.request(endpoint, { method: 'GET' });
  },

  async post(endpoint, data) {
    return this.request(endpoint, {
      method: 'POST',
      body: JSON.stringify(data)
    });
  },

  async put(endpoint, data) {
    return this.request(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  },

  async delete(endpoint) {
    return this.request(endpoint, { method: 'DELETE' });
  },

  // === MENSAGENS ===

  // Listar todas as mensagens
  async listarMensagens() {
    const response = await this.get('/mensagens');
    return response.mensagens || [];
  },

  // Criar nova mensagem
  async criarMensagem(clienteData, servicos, mensagemTexto) {
    const dados = {
      cliente: clienteData,
      servicos: servicos,
      mensagem: mensagemTexto
    };
    
    const response = await this.post('/mensagens', dados);
    return response.mensagem;
  },

  // Atualizar status de mensagem
  async atualizarStatusMensagem(mensagemId, novoStatus) {
    const response = await this.put(`/mensagens/${mensagemId}/status`, {
      status: novoStatus
    });
    return response.mensagem;
  },

  // Deletar mensagem
  async deletarMensagem(mensagemId) {
    const response = await this.delete(`/mensagens/${mensagemId}`);
    return response;
  },

  // Obter estatísticas
  async obterEstatisticas() {
    const response = await this.get('/mensagens/estatisticas');
    return response.estatisticas;
  },

  // === CONTATOS ===

  // Listar contatos ativos
  async listarContatos() {
    const response = await this.get('/contatos');
    return response.contatos || [];
  },

  // Criar novo contato
  async criarContato(dadosContato) {
    const response = await this.post('/contatos', dadosContato);
    return response.contato;
  },

  // Atualizar contato
  async atualizarContato(contatoId, dadosContato) {
    const response = await this.put(`/contatos/${contatoId}`, dadosContato);
    return response.contato;
  },

  // Deletar contato
  async deletarContato(contatoId) {
    const response = await this.delete(`/contatos/${contatoId}`);
    return response;
  },

  // === UTILITÁRIOS ===

  // Verificar se a API está funcionando
  async verificarConexao() {
    try {
      await this.get('/mensagens/estatisticas');
      return true;
    } catch (error) {
      console.warn('⚠️ API não está acessível, usando modo offline');
      return false;
    }
  },

  // Sincronizar dados do localStorage com o servidor
  async sincronizarDados() {
    try {
      console.log('🔄 Iniciando sincronização de dados...');
      
      // Verificar se há dados no localStorage
      const mensagensLocal = localStorage.getItem('mensagensSalvas');
      const contatosLocal = localStorage.getItem('jericar_contatos');
      
      if (mensagensLocal) {
        const mensagens = JSON.parse(mensagensLocal);
        console.log(`📤 Enviando ${mensagens.length} mensagens para o servidor...`);
        
        for (const mensagem of mensagens) {
          try {
            await this.criarMensagem(
              mensagem.cliente,
              mensagem.servicos,
              mensagem.mensagem
            );
          } catch (error) {
            console.warn('⚠️ Erro ao sincronizar mensagem:', error);
          }
        }
        
        // Limpar localStorage após sincronização
        localStorage.removeItem('mensagensSalvas');
        console.log('✅ Mensagens sincronizadas e localStorage limpo');
      }
      
      if (contatosLocal) {
        const contatos = JSON.parse(contatosLocal);
        console.log(`📤 Enviando ${contatos.length} contatos para o servidor...`);
        
        for (const contato of contatos) {
          try {
            await this.criarContato(contato);
          } catch (error) {
            console.warn('⚠️ Erro ao sincronizar contato:', error);
          }
        }
        
        // Limpar localStorage após sincronização
        localStorage.removeItem('jericar_contatos');
        console.log('✅ Contatos sincronizados e localStorage limpo');
      }
      
      console.log('🎉 Sincronização concluída com sucesso!');
      return true;
      
    } catch (error) {
      console.error('❌ Erro na sincronização:', error);
      return false;
    }
  }
};

export default ApiService;

