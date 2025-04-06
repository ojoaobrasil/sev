import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { Link, useLocation } from 'wouter';
import { 
  Menu, 
  Bell, 
  User, 
  ChevronDown,
  LogOut,
  Settings,
  Code
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useToast } from '@/hooks/use-toast';
import { useTheme } from '@/hooks/use-theme';
import { NotificationCenter } from './notification-center';

interface TopbarProps {
  toggleSidebar: () => void;
  isSidebarOpen: boolean;
}

export function Topbar({ toggleSidebar, isSidebarOpen }: TopbarProps) {
  const { user, logoutMutation } = useAuth();
  const [notificationCount] = useState(2);
  const [location, navigate] = useLocation();
  const { toast } = useToast();
  const { theme } = useTheme();

  const handleToggleSidebar = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    console.log("Topbar - toggle sidebar chamado");
    toggleSidebar();
  };

  const handleNotificationsClick = () => {
    toast({
      title: "Notificações",
      description: "Sistema de notificações em desenvolvimento.",
      duration: 3000,
    });
  };

  // Classes condicionais baseadas no tema
  const headerBgClass = theme === 'light' ? 'bg-zinc-800' : 'bg-black';
  const headerBorderClass = theme === 'light' ? 'border-terminal/20' : 'border-terminal/40';

  return (
    <header className={`${headerBgClass} border-b ${headerBorderClass} py-2 px-4 flex items-center justify-between sticky top-0 z-40`}>
      <div className="flex items-center">
        <Link href="/" className="font-tech-mono text-terminal terminal-shadow text-xl hover:opacity-80 transition-opacity">
          TERMINAL<span className="text-white">_OS</span>
        </Link>
      </div>
      
      <div className="flex items-center space-x-4">
        <div className="hidden md:flex items-center space-x-1">
          <div className="h-2 w-2 rounded-full bg-terminal animate-pulse"></div>
          <span className="text-xs font-tech-mono text-terminal">ONLINE</span>
        </div>
        
        <NotificationCenter />
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button 
              variant="ghost" 
              className="flex items-center space-x-2 hover:text-terminal hover:bg-transparent transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-terminal/50"
              aria-label="Menu do usuário"
            >
              <div className="w-8 h-8 rounded-sm bg-black border border-terminal flex items-center justify-center text-xs font-tech-mono text-terminal">
                <Code className="h-4 w-4" />
              </div>
              <span className="hidden md:inline text-sm font-tech-mono text-white">{user?.username?.toUpperCase() || 'USER'}</span>
              <ChevronDown className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent 
            align="end" 
            className="w-48 bg-black border border-terminal/50 rounded-sm shadow-md text-white z-50"
          >
            <DropdownMenuItem 
              className="cursor-pointer hover:bg-[#111111] hover:text-terminal focus:bg-[#111111] focus:text-terminal" 
              onSelect={() => toast({
                title: "Perfil",
                description: "Função em desenvolvimento.",
                duration: 3000,
              })}
            >
              <User className="mr-2 h-4 w-4 text-terminal" /> Perfil
            </DropdownMenuItem>
            <DropdownMenuItem 
              className="cursor-pointer hover:bg-[#111111] hover:text-terminal focus:bg-[#111111] focus:text-terminal"
              onSelect={() => navigate('/settings')}
            >
              <Settings className="mr-2 h-4 w-4 text-terminal" /> Configurações
            </DropdownMenuItem>
            <DropdownMenuSeparator className="bg-terminal/20" />
            <DropdownMenuItem 
              className="cursor-pointer hover:bg-[#111111] text-white hover:text-terminal focus:bg-[#111111] focus:text-terminal"
              onSelect={() => logoutMutation.mutate()}
            >
              <LogOut className="mr-2 h-4 w-4" /> Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
