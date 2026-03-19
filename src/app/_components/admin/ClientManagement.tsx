"use client";

import React, { useEffect, useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Search, Plus, Pencil, Trash, User, SearchIcon, Loader2, Mail, Phone, Lock, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";

export default function ClientManagement() {
  const [clients, setClients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<any>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [clientToDelete, setClientToDelete] = useState<any>(null);
  
  const [newClientData, setNewClientData] = useState({
    name: '',
    phone: '',
    email: '',
    password: 'cliente123'
  });

  const [editClientData, setEditClientData] = useState({
    name: '',
    phone: '',
    email: '',
    password: ''
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

  const handleEdit = async (e: any) => {
    e.preventDefault();
    const { error } = await supabase
      .from('clients')
      .update(editClientData)
      .eq('id', editingClient.id);

    if (error) {
       toast.error('Erro ao atualizar cliente: ' + error.message);
    } else {
       toast.success('Cliente atualizado com sucesso!');
       setIsEditModalOpen(false);
       fetchClients();
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
     const { name, phone, email, password } = newClientData;

     const { error } = await supabase
        .from('clients')
        .insert({ name, phone, email, password });

     if (error) {
        toast.error('Erro ao cadastrar cliente: ' + error.message);
     } else {
        toast.success('Cliente cadastrado com sucesso!');
        setIsNewModalOpen(false);
        setNewClientData({ name: '', phone: '', email: '', password: 'cliente123' });
        fetchClients();
     }
  };

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-right-8 duration-1000 ease-out fill-mode-both">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-white p-8 rounded-[2rem] shadow-[0_10px_40px_-15px_rgba(0,0,0,0.05)] border border-border">
        <div className="space-y-1">
          <h2 className="text-3xl font-serif font-bold tracking-tight text-primary flex items-center gap-3">
             <User className="w-8 h-8 text-accent" />
             Base de Clientes
          </h2>
          <p className="text-muted-foreground text-sm font-medium">Relacionamento e histórico de quem confia na sua arte.</p>
        </div>
        <div className="flex w-full md:w-auto gap-4">
          <div className="relative flex-1 md:w-64 group">
             <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-accent transition-colors" />
             <Input 
                placeholder="Nome ou telefone..." 
                className="pl-11 bg-slate-50 border-border h-14 rounded-2xl focus-visible:ring-accent transition-all" 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
             />
          </div>
          <Dialog open={isNewModalOpen} onOpenChange={setIsNewModalOpen}>
            <DialogTrigger 
              render={
                <Button className="gap-3 h-14 px-8 font-bold uppercase tracking-widest bg-accent hover:bg-accent/90 text-white border-none rounded-2xl shadow-[0_10px_20px_-5px_rgba(222,0,0,0.3)] transition-all hover:scale-105 active:scale-95">
                  <Plus className="w-5 h-5" />
                  Novo Cliente
                </Button>
              }
            />
            <DialogContent className="sm:max-w-[450px] bg-white border-border rounded-[2.5rem] p-10 shadow-2xl overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16" />
              <DialogHeader className="relative z-10 space-y-4">
                <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center">
                   <Sparkles className="w-8 h-8 text-primary" />
                </div>
                <DialogTitle className="text-3xl font-serif font-bold text-primary">Novo Cliente</DialogTitle>
                <DialogDescription className="font-medium">Cadastre um novo cliente na base da Du Barber.</DialogDescription>
              </DialogHeader>
              <form onSubmit={handleCreate} className="grid gap-6 py-8 relative z-10">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-[10px] font-bold uppercase tracking-widest text-primary/60">Nome do Cliente</Label>
                  <Input 
                    name="name" 
                    id="name" 
                    placeholder="Ex: Rodrigo Faro" 
                    className="bg-slate-50 border-border h-14 rounded-2xl focus-visible:ring-accent" 
                    required 
                    value={newClientData.name}
                    onChange={(e) => setNewClientData({...newClientData, name: e.target.value})}
                  />
                </div>
                <div className="grid grid-cols-2 gap-6">
                   <div className="space-y-2">
                     <Label htmlFor="phone" className="text-[10px] font-bold uppercase tracking-widest text-primary/60">WhatsApp</Label>
                     <Input 
                        name="phone" 
                        id="phone" 
                        placeholder="(11) 99999-9999" 
                        className="bg-slate-50 border-border h-14 rounded-2xl focus-visible:ring-accent" 
                        required 
                        value={newClientData.phone}
                        onChange={(e) => setNewClientData({...newClientData, phone: maskPhone(e.target.value)})}
                     />
                   </div>
                   <div className="space-y-2">
                     <Label htmlFor="password" className="text-[10px] font-bold uppercase tracking-widest text-primary/60">Senha Provisória</Label>
                     <Input 
                        name="password" 
                        id="password" 
                        type="text"
                        className="bg-slate-50 border-border h-14 rounded-2xl focus-visible:ring-accent font-bold tracking-widest" 
                        required
                        value={newClientData.password}
                        onChange={(e) => setNewClientData({...newClientData, password: e.target.value})}
                     />
                   </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-[10px] font-bold uppercase tracking-widest text-primary/60">E-mail (Opcional)</Label>
                  <Input 
                    name="email" 
                    id="email" 
                    type="email" 
                    placeholder="cliente@exemplo.com" 
                    className="bg-slate-50 border-border h-14 rounded-2xl focus-visible:ring-accent" 
                    value={newClientData.email}
                    onChange={(e) => setNewClientData({...newClientData, email: e.target.value})}
                  />
                </div>
                <DialogFooter className="mt-6">
                  <Button type="submit" className="w-full h-16 text-xl font-bold uppercase tracking-widest bg-primary hover:bg-primary/95 text-white rounded-2xl shadow-xl shadow-primary/20 transition-all">Salvar Cadastro</Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="bg-white border border-border rounded-[2.5rem] shadow-[0_10px_40px_-15px_rgba(0,0,0,0.05)] overflow-hidden min-h-[400px]">
        {loading ? (
          <div className="flex flex-col items-center justify-center p-32 space-y-6">
            <Loader2 className="w-16 h-16 animate-spin text-primary opacity-20" />
            <p className="font-serif text-muted-foreground text-lg">Localizando clientes...</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-slate-50 border-b border-border">
                <TableRow className="hover:bg-transparent border-0">
                  <TableHead className="font-bold text-primary uppercase tracking-widest text-[10px] py-6 px-8">Cliente</TableHead>
                  <TableHead className="font-bold text-primary uppercase tracking-widest text-[10px] py-6">Contato</TableHead>
                  <TableHead className="hidden md:table-cell font-bold text-primary uppercase tracking-widest text-[10px] py-6 text-center">Visitas</TableHead>
                  <TableHead className="hidden md:table-cell font-bold text-primary uppercase tracking-widest text-[10px] py-6">Faturamento Acumulado</TableHead>
                  <TableHead className="w-[120px] text-right py-6 px-8 font-bold text-primary uppercase tracking-widest text-[10px]">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredClients.length > 0 ? filteredClients.map((client) => (
                  <TableRow key={client.id} className="hover:bg-slate-50/80 border-border transition-all duration-300 group">
                    <TableCell className="py-6 px-8">
                       <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center border border-border shadow-inner group-hover:bg-primary/5 transition-colors">
                             <User className="w-6 h-6 text-primary/40 group-hover:text-accent transition-colors" />
                          </div>
                          <div>
                             <p className="font-serif font-bold text-xl text-primary leading-tight group-hover:text-accent transition-colors">{client.name}</p>
                             <div className="flex items-center gap-2 mt-0.5">
                                <Mail className="w-3 h-3 text-muted-foreground" />
                                <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">{client.email || 'SEM E-MAIL'}</p>
                             </div>
                          </div>
                       </div>
                    </TableCell>
                    <TableCell className="py-6">
                       <div className="flex items-center gap-2 text-sm font-bold text-primary/70 bg-slate-50 px-3 py-1.5 rounded-full border border-border w-fit">
                          <Phone className="w-3.5 h-3.5 text-accent" />
                          {client.phone}
                       </div>
                    </TableCell>
                    <TableCell className="hidden md:table-cell text-center py-6">
                       <span className="text-lg font-serif font-bold text-primary tabular-nums group-hover:scale-125 transition-transform inline-block">{client.visits || 0}</span>
                    </TableCell>
                    <TableCell className="hidden md:table-cell py-6">
                       <div className="flex items-center gap-1.5 font-bold text-primary tracking-tighter text-lg">
                          <span className="text-xs font-bold text-muted-foreground">R$</span>
                          {new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 2 }).format(client.total_spent || 0)}
                       </div>
                    </TableCell>
                    <TableCell className="text-right px-8 py-6">
                      <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all -translate-x-4 group-hover:translate-x-0">
                        <Button 
                           variant="ghost" 
                           size="icon" 
                           className="h-10 w-10 bg-white border border-border rounded-xl text-muted-foreground hover:text-primary hover:border-primary hover:shadow-lg transition-all"
                           onClick={() => {
                              setEditingClient(client);
                              setEditClientData({
                                 name: client.name,
                                 phone: client.phone,
                                 email: client.email || '',
                                 password: client.password || 'cliente123'
                              });
                              setIsEditModalOpen(true);
                           }}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button 
                           variant="ghost" 
                           size="icon" 
                           className="h-10 w-10 bg-white border border-border rounded-xl text-muted-foreground hover:text-destructive hover:border-destructive hover:shadow-lg transition-all"
                           onClick={() => { setClientToDelete(client); setIsDeleteModalOpen(true); }}
                        >
                          <Trash className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                )) : (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-32 text-muted-foreground font-serif text-lg">Ainda não encontramos clientes nos registros.</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        )}
      </div>

      {/* Modernized Modals */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="sm:max-w-[450px] bg-white border-border rounded-[2.5rem] p-10 shadow-2xl overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16" />
          <DialogHeader className="relative z-10 space-y-4">
            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center">
              <Pencil className="w-8 h-8 text-primary" />
            </div>
            <DialogTitle className="text-3xl font-serif font-bold text-primary">Ficha do Cliente</DialogTitle>
            <DialogDescription className="font-medium">Atualize as informações de cadastro e acesso.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleEdit} className="grid gap-6 py-8 relative z-10">
            <div className="space-y-2">
              <Label htmlFor="edit-name" className="text-[10px] font-bold uppercase tracking-widest text-primary/60">Nome Completo</Label>
              <Input 
                id="edit-name" 
                className="bg-slate-50 border-border h-14 rounded-2xl focus-visible:ring-accent" 
                required 
                value={editClientData.name}
                onChange={(e) => setEditClientData({...editClientData, name: e.target.value})}
              />
            </div>
            <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="edit-phone" className="text-[10px] font-bold uppercase tracking-widest text-primary/60">Contato</Label>
                  <Input 
                    id="edit-phone" 
                    className="bg-slate-50 border-border h-14 rounded-2xl focus-visible:ring-accent tabular-nums" 
                    required 
                    value={editClientData.phone}
                    onChange={(e) => setEditClientData({...editClientData, phone: maskPhone(e.target.value)})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-password" className="text-[10px] font-bold uppercase tracking-widest text-primary/60 flex items-center gap-1.5"><Lock className="w-2.5 h-2.5" /> Senha</Label>
                  <Input 
                    id="edit-password" 
                    className="bg-slate-50 border-border h-14 rounded-2xl focus-visible:ring-accent font-bold tracking-widest" 
                    required 
                    value={editClientData.password}
                    onChange={(e) => setEditClientData({...editClientData, password: e.target.value})}
                  />
                </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-email" className="text-[10px] font-bold uppercase tracking-widest text-primary/60">E-mail</Label>
              <Input 
                id="edit-email" 
                className="bg-slate-50 border-border h-14 rounded-2xl focus-visible:ring-accent" 
                value={editClientData.email}
                onChange={(e) => setEditClientData({...editClientData, email: e.target.value})}
              />
            </div>
            <DialogFooter className="mt-6">
              <Button type="submit" className="w-full h-16 text-xl font-bold uppercase tracking-widest bg-primary hover:bg-primary/95 text-white rounded-2xl shadow-xl shadow-primary/20">Confirmar Alterações</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
         <DialogContent className="bg-white border-border rounded-[2.5rem] p-10 shadow-2xl">
            <DialogHeader className="space-y-4">
               <div className="w-16 h-16 bg-accent/5 rounded-full flex items-center justify-center">
                  <Trash className="w-8 h-8 text-accent" />
               </div>
               <DialogTitle className="text-3xl font-serif font-bold text-primary">Remover Registro</DialogTitle>
               <DialogDescription className="font-bold text-destructive">
                  Deseja mesmo remover <strong>{clientToDelete?.name}</strong>? Todo o histórico de visitas será preservado, mas o acesso será revogado.
               </DialogDescription>
            </DialogHeader>
            <DialogFooter className="flex gap-4 mt-8">
               <Button variant="ghost" onClick={() => setIsDeleteModalOpen(false)} className="flex-1 h-14 rounded-2xl font-bold uppercase tracking-widest">Cancelar</Button>
               <Button variant="destructive" onClick={handleDelete} className="flex-1 h-14 rounded-2xl font-bold uppercase tracking-widest shadow-xl shadow-accent/20">Sim, Remover</Button>
            </DialogFooter>
         </DialogContent>
      </Dialog>
    </div>
  );
}
