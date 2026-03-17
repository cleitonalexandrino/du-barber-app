"use client";

import React, { useEffect, useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Search, Plus, Pencil, Trash, User, SearchIcon, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";

export default function ClientManagement() {
  const [clients, setClients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [clientToDelete, setClientToDelete] = useState<any>(null);
  
  const [newClientData, setNewClientData] = useState({
    name: '',
    phone: '',
    email: ''
  });

  const fetchClients = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('clients')
      .select('*')
      .order('name');
    
    if (error) {
      toast.error('Erro ao buscar clientes');
    } else {
      setClients(data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchClients();
  }, []);

  const filteredClients = clients.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    c.phone.includes(searchTerm)
  );

  const handleDelete = async () => {
    const { error } = await supabase
      .from('clients')
      .delete()
      .eq('id', clientToDelete.id);

    if (error) {
      toast.error('Erro ao excluir cliente');
    } else {
      setClients(clients.filter(c => c.id !== clientToDelete.id));
      setIsDeleteModalOpen(false);
      toast.success('Cliente removido com sucesso!');
    }
  };

  const maskPhone = (value: string) => {
    if (!value) return "";
    value = value.replace(/\D/g, "");
    value = value.replace(/^(\d{2})(\d)/g, "($1) $2");
    value = value.replace(/(\d)(\d{4})$/, "$1-$2");
    return value.substring(0, 15);
  };

  const handleCreate = async (e: any) => {
     e.preventDefault();
     const { name, phone, email } = newClientData;

     const { error } = await supabase
        .from('clients')
        .insert({ name, phone, email });

     if (error) {
        toast.error('Erro ao cadastrar cliente: ' + error.message);
     } else {
        toast.success('Cliente cadastrado com sucesso!');
        setIsNewModalOpen(false);
        setNewClientData({ name: '', phone: '', email: '' });
        fetchClients();
     }
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-right duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-card/50 border border-border p-4 rounded-xl">
        <h2 className="text-xl font-bold flex items-center gap-2">
           <User className="w-5 h-5 text-primary" />
           Gestão de Clientes
        </h2>
        <div className="flex w-full md:w-auto gap-3">
          <div className="relative flex-1 md:w-64">
             <SearchIcon className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
             <Input 
                placeholder="Buscar cliente..." 
                className="pl-9 bg-card border-border h-10" 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
             />
          </div>
          <Dialog open={isNewModalOpen} onOpenChange={setIsNewModalOpen}>
            <DialogTrigger>
              <Button className="gap-2 h-10 px-4 font-bold shadow-lg shadow-primary/20">
                <Plus className="w-4 h-4" />
                Novo Cliente
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px] bg-card border-border text-foreground">
              <DialogHeader>
                <DialogTitle>Novo Cliente</DialogTitle>
                <DialogDescription>Preencha os dados do cliente para adicioná-lo à base.</DialogDescription>
              </DialogHeader>
              <form onSubmit={handleCreate} className="grid gap-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nome Completo</Label>
                  <Input 
                    name="name" 
                    id="name" 
                    placeholder="Ex: Jean Silva" 
                    className="bg-muted border-0 h-11" 
                    required 
                    value={newClientData.name}
                    onChange={(e) => setNewClientData({...newClientData, name: e.target.value})}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                   <div className="space-y-2">
                     <Label htmlFor="phone">Telefone</Label>
                     <Input 
                        name="phone" 
                        id="phone" 
                        placeholder="(00) 00000-0000" 
                        className="bg-muted border-0 h-11" 
                        required 
                        value={newClientData.phone}
                        onChange={(e) => setNewClientData({...newClientData, phone: maskPhone(e.target.value)})}
                     />
                   </div>
                   <div className="space-y-2">
                     <Label htmlFor="email">E-mail</Label>
                     <Input 
                        name="email" 
                        id="email" 
                        type="email" 
                        placeholder="seu@email.com" 
                        className="bg-muted border-0 h-11" 
                        value={newClientData.email}
                        onChange={(e) => setNewClientData({...newClientData, email: e.target.value})}
                     />
                   </div>
                </div>
                <DialogFooter className="mt-6">
                  <Button type="submit" className="w-full h-12 text-lg font-bold">Cadastrar</Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="bg-card border border-border rounded-xl shadow-md overflow-hidden min-h-[400px]">
        {loading ? (
          <div className="flex flex-col items-center justify-center p-20 space-y-4">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
            <p className="text-muted-foreground">Carregando clientes...</p>
          </div>
        ) : (
          <Table>
            <TableHeader className="bg-muted/50 border-b border-border">
              <TableRow className="hover:bg-transparent border-0">
                <TableHead className="font-bold text-foreground py-4">Nome</TableHead>
                <TableHead className="font-bold text-foreground py-4">Telefone</TableHead>
                <TableHead className="hidden md:table-cell font-bold text-foreground py-4">Visitas</TableHead>
                <TableHead className="hidden md:table-cell font-bold text-foreground py-4">Total Gasto</TableHead>
                <TableHead className="w-[100px] text-right py-4">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredClients.length > 0 ? filteredClients.map((client) => (
                <TableRow key={client.id} className="hover:bg-muted/30 border-border transition-colors group">
                  <TableCell className="py-4">
                     <p className="font-bold text-foreground group-hover:text-primary transition-colors">{client.name}</p>
                     <p className="text-[10px] text-muted-foreground uppercase tracking-widest">{client.email}</p>
                  </TableCell>
                  <TableCell className="text-sm font-medium">{client.phone}</TableCell>
                  <TableCell className="hidden md:table-cell text-sm font-medium">{client.visits}</TableCell>
                  <TableCell className="hidden md:table-cell text-sm font-bold text-secondary">
                    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(client.total_spent)}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground">
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button 
                         variant="ghost" 
                         size="icon" 
                         className="h-8 w-8 text-muted-foreground hover:text-destructive"
                         onClick={() => { setClientToDelete(client); setIsDeleteModalOpen(true); }}
                      >
                        <Trash className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              )) : (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-20 text-muted-foreground">Nenhum cliente encontrado.</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        )}
      </div>

      <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
         <DialogContent className="bg-card border-border text-foreground">
            <DialogHeader>
               <DialogTitle className="text-destructive font-bold">Remover Cliente</DialogTitle>
               <DialogDescription>
                  Tem certeza que deseja remover <strong>{clientToDelete?.name}</strong>? Esta ação é irreversível.
               </DialogDescription>
            </DialogHeader>
            <DialogFooter className="sm:justify-start gap-2 pt-4">
               <Button variant="destructive" onClick={handleDelete} className="font-bold">Sim, Remover</Button>
               <Button variant="ghost" onClick={() => setIsDeleteModalOpen(false)}>Cancelar</Button>
            </DialogFooter>
         </DialogContent>
      </Dialog>
    </div>
  );
}
