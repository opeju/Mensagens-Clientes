import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import FormularioServicoComAutocomplete from '../components/forms/FormularioServicoComAutocomplete';
import { ValidationService } from '../services/ValidationService';
import { MensagemService } from '../services/MensagemService';
import { MensagensSalvasServiceAprimorado } from '../services/MensagensSalvasServiceAprimorado';

const GeradorMensagensAprimorado = () => {
  const [clienteData, setClienteData] = useState({
    nome: '',
    numeroReserva: '',
    quantidadePessoas: 1,
    dataServicos: ''
  });

  const [servicos, setServicos] = useState([]);
  const [mensagemGerada, setMensagemGerada] = useState('');
  const [errosCliente, setErrosCliente] = useState([]);
  const [estatisticas, setEstatisticas] = useState(null);

  // Validar dados do cliente em tempo real
  useEffect(() => {
    const erros = ValidationService.validarCliente(clienteData);
    setErrosCliente(erros);
  }, [clienteData]);

  // Atualizar estatísticas da mensagem
  useEffect(() => {
    if (mensagemGerada) {
      const stats = MensagemService.obterEstatisticas(mensagemGerada);
      setEstatisticas(stats);
    }
  }, [mensagemGerada]);

  const adicionarServico = (e) => {
    e?.preventDefault();
    
    const novoServico = {
      id: Date.now(),
      tipo: '',
      horarioEmbarque: '',
      horarioTermino: '',
      localEmbarque: '',
      localDesembarque: '',
      operacao: 'privativo',
      prazoEspera: '',
      contatoEmergencia: ''
    };
    setServicos([...servicos, novoServico]);
  };

  const atualizarServico = (id, campo, valor) => {
    setServicos(servicos.map(servico => 
      servico.id === id ? { ...servico, [campo]: valor } : servico
    ));
  };

  const removerServico = (id) => {
    setServicos(servicos.filter(servico => servico.id !== id));
  };

  const salvarMensagem = (e) => {
    e?.preventDefault();
    
    if (!mensagemGerada) {
      alert('Gere uma mensagem primeiro antes de salvar');
      return;
    }

    try {
      const mensagemSalva = MensagensSalvasServiceAprimorado.salvarMensagem(
        clienteData,
        servicos,
        mensagemGerada
      );
      
      alert(`Mensagem salva com sucesso! ID: ${mensagemSalva.id}`);
      
      // Opcionalmente, limpar o formulário após salvar
      if (confirm('Deseja limpar o formulário para criar uma nova mensagem?')) {
        setClienteData({
          nome: '',
          numeroReserva: '',
          dataServicos: '',
          quantidadePessoas: 1
        });
        setServicos([]);
        setMensagemGerada('');
      }
    } catch (error) {
      console.error('Erro ao salvar mensagem:', error);
      alert('Erro ao salvar mensagem');
    }
  };

  const gerarMensagem = (e) => {
    e?.preventDefault();
    
    if (!MensagemService.podeGerarMensagem(clienteData, servicos)) {
      alert('Por favor, preencha todos os campos obrigatórios e corrija os erros');
      return;
    }

    const mensagem = MensagemService.gerarMensagem(clienteData, servicos);
    setMensagemGerada(mensagem);
  };

  const copiarMensagem = async (e) => {
    e?.preventDefault();
    
    try {
      await navigator.clipboard.writeText(mensagemGerada);
      alert('Mensagem copiada para a área de transferência!');
    } catch (err) {
      console.error('Erro ao copiar:', err);
      alert('Erro ao copiar mensagem');
    }
  };

  const podeGerar = MensagemService.podeGerarMensagem(clienteData, servicos);
  const preview = MensagemService.gerarPreview(clienteData, servicos);

  return (
    <div className="space-y-6">
      {/* Preview da mensagem */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-blue-600 font-medium">Preview da Mensagem:</p>
              <p className="text-blue-800">{preview}</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-blue-600">Status:</p>
              <p className={`font-medium ${podeGerar ? 'text-green-600' : 'text-orange-600'}`}>
                {podeGerar ? '✅ Pronta para gerar' : '⏳ Dados incompletos'}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Dados do Cliente */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            👤 Dados do Cliente
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {errosCliente.length > 0 && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-red-800 font-medium text-sm">Erros nos dados do cliente:</p>
              <ul className="text-red-700 text-sm mt-1 list-disc list-inside">
                {errosCliente.map((erro, i) => (
                  <li key={i}>{erro}</li>
                ))}
              </ul>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Nome Completo *</label>
              <input
                type="text"
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={clienteData.nome}
                onChange={(e) => setClienteData({...clienteData, nome: e.target.value})}
                placeholder="Digite o nome completo do cliente"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Número da Reserva *</label>
              <input
                type="text"
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={clienteData.numeroReserva}
                onChange={(e) => setClienteData({...clienteData, numeroReserva: e.target.value.toUpperCase()})}
                placeholder="Ex: RES123456"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Data dos Serviços *</label>
              <input
                type="date"
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={clienteData.dataServicos}
                onChange={(e) => setClienteData({...clienteData, dataServicos: e.target.value})}
                min={new Date().toISOString().split('T')[0]}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Quantidade de Pessoas *</label>
              <input
                type="number"
                min="1"
                max="50"
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={clienteData.quantidadePessoas}
                onChange={(e) => {
                  const valor = e.target.value;
                  const numeroValido = valor === '' ? 1 : Math.max(1, Math.min(50, parseInt(valor, 10) || 1));
                  setClienteData({...clienteData, quantidadePessoas: numeroValido});
                }}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Serviços */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              🚐 Serviços ({servicos.length})
            </span>
            <Button onClick={adicionarServico} className="bg-green-600 hover:bg-green-700">
              ➕ Adicionar Serviço
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {servicos.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <div className="text-4xl mb-4">🚐</div>
              <p className="text-lg">Nenhum serviço adicionado ainda</p>
              <p className="text-sm">Clique em "Adicionar Serviço" para começar</p>
            </div>
          ) : (
            <div className="space-y-4">
              {servicos.map((servico, index) => (
                <FormularioServicoComAutocomplete
                  key={servico.id}
                  servico={servico}
                  index={index}
                  dataServicos={clienteData.dataServicos}
                  onUpdate={atualizarServico}
                  onRemove={removerServico}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Botões Gerar e Salvar Mensagem */}
      <div className="flex justify-center gap-4">
        <Button 
          onClick={gerarMensagem}
          className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-3 text-lg"
          disabled={!podeGerar}
        >
          ✨ Gerar Mensagem
        </Button>
        
        {mensagemGerada && (
          <Button 
            onClick={salvarMensagem}
            variant="outline"
            className="border-green-600 text-green-600 hover:bg-green-50 px-8 py-3 text-lg"
          >
            💾 Salvar Mensagem
          </Button>
        )}
      </div>

      {/* Mensagem Gerada */}
      {mensagemGerada && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                💬 Mensagem Gerada
              </span>
              {estatisticas && (
                <div className="text-sm text-gray-600">
                  {estatisticas.caracteres} caracteres • {estatisticas.palavras} palavras
                </div>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-gray-100 p-4 rounded-lg mb-4 max-h-96 overflow-y-auto">
              <pre className="whitespace-pre-wrap font-mono text-sm">{mensagemGerada}</pre>
            </div>
            
            {estatisticas && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4 text-center">
                <div className="bg-blue-50 p-3 rounded">
                  <div className="text-lg font-bold text-blue-600">{estatisticas.caracteres}</div>
                  <div className="text-sm text-blue-800">Caracteres</div>
                </div>
                <div className="bg-green-50 p-3 rounded">
                  <div className="text-lg font-bold text-green-600">{estatisticas.palavras}</div>
                  <div className="text-sm text-green-800">Palavras</div>
                </div>
                <div className="bg-purple-50 p-3 rounded">
                  <div className="text-lg font-bold text-purple-600">{estatisticas.linhas}</div>
                  <div className="text-sm text-purple-800">Linhas</div>
                </div>
                <div className="bg-orange-50 p-3 rounded">
                  <div className="text-lg font-bold text-orange-600">{estatisticas.estimativaWhatsApp}</div>
                  <div className="text-sm text-orange-800">SMS Est.</div>
                </div>
              </div>
            )}

            <div className="flex gap-4">
              <Button
                onClick={copiarMensagem}
                className="bg-green-600 hover:bg-green-700"
              >
                📋 Copiar Mensagem
              </Button>
              <Button
                onClick={salvarMensagem}
                variant="outline"
                className="border-blue-600 text-blue-600 hover:bg-blue-50"
              >
                💾 Salvar Mensagem
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default GeradorMensagensAprimorado;

