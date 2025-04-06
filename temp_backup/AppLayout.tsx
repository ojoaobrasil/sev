import React, { ReactNode, useState, useEffect } from 'react';
import { Sidebar } from "@/components/ui/sidebar";
import { Topbar } from "@/components/ui/topbar";
import { useIsMobile } from "@/hooks/use-mobile";

interface AppLayoutProps {
  children: ReactNode;
}

const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const isMobile = useIsMobile();
  
  // Close sidebar by default on mobile
  useEffect(() => {
    if (isMobile) {
      setIsSidebarOpen(false);
    } else {
      setIsSidebarOpen(true);
    }
  }, [isMobile]);

  const toggleSidebar = () => {
    console.log("AppLayout toggleSidebar called, current state:", isSidebarOpen);
    setIsSidebarOpen(prevState => !prevState);
  };

  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      <Topbar 
        toggleSidebar={toggleSidebar} 
        isSidebarOpen={isSidebarOpen} 
      />
      
      <div className="flex flex-1 overflow-hidden">
        <Sidebar 
          isOpen={isSidebarOpen} 
          setIsOpen={setIsSidebarOpen}
          isMobile={isMobile}
        />
        
        <main className={`flex-1 overflow-auto p-4 transition-all duration-200 ${
          isSidebarOpen && !isMobile ? 'ml-64' : ''
        }`}>
          <div className="container mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default AppLayout;