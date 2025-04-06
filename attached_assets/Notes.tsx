
import React, { useState, useEffect } from 'react';
import AppLayout from '../components/Layout/AppLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  Save, 
  X, 
  FileText,
  Loader2 
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
import { supabase } from '@/integrations/supabase/client';
import { useAuthStore } from '@/store/authStore';
import { SupabaseNote } from '@/types';

const Notes = () => {
  const [notes, setNotes] = useState<SupabaseNote[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [currentNote, setCurrentNote] = useState<{ id: string; title: string; content: string } | null>(null);
  const [newNote, setNewNote] = useState({ title: '', content: '' });
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const { toast } = useToast();
  const { user } = useAuthStore();

  const fetchNotes = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('notes')
        .select('*')
        .order('updated_at', { ascending: false });
        
      if (error) {
        console.error('Error fetching notes:', error);
        toast({
          title: "Erro ao carregar anotações",
          description: error.message,
          variant: "destructive",
        });
        return;
      }
      
      setNotes(data || []);
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: "Erro inesperado",
        description: "Ocorreu um erro ao carregar suas anotações.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotes();
    
    const notesSubscription = supabase
      .channel('public:notes')
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'notes' 
        }, 
        () => {
          fetchNotes();
        }
      )
      .subscribe();
      
    return () => {
      supabase.removeChannel(notesSubscription);
    };
  }, [user]);

  const filteredNotes = notes.filter(note => 
    note.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
    (note.content && note.content.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleAddNote = async () => {
    if (!user) return;
    
    if (!newNote.title.trim() || !newNote.content.trim()) {
      toast({
        title: "Campos obrigatórios",
        description: "Título e conteúdo são obrigatórios.",
        variant: "destructive",
      });
      return;
    }

    try {
      setActionLoading(true);
      
      const { error } = await supabase
        .from('notes')
        .insert({
          title: newNote.title,
          content: newNote.content,
          user_id: user.id,
        });
        
      if (error) {
        console.error('Error adding note:', error);
        toast({
          title: "Erro ao adicionar anotação",
          description: error.message,
          variant: "destructive",
        });
        return;
      }
      
      setNewNote({ title: '', content: '' });
      setIsAddDialogOpen(false);
      
      toast({
        title: "Anotação adicionada",
        description: "Sua anotação foi adicionada com sucesso.",
      });
      
      fetchNotes();
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: "Erro inesperado",
        description: "Ocorreu um erro ao adicionar sua anotação.",
        variant: "destructive",
      });
    } finally {
      setActionLoading(false);
    }
  };

  const handleEditNote = async () => {
    if (!user || !currentNote) return;
    
    if (!currentNote.title.trim() || !currentNote.content.trim()) {
      toast({
        title: "Campos obrigatórios",
        description: "Título e conteúdo são obrigatórios.",
        variant: "destructive",
      });
      return;
    }

    try {
      setActionLoading(true);
      
      const { error } = await supabase
        .from('notes')
        .update({
          title: currentNote.title,
          content: currentNote.content,
          updated_at: new Date().toISOString(),
        })
        .eq('id', currentNote.id);
        
      if (error) {
        console.error('Error updating note:', error);
        toast({
          title: "Erro ao atualizar anotação",
          description: error.message,
          variant: "destructive",
        });
        return;
      }
      
      setCurrentNote(null);
      setIsEditDialogOpen(false);
      
      toast({
        title: "Anotação atualizada",
        description: "Sua anotação foi atualizada com sucesso.",
      });
      
      fetchNotes();
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: "Erro inesperado",
        description: "Ocorreu um erro ao atualizar sua anotação.",
        variant: "destructive",
      });
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteNote = async () => {
    if (!user || !currentNote) return;
    
    try {
      setActionLoading(true);
      
      const { error } = await supabase
        .from('notes')
        .delete()
        .eq('id', currentNote.id);
        
      if (error) {
        console.error('Error deleting note:', error);
        toast({
          title: "Erro ao excluir anotação",
          description: error.message,
          variant: "destructive",
        });
        return;
      }
      
      setCurrentNote(null);
      setIsDeleteDialogOpen(false);
      
      toast({
        title: "Anotação excluída",
        description: "Sua anotação foi excluída com sucesso.",
      });
      
      fetchNotes();
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: "Erro inesperado",
        description: "Ocorreu um erro ao excluir sua anotação.",
        variant: "destructive",
      });
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <AppLayout>
      <div className="animate-fadeIn">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">Anotações</h1>
          
          <div className="flex flex-col md:flex-row space-y-2 md:space-y-0 md:space-x-2 w-full md:w-auto mt-4 md:mt-0">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
              <Input
                placeholder="Buscar anotações..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Button 
              onClick={() => setIsAddDialogOpen(true)}
            >
              <Plus size={18} className="mr-2" />
              Nova Anotação
            </Button>
          </div>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center p-12 bg-card rounded-lg">
            <Loader2 size={48} className="text-primary animate-spin mb-4" />
            <h3 className="text-xl font-semibold mb-2">Carregando anotações</h3>
            <p className="text-muted-foreground text-center">
              Aguarde enquanto carregamos suas anotações...
            </p>
          </div>
        ) : filteredNotes.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredNotes.map((note) => (
              <Card key={note.id} className="hover:border-primary/50 transition-colors">
                <CardContent className="p-5">
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="font-bold text-lg line-clamp-1">{note.title}</h3>
                    <div className="flex space-x-1">
                      <button
                        onClick={() => {
                          setCurrentNote({
                            id: note.id,
                            title: note.title,
                            content: note.content || '',
                          });
                          setIsEditDialogOpen(true);
                        }}
                        className="p-1.5 text-muted-foreground hover:text-foreground rounded-full hover:bg-muted"
                      >
                        <Edit size={16} />
                      </button>
                      <button
                        onClick={() => {
                          setCurrentNote({
                            id: note.id,
                            title: note.title,
                            content: note.content || '',
                          });
                          setIsDeleteDialogOpen(true);
                        }}
                        className="p-1.5 text-muted-foreground hover:text-destructive rounded-full hover:bg-muted"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                  
                  <div className="text-foreground/80 text-sm line-clamp-4 mb-3">
                    {note.content}
                  </div>
                  
                  <div className="text-xs text-muted-foreground">
                    Atualizado em {new Date(note.updated_at).toLocaleDateString()}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center p-12 bg-card rounded-lg">
            <FileText size={48} className="text-muted-foreground mb-4" />
            <h3 className="text-xl font-semibold mb-2">Nenhuma anotação encontrada</h3>
            <p className="text-muted-foreground text-center mb-4">
              {searchTerm ? 'Nenhuma anotação corresponde à sua busca.' : 'Você ainda não tem nenhuma anotação.'}
            </p>
            <Button 
              onClick={() => setIsAddDialogOpen(true)}
            >
              <Plus size={18} className="mr-2" />
              Criar Anotação
            </Button>
          </div>
        )}
      </div>

      {/* Add Note Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Nova Anotação</DialogTitle>
            <DialogDescription>
              Crie uma nova anotação para seu projeto.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Título</label>
              <Input
                placeholder="Título da anotação"
                value={newNote.title}
                onChange={(e) => setNewNote({ ...newNote, title: e.target.value })}
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Conteúdo</label>
              <Textarea
                placeholder="Conteúdo da anotação"
                value={newNote.content}
                onChange={(e) => setNewNote({ ...newNote, content: e.target.value })}
                className="min-h-[150px]"
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button 
              onClick={() => setIsAddDialogOpen(false)} 
              variant="outline"
            >
              Cancelar
            </Button>
            <Button 
              onClick={handleAddNote}
              disabled={actionLoading}
            >
              {actionLoading ? (
                <>
                  <Loader2 size={16} className="mr-2 animate-spin" />
                  Salvando...
                </>
              ) : (
                <>
                  <Save size={16} className="mr-2" />
                  Salvar
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Note Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Editar Anotação</DialogTitle>
            <DialogDescription>
              Atualize sua anotação.
            </DialogDescription>
          </DialogHeader>
          
          {currentNote && (
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Título</label>
                <Input
                  placeholder="Título da anotação"
                  value={currentNote.title}
                  onChange={(e) => setCurrentNote({ ...currentNote, title: e.target.value })}
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Conteúdo</label>
                <Textarea
                  placeholder="Conteúdo da anotação"
                  value={currentNote.content}
                  onChange={(e) => setCurrentNote({ ...currentNote, content: e.target.value })}
                  className="min-h-[150px]"
                />
              </div>
            </div>
          )}
          
          <DialogFooter>
            <Button 
              onClick={() => setIsEditDialogOpen(false)} 
              variant="outline"
            >
              Cancelar
            </Button>
            <Button 
              onClick={handleEditNote}
              disabled={actionLoading}
            >
              {actionLoading ? (
                <>
                  <Loader2 size={16} className="mr-2 animate-spin" />
                  Atualizando...
                </>
              ) : (
                <>
                  <Save size={16} className="mr-2" />
                  Atualizar
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Note Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Excluir Anotação</DialogTitle>
            <DialogDescription>
              Tem certeza que deseja excluir esta anotação? Esta ação não pode ser desfeita.
            </DialogDescription>
          </DialogHeader>
          
          {currentNote && (
            <div className="py-4">
              <div className="p-3 bg-muted rounded-lg">
                <h3 className="font-medium">{currentNote.title}</h3>
                <p className="text-sm text-muted-foreground line-clamp-2 mt-1">{currentNote.content}</p>
              </div>
            </div>
          )}
          
          <DialogFooter>
            <Button 
              onClick={() => setIsDeleteDialogOpen(false)} 
              variant="outline"
            >
              Cancelar
            </Button>
            <Button 
              onClick={handleDeleteNote} 
              variant="destructive"
              disabled={actionLoading}
            >
              {actionLoading ? (
                <>
                  <Loader2 size={16} className="mr-2 animate-spin" />
                  Excluindo...
                </>
              ) : (
                <>
                  <Trash2 size={16} className="mr-2" />
                  Excluir
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
};

export default Notes;
