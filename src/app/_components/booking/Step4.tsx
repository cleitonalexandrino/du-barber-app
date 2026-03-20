"use client";

import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { ChevronLeft, CheckCircle2, Scissors, Calendar, User, Phone, Mail, Clock, Loader2, Sparkles, Award, ShieldCheck } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";

export default function BookingStep4({ data, updateData, onBack, onComplete, loggedCustomer }: any) {
  const [loading, setLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [formData, setFormData] = useState({
    name: loggedCustomer?.name || '',
    phone: loggedCustomer?.phone || '',
    email: loggedCustomer?.email || ''
  });

  React.useEffect(() => {
    if (loggedCustomer) {
      setFormData({
        name: loggedCustomer.name,
        phone: loggedCustomer.phone,
        email: loggedCustomer.email || ''
      });
    }
  }, [loggedCustomer]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.phone) {
      toast.error('Por favor, preencha nome e telefone.');
      return;
    }

    setLoading(true);
    try {
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

      toast.success('Reserva Confirmada com Sucesso!');
      setIsSuccess(true);
    } catch (error: any) {
      console.error('Error saving booking:', error);
      toast.error('Erro ao confirmar: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="text-center py-6 animate-in zoom-in-95 duration-1000 ease-out fill-mode-both">
        <div className="relative mb-8 flex justify-center">
          <div className="absolute inset-0 bg-accent/20 rounded-full blur-2xl animate-pulse" />
          <div className="relative w-20 h-20 rounded-full bg-white border-4 border-slate-50 flex items-center justify-center shadow-xl ring-1 ring-accent/20">
            <CheckCircle2 className="w-10 h-10 text-accent" />
          </div>
        </div>
        
        <h2 className="text-2xl font-serif font-bold mb-3 text-primary leading-tight">Agendado com Sucesso!</h2>
        <div className="max-w-[280px] mx-auto space-y-3 mb-8 px-4">
            <p className="text-muted-foreground font-medium text-base leading-relaxed">
               Excelente escolha, <span className="text-primary font-bold">{formData.name.split(' ')[0]}</span>.
            </p>
            <div className="p-4 bg-slate-50 rounded-2xl border border-border shadow-inner">
               <p className="text-[9px] font-bold uppercase tracking-[0.15em] text-muted-foreground mb-2">Sua Reserva</p>
               <p className="font-serif font-bold text-xl text-primary">
                  {format(data.date, "dd/MM")} <span className="text-accent mx-1">•</span> {data.time}
               </p>
               <p className="text-[9px] font-bold uppercase tracking-widest text-primary/40 mt-1">{data.service?.name}</p>
            </div>
        </div>

        <div className="space-y-3 px-8">
          <Button 
            className="w-full h-14 text-lg font-bold uppercase tracking-widest bg-primary hover:bg-primary/95 text-white rounded-xl shadow-lg transition-all border-none" 
            onClick={() => onComplete()}
          >
            Novo Agendamento
          </Button>
          <Button 
            variant="ghost" 
            className="w-full h-10 text-[11px] font-bold uppercase tracking-widest text-muted-foreground hover:text-accent transition-colors" 
            onClick={() => window.location.reload()}
          >
            Sair do Aplicativo
          </Button>
        </div>
      </div>
    );
  }

  const maskPhone = (value: string) => {
    if (!value) return "";
    value = value.replace(/\D/g, "");
    value = value.replace(/^(\d{2})(\d)/g, "($1) $2");
    value = value.replace(/(\d)(\d{4})$/, "$1-$2");
    return value.substring(0, 15);
  };

  return (
    <div className="space-y-4 animate-in fade-in slide-in-from-bottom-8 duration-1000 ease-out fill-mode-both">
      <div className="text-center space-y-1 mb-4">
        <h2 className="text-xl font-serif font-bold tracking-tight text-primary">Confirmar Reserva</h2>
        <p className="text-muted-foreground text-[12px] font-medium leading-tight">Revise seus dados para finalizar o agendamento.</p>
      </div>

      <Card className="bg-white border border-border rounded-2xl shadow-sm shadow-primary/5 overflow-hidden">
        <CardContent className="p-4 space-y-4">
           <div className="flex items-center gap-5 group">
              <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center border border-border group-hover:bg-primary/5 transition-colors">
                <Scissors className="w-6 h-6 text-accent" />
              </div>
              <div className="space-y-0.5">
                 <p className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground">Serviço</p>
                 <p className="font-serif font-bold text-lg text-primary group-hover:text-accent transition-colors">{data.service?.name}</p>
              </div>
           </div>

           <div className="flex items-center gap-5 group">
              <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center border border-border group-hover:bg-primary/5 transition-colors">
                <Award className="w-6 h-6 text-accent" />
              </div>
              <div className="space-y-0.5">
                 <p className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground">Barbeiro</p>
                 <p className="font-serif font-bold text-lg text-primary group-hover:text-accent transition-colors">{data.barber?.name}</p>
              </div>
           </div>

           <div className="flex items-center gap-5 group">
              <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center border border-border group-hover:bg-primary/5 transition-colors">
                <Calendar className="w-6 h-6 text-accent" />
              </div>
              <div className="space-y-0.5">
                 <p className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground">Data e Horário</p>
                 <p className="font-serif font-bold text-lg text-primary group-hover:text-accent transition-colors">
                    {data.date ? format(data.date, "EEEE, d 'de' MMMM", { locale: ptBR }) : ''} às {data.time}
                 </p>
              </div>
           </div>
        </CardContent>
      </Card>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="name" className="text-[10px] font-bold uppercase tracking-widest text-primary/60 ml-2">Confirmar Nome</Label>
          <div className="relative group">
            <User className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-accent transition-colors" />
            <Input 
              id="name" 
              placeholder="Digite seu nome completo" 
              className="pl-14 h-14 rounded-2xl bg-slate-50 border-border focus-visible:ring-accent font-medium shadow-inner"
              required
              disabled={loading}
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="phone" className="text-[10px] font-bold uppercase tracking-widest text-primary/60 ml-2">WhatsApp de Contato</Label>
          <div className="relative group">
            <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-accent transition-colors" />
            <Input 
              id="phone" 
              placeholder="(00) 00000-0000" 
              className="pl-12 h-12 rounded-xl bg-slate-50 border-border focus-visible:ring-accent font-bold tracking-widest shadow-inner tabular-nums text-sm"
              required
              disabled={loading}
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: maskPhone(e.target.value) })}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="email" className="text-[10px] font-bold uppercase tracking-widest text-primary/60 ml-2">E-mail (Para Notificações)</Label>
          <div className="relative group">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-accent transition-colors" />
            <Input 
              id="email" 
              type="email" 
              placeholder="seu@exemplo.com" 
              className="pl-12 h-12 rounded-xl bg-slate-50 border-border focus-visible:ring-accent font-medium shadow-inner text-sm"
              disabled={loading}
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />
          </div>
        </div>

        <div className="pt-4 space-y-4">
          <Button 
            type="submit" 
            className="w-full h-14 text-lg font-bold uppercase tracking-widest bg-accent hover:bg-accent/95 text-white rounded-2xl shadow-lg transition-all hover:scale-[1.01] active:scale-[0.99] border-none" 
            disabled={loading}
          >
            {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : (
               <span className="flex items-center gap-2">
                  Confirmar Agendamento
                  <ShieldCheck className="w-5 h-5 text-white/50" />
               </span>
            )}
          </Button>
          
          <div className="flex justify-center">
             <div className="flex items-center gap-2 py-3 px-5 bg-slate-50 border border-border rounded-full group hover:bg-white transition-colors cursor-pointer" onClick={onBack}>
                <ChevronLeft className="w-3.5 h-3.5 text-primary group-hover:animate-bounce-x" />
                <p className="text-[9px] font-bold uppercase tracking-[0.15em] text-muted-foreground">Alterar Detalhes</p>
             </div>
          </div>
        </div>
      </form>
    </div>
  );
}
