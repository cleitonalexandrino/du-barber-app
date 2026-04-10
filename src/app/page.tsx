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
import {
  LayoutDashboard, Users, Settings, LogOut,
  Scissors, UserCheck, ChevronLeft, Menu, X
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { ThemeToggle } from "@/components/theme-toggle";

export default function App() {
  const [view, setView] = useState('booking');
  const [bookingStep, setBookingStep] = useState(1);
  const [adminView, setAdminView] = useState('dashboard');
  const [showAdminSwitcher, setShowAdminSwitcher] = useState(false);
  const [loggedCustomer, setLoggedCustomer] = useState<any>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const [bookingData, setBookingData] = useState({
    service: null,
    barber: null,
    date: null,
    time: null,
    customer: { name: '', phone: '', email: '' }
  });

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
    setView('booking');
    setBookingStep(1);
    setShowAdminSwitcher(false);
    setLoggedCustomer(null);
    const url = new URL(window.location.href);
    url.searchParams.delete('admin');
    window.location.href = url.origin + url.pathname;
  };

  const handleAdminSwitch = async () => {
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

    const email = prompt("Digite seu e-mail de administrador:");
    if (!email) return;
    const pass = prompt("Digite sua senha:");
    if (!pass) return;

    const { data: admin } = await supabase
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
                service: null, barber: null, date: null, time: null,
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

  const adminNavItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, group: 'Operacional' },
    { id: 'services', label: 'Serviços', icon: Settings, group: 'Operacional' },
    { id: 'staff', label: 'Equipe / Staff', icon: UserCheck, group: 'Pessoas' },
    { id: 'clients', label: 'Clientes', icon: Users, group: 'Pessoas' },
  ];

  const groupedNav = adminNavItems.reduce((acc: any, item) => {
    if (!acc[item.group]) acc[item.group] = [];
    acc[item.group].push(item);
    return acc;
  }, {});

  return (
    <div className="min-h-screen bg-background text-foreground">

      {/* Top utility bar */}
      <div className="fixed top-4 right-4 z-[100] flex gap-2">
        <ThemeToggle />
        {showAdminSwitcher && (
          <div className="flex bg-primary/5 border border-border overflow-hidden">
            <button
              className={`px-4 py-2 text-[9px] font-bold uppercase tracking-widest transition-all ${
                view === 'booking'
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:text-primary hover:bg-secondary'
              }`}
              onClick={() => setView('booking')}
            >
              Cliente
            </button>
            <button
              className={`px-4 py-2 text-[9px] font-bold uppercase tracking-widest transition-all border-l border-border ${
                view === 'admin'
                  ? 'bg-accent text-accent-foreground'
                  : 'text-muted-foreground hover:text-primary hover:bg-secondary'
              }`}
              onClick={handleAdminSwitch}
            >
              Admin
            </button>
          </div>
        )}
      </div>

      <main className="max-w-7xl mx-auto px-4 py-4 md:py-8">

        {/* ===== ADMIN VIEW ===== */}
        {view === 'admin' && (
          <div className="relative">
            {/* Mobile FAB */}
            <div className="md:hidden fixed bottom-6 right-4 z-[110]">
              <button
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                className="w-14 h-14 bg-primary text-primary-foreground flex items-center justify-center shadow-2xl transition-all active:scale-90"
              >
                {isSidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>

            {/* Mobile overlay */}
            {isSidebarOpen && (
              <div
                className="md:hidden fixed inset-0 bg-black/70 z-[105]"
                onClick={() => setIsSidebarOpen(false)}
              />
            )}

            <div className="grid grid-cols-1 md:grid-cols-[260px_1fr] gap-8 md:gap-10">
              {/* Sidebar */}
              <aside className={`
                fixed inset-y-0 left-0 z-[106] w-[260px] bg-primary text-primary-foreground
                flex flex-col
                transform transition-transform duration-400 ease-out shadow-2xl
                md:relative md:translate-x-0 md:h-fit md:top-8
                ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
              `}>
                {/* Brand */}
                <div className="flex items-center gap-3 p-6 border-b border-white/10">
                  <div className="w-10 h-10 bg-white flex items-center justify-center flex-shrink-0 overflow-hidden">
                    <Image src="/logo.png" alt="Logo" width={40} height={40} className="object-contain" />
                  </div>
                  <div>
                    <h1 className="font-serif text-lg font-bold leading-none">DU BARBER</h1>
                    <p className="text-[9px] text-white/40 font-bold uppercase tracking-widest mt-0.5">Admin</p>
                  </div>
                </div>

                {/* Nav */}
                <nav className="flex-1 p-4 space-y-6 overflow-y-auto">
                  {Object.entries(groupedNav).map(([group, items]: any) => (
                    <div key={group}>
                      <p className="px-3 text-[9px] font-bold uppercase tracking-[0.25em] text-white/30 mb-2">{group}</p>
                      <div className="space-y-1">
                        {items.map((item: any) => {
                          const Icon = item.icon;
                          const isActive = adminView === item.id;
                          return (
                            <button
                              key={item.id}
                              onClick={() => { setAdminView(item.id); setIsSidebarOpen(false); }}
                              className={`w-full flex items-center gap-3 px-3 py-3 text-left text-[13px] font-medium transition-all duration-200 ${
                                isActive
                                  ? 'bg-accent text-accent-foreground font-bold'
                                  : 'text-white/70 hover:text-white hover:bg-white/8'
                              }`}
                            >
                              <Icon className={`w-4 h-4 flex-shrink-0 ${isActive ? 'text-accent-foreground' : 'text-white/40'}`} />
                              {item.label}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </nav>

                {/* Footer */}
                <div className="p-4 border-t border-white/10">
                  <button
                    onClick={() => { handleLogout(); setIsSidebarOpen(false); }}
                    className="w-full flex items-center gap-3 px-3 py-3 text-[13px] font-medium text-white/40 hover:text-destructive transition-colors duration-200"
                  >
                    <LogOut className="w-4 h-4" />
                    Sair do Painel
                  </button>
                </div>
              </aside>

              {/* Content */}
              <div className="animate-slide-up min-w-0">
                {content()}
              </div>
            </div>
          </div>
        )}

        {/* ===== BOOKING VIEW ===== */}
        {view === 'booking' && (
          <div className="max-w-md mx-auto py-2 md:py-6">
            {loggedCustomer && (
              <div className="animate-slide-up">
                {/* Header */}
                <div className="relative flex items-center justify-center mb-6">
                  {/* Back button */}
                  {bookingStep > 1 && (
                    <button
                      onClick={prevStep}
                      className="absolute left-0 w-10 h-10 border border-border bg-card flex items-center justify-center hover:bg-secondary hover:border-primary/40 transition-all active:scale-90"
                    >
                      <ChevronLeft className="w-4 h-4 text-primary" />
                    </button>
                  )}

                  {/* Brand center */}
                  <div className="flex flex-col items-center">
                    <div className="relative mb-2">
                      <div className="w-12 h-12 bg-primary flex items-center justify-center overflow-hidden ring-2 ring-accent/30 ring-offset-2 ring-offset-background">
                        <Image src="/logo.png" alt="Logo" width={48} height={48} className="object-contain scale-90" />
                      </div>
                    </div>
                    <h1 className="font-serif text-xl font-bold text-primary tracking-tight leading-none">Du Barber</h1>
                    <div className="flex items-center gap-2 mt-1">
                      <div className="h-px w-4 bg-accent" />
                      <p className="text-[8px] font-bold uppercase tracking-[0.2em] text-muted-foreground">Tradição desde sempre</p>
                      <div className="h-px w-4 bg-accent" />
                    </div>
                  </div>

                  {/* Logout button */}
                  <button
                    onClick={handleLogout}
                    className="absolute right-0 w-10 h-10 border border-border bg-card flex items-center justify-center hover:bg-destructive/10 hover:border-destructive/40 transition-all active:scale-90 group"
                    title="Sair"
                  >
                    <LogOut className="w-3.5 h-3.5 text-muted-foreground group-hover:text-destructive transition-colors" />
                  </button>
                </div>

                {/* Step progress indicator */}
                <div className="flex items-center gap-0 mb-7">
                  {[1, 2, 3, 4].map((step) => (
                    <React.Fragment key={step}>
                      {/* Step dot */}
                      <div className={`
                        relative flex items-center justify-center w-7 h-7 text-[10px] font-bold
                        transition-all duration-500 flex-shrink-0
                        ${step === bookingStep
                          ? 'bg-accent text-accent-foreground shadow-md shadow-accent/30'
                          : step < bookingStep
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-muted text-muted-foreground'
                        }
                      `}>
                        {step < bookingStep ? (
                          <svg className="w-3 h-3" viewBox="0 0 12 12" fill="none">
                            <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        ) : step}
                      </div>

                      {/* Connector */}
                      {step < 4 && (
                        <div className="flex-1 h-px relative overflow-hidden">
                          <div className={`absolute inset-0 transition-all duration-700 ${step < bookingStep ? 'bg-primary' : 'bg-muted'}`} />
                          {step === bookingStep && (
                            <div className="absolute inset-0 bg-accent/40" />
                          )}
                        </div>
                      )}
                    </React.Fragment>
                  ))}
                </div>
              </div>
            )}

            {/* Content */}
            <div className="animate-card-enter">
              {content()}
            </div>
          </div>
        )}
      </main>

      <Toaster position="top-center" richColors />
    </div>
  );
}
