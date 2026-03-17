"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Dashboard from '../_components/admin/Dashboard';
import ClientManagement from '../_components/admin/ClientManagement';
import ServiceManagement from '../_components/admin/ServiceManagement';
import StaffManagement from '../_components/admin/StaffManagement';
import { Button } from "@/components/ui/button";
import { Toaster, toast } from "sonner";
import { LayoutDashboard, Users, Settings, LogOut, Scissors, UserCheck } from "lucide-react";

export default function AdminPage() {
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [adminView, setAdminView] = useState('dashboard'); // 'dashboard', 'clients', 'services', 'staff'

  useEffect(() => {
    // Check if Cleiton is logging in
    const email = prompt("Painel Administrativo - Digite seu e-mail:");
    if (email === "cleitonalexandrino@gmail.com") {
      const pass = prompt("Digite sua senha:");
      if (pass === "admin123") {
        setIsAuthorized(true);
        toast.success("Bem-vindo de volta, Cleiton!");
      } else {
        toast.error("Senha incorreta.");
        router.push('/');
      }
    } else {
      toast.error("Acesso não autorizado.");
      router.push('/');
    }
  }, [router]);

  const handleLogout = () => {
    setIsAuthorized(false);
    toast.info("Saindo do painel...");
    router.push('/');
  };

  if (!isAuthorized) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
        <Scissors className="w-12 h-12 text-primary animate-pulse mb-4" />
        <h1 className="text-xl font-bold">Verificando Credenciais...</h1>
        <Toaster position="top-center" theme="dark" />
      </div>
    );
  }

  const renderContent = () => {
    switch (adminView) {
      case 'dashboard': return <Dashboard />;
      case 'clients': return <ClientManagement />;
      case 'services': return <ServiceManagement />;
      case 'staff': return <StaffManagement />;
      default: return <Dashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground transition-colors duration-300">
      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-[240px_1fr] gap-8">
          <aside className="space-y-2">
            <div className="mb-8 flex items-center gap-2 px-2">
              <Scissors className="w-6 h-6 text-primary" />
              <h1 className="text-xl font-bold tracking-tight text-white uppercase">DU ADMIN</h1>
            </div>
            <Button 
              variant={adminView === 'dashboard' ? 'default' : 'ghost'} 
              className="w-full justify-start gap-3 h-11 px-4"
              onClick={() => setAdminView('dashboard')}
            >
              <LayoutDashboard className="w-4 h-4" />
              Dashboard
            </Button>
            <Button 
              variant={adminView === 'staff' ? 'default' : 'ghost'} 
              className="w-full justify-start gap-3 h-11 px-4"
              onClick={() => setAdminView('staff')}
            >
              <UserCheck className="w-4 h-4" />
              Equipe
            </Button>
            <Button 
              variant={adminView === 'clients' ? 'default' : 'ghost'} 
              className="w-full justify-start gap-3 h-11 px-4"
              onClick={() => setAdminView('clients')}
            >
              <Users className="w-4 h-4" />
              Clientes
            </Button>
            <Button 
              variant={adminView === 'services' ? 'default' : 'ghost'} 
              className="w-full justify-start gap-3 h-11 px-4"
              onClick={() => setAdminView('services')}
            >
              <Settings className="w-4 h-4" />
              Serviços
            </Button>
            <div className="pt-8 mt-8 border-t border-border">
              <Button 
                variant="ghost" 
                className="w-full justify-start gap-3 h-11 px-4 text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                onClick={handleLogout}
              >
                <LogOut className="w-4 h-4" />
                Sair do Painel
              </Button>
            </div>
          </aside>
          <div className="space-y-6">
            {renderContent()}
          </div>
        </div>
      </main>
      <Toaster position="top-center" theme="dark" closeButton />
    </div>
  );
}
