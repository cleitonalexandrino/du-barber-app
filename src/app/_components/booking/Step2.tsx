"use client";

import React, { useEffect, useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ChevronLeft, Star, Clock, Loader2, Sparkles, UserCheck } from "lucide-react";
import { supabase } from "@/lib/supabase";

export default function BookingStep2({ data, updateData, onNext, onBack }: any) {
  const [barbers, setBarbers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchBarbers() {
      const { data, error } = await supabase
        .from('barbers')
        .select('*')
        .order('name');
      
      if (error) {
        console.error('Error fetching barbers:', error);
      } else {
        const list = data || [];
        setBarbers([
           ...list, 
           { id: 'any', name: 'Qualquer Profissional', specialty: 'Próximo horário livre', rating: 5.0, avatar_url: null }
        ]);
      }
      setLoading(false);
    }
    fetchBarbers();
  }, []);

  const selectBarber = (barber: any) => {
    updateData({ ...data, barber });
    onNext();
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-20 space-y-6">
        <Loader2 className="w-12 h-12 animate-spin text-primary opacity-20" />
        <p className="font-serif text-muted-foreground text-lg">Preparando a bancada...</p>
      </div>
    );
  }

  return (
    <div className="space-y-4 animate-in fade-in slide-in-from-bottom-8 duration-1000 ease-out fill-mode-both">
      <div className="text-center space-y-1 mb-4 relative">
        <h2 className="text-xl font-serif font-bold tracking-tight text-primary">Escolha o Artesão</h2>
        <p className="text-muted-foreground text-[12px] font-medium leading-tight">Quem cuidará do seu visual hoje?</p>
      </div>
      
      <div className="grid grid-cols-1 gap-4">
        {barbers.map((barber) => {
          const isSelected = data.barber?.id === barber.id;
          const isAny = barber.id === 'any';

          return (
            <div 
              key={barber.id}
              className={`relative cursor-pointer group transition-all duration-500 rounded-2xl overflow-hidden border ${isSelected ? 'border-accent shadow-xl shadow-accent/10 translate-y-[-2px]' : 'border-border hover:border-primary/50 hover:shadow-lg hover:translate-y-[-1px] bg-white'}`}
              onClick={() => selectBarber(barber)}
            >
              {isSelected && (
                <div className="absolute top-3 right-3 z-10">
                   <div className="bg-accent text-white p-0.5 rounded-full shadow-lg">
                      <Sparkles className="w-3 h-3" />
                   </div>
                </div>
              )}

              <CardContent className="p-4 flex items-center gap-4">
                <div className="relative">
                   <div className={`absolute -inset-1 rounded-full blur-sm transition-colors duration-500 ${isSelected ? 'bg-accent/40' : 'bg-primary/5 group-hover:bg-primary/20'}`} />
                   <Avatar className={`relative w-14 h-14 border-2 transition-all duration-500 ${isSelected ? 'border-accent scale-105' : 'border-white shadow-lg group-hover:scale-105'}`}>
                      <AvatarImage src={barber.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${barber.name}`} className="object-cover" />
                      <AvatarFallback className="bg-slate-50 text-primary font-serif font-bold">
                        {barber.name.substring(0, 1)}
                      </AvatarFallback>
                   </Avatar>
                </div>

                <div className="flex-1 min-w-0">
                  <h3 className={`font-serif font-bold text-lg transition-colors leading-tight ${isSelected ? 'text-accent' : 'text-primary group-hover:text-accent'}`}>
                    {barber.name}
                  </h3>
                  <p className="text-[9px] text-muted-foreground font-bold uppercase tracking-widest mt-0.5">{barber.specialty || barber.role}</p>
                  
                  {barber.rating && (
                    <div className="flex items-center gap-1.5 mt-1.5 bg-slate-50 px-2.5 py-0.5 rounded-full border border-border/50 w-fit group-hover:bg-white transition-colors">
                      <Star className="w-3 h-3 fill-accent text-accent" />
                      <span className="text-[11px] font-bold text-primary tabular-nums">{barber.rating.toFixed(1)}</span>
                    </div>
                  )}
                </div>

                <div className={`transition-all duration-500 ${isSelected ? 'text-accent scale-110' : 'text-muted-foreground group-hover:text-primary group-hover:scale-110'}`}>
                   {isAny ? <UserCheck className="w-8 h-8 opacity-20" /> : <Clock className="w-8 h-8 opacity-20" />}
                </div>
              </CardContent>

              {isSelected && (
                <div className="absolute inset-x-0 bottom-0 h-1 bg-accent animate-in fade-in slide-in-from-left duration-700" />
              )}
            </div>
          );
        })}
      </div>

      <div className="pt-10 flex justify-center">
         <div className="flex items-center gap-3 py-4 px-6 bg-slate-50 border border-border rounded-full group hover:bg-white transition-colors cursor-pointer" onClick={onBack}>
            <ChevronLeft className="w-4 h-4 text-primary group-hover:animate-bounce-x" />
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">Voltar para serviços</p>
         </div>
      </div>
    </div>
  );
}
