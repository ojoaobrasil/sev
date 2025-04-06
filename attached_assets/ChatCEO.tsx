import { useEffect, useRef, useState, useCallback, useMemo } from "react";
import { Copy, CheckCheck, Terminal, ChevronDown, Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import AppLayout from "@/components/Layout/AppLayout";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface Message {
  text: string;
  isUser: boolean;
  id: number;
}

interface ChatTab {
  id: string;
  name: string;
  messages: Message[];
  initialized: boolean;
}

interface ChatStore {
  tabs: ChatTab[];
  activeTabId: string;
  setActiveTabId: (id: string) => void;
  addTab: () => void;
  removeTab: (id: string) => void;
  addMessage: (tabId: string, message: Message) => void;
  setTabInitialized: (tabId: string) => void;
}

const useChatStore = create<ChatStore>()(
  persist(
    (set) => ({
      tabs: [{ id: "1", name: "Main Terminal", messages: [], initialized: false }],
      activeTabId: "1",
      setActiveTabId: (id) => set({ activeTabId: id }),
      addTab: () => set((state) => {
        const newId = (state.tabs.length + 1).toString();
        return {
          tabs: [...state.tabs, { id: newId, name: `Terminal ${newId}`, messages: [], initialized: false }],
          activeTabId: newId,
        };
      }),
      removeTab: (id) => set((state) => ({
        tabs: state.tabs.filter((tab) => tab.id !== id),
        activeTabId: state.activeTabId === id ? "1" : state.activeTabId,
      })),
      addMessage: (tabId, message) => set((state) => ({
        tabs: state.tabs.map((tab) =>
          tab.id === tabId
            ? { ...tab, messages: [...tab.messages, message] }
            : tab
        ),
      })),
      setTabInitialized: (tabId) => set((state) => ({
        tabs: state.tabs.map((tab) =>
          tab.id === tabId
            ? { ...tab, initialized: true }
            : tab
        ),
      })),
    }),
    {
      name: 'severino-chat-storage',
    }
  )
);

function TypewriterText({ text }: { text: string }) {
  const [displayText, setDisplayText] = useState("");
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (currentIndex < text.length) {
      const timeout = setTimeout(() => {
        setDisplayText(prev => prev + text[currentIndex]);
        setCurrentIndex(prev => prev + 1);
      }, 25); // Adjust speed here
      return () => clearTimeout(timeout);
    }
  }, [currentIndex, text]);

  return <span>{displayText}</span>;
}

export default function Chatbot() {
  const {
    tabs,
    activeTabId,
    setActiveTabId,
    addTab,
    removeTab,
    addMessage,
    setTabInitialized,
  } = useChatStore();
  
  const [newMessage, setNewMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const messageSound = useRef(new Audio("/message.mp3"));

  const activeTab = tabs.find((tab) => tab.id === activeTabId);
  const messages = useMemo(() => activeTab?.messages || [], [activeTab?.messages]);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  const initializingRef = useRef<{ [key: string]: boolean }>({});

  const appendMessage = useCallback((content: string, isUser: boolean) => {
    const newMessage = { text: content, isUser, id: Date.now() };
    addMessage(activeTabId, newMessage);
    if (!isUser) {
      messageSound.current.play().catch(() => {
        // Ignore audio play errors
      });
    }
  }, [activeTabId, addMessage]);

  const iniciarIntro = useCallback(async () => {
    if (initializingRef.current[activeTabId]) return;
    initializingRef.current[activeTabId] = true;

    const delays = [500, 2000, 3000];
    const msgs = [
      "Estabelecendo conexão segura...",
      "Acesso concedido. Entrando na rede subterrânea...",
      "E aí! Aqui é o Severino, o CEO. Me diz aí o que tu precisa!",
    ];

    try {
      for (let i = 0; i < msgs.length; i++) {
        await new Promise((resolve) => setTimeout(resolve, delays[i]));
        appendMessage(msgs[i], false);
      }
      setTabInitialized(activeTabId);
    } finally {
      initializingRef.current[activeTabId] = false;
    }
  }, [appendMessage, activeTabId, setTabInitialized]);

  useEffect(() => {
    if (activeTab && !activeTab.initialized && !initializingRef.current[activeTabId]) {
      iniciarIntro();
    }
  }, [activeTab, activeTabId, iniciarIntro]);

  const copyMessage = async (text: string, index: number) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedIndex(index);
      toast({
        title: "Mensagem copiada!",
        duration: 2000,
      });
      setTimeout(() => setCopiedIndex(null), 2000);
    } catch (err) {
      toast({
        title: "Erro ao copiar mensagem",
        variant: "destructive",
      });
    }
  };

  const sendMessageRef = useRef<boolean>(false);
  const sendingRef = useRef(false);
  const lastTimestampRef = useRef(0);
  const messageQueueRef = useRef<string[]>([]);

  const sendMessage = useCallback(async (message: string) => {
    const now = Date.now();
    if (sendingRef.current || !message.trim() || now - lastTimestampRef.current < 1000) {
      // If already sending or it's been less than 1 second since last message, queue it
      messageQueueRef.current.push(message);
      return;
    }

    try {
      sendingRef.current = true;
      lastTimestampRef.current = now;
      setIsTyping(true);
      
      const payload = JSON.stringify({ mensagem: message });
      const response = await fetch(
        "https://gen.simplebot.online/webhook/b8f10f59-0108-43f1-afce-e782eda6ebe0",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: payload,
        }
      );

      const text = await response.text();
      interface ApiResponse {
        output?: string;
        mensagem?: string;
        message?: string;
        resposta?: string;
        response?: string;
      }
      let responseData: ApiResponse | string = text;

      try {
        responseData = JSON.parse(text) as ApiResponse;
      } catch (e) {
        console.warn('Failed to parse response as JSON:', e);
      }

      if (!response.ok) {
        throw new Error(
          `Erro ${response.status}: ${
            typeof responseData === "string"
              ? responseData
              : JSON.stringify(responseData)
          }`
        );
      }

      const botResponse = typeof responseData === 'string' 
        ? responseData
        : responseData.output ||
          responseData.mensagem ||
          responseData.message ||
          responseData.resposta ||
          responseData.response;

      await new Promise(resolve => setTimeout(resolve, 1500));
      setIsTyping(false);
      
      if (botResponse) {
        appendMessage(botResponse, false);
      } else {
        appendMessage("Desculpe, não consegui processar sua mensagem.", false);
      }

    } catch (error) {
      console.error("Erro ao enviar mensagem:", error);
      setIsTyping(false);
      toast({
        title: "Erro ao enviar mensagem",
        description: error instanceof Error ? error.message : 'Erro desconhecido',
        variant: "destructive",
      });
      appendMessage(
        "Desculpe, ocorreu um erro ao processar sua mensagem.",
        false
      );
    } finally {
      sendingRef.current = false;
      
      // Process next message in queue if any
      if (messageQueueRef.current.length > 0) {
        const nextMessage = messageQueueRef.current.shift();
        if (nextMessage) {
          setTimeout(() => sendMessage(nextMessage), 1000);
        }
      }
    }
  }, [appendMessage, toast]);

  const handleSend = useCallback(async () => {
    const trimmed = newMessage.trim();
    if (!trimmed || isTyping) return;
    
    appendMessage(trimmed, true);
    setNewMessage("");
    await sendMessage(trimmed);
  }, [newMessage, isTyping, appendMessage, sendMessage]);

  const handleKeyPress = useCallback((e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (!isTyping) {
        handleSend();
      }
    }
  }, [handleSend, isTyping]);

  return (
    <AppLayout>
      <div className="relative flex flex-col flex-1 h-[calc(100vh-5rem)] p-4 overflow-hidden bg-severino-dark">
        {/* Animated cyberpunk background */}
        <div className="fixed inset-0 z-0 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-severino-dark to-cyan-900/20" />
          <div className="cyberpunk-grid" />
          <div className="cyberpunk-glow absolute top-1/4 left-1/4 w-96 h-96 bg-severino-pink/20 blur-3xl rounded-full transform -translate-x-1/2 -translate-y-1/2 animate-pulse" />
          <div className="cyberpunk-glow absolute bottom-1/4 right-1/4 w-96 h-96 bg-cyan-500/20 blur-3xl rounded-full transform translate-x-1/2 translate-y-1/2 animate-pulse" />
        </div>

        <div className="relative z-10 flex flex-col h-full w-full max-w-4xl mx-auto overflow-hidden rounded-lg border border-severino-pink bg-severino-dark/80 backdrop-blur-sm shadow-lg shadow-severino-pink/20">
          <div className="border-b border-severino-pink bg-severino-dark/90 px-4 py-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Terminal className="h-5 w-5 text-severino-pink" />
                <h2 className="text-lg font-mono font-semibold text-severino-pink">
                  Severino Nexus v2.0
                </h2>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-severino-pink hover:bg-severino-pink/20"
                  onClick={() => addTab()}
                >
                  <Plus className="h-4 w-4" />
                </Button>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="text-severino-pink hover:bg-severino-pink/20">
                      <span className="mr-2">Terminal {activeTabId}</span>
                      <ChevronDown className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="bg-severino-dark border-severino-pink">
                    {tabs.map(tab => (
                      <DropdownMenuItem
                        key={tab.id}
                        className={cn(
                          "flex items-center justify-between",
                          tab.id === activeTabId && "bg-severino-pink/20"
                        )}
                        onClick={() => setActiveTabId(tab.id)}
                      >
                        <span>{tab.name}</span>
                        {tabs.length > 1 && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-4 w-4 ml-2 text-severino-pink hover:bg-severino-pink/20"
                            onClick={(e) => {
                              e.stopPropagation();
                              if (tabs.length > 1) {
                                removeTab(tab.id);
                              }
                            }}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        )}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-4 font-mono text-sm scrollbar-thin scrollbar-track-severino-dark scrollbar-thumb-severino-pink/50">
            {messages.map((msg, i) => (
              <div
                key={msg.id}
                className={`group flex animate-fadeIn ${msg.isUser ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`relative max-w-[80%] rounded px-3 py-2 ${
                    msg.isUser
                      ? "bg-severino-pink/20 text-gray-100 border border-severino-pink/50"
                      : "bg-cyan-500/10 text-gray-100 border border-cyan-500/50"
                  }`}
                >
                  <div className="flex items-start gap-2">
                    <span className={cn(
                      "select-none",
                      msg.isUser ? "text-severino-pink" : "text-cyan-500"
                    )}>
                      {msg.isUser ? '>' : '$'}
                    </span>
                    {msg.isUser ? (
                      <span>{msg.text}</span>
                    ) : (
                      <TypewriterText text={msg.text} />
                    )}
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute -right-10 top-0 opacity-0 transition-opacity group-hover:opacity-100 text-severino-pink hover:text-severino-pink/80"
                    onClick={() => copyMessage(msg.text, i)}
                  >
                    {copiedIndex === i ? (
                      <CheckCheck className="h-4 w-4" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>
            ))}
            
            {isTyping && (
              <div className="flex items-center gap-2 text-cyan-500 animate-fadeIn">
                <span>$</span>
                <div className="flex space-x-1">
                  <div className="h-2 w-2 animate-bounce rounded-full bg-cyan-500" style={{ animationDelay: "0ms" }} />
                  <div className="h-2 w-2 animate-bounce rounded-full bg-cyan-500" style={{ animationDelay: "150ms" }} />
                  <div className="h-2 w-2 animate-bounce rounded-full bg-cyan-500" style={{ animationDelay: "300ms" }} />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className="border-t border-severino-pink bg-severino-dark/90 p-4">
            <div className="flex gap-2 items-center font-mono">
              <span className="text-severino-pink select-none">{'>'}</span>
              <textarea
                rows={1}
                className="flex-1 bg-transparent border-none text-gray-100 placeholder:text-gray-500 focus:outline-none focus:ring-0 resize-none"
                placeholder="Digite seu comando..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyDown={handleKeyPress}
                disabled={isTyping}
                style={{ minHeight: '24px', maxHeight: '120px' }}
              />
              <Button 
                onClick={handleSend}
                className="shrink-0 bg-gradient-to-r from-severino-pink to-cyan-500 text-white hover:opacity-90"
                disabled={isTyping || !newMessage.trim()}
              >
                Executar
              </Button>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
