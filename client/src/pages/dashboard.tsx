import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useNotesStore, useTasksStore, useIdeasStore, useLinksStore, useNotificationsStore } from "@/store/dataStore";
import { FloatingChat } from "@/components/floating-chat";
import { motion } from "framer-motion";
import { Terminal, Cpu, HardDrive, Clock, FileText, ListTodo, Link as LinkIcon, Lightbulb, Settings, AlertTriangle, CalendarClock } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Link } from "wouter";
import { useTheme } from "@/hooks/use-theme";

// Componente para exibir resumo de tarefas recentes
function TasksSummary() {
  const { tasks } = useTasksStore();
  const { theme } = useTheme();
  
  // Ordenar tarefas por data de vencimento (as mais próximas primeiro)
  const sortedTasks = [...tasks]
    .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
    .slice(0, 3);
  
  // Classes baseadas no tema
  const cardBgClass = theme === 'light' ? 'bg-white' : 'bg-black';
  const borderClass = theme === 'light' ? 'border-terminal/20' : 'border-terminal/30';
  
  return (
    <Card className={`${cardBgClass} border ${borderClass}`}>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-tech-mono text-terminal flex items-center">
          <ListTodo className="h-4 w-4 mr-2" />
          TAREFAS PENDENTES
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4">
        {sortedTasks.length === 0 ? (
          <div className="text-terminal/60 text-sm text-center py-4">
            Nenhuma tarefa pendente
          </div>
        ) : (
          <div className="space-y-3">
            {sortedTasks.map((task) => (
              <div key={task.id} className="flex items-start">
                <div className={`w-1 h-full self-stretch mt-1 mr-2 rounded-full ${
                  new Date(task.dueDate) < new Date() ? 'bg-red-500' : 'bg-terminal'
                }`} />
                <div className="flex-1">
                  <div className="flex justify-between items-start">
                    <p className="text-sm font-medium text-terminal">
                      {task.title}
                    </p>
                    <div className={`text-xs px-1.5 py-0.5 rounded-sm flex items-center ${
                      task.status === 'completed' ? 'bg-terminal/20 text-terminal' : 
                      task.status === 'in-progress' ? 'bg-yellow-500/20 text-yellow-500' : 
                      new Date(task.dueDate) < new Date() ? 'bg-red-500/20 text-red-500' : 
                      'bg-blue-500/20 text-blue-500'
                    }`}>
                      <span>{task.status === 'completed' ? 'Concluída' : 
                        task.status === 'in-progress' ? 'Em Progresso' : 'Pendente'}</span>
                    </div>
                  </div>
                  <div className="text-xs text-terminal/60 mt-1 flex items-center">
                    <CalendarClock className="h-3 w-3 mr-1" />
                    {new Date(task.dueDate).toLocaleDateString()}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
      <CardFooter className="pt-0">
        <Link href="/productivity/tasks" className="text-xs text-terminal hover:underline">
          Ver todas as tarefas →
        </Link>
      </CardFooter>
    </Card>
  );
}

// Componente para exibir resumo de notas recentes
function NotesSummary() {
  const { notes } = useNotesStore();
  const { theme } = useTheme();
  
  // Ordenar notas por data de atualização (as mais recentes primeiro)
  const recentNotes = [...notes]
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    .slice(0, 3);
  
  // Classes baseadas no tema
  const cardBgClass = theme === 'light' ? 'bg-white' : 'bg-black';
  const borderClass = theme === 'light' ? 'border-terminal/20' : 'border-terminal/30';
  
  return (
    <Card className={`${cardBgClass} border ${borderClass}`}>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-tech-mono text-terminal flex items-center">
          <FileText className="h-4 w-4 mr-2" />
          ANOTAÇÕES RECENTES
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4">
        {recentNotes.length === 0 ? (
          <div className="text-terminal/60 text-sm text-center py-4">
            Nenhuma anotação criada
          </div>
        ) : (
          <div className="space-y-3">
            {recentNotes.map((note) => (
              <div key={note.id} className="border-b border-terminal/10 last:border-0 pb-2 last:pb-0">
                <p className="text-sm font-medium text-terminal">{note.title}</p>
                <p className="text-xs text-terminal/60 mt-1 line-clamp-2">
                  {note.content.length > 100 ? 
                    `${note.content.substring(0, 100)}...` : 
                    note.content}
                </p>
                <p className="text-xs text-terminal/40 mt-1">
                  Atualizado em {new Date(note.updatedAt).toLocaleDateString()}
                </p>
              </div>
            ))}
          </div>
        )}
      </CardContent>
      <CardFooter className="pt-0">
        <Link href="/productivity/notes" className="text-xs text-terminal hover:underline">
          Ver todas as anotações →
        </Link>
      </CardFooter>
    </Card>
  );
}

// Componente para exibir resumo de ideias recentes
function IdeasSummary() {
  const { ideas } = useIdeasStore();
  const { theme } = useTheme();
  
  // Ordenar ideias por data de criação (as mais recentes primeiro)
  const recentIdeas = [...ideas]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 3);
  
  // Classes baseadas no tema
  const cardBgClass = theme === 'light' ? 'bg-white' : 'bg-black';
  const borderClass = theme === 'light' ? 'border-terminal/20' : 'border-terminal/30';
  
  // Agrupar ideias por categoria
  const categoryCounts: Record<string, number> = {};
  ideas.forEach(idea => {
    categoryCounts[idea.category] = (categoryCounts[idea.category] || 0) + 1;
  });
  
  // Obter as 3 categorias mais populares
  const topCategories = Object.entries(categoryCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3);
  
  return (
    <Card className={`${cardBgClass} border ${borderClass}`}>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-tech-mono text-terminal flex items-center">
          <Lightbulb className="h-4 w-4 mr-2" />
          IDEIAS E INSIGHTS
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4">
        {recentIdeas.length === 0 ? (
          <div className="text-terminal/60 text-sm text-center py-4">
            Nenhuma ideia registrada
          </div>
        ) : (
          <>
            <div className="space-y-3 mb-3">
              {recentIdeas.map((idea) => (
                <div key={idea.id} className="border-b border-terminal/10 last:border-0 pb-2 last:pb-0">
                  <div className="flex justify-between">
                    <p className="text-sm font-medium text-terminal">{idea.title}</p>
                    <span className="text-[10px] px-1.5 py-0.5 bg-terminal/10 text-terminal rounded-sm">
                      {idea.category}
                    </span>
                  </div>
                  <p className="text-xs text-terminal/60 mt-1 line-clamp-2">
                    {idea.description.length > 80 ? 
                      `${idea.description.substring(0, 80)}...` : 
                      idea.description}
                  </p>
                </div>
              ))}
            </div>
            
            {topCategories.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {topCategories.map(([category, count]) => (
                  <div key={category} className="text-[10px] px-2 py-0.5 bg-terminal/10 text-terminal rounded-full">
                    {category} ({count})
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </CardContent>
      <CardFooter className="pt-0">
        <Link href="/productivity/ideas" className="text-xs text-terminal hover:underline">
          Ver todas as ideias →
        </Link>
      </CardFooter>
    </Card>
  );
}

export default function Dashboard() {
  const { user } = useAuth();
  const { theme } = useTheme();
  const [currentTime, setCurrentTime] = useState(new Date());

  // Update time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    
    return () => {
      clearInterval(timer);
    };
  }, []);

  // Menu items for quick access
  const menuItems = [
    { 
      title: "Anotações", 
      icon: <FileText className="h-8 w-8 mb-4 text-terminal" />, 
      path: "/productivity/notes",
      description: "Gerencie suas anotações e ideias"
    },
    { 
      title: "Tarefas", 
      icon: <ListTodo className="h-8 w-8 mb-4 text-terminal" />, 
      path: "/productivity/tasks",
      description: "Organize suas tarefas e atividades"
    },
    { 
      title: "Links", 
      icon: <LinkIcon className="h-8 w-8 mb-4 text-terminal" />, 
      path: "/productivity/links",
      description: "Salve e acesse links úteis"
    },
    { 
      title: "Ideias", 
      icon: <Lightbulb className="h-8 w-8 mb-4 text-terminal" />, 
      path: "/productivity/ideas",
      description: "Capture e desenvolva suas ideias"
    },
    { 
      title: "Configurações", 
      icon: <Settings className="h-8 w-8 mb-4 text-terminal" />, 
      path: "/settings",
      description: "Ajuste as configurações do sistema"
    }
  ];

  // System info
  const systemInfo = [
    { icon: <Cpu size={18} />, label: "CPU", value: "32%" },
    { icon: <HardDrive size={18} />, label: "Memória", value: "1.2/8 GB" },
    { icon: <Terminal size={18} />, label: "Processos", value: "24" },
    { icon: <Clock size={18} />, label: "Uptime", value: "12d 5h 32m" }
  ];

  // Determinar classes baseadas no tema
  const bgClass = theme === 'light' ? 'bg-zinc-100' : 'bg-black';
  const cardBgClass = theme === 'light' ? 'bg-white' : 'bg-black';
  const textClass = theme === 'light' ? 'text-zinc-800' : 'text-white';
  const borderClass = theme === 'light' ? 'border-terminal/20' : 'border-terminal/30';

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Background overlay effects */}
      <div className={`absolute inset-0 bg-grid-pattern opacity-5 pointer-events-none z-0 ${bgClass}`}></div>
      
      {/* Conteúdo principal */}
      <motion.main 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
        className={`flex-1 overflow-auto p-4 md:p-6 ${bgClass}`}
      >
        <div className="mb-6">
          <h2 className="text-2xl font-tech-mono mb-2 text-terminal terminal-shadow">
            DASHBOARD<span className="text-terminal/70">_</span>
          </h2>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <p className={`text-sm text-terminal/70 font-tech-mono`}>
              Bem-vindo, <span className="text-terminal">{user?.username}</span>
            </p>
            <p className="text-sm text-terminal/70 font-tech-mono mt-1 md:mt-0">
              {currentTime.toLocaleTimeString()} • {currentTime.toLocaleDateString()}
            </p>
          </div>
        </div>
        
        {/* Terminal Status */}
        <Card className={`${cardBgClass} border ${borderClass} mb-6`}>
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="flex items-center">
                <div className="flex items-center space-x-4 mr-8">
                  <Terminal size={24} className="text-terminal" />
                  <div>
                    <div className="text-sm font-tech-mono text-terminal">TERMINAL_OS</div>
                    <div className="text-xs text-terminal/60">v1.0.5_stable</div>
                  </div>
                </div>
                <div className="flex items-center">
                  <span className="h-2 w-2 rounded-full bg-terminal mr-2" />
                  <span className="text-xs text-terminal/80">SISTEMA ONLINE</span>
                </div>
              </div>
              
              <div className="flex flex-wrap gap-4 md:gap-6">
                {systemInfo.map((item, index) => (
                  <div key={index} className="flex items-center">
                    <div className="text-terminal/60 mr-2">{item.icon}</div>
                    <div>
                      <div className="text-xs text-terminal/60">{item.label}</div>
                      <div className="text-sm font-tech-mono text-terminal">{item.value}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Resumos e Destaques */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
          {/* Resumo de Tarefas */}
          <TasksSummary />
          
          {/* Resumo de Anotações */}
          <NotesSummary />
          
          {/* Resumo de Ideias */}
          <IdeasSummary />
        </div>
        
        {/* Menu Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
          {menuItems.map((item, index) => (
            <Link key={index} href={item.path} className="outline-none focus:ring-1 focus:ring-terminal">
              <Card className={`${cardBgClass} border ${borderClass} h-full transition-all hover:border-terminal hover:bg-terminal/5 cursor-pointer`}>
                <CardContent className="p-4 flex flex-col items-center justify-center text-center h-full">
                  {item.icon}
                  <h3 className="text-lg font-tech-mono text-terminal mb-2">{item.title}</h3>
                  <p className={`text-xs text-terminal/60`}>{item.description}</p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>

        {/* Quick Access Console */}
        <Card className={`${cardBgClass} border ${borderClass} mt-6`}>
          <CardContent className="p-4">
            <div className="font-tech-mono text-sm text-terminal/80">
              <div className="flex items-center mb-2">
                <div className="h-2 w-2 rounded-full bg-red-500 mr-2"></div>
                <div className="h-2 w-2 rounded-full bg-yellow-500 mr-2"></div>
                <div className="h-2 w-2 rounded-full bg-terminal mr-2"></div>
                <p className="text-xs ml-1 font-tech-mono text-terminal/80">terminal@os:~</p>
              </div>
              <div className="space-y-1 mt-2">
                <p>&gt; Sistema inicializado com sucesso</p>
                <p>&gt; Todos os módulos operacionais</p>
                <p>&gt; Usuário autenticado: {user?.username}</p>
                <p>&gt; Selecione um módulo para começar_<span className="animate-pulse">|</span></p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.main>
      <FloatingChat />
    </div>
  );
}