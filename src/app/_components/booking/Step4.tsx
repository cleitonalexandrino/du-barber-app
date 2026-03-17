"use client";

import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { ChevronLeft, CheckCircle2, Scissors, Calendar, User, Phone, Mail, Clock, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";

export default function BookingStep4({ data, updateData, onBack, onComplete }: any) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.phone) {
      toast.error('Por favor, preencha nome e telefone.');
      return;
    }

    setLoading(true);
    try {
      // 1. Client Upsert (based on phone unique key)
      const { data: client, error: clientError } = await supabase
        .from('clients')
        .upsert({ 
          name: formData.name, 
          phone: formData.phone, 
          email: formData.email 
        }, { onConflict: 'phone' })
        .select()
        .single();

      if (clientError) throw clientError;

      // 2. Insert Appointment
      const { error: apptError } = await supabase
        .from('appointments')
        .insert({
          client_id: client.id,
          service_id: data.service.id,
          barber_id: data.barber.id === 'any' ? null : data.barber.id,
          appointment_date: format(data.date, 'yyyy-MM-dd'),
          appointment_time: data.time + ':00',
          status: 'confirmed'
        });

      if (apptError) throw apptError;

      toast.success('Agendamento Confirmado com Sucesso!');
      onComplete();
    } catch (error: any) {
      console.error('Error saving booking:', error);
      toast.error('Erro ao confirmar agendamento: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const maskPhone = (value: string) => {
    if (!value) return "";
    value = value.replace(/\D/g, "");
    // (11) 98888-8888
    value = value.replace(/^(\d{2})(\d)/g, "($1) $2");
    value = value.replace(/(\d)(\d{4})$/, "$1-$2");
    return value.substring(0, 15);
  };

  return (
    <div className="space-y-4 animate-in slide-in-from-right duration-500">
      <div className="flex items-center mb-4">
        <Button variant="ghost" size="icon" onClick={onBack} disabled={loading} className="mr-2">
          <ChevronLeft className="w-5 h-5" />
        </Button>
        <h2 className="text-lg font-semibold text-center flex-1 pr-8">Confirmação</h2>
      </div>

      <Card className="bg-muted/50 border-0 mb-6">
        <CardContent className="p-4 space-y-3">
          <div className="flex items-center gap-3">
            <Scissors className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium">{data.service?.name}</span>
          </div>
          <div className="flex items-center gap-3">
            <User className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium">{data.barber?.name}</span>
          </div>
          <div className="flex items-center gap-3">
             <Calendar className="w-4 h-4 text-primary" />
             <span className="text-sm font-medium capitalize">
               {data.date ? format(data.date, "EEEE, d 'de' MMMM", { locale: ptBR }) : ''}
             </span>
          </div>
          <div className="flex items-center gap-3">
             <Clock className="w-4 h-4 text-primary" />
             <span className="text-sm font-medium">{data.time}</span>
          </div>
        </CardContent>
      </Card>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name">Nome Completo</Label>
          <div className="relative">
            <User className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
            <Input 
              id="name" 
              placeholder="Digite seu nome" 
              className="pl-10 h-11"
              required
              disabled={loading}
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="phone">WhatsApp / Telefone</Label>
          <div className="relative">
            <Phone className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
            <Input 
              id="phone" 
              placeholder="(00) 00000-0000" 
              className="pl-10 h-11"
              required
              disabled={loading}
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: maskPhone(e.target.value) })}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">E-mail (Opcional)</Label>
          <div className="relative">
            <Mail className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
            <Input 
              id="email" 
              type="email" 
              placeholder="seu@email.com" 
              className="pl-10 h-11"
              disabled={loading}
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />
          </div>
        </div>

        <div className="pt-6">
          <Button type="submit" className="w-full h-14 text-lg font-bold shadow-lg shadow-primary/20" disabled={loading}>
            {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : 'Confirmar Agendamento'}
          </Button>
          <p className="text-[10px] text-center text-muted-foreground mt-4 uppercase tracking-widest">
            Ao confirmar, você concorda com nossos termos de cancelamento.
          </p>
        </div>
      </form>
    </div>
  );
}
