// Serviço para determinar contato de emergência automaticamente
import { ContatosService } from './ContatosService';

export const ContatoEmergenciaService = {
  // Determinar contato de emergência baseado no horário e dia
  determinarContato: function(horario, dataServicos, tipoServico = '') {
    if (!horario || !dataServicos) {
      const contatosDisponiveis = ContatosService.obterContatosPorTipoServico(tipoServico || 'todos');
      return {
        tipo: 'manual',
        contato: '',
        opcoes: contatosDisponiveis.map(c => ({ nome: c.nome, telefone: c.telefone }))
      };
    }

    const data = new Date(dataServicos + 'T' + horario);
    const diaSemana = data.getDay(); // 0 = domingo, 1 = segunda, etc.
    const hora = parseInt(horario.split(':')[0]);
    
    // Verificar se é horário comercial (segunda a sexta, 09:00 às 17:00)
    const isHorarioComercial = (diaSemana >= 1 && diaSemana <= 5) && (hora >= 9 && hora <= 17);
    
    // Obter contato recomendado baseado no tipo de serviço e horário
    const contatoRecomendado = ContatosService.obterContatoRecomendado(tipoServico, horario, dataServicos);
    
    if (isHorarioComercial) {
      return {
        tipo: 'automatico',
        contato: contatoRecomendado.telefone,
        contatoObj: contatoRecomendado,
        motivo: 'Horário comercial (Seg-Sex 09:00-17:00)'
      };
    } else {
      // Fora do horário comercial - mostrar opções disponíveis
      const contatosDisponiveis = ContatosService.obterContatosPorTipoServico(tipoServico || 'todos');
      return {
        tipo: 'selecionar',
        contato: '',
        opcoes: contatosDisponiveis,
        recomendado: contatoRecomendado,
        motivo: 'Fora do horário comercial - selecione contato específico'
      };
    }
  },

  // Obter descrição do horário
  obterDescricaoHorario: function(horario, dataServicos) {
    if (!horario || !dataServicos) return '';
    
    const data = new Date(dataServicos + 'T' + horario);
    const diaSemana = data.getDay();
    const diasSemana = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
    
    return `${diasSemana[diaSemana]} às ${horario}`;
  },

  // Obter contatos disponíveis para um tipo de serviço
  obterContatosDisponiveis: function(tipoServico) {
    return ContatosService.obterContatosPorTipoServico(tipoServico);
  }
};

