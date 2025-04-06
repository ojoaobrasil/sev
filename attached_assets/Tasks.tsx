
import React, { useState } from 'react';
import AppLayout from '../components/Layout/AppLayout';
import { useTasksStore } from '../store/dataStore';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { 
  Plus, 
  Search, 
  Calendar, 
  CheckSquare, 
  Edit, 
  Trash2, 
  Save, 
  Clock,
  Filter,
  Check
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from '@/components/ui/use-toast';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Task } from '../types';

const Tasks = () => {
  const { tasks, addTask, updateTask, updateTaskStatus, deleteTask } = useTasksStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<Task['status'] | 'all'>('all');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [currentTask, setCurrentTask] = useState<Task | null>(null);
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    dueDate: new Date().toISOString().split('T')[0],
  });
  const { toast } = useToast();

  const filteredTasks = tasks
    .filter(task => 
      (task.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
      task.description.toLowerCase().includes(searchTerm.toLowerCase())) &&
      (statusFilter === 'all' || task.status === statusFilter)
    )
    .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString();
  };

  const getStatusColor = (status: Task['status']) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-500/20 text-yellow-400';
      case 'in-progress':
        return 'bg-blue-500/20 text-blue-400';
      case 'completed':
        return 'bg-green-500/20 text-green-400';
      default:
        return 'bg-gray-500/20 text-gray-400';
    }
  };

  const getStatusLabel = (status: Task['status']) => {
    switch (status) {
      case 'pending':
        return 'Pendente';
      case 'in-progress':
        return 'Em Progresso';
      case 'completed':
        return 'Concluída';
      default:
        return 'Desconhecido';
    }
  };

  const handleAddTask = () => {
    if (!newTask.title.trim() || !newTask.description.trim() || !newTask.dueDate) {
      toast({
        title: "Campos obrigatórios",
        description: "Preencha todos os campos obrigatórios.",
        variant: "destructive",
      });
      return;
    }

    addTask(newTask.title, newTask.description, new Date(newTask.dueDate));
    setNewTask({
      title: '',
      description: '',
      dueDate: new Date().toISOString().split('T')[0],
    });
    setIsAddDialogOpen(false);
    
    toast({
      title: "Tarefa adicionada",
      description: "Sua tarefa foi adicionada com sucesso.",
    });
  };

  const handleEditTask = () => {
    if (!currentTask || !currentTask.title.trim() || !currentTask.description.trim()) {
      toast({
        title: "Campos obrigatórios",
        description: "Preencha todos os campos obrigatórios.",
        variant: "destructive",
      });
      return;
    }

    updateTask(currentTask.id, {
      title: currentTask.title,
      description: currentTask.description,
      dueDate: new Date(currentTask.dueDate),
    });
    setCurrentTask(null);
    setIsEditDialogOpen(false);
    
    toast({
      title: "Tarefa atualizada",
      description: "Sua tarefa foi atualizada com sucesso.",
    });
  };

  const handleDeleteTask = () => {
    if (currentTask) {
      deleteTask(currentTask.id);
      setCurrentTask(null);
      setIsDeleteDialogOpen(false);
      
      toast({
        title: "Tarefa excluída",
        description: "Sua tarefa foi excluída com sucesso.",
      });
    }
  };

  const handleStatusChange = (taskId: string, newStatus: Task['status']) => {
    updateTaskStatus(taskId, newStatus);
    
    toast({
      title: "Status atualizado",
      description: `Tarefa marcada como ${getStatusLabel(newStatus)}.`,
    });
  };

  return (
    <AppLayout>
      <div className="animate-fadeIn">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">Tarefas</h1>
          
          <div className="flex flex-col md:flex-row space-y-2 md:space-y-0 md:space-x-2 w-full md:w-auto mt-4 md:mt-0">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
              <Input
                placeholder="Buscar tarefas..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-severino-gray border-severino-lightgray"
              />
            </div>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="bg-severino-gray border-severino-lightgray">
                  <Filter size={18} className="mr-2" />
                  Filtrar
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="bg-severino-gray border-severino-lightgray">
                <DropdownMenuRadioGroup value={statusFilter} onValueChange={(value) => setStatusFilter(value as any)}>
                  <DropdownMenuRadioItem value="all">Todas</DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="pending">Pendentes</DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="in-progress">Em Progresso</DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="completed">Concluídas</DropdownMenuRadioItem>
                </DropdownMenuRadioGroup>
              </DropdownMenuContent>
            </DropdownMenu>
            
            <Button 
              onClick={() => setIsAddDialogOpen(true)} 
              className="bg-severino-pink hover:bg-severino-pink/90"
            >
              <Plus size={18} className="mr-2" />
              Nova Tarefa
            </Button>
          </div>
        </div>

        {filteredTasks.length > 0 ? (
          <div className="space-y-4">
            {filteredTasks.map((task) => (
              <Card key={task.id} className="bg-severino-gray border-severino-lightgray hover:border-severino-pink/50 transition-colors">
                <CardContent className="p-5">
                  <div className="flex flex-col md:flex-row md:items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center mb-2">
                        <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(task.status)} mr-2`}>
                          {getStatusLabel(task.status)}
                        </span>
                        <div className="flex items-center text-sm text-gray-400">
                          <Calendar size={14} className="mr-1" />
                          {formatDate(task.dueDate)}
                        </div>
                      </div>
                      
                      <h3 className="font-bold text-lg mb-1">{task.title}</h3>
                      <p className="text-gray-300 text-sm">{task.description}</p>
                    </div>
                    
                    <div className="flex mt-4 md:mt-0 space-x-2">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button 
                            variant="outline" 
                            className="bg-severino-lightgray border-severino-lightgray h-9"
                          >
                            <CheckSquare size={16} className="mr-2" />
                            Status
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="bg-severino-gray border-severino-lightgray">
                          <DropdownMenuRadioGroup value={task.status} onValueChange={(value) => handleStatusChange(task.id, value as Task['status'])}>
                            <DropdownMenuRadioItem value="pending">Pendente</DropdownMenuRadioItem>
                            <DropdownMenuRadioItem value="in-progress">Em Progresso</DropdownMenuRadioItem>
                            <DropdownMenuRadioItem value="completed">Concluída</DropdownMenuRadioItem>
                          </DropdownMenuRadioGroup>
                        </DropdownMenuContent>
                      </DropdownMenu>
                      
                      <Button 
                        variant="outline" 
                        className="bg-severino-lightgray border-severino-lightgray h-9"
                        onClick={() => {
                          setCurrentTask(task);
                          setIsEditDialogOpen(true);
                        }}
                      >
                        <Edit size={16} />
                      </Button>
                      
                      <Button 
                        variant="outline" 
                        className="bg-severino-lightgray border-severino-lightgray h-9 hover:text-red-400"
                        onClick={() => {
                          setCurrentTask(task);
                          setIsDeleteDialogOpen(true);
                        }}
                      >
                        <Trash2 size={16} />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center p-12 bg-severino-gray rounded-lg">
            <CheckSquare size={48} className="text-gray-500 mb-4" />
            <h3 className="text-xl font-semibold mb-2">Nenhuma tarefa encontrada</h3>
            <p className="text-gray-400 text-center mb-4">
              {searchTerm || statusFilter !== 'all' 
                ? 'Nenhuma tarefa corresponde aos seus filtros.' 
                : 'Você ainda não tem nenhuma tarefa.'}
            </p>
            <Button 
              onClick={() => setIsAddDialogOpen(true)} 
              className="bg-severino-pink hover:bg-severino-pink/90"
            >
              <Plus size={18} className="mr-2" />
              Criar Tarefa
            </Button>
          </div>
        )}
      </div>

      {/* Add Task Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="bg-severino-gray border-severino-lightgray sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Nova Tarefa</DialogTitle>
            <DialogDescription>
              Crie uma nova tarefa para seu projeto.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Título</label>
              <Input
                placeholder="Título da tarefa"
                value={newTask.title}
                onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                className="bg-severino-lightgray border-severino-lightgray"
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Descrição</label>
              <Textarea
                placeholder="Descrição da tarefa"
                value={newTask.description}
                onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                className="bg-severino-lightgray border-severino-lightgray min-h-[100px]"
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Data de Vencimento</label>
              <Input
                type="date"
                value={newTask.dueDate}
                onChange={(e) => setNewTask({ ...newTask, dueDate: e.target.value })}
                className="bg-severino-lightgray border-severino-lightgray"
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button 
              onClick={() => setIsAddDialogOpen(false)} 
              variant="outline"
              className="bg-severino-lightgray text-white border-severino-lightgray hover:bg-severino-lightgray/80"
            >
              Cancelar
            </Button>
            <Button 
              onClick={handleAddTask} 
              className="bg-severino-pink hover:bg-severino-pink/90"
            >
              <Save size={16} className="mr-2" />
              Salvar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Task Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="bg-severino-gray border-severino-lightgray sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Editar Tarefa</DialogTitle>
            <DialogDescription>
              Atualize sua tarefa.
            </DialogDescription>
          </DialogHeader>
          
          {currentTask && (
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Título</label>
                <Input
                  placeholder="Título da tarefa"
                  value={currentTask.title}
                  onChange={(e) => setCurrentTask({ ...currentTask, title: e.target.value })}
                  className="bg-severino-lightgray border-severino-lightgray"
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Descrição</label>
                <Textarea
                  placeholder="Descrição da tarefa"
                  value={currentTask.description}
                  onChange={(e) => setCurrentTask({ ...currentTask, description: e.target.value })}
                  className="bg-severino-lightgray border-severino-lightgray min-h-[100px]"
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Data de Vencimento</label>
                <Input
                  type="date"
                  value={new Date(currentTask.dueDate).toISOString().split('T')[0]}
                  onChange={(e) => setCurrentTask({ 
                    ...currentTask, 
                    dueDate: new Date(e.target.value) 
                  })}
                  className="bg-severino-lightgray border-severino-lightgray"
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Status</label>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button 
                      variant="outline" 
                      className="bg-severino-lightgray border-severino-lightgray w-full justify-start"
                    >
                      <span className={`w-3 h-3 rounded-full mr-2 ${
                        currentTask.status === 'pending' ? 'bg-yellow-400' :
                        currentTask.status === 'in-progress' ? 'bg-blue-400' :
                        'bg-green-400'
                      }`}></span>
                      {getStatusLabel(currentTask.status)}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="bg-severino-gray border-severino-lightgray">
                    <DropdownMenuRadioGroup 
                      value={currentTask.status} 
                      onValueChange={(value) => setCurrentTask({ 
                        ...currentTask, 
                        status: value as Task['status'] 
                      })}
                    >
                      <DropdownMenuRadioItem value="pending">Pendente</DropdownMenuRadioItem>
                      <DropdownMenuRadioItem value="in-progress">Em Progresso</DropdownMenuRadioItem>
                      <DropdownMenuRadioItem value="completed">Concluída</DropdownMenuRadioItem>
                    </DropdownMenuRadioGroup>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          )}
          
          <DialogFooter>
            <Button 
              onClick={() => setIsEditDialogOpen(false)} 
              variant="outline"
              className="bg-severino-lightgray text-white border-severino-lightgray hover:bg-severino-lightgray/80"
            >
              Cancelar
            </Button>
            <Button 
              onClick={handleEditTask} 
              className="bg-severino-pink hover:bg-severino-pink/90"
            >
              <Save size={16} className="mr-2" />
              Atualizar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Task Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="bg-severino-gray border-severino-lightgray sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Excluir Tarefa</DialogTitle>
            <DialogDescription>
              Tem certeza que deseja excluir esta tarefa? Esta ação não pode ser desfeita.
            </DialogDescription>
          </DialogHeader>
          
          {currentTask && (
            <div className="py-4">
              <div className="p-3 bg-severino-lightgray rounded-lg">
                <div className="flex items-center mb-2">
                  <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(currentTask.status)} mr-2`}>
                    {getStatusLabel(currentTask.status)}
                  </span>
                  <div className="flex items-center text-xs text-gray-400">
                    <Calendar size={12} className="mr-1" />
                    {formatDate(currentTask.dueDate)}
                  </div>
                </div>
                <h3 className="font-medium">{currentTask.title}</h3>
                <p className="text-sm text-gray-400 line-clamp-2 mt-1">{currentTask.description}</p>
              </div>
            </div>
          )}
          
          <DialogFooter>
            <Button 
              onClick={() => setIsDeleteDialogOpen(false)} 
              variant="outline"
              className="bg-severino-lightgray text-white border-severino-lightgray hover:bg-severino-lightgray/80"
            >
              Cancelar
            </Button>
            <Button 
              onClick={handleDeleteTask} 
              variant="destructive"
            >
              <Trash2 size={16} className="mr-2" />
              Excluir
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
};

export default Tasks;
