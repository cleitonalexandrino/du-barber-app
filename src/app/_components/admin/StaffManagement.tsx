"use client";

import React, { useEffect, useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Search, Plus, Pencil, Trash, UserCheck, Loader2, Shield, Star, Phone, Mail } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";

export default function StaffManagement() {
  const [staff, setStaff] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [memberToDelete, setMemberToDelete] = useState<any>(null);
  
  const [newMemberData, setNewMemberData] = useState({
    name: '',
    role: 'Barbeiro',
    email: '',
    phone: '',
    is_admin: false
  });

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<any>(null);
  const [editMemberData, setEditMemberData] = useState({
    name: '',
    role: '',
    rating: 5.0
  });

  const fetchStaff = async () => {
    setLoading(true);
    const { data: barbers, error } = await supabase
      .from('barbers')
      .select('*')
      .order('name');
    
    if (error) {
      toast.error('Erro ao buscar colaboradores');
    } else {
      setStaff(barbers || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchStaff();
  }, []);

  const maskPhone = (value: string) => {
    if (!value) return "";
    value = value.replace(/\D/g, "");
    value = value.replace(/^(\d{2})(\d)/g, "($1) $2");
    value = value.replace(/(\d)(\d{4})$/, "$1-$2");
    return value.substring(0, 15);
  };

  const handleCreate = async (e: any) => {
     e.preventDefault();
     const { name, role, email, phone, is_admin } = newMemberData;

     const { data: barber, error } = await supabase
        .from('barbers')
        .insert({ 
           name, 
           specialty: role, 
           avatar_url: `https://api.dicebear.com/7.x/avataaars/svg?seed=${name}`, 
           rating: 5.0,
           is_admin: is_admin 
        })
        .select()
        .single();

     if (error) {
        toast.error('Erro ao cadastrar: ' + error.message);
        return;
     }

     if (is_admin) {
        const { error: adminError } = await supabase
           .from('admins')
           .insert({ 
              name, 
              email, 
              phone, 
              password: 'admin123' 
           });
        
        if (adminError) {
          toast.warning('Colaborador criado, mas erro ao dar permissão de Admin.');
        } else {
          toast.success(`${name} agora é um Administrador!`);
        }
     }

     toast.success('Colaborador cadastrado com sucesso!');
     setIsNewModalOpen(false);
     setNewMemberData({ name: '', role: 'Barbeiro', email: '', phone: '', is_admin: false });
     fetchStaff();
  };

  const [isAdminModalOpen, setIsAdminModalOpen] = useState(false);
  const [memberToAdmin, setMemberToAdmin] = useState<any>(null);
  const [adminFormData, setAdminFormData] = useState({ email: '', phone: '' });

  const handlePromoteAdmin = async (e: any) => {
    e.preventDefault();
    const { error } = await supabase
      .from('admins')
      .insert({
        name: memberToAdmin.name,
        email: adminFormData.email,
        phone: adminFormData.phone,
        password: 'admin123'
      });

    if (error) {
      toast.error('Erro ao promover para Admin: ' + error.message);
    } else {
      await supabase.from('barbers').update({ is_admin: true }).eq('id', memberToAdmin.id);
      toast.success(`${memberToAdmin.name} agora é Administrador!`);
      setIsAdminModalOpen(false);
      setAdminFormData({ email: '', phone: '' });
      fetchStaff();
    }
  };

  const handleEdit = async (e: any) => {
    e.preventDefault();
    const { error } = await supabase
      .from('barbers')
      .update({
        name: editMemberData.name,
        specialty: editMemberData.role,
        rating: editMemberData.rating
      })
      .eq('id', editingMember.id);

    if (error) {
       toast.error('Erro ao atualizar: ' + error.message);
    } else {
       toast.success('Colaborador atualizado!');
       setIsEditModalOpen(false);
       fetchStaff();
    }
  };

  const handleDelete = async () => {
    const { error } = await supabase
      .from('barbers')
      .delete()
      .eq('id', memberToDelete.id);

    if (error) {
      toast.error('Erro ao remover colaborador');
    } else {
      setStaff(staff.filter(s => s.id !== memberToDelete.id));
      setIsDeleteModalOpen(false);
      toast.success('Colaborador removido.');
    }
  };

  const filteredStaff = staff.filter(s => 
    s.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-right-8 duration-1000 ease-out fill-mode-both">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-white p-8 rounded-[2rem] shadow-[0_10px_40px_-15px_rgba(0,0,0,0.05)] border border-border">
        <div className="space-y-1">
          <h2 className="text-3xl font-serif font-bold tracking-tight text-primary flex items-center gap-3">
             <UserCheck className="w-8 h-8 text-accent" />
             Equipe Técnica
          </h2>
          <p className="text-muted-foreground text-sm font-medium">Os artesãos responsáveis pela qualidade Du Barber.</p>
        </div>
        <div className="flex w-full md:w-auto gap-4">
          <div className="relative flex-1 md:w-64 group">
             <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-accent transition-colors" />
             <Input 
                placeholder="Buscar por nome..." 
                className="pl-11 bg-slate-50 border-border h-14 rounded-2xl focus-visible:ring-accent transition-all" 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
             />
          </div>
          <Dialog open={isNewModalOpen} onOpenChange={setIsNewModalOpen}>
            <DialogTrigger 
              render={
                <Button className="gap-3 h-14 px-8 font-bold uppercase tracking-widest bg-accent hover:bg-accent/90 text-white rounded-2xl shadow-[0_10px_20px_-5px_rgba(222,0,0,0.3)] transition-all hover:scale-105 active:scale-95 border-none">
                  <Plus className="w-5 h-5" />
                  Novo Membro
                </Button>
              }
            />
            <DialogContent className="sm:max-w-[450px] bg-white border-border rounded-[2.5rem] p-10 shadow-2xl overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16" />
              <DialogHeader className="relative z-10 space-y-4">
                <DialogTitle className="text-3xl font-serif font-bold text-primary">Novo Colaborador</DialogTitle>
                <DialogDescription className="font-medium">Cadastre um novo talento e defina seus privilégios.</DialogDescription>
              </DialogHeader>
              <form onSubmit={handleCreate} className="grid gap-6 py-8 relative z-10">
                <div className="space-y-2">
                  <Label htmlFor="create-name" className="text-[10px] font-bold uppercase tracking-widest text-primary/60">Nome Completo</Label>
                  <Input 
                    id="create-name" 
                    placeholder="Ex: Arthur Morgan" 
                    className="bg-slate-50 border-border h-14 rounded-2xl focus-visible:ring-accent" 
                    required 
                    value={newMemberData.name}
                    onChange={(e) => setNewMemberData({...newMemberData, name: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="create-role" className="text-[10px] font-bold uppercase tracking-widest text-primary/60">Cargo / Especialidade</Label>
                  <Input 
                    id="create-role" 
                    placeholder="Ex: Barbeiro Master" 
                    className="bg-slate-50 border-border h-14 rounded-2xl focus-visible:ring-accent" 
                    required 
                    value={newMemberData.role}
                    onChange={(e) => setNewMemberData({...newMemberData, role: e.target.value})}
                  />
                </div>
                
                <div className="space-y-6 pt-4 border-t border-border mt-2">
                   <div className="flex items-center space-x-3 p-4 bg-slate-50 rounded-2xl border border-border">
                      <Checkbox 
                        id="is_admin_check" 
                        checked={newMemberData.is_admin}
                        onCheckedChange={(checked) => setNewMemberData({...newMemberData, is_admin: !!checked})}
                        className="border-primary data-[state=checked]:bg-primary"
                      />
                      <Label htmlFor="is_admin_check" className="font-bold cursor-pointer flex items-center gap-2 text-primary uppercase text-xs tracking-tighter">
                        Conceder Acesso Administrativo
                        <Shield className="w-3.5 h-3.5 text-accent" />
                      </Label>
                   </div>
                   
                   {newMemberData.is_admin && (
                     <div className="space-y-6 animate-in fade-in slide-in-from-top-4 duration-500">
                        <div className="space-y-2">
                          <Label htmlFor="create-email" className="text-[10px] font-bold uppercase tracking-widest text-primary/60">E-mail Corporativo</Label>
                          <Input 
                            id="create-email" 
                            type="email" 
                            placeholder="admin@dubarber.com" 
                            className="bg-slate-50 border-border h-14 rounded-2xl focus-visible:ring-accent" 
                            required 
                            value={newMemberData.email}
                            onChange={(e) => setNewMemberData({...newMemberData, email: e.target.value})}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="create-phone" className="text-[10px] font-bold uppercase tracking-widest text-primary/60">Telefone de Contato</Label>
                          <Input 
                            id="create-phone" 
                            placeholder="(00) 00000-0000" 
                            className="bg-slate-50 border-border h-14 rounded-2xl focus-visible:ring-accent" 
                            required 
                            value={newMemberData.phone}
                            onChange={(e) => setNewMemberData({...newMemberData, phone: maskPhone(e.target.value)})}
                          />
                        </div>
                        <div className="p-3 bg-accent/5 rounded-xl border border-accent/10">
                           <p className="text-[9px] text-accent font-bold uppercase tracking-widest text-center">Senha Inicial Padrão: <strong>admin123</strong></p>
                        </div>
                     </div>
                   )}
                </div>

                <DialogFooter className="mt-6">
                  <Button type="submit" className="w-full h-16 text-xl font-bold uppercase tracking-widest bg-primary hover:bg-primary/95 text-white rounded-2xl shadow-xl shadow-primary/20">Cadastrar Colaborador</Button>
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
            <p className="font-serif text-muted-foreground text-lg">Organizando as cadeiras...</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-slate-50 border-b border-border">
                <TableRow className="hover:bg-transparent border-0">
                  <TableHead className="font-bold text-primary uppercase tracking-widest text-[10px] py-6 px-8">Artesão</TableHead>
                  <TableHead className="font-bold text-primary uppercase tracking-widest text-[10px] py-6">Cargo / Especialidade</TableHead>
                  <TableHead className="hidden md:table-cell font-bold text-primary uppercase tracking-widest text-[10px] py-6 text-center">Nível de Serviço</TableHead>
                  <TableHead className="w-[150px] text-right py-6 px-8 font-bold text-primary uppercase tracking-widest text-[10px]">Gestão</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredStaff.length > 0 ? filteredStaff.map((member) => (
                  <TableRow key={member.id} className="hover:bg-slate-50/80 border-border transition-all duration-300 group">
                    <TableCell className="py-6 px-8">
                        <div className="flex items-center gap-5">
                          <div className="relative">
                            <div className="absolute -inset-1 bg-primary/10 rounded-full blur-sm group-hover:bg-accent/20 transition-colors" />
                            <img 
                              src={member.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${member.name}`} 
                              alt={member.name} 
                              className="relative w-14 h-14 rounded-full border-2 border-white shadow-md bg-white object-cover group-hover:scale-105 transition-transform" 
                            />
                          </div>
                          <div className="flex flex-col">
                            <div className="flex items-center gap-2">
                              <p className="font-serif font-bold text-xl text-primary leading-tight group-hover:text-accent transition-colors">{member.name}</p>
                              {member.is_admin && (
                                <span className="bg-accent text-white text-[8px] font-bold px-2 py-0.5 rounded-full border border-accent shadow-sm uppercase tracking-tighter">
                                  Admin
                                </span>
                              )}
                            </div>
                            <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest mt-0.5">Membro Ativo</p>
                          </div>
                        </div>
                    </TableCell>
                    <TableCell className="text-sm font-bold text-primary/70">{member.specialty}</TableCell>
                    <TableCell className="hidden md:table-cell text-center">
                      <div className="inline-flex items-center gap-1 px-3 py-1 bg-slate-50 rounded-full border border-border shadow-inner">
                        <Star className="w-3.5 h-3.5 text-accent fill-accent" />
                        <span className="text-sm font-bold text-primary tabular-nums tracking-tighter">{member.rating.toFixed(1)}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right px-8">
                      <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all -translate-x-4 group-hover:translate-x-0">
                        {!member.is_admin && (
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-10 w-10 bg-white border border-border rounded-xl text-muted-foreground hover:text-accent hover:border-accent hover:shadow-lg transition-all"
                            title="Tornar Admin"
                            onClick={() => { setMemberToAdmin(member); setIsAdminModalOpen(true); }}
                          >
                            <Shield className="h-4 w-4" />
                          </Button>
                        )}
                        <Button 
                           variant="ghost" 
                           size="icon" 
                           className="h-10 w-10 bg-white border border-border rounded-xl text-muted-foreground hover:text-primary hover:border-primary hover:shadow-lg transition-all"
                           onClick={() => {
                              setEditingMember(member);
                              setEditMemberData({
                                 name: member.name,
                                 role: member.specialty,
                                 rating: member.rating
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
                           onClick={() => { setMemberToDelete(member); setIsDeleteModalOpen(true); }}
                        >
                          <Trash className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                )) : (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-32 text-muted-foreground font-serif text-lg">Nenhum oficial de barbearia encontrado.</TableCell>
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
            <DialogTitle className="text-3xl font-serif font-bold text-primary">Editar Artesão</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleEdit} className="grid gap-6 py-8 relative z-10">
            <div className="space-y-2">
              <Label htmlFor="edit-name" className="text-[10px] font-bold uppercase tracking-widest text-primary/60">Nome Completo</Label>
              <Input 
                id="edit-name" 
                className="bg-slate-50 border-border h-14 rounded-2xl focus-visible:ring-accent" 
                required 
                value={editMemberData.name}
                onChange={(e) => setEditMemberData({...editMemberData, name: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-role" className="text-[10px] font-bold uppercase tracking-widest text-primary/60">Cargo / Especialidade</Label>
              <Input 
                id="edit-role" 
                className="bg-slate-50 border-border h-14 rounded-2xl focus-visible:ring-accent" 
                required 
                value={editMemberData.role}
                onChange={(e) => setEditMemberData({...editMemberData, role: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-rating" className="text-[10px] font-bold uppercase tracking-widest text-primary/60">Avaliação do Cliente (0 a 5)</Label>
              <div className="relative">
                <Star className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-accent" />
                <Input 
                  id="edit-rating" 
                  type="number"
                  step="0.1"
                  min="0"
                  max="5"
                  className="pl-11 bg-slate-50 border-border h-14 rounded-2xl focus-visible:ring-accent tabular-nums" 
                  required 
                  value={editMemberData.rating}
                  onChange={(e) => setEditMemberData({...editMemberData, rating: parseFloat(e.target.value)})}
                />
              </div>
            </div>
            <DialogFooter className="mt-6">
              <Button type="submit" className="w-full h-16 text-xl font-bold uppercase tracking-widest bg-primary hover:bg-primary/95 text-white rounded-2xl">Salvar Mudanças</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={isAdminModalOpen} onOpenChange={setIsAdminModalOpen}>
        <DialogContent className="sm:max-w-[450px] bg-white border-border rounded-[2.5rem] p-10 shadow-2xl overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-accent/5 rounded-full -mr-16 -mt-16" />
          <DialogHeader className="relative z-10 space-y-4">
             <div className="w-16 h-16 bg-accent/5 rounded-full flex items-center justify-center">
                <Shield className="w-8 h-8 text-accent" />
             </div>
            <DialogTitle className="text-3xl font-serif font-bold text-primary">Acesso Restrito</DialogTitle>
            <DialogDescription className="font-medium text-destructive">
               Atenção: Você está concedendo controle total do sistema para <strong>{memberToAdmin?.name}</strong>.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handlePromoteAdmin} className="grid gap-6 py-8 relative z-10">
            <div className="space-y-2">
              <Label htmlFor="admin-email" className="text-[10px] font-bold uppercase tracking-widest text-primary/60 flex items-center gap-2">
                <Mail className="w-3 h-3" /> E-mail de Login
              </Label>
              <Input 
                id="admin-email" 
                type="email" 
                placeholder="admin@dubarber.com" 
                className="bg-slate-50 border-border h-14 rounded-2xl focus-visible:ring-accent" 
                required 
                value={adminFormData.email}
                onChange={(e) => setAdminFormData({...adminFormData, email: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="admin-phone" className="text-[10px] font-bold uppercase tracking-widest text-primary/60 flex items-center gap-2">
                <Phone className="w-3 h-3" /> Telefone para Contato
              </Label>
              <Input 
                id="admin-phone" 
                placeholder="(00) 00000-0000" 
                className="bg-slate-50 border-border h-14 rounded-2xl focus-visible:ring-accent" 
                required 
                value={adminFormData.phone}
                onChange={(e) => setAdminFormData({...adminFormData, phone: maskPhone(e.target.value)})}
              />
            </div>
            <div className="p-4 bg-muted/50 rounded-2xl border border-border text-center">
               <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest">A senha de primeiro acesso será:</p>
               <p className="text-2xl font-serif font-bold text-primary mt-1 tracking-widest">admin123</p>
            </div>
            <DialogFooter className="mt-4">
              <Button type="submit" className="w-full h-16 bg-accent hover:bg-accent/90 text-white font-bold uppercase tracking-widest rounded-2xl shadow-xl shadow-accent/20">Confirmar Autoridade</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
