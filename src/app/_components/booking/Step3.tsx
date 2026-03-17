"use client";

import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { ChevronLeft, Clock } from "lucide-react";
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
    <div className="space-y-4 animate-in slide-in-from-right duration-500">
      <div className="flex items-center mb-4">
        <Button variant="ghost" size="icon" onClick={onBack} className="mr-2">
          <ChevronLeft className="w-5 h-5" />
        </Button>
        <h2 className="text-lg font-semibold text-center flex-1 pr-8">Data & Horário</h2>
      </div>

      <div className="bg-card border border-border rounded-xl p-2 mb-4 animate-in fade-in duration-700">
        <Calendar
          mode="single"
          selected={date}
          onSelect={setDate}
          className="rounded-md border-0"
          locale={ptBR}
          disabled={(date) => date < new Date() || date.getDay() === 0}
        />
      </div>

      {date && (
        <div className="space-y-3 animate-in fade-in slide-in-from-bottom duration-300">
          <h3 className="text-sm font-medium flex items-center gap-2">
            <Clock className="w-4 h-4 text-primary" />
            Horários de 60 min disponíveis
          </h3>
          <div className="grid grid-cols-3 gap-2">
            {times.map((time) => (
              <Button 
                key={time}
                variant={selectedTime === time ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedTime(time)}
                className="h-10 hover:border-primary transition-all duration-200"
              >
                {time}
              </Button>
            ))}
          </div>
        </div>
      )}

      <div className="pt-4">
        <Button 
          className="w-full h-12 text-lg font-bold" 
          disabled={!date || !selectedTime}
          onClick={handleNext}
        >
          Próximo Passo
        </Button>
      </div>
    </div>
  );
}
