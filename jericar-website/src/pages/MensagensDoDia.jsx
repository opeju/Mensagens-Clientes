import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const MensagensDoDia = () => {
  const [dataFiltro, setDataFiltro] = useState(new Date().toISOString().split('T')[0]);
  const [filtroStatus, setFiltroStatus] = useState('todos');
  const [buscaTexto, setBuscaTexto] = useState('');

  // Dados de exemplo - em produção viriam do localStorage ou API
  const mensagensExemplo = [
    {
      id: 1,
      cliente: { nome: 'João Silva', numeroReserva: 'RES001', quantidadePessoas: 2 },
      dataServicos: '2025-07-04',
      dataCriacao: '2025-07-04T08:30:00',
      servicos: [
        {
          tipo: 'Transfer Aeroporto',
          horarioEmbarque: '14:00',
          localEmbarque: 'Aeroporto Internacional',
          localDesembarque: 'Hotel Praia Mar'
        }
      ],
      status: 'pendente',
      mensagemGerada: 'Mensagem de exemplo...'
    },
    {
      id: 2,
      cliente: { nome: 'Maria Santos', numeroReserva: 'RES002', quantidadePessoas: 4 },
      dataServicos: '2025-07-04',
      dataCriacao: '2025-07-04T09:15:00',
      servicos: [
        {
          tipo: 'City Tour',
          horarioEmbarque: '09:00',
          localEmbarque: 'Hotel Central',
          localDesembarque: 'Hotel Central'
        }
      ],
      status: 'enviada',
      timestampEnvio: '2025-07-04T09:20:00'
    }
  ];

  const [mensagens, setMensagens] = useState(mensagensExemplo);

  const mensagensFiltradas = mensagens.filter(msg => {
    const matchData = msg.dataServicos === dataFiltro;
    const matchStatus = filtroStatus === 'todos' || msg.status === filtroStatus;
    const matchTexto = buscaTexto === '' || 
      msg.cliente.nome.toLowerCase().includes(buscaTexto.toLowerCase()) ||
      msg.cliente.numeroReserva.toLowerCase().includes(buscaTexto.toLowerCase());
    
    return matchData && matchStatus && matchTexto;
  });

  const contadores = {
    total: mensagensFiltradas.length,
    pendentes: mensagensFiltradas.filter(m => m.status === 'pendente').length,
    enviadas: mensagensFiltradas.filter(m => m.status === 'enviada').length,
    confirmadas: mensagensFiltradas.filter(m => m.status === 'confirmada').length
  };

  const atualizarStatus = (id, novoStatus) => {
    setMensagens(mensagens.map(msg => 
      msg.id === id 
        ? { 
            ...msg, 
            status: novoStatus,
            ...(novoStatus === 'enviada' && { timestampEnvio: new Date().toISOString() })
          }
        : msg
    ));
  };

  const excluirMensagem = (id) => {
    if (confirm('Tem certeza que deseja excluir esta mensagem?')) {
      setMensagens(mensagens.filter(msg => msg.id !== id));
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pendente': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'enviada': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'confirmada': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pendente': return '⏳';
      case 'enviada': return '📤';
      case 'confirmada': return '✅';
      default: return '❓';
    }
  };

  return (
    <div className="space-y-6">
      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            🔍 Filtros e Busca
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium mb-2">Data dos Serviços</label>
              <input
                type="date"
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                value={dataFiltro}
                onChange={(e) => setDataFiltro(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Status</label>
              <select
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                value={filtroStatus}
                onChange={(e) => setFiltroStatus(e.target.value)}
              >
                <option value="todos">Todos os Status</option>
                <option value="pendente">Pendente</option>
                <option value="enviada">Enviada</option>
                <option value="confirmada">Confirmada</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Busca por Cliente/Reserva</label>
              <input
                type="text"
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                value={buscaTexto}
                onChange={(e) => setBuscaTexto(e.target.value)}
                placeholder="Digite nome ou número da reserva"
              />
            </div>
          </div>

          {/* Contadores */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-blue-50 p-3 rounded-lg text-center">
              <div className="text-2xl font-bold text-blue-600">{contadores.total}</div>
              <div className="text-sm text-blue-800">Total</div>
            </div>
            <div className="bg-yellow-50 p-3 rounded-lg text-center">
              <div className="text-2xl font-bold text-yellow-600">{contadores.pendentes}</div>
              <div className="text-sm text-yellow-800">Pendentes</div>
            </div>
            <div className="bg-blue-50 p-3 rounded-lg text-center">
              <div className="text-2xl font-bold text-blue-600">{contadores.enviadas}</div>
              <div className="text-sm text-blue-800">Enviadas</div>
            </div>
            <div className="bg-green-50 p-3 rounded-lg text-center">
              <div className="text-2xl font-bold text-green-600">{contadores.confirmadas}</div>
              <div className="text-sm text-green-800">Confirmadas</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Lista de Mensagens */}
      <div className="space-y-4">
        {mensagensFiltradas.length === 0 ? (
          <Card>
            <CardContent className="text-center py-8">
              <div className="text-gray-500">
                <div className="text-4xl mb-4">📭</div>
                <p className="text-lg">Nenhuma mensagem encontrada</p>
                <p className="text-sm">Ajuste os filtros ou crie uma nova mensagem</p>
              </div>
            </CardContent>
          </Card>
        ) : (
          mensagensFiltradas.map((mensagem) => (
            <Card key={mensagem.id} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row justify-between items-start gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <h3 className="text-lg font-semibold">{mensagem.cliente.nome}</h3>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(mensagem.status)}`}>
                        {getStatusIcon(mensagem.status)} {mensagem.status.charAt(0).toUpperCase() + mensagem.status.slice(1)}
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600 mb-3">
                      <div>
                        <strong>Reserva:</strong> {mensagem.cliente.numeroReserva}
                      </div>
                      <div>
                        <strong>Passageiros:</strong> {mensagem.cliente.quantidadePessoas}
                      </div>
                      <div>
                        <strong>Data:</strong> {new Date(mensagem.dataServicos).toLocaleDateString('pt-BR')}
                      </div>
                    </div>

                    <div className="space-y-2">
                      {mensagem.servicos.map((servico, index) => (
                        <div key={index} className="bg-gray-50 p-3 rounded-lg">
                          <div className="font-medium text-blue-600">{servico.tipo}</div>
                          <div className="text-sm text-gray-600">
                            {servico.horarioEmbarque} • {servico.localEmbarque} → {servico.localDesembarque}
                          </div>
                        </div>
                      ))}
                    </div>

                    {mensagem.timestampEnvio && (
                      <div className="text-xs text-gray-500 mt-2">
                        Enviada em: {new Date(mensagem.timestampEnvio).toLocaleString('pt-BR')}
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col gap-2 min-w-[200px]">
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full"
                      onClick={() => alert('Visualizar mensagem completa')}
                    >
                      👁️ Ver Mensagem
                    </Button>
                    
                    {mensagem.status === 'pendente' && (
                      <Button
                        size="sm"
                        className="w-full bg-blue-600 hover:bg-blue-700"
                        onClick={() => atualizarStatus(mensagem.id, 'enviada')}
                      >
                        📤 Marcar como Enviada
                      </Button>
                    )}
                    
                    {mensagem.status === 'enviada' && (
                      <Button
                        size="sm"
                        className="w-full bg-green-600 hover:bg-green-700"
                        onClick={() => atualizarStatus(mensagem.id, 'confirmada')}
                      >
                        ✅ Marcar como Confirmada
                      </Button>
                    )}
                    
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full border-orange-300 text-orange-600 hover:bg-orange-50"
                      onClick={() => alert('Editar mensagem')}
                    >
                      ✏️ Editar
                    </Button>
                    
                    <Button
                      variant="destructive"
                      size="sm"
                      className="w-full"
                      onClick={() => excluirMensagem(mensagem.id)}
                    >
                      🗑️ Excluir
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default MensagensDoDia;

