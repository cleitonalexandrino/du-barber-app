"use client";

import React, { useEffect, useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Scissors, Baby, Ruler, UserCheck, Sparkles, Loader2, Clock, ChevronRight } from "lucide-react";
import { supabase } from "@/lib/supabase";

const iconMap: Record<string, any> = {
  Scissors,
  Baby,
  Ruler,
  UserCheck,
  Sparkles
};

export default function BookingStep1({ data, updateData, onNext }: any) {
  const [services, setServices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchServices() {
      const { data, error } = await supabase
        .from('services')
        .select('*')
        .order('name');
      
      if (error) {
        console.error('Error fetching services:', error);
      } else {
        setServices(data || []);
      }
      setLoading(false);
    }
    fetchServices();
  }, []);

  const selectService = (service: any) => {
    updateData({ ...data, service });
    onNext();
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-20 space-y-6">
        <Loader2 className="w-12 h-12 animate-spin text-primary opacity-20" />
        <p className="font-serif text-muted-foreground text-lg">Afiando a tesoura...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-1000 ease-out fill-mode-both">
      <div className="text-center space-y-2 mb-10">
        <h2 className="text-3xl font-serif font-bold tracking-tight text-primary">O que deseja hoje?</h2>
        <p className="text-muted-foreground text-sm font-medium">Selecione uma de nossas especialidades.</p>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {services.map((service) => {
          const Icon = iconMap[service.icon] || Scissors;
          const isSelected = data.service?.id === service.id;

          return (
            <div 
              key={service.id}
              className={`relative cursor-pointer group transition-all duration-500 rounded-[2.5rem] overflow-hidden border ${isSelected ? 'border-accent shadow-2xl shadow-accent/10 translate-y-[-4px]' : 'border-border hover:border-primary/50 hover:shadow-xl hover:translate-y-[-2px] bg-white'}`}
              onClick={() => selectService(service)}
            >
              {isSelected && (
                <div className="absolute top-4 right-4 z-10">
                   <div className="bg-accent text-white p-1 rounded-full shadow-lg">
                      <Sparkles className="w-4 h-4" />
                   </div>
                </div>
              )}
              
              <div className="p-8 flex items-center gap-6">
                <div className={`w-16 h-16 rounded-3xl flex items-center justify-center transition-all duration-500 shadow-inner ${isSelected ? 'bg-accent text-white rotate-0' : 'bg-slate-50 text-primary group-hover:bg-primary group-hover:text-white rotate-12 group-hover:rotate-0'}`}>
                  <Icon className="w-8 h-8" />
                </div>
                
                <div className="flex-1 min-w-0">
                  <h3 className={`font-serif font-bold text-xl transition-colors ${isSelected ? 'text-accent' : 'text-primary group-hover:text-accent'}`}>{service.name}</h3>
                  <div className="flex items-center gap-3 mt-1.5">
                    <div className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                       <Clock className="w-3.5 h-3.5 text-accent" />
                       {service.duration} MIN
                    </div>
                  </div>
                </div>

                <div className="text-right flex flex-col items-end gap-1">
                  <div className={`font-bold text-2xl tracking-tighter tabular-nums ${isSelected ? 'text-accent' : 'text-primary'}`}>
                    <span className="text-xs mr-1">R$</span>
                    {new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 2 }).format(service.price)}
                  </div>
                  <ChevronRight className={`w-4 h-4 transition-all duration-500 ${isSelected ? 'text-accent translate-x-0' : 'text-muted-foreground group-hover:text-primary group-hover:translate-x-1 opacity-0 group-hover:opacity-100'}`} />
                </div>
              </div>

              {isSelected && (
                <div className="absolute inset-x-0 bottom-0 h-1 bg-accent animate-in fade-in slide-in-from-left duration-700" />
              )}
            </div>
          );
        })}
      </div>

      <div className="pt-10 flex justify-center">
         <div className="flex items-center gap-3 py-4 px-6 bg-slate-50 border border-border rounded-full">
            <UserCheck className="w-4 h-4 text-primary opacity-40" />
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">Tradição em cada detalhe</p>
         </div>
      </div>
    </div>
  );
}
