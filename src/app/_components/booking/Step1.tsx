"use client";

import React, { useEffect, useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Scissors, Baby, Ruler, UserCheck, Sparkles, Loader2 } from "lucide-react";
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
      setLoading(loading => false);
    }
    fetchServices();
  }, []);

  const selectService = (service: any) => {
    updateData({ ...data, service });
    onNext();
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-12 space-y-4">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <p className="text-muted-foreground animate-pulse">Carregando serviços...</p>
      </div>
    );
  }

  return (
    <div className="space-y-4 animate-in slide-in-from-right duration-500">
      <h2 className="text-lg font-semibold mb-4 text-center">Selecione o Serviço</h2>
      <div className="grid grid-cols-1 gap-3">
        {services.map((service) => {
          const Icon = iconMap[service.icon] || Scissors;
          return (
            <Card 
              key={service.id}
              className={`cursor-pointer hover:border-primary transition-all duration-200 group ${data.service?.id === service.id ? 'border-primary ring-1 ring-primary/20' : ''}`}
              onClick={() => selectService(service)}
            >
              <CardContent className="p-4 flex items-center gap-4">
                <div className="w-12 h-12 rounded-lg bg-muted flex items-center justify-center group-hover:bg-primary/10 transition-colors">
                  <Icon className="w-6 h-6 text-muted-foreground group-hover:text-primary transition-colors" />
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-foreground">{service.name}</h3>
                  <p className="text-xs text-muted-foreground line-clamp-1">{service.description}</p>
                  <div className="flex items-center gap-2 mt-1">
                     <span className="text-xs font-medium text-secondary">{service.duration} min</span>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-primary">
                    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(service.price)}
                  </p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
