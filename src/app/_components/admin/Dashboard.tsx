"use client";

import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign, TrendingUp, Users, Calendar, Scissors, User, Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { format, startOfMonth, endOfMonth, startOfDay, endOfDay } from "date-fns";
import { ptBR } from "date-fns/locale";

export default function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<any[]>([]);
  const [agenda, setAgenda] = useState<any[]>([]);

  useEffect(() => {
    async function fetchDashboardData() {
      setLoading(true);
      const today = new Date();
      const dateStr = format(today, 'yyyy-MM-dd');

      // Fetch Today's Appointments
      const { data: todayAppts, error: err1 } = await supabase
        .from('appointments')
        .select('*, services(*), clients(*), barbers(*)')
        .eq('appointment_date', dateStr)
        .order('appointment_time');

      // Fetch Month's Appointments
      const { data: monthAppts, error: err2 } = await supabase
        .from('appointments')
        .select('*, services(*)')
        .gte('appointment_date', format(startOfMonth(today), 'yyyy-MM-dd'));

      if (!err1 && !err2) {
        setAgenda(todayAppts || []);

        const dailyRevenue = todayAppts?.reduce((acc, curr) => acc + (curr.services?.price || 0), 0) || 0;
        const monthlyRevenue = monthAppts?.reduce((acc, curr) => acc + (curr.services?.price || 0), 0) || 0;
        const futureRevenue = monthAppts?.filter(a => new Date(a.appointment_date) > today).reduce((acc, curr) => acc + (curr.services?.price || 0), 0) || 0;

        setStats([
          { title: 'Faturamento do Dia', value: dailyRevenue, icon: DollarSign, trend: '+0%', color: 'text-primary' },
          { title: 'Faturamento do Mês', value: monthlyRevenue, icon: TrendingUp, trend: '+0%', color: 'text-secondary' },
          { title: 'Cortes Hoje', value: todayAppts?.length || 0, icon: Scissors, trend: 'Normal', color: 'text-primary' },
          { title: 'A Receber (Futuros)', value: futureRevenue, icon: Calendar, trend: 'Pendentes', color: 'text-muted-foreground' },
        ]);
      }
      setLoading(false);
    }
    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-20 space-y-4 h-[600px]">
        <Loader2 className="w-12 h-12 animate-spin text-primary" />
        <p className="text-muted-foreground animate-pulse font-bold tracking-widest uppercase text-xs">Atualizando Dashboard...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex justify-between items-center bg-card/50 border border-border p-4 rounded-xl">
        <h2 className="text-xl font-bold">Resumo Geral</h2>
        <div className="text-xs text-muted-foreground bg-muted px-3 py-1 rounded-full border border-border uppercase tracking-widest font-bold">
           Hoje, {format(new Date(), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) => (
          <Card key={i} className="bg-card border-border hover:border-primary/50 transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div className={`p-2 rounded-lg bg-muted border border-border ${stat.color}`}>
                  <stat.icon className="w-5 h-5" />
                </div>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border border-border ${stat.trend.includes('+') ? 'bg-green-500/10 text-green-500' : 'bg-muted text-muted-foreground'}`}>
                   {stat.trend}
                </span>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">{stat.title}</p>
                <h3 className="text-2xl font-bold tracking-tight">
                  {typeof stat.value === 'number' ? 
                    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(stat.value) : 
                    stat.value}
                </h3>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-6">
        {/* Agenda do Dia */}
        <Card className="bg-card border-border shadow-md">
           <CardHeader className="border-b border-border py-4">
             <CardTitle className="text-lg flex items-center gap-2">
                <Calendar className="w-5 h-5 text-primary" />
                Agenda do Dia (Timeline)
             </CardTitle>
           </CardHeader>
           <CardContent className="p-0 max-h-[500px] overflow-y-auto">
             <div className="divide-y divide-border">
               {agenda.length > 0 ? agenda.map((item, i) => (
                 <div key={i} className="flex items-center p-4 hover:bg-muted/30 transition-colors group">
                   <div className="w-16 font-bold text-primary tabular-nums">{item.appointment_time.substring(0, 5)}</div>
                   <div className="flex-1 min-w-0 px-4 border-l border-border">
                     <p className="font-bold text-foreground group-hover:text-primary transition-colors">{item.clients?.name}</p>
                     <p className="text-xs text-muted-foreground truncate">{item.services?.name} — {item.barbers?.name || 'Qualquer'}</p>
                   </div>
                   <div>
                     <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border border-border capitalize ${item.status === 'confirmed' ? 'bg-primary/10 text-primary' : item.status === 'finished' ? 'bg-green-500/10 text-green-500' : 'bg-muted text-muted-foreground'}`}>
                        {item.status}
                     </span>
                   </div>
                 </div>
               )) : (
                 <div className="p-10 text-center text-muted-foreground italic">Nenhum agendamento para hoje.</div>
               )}
             </div>
           </CardContent>
        </Card>

        {/* Gráfico Mockup (Simples) */}
        <Card className="bg-card border-border flex flex-col items-center justify-center p-6 text-center space-y-4">
           <div className="w-24 h-24 rounded-full border-8 border-primary border-t-secondary animate-pulse" />
           <p className="text-sm font-bold">Desempenho Semanal</p>
           <p className="text-xs text-muted-foreground">O rendimento aumentou em relação à semana passada.</p>
           <div className="w-full bg-muted h-2 rounded-full overflow-hidden mt-4">
             <div className="bg-primary h-full w-[70%]" />
           </div>
        </Card>
      </div>
    </div>
  );
}
