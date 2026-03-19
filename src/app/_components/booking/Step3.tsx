"use client";

import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { ChevronLeft, Clock, Calendar as CalendarIcon, Sparkles } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

const times = [
  '09:00', '10:00', '11:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00'
];

export default function BookingStep3({ data, updateData, onNext, onBack }: any) {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [selectedTime, setSelectedTime] = useState<string | null>(null);

  const handleNext = () => {
    if (date && selectedTime) {
      updateData({ ...data, date, time: selectedTime });
      onNext();
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-1000 ease-out fill-mode-both">
      <div className="text-center space-y-2 mb-10">
        <h2 className="text-3xl font-serif font-bold tracking-tight text-primary">Data & Horário</h2>
        <p className="text-muted-foreground text-sm font-medium">Reserve o seu momento de tradição.</p>
      </div>

      <div className="bg-white border border-border rounded-[2.5rem] p-6 shadow-sm shadow-primary/5 animate-in fade-in duration-700 relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16 group-hover:bg-accent/5 transition-colors duration-1000" />
        <Calendar
          mode="single"
          selected={date}
          onSelect={setDate}
          className="rounded-md border-0 p-0"
          classNames={{
             caption_label: "font-serif font-bold text-xl text-primary",
             day_selected: "bg-accent text-white hover:bg-accent hover:text-white rounded-xl shadow-lg shadow-accent/20 border-none",
             day_today: "bg-slate-50 text-accent font-bold rounded-xl",
             head_cell: "text-muted-foreground font-bold uppercase tracking-widest text-[9px]",
             nav_button: "border border-border rounded-xl hover:bg-slate-50 transition-colors",
             day_outside: "text-muted-foreground/30 opacity-50",
          }}
          locale={ptBR}
          disabled={(date) => date < new Date() || date.getDay() === 0}
        />
      </div>

      {date && (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="flex items-center justify-between">
             <h3 className="text-[10px] font-bold uppercase tracking-[0.3em] text-primary/60 flex items-center gap-3">
               <Clock className="w-4 h-4 text-accent" />
               Horários Disponíveis
             </h3>
             <span className="text-[9px] font-bold text-white bg-primary px-3 py-1 rounded-full uppercase tracking-tighter shadow-sm">60 MINUTOS</span>
          </div>
          
          <div className="grid grid-cols-4 sm:grid-cols-5 gap-3">
            {times.map((time) => {
              const isSelected = selectedTime === time;
              return (
                <button 
                  key={time}
                  onClick={() => setSelectedTime(time)}
                  className={`h-12 flex items-center justify-center rounded-2xl font-bold text-sm tabular-nums tracking-tighter transition-all duration-300 border ${isSelected ? 'bg-accent text-white border-accent shadow-xl shadow-accent/10 scale-105' : 'bg-white text-primary border-border hover:border-primary hover:bg-slate-50'}`}
                >
                  {time}
                </button>
              );
            })}
          </div>
        </div>
      )}

      <div className="pt-6 space-y-4">
        <Button 
          className="w-full h-16 text-xl font-bold uppercase tracking-widest bg-primary hover:bg-primary/95 text-white rounded-2xl shadow-xl shadow-primary/20 disabled:grayscale transition-all active:scale-95 border-none" 
          disabled={!date || !selectedTime}
          onClick={handleNext}
        >
          {selectedTime ? (
             <span className="flex items-center gap-2">
                Confirmar às {selectedTime}
                <Sparkles className="w-5 h-5 text-accent" />
             </span>
          ) : 'Selecione um Horário'}
        </Button>
        
        <div className="flex justify-center">
           <div className="flex items-center gap-3 py-4 px-6 bg-slate-50 border border-border rounded-full group hover:bg-white transition-colors cursor-pointer" onClick={onBack}>
              <ChevronLeft className="w-4 h-4 text-primary group-hover:animate-bounce-x" />
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">Voltar para o Barbeiro</p>
           </div>
        </div>
      </div>
    </div>
  );
}
