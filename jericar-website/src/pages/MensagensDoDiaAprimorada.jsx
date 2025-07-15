import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import MensagemCard from '../components/messages/MensagemCard';
import FiltrosAvancados from '../components/messages/FiltrosAvancados';
import { MensagensSalvasServiceAprimorado } from '../services/MensagensSalvasServiceAprimorado';
import ExportacaoService from '../services/ExportacaoService';

const MensagensDoDiaAprimorada = () => {
  const [mensagens, setMensagens] = useState([]);
  const [mensagensFiltradas, setMensagensFiltradas] = useState([]);
  const [filtros, setFiltros] = useState({
    data: '',
    status: 'todos',
    busca: '',
    dataInicio: '',
    dataFim: '',
    quantidadePessoas: 'todas',
    tipoServico: '',
    localEmbarque: '',
    localDesembarque: '',
    ordenarPor: 'dataCriacao',
    ordem: 'desc'
  });
  const [estatisticas, setEstatisticas] = useState({});
  const [carregando, setCarregando] = useState(true);

  // Carregar mensagens e estatísticas
  useEffect(() => {
    carregarDados();
  }, []);

  // Aplicar filtros quando mudarem
  useEffect(() => {
    aplicarFiltros();
  }, [filtros, mensagens]);

  const carregarDados = () => {
    setCarregando(true);
    try {
      const todasMensagens = MensagensSalvasServiceAprimorado.obterMensagens();
      const stats = MensagensSalvasServiceAprimorado.obterEstatisticasAvancadas();
      
      setMensagens(todasMensagens);
      setEstatisticas(stats);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      alert('Erro ao carregar mensagens');
    } finally {
      setCarregando(false);
    }
  };

  const aplicarFiltros = () => {
    const mensagensFiltradas = MensagensSalvasServiceAprimorado.filtrarMensagensAvancado(filtros);
    setMensagensFiltradas(mensagensFiltradas);
  };

  const handleFiltroChange = (campo, valor) => {
    setFiltros(prev => ({
      ...prev,
      [campo]: valor
    }));
  };

  const handleAtualizarStatus = (id, novoStatus) => {
    const sucesso = MensagensSalvasServiceAprimorado.atualizarStatus(id, novoStatus);
    if (sucesso) {
      carregarDados();
      alert(`Status atualizado para "${novoStatus}" com sucesso!`);
    } else {
      alert('Erro ao atualizar status');
    }
  };

  const handleExcluir = (id) => {
    const sucesso = MensagensSalvasServiceAprimorado.excluirMensagem(id);
    if (sucesso) {
      carregarDados();
      alert('Mensagem excluída com sucesso!');
    } else {
      alert('Erro ao excluir mensagem');
    }
  };

  const handleEditar = (id, campo, valor) => {
    if (campo === 'observacoes') {
      const sucesso = MensagensSalvasServiceAprimorado.atualizarObservacoes(id, valor);
      if (sucesso) {
        carregarDados();
        alert('Observações atualizadas com sucesso!');
      } else {
        alert('Erro ao atualizar observações');
      }
    } else if (campo === 'editar') {
      alert('Funcionalidade de edição completa será implementada em breve');
    }
  };

  const exportarMensagensDia = (formato = 'txt') => {
    // Verificar se há uma data específica selecionada nos filtros
    const dataEspecifica = filtros.dataEspecifica;
    
    if (!dataEspecifica) {
      alert('Por favor, selecione uma data específica nos filtros para exportar as mensagens.');
      return;
    }

    try {
      let resultado;
      
      if (formato === 'csv') {
        resultado = ExportacaoService.exportarMensagensDiaCSV(dataEspecifica, mensagens);
      } else {
        resultado = ExportacaoService.exportarMensagensDia(dataEspecifica, mensagens);
      }

      if (resultado.sucesso) {
        alert(`${resultado.totalMensagens} mensagens do dia ${resultado.data} exportadas com sucesso!`);
      } else {
        alert(`Erro na exportação: ${resultado.erro}`);
      }
    } catch (error) {
      console.error('Erro ao exportar:', error);
      alert('Erro ao exportar mensagens');
    }
  };

  const limparFiltros = () => {
    setFiltros({
      data: '',
      status: 'todos',
      busca: '',
      dataInicio: '',
      dataFim: '',
      quantidadePessoas: 'todas',
      tipoServico: '',
      localEmbarque: '',
      localDesembarque: '',
      ordenarPor: 'dataCriacao',
      ordem: 'desc'
    });
  };

  if (carregando) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-lg">⏳ Carregando mensagens...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Estatísticas */}
      <Card>
        <CardHeader>
          <CardTitle>📊 Estatísticas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-center">
            <div className="bg-blue-50 p-3 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{estatisticas.total}</div>
              <div className="text-sm text-blue-800">Total</div>
            </div>
            <div className="bg-yellow-50 p-3 rounded-lg">
              <div className="text-2xl font-bold text-yellow-600">{estatisticas.pendentes}</div>
              <div className="text-sm text-yellow-800">Pendentes</div>
            </div>
            <div className="bg-blue-50 p-3 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{estatisticas.enviadas}</div>
              <div className="text-sm text-blue-800">Enviadas</div>
            </div>
            <div className="bg-green-50 p-3 rounded-lg">
              <div className="text-2xl font-bold text-green-600">{estatisticas.confirmadas}</div>
              <div className="text-sm text-green-800">Confirmadas</div>
            </div>
            <div className="bg-purple-50 p-3 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">{estatisticas.hoje}</div>
              <div className="text-sm text-purple-800">Hoje</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Filtros Avançados */}
      <FiltrosAvancados
        filtros={filtros}
        onFiltroChange={handleFiltroChange}
        onLimparFiltros={limparFiltros}
        onExportar={exportarMensagensDia}
      />

      {/* Lista de mensagens */}
      <Card>
        <CardHeader>
          <CardTitle>
            📋 Mensagens ({mensagensFiltradas.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {mensagensFiltradas.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              {mensagens.length === 0 ? (
                <div>
                  <div className="text-4xl mb-4">📭</div>
                  <p className="text-lg">Nenhuma mensagem salva ainda</p>
                  <p className="text-sm">Use o Gerador de Mensagens para criar e salvar mensagens</p>
                </div>
              ) : (
                <div>
                  <div className="text-4xl mb-4">🔍</div>
                  <p className="text-lg">Nenhuma mensagem encontrada</p>
                  <p className="text-sm">Tente ajustar os filtros de busca</p>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {mensagensFiltradas.map((mensagem) => (
                <MensagemCard
                  key={mensagem.id}
                  mensagem={mensagem}
                  onAtualizarStatus={handleAtualizarStatus}
                  onExcluir={handleExcluir}
                  onEditar={handleEditar}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default MensagensDoDiaAprimorada;

