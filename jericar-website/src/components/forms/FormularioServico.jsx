import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { ContatoEmergenciaService } from '../../services/ContatoEmergenciaService';
import { ValidationService } from '../../services/ValidationService';

const FormularioServico = ({ servico, onUpdate, onRemove, index, dataServicos }) => {
  const [contatoInfo, setContatoInfo] = useState(null);
  const [erros, setErros] = useState([]);

  // Atualizar contato de emergência quando horário ou data mudam
  useEffect(() => {
    if (servico.horarioEmbarque && dataServicos) {
      const info = ContatoEmergenciaService.determinarContato(servico.horarioEmbarque, dataServicos);
      setContatoInfo(info);
      
      if (info.tipo === 'automatico') {
        onUpdate(servico.id, 'contatoEmergencia', info.contato);
      }
    }
  }, [servico.horarioEmbarque, dataServicos]);

  // Validar serviço em tempo real
  useEffect(() => {
    const novosErros = ValidationService.validarServico(servico);
    setErros(novosErros);
  }, [servico]);

  const handleChange = (campo, valor) => {
    onUpdate(servico.id, campo, valor);
  };

  const handleTelefoneChange = (valor) => {
    const telefoneFormatado = ValidationService.formatarTelefone(valor);
    handleChange('contatoEmergencia', telefoneFormatado);
  };

  return (
    <div className="border border-gray-200 rounded-lg p-4 bg-gray-50 space-y-4">
      <div className="flex justify-between items-center">
        <h4 className="font-semibold text-lg">Serviço {index + 1}</h4>
        <Button
          variant="destructive"
          size="sm"
          onClick={() => onRemove(servico.id)}
        >
          🗑️ Remover
        </Button>
      </div>

      {erros.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3">
          <p className="text-red-800 font-medium text-sm">Erros encontrados:</p>
          <ul className="text-red-700 text-sm mt-1 list-disc list-inside">
            {erros.map((erro, i) => (
              <li key={i}>{erro}</li>
            ))}
          </ul>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-2">Tipo de Serviço *</label>
          <input
            type="text"
            className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
            value={servico.tipo}
            onChange={(e) => handleChange('tipo', e.target.value)}
            placeholder="Ex: Transfer, City Tour, Passeio"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-2">Operação</label>
          <select
            className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
            value={servico.operacao}
            onChange={(e) => handleChange('operacao', e.target.value)}
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
            onChange={(e) => handleChange('horarioEmbarque', e.target.value)}
          />
          {contatoInfo && (
            <p className="text-xs text-gray-600 mt-1">
              {ContatoEmergenciaService.obterDescricaoHorario(servico.horarioEmbarque, dataServicos)}
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Horário Término *</label>
          <input
            type="time"
            className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
            value={servico.horarioTermino}
            onChange={(e) => handleChange('horarioTermino', e.target.value)}
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Local Embarque *</label>
          <input
            type="text"
            className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
            value={servico.localEmbarque}
            onChange={(e) => handleChange('localEmbarque', e.target.value)}
            placeholder="Ex: Hotel, Aeroporto, Endereço"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Local Desembarque *</label>
          <input
            type="text"
            className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
            value={servico.localDesembarque}
            onChange={(e) => handleChange('localDesembarque', e.target.value)}
            placeholder="Ex: Hotel, Aeroporto, Endereço"
          />
        </div>

        {servico.operacao === 'compartilhado' && (
          <div>
            <label className="block text-sm font-medium mb-2">Prazo de Espera *</label>
            <input
              type="text"
              className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
              value={servico.prazoEspera}
              onChange={(e) => handleChange('prazoEspera', e.target.value)}
              placeholder="Ex: 15 minutos"
            />
          </div>
        )}

        <div className={servico.operacao === 'compartilhado' ? '' : 'md:col-span-2'}>
          <label className="block text-sm font-medium mb-2">Contato Emergência *</label>
          
          {contatoInfo && contatoInfo.tipo === 'automatico' && (
            <div className="mb-2 p-2 bg-green-50 border border-green-200 rounded text-sm">
              <p className="text-green-800">
                ✅ Contato definido automaticamente: {contatoInfo.motivo}
              </p>
            </div>
          )}

          {contatoInfo && contatoInfo.tipo === 'selecionar' && (
            <div className="mb-2 p-2 bg-yellow-50 border border-yellow-200 rounded text-sm">
              <p className="text-yellow-800">
                ⚠️ {contatoInfo.motivo}
              </p>
              <div className="mt-2 space-y-1">
                {contatoInfo.opcoes.map((opcao, i) => (
                  <button
                    key={i}
                    type="button"
                    className="block w-full text-left p-2 bg-white border border-gray-300 rounded hover:bg-gray-50 text-sm"
                    onClick={() => handleChange('contatoEmergencia', opcao.telefone)}
                  >
                    {opcao.nome}: {opcao.telefone}
                  </button>
                ))}
              </div>
            </div>
          )}

          <input
            type="text"
            className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
            value={servico.contatoEmergencia}
            onChange={(e) => handleTelefoneChange(e.target.value)}
            placeholder="+55 88 98183-2294"
          />
        </div>
      </div>
    </div>
  );
};

export default FormularioServico;

