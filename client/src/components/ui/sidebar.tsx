import { useState, useEffect, useRef } from 'react';
import { useLocation, Link } from 'wouter';
import { useAuth } from '@/hooks/use-auth';
import { useTheme } from '@/hooks/use-theme';
import { useSettingsStore } from '@/store/dataStore';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  FileText,
  ListTodo,
  Link as LinkIcon,
  Lightbulb,
  MessageSquare,
  Bot,
  Wand2,
  ScanSearch,
  Leaf,
  Settings,
  Terminal,
  LogOut,
  X,
  Moon,
  Sun,
  PanelLeftClose,
  PanelLeft
} from "lucide-react";
import { Button } from '@/components/ui/button';

interface SidebarProps {
  isOpen: boolean;
  setIsOpen: (value: boolean) => void;
  isMobile: boolean;
}

interface MenuItem {
  path: string;
  icon: React.ReactNode;
  label: string;
  description?: string;
}

export function Sidebar({ isOpen, setIsOpen, isMobile }: SidebarProps) {
  const [location, navigate] = useLocation();
  const [activeItem, setActiveItem] = useState('/');
  const { logoutMutation } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { settings, updateSettings } = useSettingsStore();
  const sidebarRef = useRef<HTMLDivElement>(null);

  // Update active item based on current route
  useEffect(() => {
    setActiveItem(location);
  }, [location]);

  // Handle click outside to close sidebar on mobile
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (isMobile && isOpen && sidebarRef.current && !sidebarRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isMobile, isOpen, setIsOpen]);

  // Handle escape key to close sidebar
  useEffect(() => {
    const handleEscKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isMobile && isOpen) {
        setIsOpen(false);
      }
    };

    document.addEventListener('keydown', handleEscKey);
    return () => {
      document.removeEventListener('keydown', handleEscKey);
    };
  }, [isMobile, isOpen, setIsOpen]);

  // Productivity items
  const productivityItems: MenuItem[] = [
    { path: '/', icon: <LayoutDashboard className="w-5 h-5" />, label: 'Dashboard', description: 'Visão geral do sistema' },
    { path: '/productivity/notes', icon: <FileText className="w-5 h-5" />, label: 'Notas', description: 'Gerenciar suas anotações' },
    { path: '/productivity/tasks', icon: <ListTodo className="w-5 h-5" />, label: 'Tarefas', description: 'Lista de tarefas a fazer' },
    { path: '/productivity/links', icon: <LinkIcon className="w-5 h-5" />, label: 'Links', description: 'Links úteis salvos' },
    { path: '/productivity/ideas', icon: <Lightbulb className="w-5 h-5" />, label: 'Ideias', description: 'Banco de ideias' },
    { path: '/productivity/prompt-bank', icon: <MessageSquare className="w-5 h-5" />, label: 'Prompt Bank', description: 'Biblioteca de prompts' },
  ];

  // Tools items
  const toolsItems: MenuItem[] = [
    { path: '/tools/chat-ceo', icon: <Bot className="w-5 h-5" />, label: 'Chat CEO', description: 'Chatbot inteligente' },
    { path: '/tools/prompt-maker', icon: <Wand2 className="w-5 h-5" />, label: 'Prompt Maker', description: 'Criador de prompts' },
    { path: '/tools/assistants', icon: <ScanSearch className="w-5 h-5" />, label: 'Assistants', description: 'Assistentes OpenAI' },
  ];

  // External items
  const externalItems: MenuItem[] = [
    { path: '/external/farm', icon: <Leaf className="w-5 h-5" />, label: 'Fazendinha', description: 'Monitoramento de plantações' },
    { path: '/external/best-robot', icon: <Bot className="w-5 h-5" />, label: 'O melhor robô', description: 'Integração externa' },
  ];

  // System items
  const systemItems: MenuItem[] = [
    { path: '/settings', icon: <Settings className="w-5 h-5" />, label: 'Configurações', description: 'Configurações do sistema' },
  ];

  // Mobile sidebar overlay click handler
  const handleOverlayClick = () => {
    if (isMobile) {
      setIsOpen(false);
    }
  };

  // Handle menu item click
  const handleMenuClick = (path: string) => {
    navigate(path);
    setActiveItem(path);
    if (isMobile) setIsOpen(false);
  };

  // Função para criar classes baseadas no tema
  const getThemeClasses = (isLight: boolean) => {
    if (isLight) {
      return {
        menuBg: "bg-zinc-900",
        menuItemActive: "text-terminal bg-zinc-800 border-l-2 border-terminal terminal-shadow",
        menuItemNormal: "text-white hover:bg-zinc-800 hover:text-terminal hover:border-l-2 hover:border-terminal",
        sidebarBg: "bg-zinc-900 border-r border-terminal/30",
        statusBg: "bg-zinc-800 border border-terminal/30",
        darkMaskBg: "bg-zinc-900/80",
        textColor: "text-white"
      };
    }
    return {
      menuBg: "bg-black",
      menuItemActive: "text-terminal bg-black border-l-2 border-terminal terminal-shadow",
      menuItemNormal: "text-white hover:bg-[#111111] hover:text-terminal hover:border-l-2 hover:border-terminal",
      sidebarBg: "bg-black border-r border-terminal/50",
      statusBg: "bg-black border border-terminal/20",
      darkMaskBg: "bg-black/80",
      textColor: "text-white"
    };
  };

  const themeClasses = getThemeClasses(theme === 'light');

  // Render menu item with improved accessibility
  const renderMenuItem = (item: MenuItem, isActive: boolean) => (
    <Link
      href={item.path}
      className={cn(
        "flex items-center py-2 px-3 rounded-sm group transition-colors duration-200 focus:outline-none focus:ring-1 focus:ring-terminal",
        isActive
          ? themeClasses.menuItemActive
          : themeClasses.menuItemNormal
      )}
      onClick={() => handleMenuClick(item.path)}
      aria-current={isActive ? 'page' : undefined}
      title={item.description}
    >
      <span className="w-6" aria-hidden="true">{item.icon}</span>
      <span className="ml-2 text-sm">{item.label}</span>
    </Link>
  );

  return (
    <>
      {/* Mobile overlay backdrop */}
      {isMobile && isOpen && (
        <div 
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-40" 
          onClick={handleOverlayClick}
          aria-hidden="true"
          role="dialog"
          aria-modal="true"
          aria-label="Menu lateral"
        />
      )}

      {/* Sidebar */}
      <AnimatePresence>
        {(isOpen || !isMobile) && (
          <motion.aside
            ref={sidebarRef}
            initial={isMobile ? { x: -320 } : { x: 0 }}
            animate={{ x: 0 }}
            exit={{ x: -320 }}
            transition={{ duration: 0.2, ease: 'easeInOut' }}
            className={cn(
              themeClasses.sidebarBg, "z-50 h-screen flex flex-col transition-all duration-300",
              isMobile ? "fixed w-[280px] md:w-64 shadow-lg" : "relative w-64 flex-shrink-0"
            )}
            role="navigation"
            aria-label="Menu de navegação principal"
          >
            <div className="flex flex-col h-full p-4 overflow-hidden">
              {/* Close button - mobile only */}
              {isMobile && (
                <div className="flex justify-end -mt-2 -mr-2 mb-2 md:hidden">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-terminal hover:bg-terminal/10 focus:ring-1 focus:ring-terminal h-8 w-8"
                    onClick={() => setIsOpen(false)}
                    aria-label="Fechar menu"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              )}

              <div className="font-tech-mono text-xs mb-4 text-terminal terminal-shadow">PRODUTIVIDADE_</div>

              <nav className="flex-grow overflow-y-auto scrollbar-thin scrollbar-track-transparent scrollbar-thumb-terminal/20 hover:scrollbar-thumb-terminal/40 pr-1">
                <ul role="list" aria-label="Produtividade">
                  {productivityItems.map((item) => (
                    <li key={item.path} className="mb-0.5">
                      {renderMenuItem(item, activeItem === item.path)}
                    </li>
                  ))}
                </ul>

                <div className="border-t border-terminal/20 my-2 pt-2">
                  <div className="font-tech-mono text-xs mb-2 text-terminal terminal-shadow">FERRAMENTAS_</div>
                  <ul role="list" aria-label="Ferramentas">
                    {toolsItems.map((item) => (
                      <li key={item.path} className="mb-0.5">
                        {renderMenuItem(item, activeItem === item.path)}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="border-t border-terminal/20 my-2 pt-2">
                  <div className="font-tech-mono text-xs mb-2 text-terminal terminal-shadow">EXTERNO_</div>
                  <ul role="list" aria-label="Links externos">
                    {externalItems.map((item) => (
                      <li key={item.path} className="mb-0.5">
                        {renderMenuItem(item, activeItem === item.path)}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="border-t border-terminal/20 my-2 pt-2">
                  <div className="font-tech-mono text-xs mb-2 text-terminal terminal-shadow">SISTEMA_</div>
                  <ul role="list" aria-label="Sistema">
                    {systemItems.map((item) => (
                      <li key={item.path} className="mb-0.5">
                        {renderMenuItem(item, activeItem === item.path)}
                      </li>
                    ))}
                    <li className="mb-0.5">
                      <button
                        className={cn(
                          "w-full flex items-center py-2 px-3 rounded-sm transition-colors duration-200 focus:outline-none focus:ring-1 focus:ring-terminal",
                          theme === 'light'
                            ? "text-white hover:bg-zinc-700 hover:text-terminal hover:border-l-2 hover:border-terminal"
                            : "text-white hover:bg-[#111111] hover:text-terminal hover:border-l-2 hover:border-terminal"
                        )}
                        onClick={() => logoutMutation.mutate()}
                        aria-label="Fazer logout"
                      >
                        <span className="w-6" aria-hidden="true">
                          <LogOut className="w-5 h-5" />
                        </span>
                        <span className="ml-2 text-sm">Logout</span>
                      </button>
                    </li>
                  </ul>
                </div>
              </nav>

              <div className="mt-auto pt-2 space-y-3">
                {/* Comandos rápidos */}
                <div className="flex justify-between items-center">
                  {/* Botão alternar modo de exibição da sidebar - completo ou apenas ícones */}
                  {!isMobile && (
                    <Button
                      variant="outline"
                      size="icon"
                      className={cn(
                        "h-9 w-9 border-terminal/30 text-terminal hover:text-terminal",
                        theme === 'light' ? "bg-zinc-700 hover:bg-terminal/10" : "bg-black hover:bg-terminal/10"
                      )}
                      onClick={() => {
                        // Toggle entre modo completo e apenas ícones
                        const sidebarElement = document.querySelector('aside');
                        if (sidebarElement) {
                          const isCompact = sidebarElement.classList.contains('w-16');
                          if (isCompact) {
                            // Expandir para tamanho normal
                            sidebarElement.classList.remove('w-16');
                            sidebarElement.classList.add('w-64');
                            document.querySelectorAll('aside span:not([aria-hidden="true"])').forEach(
                              (el) => (el as HTMLElement).style.display = 'inline'
                            );
                          } else {
                            // Colapsar para apenas ícones
                            sidebarElement.classList.remove('w-64');
                            sidebarElement.classList.add('w-16');
                            document.querySelectorAll('aside span:not([aria-hidden="true"])').forEach(
                              (el) => (el as HTMLElement).style.display = 'none'
                            );
                          }
                        }
                      }}
                      aria-label="Alternar entre menu completo e apenas ícones"
                      title="Alternar entre menu completo e apenas ícones"
                    >
                      {isOpen ? <PanelLeftClose size={16} /> : <PanelLeft size={16} />}
                    </Button>
                  )}
                </div>

                {/* Espaço reservado mantido intencionalmente vazio */}
              </div>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>
    </>
  );
}