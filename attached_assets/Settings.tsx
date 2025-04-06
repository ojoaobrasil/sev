import React, { useEffect, useState } from 'react';
import AppLayout from '../components/Layout/AppLayout';
import { useSettingsStore } from '../store/dataStore';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { 
  Settings as SettingsIcon, 
  Save, 
  Key, 
  Webhook, 
  Globe, 
  User, 
  Eye, 
  EyeOff,
  Sun,
  Moon,
  Check,
  Cpu
} from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { useTheme } from '@/hooks/use-theme';
import { Switch } from '@/components/ui/switch';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { updateUserSettings } from '@/services/databaseService';
import { useAuthStore } from '@/store/authStore';

const Settings = () => {
  const { settings, updateSettings } = useSettingsStore();
  const { user } = useAuthStore();
  const { theme, setTheme } = useTheme();
  const [formState, setFormState] = useState({
    openaiApiKey: settings.openaiApiKey || '',
    webhookUrl: settings.webhookUrl || 'https://gen.simplebot.online/webhook/a1b8ac76-841d-4412-911a-7f22ff0d73ff/chat',
    evolutionApiKey: settings.evolutionApiKey || '',
    webhookEvolutionUrl: settings.webhookEvolutionUrl || '',
    chatBubbleAssistantId: localStorage.getItem('chat_bubble_assistant_id') || '',
    theme: settings.theme || 'dark',
    language: settings.language || 'pt',
    enableNotifications: settings.enableNotifications || false,
    autoSave: settings.autoSave || true,
  });
  const [showOpenAIKey, setShowOpenAIKey] = useState(false);
  const [showEvolutionKey, setShowEvolutionKey] = useState(false);
  const [showChatBubbleKey, setShowChatBubbleKey] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  // Sync theme state with settings
  useEffect(() => {
    setFormState(prev => ({
      ...prev,
      theme: theme
    }));
  }, [theme]);

  const handleChange = (field, value) => {
    setFormState({
      ...formState,
      [field]: value,
    });
  };

  const handleToggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    setFormState({
      ...formState,
      theme: newTheme,
    });
  };

  const handleSave = async () => {
    setIsSaving(true);
    
    try {
      // Save to store first (local state)
      updateSettings(formState);

      // Save chat bubble assistant ID to localStorage
      localStorage.setItem('chat_bubble_assistant_id', formState.chatBubbleAssistantId);
      
      // Save to database if user is authenticated
      if (user?.id) {
        await updateUserSettings(user.id, {
          ...formState,
          user_id: user.id
        });
      }
      
      toast({
        title: "Configurações salvas",
        description: "Suas configurações foram atualizadas com sucesso.",
        className: "bg-green-800 text-white border-green-700",
      });
    } catch (error) {
      console.error('Error saving settings:', error);
      toast({
        title: "Erro ao salvar",
        description: "Ocorreu um erro ao salvar suas configurações.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = () => {
    setFormState({
      openaiApiKey: '',
      webhookUrl: 'https://gen.simplebot.online/webhook/a1b8ac76-841d-4412-911a-7f22ff0d73ff/chat',
      evolutionApiKey: '',
      webhookEvolutionUrl: '',
      chatBubbleAssistantId: '',
      theme: 'dark',
      language: 'pt',
      enableNotifications: false,
      autoSave: true,
    });
    setTheme('dark');
    localStorage.removeItem('chat_bubble_assistant_id');
  };

  return (
    <AppLayout>
      <div className="animate-fadeIn">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">Configurações</h1>
          <div className="flex gap-2">
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline">Redefinir</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Redefinir configurações</DialogTitle>
                  <DialogDescription>
                    Tem certeza que deseja redefinir todas as configurações para os valores padrão?
                  </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                  <Button variant="outline" onClick={() => {}}>Cancelar</Button>
                  <Button variant="destructive" onClick={handleReset}>Redefinir</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
            <Button 
              onClick={handleSave} 
              className="bg-severino-pink hover:bg-severino-pink/90"
              disabled={isSaving}
            >
              {isSaving ? (
                <span className="animate-pulse flex items-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Salvando...
                </span>
              ) : (
                <>
                  <Save size={16} className="mr-2" />
                  Salvar Configurações
                </>
              )}
            </Button>
          </div>
        </div>

        <Tabs defaultValue="api" className="space-y-6">
          <TabsList className="bg-card border-border">
            <TabsTrigger value="api" className="data-[state=active]:bg-severino-pink">
              Chaves de API
            </TabsTrigger>
            <TabsTrigger value="integrations" className="data-[state=active]:bg-severino-pink">
              Integrações
            </TabsTrigger>
            <TabsTrigger value="general" className="data-[state=active]:bg-severino-pink">
              Geral
            </TabsTrigger>
            <TabsTrigger value="advanced" className="data-[state=active]:bg-severino-pink">
              Avançado
            </TabsTrigger>
          </TabsList>

          {/* API Keys Tab */}
          <TabsContent value="api">
            <div className="grid grid-cols-1 gap-6">
              <Card className="bg-card border-border">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Key size={18} className="mr-2 text-severino-pink" />
                    API Keys
                  </CardTitle>
                  <CardDescription>
                    Configure suas chaves de API para utilizar os serviços externos.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="openai_key">OpenAI API Key</Label>
                    <div className="flex">
                      <div className="relative flex-1">
                        <Input
                          id="openai_key"
                          type={showOpenAIKey ? "text" : "password"}
                          placeholder="sk-..."
                          value={formState.openaiApiKey}
                          onChange={(e) => handleChange('openaiApiKey', e.target.value)}
                          className="pr-10"
                        />
                        <button
                          type="button"
                          onClick={() => setShowOpenAIKey(!showOpenAIKey)}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-foreground"
                        >
                          {showOpenAIKey ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Necessária para o funcionamento do Prompt Maker.
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="chat_bubble_assistant_id">Chat Bubble Assistant ID</Label>
                    <div className="flex">
                      <div className="relative flex-1">
                        <Input
                          id="chat_bubble_assistant_id"
                          type={showChatBubbleKey ? "text" : "password"}
                          placeholder="asst_..."
                          value={formState.chatBubbleAssistantId}
                          onChange={(e) => handleChange('chatBubbleAssistantId', e.target.value)}
                          className="pr-10"
                        />
                        <button
                          type="button"
                          onClick={() => setShowChatBubbleKey(!showChatBubbleKey)}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-foreground"
                        >
                          {showChatBubbleKey ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      ID do assistente OpenAI usado no Chat Bubble. Diferente do assistente usado no Prompt Maker.
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="evolution_key">Evolution API Key</Label>
                    <div className="flex">
                      <div className="relative flex-1">
                        <Input
                          id="evolution_key"
                          type={showEvolutionKey ? "text" : "password"}
                          placeholder="sua-chave-evolution-api"
                          value={formState.evolutionApiKey}
                          onChange={(e) => handleChange('evolutionApiKey', e.target.value)}
                          className="pr-10"
                        />
                        <button
                          type="button"
                          onClick={() => setShowEvolutionKey(!showEvolutionKey)}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-foreground"
                        >
                          {showEvolutionKey ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Necessária para o aquecimento de chips e integração com Evolution API.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Integrations Tab */}
          <TabsContent value="integrations">
            <div className="grid grid-cols-1 gap-6">
              <Card className="bg-card border-border">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Webhook size={18} className="mr-2 text-severino-pink" />
                    Webhooks
                  </CardTitle>
                  <CardDescription>
                    Configure webhooks para integrações externas.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="webhook_url">URL do Webhook (ChatCEO)</Label>
                    <Input
                      id="webhook_url"
                      placeholder="https://seu-webhook-url.com"
                      value={formState.webhookUrl}
                      onChange={(e) => handleChange('webhookUrl', e.target.value)}
                    />
                    <p className="text-xs text-muted-foreground">
                      URL do webhook para o Chat CEO. Configuração necessária para envio de mensagens.
                    </p>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="webhook_evolution_url">URL do Webhook (Evolution API)</Label>
                    <Input
                      id="webhook_evolution_url"
                      placeholder="https://sua-url-evolution-api.com/webhook/instance"
                      value={formState.webhookEvolutionUrl}
                      onChange={(e) => handleChange('webhookEvolutionUrl', e.target.value)}
                    />
                    <p className="text-xs text-muted-foreground">
                      URL do webhook para a Evolution API. Configuração necessária para integração.
                    </p>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-card border-border">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Cpu size={18} className="mr-2 text-severino-pink" />
                    Evolution API
                  </CardTitle>
                  <CardDescription>
                    Configurações para integração com a Evolution API.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="bg-severino-lightgray p-4 rounded-md">
                      <h3 className="font-medium mb-2">Eventos de Webhook Disponíveis</h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <div className="text-xs p-2 bg-severino-gray rounded-md">
                          <span className="font-bold">QRCODE_UPDATED</span>: QR Code atualizado
                        </div>
                        <div className="text-xs p-2 bg-severino-gray rounded-md">
                          <span className="font-bold">MESSAGES_UPSERT</span>: Mensagens inseridas/atualizadas
                        </div>
                        <div className="text-xs p-2 bg-severino-gray rounded-md">
                          <span className="font-bold">MESSAGES_UPDATE</span>: Estado da mensagem alterado
                        </div>
                        <div className="text-xs p-2 bg-severino-gray rounded-md">
                          <span className="font-bold">MESSAGES_DELETE</span>: Mensagem deletada
                        </div>
                        <div className="text-xs p-2 bg-severino-gray rounded-md">
                          <span className="font-bold">SEND_MESSAGE</span>: Mensagem enviada
                        </div>
                        <div className="text-xs p-2 bg-severino-gray rounded-md">
                          <span className="font-bold">CONNECTION_UPDATE</span>: Conexão atualizada
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label>Formato do Webhook por Eventos</Label>
                      <div className="p-3 bg-severino-lightgray rounded-md font-mono text-xs overflow-x-auto">
                        {formState.webhookEvolutionUrl ? 
                          `${formState.webhookEvolutionUrl}/MESSAGES_UPDATE` : 
                          'https://sua-url.com/webhook/MESSAGES_UPDATE'}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Adicione o nome do evento ao final da URL base do webhook para eventos específicos.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* General Tab */}
          <TabsContent value="general">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="bg-card border-border">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Globe size={18} className="mr-2 text-severino-pink" />
                    Preferências de Idioma
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center space-x-2">
                      <input
                        type="radio"
                        id="lang-pt"
                        name="language"
                        value="pt"
                        checked={formState.language === 'pt'}
                        onChange={() => handleChange('language', 'pt')}
                        className="h-4 w-4 accent-severino-pink"
                      />
                      <Label htmlFor="lang-pt">Português</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input
                        type="radio"
                        id="lang-en"
                        name="language"
                        value="en"
                        checked={formState.language === 'en'}
                        onChange={() => handleChange('language', 'en')}
                        className="h-4 w-4 accent-severino-pink"
                      />
                      <Label htmlFor="lang-en">English</Label>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-card border-border">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <User size={18} className="mr-2 text-severino-pink" />
                    Modo de Exibição
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {theme === 'dark' ? (
                        <Moon size={20} className="text-severino-pink" />
                      ) : (
                        <Sun size={20} className="text-severino-pink" />
                      )}
                      <span>{theme === 'dark' ? 'Modo Escuro' : 'Modo Claro'}</span>
                    </div>
                    <Switch
                      checked={theme === 'light'}
                      onCheckedChange={handleToggleTheme}
                    />
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          {/* Advanced Tab */}
          <TabsContent value="advanced">
            <div className="grid grid-cols-1 gap-6">
              <Card className="bg-card border-border">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <SettingsIcon size={18} className="mr-2 text-severino-pink" />
                    Configurações Avançadas
                  </CardTitle>
                  <CardDescription>
                    Ajustes avançados para personalizar sua experiência.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="notifications">Notificações</Label>
                        <p className="text-xs text-muted-foreground">
                          Receber notificações do sistema
                        </p>
                      </div>
                      <Switch
                        id="notifications"
                        checked={formState.enableNotifications}
                        onCheckedChange={(checked) => handleChange('enableNotifications', checked)}
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="autosave">Salvamento Automático</Label>
                        <p className="text-xs text-muted-foreground">
                          Salvar automaticamente alterações
                        </p>
                      </div>
                      <Switch
                        id="autosave"
                        checked={formState.autoSave}
                        onCheckedChange={(checked) => handleChange('autoSave', checked)}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
};

export default Settings;
