import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const GeradorMensagens = () => {
  const [clienteData, setClienteData] = useState({
    nome: '',
    numeroReserva: '',
    quantidadePessoas: 1,
    dataServicos: ''
  });

  const [servicos, setServicos] = useState([]);
  const [mensagemGerada, setMensagemGerada] = useState('');

  const adicionarServico = () => {
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

  const gerarMensagem = () => {
    if (!clienteData.nome || !clienteData.numeroReserva || servicos.length === 0) {
      alert('Por favor, preencha todos os campos obrigatórios');
      return;
    }

    const formatarData = (data) => {
      const [ano, mes, dia] = data.split('-');
      return `${dia}/${mes}/${ano}`;
    };

    const servicosTexto = servicos.map(servico => `
🚐 *${servico.tipo.toUpperCase()}*
• Embarque: ${servico.horarioEmbarque} - ${servico.localEmbarque}
• Término: ${servico.horarioTermino} - ${servico.localDesembarque}
• Operação: ${servico.operacao}${servico.prazoEspera ? `\n• Prazo de espera: ${servico.prazoEspera}` : ''}
• Emergência: ${servico.contatoEmergencia}
    `).join('');

    const mensagem = `
🌟 *JERICAR VIAGENS* 🌟

Olá, ${clienteData.nome}! 

Preciso que confirme URGENTEMENTE os dados dos seus serviços:

📋 *DADOS DA RESERVA:*
• Reserva: ${clienteData.numeroReserva}
• Data: ${formatarData(clienteData.dataServicos)}
• Passageiros: ${clienteData.quantidadePessoas}
${servicosTexto}
Por favor, responda:
✅ *SIM* - se as informações estão corretas
❌ *NÃO* - se precisa de alterações

Aguardo sua confirmação! 🙏
    `.trim();

    setMensagemGerada(mensagem);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            👤 Dados do Cliente
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
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
                onChange={(e) => setClienteData({...clienteData, numeroReserva: e.target.value})}
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
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Quantidade de Pessoas *</label>
              <input
                type="number"
                min="1"
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={clienteData.quantidadePessoas}
                onChange={(e) => setClienteData({...clienteData, quantidadePessoas: parseInt(e.target.value)})}
              />
            </div>
          </div>
        </CardContent>
      </Card>

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
              <p>Nenhum serviço adicionado ainda.</p>
              <p className="text-sm">Clique em "Adicionar Serviço" para começar.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {servicos.map((servico, index) => (
                <div key={servico.id} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                  <h4 className="font-semibold mb-3">Serviço {index + 1}</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Tipo de Serviço *</label>
                      <input
                        type="text"
                        className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                        value={servico.tipo}
                        onChange={(e) => {
                          const novosServicos = servicos.map(s => 
                            s.id === servico.id ? {...s, tipo: e.target.value} : s
                          );
                          setServicos(novosServicos);
                        }}
                        placeholder="Ex: Transfer, City Tour, Passeio"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Operação</label>
                      <select
                        className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                        value={servico.operacao}
                        onChange={(e) => {
                          const novosServicos = servicos.map(s => 
                            s.id === servico.id ? {...s, operacao: e.target.value} : s
                          );
                          setServicos(novosServicos);
                        }}
                      >
                        <option value="privativo">Privativo</option>
                        <option value="compartilhado">Compartilhado</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Horário Embarque *</label>
                      <input
                        type="time"
                        className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                        value={servico.horarioEmbarque}
                        onChange={(e) => {
                          const novosServicos = servicos.map(s => 
                            s.id === servico.id ? {...s, horarioEmbarque: e.target.value} : s
                          );
                          setServicos(novosServicos);
                        }}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Horário Término *</label>
                      <input
                        type="time"
                        className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                        value={servico.horarioTermino}
                        onChange={(e) => {
                          const novosServicos = servicos.map(s => 
                            s.id === servico.id ? {...s, horarioTermino: e.target.value} : s
                          );
                          setServicos(novosServicos);
                        }}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Local Embarque *</label>
                      <input
                        type="text"
                        className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                        value={servico.localEmbarque}
                        onChange={(e) => {
                          const novosServicos = servicos.map(s => 
                            s.id === servico.id ? {...s, localEmbarque: e.target.value} : s
                          );
                          setServicos(novosServicos);
                        }}
                        placeholder="Ex: Hotel, Aeroporto, Endereço"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Local Desembarque *</label>
                      <input
                        type="text"
                        className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                        value={servico.localDesembarque}
                        onChange={(e) => {
                          const novosServicos = servicos.map(s => 
                            s.id === servico.id ? {...s, localDesembarque: e.target.value} : s
                          );
                          setServicos(novosServicos);
                        }}
                        placeholder="Ex: Hotel, Aeroporto, Endereço"
                      />
                    </div>
                    {servico.operacao === 'compartilhado' && (
                      <div>
                        <label className="block text-sm font-medium mb-2">Prazo de Espera</label>
                        <input
                          type="text"
                          className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                          value={servico.prazoEspera}
                          onChange={(e) => {
                            const novosServicos = servicos.map(s => 
                              s.id === servico.id ? {...s, prazoEspera: e.target.value} : s
                            );
                            setServicos(novosServicos);
                          }}
                          placeholder="Ex: 15 minutos"
                        />
                      </div>
                    )}
                    <div>
                      <label className="block text-sm font-medium mb-2">Contato Emergência *</label>
                      <input
                        type="text"
                        className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                        value={servico.contatoEmergencia}
                        onChange={(e) => {
                          const novosServicos = servicos.map(s => 
                            s.id === servico.id ? {...s, contatoEmergencia: e.target.value} : s
                          );
                          setServicos(novosServicos);
                        }}
                        placeholder="+55 88 98183-2294"
                      />
                    </div>
                  </div>
                  <div className="mt-4 flex justify-end">
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => {
                        const novosServicos = servicos.filter(s => s.id !== servico.id);
                        setServicos(novosServicos);
                      }}
                    >
                      🗑️ Remover
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <div className="flex justify-center">
        <Button 
          onClick={gerarMensagem}
          className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-3 text-lg"
          disabled={!clienteData.nome || !clienteData.numeroReserva || servicos.length === 0}
        >
          ✨ Gerar Mensagem
        </Button>
      </div>

      {mensagemGerada && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              💬 Mensagem Gerada
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-gray-100 p-4 rounded-lg mb-4">
              <pre className="whitespace-pre-wrap font-mono text-sm">{mensagemGerada}</pre>
            </div>
            <div className="flex gap-4">
              <Button
                onClick={() => navigator.clipboard.writeText(mensagemGerada)}
                className="bg-green-600 hover:bg-green-700"
              >
                📋 Copiar Mensagem
              </Button>
              <Button
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

export default GeradorMensagens;

