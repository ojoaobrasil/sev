import { useState, useEffect, useRef } from 'react';
import { Bell, Check, CheckCheck, Trash2, X } from 'lucide-react';
import { useNotificationsStore } from '@/store/dataStore';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuGroup, 
  DropdownMenuItem, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useTheme } from '@/hooks/use-theme';
import { format, formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { motion, AnimatePresence } from 'framer-motion';

export function NotificationCenter() {
  const { 
    notifications, 
    markAsRead, 
    markAllAsRead, 
    deleteNotification, 
    clearAllNotifications 
  } = useNotificationsStore();
  const [isOpen, setIsOpen] = useState(false);
  const [hasNewNotification, setHasNewNotification] = useState(false);
  const { theme } = useTheme();
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  // Determinar se existem novas notificações não lidas
  useEffect(() => {
    const unreadCount = notifications.filter(n => !n.read).length;
    setHasNewNotification(unreadCount > 0);
  }, [notifications]);

  // Manipular clique fora para fechar o dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Função para formatar data
  const formatDate = (date: Date) => {
    const now = new Date();
    const diffInDays = Math.floor((now.getTime() - new Date(date).getTime()) / (1000 * 3600 * 24));
    
    if (diffInDays < 1) {
      return formatDistanceToNow(new Date(date), { addSuffix: true, locale: ptBR });
    } else if (diffInDays < 7) {
      return format(new Date(date), "EEEE 'às' HH:mm", { locale: ptBR });
    } else {
      return format(new Date(date), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR });
    }
  };

  // Determinar classes baseadas no tema
  const notificationBg = theme === 'light' ? 'bg-white' : 'bg-black';
  const hoverBg = theme === 'light' ? 'hover:bg-gray-100' : 'hover:bg-gray-900';
  const borderColor = theme === 'light' ? 'border-gray-200' : 'border-gray-800';
  
  // Obter tipo de ícone baseado no tipo de notificação
  const getNotificationIcon = (type: 'info' | 'warning' | 'success' | 'error') => {
    const iconClasses = "h-4 w-4 mr-2 text-terminal";
    
    switch (type) {
      case 'info':
        return <Bell className={iconClasses} />;
      case 'warning':
        return <Bell className={`${iconClasses} text-yellow-500`} />;
      case 'success':
        return <Check className={`${iconClasses} text-green-500`} />;
      case 'error':
        return <X className={`${iconClasses} text-red-500`} />;
      default:
        return <Bell className={iconClasses} />;
    }
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div ref={dropdownRef}>
      <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
        <DropdownMenuTrigger asChild>
          <Button 
            variant="outline" 
            size="icon" 
            className={cn(
              "relative h-9 w-9 border-terminal/30 text-terminal hover:text-terminal",
              theme === 'light' ? "bg-zinc-200 hover:bg-terminal/10" : "bg-black hover:bg-terminal/10"
            )}
            onClick={() => setIsOpen(!isOpen)}
          >
            <Bell className="h-4 w-4" />
            {hasNewNotification && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-4 h-4 flex items-center justify-center rounded-full">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent 
          align="end" 
          className={`${notificationBg} border-terminal/30 w-80 p-0 max-h-[90vh] overflow-hidden`}
        >
          <div className="flex items-center justify-between p-3 border-b border-terminal/20">
            <div className="font-tech-mono text-sm text-terminal flex items-center">
              <Bell className="h-4 w-4 mr-2" />
              NOTIFICAÇÕES
              {hasNewNotification && (
                <span className="ml-2 bg-terminal text-black text-xs px-1.5 rounded-full">
                  {unreadCount}
                </span>
              )}
            </div>
            <div className="flex space-x-1">
              {notifications.length > 0 && (
                <>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-6 w-6 text-terminal"
                    onClick={() => markAllAsRead()}
                    title="Marcar todas como lidas"
                  >
                    <CheckCheck className="h-3.5 w-3.5" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-6 w-6 text-terminal"
                    onClick={() => clearAllNotifications()}
                    title="Limpar todas"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </>
              )}
            </div>
          </div>
          
          <div className="overflow-y-auto max-h-[60vh]">
            {notifications.length === 0 ? (
              <div className="py-6 px-4 text-center text-sm text-terminal/60">
                <div className="mb-3">
                  <Bell className="h-10 w-10 opacity-20 mx-auto" />
                </div>
                <p>Nenhuma notificação ainda</p>
                <p className="text-xs mt-1">Você será notificado sobre atividades importantes.</p>
              </div>
            ) : (
              <AnimatePresence>
                {notifications.map((notification) => (
                  <motion.div
                    key={notification.id}
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <div 
                      className={cn(
                        "p-3 border-b last:border-0", 
                        borderColor,
                        !notification.read && "bg-terminal/5",
                        hoverBg
                      )}
                    >
                      <div className="flex justify-between gap-2">
                        <div className="flex-1">
                          <div className="flex items-start">
                            {getNotificationIcon(notification.type)}
                            <div>
                              <p className={cn(
                                "text-sm font-medium", 
                                notification.read ? "text-terminal/70" : "text-terminal"
                              )}>
                                {notification.title}
                              </p>
                              <p className="text-xs text-terminal/60 mt-0.5">
                                {notification.message}
                              </p>
                              <p className="text-[10px] text-terminal/40 mt-1">
                                {formatDate(notification.createdAt)}
                              </p>
                            </div>
                          </div>
                        </div>
                        <div className="flex flex-col space-y-1">
                          {!notification.read && (
                            <Button 
                              variant="ghost" 
                              size="icon"
                              className="h-6 w-6 text-terminal hover:bg-terminal/10" 
                              onClick={() => markAsRead(notification.id)}
                              title="Marcar como lida"
                            >
                              <Check className="h-3 w-3" />
                            </Button>
                          )}
                          <Button 
                            variant="ghost" 
                            size="icon"
                            className="h-6 w-6 text-terminal hover:bg-terminal/10" 
                            onClick={() => deleteNotification(notification.id)}
                            title="Remover"
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            )}
          </div>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}