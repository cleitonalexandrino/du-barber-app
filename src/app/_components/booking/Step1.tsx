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
    <div className="space-y-4 animate-in fade-in slide-in-from-bottom-8 duration-1000 ease-out fill-mode-both">
      <div className="text-center space-y-1 mb-4">
        <h2 className="text-xl font-serif font-bold tracking-tight text-primary">O que deseja hoje?</h2>
        <p className="text-muted-foreground text-[12px] font-medium leading-tight">Selecione uma de nossas especialidades.</p>
      </div>

      <div className="grid grid-cols-1 gap-3">
        {services.map((service) => {
          const Icon = iconMap[service.icon] || Scissors;
          const isSelected = data.service?.id === service.id;

          return (
            <div 
              key={service.id}
              className={`relative cursor-pointer group transition-all duration-500 rounded-2xl overflow-hidden border ${isSelected ? 'border-accent shadow-xl shadow-accent/10 translate-y-[-2px]' : 'border-border hover:border-primary/50 hover:shadow-lg hover:translate-y-[-1px] bg-white'}`}
              onClick={() => selectService(service)}
            >
              {isSelected && (
                <div className="absolute top-3 right-3 z-10">
                   <div className="bg-accent text-white p-0.5 rounded-full shadow-lg">
                      <Sparkles className="w-3 h-3" />
                   </div>
                </div>
              )}
              
              <div className="p-4 flex items-center gap-4">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-500 shadow-inner ${isSelected ? 'bg-accent text-white rotate-0' : 'bg-slate-50 text-primary group-hover:bg-primary group-hover:text-white rotate-12 group-hover:rotate-0'}`}>
                  <Icon className="w-6 h-6" />
                </div>
                
                <div className="flex-1 min-w-0">
                  <h3 className={`font-serif font-bold text-lg transition-colors leading-tight ${isSelected ? 'text-accent' : 'text-primary group-hover:text-accent'}`}>{service.name}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <div className="flex items-center gap-1 text-[9px] font-bold uppercase tracking-widest text-muted-foreground">
                       <Clock className="w-3 h-3 text-accent" />
                       {service.duration} MIN
                    </div>
                  </div>
                </div>

                <div className="text-right flex flex-col items-end gap-0.5">
                  <div className={`font-bold text-xl tracking-tighter tabular-nums ${isSelected ? 'text-accent' : 'text-primary'}`}>
                    <span className="text-[10px] mr-1">R$</span>
                    {new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 2 }).format(service.price)}
                  </div>
                  <ChevronRight className={`w-3.5 h-3.5 transition-all duration-500 ${isSelected ? 'text-accent translate-x-0' : 'text-muted-foreground group-hover:text-primary group-hover:translate-x-1 opacity-0 group-hover:opacity-100'}`} />
                </div>
              </div>

              {isSelected && (
                <div className="absolute inset-x-0 bottom-0 h-0.5 bg-accent animate-in fade-in slide-in-from-left duration-700" />
              )}
            </div>
          );
        })}
      </div>

      <div className="pt-4 flex justify-center">
         <div className="flex items-center gap-2 py-3 px-5 bg-slate-50 border border-border rounded-full">
            <UserCheck className="w-3.5 h-3.5 text-primary opacity-40" />
            <p className="text-[9px] font-bold uppercase tracking-[0.15em] text-muted-foreground">Tradição em cada detalhe</p>
         </div>
      </div>
    </div>
  );
}
