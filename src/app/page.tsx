"use client";

import React, { useState } from 'react';
import BookingStep1 from './_components/booking/Step1';
import BookingStep2 from './_components/booking/Step2';
import BookingStep3 from './_components/booking/Step3';
import BookingStep4 from './_components/booking/Step4';
import Dashboard from './_components/admin/Dashboard';
import ClientManagement from './_components/admin/ClientManagement';
import ServiceManagement from './_components/admin/ServiceManagement';
import StaffManagement from './_components/admin/StaffManagement';
import CustomerAuth from './_components/auth/CustomerAuth';
import { Button } from "@/components/ui/button";
import { Toaster, toast } from "sonner";
import { LayoutDashboard, Calendar, Users, Settings, LogOut, Scissors, UserCheck, ChevronLeft, Moon, Sun } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { ThemeToggle } from "@/components/theme-toggle";

export default function App() {
  const [view, setView] = useState('booking'); // 'booking' or 'admin'
  const [bookingStep, setBookingStep] = useState(1);
  const [adminView, setAdminView] = useState('dashboard'); // 'dashboard', 'clients', 'services', 'staff'
  const [showAdminSwitcher, setShowAdminSwitcher] = useState(false);
  const [loggedCustomer, setLoggedCustomer] = useState<any>(null);
  
  const [bookingData, setBookingData] = useState({
    service: null,
    barber: null,
    date: null,
    time: null,
    customer: {
      name: '',
      phone: '',
      email: ''
    }
  });

  // Check for admin access via URL parameter
  React.useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('admin') === 'true') {
      setShowAdminSwitcher(true);
    }
  }, []);

  const nextStep = () => setBookingStep(prev => Math.min(prev + 1, 4));
  const prevStep = () => setBookingStep(prev => Math.max(prev - 1, 1));

  const handleLogout = () => {
    // 1. Reset all local states
    setView('booking');
    setBookingStep(1);
    setShowAdminSwitcher(false);
    setLoggedCustomer(null);
    
    // 2. Clear URL and Refresh (Anti-Cache)
    const url = new URL(window.location.href);
    url.searchParams.delete('admin');
    window.location.href = url.origin + url.pathname;
  };

  const handleCustomerLogin = async () => {
    const phone = prompt("Digite seu Telefone:");
    if (!phone) return;
    
    const pass = prompt("Digite sua senha (padrão: cliente123):");
    if (!pass) return;

    const { data: customer, error } = await supabase
      .from('clients')
      .select('*')
      .eq('phone', phone)
      .eq('password', pass)
      .single();

    if (error || !customer) {
      toast.error("Cliente não encontrado ou senha incorreta.");
      
      const wantRegister = confirm("Deseja criar uma nova conta com esses dados?");
      if (wantRegister) {
        const name = prompt("Digite seu nome completo:");
        if (name) {
          const { data: newCustomer, error: regError } = await supabase
            .from('clients')
            .insert({ name, phone, password: pass })
            .select()
            .single();
          
          if (regError) {
             toast.error("Erro ao cadastrar: " + regError.message);
          } else {
             setLoggedCustomer(newCustomer);
             toast.success("Conta criada! Bem-vindo, " + name);
          }
        }
      }
    } else {
      setLoggedCustomer(customer);
      toast.success("Bem-vindo de volta, " + customer.name);
    }
  };

  const handleAdminSwitch = () => {
    const email = prompt("Digite seu e-mail de administrador:");
    if (email === "cleitonalexandrino@gmail.com") {
      const pass = prompt("Digite sua senha:");
      if (pass === "admin123") {
        setView('admin');
        toast.success("Bem-vindo, Cleiton Silva!");
      } else {
        toast.error("Senha incorreta.");
      }
    } else {
      toast.error("Usuário não autorizado.");
    }
  };

  const content = () => {
    if (view === 'booking') {
      if (!loggedCustomer) {
        return <CustomerAuth onLoginSuccess={(customer) => setLoggedCustomer(customer)} />;
      }

      switch (bookingStep) {
        case 1: return <BookingStep1 data={bookingData} updateData={setBookingData} onNext={nextStep} />;
        case 2: return <BookingStep2 data={bookingData} updateData={setBookingData} onNext={nextStep} onBack={prevStep} />;
        case 3: return <BookingStep3 data={bookingData} updateData={setBookingData} onNext={nextStep} onBack={prevStep} />;
        case 4: return (
          <BookingStep4 
            data={bookingData} 
            updateData={setBookingData} 
            loggedCustomer={loggedCustomer}
            onBack={prevStep} 
            onComplete={() => {
              setBookingStep(1);
              setBookingData({
                service: null,
                barber: null,
                date: null,
                time: null,
                customer: { name: '', phone: '', email: '' }
              });
            }} 
          />
        );
        default: return <BookingStep1 data={bookingData} updateData={setBookingData} onNext={nextStep} />;
      }
    } else {
      switch (adminView) {
        case 'dashboard': return <Dashboard />;
        case 'clients': return <ClientManagement />;
        case 'services': return <ServiceManagement />;
        case 'staff': return <StaffManagement />;
        default: return <Dashboard />;
      }
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground transition-colors duration-300">
      {/* Botões de Utilidade Fixos no Topo */}
      <div className="fixed top-4 right-4 z-[100] flex gap-2">
        <ThemeToggle />
        {showAdminSwitcher && (
          <div className="flex gap-2">
            <Button 
              variant={view === 'booking' ? 'default' : 'outline'} 
              size="sm"
              className="rounded-full shadow-md bg-background/50 border-border"
              onClick={() => setView('booking')}
            >
              Cliente
            </Button>
            <Button 
              variant={view === 'admin' ? 'default' : 'outline'} 
              size="sm"
              className="rounded-full shadow-md bg-background/50 border-border"
              onClick={handleAdminSwitch}
            >
              Admin
            </Button>
          </div>
        )}
      </div>

      {/* Navigation Switcher (Hidden from Customers) - Mantido para compatibilidade se necessário, mas os botões agora estão no topo */}
      {showAdminSwitcher && (
        <div className="fixed bottom-4 right-4 z-50 flex gap-2 opacity-30 hover:opacity-100 transition-opacity">
          <Button 
            variant={view === 'booking' ? 'default' : 'secondary'} 
            size="sm"
            onClick={() => setView('booking')}
          >
            Modo Cliente
          </Button>
          <Button 
            variant={view === 'admin' ? 'default' : 'secondary'} 
            size="sm"
            onClick={handleAdminSwitch}
          >
            Modo Admin
          </Button>
        </div>
      )}

      <main className="max-w-7xl mx-auto px-4 py-8">
        {view === 'admin' && (
          <div className="grid grid-cols-1 md:grid-cols-[240px_1fr] gap-8">
            <aside className="space-y-2">
              <div className="mb-8 flex items-center gap-2 px-2">
                <Scissors className="w-6 h-6 text-primary" />
                <h1 className="text-xl font-bold tracking-tight text-white">DU BARBER</h1>
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
                className="w-full justify-start gap-3 h-11 px-4 text-white"
                onClick={() => setAdminView('staff')}
              >
                <UserCheck className="w-4 h-4" />
                Equipe
              </Button>
              <Button 
                variant={adminView === 'clients' ? 'default' : 'ghost'} 
                className="w-full justify-start gap-3 h-11 px-4 text-white"
                onClick={() => setAdminView('clients')}
              >
                <Users className="w-4 h-4" />
                Clientes
              </Button>
              <Button 
                variant={adminView === 'services' ? 'default' : 'ghost'} 
                className="w-full justify-start gap-3 h-11 px-4 text-white"
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
              {content()}
            </div>
          </div>
        )}

        {view === 'booking' && (
          <div className="max-w-md mx-auto py-8">
             <div className="text-center mb-8 relative">
                 {/* Botão Global de Sair/Reiniciar mais visível */}
                 <div className="absolute -top-4 right-0 md:-right-4 flex gap-1">
                   {loggedCustomer && (
                     <Button 
                       variant="outline" 
                       size="sm" 
                       className="gap-2 h-9 px-3 text-xs bg-background/50 border-border hover:text-destructive hover:bg-destructive/10 transition-all shadow-sm rounded-full"
                       onClick={handleLogout}
                       title="Sair do Aplicativo"
                     >
                       <span className="hidden sm:inline">Sair do App</span>
                       <LogOut className="w-4 h-4" />
                     </Button>
                   )}
                 </div>

                 <div className="flex flex-col items-center mt-2 mb-2">
                    {loggedCustomer && (
                      <div className="flex items-center gap-2 bg-secondary/10 px-3 py-1.5 rounded-full border border-secondary/20 transition-all hover:bg-secondary/20 scale-95 opacity-80 hover:opacity-100 relative">
                         <div className="w-5 h-5 rounded-full bg-secondary flex items-center justify-center text-[9px] font-black text-white">
                           {loggedCustomer.name.charAt(0)}
                         </div>
                         <span className="text-[11px] font-bold">{loggedCustomer.name}</span>
                         <button onClick={() => setLoggedCustomer(null)} className="text-[10px] text-muted-foreground hover:text-destructive underline ml-1">Sair</button>
                      </div>
                    )}
                 </div>

                 {loggedCustomer && (
                   <div className="animate-in fade-in duration-500">
                     {bookingStep > 1 && (
                       <Button 
                         variant="ghost" 
                         size="sm" 
                         className="absolute left-0 -top-4 gap-1.5 h-9 px-3 text-xs text-muted-foreground hover:text-foreground"
                         onClick={prevStep}
                       >
                         <ChevronLeft className="w-4 h-4" />
                         Voltar
                       </Button>
                     )}

                     <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
                       <Scissors className="w-8 h-8 text-primary" />
                     </div>
                     <h1 className="text-2xl font-bold tracking-tight">Du Barber House</h1>
                     <h2 className="text-muted-foreground text-sm">Rua Hamílton Prado, 13</h2>
                     
                     <div className="mt-8 flex justify-center gap-2">
                       {[1, 2, 3, 4].map(step => (
                         <div 
                          key={step} 
                          className={`h-1.5 w-8 rounded-full transition-all duration-300 ${step === bookingStep ? 'bg-primary w-12' : step < bookingStep ? 'bg-secondary' : 'bg-muted'}`} 
                         />
                       ))}
                     </div>
                   </div>
                 )}
              </div>
              {content()}
           </div>
        )}
      </main>
      <Toaster position="top-center" theme="dark" closeButton />
    </div>
  );
}
