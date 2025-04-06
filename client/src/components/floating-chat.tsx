import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, X, Settings, Send, CornerDownLeft, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { useSettingsStore } from '@/store/dataStore';
import { generateChatCompletion } from '@/lib/openai';

type Message = {
  id: string;
  content: string;
  sender: 'user' | 'assistant';
  timestamp: Date;
  role?: 'user' | 'assistant' | 'system';
};

export function FloatingChat() {
  const { toast } = useToast();
  const { settings, updateSettings } = useSettingsStore();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      content: 'Olá! Como posso ajudar você hoje?',
      sender: 'assistant',
      role: 'assistant',
      timestamp: new Date(),
    },
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [localApiKey, setLocalApiKey] = useState('');

  // Carrega a chave da API e o ID do assistente
  useEffect(() => {
    setLocalApiKey(settings.openaiApiKey || '');
    // Verificar se tem um ID do assistente configurado para o chat flutuante
    const chatAssistantId = settings.chatBubbleAssistantId || localStorage.getItem('chat_bubble_assistant_id');
    if (chatAssistantId) {
      console.log('Chat flutuante usando assistente ID:', chatAssistantId);
    }
  }, [settings.openaiApiKey, settings.chatBubbleAssistantId]);

  const saveSettings = () => {
    updateSettings({ openaiApiKey: localApiKey });
    toast({
      title: "Configurações salvas",
      description: "A chave da API foi salva com sucesso",
    });
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;
    if (!settings.openaiApiKey) {
      toast({
        title: "API não configurada",
        description: "Configure sua API Key nas configurações",
        variant: "destructive",
      });
      return;
    }

    // Adiciona mensagem do usuário
    const newMessage: Message = {
      id: Date.now().toString(),
      content: inputValue,
      sender: 'user',
      role: 'user',
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, newMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      // Prepara as mensagens para a API
      const apiMessages = messages
        .concat(newMessage)
        .map(msg => ({
          role: msg.role || (msg.sender === 'user' ? 'user' : 'assistant'),
          content: msg.content
        }));

      // Adiciona uma mensagem de sistema para contexto
      apiMessages.unshift({
        role: 'system',
        content: 'Você é um assistente útil em um sistema de produtividade com estilo terminal minimalista. Fale em português brasileiro. Forneça respostas diretas e ajuda prática.'
      });

      // Verificar se temos um ID de assistente configurado
      const assistantId = settings.chatBubbleAssistantId || localStorage.getItem('chat_bubble_assistant_id');

      // Chama a API
      const response = await generateChatCompletion(
        apiMessages, 
        settings.openaiApiKey || undefined, 
        assistantId || undefined
      );

      if (response.success && response.content) {
        const assistantResponse: Message = {
          id: (Date.now() + 1).toString(),
          content: response.content,
          sender: 'assistant',
          role: 'assistant',
          timestamp: new Date(),
        };
        setMessages(prev => [...prev, assistantResponse]);
      } else {
        throw new Error(response.error || 'Erro ao obter resposta');
      }
    } catch (error) {
      console.error("Erro ao processar mensagem:", error);
      toast({
        title: "Erro na comunicação",
        description: error instanceof Error ? error.message : "Erro desconhecido",
        variant: "destructive",
      });
      
      // Adiciona mensagem de erro do assistente
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: "Desculpe, não consegui processar sua mensagem. Por favor, tente novamente mais tarde.",
        sender: 'assistant',
        role: 'assistant',
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <>
      {/* Botão flutuante */}
      <div className="fixed bottom-6 right-6 z-50">
        <Button
          onClick={() => setIsOpen(!isOpen)}
          className={`rounded-full w-14 h-14 shadow-lg transition-all ${
            isOpen ? 'bg-red-500 hover:bg-red-600' : 'bg-black border border-terminal hover:bg-[#111]'
          }`}
        >
          {isOpen ? (
            <X className="h-6 w-6" />
          ) : (
            <MessageSquare className="h-6 w-6 text-terminal" />
          )}
        </Button>
      </div>

      {/* Janela de chat */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.9 }}
            transition={{ duration: 0.2 }}
            className="fixed bottom-24 right-6 w-80 sm:w-96 h-[500px] bg-black border border-terminal/50 rounded-md shadow-xl overflow-hidden z-40"
          >
            {/* Cabeçalho do chat */}
            <div className="flex items-center justify-between p-3 border-b border-terminal/30 bg-black">
              <h3 className="text-terminal font-tech-mono text-sm">TERMINAL_ASSISTANT</h3>
              <div className="flex items-center space-x-2">
              </div>
            </div>

            {/* Área de mensagens */}
            <div className="flex flex-col h-[calc(100%-120px)] overflow-y-auto p-3 space-y-3">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] rounded-md p-3 ${
                      message.sender === 'user'
                        ? 'bg-[#111] border border-terminal/30 text-white'
                        : 'bg-black border border-terminal/50 text-terminal'
                    }`}
                  >
                    <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                    <p className="text-xs opacity-50 mt-1">
                      {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
              ))}
              
              {/* Indicador de digitação */}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-black border border-terminal/50 text-terminal max-w-[80%] rounded-md p-3">
                    <div className="flex items-center space-x-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <p className="text-sm">Processando...</p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Área de entrada */}
            <div className="absolute bottom-0 left-0 right-0 border-t border-terminal/30 p-3 bg-black">
              <div className="flex items-end">
                <Textarea
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={handleKeyPress}
                  placeholder="Digite sua mensagem..."
                  className="resize-none h-10 py-2 bg-[#111] border-terminal/30 focus:border-terminal rounded-md text-white"
                />
                <Button
                  onClick={handleSendMessage}
                  disabled={!inputValue.trim()}
                  className="ml-2 h-10 px-3 bg-black border border-terminal hover:bg-[#111] text-terminal"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex items-center justify-between mt-2">
                <div className="text-xs text-white/50 flex items-center">
                  <CornerDownLeft className="h-3 w-3 mr-1" /> Enter para enviar
                </div>
                <div className="text-xs text-terminal">
                  {localApiKey ? 'API Configurada' : 'Configure a API'}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}