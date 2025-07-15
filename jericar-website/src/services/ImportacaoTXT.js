// Serviço de importação via arquivo TXT
const ImportacaoTXT = {

  // Gerar template TXT para download
  gerarTemplateTXT: function() {
    const template = `# TEMPLATE DE IMPORTAÇÃO - JERICAR VIAGENS
# Instruções:
# - Cada linha representa um serviço
# - Use o formato: CAMPO=valor
# - Separe cada registro com uma linha em branco
# - Campos obrigatórios: nome, reserva, data, pessoas, tipo, embarque, local_embarque, local_desembarque
# - Formato de data: AAAA-MM-DD (ex: 2025-07-15)
# - Formato de horário: HH:MM (ex: 14:30)

# EXEMPLO 1:
nome=João Silva Santos
reserva=RES123456
data=2025-07-15
pessoas=2
tipo=Transfer Aeroporto
operacao=Privativo
embarque=14:30
termino=15:30
local_embarque=Hotel Praia Mar
local_desembarque=Aeroporto Internacional
observacoes=Cliente VIP

# EXEMPLO 2:
nome=Maria Oliveira
reserva=RES789012
data=2025-07-16
pessoas=4
tipo=City Tour Fortaleza
operacao=Compartilhado
embarque=09:00
termino=17:00
local_embarque=Hotel Beach Park
local_desembarque=Hotel Beach Park
observacoes=Incluir almoço

# ADICIONE SEUS DADOS ABAIXO:
# (Copie o formato dos exemplos acima)

nome=
reserva=
data=
pessoas=
tipo=
operacao=
embarque=
termino=
local_embarque=
local_desembarque=
observacoes=
`;

    const blob = new Blob([template], { type: 'text/plain;charset=utf-8' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'template_importacao_jericar.txt';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  },

  // Processar arquivo TXT
  processarArquivoTXT: function(conteudo) {
    console.log('📄 Processando arquivo TXT...');
    console.log('📄 Conteúdo recebido:', conteudo);

    try {
      const linhas = conteudo.split('\n');
      const registros = [];
      let registroAtual = {};
      let numeroLinha = 0;

      for (let linha of linhas) {
        numeroLinha++;
        linha = linha.trim();

        // Pular linhas vazias, comentários ou instruções
        if (!linha || linha.startsWith('#') || linha.startsWith('//')) {
          // Se temos um registro em andamento e encontramos linha vazia, finalizar registro
          if (Object.keys(registroAtual).length > 0 && !linha) {
            registros.push({ ...registroAtual, linhaOriginal: numeroLinha });
            registroAtual = {};
          }
          continue;
        }

        // Processar linha no formato CAMPO=valor
        if (linha.includes('=')) {
          const [campo, ...valorArray] = linha.split('=');
          const valor = valorArray.join('=').trim(); // Rejuntar caso haja = no valor
          const campoLimpo = campo.trim().toLowerCase();

          if (valor) {
            registroAtual[campoLimpo] = valor;
          }
        }
      }

      // Adicionar último registro se existir
      if (Object.keys(registroAtual).length > 0) {
        registros.push({ ...registroAtual, linhaOriginal: numeroLinha });
      }

      console.log('📄 Registros extraídos:', registros);

      // Validar e converter registros
      const registrosValidados = this.validarRegistros(registros);

      return {
        sucesso: true,
        totalLinhas: numeroLinha,
        registrosEncontrados: registros.length,
        registrosValidos: registrosValidados.validos.length,
        registrosInvalidos: registrosValidados.invalidos.length,
        dados: registrosValidados
      };

    } catch (error) {
      console.error('📄 Erro ao processar arquivo TXT:', error);
      return {
        sucesso: false,
        erro: error.message
      };
    }
  },

  // Validar registros extraídos
  validarRegistros: function(registros) {
    const validos = [];
    const invalidos = [];

    registros.forEach((registro, index) => {
      const erros = [];

      // Campos obrigatórios
      const camposObrigatorios = ['nome', 'reserva', 'data', 'pessoas', 'tipo', 'embarque', 'local_embarque', 'local_desembarque'];
      
      camposObrigatorios.forEach(campo => {
        if (!registro[campo] || registro[campo].trim() === '') {
          erros.push(`Campo '${campo}' é obrigatório`);
        }
      });

      // Validar formato de data
      if (registro.data) {
        const dataRegex = /^\d{4}-\d{2}-\d{2}$/;
        if (!dataRegex.test(registro.data)) {
          erros.push('Data deve estar no formato AAAA-MM-DD');
        }
      }

      // Validar formato de horário
      if (registro.embarque) {
        const horarioRegex = /^\d{2}:\d{2}$/;
        if (!horarioRegex.test(registro.embarque)) {
          erros.push('Horário de embarque deve estar no formato HH:MM');
        }
      }

      // Validar número de pessoas
      if (registro.pessoas) {
        const pessoas = parseInt(registro.pessoas);
        if (isNaN(pessoas) || pessoas <= 0) {
          erros.push('Quantidade de pessoas deve ser um número maior que zero');
        }
      }

      if (erros.length === 0) {
        validos.push({
          ...registro,
          indice: index + 1
        });
      } else {
        invalidos.push({
          ...registro,
          indice: index + 1,
          erros: erros
        });
      }
    });

    return { validos, invalidos };
  },

  // Gerar mensagens a partir dos dados validados
  gerarMensagens: function(dadosValidos) {
    console.log('📄 Gerando mensagens para dados válidos...');
    
    const mensagensGeradas = [];
    const erros = [];

    dadosValidos.forEach((dados, index) => {
      try {
        // Gerar mensagem formatada
        const mensagem = this.gerarMensagemFormatada(dados);
        
        mensagensGeradas.push({
          dadosOriginais: dados,
          mensagem: mensagem,
          indice: index + 1
        });

      } catch (error) {
        erros.push({
          indice: index + 1,
          dados: dados,
          erro: error.message
        });
      }
    });

    return {
      totalSucesso: mensagensGeradas.length,
      totalErros: erros.length,
      mensagensGeradas: mensagensGeradas,
      erros: erros
    };
  },

  // Gerar mensagem formatada
  gerarMensagemFormatada: function(dados) {
    const dataFormatada = this.formatarData(dados.data);
    const horarioFormatado = dados.embarque;
    
    let mensagem = `🌟 *JERICAR VIAGENS* 🌟\n\n`;
    mensagem += `Olá *${dados.nome}*!\n\n`;
    mensagem += `✅ Sua reserva *${dados.reserva}* está confirmada!\n\n`;
    mensagem += `📅 *Data:* ${dataFormatada}\n`;
    mensagem += `👥 *Pessoas:* ${dados.pessoas}\n`;
    mensagem += `🚗 *Serviço:* ${dados.tipo}\n`;
    
    if (dados.operacao) {
      mensagem += `📋 *Modalidade:* ${dados.operacao}\n`;
    }
    
    mensagem += `🕐 *Embarque:* ${horarioFormatado}\n`;
    mensagem += `📍 *Local de Embarque:* ${dados.local_embarque}\n`;
    mensagem += `🎯 *Destino:* ${dados.local_desembarque}\n`;
    
    if (dados.termino) {
      mensagem += `🕐 *Término Previsto:* ${dados.termino}\n`;
    }
    
    if (dados.observacoes) {
      mensagem += `📝 *Observações:* ${dados.observacoes}\n`;
    }
    
    mensagem += `\n🚨 *IMPORTANTE:*\n`;
    mensagem += `• Esteja pronto 10 minutos antes do horário\n`;
    mensagem += `• Tenha seus documentos em mãos\n`;
    mensagem += `• Em caso de dúvidas, entre em contato\n\n`;
    mensagem += `📞 *Contato de Emergência:* +55 88 98183-2294\n\n`;
    mensagem += `Obrigado por escolher a Jericar Viagens! 🙏`;

    return mensagem;
  },

  // Formatar data para exibição
  formatarData: function(data) {
    try {
      const [ano, mes, dia] = data.split('-');
      return `${dia}/${mes}/${ano}`;
    } catch (error) {
      return data;
    }
  },

  // Salvar mensagens no localStorage
  salvarMensagens: function(mensagensGeradas) {
    console.log('📄 Salvando mensagens no localStorage...');
    
    let sucessos = 0;
    let erros = 0;

    mensagensGeradas.forEach(item => {
      try {
        const clienteData = {
          nome: item.dadosOriginais.nome,
          reserva: item.dadosOriginais.reserva,
          dataServicos: item.dadosOriginais.data,
          quantidadePessoas: item.dadosOriginais.pessoas
        };
        
        const servicos = [{
          tipo: item.dadosOriginais.tipo,
          operacao: item.dadosOriginais.operacao || '',
          horarioEmbarque: item.dadosOriginais.embarque,
          horarioTermino: item.dadosOriginais.termino || '',
          localEmbarque: item.dadosOriginais.local_embarque,
          localDesembarque: item.dadosOriginais.local_desembarque,
          observacoes: item.dadosOriginais.observacoes || ''
        }];

        // Usar o serviço de salvamento direto
        const ImportacaoAlternativa = window.ImportacaoAlternativa || {
          salvarMensagemDireta: function(clienteData, servicos, mensagem) {
            const mensagemObj = {
              id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
              cliente: clienteData,
              servicos: servicos,
              mensagem: mensagem,
              status: 'pendente',
              dataCriacao: new Date().toISOString(),
              dataEnvio: null,
              dataConfirmacao: null,
              observacoes: ''
            };

            const mensagensExistentes = JSON.parse(localStorage.getItem('mensagensSalvas') || '[]');
            mensagensExistentes.push(mensagemObj);
            localStorage.setItem('mensagensSalvas', JSON.stringify(mensagensExistentes));

            return { sucesso: true };
          }
        };

        const resultado = ImportacaoAlternativa.salvarMensagemDireta(
          clienteData,
          servicos[0],
          item.mensagem
        );

        if (resultado.sucesso) {
          sucessos++;
        } else {
          erros++;
        }

      } catch (error) {
        console.error('📄 Erro ao salvar mensagem:', error);
        erros++;
      }
    });

    return {
      sucessos: sucessos,
      erros: erros,
      total: mensagensGeradas.length
    };
  },

  // Processar arquivo completo (função principal)
  processarArquivoCompleto: function(arquivo) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (e) => {
        try {
          const conteudo = e.target.result;
          
          // 1. Processar arquivo TXT
          const resultadoProcessamento = this.processarArquivoTXT(conteudo);
          
          if (!resultadoProcessamento.sucesso) {
            resolve(resultadoProcessamento);
            return;
          }

          // 2. Gerar mensagens
          const resultadoGeracao = this.gerarMensagens(resultadoProcessamento.dados.validos);
          
          // 3. Salvar mensagens
          const resultadoSalvamento = this.salvarMensagens(resultadoGeracao.mensagensGeradas);

          resolve({
            sucesso: true,
            arquivo: {
              nome: arquivo.name,
              tamanho: arquivo.size,
              totalLinhas: resultadoProcessamento.totalLinhas
            },
            processamento: resultadoProcessamento,
            geracao: resultadoGeracao,
            salvamento: resultadoSalvamento,
            resumo: {
              totalLinhas: resultadoProcessamento.totalLinhas,
              registrosEncontrados: resultadoProcessamento.registrosEncontrados,
              registrosValidos: resultadoProcessamento.registrosValidos,
              registrosInvalidos: resultadoProcessamento.registrosInvalidos,
              mensagensGeradas: resultadoGeracao.totalSucesso,
              mensagensSalvas: resultadoSalvamento.sucessos,
              errosSalvamento: resultadoSalvamento.erros
            }
          });

        } catch (error) {
          resolve({
            sucesso: false,
            erro: error.message
          });
        }
      };

      reader.onerror = () => {
        resolve({
          sucesso: false,
          erro: 'Erro ao ler o arquivo'
        });
      };

      reader.readAsText(arquivo, 'UTF-8');
    });
  }
};

export default ImportacaoTXT;

