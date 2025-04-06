import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Leaf, Droplets, Sun, Clock, Thermometer, Grid3X3 } from 'lucide-react';

// Componente para a página da Fazendinha
export default function Farm() {
  // Dados simulados de plantações
  const plantations = [
    { 
      id: 1, 
      name: 'Tomates', 
      area: '50m²', 
      status: 'Saudável', 
      plantedDate: '2024-03-15', 
      harvestDate: '2024-06-15',
      moisture: 78,
      temperature: 26,
      sunlight: 65 
    },
    { 
      id: 2, 
      name: 'Alface', 
      area: '30m²', 
      status: 'Atenção', 
      plantedDate: '2024-03-01', 
      harvestDate: '2024-05-01',
      moisture: 65,
      temperature: 24,
      sunlight: 72 
    },
    { 
      id: 3, 
      name: 'Cenouras', 
      area: '40m²', 
      status: 'Saudável', 
      plantedDate: '2024-02-20', 
      harvestDate: '2024-05-20',
      moisture: 80,
      temperature: 25,
      sunlight: 68 
    },
    { 
      id: 4, 
      name: 'Morangos', 
      area: '25m²', 
      status: 'Atenção', 
      plantedDate: '2024-03-10', 
      harvestDate: '2024-06-01',
      moisture: 62,
      temperature: 23,
      sunlight: 60 
    }
  ];

  // Função para retornar classes de cores baseadas no status
  const getStatusClasses = (status: string) => {
    return status === 'Saudável' 
      ? 'text-emerald-400 bg-emerald-500/10' 
      : status === 'Atenção' 
        ? 'text-yellow-400 bg-yellow-500/10' 
        : 'text-red-400 bg-red-500/10';
  };

  // Função para calcular dias restantes até a colheita
  const getDaysRemaining = (harvestDate: string) => {
    const harvest = new Date(harvestDate);
    const today = new Date();
    const diffTime = Math.abs(harvest.getTime() - today.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  // Função para criar o gráfico de barras de progresso
  const ProgressBar = ({ value, max = 100, type }: { value: number, max?: number, type: 'moisture' | 'temperature' | 'sunlight' }) => {
    const percentage = Math.min(100, Math.max(0, (value / max) * 100));
    
    // Configuração de cores baseadas no tipo e valor
    let barColor = '';
    let textColor = '';
    
    if (type === 'moisture') {
      if (value < 60) {
        barColor = 'bg-yellow-500';
        textColor = 'text-yellow-500';
      } else if (value > 85) {
        barColor = 'bg-blue-500';
        textColor = 'text-blue-500';
      } else {
        barColor = 'bg-terminal';
        textColor = 'text-terminal';
      }
    } else if (type === 'temperature') {
      if (value < 20) {
        barColor = 'bg-blue-500';
        textColor = 'text-blue-500';
      } else if (value > 30) {
        barColor = 'bg-red-500';
        textColor = 'text-red-500';
      } else {
        barColor = 'bg-terminal';
        textColor = 'text-terminal';
      }
    } else if (type === 'sunlight') {
      if (value < 50) {
        barColor = 'bg-yellow-500';
        textColor = 'text-yellow-500';
      } else if (value > 80) {
        barColor = 'bg-orange-500';
        textColor = 'text-orange-500';
      } else {
        barColor = 'bg-terminal';
        textColor = 'text-terminal';
      }
    }
    
    return (
      <div className="w-full">
        <div className="h-2 bg-black rounded-full overflow-hidden border border-terminal/30">
          <div 
            className={`h-full ${barColor}`} 
            style={{ width: `${percentage}%` }}
          ></div>
        </div>
        <div className={`text-xs mt-1 ${textColor}`}>{value}%</div>
      </div>
    );
  };

  return (
    <div className="p-6 animate-fadeIn">
      <h1 className="text-2xl font-tech-mono text-terminal mb-6">FAZENDINHA<span className="text-terminal/70">_</span></h1>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <Card className="bg-black border-terminal/30">
          <CardContent className="p-4">
            <h3 className="text-sm text-terminal/70 mb-1 flex items-center">
              <Grid3X3 size={14} className="mr-1" />
              Área Total
            </h3>
            <p className="text-xl font-semibold text-terminal">145m²</p>
          </CardContent>
        </Card>
        
        <Card className="bg-black border-terminal/30">
          <CardContent className="p-4">
            <h3 className="text-sm text-terminal/70 mb-1 flex items-center">
              <Leaf size={14} className="mr-1" />
              Plantações
            </h3>
            <p className="text-xl font-semibold text-terminal">4</p>
          </CardContent>
        </Card>
        
        <Card className="bg-black border-terminal/30">
          <CardContent className="p-4">
            <h3 className="text-sm text-terminal/70 mb-1 flex items-center">
              <Sun size={14} className="mr-1" />
              Luz Solar Média
            </h3>
            <p className="text-xl font-semibold text-terminal">66%</p>
          </CardContent>
        </Card>
        
        <Card className="bg-black border-terminal/30">
          <CardContent className="p-4">
            <h3 className="text-sm text-terminal/70 mb-1 flex items-center">
              <Droplets size={14} className="mr-1" />
              Umidade Média
            </h3>
            <p className="text-xl font-semibold text-terminal">71%</p>
          </CardContent>
        </Card>
      </div>
      
      <div className="space-y-4">
        <h2 className="text-lg font-tech-mono text-terminal mb-2 flex items-center">
          <Leaf className="mr-2 h-5 w-5" />
          Monitoramento de Plantações
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {plantations.map(plantation => (
            <Card key={plantation.id} className="bg-black border-terminal/30">
              <CardContent className="p-5">
                <div className="flex justify-between items-start mb-3">
                  <h3 className="text-lg font-semibold text-terminal">{plantation.name}</h3>
                  <span className={`text-xs px-2 py-1 rounded-sm ${getStatusClasses(plantation.status)}`}>
                    {plantation.status}
                  </span>
                </div>
                
                <div className="grid grid-cols-2 gap-x-4 gap-y-3 mb-4">
                  <div className="space-y-1">
                    <p className="text-xs text-terminal/70">Área</p>
                    <p className="text-sm text-terminal flex items-center">
                      <Grid3X3 size={14} className="mr-1 text-terminal/50" />
                      {plantation.area}
                    </p>
                  </div>
                  
                  <div className="space-y-1">
                    <p className="text-xs text-terminal/70">Plantado em</p>
                    <p className="text-sm text-terminal flex items-center">
                      <Clock size={14} className="mr-1 text-terminal/50" />
                      {new Date(plantation.plantedDate).toLocaleDateString()}
                    </p>
                  </div>
                  
                  <div className="space-y-1">
                    <p className="text-xs text-terminal/70">Colheita prevista</p>
                    <p className="text-sm text-terminal flex items-center">
                      <Clock size={14} className="mr-1 text-terminal/50" />
                      {new Date(plantation.harvestDate).toLocaleDateString()}
                    </p>
                  </div>
                  
                  <div className="space-y-1">
                    <p className="text-xs text-terminal/70">Dias até colheita</p>
                    <p className="text-sm text-terminal font-semibold flex items-center">
                      <Clock size={14} className="mr-1 text-terminal/50" />
                      {getDaysRemaining(plantation.harvestDate)} dias
                    </p>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <Droplets size={16} className="text-terminal/70" />
                    <div className="flex-1">
                      <div className="text-xs text-terminal/70 mb-1">Umidade</div>
                      <ProgressBar value={plantation.moisture} type="moisture" />
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Thermometer size={16} className="text-terminal/70" />
                    <div className="flex-1">
                      <div className="text-xs text-terminal/70 mb-1">Temperatura</div>
                      <ProgressBar value={plantation.temperature} max={40} type="temperature" />
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Sun size={16} className="text-terminal/70" />
                    <div className="flex-1">
                      <div className="text-xs text-terminal/70 mb-1">Luminosidade</div>
                      <ProgressBar value={plantation.sunlight} type="sunlight" />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
      
      <div className="mt-6 text-xs text-terminal/40 flex items-center">
        <Leaf size={12} className="mr-1" />
        <span>Os dados apresentados são simulados para fins de demonstração.</span>
      </div>
    </div>
  );
}