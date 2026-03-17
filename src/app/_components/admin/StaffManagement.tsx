"use client";

import React, { useEffect, useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Search, Plus, Pencil, Trash, UserCheck, Loader2, Shield } from "lucide-react";
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

  const fetchStaff = async () => {
    setLoading(true);
    // Note: In a real app, you might join 'barbers' and an 'admin' table, 
    // but here we'll simulate the staff list based on the existing barbers table 
    // and assume a role-based system.
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

     // 1. Insert into barbers table
     const { data: barber, error } = await supabase
        .from('barbers')
        .insert({ 
           name, 
           specialty: role, 
           avatar_url: `https://api.dicebear.com/7.x/avataaars/svg?seed=${name}`, 
           rating: 5.0,
           is_admin: is_admin // We should have this column or track it
        })
        .select()
        .single();

     if (error) {
        toast.error('Erro ao cadastrar: ' + error.message);
        return;
     }

     // 2. If is_admin is checked, we also add to public.admins table
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
      // Also update the barbers table to reflect admin status if needed
      await supabase.from('barbers').update({ is_admin: true }).eq('id', memberToAdmin.id);
      
      toast.success(`${memberToAdmin.name} agora é Administrador!`);
      setIsAdminModalOpen(false);
      setAdminFormData({ email: '', phone: '' });
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
    <div className="space-y-6 animate-in fade-in slide-in-from-right duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-card/50 border border-border p-4 rounded-xl">
        <h2 className="text-xl font-bold flex items-center gap-2">
           <UserCheck className="w-5 h-5 text-primary" />
           Barbeiros e Funcionários
        </h2>
        <div className="flex w-full md:w-auto gap-3">
          <div className="relative flex-1 md:w-64">
             <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
             <Input 
                placeholder="Buscar colaborador..." 
                className="pl-9 bg-card border-border h-10" 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
             />
          </div>
          <Dialog open={isNewModalOpen} onOpenChange={setIsNewModalOpen}>
            <DialogTrigger>
              <Button className="gap-2 h-10 px-4 font-bold shadow-lg shadow-primary/20">
                <Plus className="w-4 h-4" />
                Novo Colaborador
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px] bg-card border-border text-foreground">
              <DialogHeader>
                <DialogTitle>Novo Colaborador</DialogTitle>
                <DialogDescription>Cadastre um novo barbeiro ou funcionário e defina suas permissões.</DialogDescription>
              </DialogHeader>
              <form onSubmit={handleCreate} className="grid gap-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="create-name">Nome Completo</Label>
                  <Input 
                    id="create-name" 
                    placeholder="Ex: Pedro Alvares" 
                    className="bg-muted border-0 h-11" 
                    required 
                    value={newMemberData.name}
                    onChange={(e) => setNewMemberData({...newMemberData, name: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="create-role">Cargo / Especialidade</Label>
                  <Input 
                    id="create-role" 
                    placeholder="Ex: Barbeiro Senior" 
                    className="bg-muted border-0 h-11" 
                    required 
                    value={newMemberData.role}
                    onChange={(e) => setNewMemberData({...newMemberData, role: e.target.value})}
                  />
                </div>
                
                <div className="space-y-4 pt-2 border-t border-border mt-2">
                   <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="is_admin_check" 
                        checked={newMemberData.is_admin}
                        onCheckedChange={(checked) => setNewMemberData({...newMemberData, is_admin: !!checked})}
                      />
                      <Label htmlFor="is_admin_check" className="font-bold cursor-pointer flex items-center gap-2">
                        Dar Permissão de Admin 
                        <Shield className="w-3.5 h-3.5 text-yellow-500" />
                      </Label>
                   </div>
                   
                   {newMemberData.is_admin && (
                     <div className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
                        <div className="space-y-2">
                          <Label htmlFor="create-email">E-mail para Login</Label>
                          <Input 
                            id="create-email" 
                            type="email" 
                            placeholder="email@duadmin.com" 
                            className="bg-muted border-0 h-11" 
                            required 
                            value={newMemberData.email}
                            onChange={(e) => setNewMemberData({...newMemberData, email: e.target.value})}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="create-phone">Telefone / WhatsApp</Label>
                          <Input 
                            id="create-phone" 
                            placeholder="(00) 00000-0000" 
                            className="bg-muted border-0 h-11" 
                            required 
                            value={newMemberData.phone}
                            onChange={(e) => setNewMemberData({...newMemberData, phone: maskPhone(e.target.value)})}
                          />
                        </div>
                        <p className="text-[10px] text-muted-foreground uppercase">A senha padrão será: <strong>admin123</strong></p>
                     </div>
                   )}
                </div>

                <DialogFooter className="mt-6">
                  <Button type="submit" className="w-full h-12 text-lg font-bold">Cadastrar e Salvar</Button>
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
            <p className="text-muted-foreground">Buscando equipe...</p>
          </div>
        ) : (
          <Table>
            <TableHeader className="bg-muted/50 border-b border-border">
              <TableRow className="hover:bg-transparent border-0">
                <TableHead className="font-bold text-foreground py-4">Colaborador</TableHead>
                <TableHead className="font-bold text-foreground py-4">Cargo</TableHead>
                <TableHead className="hidden md:table-cell font-bold text-foreground py-4">Avaliação</TableHead>
                <TableHead className="w-[120px] text-right py-4">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredStaff.length > 0 ? filteredStaff.map((member) => (
                <TableRow key={member.id} className="hover:bg-muted/30 border-border transition-colors group">
                  <TableCell className="py-4">
                      <div className="flex items-center gap-3">
                        <img src={member.avatar_url} alt={member.name} className="w-10 h-10 rounded-full border border-border bg-muted" />
                        <div className="flex flex-col">
                          <div className="flex items-center gap-2">
                            <p className="font-bold text-foreground group-hover:text-primary transition-colors">{member.name}</p>
                            {member.is_admin && (
                              <span className="bg-yellow-500/10 text-yellow-500 text-[9px] font-black px-1.5 py-0.5 rounded border border-yellow-500/20 uppercase tracking-tighter">
                                Admin
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                  </TableCell>
                  <TableCell className="text-sm font-medium">{member.specialty}</TableCell>
                  <TableCell className="hidden md:table-cell text-sm font-bold text-secondary">
                    ★ {member.rating}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      {!member.is_admin && (
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8 text-muted-foreground hover:text-yellow-500 hover:bg-yellow-500/10"
                          title="Tornar Admin"
                          onClick={() => { setMemberToAdmin(member); setIsAdminModalOpen(true); }}
                        >
                          <Shield className="h-4 w-4" />
                        </Button>
                      )}
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground">
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button 
                         variant="ghost" 
                         size="icon" 
                         className="h-8 w-8 text-muted-foreground hover:text-destructive"
                         onClick={() => { setMemberToDelete(member); setIsDeleteModalOpen(true); }}
                      >
                        <Trash className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              )) : (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-20 text-muted-foreground">Nenhum colaborador encontrado.</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        )}
      </div>

      {/* Modal para Tornar Admin */}
      <Dialog open={isAdminModalOpen} onOpenChange={setIsAdminModalOpen}>
        <DialogContent className="sm:max-w-[425px] bg-card border-border text-foreground">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-yellow-500" />
              Tornar Administrador
            </DialogTitle>
            <DialogDescription>
              Você está dando permissão total para <strong>{memberToAdmin?.name}</strong>. Ele poderá gerenciar toda a barbearia.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handlePromoteAdmin} className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="admin-email">E-mail para Acesso</Label>
              <Input 
                id="admin-email" 
                type="email" 
                placeholder="email@duadmin.com" 
                className="bg-muted border-0 h-11" 
                required 
                value={adminFormData.email}
                onChange={(e) => setAdminFormData({...adminFormData, email: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="admin-phone">Telefone / WhatsApp</Label>
              <Input 
                id="admin-phone" 
                placeholder="(00) 00000-0000" 
                className="bg-muted border-0 h-11" 
                required 
                value={adminFormData.phone}
                onChange={(e) => setAdminFormData({...adminFormData, phone: maskPhone(e.target.value)})}
              />
            </div>
            <p className="text-[10px] text-muted-foreground uppercase text-center mt-2">
              A senha padrão será <strong>admin123</strong>
            </p>
            <DialogFooter className="mt-4">
              <Button type="submit" className="w-full h-12 font-bold bg-yellow-600 hover:bg-yellow-700">Confirmar Acesso Total</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
         <DialogContent className="bg-card border-border text-foreground">
            <DialogHeader>
               <DialogTitle className="text-destructive font-bold">Remover Colaborador</DialogTitle>
               <DialogDescription>
                  Tem certeza que deseja remover <strong>{memberToDelete?.name}</strong> da equipe? 
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
