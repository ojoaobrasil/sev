import React from 'react';
import { Card } from '@/components/ui/card';

export default function BestRobot() {
  return (
    <div className="p-6 animate-fadeIn">
      <div className="flex items-center mb-6">
        <h1 className="text-2xl font-bold text-terminal">O MELHOR ROBÔ<span className="text-terminal/70">_</span></h1>
      </div>

      <Card className="w-full h-[calc(100vh-12rem)] bg-black border-terminal/30">
        <iframe 
          src="https://omelhorrobo.online/" 
          className="w-full h-full border-0"
          title="O Melhor Robô"
        />
      </Card>
    </div>
  );
}