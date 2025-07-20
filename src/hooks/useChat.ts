
import { useState } from 'react';

export type MessageType = 'user' | 'bot';

export interface ChatMessage {
  id: string;
  text: string;
  type: MessageType;
  timestamp: Date;
  options?: ChatOption[];
}

export interface ChatOption {
  id: string;
  text: string;
  action: string;
  emoji?: string;
}

export const useChat = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      text: 'Olá! Seja bem-vindo ao FastTech Foods! Como podemos ajudar hoje? 😊',
      type: 'bot',
      timestamp: new Date(),
      options: [
        { id: 'cardapio', text: 'Ver Cardápio', action: 'ver-cardapio', emoji: '🍔' },
        { id: 'acompanhar', text: 'Acompanhar Pedido', action: 'acompanhar-pedido', emoji: '📋' },
        { id: 'novo-pedido', text: 'Fazer Novo Pedido', action: 'fazer-novo-pedido', emoji: '🛒' },
        { id: 'problemas', text: 'Problemas com o Pedido', action: 'problemas-com-o-pedido', emoji: '❗' },
        { id: 'atendente', text: 'Falar com Atendente', action: 'falar-com-atendente', emoji: '👨‍💼' }
      ]
    }
  ]);

  const [isTyping, setIsTyping] = useState(false);
  const [currentFlow, setCurrentFlow] = useState<string | null>(null);

  const addMessage = (text: string, type: MessageType, options?: ChatOption[]) => {
    const newMessage: ChatMessage = {
      id: Date.now().toString(),
      text,
      type,
      timestamp: new Date(),
      options
    };
    
    setMessages(prev => [...prev, newMessage]);
  };

  const simulateTyping = () => {
    setIsTyping(true);
    setTimeout(() => {
      setIsTyping(false);
    }, 1500);
  };

  const handleOptionClick = (action: string, optionText: string) => {
    // Adiciona mensagem do usuário
    addMessage(optionText, 'user');
    
    simulateTyping();
    
    setTimeout(() => {
      handleBotResponse(action);
    }, 1500);
  };

  const handleBotResponse = (action: string) => {
    switch (action) {
      case 'ver-cardapio':
        addMessage('Aqui está nosso cardápio completo! Você pode navegar pelas categorias:', 'bot', [
          { id: 'lanches', text: 'Hambúrgueres', action: 'cardapio-lanches', emoji: '🍔' },
          { id: 'bebidas', text: 'Bebidas', action: 'cardapio-bebidas', emoji: '🥤' },
          { id: 'sobremesas', text: 'Sobremesas', action: 'cardapio-sobremesas', emoji: '🍰' },
          { id: 'volta-menu', text: 'Voltar ao Menu Principal', action: 'menu-principal', emoji: '🏠' }
        ]);
        break;

      case 'acompanhar-pedido':
        addMessage('Para acompanhar seu pedido, digite o número do pedido (ex: ORD-1234567890):', 'bot');
        setCurrentFlow('tracking');
        break;

      case 'fazer-novo-pedido':
        addMessage('Ótimo! Você prefere retirar na loja ou receber no seu endereço?', 'bot', [
          { id: 'retirar', text: 'Retirar na Loja', action: 'pedido-retirar', emoji: '🏪' },
          { id: 'delivery', text: 'Entrega em Domicílio', action: 'pedido-delivery', emoji: '🚗' },
          { id: 'drive', text: 'Drive-thru', action: 'pedido-drive', emoji: '🚙' }
        ]);
        break;

      case 'problemas-com-o-pedido':
        addMessage('Sinto muito pelos problemas! Como posso ajudar?', 'bot', [
          { id: 'atraso', text: 'Pedido Atrasado', action: 'problema-atraso', emoji: '⏰' },
          { id: 'erro-pedido', text: 'Erro no Pedido', action: 'problema-erro', emoji: '❌' },
          { id: 'cancelar', text: 'Cancelar Pedido', action: 'problema-cancelar', emoji: '🚫' },
          { id: 'atendente-problema', text: 'Falar com Atendente', action: 'falar-com-atendente', emoji: '👨‍💼' }
        ]);
        break;

      case 'falar-com-atendente':
        addMessage('Você será conectado com um de nossos atendentes em instantes! ⏳\n\nTempo estimado de espera: 2 minutos\n\nEnquanto isso, posso ajudar com algo específico?', 'bot', [
          { id: 'volta-menu', text: 'Voltar ao Menu Principal', action: 'menu-principal', emoji: '🏠' }
        ]);
        break;

      case 'pedido-delivery':
        addMessage('Por favor, digite seu CEP para verificarmos a área de entrega e o tempo estimado:', 'bot');
        setCurrentFlow('cep');
        break;

      case 'pedido-retirar':
      case 'pedido-drive':
        addMessage('Perfeito! O que gostaria de pedir hoje? Temos nossos combos especiais, hambúrgueres, acompanhamentos e bebidas.', 'bot', [
          { id: 'combos', text: 'Ver Combos', action: 'ver-combos', emoji: '🍔🍟' },
          { id: 'hamburguer', text: 'Ver Hambúrgueres', action: 'ver-hamburgueres', emoji: '🍔' },
          { id: 'bebidas', text: 'Ver Bebidas', action: 'ver-bebidas', emoji: '🥤' }
        ]);
        break;

      case 'ver-combos':
        addMessage('Confira nossos combos! Qual combo você gostaria de adicionar ao seu pedido?', 'bot', [
          { id: 'combo1', text: 'Combo Big Burger (R$ 24,90)', action: 'add-combo1', emoji: '🍔' },
          { id: 'combo2', text: 'Combo Chicken Supreme (R$ 22,90)', action: 'add-combo2', emoji: '🐔' },
          { id: 'combo3', text: 'Combo Vegetariano (R$ 19,90)', action: 'add-combo3', emoji: '🥗' },
          { id: 'voltar-pedido', text: 'Voltar', action: 'fazer-novo-pedido', emoji: '⬅️' }
        ]);
        break;

      case 'menu-principal':
        addMessage('Como posso ajudar você hoje?', 'bot', [
          { id: 'cardapio', text: 'Ver Cardápio', action: 'ver-cardapio', emoji: '🍔' },
          { id: 'acompanhar', text: 'Acompanhar Pedido', action: 'acompanhar-pedido', emoji: '📋' },
          { id: 'novo-pedido', text: 'Fazer Novo Pedido', action: 'fazer-novo-pedido', emoji: '🛒' },
          { id: 'problemas', text: 'Problemas com o Pedido', action: 'problemas-com-o-pedido', emoji: '❗' },
          { id: 'atendente', text: 'Falar com Atendente', action: 'falar-com-atendente', emoji: '👨‍💼' }
        ]);
        setCurrentFlow(null);
        break;

      default:
        addMessage('Desculpe, não entendi. Posso ajudar com algo específico?', 'bot', [
          { id: 'volta-menu', text: 'Voltar ao Menu Principal', action: 'menu-principal', emoji: '🏠' }
        ]);
    }
  };

  const handleTextInput = (text: string) => {
    addMessage(text, 'user');
    
    simulateTyping();
    
    setTimeout(() => {
      if (currentFlow === 'tracking') {
        if (text.toUpperCase().startsWith('ORD-')) {
          addMessage(`Encontrei seu pedido ${text}! 📋\n\nStatus: Em Preparo 👨‍🍳\nTempo estimado: 15 minutos\nForma de entrega: Delivery\n\nDeseja mais alguma coisa?`, 'bot', [
            { id: 'volta-menu', text: 'Voltar ao Menu Principal', action: 'menu-principal', emoji: '🏠' }
          ]);
        } else {
          addMessage('Por favor, digite um número de pedido válido (ex: ORD-1234567890):', 'bot');
        }
      } else if (currentFlow === 'cep') {
        if (text.length === 8 || (text.length === 9 && text.includes('-'))) {
          addMessage(`Área de entrega confirmada! ✅\nTempo estimado: 25-35 minutos\nTaxa de entrega: R$ 5,90\n\nO que gostaria de pedir hoje?`, 'bot', [
            { id: 'combos', text: 'Ver Combos', action: 'ver-combos', emoji: '🍔🍟' },
            { id: 'hamburguer', text: 'Ver Hambúrgueres', action: 'ver-hamburgueres', emoji: '🍔' },
            { id: 'bebidas', text: 'Ver Bebidas', action: 'ver-bebidas', emoji: '🥤' }
          ]);
          setCurrentFlow(null);
        } else {
          addMessage('Por favor, digite um CEP válido (ex: 12345-678):', 'bot');
        }
      } else {
        addMessage('Obrigado pela mensagem! Como posso ajudar?', 'bot', [
          { id: 'volta-menu', text: 'Voltar ao Menu Principal', action: 'menu-principal', emoji: '🏠' }
        ]);
      }
    }, 1500);
  };

  return {
    messages,
    isTyping,
    handleOptionClick,
    handleTextInput
  };
};
