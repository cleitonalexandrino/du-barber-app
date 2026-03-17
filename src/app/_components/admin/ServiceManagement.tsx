"use client";

import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Scissors, Plus, Pencil, Trash, Clock, DollarSign } from "lucide-react";
import { toast } from "sonner";

const initialServices = [
  { id: 1, name: 'Corte Adulto', price: 'R$ 50,00', duration: '40 min' },
  { id: 2, name: 'Corte Infantil', price: 'R$ 40,00', duration: '30 min' },
  { id: 3, name: 'Barba Simples', price: 'R$ 30,00', duration: '20 min' },
  { id: 4, name: 'Barba Completa', price: 'R$ 45,00', duration: '40 min' },
  { id: 5, name: 'Combo Corte + Barba', price: 'R$ 85,00', duration: '60 min' },
];

export default function ServiceManagement() {
  const [services, setServices] = useState(initialServices);
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);

  const handleCreate = (e: any) => {
     e.preventDefault();
     toast.success('Serviço adicionado à lista!');
     setIsNewModalOpen(false);
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-right duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-card/50 border border-border p-4 rounded-xl">
        <h2 className="text-xl font-bold flex items-center gap-2">
           <Scissors className="w-5 h-5 text-primary" />
           Catálogo de Serviços
        </h2>
        <Dialog open={isNewModalOpen} onOpenChange={setIsNewModalOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2 h-10 px-4 font-bold shadow-lg shadow-primary/20">
              <Plus className="w-4 h-4" />
              Novo Serviço
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px] bg-card border-border text-foreground">
            <DialogHeader>
              <DialogTitle>Adicionar Serviço</DialogTitle>
              <DialogDescription>Defina o nome, valor e duração do novo serviço.</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleCreate} className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="s-name">Nome do Serviço</Label>
                <Input id="s-name" placeholder="Ex: Pigmentação" className="bg-muted border-0 h-11" required />
              </div>
              <div className="grid grid-cols-2 gap-4">
                 <div className="space-y-2">
                   <Label htmlFor="s-price">Preço (R$)</Label>
                   <Input id="s-price" placeholder="R$ 0,00" className="bg-muted border-0 h-11" required />
                 </div>
                 <div className="space-y-2">
                   <Label htmlFor="s-duration">Duração (min)</Label>
                   <Input id="s-duration" placeholder="30 min" className="bg-muted border-0 h-11" required />
                 </div>
              </div>
              <DialogFooter className="mt-6">
                <Button type="submit" className="w-full h-12 text-lg font-bold">Salvar Serviço</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {services.map((service) => (
          <div key={service.id} className="bg-card border border-border p-4 rounded-xl hover:border-primary/50 transition-all duration-300 group">
             <div className="flex justify-between items-start mb-4">
                <div className="p-2 rounded-lg bg-muted border border-border group-hover:bg-primary/5 transition-colors">
                   <Scissors className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
                </div>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                   <Button variant="ghost" size="icon" className="h-7 w-7"><Pencil className="w-3.5 h-3.5" /></Button>
                   <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive"><Trash className="w-3.5 h-3.5" /></Button>
                </div>
             </div>
             <h3 className="font-bold text-lg mb-1">{service.name}</h3>
             <div className="flex items-center gap-4 mt-4">
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                   <Clock className="w-3.5 h-3.5 text-primary" />
                   {service.duration}
                </div>
                <div className="flex items-center gap-1.5 text-sm font-bold text-secondary">
                   <DollarSign className="w-3.5 h-3.5" />
                   {service.price}
                </div>
             </div>
          </div>
        ))}
      </div>
    </div>
  );
}
