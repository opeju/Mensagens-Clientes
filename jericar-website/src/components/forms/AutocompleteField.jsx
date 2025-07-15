import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { HistoricoService } from '../../services/HistoricoService';

const AutocompleteField = ({ 
  label, 
  value, 
  onChange, 
  placeholder, 
  tipo, 
  required = false,
  className = "" 
}) => {
  const [sugestoes, setSugestoes] = useState([]);
  const [mostrarSugestoes, setMostrarSugestoes] = useState(false);
  const [mostrarHistorico, setMostrarHistorico] = useState(false);
  const [indiceSelecionado, setIndiceSelecionado] = useState(-1);
  const inputRef = useRef(null);
  const sugestoesRef = useRef(null);

  // Buscar sugestões quando o valor muda
  useEffect(() => {
    if (value && value.length > 0) {
      const novasSugestoes = HistoricoService.buscarSugestoes(tipo, value, 5);
      setSugestoes(novasSugestoes);
      setMostrarSugestoes(novasSugestoes.length > 0);
    } else {
      setSugestoes([]);
      setMostrarSugestoes(false);
    }
    setIndiceSelecionado(-1);
  }, [value, tipo]);

  // Fechar sugestões quando clicar fora
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (sugestoesRef.current && !sugestoesRef.current.contains(event.target) &&
          inputRef.current && !inputRef.current.contains(event.target)) {
        setMostrarSugestoes(false);
        setMostrarHistorico(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleInputChange = (e) => {
    onChange(e.target.value);
  };

  const handleInputFocus = () => {
    if (value && value.length > 0) {
      const novasSugestoes = HistoricoService.buscarSugestoes(tipo, value, 5);
      setSugestoes(novasSugestoes);
      setMostrarSugestoes(novasSugestoes.length > 0);
    }
  };

  const handleKeyDown = (e) => {
    if (!mostrarSugestoes || sugestoes.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setIndiceSelecionado(prev => 
          prev < sugestoes.length - 1 ? prev + 1 : 0
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setIndiceSelecionado(prev => 
          prev > 0 ? prev - 1 : sugestoes.length - 1
        );
        break;
      case 'Enter':
        e.preventDefault();
        if (indiceSelecionado >= 0) {
          selecionarSugestao(sugestoes[indiceSelecionado]);
        }
        break;
      case 'Escape':
        setMostrarSugestoes(false);
        setMostrarHistorico(false);
        break;
    }
  };

  const selecionarSugestao = (sugestao) => {
    onChange(sugestao);
    setMostrarSugestoes(false);
    setMostrarHistorico(false);
    inputRef.current?.focus();
  };

  const salvarNoHistorico = () => {
    if (value && value.trim().length >= 2) {
      HistoricoService.salvarItem(tipo, value);
      alert('Item salvo no histórico!');
    } else {
      alert('Digite pelo menos 2 caracteres para salvar');
    }
  };

  const mostrarHistoricoCompleto = () => {
    const historicoCompleto = HistoricoService.obterHistorico(tipo)
      .sort((a, b) => b.frequencia - a.frequencia)
      .slice(0, 10)
      .map(item => item.valor);
    
    setSugestoes(historicoCompleto);
    setMostrarHistorico(true);
    setMostrarSugestoes(true);
  };

  const estatisticas = HistoricoService.obterEstatisticas(tipo);

  return (
    <div className={`relative ${className}`}>
      <div className="flex items-center justify-between mb-2">
        <label className="block text-sm font-medium">
          {label} {required && '*'}
        </label>
        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={salvarNoHistorico}
            className="text-xs px-2 py-1 h-6"
            disabled={!value || value.trim().length < 2}
          >
            💾 Salvar
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={mostrarHistoricoCompleto}
            className="text-xs px-2 py-1 h-6"
          >
            📋 Histórico ({estatisticas.total})
          </Button>
        </div>
      </div>

      <input
        ref={inputRef}
        type="text"
        className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        value={value}
        onChange={handleInputChange}
        onFocus={handleInputFocus}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        autoComplete="off"
      />

      {/* Sugestões */}
      {(mostrarSugestoes && sugestoes.length > 0) && (
        <div 
          ref={sugestoesRef}
          className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto"
        >
          {mostrarHistorico && (
            <div className="px-3 py-2 bg-blue-50 border-b border-blue-200 text-sm text-blue-800">
              📋 Histórico - {estatisticas.total} itens salvos
              {estatisticas.maisUsado && (
                <span className="block text-xs">
                  Mais usado: {estatisticas.maisUsado}
                </span>
              )}
            </div>
          )}
          
          {sugestoes.map((sugestao, index) => (
            <button
              key={index}
              type="button"
              className={`w-full text-left px-3 py-2 hover:bg-gray-50 border-b border-gray-100 last:border-b-0 ${
                index === indiceSelecionado ? 'bg-blue-50 text-blue-700' : ''
              }`}
              onClick={() => selecionarSugestao(sugestao)}
            >
              <div className="flex items-center justify-between">
                <span>{sugestao}</span>
                {mostrarHistorico && (
                  <span className="text-xs text-gray-500">
                    {HistoricoService.obterHistorico(tipo)
                      .find(item => item.valor === sugestao)?.frequencia || 0}x
                  </span>
                )}
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Informações do histórico */}
      {estatisticas.total > 0 && (
        <div className="mt-1 text-xs text-gray-500">
          {estatisticas.total} itens no histórico • {estatisticas.totalUsos} usos totais
        </div>
      )}
    </div>
  );
};

export default AutocompleteField;

