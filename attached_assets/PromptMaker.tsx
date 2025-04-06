import React, { useState, useEffect } from 'react';
import AppLayout from '../components/Layout/AppLayout';
import { usePromptsStore } from '../store/dataStore';
import { useSettingsStore } from '../store/dataStore';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { 
  Terminal, 
  Send,
  Save,
  ArrowDown,
  Settings,
  Sparkles,
  Key
} from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useNavigate } from 'react-router-dom';

const PromptMaker = () => {
  const { prompts, addPrompt } = usePromptsStore();
  const { settings } = useSettingsStore();
  const { toast } = useToast();
  const navigate = useNavigate();

  const [prompt, setPrompt] = useState('');
  const [result, setResult] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaveDialogOpen, setIsSaveDialogOpen] = useState(false);
  const [isSettingsDialogOpen, setIsSettingsDialogOpen] = useState(false);
  const [apiSettings, setApiSettings] = useState({
    apiKey: localStorage.getItem('openai_api_key') || '',
    assistantId: localStorage.getItem('openai_assistant_id') || ''
  });
  
  const [savedPrompt, setSavedPrompt] = useState({
    title: '',
    category: '',
    content: '',
  });

  const handleSettingsSave = () => {
    if (!apiSettings.apiKey || !apiSettings.assistantId) {
      toast({
        title: "Campos obrigatórios",
        description: "API Key e Assistant ID são obrigatórios.",
        variant: "destructive",
      });
      return;
    }

    localStorage.setItem('openai_api_key', apiSettings.apiKey);
    localStorage.setItem('openai_assistant_id', apiSettings.assistantId);
    
    toast({
      title: "Configurações salvas",
      description: "Suas credenciais da API foram salvas com sucesso.",
    });
    
    setIsSettingsDialogOpen(false);
  };

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      toast({
        title: "Prompt vazio",
        description: "Por favor, digite um prompt para gerar conteúdo.",
        variant: "destructive",
      });
      return;
    }

    const apiKey = localStorage.getItem('openai_api_key');
    const assistantId = localStorage.getItem('openai_assistant_id');
    
    console.log('API Key exists:', !!apiKey);
    console.log('Assistant ID exists:', !!assistantId);

    if (!apiKey || !assistantId) {
      toast({
        title: "API não configurada",
        description: "Configure sua API Key e Assistant ID nas configurações.",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);
    setResult('Aguarde... estou gerando a resposta.');

    try {
      // Criar uma nova thread
      console.log('Criando nova thread...');
      const threadRes = await fetch("https://api.openai.com/v1/threads", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${apiKey}`,
          "Content-Type": "application/json",
          "OpenAI-Beta": "assistants=v2"
        }
      });
      
      if (!threadRes.ok) {
        const error = await threadRes.json();
        throw new Error(error.error?.message || 'Erro ao criar thread');
      }
      
      const thread = await threadRes.json();
      console.log('Thread criada:', thread.id);

      // Enviar a mensagem do usuário
      console.log('Enviando mensagem...');
      const messageRes = await fetch(`https://api.openai.com/v1/threads/${thread.id}/messages`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${apiKey}`,
          "Content-Type": "application/json",
          "OpenAI-Beta": "assistants=v2"
        },
        body: JSON.stringify({
          role: "user",
          content: prompt
        })
      });

      if (!messageRes.ok) {
        const error = await messageRes.json();
        throw new Error(error.error?.message || 'Erro ao enviar mensagem');
      }

      console.log('Mensagem enviada, iniciando execução...');
      // Iniciar a execução do assistente
      const runRes = await fetch(`https://api.openai.com/v1/threads/${thread.id}/runs`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${apiKey}`,
          "Content-Type": "application/json",
          "OpenAI-Beta": "assistants=v2"
        },
        body: JSON.stringify({
          assistant_id: assistantId
        })
      });

      if (!runRes.ok) {
        const error = await runRes.json();
        throw new Error(error.error?.message || 'Erro ao iniciar execução');
      }

      const run = await runRes.json();
      console.log('Execução iniciada, ID:', run.id);

      // Esperar o status da execução mudar para "completed"
      let status = "queued";
      while (status !== "completed" && status !== "failed") {
        await new Promise(resolve => setTimeout(resolve, 1500));
        const check = await fetch(`https://api.openai.com/v1/threads/${thread.id}/runs/${run.id}`, {
          headers: { 
            "Authorization": `Bearer ${apiKey}`,
            "OpenAI-Beta": "assistants=v2"
          }
        });
        
        if (!check.ok) {
          const error = await check.json();
          throw new Error(error.error?.message || 'Erro ao verificar status');
        }

        const checkData = await check.json();
        status = checkData.status;
        console.log('Status atual:', status);

        if (status === "failed") {
          throw new Error(checkData.last_error?.message || 'A execução falhou');
        }
      }

      // Buscar a mensagem gerada pelo assistente
      console.log('Buscando resposta...');
      const msgRes = await fetch(`https://api.openai.com/v1/threads/${thread.id}/messages`, {
        headers: {
          "Authorization": `Bearer ${apiKey}`,
          "OpenAI-Beta": "assistants=v2"
        }
      });

      if (!msgRes.ok) {
        const error = await msgRes.json();
        throw new Error(error.error?.message || 'Erro ao buscar resposta');
      }

      const msgData = await msgRes.json();
      const resposta = msgData.data.find(m => m.role === "assistant");

      if (resposta && resposta.content && resposta.content[0]) {
        console.log('Resposta recebida com sucesso');
        setResult(resposta.content[0].text.value);
      } else {
        console.log('Resposta vazia ou em formato inesperado:', msgData);
        setResult("Resposta vazia ou em formato inesperado.");
      }
    } catch (error) {
      console.error('Erro detalhado:', error);
      toast({
        title: "Erro na geração",
        description: error.message || "Ocorreu um erro ao gerar o conteúdo. Verifique suas credenciais e o console para mais detalhes.",
        variant: "destructive",
      });
      setResult("Erro ao gerar resposta. Verifique o console para mais detalhes.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSavePrompt = () => {
    if (!savedPrompt.title.trim() || !savedPrompt.category.trim()) {
      toast({
        title: "Campos obrigatórios",
        description: "Título e categoria são obrigatórios.",
        variant: "destructive",
      });
      return;
    }

    try {
      const contentToSave = savedPrompt.content.trim() || result || prompt;
      
      if (!contentToSave) {
        toast({
          title: "Conteúdo vazio",
          description: "Não é possível salvar um prompt vazio.",
          variant: "destructive",
        });
        return;
      }
      
      // Add the prompt to the store
      addPrompt(savedPrompt.title, contentToSave, savedPrompt.category);
      
      // Reset form
      setSavedPrompt({ title: '', category: '', content: '' });
      setIsSaveDialogOpen(false);
      
      toast({
        title: "Prompt salvo",
        description: "Seu prompt foi salvo com sucesso. Redirecionando para a página de prompts salvos...",
      });

      // Redirect to saved prompts page after a short delay
      setTimeout(() => {
        navigate('/saved-prompts');
      }, 1500);
    } catch (error) {
      console.error('Error saving prompt:', error);
      toast({
        title: "Erro ao salvar",
        description: "Ocorreu um erro ao salvar o prompt. Por favor, tente novamente.",
        variant: "destructive",
      });
    }
  };

  const handleOpenSaveDialog = () => {
    const contentToSave = result || prompt;
    
    if (!contentToSave.trim()) {
      toast({
        title: "Conteúdo vazio",
        description: "Não é possível salvar um prompt vazio.",
        variant: "destructive",
      });
      return;
    }

    // Pre-populate the content field when opening the dialog
    setSavedPrompt(prev => ({
      ...prev,
      content: contentToSave
    }));
    setIsSaveDialogOpen(true);
  };

  return (
    <AppLayout>
      <div className="container mx-auto p-6 space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Gerador de Prompts</h1>
          <Button 
            variant="outline" 
            onClick={() => setIsSettingsDialogOpen(true)}
          >
            <Key className="w-4 h-4 mr-2" />
            Configurar API
          </Button>
        </div>

        <Card>
          <CardContent className="p-6 space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Seu Prompt:</label>
              <Textarea
                placeholder="Digite seu prompt aqui..."
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                className="min-h-[100px]"
              />
            </div>

            <div className="flex space-x-2">
              <Button
                onClick={handleGenerate}
                disabled={isGenerating}
                className="flex-1"
              >
                {isGenerating ? (
                  <>
                    <Terminal className="mr-2 h-4 w-4 animate-spin" />
                    Gerando...
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-2 h-4 w-4" />
                    Gerar com OpenAI
                  </>
                )}
              </Button>
              <Button
                variant="outline"
                onClick={handleOpenSaveDialog}
              >
                <Save className="h-4 w-4" />
              </Button>
            </div>

            {result && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Resultado:</label>
                  <div className="p-4 rounded-lg bg-muted whitespace-pre-wrap">
                    {result}
                  </div>
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">Salvar Variação do Prompt:</label>
                  <Textarea
                    placeholder="Copie e modifique o resultado para salvar como um novo prompt..."
                    value={savedPrompt.content}
                    onChange={(e) => setSavedPrompt({ ...savedPrompt, content: e.target.value })}
                    className="min-h-[100px]"
                  />
                  <Button
                    variant="outline"
                    onClick={handleOpenSaveDialog}
                    className="w-full"
                  >
                    <Save className="h-4 w-4 mr-2" />
                    Salvar como Novo Prompt
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Dialog open={isSaveDialogOpen} onOpenChange={setIsSaveDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Salvar Prompt</DialogTitle>
              <DialogDescription>
                Preencha as informações abaixo para salvar seu prompt.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Título:</label>
                <Input
                  value={savedPrompt.title}
                  onChange={(e) => setSavedPrompt({ ...savedPrompt, title: e.target.value })}
                  placeholder="Digite um título para o prompt"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Categoria:</label>
                <Input
                  value={savedPrompt.category}
                  onChange={(e) => setSavedPrompt({ ...savedPrompt, category: e.target.value })}
                  placeholder="Digite uma categoria"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsSaveDialogOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={handleSavePrompt}>
                Salvar Prompt
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog open={isSettingsDialogOpen} onOpenChange={setIsSettingsDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Configurar API OpenAI</DialogTitle>
              <DialogDescription>
                Configure sua API Key e Assistant ID da OpenAI.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">API Key:</label>
                <Input
                  type="password"
                  value={apiSettings.apiKey}
                  onChange={(e) => setApiSettings({ ...apiSettings, apiKey: e.target.value })}
                  placeholder="Cole sua OpenAI API Key"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Assistant ID:</label>
                <Input
                  value={apiSettings.assistantId}
                  onChange={(e) => setApiSettings({ ...apiSettings, assistantId: e.target.value })}
                  placeholder="Cole o ID do Assistente"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsSettingsDialogOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={handleSettingsSave}>
                Salvar Configurações
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AppLayout>
  );
};

export default PromptMaker;
