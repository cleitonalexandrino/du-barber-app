"use client";

import React, { useEffect, useState } from 'react';
import { Scissors, Baby, Ruler, UserCheck, Sparkles, Loader2, Clock } from "lucide-react";
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
      <div className="flex flex-col items-center justify-center p-20 space-y-5">
        <Loader2 className="w-8 h-8 animate-spin text-accent" />
        <p className="font-serif text-muted-foreground text-base italic">Afiando a tesoura...</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Section header */}
      <div className="mb-5">
        <h2 className="font-serif text-2xl font-bold text-primary tracking-tight">
          O que deseja hoje?
        </h2>
        <p className="text-muted-foreground text-[13px] font-medium mt-1">
          Selecione uma de nossas especialidades.
        </p>
      </div>

      {/* Service cards */}
      <div className="space-y-2">
        {services.map((service, index) => {
          const Icon = iconMap[service.icon] || Scissors;
          const isSelected = data.service?.id === service.id;

          return (
            <div
              key={service.id}
              className={`animate-card-enter stagger-${Math.min(index + 1, 5)}`}
            >
              <button
                type="button"
                onClick={() => selectService(service)}
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
                {/* Accent bar left */}
                {isSelected && (
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-accent animate-accent-bar" />
                )}

                <div className="flex items-center gap-4 p-4 pl-5">
                  {/* Icon block */}
                  <div className={`
                    w-11 h-11 flex items-center justify-center flex-shrink-0 transition-all duration-250
                    ${isSelected
                      ? 'bg-accent text-primary'
                      : 'bg-secondary text-primary group-hover:bg-primary group-hover:text-white'
                    }
                  `}>
                    <Icon className="w-5 h-5" />
                  </div>

                  {/* Service info */}
                  <div className="flex-1 min-w-0">
                    <h3 className={`font-serif font-bold text-lg leading-tight ${isSelected ? 'text-primary-foreground' : 'text-primary'}`}>
                      {service.name}
                    </h3>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <Clock className={`w-3 h-3 ${isSelected ? 'text-accent' : 'text-accent'}`} />
                      <span className={`text-[10px] font-bold uppercase tracking-widest ${isSelected ? 'text-primary-foreground/60' : 'text-muted-foreground'}`}>
                        {service.duration} min
                      </span>
                    </div>
                  </div>

                  {/* Price */}
                  <div className="text-right flex-shrink-0">
                    <div className={`font-serif font-bold text-2xl leading-none tabular-nums ${isSelected ? 'text-accent' : 'text-primary'}`}>
                      {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(service.price)}
                    </div>
                  </div>
                </div>
              </button>
            </div>
          );
        })}
      </div>

      {/* Footer tagline */}
      <div className="pt-3 flex justify-center">
        <div className="flex items-center gap-2 py-2 px-4 border border-border bg-secondary/60">
          <UserCheck className="w-3 h-3 text-accent" />
          <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-muted-foreground">
            Tradição em cada detalhe
          </p>
        </div>
      </div>
    </div>
  );
}
