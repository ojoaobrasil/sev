
import { ReactNode, useEffect, useState } from 'react';
import { Sidebar } from '@/components/ui/sidebar';
import { Topbar } from '@/components/ui/topbar';
import { useSettingsStore } from '@/store/dataStore';
import { useIsMobile } from '@/hooks/use-mobile';
import { FloatingChat } from '@/components/floating-chat';

interface AppLayoutProps {
  children: ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  const { settings } = useSettingsStore();
  const [sidebarOpen, setSidebarOpen] = useState(settings.sidebarOpen);
  const isMobile = useIsMobile();
  
  // Sincronizar o estado do sidebar com as configurações
  useEffect(() => {
    setSidebarOpen(isMobile ? false : settings.sidebarOpen);
  }, [settings.sidebarOpen, isMobile]);
  
  const toggleSidebar = () => {
    console.log("toggleSidebar called, current state:", sidebarOpen);
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      <Topbar 
        toggleSidebar={toggleSidebar} 
        isSidebarOpen={sidebarOpen} 
      />
      
      <div className="flex flex-1 overflow-hidden">
        <Sidebar 
          isOpen={sidebarOpen} 
          setIsOpen={setSidebarOpen}
          isMobile={isMobile}
        />
        
        <main className="flex-1 overflow-auto p-4">
          <div className="container mx-auto">
            {children}
          </div>
        </main>
      </div>
      <FloatingChat />
    </div>
  );
}
