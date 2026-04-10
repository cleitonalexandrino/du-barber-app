"use client";

import React, { useEffect, useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ChevronLeft, Star, Loader2, Sparkles, UserCheck, Scissors } from "lucide-react";
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
      <div className="flex flex-col items-center justify-center p-20 space-y-5">
        <Loader2 className="w-8 h-8 animate-spin text-accent" />
        <p className="font-serif text-muted-foreground text-base italic">Preparando a bancada...</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Section header */}
      <div className="mb-5">
        <h2 className="font-serif text-2xl font-bold text-primary tracking-tight">
          Escolha o Artesão
        </h2>
        <p className="text-muted-foreground text-[13px] font-medium mt-1">
          Quem cuidará do seu visual hoje?
        </p>
      </div>

      {/* Barber cards */}
      <div className="space-y-2">
        {barbers.map((barber, index) => {
          const isSelected = data.barber?.id === barber.id;
          const isAny = barber.id === 'any';

          return (
            <div key={barber.id} className={`animate-card-enter stagger-${Math.min(index + 1, 5)}`}>
              <button
                type="button"
                onClick={() => selectBarber(barber)}
                className={`
                  w-full text-left relative overflow-hidden
                  border transition-all duration-250
                  active:scale-[0.99] cursor-pointer
                  ${isSelected
                    ? 'bg-primary text-primary-foreground border-primary shadow-xl translate-y-[-2px]'
                    : 'bg-card border-border hover:border-primary/40 hover:shadow-md hover:translate-y-[-1px]'
                  }
                `}
              >
                {/* Accent bar */}
                {isSelected && (
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-accent animate-accent-bar" />
                )}

                <div className="flex items-center gap-4 p-4 pl-5">
                  {/* Avatar */}
                  <div className="relative flex-shrink-0">
                    <Avatar className={`w-14 h-14 transition-all duration-250 ${isSelected ? 'ring-2 ring-accent ring-offset-2 ring-offset-primary' : 'ring-1 ring-border'}`}>
                      <AvatarImage
                        src={barber.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${barber.name}`}
                        className="object-cover"
                      />
                      <AvatarFallback className={`font-serif font-bold text-xl ${isSelected ? 'bg-accent text-primary' : 'bg-secondary text-primary'}`}>
                        {barber.name.substring(0, 1)}
                      </AvatarFallback>
                    </Avatar>
                    {isSelected && (
                      <div className="absolute -top-1 -right-1 animate-badge-pop">
                        <div className="bg-accent w-5 h-5 rounded-full flex items-center justify-center">
                          <Sparkles className="w-2.5 h-2.5 text-primary" />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <h3 className={`font-serif font-bold text-lg leading-tight ${isSelected ? 'text-primary-foreground' : 'text-primary'}`}>
                      {barber.name}
                    </h3>
                    <p className={`text-[10px] font-bold uppercase tracking-wider mt-0.5 ${isSelected ? 'text-primary-foreground/50' : 'text-muted-foreground'}`}>
                      {barber.specialty || barber.role}
                    </p>

                    {barber.rating && (
                      <div className={`flex items-center gap-1 mt-1.5 w-fit px-2 py-0.5 ${isSelected ? 'bg-white/10' : 'bg-secondary'}`}>
                        <Star className="w-3 h-3 fill-accent text-accent" />
                        <span className={`text-[11px] font-bold tabular-nums ${isSelected ? 'text-primary-foreground' : 'text-primary'}`}>
                          {barber.rating.toFixed(1)}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Right icon */}
                  <div className={`flex-shrink-0 ${isSelected ? 'text-accent' : 'text-muted-foreground/30'}`}>
                    {isAny ? <UserCheck className="w-7 h-7" /> : <Scissors className="w-5 h-5" />}
                  </div>
                </div>
              </button>
            </div>
          );
        })}
      </div>

      {/* Back nav */}
      <div className="pt-4 flex justify-center">
        <button
          type="button"
          onClick={onBack}
          className="flex items-center gap-2 py-2.5 px-5 border border-border bg-secondary/60 hover:bg-secondary transition-colors duration-200 cursor-pointer"
        >
          <ChevronLeft className="w-3.5 h-3.5 text-primary" />
          <span className="text-[9px] font-bold uppercase tracking-[0.18em] text-muted-foreground">
            Voltar para serviços
          </span>
        </button>
      </div>
    </div>
  );
}
