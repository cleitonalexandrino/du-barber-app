"use client";

import React, { useState } from 'react';
import Image from 'next/image';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { User, Phone, Mail, Lock, Loader2, ArrowRight, Sparkles, ShieldCheck, Scissors } from "lucide-react";
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
    <div className="min-h-fit flex flex-col items-center justify-center px-4 py-6 animate-slide-up">
      <div className="w-full max-w-sm">

        {/* Brand Header */}
        <div className="text-center mb-8">
          <div className="relative inline-flex items-center justify-center mb-5">
            {/* Warm glow behind logo */}
            <div className="absolute inset-0 bg-accent/20 rounded-full blur-2xl animate-pulse-warm scale-150" />
            <div className="relative w-20 h-20 rounded-full bg-primary flex items-center justify-center shadow-2xl ring-4 ring-accent/30 overflow-hidden">
              <Image
                src="/logo.png"
                alt="Du Barber Logo"
                width={80}
                height={80}
                className="object-contain scale-90"
              />
            </div>
            <div className="absolute -top-1 -right-1 animate-badge-pop">
              <div className="bg-accent text-primary w-6 h-6 rounded-full flex items-center justify-center shadow-lg">
                <Sparkles className="w-3 h-3" />
              </div>
            </div>
          </div>

          <h1 className="font-serif text-4xl font-bold text-primary tracking-tight leading-none">
            Du Barber
          </h1>
          <div className="flex items-center justify-center gap-3 mt-2">
            <div className="h-px w-6 bg-accent" />
            <p className="text-[9px] font-bold uppercase tracking-[0.25em] text-muted-foreground">
              Tradição & Estilo
            </p>
            <div className="h-px w-6 bg-accent" />
          </div>
        </div>

        {/* Auth Card */}
        <div className="bg-card border border-border rounded-sm shadow-[0_20px_60px_-10px_rgba(0,0,0,0.10)] overflow-hidden">

          {/* Tab switcher */}
          <div className="grid grid-cols-2 border-b border-border">
            <button
              type="button"
              onClick={() => setIsLogin(true)}
              className={`py-4 text-[11px] font-bold uppercase tracking-widest transition-all duration-200 ${
                isLogin
                  ? 'text-primary border-b-2 border-accent bg-secondary/40'
                  : 'text-muted-foreground hover:text-primary'
              }`}
            >
              Entrar
            </button>
            <button
              type="button"
              onClick={() => setIsLogin(false)}
              className={`py-4 text-[11px] font-bold uppercase tracking-widest transition-all duration-200 ${
                !isLogin
                  ? 'text-primary border-b-2 border-accent bg-secondary/40'
                  : 'text-muted-foreground hover:text-primary'
              }`}
            >
              Cadastrar
            </button>
          </div>

          <div className="p-6">
            <p className="text-[13px] text-muted-foreground font-medium mb-6">
              {isLogin
                ? "Acesse seu perfil para reservar seu próximo corte."
                : "Cadastre-se e entre para o clube exclusivo da Du Barber."}
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              {!isLogin && (
                <div className="space-y-1 animate-slide-up">
                  <Label htmlFor="auth-name" className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                    Nome Completo
                  </Label>
                  <div className="relative group">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-accent transition-colors duration-200" />
                    <Input
                      id="auth-name"
                      placeholder="João da Silva"
                      className="pl-11 h-13 rounded-sm bg-input border-border focus-visible:ring-accent focus-visible:ring-1 focus-visible:border-accent font-medium transition-all"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    />
                  </div>
                </div>
              )}

              <div className="space-y-1">
                <Label htmlFor="auth-phone" className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                  WhatsApp ou E-mail
                </Label>
                <div className="relative group">
                  {formData.phone.includes('@') ? (
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-accent transition-colors duration-200" />
                  ) : (
                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-accent transition-colors duration-200" />
                  )}
                  <Input
                    id="auth-phone"
                    placeholder="Seu telefone ou e-mail"
                    className="pl-11 h-13 rounded-sm bg-input border-border focus-visible:ring-accent focus-visible:ring-1 focus-visible:border-accent font-medium tracking-tight transition-all"
                    required
                    value={formData.phone}
                    onChange={(e) => {
                      const val = e.target.value;
                      if (val && !val.includes('@') && /^\d/.test(val)) {
                        setFormData({ ...formData, phone: maskPhone(val) });
                      } else {
                        setFormData({ ...formData, phone: val });
                      }
                    }}
                  />
                </div>
              </div>

              {!isLogin && (
                <div className="space-y-1 animate-slide-up">
                  <Label htmlFor="auth-email" className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                    E-mail de Contato
                  </Label>
                  <div className="relative group">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-accent transition-colors duration-200" />
                    <Input
                      id="auth-email"
                      type="email"
                      placeholder="seu@exemplo.com"
                      className="pl-11 h-13 rounded-sm bg-input border-border focus-visible:ring-accent focus-visible:ring-1 focus-visible:border-accent font-medium transition-all"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    />
                  </div>
                </div>
              )}

              <div className="space-y-1">
                <div className="flex justify-between items-center">
                  <Label htmlFor="auth-pass" className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                    Senha
                  </Label>
                  {isLogin && (
                    <button type="button" className="text-[9px] font-bold uppercase tracking-wider text-accent hover:text-primary transition-colors">
                      Esqueceu?
                    </button>
                  )}
                </div>
                <div className="relative group">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-accent transition-colors duration-200" />
                  <Input
                    id="auth-pass"
                    type="password"
                    placeholder="••••••••"
                    className="pl-11 h-13 rounded-sm bg-input border-border focus-visible:ring-accent focus-visible:ring-1 focus-visible:border-accent font-medium tracking-widest transition-all"
                    required
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  />
                </div>
                {isLogin && (
                  <p className="text-[9px] text-muted-foreground/50 font-medium mt-1">
                    Senha padrão: cliente123
                  </p>
                )}
              </div>

              {/* CTA Button */}
              <div className="pt-2">
                <Button
                  type="submit"
                  className="w-full h-14 text-[13px] font-bold uppercase tracking-widest bg-primary hover:bg-primary/90 text-primary-foreground rounded-sm shadow-lg transition-all duration-200 hover:translate-y-[-2px] hover:shadow-xl active:translate-y-0 active:shadow-md border-none group"
                  disabled={loading}
                >
                  {loading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <span className="flex items-center gap-3">
                      {isLogin ? "Acessar Meu Perfil" : "Criar Minha Conta"}
                      <ArrowRight className="w-4 h-4 text-accent group-hover:translate-x-1 transition-transform" />
                    </span>
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>

        {/* Trust signal */}
        <div className="mt-8 flex justify-center items-center gap-3 opacity-40">
          <ShieldCheck className="w-3.5 h-3.5 text-primary" />
          <p className="text-[9px] font-bold uppercase tracking-[0.3em] text-primary">
            Ambiente 100% Seguro
          </p>
        </div>
      </div>
    </div>
  );
}
