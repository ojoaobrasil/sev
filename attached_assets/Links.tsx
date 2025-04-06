
import React, { useState } from 'react';
import AppLayout from '../components/Layout/AppLayout';
import { useLinksStore } from '../store/dataStore';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { 
  Plus, 
  Search, 
  Link as LinkIcon, 
  Edit, 
  Trash2, 
  Save, 
  ExternalLink,
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
import { UsefulLink } from '../types';

const Links = () => {
  const { links, addLink, updateLink, deleteLink } = useLinksStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [currentLink, setCurrentLink] = useState<UsefulLink | null>(null);
  const [newLink, setNewLink] = useState({
    title: '',
    url: '',
    description: '',
    category: '',
  });
  const { toast } = useToast();

  // Extract unique categories for the filter
  const categories = ['all', ...Array.from(new Set(links.map(link => link.category)))];

  const filteredLinks = links
    .filter(link => 
      (link.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
      link.description.toLowerCase().includes(searchTerm.toLowerCase())) &&
      (categoryFilter === 'all' || link.category === categoryFilter)
    )
    .sort((a, b) => a.title.localeCompare(b.title));

  const handleAddLink = () => {
    if (!newLink.title.trim() || !newLink.url.trim() || !newLink.category.trim()) {
      toast({
        title: "Campos obrigatórios",
        description: "Título, URL e categoria são obrigatórios.",
        variant: "destructive",
      });
      return;
    }

    // Validate URL
    try {
      new URL(newLink.url);
    } catch (e) {
      toast({
        title: "URL inválida",
        description: "Por favor, insira uma URL válida começando com http:// ou https://.",
        variant: "destructive",
      });
      return;
    }

    addLink(newLink.title, newLink.url, newLink.description, newLink.category);
    setNewLink({
      title: '',
      url: '',
      description: '',
      category: '',
    });
    setIsAddDialogOpen(false);
    
    toast({
      title: "Link adicionado",
      description: "Seu link foi adicionado com sucesso.",
    });
  };

  const handleEditLink = () => {
    if (!currentLink || !currentLink.title.trim() || !currentLink.url.trim() || !currentLink.category.trim()) {
      toast({
        title: "Campos obrigatórios",
        description: "Título, URL e categoria são obrigatórios.",
        variant: "destructive",
      });
      return;
    }

    // Validate URL
    try {
      new URL(currentLink.url);
    } catch (e) {
      toast({
        title: "URL inválida",
        description: "Por favor, insira uma URL válida começando com http:// ou https://.",
        variant: "destructive",
      });
      return;
    }

    updateLink(currentLink.id, {
      title: currentLink.title,
      url: currentLink.url,
      description: currentLink.description,
      category: currentLink.category,
    });
    setCurrentLink(null);
    setIsEditDialogOpen(false);
    
    toast({
      title: "Link atualizado",
      description: "Seu link foi atualizado com sucesso.",
    });
  };

  const handleDeleteLink = () => {
    if (currentLink) {
      deleteLink(currentLink.id);
      setCurrentLink(null);
      setIsDeleteDialogOpen(false);
      
      toast({
        title: "Link excluído",
        description: "Seu link foi excluído com sucesso.",
      });
    }
  };

  const openExternalLink = (url: string) => {
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <AppLayout>
      <div className="animate-fadeIn">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">Links Úteis</h1>
          
          <div className="flex flex-col md:flex-row space-y-2 md:space-y-0 md:space-x-2 w-full md:w-auto mt-4 md:mt-0">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
              <Input
                placeholder="Buscar links..."
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
              Novo Link
            </Button>
          </div>
        </div>

        {filteredLinks.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredLinks.map((link) => (
              <Card key={link.id} className="bg-severino-gray border-severino-lightgray hover:border-severino-pink/50 transition-colors">
                <CardContent className="p-5">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <div className="flex items-center">
                        <span className="bg-blue-500/20 text-blue-400 text-xs px-2 py-1 rounded-full flex items-center mr-2">
                          <Tag size={12} className="mr-1" />
                          {link.category}
                        </span>
                      </div>
                    </div>
                    <div className="flex space-x-1">
                      <button
                        onClick={() => {
                          setCurrentLink(link);
                          setIsEditDialogOpen(true);
                        }}
                        className="p-1.5 text-gray-400 hover:text-white rounded-full hover:bg-severino-lightgray"
                      >
                        <Edit size={16} />
                      </button>
                      <button
                        onClick={() => {
                          setCurrentLink(link);
                          setIsDeleteDialogOpen(true);
                        }}
                        className="p-1.5 text-gray-400 hover:text-red-400 rounded-full hover:bg-severino-lightgray"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                  
                  <h3 className="font-bold text-lg mb-2 line-clamp-1">{link.title}</h3>
                  
                  <p className="text-gray-300 text-sm mb-3 line-clamp-2">{link.description}</p>
                  
                  <Button 
                    onClick={() => openExternalLink(link.url)} 
                    className="w-full bg-severino-lightgray hover:bg-severino-lightgray/80"
                  >
                    <ExternalLink size={16} className="mr-2" />
                    Abrir Link
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center p-12 bg-severino-gray rounded-lg">
            <LinkIcon size={48} className="text-gray-500 mb-4" />
            <h3 className="text-xl font-semibold mb-2">Nenhum link encontrado</h3>
            <p className="text-gray-400 text-center mb-4">
              {searchTerm || categoryFilter !== 'all' 
                ? 'Nenhum link corresponde aos seus filtros.' 
                : 'Você ainda não tem nenhum link útil.'}
            </p>
            <Button 
              onClick={() => setIsAddDialogOpen(true)} 
              className="bg-severino-pink hover:bg-severino-pink/90"
            >
              <Plus size={18} className="mr-2" />
              Adicionar Link
            </Button>
          </div>
        )}
      </div>

      {/* Add Link Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="bg-severino-gray border-severino-lightgray sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Novo Link</DialogTitle>
            <DialogDescription>
              Adicione um novo link útil.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Título</label>
              <Input
                placeholder="Título do link"
                value={newLink.title}
                onChange={(e) => setNewLink({ ...newLink, title: e.target.value })}
                className="bg-severino-lightgray border-severino-lightgray"
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">URL</label>
              <Input
                placeholder="https://exemplo.com"
                value={newLink.url}
                onChange={(e) => setNewLink({ ...newLink, url: e.target.value })}
                className="bg-severino-lightgray border-severino-lightgray"
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Descrição</label>
              <Textarea
                placeholder="Descrição do link"
                value={newLink.description}
                onChange={(e) => setNewLink({ ...newLink, description: e.target.value })}
                className="bg-severino-lightgray border-severino-lightgray min-h-[80px]"
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Categoria</label>
              <Input
                placeholder="Ex: Documentação, Ferramentas, Referência"
                value={newLink.category}
                onChange={(e) => setNewLink({ ...newLink, category: e.target.value })}
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
              onClick={handleAddLink} 
              className="bg-severino-pink hover:bg-severino-pink/90"
            >
              <Save size={16} className="mr-2" />
              Salvar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Link Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="bg-severino-gray border-severino-lightgray sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Editar Link</DialogTitle>
            <DialogDescription>
              Atualize seu link útil.
            </DialogDescription>
          </DialogHeader>
          
          {currentLink && (
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Título</label>
                <Input
                  placeholder="Título do link"
                  value={currentLink.title}
                  onChange={(e) => setCurrentLink({ ...currentLink, title: e.target.value })}
                  className="bg-severino-lightgray border-severino-lightgray"
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">URL</label>
                <Input
                  placeholder="https://exemplo.com"
                  value={currentLink.url}
                  onChange={(e) => setCurrentLink({ ...currentLink, url: e.target.value })}
                  className="bg-severino-lightgray border-severino-lightgray"
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Descrição</label>
                <Textarea
                  placeholder="Descrição do link"
                  value={currentLink.description}
                  onChange={(e) => setCurrentLink({ ...currentLink, description: e.target.value })}
                  className="bg-severino-lightgray border-severino-lightgray min-h-[80px]"
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Categoria</label>
                <Input
                  placeholder="Ex: Documentação, Ferramentas, Referência"
                  value={currentLink.category}
                  onChange={(e) => setCurrentLink({ ...currentLink, category: e.target.value })}
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
              onClick={handleEditLink} 
              className="bg-severino-pink hover:bg-severino-pink/90"
            >
              <Save size={16} className="mr-2" />
              Atualizar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Link Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="bg-severino-gray border-severino-lightgray sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Excluir Link</DialogTitle>
            <DialogDescription>
              Tem certeza que deseja excluir este link? Esta ação não pode ser desfeita.
            </DialogDescription>
          </DialogHeader>
          
          {currentLink && (
            <div className="py-4">
              <div className="p-3 bg-severino-lightgray rounded-lg">
                <div className="flex items-center mb-2">
                  <span className="bg-blue-500/20 text-blue-400 text-xs px-2 py-1 rounded-full flex items-center">
                    <Tag size={12} className="mr-1" />
                    {currentLink.category}
                  </span>
                </div>
                <h3 className="font-medium">{currentLink.title}</h3>
                <p className="text-sm text-gray-400 mt-1 truncate">{currentLink.url}</p>
                {currentLink.description && (
                  <p className="text-sm text-gray-400 line-clamp-2 mt-1">{currentLink.description}</p>
                )}
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
              onClick={handleDeleteLink} 
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

export default Links;
