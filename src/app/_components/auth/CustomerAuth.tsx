"use client";

import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Scissors, User, Phone, Mail, Lock, Loader2, ArrowRight } from "lucide-react";
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
        // Handle Login
        const { data, error } = await supabase
          .from('clients')
          .select('*')
          .eq('phone', formData.phone)
          .eq('password', formData.password || 'cliente123')
          .single();

        if (error || !data) {
          toast.error("Telefone ou senha incorretos.");
        } else {
          toast.success(`Bem-vindo, ${data.name}!`);
          onLoginSuccess(data);
        }
      } else {
        // Handle Registration
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
    <div className="min-h-[80vh] flex flex-col items-center justify-center p-4 animate-in fade-in duration-700">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
           <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
             <Scissors className="w-8 h-8 text-primary" />
           </div>
           <h1 className="text-3xl font-black tracking-tighter uppercase">Du Barber House</h1>
           <p className="text-muted-foreground text-sm mt-1">Acesse sua conta para agendar seu horário</p>
        </div>

        <Card className="bg-card/50 border-border shadow-2xl backdrop-blur-sm">
          <CardHeader>
            <CardTitle>{isLogin ? "Entrar" : "Criar Conta"}</CardTitle>
            <CardDescription>
              {isLogin 
                ? "Informe seu telefone para acessar seus dados." 
                : "Cadastre-se para acumular pontos e agendar mais rápido."}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {!isLogin && (
                <div className="space-y-2">
                  <Label htmlFor="auth-name">Nome Completo</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                    <Input 
                      id="auth-name" 
                      placeholder="Ex: Cleiton Silva" 
                      className="pl-10 h-12 bg-muted/30 border-0 focus-visible:ring-primary" 
                      required 
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                    />
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="auth-phone">Telefone / WhatsApp</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                  <Input 
                    id="auth-phone" 
                    placeholder="(00) 00000-0000" 
                    className="pl-10 h-12 bg-muted/30 border-0 focus-visible:ring-primary" 
                    required 
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: maskPhone(e.target.value)})}
                  />
                </div>
              </div>

              {!isLogin && (
                <div className="space-y-2">
                  <Label htmlFor="auth-email">E-mail (Opcional)</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                    <Input 
                      id="auth-email" 
                      type="email" 
                      placeholder="seu@email.com" 
                      className="pl-10 h-12 bg-muted/30 border-0 focus-visible:ring-primary" 
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                    />
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <div className="flex justify-between items-center">
                   <Label htmlFor="auth-pass">Senha</Label>
                   {isLogin && <button type="button" className="text-[10px] text-primary hover:underline">Esqueci a senha</button>}
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                  <Input 
                    id="auth-pass" 
                    type="password" 
                    placeholder="••••••••" 
                    className="pl-10 h-12 bg-muted/30 border-0 focus-visible:ring-primary" 
                    required 
                    value={formData.password}
                    onChange={(e) => setFormData({...formData, password: e.target.value})}
                  />
                </div>
                {isLogin && <p className="text-[10px] text-muted-foreground italic">Senha padrão: cliente123</p>}
              </div>

              <Button type="submit" className="w-full h-12 text-lg font-bold mt-2 gap-2 shadow-lg shadow-primary/20" disabled={loading}>
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (
                  <>
                    {isLogin ? "Acessar Painel" : "Finalizar Cadastro"}
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </Button>

              <div className="text-center mt-6">
                <button 
                  type="button"
                  onClick={() => setIsLogin(!isLogin)}
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  {isLogin ? "Não tem uma conta? " : "Já possui conta? "}
                  <span className="text-primary font-bold underline">
                    {isLogin ? "Cadastre-se agora" : "Fazer Login"}
                  </span>
                </button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
