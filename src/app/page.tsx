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

  const nextStep = () => setBookingStep(prev => Math.min(prev + 1, 4));
  const prevStep = () => setBookingStep(prev => Math.max(prev - 1, 1));

  const content = () => {
    if (view === 'booking') {
      switch (bookingStep) {
        case 1: return <BookingStep1 data={bookingData} updateData={setBookingData} onNext={nextStep} />;
        case 2: return <BookingStep2 data={bookingData} updateData={setBookingData} onNext={nextStep} onBack={prevStep} />;
        case 3: return <BookingStep3 data={bookingData} updateData={setBookingData} onNext={nextStep} onBack={prevStep} />;
        case 4: return <BookingStep4 data={bookingData} updateData={setBookingData} onBack={prevStep} onComplete={() => { alert('Agendamento Realizado!'); setBookingStep(1); }} />;
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
      {/* Navigation Switcher (Internal Demo Only) */}
      <div className="fixed bottom-4 right-4 z-50 flex gap-2 opacity-50 hover:opacity-100 transition-opacity">
        <Button 
          variant={view === 'booking' ? 'default' : 'secondary'} 
          size="sm"
          onClick={() => setView('booking')}
        >
          Customer
        </Button>
        <Button 
          variant={view === 'admin' ? 'default' : 'secondary'} 
          size="sm"
          onClick={() => setView('admin')}
        >
          Admin
        </Button>
      </div>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {view === 'admin' && (
          <div className="grid grid-cols-1 md:grid-cols-[240px_1fr] gap-8">
            <aside className="space-y-2">
              <div className="mb-8 flex items-center gap-2 px-2">
                <Scissors className="w-6 h-6 text-primary" />
                <h1 className="text-xl font-bold tracking-tight">DU BARBER</h1>
              </div>
              <Button 
                variant={adminView === 'dashboard' ? 'default' : 'ghost'} 
                className="w-full justify-start gap-2"
                onClick={() => setAdminView('dashboard')}
              >
                <LayoutDashboard className="w-4 h-4" />
                Dashboard
              </Button>
              <Button 
                variant={adminView === 'clients' ? 'default' : 'ghost'} 
                className="w-full justify-start gap-2"
                onClick={() => setAdminView('clients')}
              >
                <Users className="w-4 h-4" />
                Clientes
              </Button>
              <Button 
                variant={adminView === 'services' ? 'default' : 'ghost'} 
                className="w-full justify-start gap-2"
                onClick={() => setAdminView('services')}
              >
                <Settings className="w-4 h-4" />
                Serviços
              </Button>
              <div className="pt-8 mt-8 border-t border-border">
                <Button variant="ghost" className="w-full justify-start gap-2 text-muted-foreground">
                  <LogOut className="w-4 h-4" />
                  Sair
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
             <div className="text-center mb-8">
               <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4 animate-in fade-in zoom-in duration-500">
                 <Scissors className="w-8 h-8 text-primary" />
               </div>
               <h1 className="text-2xl font-bold tracking-tight">Du Barber House</h1>
               <p className="text-muted-foreground text-sm">Rua Hamílton Prado, 13</p>
               
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
