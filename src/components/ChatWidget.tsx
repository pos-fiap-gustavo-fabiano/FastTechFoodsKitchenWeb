
import { useState, useRef, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { MessageCircle, X, Send } from "lucide-react";
import { useChat } from '@/hooks/useChat';

const ChatWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [inputText, setInputText] = useState('');
  const { messages, isTyping, handleOptionClick, handleTextInput } = useChat();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isTyping, isOpen]);

  const handleSendMessage = () => {
    if (inputText.trim()) {
      handleTextInput(inputText.trim());
      setInputText('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSendMessage();
    }
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {/* Chat Button */}
      {!isOpen && (
        <Button
          onClick={() => setIsOpen(true)}
          className="h-14 w-14 rounded-full bg-gradient-to-r from-red-600 to-yellow-500 hover:from-red-700 hover:to-yellow-600 shadow-lg hover:shadow-xl transition-all duration-300 animate-pulse"
        >
          <MessageCircle className="h-6 w-6 text-white" />
        </Button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <Card className="w-80 h-96 shadow-2xl animate-scale-in">
          <CardHeader className="bg-gradient-to-r from-red-600 to-yellow-500 text-white p-4 rounded-t-lg">
            <div className="flex justify-between items-center">
              <CardTitle className="text-lg font-bold">
                FastTech Chat 💬
              </CardTitle>
              <Button
                onClick={() => setIsOpen(false)}
                variant="ghost"
                size="sm"
                className="text-white hover:bg-white/20 h-8 w-8 p-0"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>

          <CardContent className="p-0 h-full flex flex-col">
            {/* Messages Area */}
            <div 
              ref={chatContainerRef}
              className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50"
              style={{ maxHeight: '240px' }}
            >
              {messages.map((message) => (
                <div key={message.id}>
                  <div
                    className={`flex ${
                      message.type === 'user' ? 'justify-end' : 'justify-start'
                    }`}
                  >
                    <div
                      className={`max-w-[75%] p-3 rounded-lg text-sm ${
                        message.type === 'user'
                          ? 'bg-gradient-to-r from-red-600 to-yellow-500 text-white'
                          : 'bg-white text-gray-800 shadow-sm border'
                      }`}
                    >
                      <div className="whitespace-pre-wrap">{message.text}</div>
                    </div>
                  </div>

                  {/* Options Buttons */}
                  {message.options && message.options.length > 0 && (
                    <div className="mt-2 space-y-1">
                      {message.options.map((option) => (
                        <Button
                          key={option.id}
                          onClick={() => handleOptionClick(option.action, option.text)}
                          variant="outline"
                          size="sm"
                          className="w-full justify-start text-left hover:bg-gray-100 text-sm py-2 h-auto"
                        >
                          {option.emoji && <span className="mr-2">{option.emoji}</span>}
                          {option.text}
                        </Button>
                      ))}
                    </div>
                  )}
                </div>
              ))}

              {/* Typing Indicator */}
              {isTyping && (
                <div className="flex justify-start">
                  <div className="bg-white text-gray-800 shadow-sm border p-3 rounded-lg">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-3 border-t bg-white">
              <div className="flex space-x-2">
                <Input
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Digite sua mensagem..."
                  className="flex-1"
                />
                <Button
                  onClick={handleSendMessage}
                  size="sm"
                  className="bg-gradient-to-r from-red-600 to-yellow-500 hover:from-red-700 hover:to-yellow-600"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ChatWidget;
