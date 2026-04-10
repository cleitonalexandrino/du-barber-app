"use client";

import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { ChevronLeft, Clock, Sparkles } from "lucide-react";
import { ptBR } from "date-fns/locale";

const times = [
  '09:00', '10:00', '11:00', '13:00', '14:00',
  '15:00', '16:00', '17:00', '18:00', '19:00'
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
    <div className="space-y-4 animate-slide-up">
      {/* Section header */}
      <div className="mb-5">
        <h2 className="font-serif text-2xl font-bold text-primary tracking-tight">
          Data & Horário
        </h2>
        <p className="text-muted-foreground text-[13px] font-medium mt-1">
          Reserve o seu momento de tradição.
        </p>
      </div>

      {/* Calendar */}
      <div className="bg-card border border-border p-4 shadow-sm">
        <Calendar
          mode="single"
          selected={date}
          onSelect={setDate}
          className="rounded-none border-0 p-0"
          classNames={{
            caption_label: "font-serif font-bold text-lg text-primary",
            day_selected: "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground font-bold relative before:absolute before:inset-0 before:border-2 before:border-accent",
            day_today: "bg-secondary text-primary font-bold",
            head_cell: "text-muted-foreground font-bold uppercase tracking-widest text-[9px]",
            nav_button: "border border-border hover:bg-secondary hover:border-primary/40 transition-all duration-200",
            day_outside: "text-muted-foreground/25",
            day: "rounded-none transition-colors duration-150 hover:bg-secondary",
          }}
          locale={ptBR}
          disabled={(date) => date < new Date() || date.getDay() === 0}
        />
      </div>

      {/* Time slots */}
      {date && (
        <div className="space-y-3 animate-slide-up">
          <div className="flex items-center justify-between mb-1">
            <h3 className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.25em] text-muted-foreground">
              <Clock className="w-3.5 h-3.5 text-accent" />
              Horários Disponíveis
            </h3>
            <span className="text-[9px] font-bold text-accent border border-accent/30 bg-accent/8 px-2.5 py-1 uppercase tracking-wider">
              60 min
            </span>
          </div>

          <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
            {times.map((time) => {
              const isSelected = selectedTime === time;
              return (
                <button
                  key={time}
                  type="button"
                  onClick={() => setSelectedTime(time)}
                  className={`
                    h-14 flex items-center justify-center
                    font-bold text-sm tabular-nums tracking-tight
                    border transition-all duration-200
                    active:scale-95 cursor-pointer
                    ${isSelected
                      ? 'bg-accent text-accent-foreground border-accent shadow-lg shadow-accent/20 scale-105'
                      : 'bg-card text-primary border-border hover:border-primary hover:bg-secondary'
                    }
                  `}
                >
                  {time}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="pt-2 space-y-3">
        <Button
          className="w-full h-14 text-[13px] font-bold uppercase tracking-widest rounded-none border-none shadow-lg transition-all duration-200 hover:translate-y-[-2px] hover:shadow-xl active:translate-y-0 disabled:opacity-40 disabled:translate-y-0 disabled:shadow-none"
          style={{
            background: selectedTime ? '#D4A017' : '#111111',
            color: selectedTime ? '#111111' : '#FFFFFF',
          }}
          disabled={!date || !selectedTime}
          onClick={handleNext}
        >
          {selectedTime ? (
            <span className="flex items-center gap-2">
              Confirmar às {selectedTime}
              <Sparkles className="w-4 h-4" />
            </span>
          ) : (
            'Selecione um Horário'
          )}
        </Button>

        <div className="flex justify-center">
          <button
            type="button"
            onClick={onBack}
            className="flex items-center gap-2 py-2.5 px-5 border border-border bg-secondary/60 hover:bg-secondary transition-colors duration-200 cursor-pointer"
          >
            <ChevronLeft className="w-3.5 h-3.5 text-primary" />
            <span className="text-[9px] font-bold uppercase tracking-[0.18em] text-muted-foreground">
              Voltar para o Barbeiro
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}
