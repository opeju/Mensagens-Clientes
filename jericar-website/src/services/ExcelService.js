// Serviço para processamento de arquivos Excel
import * as XLSX from 'xlsx';
import { ValidationService } from './ValidationService';
import { MensagemService } from './MensagemService';

export const ExcelService = {
  // Template das colunas esperadas
  COLUNAS_TEMPLATE: [
    'Nome do Cliente',
    'Número da Reserva', 
    'Data dos Serviços',
    'Quantidade de Pessoas',
    'Tipo de Serviço',
    'Operação',
    'Horário Embarque',
    'Horário Término',
    'Local Embarque',
    'Local Desembarque',
    'Observações'
  ],

  // Mapeamento de colunas (flexível para diferentes formatos)
  MAPEAMENTO_COLUNAS: {
    'nome': ['Nome do Cliente', 'Cliente', 'Nome', 'Nome Cliente'],
    'reserva': ['Número da Reserva', 'Reserva', 'Nº Reserva', 'Numero Reserva'],
    'data': ['Data dos Serviços', 'Data Serviços', 'Data Serviço', 'Data do Serviço', 'Data'],
    'pessoas': ['Quantidade de Pessoas', 'Pessoas', 'Qtd Pessoas', 'Pax'],
    'tipoServico': ['Tipo de Serviço', 'Tipo Serviço', 'Serviço', 'Tipo'],
    'operacao': ['Operação', 'Tipo Operação', 'Modalidade'],
    'horarioEmbarque': ['Horário Embarque', 'Embarque', 'Hora Embarque', 'Horario Embarque'],
    'horarioTermino': ['Horário Término', 'Término', 'Hora Término', 'Horario Termino'],
    'localEmbarque': ['Local Embarque', 'Embarque Local', 'Local de Embarque'],
    'localDesembarque': ['Local Desembarque', 'Desembarque Local', 'Local de Desembarque'],
    'observacoes': ['Observações', 'Obs', 'Observacao', 'Comentários']
  },

  // Gerar template Excel para download
  gerarTemplateExcel: function() {
    const dadosExemplo = [
      {
        'Nome do Cliente': 'João Silva Santos',
        'Número da Reserva': 'RES123456',
        'Data dos Serviços': '2025-07-15',
        'Quantidade de Pessoas': 2,
        'Tipo de Serviço': 'Transfer Aeroporto',
        'Operação': 'Privativo',
        'Horário Embarque': '14:30',
        'Horário Término': '15:30',
        'Local Embarque': 'Hotel Praia Mar',
        'Local Desembarque': 'Aeroporto Internacional',
        'Observações': 'Cliente VIP'
      },
      {
        'Nome do Cliente': 'Maria Oliveira',
        'Número da Reserva': 'RES789012',
        'Data dos Serviços': '2025-07-16',
        'Quantidade de Pessoas': 4,
        'Tipo de Serviço': 'City Tour Fortaleza',
        'Operação': 'Compartilhado',
        'Horário Embarque': '09:00',
        'Horário Término': '17:00',
        'Local Embarque': 'Hotel Beach Park',
        'Local Desembarque': 'Hotel Beach Park',
        'Observações': 'Incluir almoço'
      }
    ];

    const worksheet = XLSX.utils.json_to_sheet(dadosExemplo);
    const workbook = XLSX.utils.book_new();
    
    // Adicionar instruções em uma aba separada
    const instrucoes = [
      ['INSTRUÇÕES PARA PREENCHIMENTO'],
      [''],
      ['1. Preencha todos os campos obrigatórios (marcados com *)'],
      ['2. Use o formato de data: AAAA-MM-DD (ex: 2025-07-15)'],
      ['3. Use o formato de horário: HH:MM (ex: 14:30)'],
      ['4. Operação deve ser: Privativo ou Compartilhado'],
      ['5. Salve o arquivo e faça upload na aba Importação'],
      [''],
      ['CAMPOS OBRIGATÓRIOS:'],
      ['- Nome do Cliente'],
      ['- Número da Reserva'],
      ['- Data dos Serviços'],
      ['- Quantidade de Pessoas'],
      ['- Tipo de Serviço'],
      ['- Horário Embarque'],
      ['- Local Embarque'],
      ['- Local Desembarque'],
      [''],
      ['TIPOS DE SERVIÇO SUGERIDOS:'],
      ['- Transfer Aeroporto'],
      ['- Transfer Hotel'],
      ['- City Tour'],
      ['- Passeio'],
      ['- Excursão'],
      ['- Receptivo']
    ];

    const worksheetInstrucoes = XLSX.utils.aoa_to_sheet(instrucoes);
    
    XLSX.utils.book_append_sheet(workbook, worksheetInstrucoes, 'Instruções');
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Dados dos Serviços');
    
    return workbook;
  },

  // Fazer download do template
  downloadTemplate: function() {
    const workbook = this.gerarTemplateExcel();
    const nomeArquivo = `template_jericar_${new Date().toISOString().split('T')[0]}.xlsx`;
    XLSX.writeFile(workbook, nomeArquivo);
  },

  // Ler arquivo Excel
  lerArquivoExcel: function(arquivo) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (e) => {
        try {
          const data = new Uint8Array(e.target.result);
          const workbook = XLSX.read(data, { type: 'array' });
          
          // Pegar a primeira aba que não seja "Instruções"
          const nomeAba = workbook.SheetNames.find(nome => 
            nome.toLowerCase() !== 'instruções' && 
            nome.toLowerCase() !== 'instrucoes'
          ) || workbook.SheetNames[0];
          
          const worksheet = workbook.Sheets[nomeAba];
          const dadosJson = XLSX.utils.sheet_to_json(worksheet);
          
          resolve({
            dados: dadosJson,
            nomeAba: nomeAba,
            totalLinhas: dadosJson.length
          });
        } catch (error) {
          reject(new Error('Erro ao ler arquivo Excel: ' + error.message));
        }
      };
      
      reader.onerror = () => {
        reject(new Error('Erro ao ler arquivo'));
      };
      
      reader.readAsArrayBuffer(arquivo);
    });
  },

  // Mapear colunas do Excel para formato interno
  mapearColunas: function(dadosExcel) {
    console.log('Dados recebidos para mapeamento:', dadosExcel);
    
    if (!dadosExcel || dadosExcel.length === 0) {
      throw new Error('Dados do Excel estão vazios');
    }

    // Filtrar linhas vazias
    const dadosLimpos = dadosExcel.filter(linha => {
      // Verificar se a linha tem pelo menos um campo preenchido
      return Object.values(linha).some(valor => 
        valor !== null && 
        valor !== undefined && 
        valor.toString().trim() !== ''
      );
    });

    console.log('Dados após limpeza:', dadosLimpos);

    if (dadosLimpos.length === 0) {
      throw new Error('Nenhuma linha com dados válidos encontrada no Excel');
    }

    const primeiraLinha = dadosLimpos[0];
    const colunasEncontradas = Object.keys(primeiraLinha);
    const mapeamento = {};

    console.log('Colunas encontradas:', colunasEncontradas);

    // Criar mapeamento automático com prioridade para correspondência exata
    Object.keys(this.MAPEAMENTO_COLUNAS).forEach(campoInterno => {
      const possiveisNomes = this.MAPEAMENTO_COLUNAS[campoInterno];
      
      // Primeiro, tentar correspondência exata
      let colunaEncontrada = colunasEncontradas.find(coluna => 
        possiveisNomes.some(nome => 
          coluna.toLowerCase() === nome.toLowerCase()
        )
      );
      
      // Se não encontrou correspondência exata, tentar correspondência parcial
      if (!colunaEncontrada) {
        colunaEncontrada = colunasEncontradas.find(coluna => 
          possiveisNomes.some(nome => 
            coluna.toLowerCase().includes(nome.toLowerCase()) ||
            nome.toLowerCase().includes(coluna.toLowerCase())
          )
        );
      }
      
      if (colunaEncontrada) {
        mapeamento[campoInterno] = colunaEncontrada;
      }
    });

    console.log('Mapeamento criado:', mapeamento);

    return {
      mapeamento,
      colunasEncontradas,
      colunasNaoMapeadas: colunasEncontradas.filter(col => 
        !Object.values(mapeamento).includes(col)
      ),
      dadosLimpos
    };
  },

  // Converter dados do Excel para formato interno
  converterDados: function(dadosExcel, mapeamento) {
    return dadosExcel.map((linha, indice) => {
      const dadosConvertidos = {
        linhaOriginal: indice + 2, // +2 porque Excel começa em 1 e tem cabeçalho
        nome: linha[mapeamento.nome] || '',
        reserva: linha[mapeamento.reserva] || '',
        data: this.formatarData(linha[mapeamento.data]),
        pessoas: parseInt(linha[mapeamento.pessoas]) || 1,
        tipoServico: linha[mapeamento.tipoServico] || '',
        operacao: linha[mapeamento.operacao] || 'Privativo',
        horarioEmbarque: this.formatarHorario(linha[mapeamento.horarioEmbarque]),
        horarioTermino: this.formatarHorario(linha[mapeamento.horarioTermino]),
        localEmbarque: linha[mapeamento.localEmbarque] || '',
        localDesembarque: linha[mapeamento.localDesembarque] || '',
        observacoes: linha[mapeamento.observacoes] || ''
      };

      return dadosConvertidos;
    });
  },

  // Formatar data para padrão YYYY-MM-DD
  formatarData: function(data) {
    if (!data) return '';
    
    // Se já está no formato correto
    if (typeof data === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(data)) {
      return data;
    }
    
    // Se é um objeto Date do Excel
    if (data instanceof Date) {
      return data.toISOString().split('T')[0];
    }
    
    // Se é um número serial do Excel
    if (typeof data === 'number') {
      const dataExcel = new Date((data - 25569) * 86400 * 1000);
      return dataExcel.toISOString().split('T')[0];
    }
    
    // Tentar converter string em diferentes formatos
    if (typeof data === 'string') {
      // Limpar espaços em branco
      const dataLimpa = data.trim();
      
      // Se já está no formato YYYY-MM-DD após limpeza
      if (/^\d{4}-\d{2}-\d{2}$/.test(dataLimpa)) {
        return dataLimpa;
      }
      
      // Formato DD/MM/YYYY
      if (/^\d{1,2}\/\d{1,2}\/\d{4}$/.test(dataLimpa)) {
        const [dia, mes, ano] = dataLimpa.split('/');
        return `${ano}-${mes.padStart(2, '0')}-${dia.padStart(2, '0')}`;
      }
      
      // Formato MM/DD/YYYY (americano)
      if (/^\d{1,2}\/\d{1,2}\/\d{4}$/.test(dataLimpa)) {
        const [mes, dia, ano] = dataLimpa.split('/');
        return `${ano}-${mes.padStart(2, '0')}-${dia.padStart(2, '0')}`;
      }
      
      // Formato DD-MM-YYYY
      if (/^\d{1,2}-\d{1,2}-\d{4}$/.test(dataLimpa)) {
        const [dia, mes, ano] = dataLimpa.split('-');
        return `${ano}-${mes.padStart(2, '0')}-${dia.padStart(2, '0')}`;
      }
      
      // Tentar parsear como data ISO
      try {
        const dataObj = new Date(dataLimpa);
        if (!isNaN(dataObj.getTime())) {
          return dataObj.toISOString().split('T')[0];
        }
      } catch (e) {
        // Ignorar erro silenciosamente
      }
    }
    
    return data.toString();
  },

  // Formatar horário para padrão HH:MM
  formatarHorario: function(horario) {
    if (!horario) return '';
    
    // Se já está no formato correto
    if (typeof horario === 'string' && /^\d{2}:\d{2}$/.test(horario)) {
      return horario;
    }
    
    // Se é um número decimal do Excel (fração do dia)
    if (typeof horario === 'number' && horario < 1) {
      const totalMinutos = Math.round(horario * 24 * 60);
      const horas = Math.floor(totalMinutos / 60);
      const minutos = totalMinutos % 60;
      return `${horas.toString().padStart(2, '0')}:${minutos.toString().padStart(2, '0')}`;
    }
    
    // Se é string com formato diferente
    if (typeof horario === 'string') {
      // Remove espaços e caracteres especiais
      const limpo = horario.replace(/[^\d:]/g, '');
      
      // Se tem formato H:MM ou HH:M
      if (/^\d{1,2}:\d{1,2}$/.test(limpo)) {
        const [h, m] = limpo.split(':');
        return `${h.padStart(2, '0')}:${m.padStart(2, '0')}`;
      }
    }
    
    return horario.toString();
  },

  // Validar dados importados
  validarDadosImportados: function(dadosConvertidos) {
    const resultados = {
      validos: [],
      invalidos: [],
      avisos: []
    };

    dadosConvertidos.forEach(dados => {
      const erros = [];
      
      // Validações obrigatórias
      if (!dados.nome || dados.nome.trim().length < 2) {
        erros.push('Nome do cliente é obrigatório');
      }
      
      if (!dados.reserva || dados.reserva.trim().length < 3) {
        erros.push('Número da reserva é obrigatório');
      }
      
      if (!dados.data || !ValidationService.validarData(dados.data)) {
        erros.push('Data dos serviços inválida');
      }
      
      if (!dados.pessoas || dados.pessoas < 1) {
        erros.push('Quantidade de pessoas deve ser maior que 0');
      }
      
      if (!dados.tipoServico || dados.tipoServico.trim().length < 3) {
        erros.push('Tipo de serviço é obrigatório');
      }
      
      if (!dados.horarioEmbarque || !ValidationService.validarHorario(dados.horarioEmbarque)) {
        erros.push('Horário de embarque inválido');
      }
      
      if (!dados.localEmbarque || dados.localEmbarque.trim().length < 3) {
        erros.push('Local de embarque é obrigatório');
      }
      
      if (!dados.localDesembarque || dados.localDesembarque.trim().length < 3) {
        erros.push('Local de desembarque é obrigatório');
      }

      // Validações de formato
      if (dados.horarioTermino && !ValidationService.validarHorario(dados.horarioTermino)) {
        erros.push('Horário de término inválido');
      }

      if (dados.operacao && !['Privativo', 'Compartilhado'].includes(dados.operacao)) {
        erros.push('Operação deve ser "Privativo" ou "Compartilhado"');
      }

      if (erros.length > 0) {
        resultados.invalidos.push({
          ...dados,
          erros
        });
      } else {
        resultados.validos.push(dados);
      }
    });

    return resultados;
  },

  // Gerar mensagens em lote
  gerarMensagensEmLote: function(dadosValidos) {
    const mensagensGeradas = [];
    const erros = [];

    dadosValidos.forEach(dados => {
      try {
        // Converter para formato esperado pelo MensagemService
        const clienteData = {
          nome: dados.nome,
          reserva: dados.reserva,
          data: dados.data,
          pessoas: dados.pessoas
        };

        const servicos = [{
          tipo: dados.tipoServico,
          operacao: dados.operacao,
          horarioEmbarque: dados.horarioEmbarque,
          horarioTermino: dados.horarioTermino || '',
          localEmbarque: dados.localEmbarque,
          localDesembarque: dados.localDesembarque,
          observacoes: dados.observacoes
        }];

        const mensagem = MensagemService.gerarMensagem(clienteData, servicos);
        
        mensagensGeradas.push({
          cliente: dados.nome,
          reserva: dados.reserva,
          mensagem: mensagem,
          dadosOriginais: dados,
          status: 'gerada'
        });

      } catch (error) {
        erros.push({
          linha: dados.linhaOriginal,
          cliente: dados.nome,
          erro: error.message
        });
      }
    });

    return {
      mensagensGeradas,
      erros,
      totalProcessadas: dadosValidos.length,
      totalSucesso: mensagensGeradas.length,
      totalErros: erros.length
    };
  },

  // Processar arquivo completo
  processarArquivoCompleto: async function(arquivo) {
    try {
      // 1. Ler arquivo Excel
      const { dados, nomeAba, totalLinhas } = await this.lerArquivoExcel(arquivo);
      
      // 2. Mapear colunas
      const { mapeamento, colunasEncontradas, colunasNaoMapeadas, dadosLimpos } = this.mapearColunas(dados);
      
      // 3. Converter dados (usar dadosLimpos em vez de dados)
      const dadosConvertidos = this.converterDados(dadosLimpos, mapeamento);
      
      // 4. Validar dados
      const validacao = this.validarDadosImportados(dadosConvertidos);
      
      // 5. Gerar mensagens para dados válidos
      const resultadoGeracao = this.gerarMensagensEmLote(validacao.validos);
      
      return {
        sucesso: true,
        arquivo: {
          nome: arquivo.name,
          tamanho: arquivo.size,
          nomeAba,
          totalLinhas: dadosLimpos.length // usar dadosLimpos.length
        },
        mapeamento: {
          colunas: mapeamento,
          colunasEncontradas,
          colunasNaoMapeadas
        },
        validacao,
        geracao: resultadoGeracao,
        resumo: {
          totalLinhas: dadosLimpos.length,
          dadosValidos: validacao.validos.length,
          dadosInvalidos: validacao.invalidos.length,
          mensagensGeradas: resultadoGeracao.totalSucesso,
          errosGeracao: resultadoGeracao.totalErros
        }
      };
      
    } catch (error) {
      return {
        sucesso: false,
        erro: error.message
      };
    }
  }
};


export default ExcelService;

