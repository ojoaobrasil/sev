import React from 'react';
import { usePromptsStore } from '../store/dataStore';
import AppLayout from '../components/Layout/AppLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Pencil,
  Trash2,
  Search,
  Copy
} from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const SavedPrompts = () => {
  const { prompts, updatePrompt, deletePrompt } = usePromptsStore();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = React.useState('');
  const [isEditDialogOpen, setIsEditDialogOpen] = React.useState(false);
  const [editingPrompt, setEditingPrompt] = React.useState<{
    id: string;
    title: string;
    content: string;
    category: string;
  } | null>(null);

  const filteredPrompts = React.useMemo(() => {
    const term = searchTerm.toLowerCase();
    return prompts.filter(prompt => 
      prompt.title.toLowerCase().includes(term) ||
      prompt.content.toLowerCase().includes(term) ||
      prompt.category.toLowerCase().includes(term)
    );
  }, [prompts, searchTerm]);

  const handleCopy = (content: string) => {
    navigator.clipboard.writeText(content);
    toast({
      title: "Prompt copiado",
      description: "O prompt foi copiado para a área de transferência.",
    });
  };

  const handleEdit = (prompt: typeof editingPrompt) => {
    setEditingPrompt(prompt);
    setIsEditDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Tem certeza que deseja excluir este prompt?')) {
      deletePrompt(id);
      toast({
        title: "Prompt excluído",
        description: "O prompt foi excluído com sucesso.",
      });
    }
  };

  const handleSaveEdit = () => {
    if (!editingPrompt) return;

    if (!editingPrompt.title.trim() || !editingPrompt.category.trim()) {
      toast({
        title: "Campos obrigatórios",
        description: "Título e categoria são obrigatórios.",
        variant: "destructive",
      });
      return;
    }

    updatePrompt(editingPrompt.id, {
      title: editingPrompt.title,
      content: editingPrompt.content,
      category: editingPrompt.category,
    });

    setIsEditDialogOpen(false);
    setEditingPrompt(null);
    toast({
      title: "Prompt atualizado",
      description: "As alterações foram salvas com sucesso.",
    });
  };

  return (
    <AppLayout>
      <div className="container mx-auto p-6 space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Prompts Salvos</h1>
          <div className="flex items-center gap-4">
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
              <Input
                placeholder="Buscar prompts..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-severino-gray border-severino-lightgray"
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredPrompts.map((prompt) => (
            <Card key={prompt.id} className="bg-severino-gray border-severino-lightgray">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-lg font-bold flex-grow">
                  <div className="flex items-center justify-between">
                    <span>{prompt.title}</span>
                    <div className="flex space-x-2">
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => handleEdit(prompt)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => handleDelete(prompt.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardTitle>
                <CardDescription>
                  Categoria: {prompt.category}
                </CardDescription>
              </CardHeader>
              <CardContent className="flex-grow">
                <div className="relative min-h-[100px] group">
                  <pre className="whitespace-pre-wrap text-sm">
                    {prompt.content}
                  </pre>
                  <Button
                    variant="secondary"
                    size="icon"
                    className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => handleCopy(prompt.content)}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Editar Prompt</DialogTitle>
              <DialogDescription>
                Faça as alterações necessárias no prompt.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Título:</label>
                <Input
                  value={editingPrompt?.title ?? ''}
                  onChange={(e) => setEditingPrompt(prev => prev ? { ...prev, title: e.target.value } : null)}
                  placeholder="Digite um título para o prompt"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Categoria:</label>
                <Input
                  value={editingPrompt?.category ?? ''}
                  onChange={(e) => setEditingPrompt(prev => prev ? { ...prev, category: e.target.value } : null)}
                  placeholder="Digite uma categoria"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Conteúdo:</label>
                <textarea
                  value={editingPrompt?.content ?? ''}
                  onChange={(e) => setEditingPrompt(prev => prev ? { ...prev, content: e.target.value } : null)}
                  placeholder="Conteúdo do prompt"
                  className="w-full min-h-[200px] p-2 border rounded-md"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={handleSaveEdit}>
                Salvar Alterações
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AppLayout>
  );
};

export default SavedPrompts;