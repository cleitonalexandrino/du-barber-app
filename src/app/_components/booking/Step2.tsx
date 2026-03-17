"use client";

import React, { useEffect, useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ChevronLeft, Star, Clock, Loader2 } from "lucide-react";
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
        setBarbers([...list, { id: 'any', name: 'Qualquer profissional', role: 'Melhor horário disponível', rating: null, image_url: null }]);
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
      <div className="flex flex-col items-center justify-center p-12 space-y-4">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <p className="text-muted-foreground animate-pulse">Carregando barbeiros...</p>
      </div>
    );
  }

  return (
    <div className="space-y-4 animate-in slide-in-from-right duration-500">
      <div className="flex items-center mb-4">
        <Button variant="ghost" size="icon" onClick={onBack} className="mr-2">
          <ChevronLeft className="w-5 h-5" />
        </Button>
        <h2 className="text-lg font-semibold text-center flex-1 pr-8">Selecione o Barbeiro</h2>
      </div>
      
      <div className="grid grid-cols-1 gap-3">
        {barbers.map((barber) => (
          <Card 
            key={barber.id}
            className={`cursor-pointer hover:border-primary transition-all duration-200 group ${data.barber?.id === barber.id ? 'border-primary ring-1 ring-primary/20' : ''}`}
            onClick={() => selectBarber(barber)}
          >
            <CardContent className="p-4 flex items-center gap-4">
              <Avatar className="w-14 h-14 border border-border group-hover:border-primary/50 transition-colors">
                <AvatarImage src={barber.image_url || ''} />
                <AvatarFallback className="bg-muted text-primary font-bold">
                  {barber.name.substring(0, 1)}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <h3 className="font-bold text-foreground">{barber.name}</h3>
                <p className="text-xs text-muted-foreground">{barber.role}</p>
                {barber.rating && (
                  <div className="flex items-center gap-1 mt-1 text-primary">
                    <Star className="w-3 h-3 fill-primary" />
                    <span className="text-xs font-bold">{barber.rating}</span>
                  </div>
                )}
              </div>
              <div className="text-muted-foreground group-hover:text-primary transition-colors">
                 <Clock className="w-5 h-5" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
