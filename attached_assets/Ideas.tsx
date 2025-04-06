
import React, { useState } from 'react';
import AppLayout from '../components/Layout/AppLayout';
import { useIdeasStore } from '../store/dataStore';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { 
  Plus, 
  Search, 
  Lightbulb, 
  Edit, 
  Trash2, 
  Save, 
  Tag,
  Filter
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
import { Idea } from '../types';

const Ideas = () => {
  const { ideas, addIdea, updateIdea, deleteIdea } = useIdeasStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [currentIdea, setCurrentIdea] = useState<Idea | null>(null);
  const [newIdea, setNewIdea] = useState({
    title: '',
    description: '',
    category: '',
  });
  const { toast } = useToast();

  // Extract unique categories for the filter
  const categories = ['all', ...Array.from(new Set(ideas.map(idea => idea.category)))];

  const filteredIdeas = ideas
    .filter(idea => 
      (idea.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
      idea.description.toLowerCase().includes(searchTerm.toLowerCase())) &&
      (categoryFilter === 'all' || idea.category === categoryFilter)
    )
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const handleAddIdea = () => {
    if (!newIdea.title.trim() || !newIdea.description.trim() || !newIdea.category.trim()) {
      toast({
        title: "Campos obrigatórios",
        description: "Título, descrição e categoria são obrigatórios.",
        variant: "destructive",
      });
      return;
    }

    addIdea(newIdea.title, newIdea.description, newIdea.category);
    setNewIdea({
      title: '',
      description: '',
      category: '',
    });
    setIsAddDialogOpen(false);
    
    toast({
      title: "Ideia adicionada",
      description: "Sua ideia foi adicionada com sucesso.",
    });
  };

  const handleEditIdea = () => {
    if (!currentIdea || !currentIdea.title.trim() || !currentIdea.description.trim() || !currentIdea.category.trim()) {
      toast({
        title: "Campos obrigatórios",
        description: "Título, descrição e categoria são obrigatórios.",
        variant: "destructive",
      });
      return;
    }

    updateIdea(currentIdea.id, {
      title: currentIdea.title,
      description: currentIdea.description,
      category: currentIdea.category,
    });
    setCurrentIdea(null);
    setIsEditDialogOpen(false);
    
    toast({
      title: "Ideia atualizada",
      description: "Sua ideia foi atualizada com sucesso.",
    });
  };

  const handleDeleteIdea = () => {
    if (currentIdea) {
      deleteIdea(currentIdea.id);
      setCurrentIdea(null);
      setIsDeleteDialogOpen(false);
      
      toast({
        title: "Ideia excluída",
        description: "Sua ideia foi excluída com sucesso.",
      });
    }
  };

  return (
    <AppLayout>
      <div className="animate-fadeIn">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">Ideias</h1>
          
          <div className="flex flex-col md:flex-row space-y-2 md:space-y-0 md:space-x-2 w-full md:w-auto mt-4 md:mt-0">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
              <Input
                placeholder="Buscar ideias..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-severino-gray border-severino-lightgray"
              />
            </div>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="bg-severino-gray border-severino-lightgray">
                  <Filter size={18} className="mr-2" />
                  Categoria
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="bg-severino-gray border-severino-lightgray">
                <DropdownMenuRadioGroup value={categoryFilter} onValueChange={setCategoryFilter}>
                  {categories.map((category) => (
                    <DropdownMenuRadioItem key={category} value={category}>
                      {category === 'all' ? 'Todas as Categorias' : category}
                    </DropdownMenuRadioItem>
                  ))}
                </DropdownMenuRadioGroup>
              </DropdownMenuContent>
            </DropdownMenu>
            
            <Button 
              onClick={() => setIsAddDialogOpen(true)} 
              className="bg-severino-pink hover:bg-severino-pink/90"
            >
              <Plus size={18} className="mr-2" />
              Nova Ideia
            </Button>
          </div>
        </div>

        {filteredIdeas.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredIdeas.map((idea) => (
              <Card key={idea.id} className="bg-severino-gray border-severino-lightgray hover:border-severino-pink/50 transition-colors">
                <CardContent className="p-5">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <span className="bg-green-500/20 text-green-400 text-xs px-2 py-1 rounded-full flex items-center">
                        <Tag size={12} className="mr-1" />
                        {idea.category}
                      </span>
                    </div>
                    <div className="flex space-x-1">
                      <button
                        onClick={() => {
                          setCurrentIdea(idea);
                          setIsEditDialogOpen(true);
                        }}
                        className="p-1.5 text-gray-400 hover:text-white rounded-full hover:bg-severino-lightgray"
                      >
                        <Edit size={16} />
                      </button>
                      <button
                        onClick={() => {
                          setCurrentIdea(idea);
                          setIsDeleteDialogOpen(true);
                        }}
                        className="p-1.5 text-gray-400 hover:text-red-400 rounded-full hover:bg-severino-lightgray"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                  
                  <h3 className="font-bold text-lg mb-2">{idea.title}</h3>
                  
                  <p className="text-gray-300 text-sm mb-3">{idea.description}</p>
                  
                  <div className="text-xs text-gray-400">
                    Criado em {new Date(idea.createdAt).toLocaleDateString()}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center p-12 bg-severino-gray rounded-lg">
            <Lightbulb size={48} className="text-gray-500 mb-4" />
            <h3 className="text-xl font-semibold mb-2">Nenhuma ideia encontrada</h3>
            <p className="text-gray-400 text-center mb-4">
              {searchTerm || categoryFilter !== 'all' 
                ? 'Nenhuma ideia corresponde aos seus filtros.' 
                : 'Você ainda não registrou nenhuma ideia.'}
            </p>
            <Button 
              onClick={() => setIsAddDialogOpen(true)} 
              className="bg-severino-pink hover:bg-severino-pink/90"
            >
              <Plus size={18} className="mr-2" />
              Adicionar Ideia
            </Button>
          </div>
        )}
      </div>

      {/* Add Idea Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="bg-severino-gray border-severino-lightgray sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Nova Ideia</DialogTitle>
            <DialogDescription>
              Registre uma nova ideia para seu projeto.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Título</label>
              <Input
                placeholder="Título da ideia"
                value={newIdea.title}
                onChange={(e) => setNewIdea({ ...newIdea, title: e.target.value })}
                className="bg-severino-lightgray border-severino-lightgray"
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Descrição</label>
              <Textarea
                placeholder="Descreva sua ideia"
                value={newIdea.description}
                onChange={(e) => setNewIdea({ ...newIdea, description: e.target.value })}
                className="bg-severino-lightgray border-severino-lightgray min-h-[120px]"
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Categoria</label>
              <Input
                placeholder="Ex: Produto, Feature, Melhoria"
                value={newIdea.category}
                onChange={(e) => setNewIdea({ ...newIdea, category: e.target.value })}
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
              onClick={handleAddIdea} 
              className="bg-severino-pink hover:bg-severino-pink/90"
            >
              <Save size={16} className="mr-2" />
              Salvar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Idea Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="bg-severino-gray border-severino-lightgray sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Editar Ideia</DialogTitle>
            <DialogDescription>
              Atualize sua ideia.
            </DialogDescription>
          </DialogHeader>
          
          {currentIdea && (
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Título</label>
                <Input
                  placeholder="Título da ideia"
                  value={currentIdea.title}
                  onChange={(e) => setCurrentIdea({ ...currentIdea, title: e.target.value })}
                  className="bg-severino-lightgray border-severino-lightgray"
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Descrição</label>
                <Textarea
                  placeholder="Descreva sua ideia"
                  value={currentIdea.description}
                  onChange={(e) => setCurrentIdea({ ...currentIdea, description: e.target.value })}
                  className="bg-severino-lightgray border-severino-lightgray min-h-[120px]"
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Categoria</label>
                <Input
                  placeholder="Ex: Produto, Feature, Melhoria"
                  value={currentIdea.category}
                  onChange={(e) => setCurrentIdea({ ...currentIdea, category: e.target.value })}
                  className="bg-severino-lightgray border-severino-lightgray"
                />
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
              onClick={handleEditIdea} 
              className="bg-severino-pink hover:bg-severino-pink/90"
            >
              <Save size={16} className="mr-2" />
              Atualizar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Idea Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="bg-severino-gray border-severino-lightgray sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Excluir Ideia</DialogTitle>
            <DialogDescription>
              Tem certeza que deseja excluir esta ideia? Esta ação não pode ser desfeita.
            </DialogDescription>
          </DialogHeader>
          
          {currentIdea && (
            <div className="py-4">
              <div className="p-3 bg-severino-lightgray rounded-lg">
                <div className="flex items-center mb-2">
                  <span className="bg-green-500/20 text-green-400 text-xs px-2 py-1 rounded-full flex items-center">
                    <Tag size={12} className="mr-1" />
                    {currentIdea.category}
                  </span>
                </div>
                <h3 className="font-medium">{currentIdea.title}</h3>
                <p className="text-sm text-gray-400 line-clamp-2 mt-1">{currentIdea.description}</p>
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
              onClick={handleDeleteIdea} 
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

export default Ideas;
