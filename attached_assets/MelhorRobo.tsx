
import React from 'react';
import AppLayout from '../components/Layout/AppLayout';

const MelhorRobo = () => {
  return (
    <AppLayout>
      <div className="animate-fadeIn">
        <div className="flex items-center mb-6">
          <h1 className="text-2xl font-bold">O Melhor Robô</h1>
        </div>
        
        <div className="w-full h-[calc(100vh-12rem)] bg-card rounded-lg border border-border overflow-hidden">
          <iframe 
            src="https://omelhorrobo.online/" 
            className="w-full h-full" 
            title="O Melhor Robô"
            allowFullScreen
          />
        </div>
      </div>
    </AppLayout>
  );
};

export default MelhorRobo;
