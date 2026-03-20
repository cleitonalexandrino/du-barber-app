"use client";

import React, { useState } from 'react';
import Image from 'next/image';
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
import { LayoutDashboard, Calendar, Users, Settings, LogOut, Scissors, UserCheck, ChevronLeft, Moon, Sun, Menu, X } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { ThemeToggle } from "@/components/theme-toggle";

export default function App() {
  const [view, setView] = useState('booking'); // 'booking' or 'admin'
  const [bookingStep, setBookingStep] = useState(1);
  const [adminView, setAdminView] = useState('dashboard'); // 'dashboard', 'clients', 'services', 'staff'
  const [showAdminSwitcher, setShowAdminSwitcher] = useState(false);
  const [loggedCustomer, setLoggedCustomer] = useState<any>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
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

  // Check for admin access via URL parameter OR logged status
  React.useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('admin') === 'true') {
      setShowAdminSwitcher(true);
      return;
    }

    if (loggedCustomer) {
      const checkAdmin = async () => {
        const { data } = await supabase
          .from('admins')
          .select('id')
          .eq('email', loggedCustomer.email)
          .single();
        
        if (data) setShowAdminSwitcher(true);
      };
      checkAdmin();
    }
  }, [loggedCustomer]);

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

  const handleAdminSwitch = async () => {
    // 1. Verificar se o usuário atual logado como cliente tem status de admin
    if (loggedCustomer) {
      const { data, error } = await supabase
        .from('admins')
        .select('*')
        .eq('email', loggedCustomer.email)
        .single();
      
      if (data) {
        setView('admin');
        toast.success(`Modo Administrador Ativado!`);
        return;
      }
    }

    // 2. Fallback para login manual de admin
    const email = prompt("Digite seu e-mail de administrador:");
    if (!email) return;

    const pass = prompt("Digite sua senha:");
    if (!pass) return;

    const { data: admin, error } = await supabase
      .from('admins')
      .select('*')
      .eq('email', email)
      .eq('password', pass)
      .single();

    if (admin) {
      setView('admin');
      toast.success(`Bem-vindo, ${admin.name}!`);
    } else {
      toast.error("Acesso administrativo negado.");
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
    <div className="min-h-screen bg-background text-foreground transition-all duration-500 font-sans">
      {/* Botões de Utilidade Fixos no Topo */}
      <div className="fixed top-6 right-6 z-[100] flex gap-3">
        <ThemeToggle />
        {showAdminSwitcher && (
          <div className="flex bg-white/10 backdrop-blur-md p-1 rounded-full border border-white/20 shadow-xl overflow-hidden">
            <Button 
              variant={view === 'booking' ? 'default' : 'ghost'} 
              size="sm"
              className={`rounded-full h-8 px-3 md:px-4 text-[9px] md:text-[10px] font-bold uppercase tracking-wider transition-all ${view === 'booking' ? 'shadow-lg bg-primary text-white' : 'hover:bg-white/10 text-muted-foreground'}`}
              onClick={() => setView('booking')}
            >
              Cliente
            </Button>
            <Button 
              variant={view === 'admin' ? 'default' : 'ghost'} 
              size="sm"
              className={`rounded-full h-8 px-3 md:px-4 text-[9px] md:text-[10px] font-bold uppercase tracking-wider transition-all ${view === 'admin' ? 'shadow-lg bg-primary text-white' : 'hover:bg-white/10 text-muted-foreground'}`}
              onClick={handleAdminSwitch}
            >
              Admin
            </Button>
          </div>
        )}
      </div>

      <main className="max-w-7xl mx-auto px-4 py-4 md:py-8">
        {view === 'admin' && (
          <div className="relative">
            {/* Botão de Menu Mobile */}
            <div className="md:hidden fixed bottom-6 right-6 z-[110]">
              <Button 
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                className="w-16 h-16 rounded-full shadow-2xl bg-primary text-white border-none hover:bg-primary/90 transition-all active:scale-90"
              >
                {isSidebarOpen ? <X className="w-8 h-8" /> : <Menu className="w-8 h-8" />}
              </Button>
            </div>

            {/* Overlay para Mobile */}
            {isSidebarOpen && (
              <div 
                className="md:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-[105] animate-in fade-in duration-300"
                onClick={() => setIsSidebarOpen(false)}
              />
            )}

            <div className="grid grid-cols-1 md:grid-cols-[280px_1fr] gap-8 md:gap-12">
              <aside className={`
                fixed inset-y-0 left-0 z-[106] w-[280px] bg-primary text-primary-foreground p-8 
                transform transition-transform duration-500 ease-out shadow-2xl md:shadow-none
                md:relative md:translate-x-0 md:rounded-2xl md:h-fit md:top-8 md:border md:border-white/10
                ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
              `}>
                <div className="flex flex-col items-center gap-4 py-6 border-b border-white/10">
                  <div className="relative group">
                    <div className="absolute -inset-2 bg-gradient-to-tr from-accent to-accent/20 rounded-full blur-lg opacity-20 group-hover:opacity-40 transition-opacity" />
                    <div className="relative w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-inner overflow-hidden">
                      <Image 
                        src="/logo.png" 
                        alt="Logo" 
                        width={64} 
                        height={64} 
                        className="object-contain group-hover:scale-110 transition-transform duration-500" 
                      />
                    </div>
                  </div>
                  <h1 className="text-2xl font-serif font-bold tracking-tighter mt-2">DU BARBER</h1>
                </div>

                <div className="space-y-8 mt-8">
                  <div className="space-y-2">
                    <p className="px-5 text-[10px] font-bold uppercase tracking-[0.2em] text-white/40 mb-4">Operacional</p>
                    <Button 
                      variant={adminView === 'dashboard' ? 'secondary' : 'ghost'} 
                      className={`w-full justify-start gap-4 h-14 px-6 rounded-2xl transition-all ${adminView === 'dashboard' ? 'shadow-xl scale-[1.02]' : 'hover:bg-white/10'}`}
                      onClick={() => { setAdminView('dashboard'); setIsSidebarOpen(false); }}
                    >
                      <LayoutDashboard className="w-5 h-5 opacity-70" />
                      <span className="font-bold tracking-tight">Dashboard</span>
                    </Button>
                    <Button 
                      variant={adminView === 'services' ? 'secondary' : 'ghost'} 
                      className={`w-full justify-start gap-4 h-14 px-6 rounded-2xl transition-all ${adminView === 'services' ? 'shadow-xl scale-[1.02]' : 'hover:bg-white/10'}`}
                      onClick={() => { setAdminView('services'); setIsSidebarOpen(false); }}
                    >
                      <Settings className="w-5 h-5 opacity-70" />
                      <span className="font-bold tracking-tight">Serviços</span>
                    </Button>
                  </div>

                  <div className="space-y-2">
                    <p className="px-5 text-[10px] font-bold uppercase tracking-[0.2em] text-white/40 mb-4">Pessoas</p>
                    <Button 
                      variant={adminView === 'staff' ? 'secondary' : 'ghost'} 
                      className={`w-full justify-start gap-4 h-14 px-6 rounded-2xl transition-all ${adminView === 'staff' ? 'shadow-xl scale-[1.02]' : 'hover:bg-white/10'}`}
                      onClick={() => { setAdminView('staff'); setIsSidebarOpen(false); }}
                    >
                      <UserCheck className="w-5 h-5 opacity-70" />
                      <span className="font-bold tracking-tight">Equipe / Staff</span>
                    </Button>
                    <Button 
                      variant={adminView === 'clients' ? 'secondary' : 'ghost'} 
                      className={`w-full justify-start gap-4 h-14 px-6 rounded-2xl transition-all ${adminView === 'clients' ? 'shadow-xl scale-[1.02]' : 'hover:bg-white/10'}`}
                      onClick={() => { setAdminView('clients'); setIsSidebarOpen(false); }}
                    >
                      <Users className="w-5 h-5 opacity-70" />
                      <span className="font-bold tracking-tight">Clientes</span>
                    </Button>
                  </div>
                </div>

                <div className="mt-auto pt-8 border-t border-white/10">
                  <Button 
                    variant="ghost" 
                    className="w-full justify-start gap-4 h-14 px-6 text-white/60 hover:text-accent hover:bg-accent/10 transition-all rounded-2xl"
                    onClick={() => { handleLogout(); setIsSidebarOpen(false); }}
                  >
                    <LogOut className="w-5 h-5" />
                    <span className="font-bold tracking-tight">Sair do Painel</span>
                  </Button>
                </div>
              </aside>
              <div className="space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-1000 ease-out fill-mode-both min-w-0">
                {content()}
              </div>
            </div>
          </div>
        )}

        {view === 'booking' && (
          <div className="max-w-md mx-auto py-2 md:py-8">
             <div className="text-center mb-6 relative animate-in fade-in slide-in-from-top-6 duration-1000 ease-out">
                  <div className="absolute -top-2 right-0 md:-right-4 flex gap-1">
                    {loggedCustomer && (
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="gap-2 h-9 px-4 text-[10px] font-bold uppercase tracking-widest bg-white/90 border-border hover:text-accent hover:border-accent/40 transition-all shadow-xl rounded-full backdrop-blur-md"
                        onClick={handleLogout}
                      >
                        <span>Sair</span>
                        <LogOut className="w-3 h-3" />
                      </Button>
                    )}
                  </div>

                  {loggedCustomer && (
                    <div className="flex flex-col items-center">
                      {bookingStep > 1 && (
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="absolute left-0 -top-2 gap-2 h-9 px-3 text-[9px] font-bold uppercase tracking-widest text-muted-foreground hover:text-primary transition-all rounded-full"
                          onClick={prevStep}
                        >
                          <ChevronLeft className="w-3 h-3" />
                          <span>VOLTAR</span>
                        </Button>
                      )}

                      <div className="relative mb-4 group">
                        <div className="absolute -inset-4 bg-primary/5 rounded-full blur-xl group-hover:bg-accent/5 transition-colors duration-1000" />
                        <div className="relative w-20 h-20 rounded-full bg-white border-4 border-primary/5 flex items-center justify-center shadow-lg ring-1 ring-border overflow-hidden">
                          <Image 
                            src="/logo.png" 
                            alt="Logo" 
                            width={80} 
                            height={80} 
                            className="object-contain group-hover:scale-110 transition-transform duration-700" 
                          />
                        </div>
                      </div>
                      
                      <h1 className="text-3xl font-serif font-bold tracking-tighter text-primary mb-1">Du Barber</h1>
                      <div className="flex items-center gap-3 mb-6">
                        <div className="h-[1px] w-8 bg-accent/40" />
                        <h2 className="text-muted-foreground text-[9px] font-bold uppercase tracking-[0.2em]">Tradição desde sempre</h2>
                        <div className="h-[1px] w-8 bg-accent/40" />
                      </div>
                      
                      <div className="mt-4 flex justify-center gap-4">
                        {[1, 2, 3, 4].map(step => (
                          <div 
                           key={step} 
                           className={`h-2 transition-all duration-700 rounded-full ${step === bookingStep ? 'w-16 bg-accent shadow-lg shadow-accent/40' : step < bookingStep ? 'w-8 bg-primary/40' : 'w-8 bg-muted'}`} 
                          />
                        ))}
                      </div>
                    </div>
                  )}
              </div>
              <div className="animate-in fade-in slide-in-from-bottom-6 duration-1000 delay-300 fill-mode-both">
                {content()}
              </div>
           </div>
        )}
      </main>
      <Toaster position="top-center" richColors />
    </div>
  );
}
