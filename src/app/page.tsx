"use client";

import React, { useState } from 'react';
import BookingStep1 from './_components/booking/Step1';
import BookingStep2 from './_components/booking/Step2';
import BookingStep3 from './_components/booking/Step3';
import BookingStep4 from './_components/booking/Step4';
import Dashboard from './_components/admin/Dashboard';
import ClientManagement from './_components/admin/ClientManagement';
import ServiceManagement from './_components/admin/ServiceManagement';
import { Button } from "@/components/ui/button";
import { Toaster } from "@/components/ui/sonner";
import { LayoutDashboard, Calendar, Users, Settings, LogOut, Scissors } from "lucide-react";

export default function App() {
  const [view, setView] = useState('booking'); // 'booking' or 'admin'
  const [bookingStep, setBookingStep] = useState(1);
  const [adminView, setAdminView] = useState('dashboard'); // 'dashboard', 'clients', 'services'
  const [showAdminSwitcher, setShowAdminSwitcher] = useState(false);
  
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
    // 1. Reset states
    setView('booking');
    setBookingStep(1);
    setShowAdminSwitcher(false);
    setBookingData({
      service: null,
      barber: null,
      date: null,
      time: null,
      customer: { name: '', phone: '', email: '' }
    });

    // 2. Clear URL params and Refresh for security (Anti-Cache)
    const url = new URL(window.location.href);
    url.searchParams.delete('admin');
    window.location.href = url.origin + url.pathname;
  };

  const handleAdminSwitch = () => {
    const pass = prompt("Digite a senha do administrador:");
    if (pass === "admin123") { // Example password, you can change this
      setView('admin');
    } else {
      alert("Acesso negado.");
    }
  };

  const content = () => {
    if (view === 'booking') {
      switch (bookingStep) {
        case 1: return <BookingStep1 data={bookingData} updateData={setBookingData} onNext={nextStep} />;
        case 2: return <BookingStep2 data={bookingData} updateData={setBookingData} onNext={nextStep} onBack={prevStep} />;
        case 3: return <BookingStep3 data={bookingData} updateData={setBookingData} onNext={nextStep} onBack={prevStep} />;
        case 4: return <BookingStep4 data={bookingData} updateData={setBookingData} onBack={prevStep} onComplete={() => setBookingStep(1)} />;
        default: return <BookingStep1 data={bookingData} updateData={setBookingData} onNext={nextStep} />;
      }
    } else {
      switch (adminView) {
        case 'dashboard': return <Dashboard />;
        case 'clients': return <ClientManagement />;
        case 'services': return <ServiceManagement />;
        default: return <Dashboard />;
      }
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground transition-colors duration-300">
      {/* Navigation Switcher (Hidden from Customers) */}
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
              {content()}
            </div>
          </div>
        )}

        {view === 'booking' && (
          <div className="max-w-md mx-auto py-8">
             <div className="text-center mb-8 relative">
                {bookingStep > 1 && (
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="absolute left-0 top-0 gap-1.5 h-8 px-2 text-xs text-muted-foreground"
                    onClick={prevStep}
                  >
                    <LogOut className="w-3.5 h-3.5 rotate-180" />
                    Voltar
                  </Button>
                )}
                
                {bookingStep > 1 && (
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="absolute right-0 top-0 gap-1.5 h-8 px-2 text-xs text-muted-foreground hover:text-destructive"
                    onClick={() => setBookingStep(1)}
                  >
                    Sair/Reiniciar
                    <LogOut className="w-3.5 h-3.5" />
                  </Button>
                )}

               <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4 animate-in fade-in zoom-in duration-500">
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
             {content()}
          </div>
        )}
      </main>
      <Toaster position="top-center" theme="dark" closeButton />
    </div>
  );
}
