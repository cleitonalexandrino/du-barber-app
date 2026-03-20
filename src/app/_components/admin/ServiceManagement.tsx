"use client";

import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Scissors, Plus, Pencil, Trash, Clock, DollarSign, Sparkles, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";

export default function ServiceManagement() {
  const [services, setServices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);
  const [newServiceData, setNewServiceData] = useState({
    name: '',
    price: '',
    duration: ''
  });

  const fetchServices = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('services')
      .select('*')
      .order('name');
    
    if (error) {
      toast.error('Erro ao buscar serviços');
    } else {
      setServices(data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchServices();
  }, []);

  const handleCreate = async (e: any) => {
     e.preventDefault();
     const { name, price, duration } = newServiceData;
     
     const { error } = await supabase
      .from('services')
      .insert({ 
        name, 
        price: parseFloat(price.replace(',', '.')), 
        duration: parseInt(duration) 
      });

     if (error) {
        toast.error('Erro ao salvar: ' + error.message);
     } else {
        toast.success(`${name} adicionado ao catálogo!`);
        setIsNewModalOpen(false);
        setNewServiceData({ name: '', price: '', duration: '' });
        fetchServices();
     }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Deseja realmente remover este serviço?')) return;
    
    const { error } = await supabase.from('services').delete().eq('id', id);
    if (error) {
      toast.error('Erro ao remover: ' + error.message);
    } else {
      toast.success('Serviço removido.');
      fetchServices();
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-right-8 duration-1000 ease-out fill-mode-both">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-4 md:p-6 rounded-2xl shadow-sm border border-border">
        <div className="space-y-0.5">
          <h2 className="text-xl md:text-2xl font-serif font-bold tracking-tight text-primary flex items-center gap-2.5">
             <Scissors className="w-6 h-6 text-accent" />
             Catálogo de Serviços
          </h2>
          <p className="text-muted-foreground text-[11px] md:text-xs font-medium">Gerencie o menu de experiências da sua barbearia.</p>
        </div>
        <Dialog open={isNewModalOpen} onOpenChange={setIsNewModalOpen}>
          <DialogTrigger 
            render={
              <Button className="gap-2.5 h-11 px-6 font-bold uppercase tracking-widest bg-accent hover:bg-accent/90 text-white border-none shadow-md transition-all hover:scale-105 active:scale-95 rounded-xl">
                <Plus className="w-4 h-4" />
                Novo Serviço
              </Button>
            }
          />
          <DialogContent className="sm:max-w-[420px] bg-white border-border rounded-2xl p-6 overflow-hidden shadow-2xl">
            <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-full -mr-12 -mt-12" />
            <DialogHeader className="relative z-10 space-y-3">
              <div className="w-14 h-14 bg-primary/5 rounded-full flex items-center justify-center">
                <Sparkles className="w-7 h-7 text-primary" />
              </div>
              <DialogTitle className="text-2xl font-serif font-bold text-primary">Adicionar Serviço</DialogTitle>
              <DialogDescription className="font-medium text-xs">Defina os detalhes da nova experiência para seus clientes.</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleCreate} className="grid gap-4 py-6 relative z-10">
              <div className="space-y-1.5">
                <Label htmlFor="s-name" className="text-[9px] font-bold uppercase tracking-widest text-primary/60">Nome do Serviço</Label>
                <Input 
                  id="s-name" 
                  placeholder="Ex: Pigmentação de Barba" 
                  className="bg-slate-50 border-border h-12 rounded-xl focus-visible:ring-accent text-sm" 
                  required 
                  value={newServiceData.name}
                  onChange={(e) => setNewServiceData({...newServiceData, name: e.target.value})}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                 <div className="space-y-1.5">
                   <Label htmlFor="s-price" className="text-[9px] font-bold uppercase tracking-widest text-primary/60">Preço (R$)</Label>
                   <Input 
                    id="s-price" 
                    placeholder="50,00" 
                    className="bg-slate-50 border-border h-12 rounded-xl focus-visible:ring-accent text-sm" 
                    required 
                    value={newServiceData.price}
                    onChange={(e) => setNewServiceData({...newServiceData, price: e.target.value})}
                   />
                 </div>
                 <div className="space-y-1.5">
                   <Label htmlFor="s-duration" className="text-[9px] font-bold uppercase tracking-widest text-primary/60">Duração (min)</Label>
                   <Input 
                    id="s-duration" 
                    placeholder="45" 
                    type="number"
                    className="bg-slate-50 border-border h-12 rounded-xl focus-visible:ring-accent text-sm" 
                    required 
                    value={newServiceData.duration}
                    onChange={(e) => setNewServiceData({...newServiceData, duration: e.target.value})}
                   />
                 </div>
              </div>
              <DialogFooter className="mt-6">
                <Button type="submit" className="w-full h-14 text-lg font-bold uppercase tracking-widest bg-primary hover:bg-primary/95 text-white rounded-xl shadow-lg border-none">Salvar Serviço</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center p-20 space-y-4">
          <Loader2 className="w-12 h-12 animate-spin text-primary opacity-20" />
          <p className="font-serif text-muted-foreground">Limpando a tesoura...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {services.map((service) => (
            <div key={service.id} className="relative bg-white border border-border p-4 md:p-6 rounded-2xl hover:shadow-lg transition-all duration-500 group overflow-hidden shadow-sm">
               <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-full -mr-12 -mt-12 group-hover:bg-accent/5 transition-colors duration-700" />
               
               <div className="flex justify-between items-start mb-6 relative z-10">
                  <div className="w-12 h-12 rounded-xl bg-slate-50 flex items-center justify-center group-hover:bg-primary transition-all duration-500 shadow-inner">
                     <Scissors className="w-6 h-6 text-primary group-hover:text-white transition-colors rotate-12 group-hover:rotate-0" />
                  </div>
                  <div className="flex gap-2">
                     <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-10 w-10 bg-slate-50 rounded-xl hover:bg-primary hover:text-white transition-all shadow-sm"
                     >
                        <Pencil className="w-4 h-4" />
                     </Button>
                     <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-10 w-10 bg-slate-50 rounded-xl hover:bg-accent hover:text-white transition-all shadow-sm"
                        onClick={() => handleDelete(service.id)}
                     >
                        <Trash className="w-4 h-4" />
                     </Button>
                  </div>
               </div>
               
               <h3 className="font-serif font-bold text-xl text-primary mb-3 leading-tight group-hover:text-accent transition-colors">{service.name}</h3>
               
               <div className="flex items-center justify-between mt-6 pt-4 border-t border-border/50">
                  <div className="flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-full border border-border/50">
                     <Clock className="w-3.5 h-3.5 text-accent" />
                     <span className="text-[9px] font-bold uppercase tracking-widest text-primary/70 tabular-nums">{service.duration} MIN</span>
                  </div>
                  <div className="flex items-center gap-1 font-bold text-xl text-primary tracking-tighter tabular-nums">
                     <span className="text-xs font-bold mr-0.5">R$</span>
                     {new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 2 }).format(service.price)}
                  </div>
               </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
