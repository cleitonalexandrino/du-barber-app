"use client";

import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Scissors, User, Phone, Mail, Lock, Loader2, ArrowRight, Sparkles, ShieldCheck } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

export default function CustomerAuth({ onLoginSuccess }: { onLoginSuccess: (customer: any) => void }) {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    password: ''
  });

  const maskPhone = (value: string) => {
    if (!value) return "";
    value = value.replace(/\D/g, "");
    value = value.replace(/^(\d{2})(\d)/g, "($1) $2");
    value = value.replace(/(\d)(\d{4})$/, "$1-$2");
    return value.substring(0, 15);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isLogin) {
        // 1. Tentar Login como Cliente
        const { data: client, error: clientError } = await supabase
          .from('clients')
          .select('*')
          .or(`phone.eq."${formData.phone}",email.eq."${formData.phone}"`)
          .eq('password', formData.password)
          .single();

        if (client && !clientError) {
          toast.success(`Bem-vindo, ${client.name}!`);
          onLoginSuccess(client);
          return;
        }

        // 2. Tentar Login como Admin (se falhar como cliente)
        const { data: admin, error: adminError } = await supabase
          .from('admins')
          .select('*')
          .or(`phone.eq."${formData.phone}",email.eq."${formData.phone}"`)
          .eq('password', formData.password)
          .single();

        if (admin && !adminError) {
          toast.success(`Acesso Admin: Bem-vindo, ${admin.name}!`);
          onLoginSuccess(admin);
          return;
        }

        toast.error("Identificador ou senha incorretos.");
      } else {
        if (!formData.name || !formData.phone) {
          toast.error("Preencha nome e telefone.");
          setLoading(false);
          return;
        }

        const { data, error } = await supabase
          .from('clients')
          .insert({
            name: formData.name,
            phone: formData.phone,
            email: formData.email,
            password: formData.password || 'cliente123'
          })
          .select()
          .single();

        if (error) {
          if (error.code === '23505') {
            toast.error("Este telefone já está cadastrado.");
          } else {
            toast.error("Erro ao cadastrar: " + error.message);
          }
        } else {
          toast.success("Conta criada com sucesso!");
          onLoginSuccess(data);
        }
      }
    } catch (err: any) {
      toast.error("Ocorreu um erro inesperado.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex flex-col items-center justify-center p-6 animate-in fade-in slide-in-from-bottom-8 duration-1000 ease-out fill-mode-both">
      <div className="w-full max-w-md relative">
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-48 h-48 bg-primary/5 rounded-full blur-3xl -z-10 animate-pulse" />
        
        <div className="text-center mb-12">
           <div className="relative inline-flex items-center justify-center w-24 h-24 rounded-full bg-white border-8 border-slate-50 mb-6 shadow-2xl ring-1 ring-border">
             <Scissors className="w-10 h-10 text-primary rotate-12" />
             <div className="absolute -top-1 -right-1 bg-accent text-white p-1.5 rounded-full shadow-lg">
                <Sparkles className="w-3.5 h-3.5" />
             </div>
           </div>
           <h1 className="text-5xl font-serif font-bold tracking-tighter text-primary leading-none">Du Barber</h1>
           <div className="flex items-center justify-center gap-3 mt-4">
              <div className="h-px w-6 bg-accent/40" />
              <p className="text-muted-foreground text-[10px] font-bold uppercase tracking-[0.3em] font-sans">Sua Experiência Premium</p>
              <div className="h-px w-6 bg-accent/40" />
           </div>
        </div>

        <Card className="bg-white border border-border shadow-[0_20px_60px_-15px_rgba(0,51,102,0.15)] rounded-[3rem] overflow-hidden">
          <CardHeader className="p-10 pb-4 text-center">
            <CardTitle className="text-3xl font-serif font-bold text-primary">
               {isLogin ? "Bem-vindo de volta" : "Faça parte da história"}
            </CardTitle>
            <CardDescription className="font-medium text-sm mt-2">
              {isLogin 
                ? "Acesse seu perfil para reservar seu próximo corte." 
                : "Cadastre-se e entre para o clube exclusivo da Du Barber."}
            </CardDescription>
          </CardHeader>
          <CardContent className="p-10 pt-4">
            <form onSubmit={handleSubmit} className="space-y-6">
              {!isLogin && (
                <div className="space-y-2">
                  <Label htmlFor="auth-name" className="text-[10px] font-bold uppercase tracking-widest text-primary/60 ml-2">Nome Completo</Label>
                  <div className="relative group">
                    <User className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-accent transition-colors" />
                    <Input 
                      id="auth-name" 
                      placeholder="Ex: João da Silva" 
                      className="pl-14 h-14 rounded-2xl bg-slate-50 border-border focus-visible:ring-accent font-medium shadow-inner" 
                      required 
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                    />
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="auth-phone" className="text-[10px] font-bold uppercase tracking-widest text-primary/60 ml-2">WhatsApp ou E-mail</Label>
                <div className="relative group">
                  {formData.phone.includes('@') ? (
                    <Mail className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-accent transition-colors" />
                  ) : (
                    <Phone className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-accent transition-colors" />
                  )}
                  <Input 
                    id="auth-phone" 
                    placeholder="Seu telefone ou e-mail" 
                    className="pl-14 h-14 rounded-2xl bg-slate-50 border-border focus-visible:ring-accent font-bold tracking-tighter shadow-inner" 
                    required 
                    value={formData.phone}
                    onChange={(e) => {
                      const val = e.target.value;
                      // Only mask if it doesn't look like an email and is not empty
                      if (val && !val.includes('@') && /^\d/.test(val)) {
                        setFormData({...formData, phone: maskPhone(val)});
                      } else {
                        setFormData({...formData, phone: val});
                      }
                    }}
                  />
                </div>
              </div>

              {!isLogin && (
                <div className="space-y-2">
                  <Label htmlFor="auth-email" className="text-[10px] font-bold uppercase tracking-widest text-primary/60 ml-2">E-mail de Contato</Label>
                  <div className="relative group">
                    <Mail className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-accent transition-colors" />
                    <Input 
                      id="auth-email" 
                      type="email" 
                      placeholder="seu@exemplo.com" 
                      className="pl-14 h-14 rounded-2xl bg-slate-50 border-border focus-visible:ring-accent font-medium shadow-inner" 
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                    />
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <div className="flex justify-between items-center ml-2">
                   <Label htmlFor="auth-pass" className="text-[10px] font-bold uppercase tracking-widest text-primary/60">Senha de Acesso</Label>
                   {isLogin && <button type="button" className="text-[9px] font-bold uppercase text-accent hover:underline tracking-tighter transition-all">Esqueceu a senha?</button>}
                </div>
                <div className="relative group">
                  <Lock className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-accent transition-colors" />
                  <Input 
                    id="auth-pass" 
                    type="password" 
                    placeholder="••••••••" 
                    className="pl-14 h-14 rounded-2xl bg-slate-50 border-border focus-visible:ring-accent font-bold tracking-widest shadow-inner" 
                    required 
                    value={formData.password}
                    onChange={(e) => setFormData({...formData, password: e.target.value})}
                  />
                </div>
                {isLogin && <p className="text-[9px] text-muted-foreground font-bold uppercase tracking-widest mt-2 ml-2 italic opacity-60">Padrão: cliente123</p>}
              </div>

              <div className="pt-4 space-y-6">
                 <Button type="submit" className="w-full h-20 text-2xl font-bold uppercase tracking-[0.1em] bg-primary hover:bg-primary/95 text-white rounded-[2rem] shadow-[0_15px_40px_-10px_rgba(0,51,102,0.4)] transition-all hover:scale-[1.02] active:scale-[0.98] border-none" disabled={loading}>
                    {loading ? <Loader2 className="w-8 h-8 animate-spin" /> : (
                      <span className="flex items-center gap-3">
                        {isLogin ? "Acessar Clube" : "Criar Minha Conta"}
                        <ArrowRight className="w-6 h-6 text-accent" />
                      </span>
                    )}
                 </Button>

                 <div className="text-center">
                    <button 
                      type="button"
                      onClick={() => setIsLogin(!isLogin)}
                      className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground hover:text-primary transition-all group"
                    >
                      {isLogin ? "Ainda não tem conta? " : "Já faz parte do clube? "}
                      <span className="text-accent underline decoration-2 underline-offset-4 group-hover:text-primary transition-colors">
                        {isLogin ? "Associe-se Agora" : "Fazer Login"}
                      </span>
                    </button>
                 </div>
              </div>
            </form>
          </CardContent>
        </Card>

        <div className="mt-12 flex justify-center items-center gap-4 opacity-40">
           <ShieldCheck className="w-4 h-4 text-primary" />
           <p className="text-[9px] font-bold uppercase tracking-[0.3em] text-primary">Ambiente 100% Seguro</p>
        </div>
      </div>
    </div>
  );
}
