import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const MensagemCard = ({ mensagem, onAtualizarStatus, onExcluir, onEditar }) => {
  const [mostrarMensagem, setMostrarMensagem] = useState(false);
  const [editandoObservacoes, setEditandoObservacoes] = useState(false);
  const [observacoes, setObservacoes] = useState(mensagem.observacoes || '');

  const formatarData = (dataISO) => {
    if (!dataISO) return '-';
    return new Date(dataISO).toLocaleString('pt-BR');
  };

  const formatarDataServico = (dataISO) => {
    if (!dataISO) return '-';
    return new Date(dataISO).toLocaleDateString('pt-BR');
  };

  const obterCorStatus = (status) => {
    switch (status) {
      case 'pendente': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'enviada': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'confirmada': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const obterIconeStatus = (status) => {
    switch (status) {
      case 'pendente': return '⏳';
      case 'enviada': return '📤';
      case 'confirmada': return '✅';
      default: return '❓';
    }
  };

  const salvarObservacoes = () => {
    onEditar(mensagem.id, 'observacoes', observacoes);
    setEditandoObservacoes(false);
  };

  return (
    <Card className="mb-4">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-lg">
              {mensagem.cliente.nome} - {mensagem.cliente.reserva}
            </CardTitle>
            <p className="text-sm text-gray-600 mt-1">
              📅 {formatarDataServico(mensagem.cliente.dataServicos)} • 
              👥 {mensagem.cliente.quantidadePessoas} pessoa(s) • 
              🚐 {mensagem.servicos.length} serviço(s)
            </p>
          </div>
          <div className={`px-3 py-1 rounded-full border text-sm font-medium ${obterCorStatus(mensagem.status)}`}>
            {obterIconeStatus(mensagem.status)} {mensagem.status.charAt(0).toUpperCase() + mensagem.status.slice(1)}
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        {/* Resumo dos serviços */}
        <div className="bg-gray-50 rounded-lg p-3">
          <h4 className="font-medium text-sm mb-2">📋 Serviços:</h4>
          {mensagem.servicos.map((servico, index) => (
            <div key={index} className="text-sm text-gray-700 mb-1">
              • {servico.tipo} ({servico.operacao}) - {servico.horarioEmbarque} às {servico.horarioTermino}
            </div>
          ))}
        </div>

        {/* Observações */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <label className="text-sm font-medium">📝 Observações:</label>
            {!editandoObservacoes && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setEditandoObservacoes(true)}
                className="text-xs px-2 py-1 h-6"
              >
                ✏️ Editar
              </Button>
            )}
          </div>
          
          {editandoObservacoes ? (
            <div className="space-y-2">
              <textarea
                className="w-full p-2 border border-gray-300 rounded text-sm"
                rows="3"
                value={observacoes}
                onChange={(e) => setObservacoes(e.target.value)}
                placeholder="Adicione observações sobre esta mensagem..."
              />
              <div className="flex gap-2">
                <Button
                  variant="default"
                  size="sm"
                  onClick={salvarObservacoes}
                  className="text-xs px-3 py-1 h-7"
                >
                  💾 Salvar
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setObservacoes(mensagem.observacoes || '');
                    setEditandoObservacoes(false);
                  }}
                  className="text-xs px-3 py-1 h-7"
                >
                  ❌ Cancelar
                </Button>
              </div>
            </div>
          ) : (
            <p className="text-sm text-gray-600 bg-gray-50 p-2 rounded">
              {mensagem.observacoes || 'Nenhuma observação adicionada'}
            </p>
          )}
        </div>

        {/* Datas importantes */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs text-gray-600">
          <div>
            <span className="font-medium">📅 Criada:</span><br />
            {formatarData(mensagem.dataCriacao)}
          </div>
          {mensagem.dataEnvio && (
            <div>
              <span className="font-medium">📤 Enviada:</span><br />
              {formatarData(mensagem.dataEnvio)}
            </div>
          )}
          {mensagem.dataConfirmacao && (
            <div>
              <span className="font-medium">✅ Confirmada:</span><br />
              {formatarData(mensagem.dataConfirmacao)}
            </div>
          )}
        </div>

        {/* Ações */}
        <div className="flex flex-wrap gap-2 pt-3 border-t border-gray-200">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setMostrarMensagem(!mostrarMensagem)}
          >
            👁️ {mostrarMensagem ? 'Ocultar' : 'Ver'} Mensagem
          </Button>

          {mensagem.status === 'pendente' && (
            <Button
              variant="default"
              size="sm"
              onClick={() => onAtualizarStatus(mensagem.id, 'enviada')}
              className="bg-blue-600 hover:bg-blue-700"
            >
              📤 Marcar como Enviada
            </Button>
          )}

          {mensagem.status === 'enviada' && (
            <Button
              variant="default"
              size="sm"
              onClick={() => onAtualizarStatus(mensagem.id, 'confirmada')}
              className="bg-green-600 hover:bg-green-700"
            >
              ✅ Marcar como Confirmada
            </Button>
          )}

          <Button
            variant="outline"
            size="sm"
            onClick={() => onEditar(mensagem.id, 'editar')}
          >
            ✏️ Editar
          </Button>

          <Button
            variant="destructive"
            size="sm"
            onClick={() => {
              if (confirm('Tem certeza que deseja excluir esta mensagem?')) {
                onExcluir(mensagem.id);
              }
            }}
          >
            🗑️ Excluir
          </Button>
        </div>

        {/* Mensagem completa */}
        {mostrarMensagem && (
          <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h4 className="font-medium text-blue-900 mb-2">📱 Mensagem para WhatsApp:</h4>
            <div className="bg-white p-3 rounded border text-sm whitespace-pre-wrap font-mono">
              {mensagem.mensagem}
            </div>
            <Button
              variant="outline"
              size="sm"
              className="mt-2"
              onClick={() => {
                navigator.clipboard.writeText(mensagem.mensagem);
                alert('Mensagem copiada para a área de transferência!');
              }}
            >
              📋 Copiar Mensagem
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default MensagemCard;

