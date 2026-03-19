"use client";

import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign, TrendingUp, Users, Calendar, Scissors, User, Loader2, Award } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { format, startOfMonth, endOfMonth } from "date-fns";
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

      const { data: todayAppts, error: err1 } = await supabase
        .from('appointments')
        .select('*, services(*), clients(*), barbers(*)')
        .eq('appointment_date', dateStr)
        .order('appointment_time');

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
          { title: 'Faturamento do Dia', value: dailyRevenue, icon: DollarSign, trend: '+12%', color: 'from-blue-600 to-blue-800' },
          { title: 'Faturamento do Mês', value: monthlyRevenue, icon: TrendingUp, trend: '+5%', color: 'from-blue-700 to-blue-900' },
          { title: 'Cortes Hoje', value: todayAppts?.length || 0, icon: Scissors, trend: 'Estável', color: 'from-blue-800 to-blue-950' },
          { title: 'Agendados', value: futureRevenue, icon: Calendar, trend: 'Próximos', color: 'from-accent to-accent/80' },
        ]);
      }
      setLoading(false);
    }
    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-20 space-y-6 h-[600px] animate-in fade-in duration-700">
        <div className="relative">
          <Loader2 className="w-16 h-16 animate-spin text-primary opacity-20" />
          <Scissors className="absolute inset-0 m-auto w-8 h-8 text-primary animate-pulse" />
        </div>
        <p className="text-muted-foreground animate-pulse font-serif text-lg">Preparando a bancada...</p>
      </div>
    );
  }

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-6 duration-1000 ease-out fill-mode-both">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-white p-8 rounded-[2rem] shadow-[0_10px_40px_-15px_rgba(0,0,0,0.05)] border border-border">
        <div className="space-y-1">
          <h2 className="text-3xl font-serif font-bold tracking-tight text-primary">Resumo Geral</h2>
          <p className="text-muted-foreground text-sm font-medium">Acompanhe o desempenho da sua tradição.</p>
        </div>
        <div className="text-[11px] text-primary font-bold bg-primary/5 px-5 py-2.5 rounded-full border border-primary/10 uppercase tracking-[0.2em] shadow-sm">
           {format(new Date(), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <Card key={i} className="group overflow-hidden bg-white border-none shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_20px_50px_rgba(0,51,102,0.1)] transition-all duration-500 rounded-3xl">
            <CardContent className="p-8 relative">
              <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 group-hover:scale-110 transition-all duration-700">
                <stat.icon className="w-20 h-20 text-primary" />
              </div>
              
              <div className="flex flex-col gap-6">
                <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${stat.color} p-3.5 shadow-lg shadow-blue-900/10 flex items-center justify-center`}>
                  <stat.icon className="w-full h-full text-white" />
                </div>
                
                <div className="space-y-1">
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{stat.title}</p>
                  <div className="flex items-baseline gap-2">
                    <h3 className="text-3xl font-serif font-bold tracking-tighter text-primary">
                      {typeof stat.value === 'number' && stat.title.includes('Faturamento') ? 
                        new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(stat.value) : 
                        stat.value}
                    </h3>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${stat.trend.includes('+') ? 'bg-green-500/10 text-green-600 border-green-500/20' : 'bg-muted text-muted-foreground border-border'}`}>
                       {stat.trend}
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_350px] gap-8">
        <Card className="bg-white border-none shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-[2.5rem] overflow-hidden">
           <CardHeader className="border-b border-border p-8 bg-slate-50/50">
             <div className="flex justify-between items-center">
               <CardTitle className="text-2xl font-serif font-bold flex items-center gap-3 text-primary">
                  <Calendar className="w-6 h-6 text-accent" />
                  Agenda do Dia
               </CardTitle>
               <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest bg-white px-3 py-1 rounded-full border border-border">Timeline</span>
             </div>
           </CardHeader>
           <CardContent className="p-0">
             <div className="divide-y divide-border">
               {agenda.length > 0 ? agenda.map((item, i) => (
                 <div key={i} className="flex items-center p-8 hover:bg-slate-50 transition-all group">
                   <div className="w-20 font-serif font-bold text-xl text-primary tabular-nums group-hover:scale-110 transition-transform origin-left">{item.appointment_time.substring(0, 5)}</div>
                   <div className="flex-1 min-w-0 px-8 border-l-2 border-primary/5 group-hover:border-accent transition-colors">
                     <p className="text-lg font-serif font-bold text-primary mb-0.5">{item.clients?.name}</p>
                     <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">{item.services?.name} <span className="mx-2 text-border">|</span> {item.barbers?.name || 'Qualquer'}</p>
                   </div>
                   <div>
                     <span className={`text-[10px] font-bold px-4 py-1.5 rounded-full border ${item.status === 'confirmed' ? 'bg-primary text-white border-primary' : item.status === 'finished' ? 'bg-green-500 text-white border-green-500' : 'bg-muted text-muted-foreground border-border'} shadow-sm uppercase tracking-tighter`}>
                        {item.status}
                     </span>
                   </div>
                 </div>
               )) : (
                 <div className="p-20 text-center flex flex-col items-center gap-4">
                   <Scissors className="w-12 h-12 text-muted/30" />
                   <div className="space-y-1">
                     <p className="font-serif font-bold text-xl text-muted-foreground">Cadeiras vazias por enquanto.</p>
                     <p className="text-sm text-muted/60">Nenhum agendamento encontrado para hoje.</p>
                   </div>
                 </div>
               )}
             </div>
           </CardContent>
        </Card>

        <div className="space-y-8">
          <Card className="bg-primary text-white border-none shadow-2xl rounded-[2.5rem] p-10 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-3xl -mr-16 -mt-16 group-hover:bg-accent/20 transition-colors duration-1000" />
            <div className="relative z-10 flex flex-col items-center text-center space-y-6">
              <div className="relative">
                <div className="absolute inset-0 bg-white/20 rounded-full blur-xl animate-pulse" />
                <div className="relative w-24 h-24 rounded-full border-4 border-white/20 p-2 flex items-center justify-center">
                  <Award className="w-12 h-12 text-accent" />
                </div>
              </div>
              <div className="space-y-2">
                <p className="text-3xl font-serif font-bold tracking-tight">Performance</p>
                <p className="text-sm text-white/60 font-medium">O seu rendimento superou a média semanal em 15%.</p>
              </div>
              <div className="w-full bg-white/10 h-3 rounded-full overflow-hidden mt-4 border border-white/5">
                <div className="bg-accent h-full w-[85%] shadow-[0_0_15px_rgba(222,0,0,0.5)] transition-all duration-1000" />
              </div>
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/40">Status: Excelente</p>
            </div>
          </Card>

          <Card className="bg-white border border-border shadow-sm rounded-[2.5rem] p-8">
             <div className="flex items-center gap-4 mb-6">
               <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center">
                 <User className="w-6 h-6 text-primary/40" />
               </div>
               <div className="space-y-0.5">
                 <p className="text-sm font-bold text-primary uppercase tracking-tighter">Próximo Cliente</p>
                 <p className="text-[10px] text-muted-foreground font-medium">Faltam 15 minutos</p>
               </div>
             </div>
             <div className="p-5 bg-slate-50 rounded-2xl border border-border/50">
               <p className="font-serif font-bold text-primary">"Corte Degradê + Barba"</p>
               <p className="text-xs text-muted-foreground mt-1">Marcos Oliveira</p>
             </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
