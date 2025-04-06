import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import AppLayout from '@/components/Layout/AppLayout';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from '@/components/ui/use-toast';
import { useSettingsStore } from '@/store/dataStore';
import { Bot, Send, RefreshCcw, Save } from 'lucide-react';

const Assistants = () => {
  const { settings, updateSettings } = useSettingsStore();
  const [messages, setMessages] = useState<Array<{ role: 'user' | 'assistant', content: string }>>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [assistantConfig, setAssistantConfig] = useState({
    model: 'gpt-4o-mini',
    instructions: 'Você é um assistente útil e amigável.',
    temperature: 0.7,
    maxTokens: 2048,
  });

  const { register, handleSubmit, reset } = useForm<{ message: string }>();

  const models = [
    { id: 'gpt-4o-mini', name: 'GPT-4o Mini' },
    { id: 'gpt-4o', name: 'GPT-4o' },
    { id: 'gpt-4.5-preview', name: 'GPT-4.5 Preview' },
  ];

  // Carregar configurações salvas
  useEffect(() => {
    const savedConfig = localStorage.getItem('assistant-config');
    if (savedConfig) {
      setAssistantConfig(JSON.parse(savedConfig));
    }
  }, []);

  const handleSaveConfig = () => {
    localStorage.setItem('assistant-config', JSON.stringify(assistantConfig));
    toast({
      title: "Configurações salvas",
      description: "As configurações do assistente foram salvas com sucesso.",
    });
  };

  const onSubmit = async (data: { message: string }) => {
    if (!data.message.trim()) return;
    
    if (!settings.openaiApiKey) {
      toast({
        title: "API Key não encontrada",
        description: "Configure sua chave da OpenAI nas configurações",
        variant: "destructive"
      });
      return;
    }

    try {
      const userMessage = { role: 'user' as const, content: data.message };
      setMessages(prev => [...prev, userMessage]);
      setIsLoading(true);
      reset();

      // Preparar a chamada para a API OpenAI
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${settings.openaiApiKey}`
        },
        body: JSON.stringify({
          model: assistantConfig.model,
          messages: [
            {
              role: 'system',
              content: assistantConfig.instructions
            },
            ...messages,
            userMessage
          ],
          temperature: assistantConfig.temperature,
          max_tokens: assistantConfig.maxTokens,
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error?.message || 'Erro ao chamar a API da OpenAI');
      }

      const result = await response.json();
      const assistantMessage = { 
        role: 'assistant' as const, 
        content: result.choices[0].message.content 
      };
      
      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Erro ao chamar OpenAI:', error);
      toast({
        title: "Erro ao processar mensagem",
        description: error instanceof Error ? error.message : "Erro desconhecido",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setMessages([]);
  };

  return (
    <AppLayout>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Bot size={20} />
                  Configuração do Assistente
                </div>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={handleSaveConfig}
                  title="Salvar configurações"
                >
                  <Save size={16} />
                </Button>
              </CardTitle>
              <CardDescription>
                Configure as opções do assistente para testar diferentes comportamentos
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Modelo</label>
                <Select 
                  value={assistantConfig.model}
                  onValueChange={(value) => setAssistantConfig({...assistantConfig, model: value})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um modelo" />
                  </SelectTrigger>
                  <SelectContent>
                    {models.map(model => (
                      <SelectItem key={model.id} value={model.id}>
                        {model.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Instruções do Sistema</label>
                <Textarea
                  value={assistantConfig.instructions}
                  onChange={(e) => setAssistantConfig({...assistantConfig, instructions: e.target.value})}
                  rows={4}
                  placeholder="Instruções para o assistente..."
                  className="w-full"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Temperatura: {assistantConfig.temperature}
                </label>
                <input
                  type="range"
                  min="0"
                  max="2"
                  step="0.1"
                  value={assistantConfig.temperature}
                  onChange={(e) => setAssistantConfig({...assistantConfig, temperature: parseFloat(e.target.value)})}
                  className="w-full"
                />
                <div className="flex justify-between text-xs mt-1">
                  <span>Mais preciso</span>
                  <span>Mais criativo</span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Máximo de Tokens: {assistantConfig.maxTokens}
                </label>
                <input
                  type="range"
                  min="256"
                  max="4096"
                  step="256"
                  value={assistantConfig.maxTokens}
                  onChange={(e) => setAssistantConfig({...assistantConfig, maxTokens: parseInt(e.target.value)})}
                  className="w-full"
                />
                <div className="flex justify-between text-xs mt-1">
                  <span>Respostas curtas</span>
                  <span>Respostas longas</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-2">
          <Card className="h-full flex flex-col">
            <CardHeader>
              <CardTitle className="flex justify-between items-center">
                <span>Teste do Assistente</span>
                <Button variant="outline" size="icon" onClick={handleReset} title="Limpar conversa">
                  <RefreshCcw size={16} />
                </Button>
              </CardTitle>
              <CardDescription>
                Interaja com o assistente para testar suas capacidades
              </CardDescription>
            </CardHeader>
            <CardContent className="flex-grow overflow-auto">
              <div className="space-y-4 min-h-[300px]">
                {messages.length === 0 ? (
                  <div className="text-center text-muted-foreground py-10">
                    Envie uma mensagem para começar a conversa
                  </div>
                ) : (
                  messages.map((msg, index) => (
                    <div 
                      key={index} 
                      className={`p-3 rounded-lg max-w-[80%] ${
                        msg.role === 'user' 
                          ? 'ml-auto bg-primary text-primary-foreground' 
                          : 'bg-card border'
                      }`}
                    >
                      {msg.content}
                    </div>
                  ))
                )}
                {isLoading && (
                  <div className="p-3 rounded-lg max-w-[80%] bg-card border">
                    <div className="flex space-x-2">
                      <div className="w-2 h-2 rounded-full bg-primary animate-bounce" />
                      <div className="w-2 h-2 rounded-full bg-primary animate-bounce [animation-delay:0.2s]" />
                      <div className="w-2 h-2 rounded-full bg-primary animate-bounce [animation-delay:0.4s]" />
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
            <CardFooter>
              <form onSubmit={handleSubmit(onSubmit)} className="w-full">
                <div className="flex gap-2">
                  <Input
                    {...register('message')}
                    placeholder="Digite sua mensagem..."
                    disabled={isLoading}
                    className="flex-1"
                  />
                  <Button type="submit" disabled={isLoading}>
                    <Send size={16} className="mr-2" />
                    Enviar
                  </Button>
                </div>
              </form>
            </CardFooter>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
};

export default Assistants;
