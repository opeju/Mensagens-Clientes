import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const FiltrosAvancados = ({ filtros, onFiltroChange, onLimparFiltros, onExportar }) => {
  const [mostrarFiltrosAvancados, setMostrarFiltrosAvancados] = useState(false);

  const obterDataHoje = () => {
    return new Date().toISOString().split('T')[0];
  };

  const obterDataAmanha = () => {
    const amanha = new Date();
    amanha.setDate(amanha.getDate() + 1);
    return amanha.toISOString().split('T')[0];
  };

  const obterDataSemanaQueVem = () => {
    const semanaQueVem = new Date();
    semanaQueVem.setDate(semanaQueVem.getDate() + 7);
    return semanaQueVem.toISOString().split('T')[0];
  };

  const aplicarFiltroRapido = (tipo) => {
    switch (tipo) {
      case 'hoje':
        onFiltroChange('data', obterDataHoje());
        break;
      case 'amanha':
        onFiltroChange('data', obterDataAmanha());
        break;
      case 'semana':
        onFiltroChange('dataInicio', obterDataHoje());
        onFiltroChange('dataFim', obterDataSemanaQueVem());
        break;
      case 'pendentes':
        onFiltroChange('status', 'pendente');
        break;
      case 'enviadas':
        onFiltroChange('status', 'enviada');
        break;
      case 'confirmadas':
        onFiltroChange('status', 'confirmada');
        break;
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle className="flex items-center gap-2">
            🔍 Filtros e Busca
            <Button
              variant="outline"
              size="sm"
              onClick={() => setMostrarFiltrosAvancados(!mostrarFiltrosAvancados)}
            >
              {mostrarFiltrosAvancados ? '📤 Ocultar Avançados' : '📥 Mostrar Avançados'}
            </Button>
          </CardTitle>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={onLimparFiltros}
            >
              🗑️ Limpar Filtros
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onExportar('txt')}
            >
              📄 Exportar TXT
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onExportar('csv')}
            >
              📊 Exportar CSV
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Filtros Rápidos */}
        <div>
          <label className="block text-sm font-medium mb-2">⚡ Filtros Rápidos</label>
          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => aplicarFiltroRapido('hoje')}
              className="text-xs"
            >
              📅 Hoje
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => aplicarFiltroRapido('amanha')}
              className="text-xs"
            >
              📅 Amanhã
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => aplicarFiltroRapido('semana')}
              className="text-xs"
            >
              📅 Próximos 7 dias
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => aplicarFiltroRapido('pendentes')}
              className="text-xs"
            >
              ⏳ Pendentes
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => aplicarFiltroRapido('enviadas')}
              className="text-xs"
            >
              📤 Enviadas
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => aplicarFiltroRapido('confirmadas')}
              className="text-xs"
            >
              ✅ Confirmadas
            </Button>
          </div>
        </div>

        {/* Filtros Básicos */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">📅 Data dos Serviços</label>
            <input
              type="date"
              className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
              value={filtros.data || ''}
              onChange={(e) => onFiltroChange('data', e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">📊 Status</label>
            <select
              className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
              value={filtros.status || 'todos'}
              onChange={(e) => onFiltroChange('status', e.target.value)}
            >
              <option value="todos">Todos os Status</option>
              <option value="pendente">⏳ Pendente</option>
              <option value="enviada">📤 Enviada</option>
              <option value="confirmada">✅ Confirmada</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">🔍 Busca por Cliente/Reserva</label>
            <input
              type="text"
              className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
              placeholder="Digite nome ou número da reserva"
              value={filtros.busca || ''}
              onChange={(e) => onFiltroChange('busca', e.target.value)}
            />
          </div>
        </div>

        {/* Filtros Avançados */}
        {mostrarFiltrosAvancados && (
          <div className="border-t pt-4 space-y-4">
            <h4 className="font-medium text-gray-700">🔧 Filtros Avançados</h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">📅 Data Início (Período)</label>
                <input
                  type="date"
                  className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                  value={filtros.dataInicio || ''}
                  onChange={(e) => onFiltroChange('dataInicio', e.target.value)}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">📅 Data Fim (Período)</label>
                <input
                  type="date"
                  className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                  value={filtros.dataFim || ''}
                  onChange={(e) => onFiltroChange('dataFim', e.target.value)}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">👥 Quantidade de Pessoas</label>
                <select
                  className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                  value={filtros.quantidadePessoas || 'todas'}
                  onChange={(e) => onFiltroChange('quantidadePessoas', e.target.value)}
                >
                  <option value="todas">Todas as quantidades</option>
                  <option value="1">1 pessoa</option>
                  <option value="2">2 pessoas</option>
                  <option value="3-5">3-5 pessoas</option>
                  <option value="6+">6+ pessoas</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">🚐 Tipo de Serviço</label>
                <input
                  type="text"
                  className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                  placeholder="Ex: Transfer, City Tour"
                  value={filtros.tipoServico || ''}
                  onChange={(e) => onFiltroChange('tipoServico', e.target.value)}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">📍 Local de Embarque</label>
                <input
                  type="text"
                  className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                  placeholder="Ex: Aeroporto, Hotel"
                  value={filtros.localEmbarque || ''}
                  onChange={(e) => onFiltroChange('localEmbarque', e.target.value)}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">🎯 Local de Desembarque</label>
                <input
                  type="text"
                  className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                  placeholder="Ex: Aeroporto, Hotel"
                  value={filtros.localDesembarque || ''}
                  onChange={(e) => onFiltroChange('localDesembarque', e.target.value)}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">📋 Ordenar por</label>
                <select
                  className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                  value={filtros.ordenarPor || 'dataCriacao'}
                  onChange={(e) => onFiltroChange('ordenarPor', e.target.value)}
                >
                  <option value="dataCriacao">Data de Criação</option>
                  <option value="dataServicos">Data dos Serviços</option>
                  <option value="nomeCliente">Nome do Cliente</option>
                  <option value="status">Status</option>
                  <option value="reserva">Número da Reserva</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">🔄 Ordem</label>
                <select
                  className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                  value={filtros.ordem || 'desc'}
                  onChange={(e) => onFiltroChange('ordem', e.target.value)}
                >
                  <option value="desc">Mais recente primeiro</option>
                  <option value="asc">Mais antigo primeiro</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Resumo dos Filtros Ativos */}
        {Object.keys(filtros).some(key => filtros[key] && filtros[key] !== 'todos' && filtros[key] !== 'todas') && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <h4 className="font-medium text-blue-900 mb-2">🏷️ Filtros Ativos:</h4>
            <div className="flex flex-wrap gap-2">
              {Object.entries(filtros).map(([key, value]) => {
                if (!value || value === 'todos' || value === 'todas') return null;
                
                const labels = {
                  data: '📅 Data',
                  status: '📊 Status',
                  busca: '🔍 Busca',
                  dataInicio: '📅 Início',
                  dataFim: '📅 Fim',
                  quantidadePessoas: '👥 Pessoas',
                  tipoServico: '🚐 Tipo',
                  localEmbarque: '📍 Embarque',
                  localDesembarque: '🎯 Desembarque',
                  ordenarPor: '📋 Ordem',
                  ordem: '🔄 Direção'
                };

                return (
                  <span
                    key={key}
                    className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs"
                  >
                    {labels[key] || key}: {value}
                    <button
                      onClick={() => onFiltroChange(key, '')}
                      className="ml-1 text-blue-600 hover:text-blue-800"
                    >
                      ×
                    </button>
                  </span>
                );
              })}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default FiltrosAvancados;

