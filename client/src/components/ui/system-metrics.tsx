import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { BarChart3 } from "lucide-react";

export function SystemMetrics() {
  // System metrics data
  const metrics = [
    { name: "CPU", value: 42, color: "terminal" },
    { name: "MEMÓRIA", value: 67, color: "terminal" },
    { name: "ARMAZENAMENTO", value: 23, color: "terminal" },
    { name: "REDE", value: 85, color: "terminal" },
  ];

  // Active processes data
  const processes = [
    { name: "terminal_core.exe", status: "ATIVO", color: "terminal" },
    { name: "seguranca_monitor.exe", status: "ATIVO", color: "terminal" },
    { name: "rede_scan.exe", status: "ESCANEANDO", color: "yellow-500" },
    { name: "atualizacao_servico.exe", status: "ESPERA", color: "white" },
  ];

  return (
    <div className="bg-black rounded-sm p-4 border border-terminal/30 h-full">
      <h3 className="font-tech-mono text-lg text-terminal terminal-shadow mb-4">MÉTRICAS</h3>
      
      {metrics.map((metric, index) => (
        <div key={index} className="mb-4">
          <div className="flex justify-between items-center mb-1">
            <span className="text-xs font-tech-mono text-white">{metric.name}</span>
            <span className="text-xs text-terminal">{metric.value}%</span>
          </div>
          <div className="w-full h-1.5 bg-[#111111] rounded-sm overflow-hidden">
            <div 
              className={`h-full bg-${metric.color}`}
              style={{ width: `${metric.value}%` }}
            ></div>
          </div>
        </div>
      ))}
      
      <div className="mt-6 bg-black p-3 rounded-sm border border-terminal/20">
        <h4 className="text-sm font-tech-mono text-terminal mb-2">PROCESSOS ATIVOS</h4>
        <div className="space-y-2 text-xs">
          {processes.map((process, index) => (
            <div key={index} className="flex justify-between">
              <span className="text-white/70 font-mono">{process.name}</span>
              <span className={`text-${process.color} font-tech-mono`}>{process.status}</span>
            </div>
          ))}
        </div>
      </div>
      
      <div className="mt-4 text-center">
        <Button 
          variant="outline" 
          className="text-sm py-2 px-4 rounded-sm border border-terminal/30 bg-black hover:bg-[#111111] text-white hover:text-terminal transition-all w-full"
        >
          <BarChart3 className="h-4 w-4 mr-1" /> Análise Completa do Sistema
        </Button>
      </div>
    </div>
  );
}
