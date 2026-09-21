import React, { useState } from 'react';
import { motion } from 'motion/react';
import { useAppContext } from '../context/AppContext';
import { getDaysInMonth, MONTH_NAMES } from '../lib/calendar';
import { Home, CalendarDays, DollarSign, StickyNote, Globe, MessageCircle, TrendingUp, Zap, Clock, X } from 'lucide-react';

export function AdminDashboard() {
  const { state, updateState } = useAppContext();
  const [activeTab, setActiveTab] = useState<'inicio' | 'agenda' | 'financeiro' | 'notas'>('inicio');

  const criticalItems = (state.inventory || []).filter((item: any) => item.quantity <= item.threshold);
  const isCritical = criticalItems.length > 0;

  return (
    <div className={`flex h-screen bg-[#050505] text-white overflow-hidden font-sans ${isCritical ? 'shadow-[inset_0_0_50px_rgba(239,68,68,0.2)] border border-red-500/20' : ''}`}>
      {/* Sidebar */}
      <aside className="fixed left-0 top-0 w-[260px] h-screen bg-[#050505] border-r border-[#111] flex-col justify-between hidden sm:flex z-50">
        <div>
          <div className="h-24 flex items-center justify-center lg:justify-start lg:px-6 border-b border-[#111] text-center lg:text-left flex-col lg:items-start lg:justify-center">
            <h1 className="text-2xl font-black tracking-tighter neon-text-lime italic hidden lg:block uppercase">ORTIZ<span className="text-white">TATTOO</span></h1>
            <Zap className="text-lime-400 w-8 h-8 lg:hidden mb-2" />
            <p className="text-[10px] uppercase tracking-[0.3em] opacity-50 mt-1 hidden lg:block">Cyber-Street Studio</p>
          </div>
          
          <nav className="p-4 space-y-2">
            {[
              { id: 'inicio', label: 'Início', icon: Home },
              { id: 'agenda', label: 'Agenda', icon: CalendarDays },
              { id: 'financeiro', label: 'Finanças', icon: DollarSign },
              { id: 'notas', label: 'Arquivos & Notas', icon: StickyNote },
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id as any)}
                className={`w-full sidebar-item flex items-center justify-center lg:justify-start gap-4 p-3 rounded-lg text-sm font-bold border-l-4 transition-all duration-[0.4s] ${
                  activeTab === item.id 
                    ? 'bg-[#111111] border-[#adff2f] text-white shadow-[0_0_15px_rgba(173,255,47,0.1)]' 
                    : 'border-transparent text-zinc-500 hover:text-white hover:bg-[#111111]'
                }`}
              >
                <item.icon className="w-5 h-5 flex-shrink-0" />
                <span className="hidden lg:block">{item.label}</span>
              </button>
            ))}
          </nav>
        </div>
        
        <div className="p-4 border-t border-[#111]">
          <a href="#/" className="w-full flex items-center justify-center lg:justify-start gap-4 p-3 rounded-lg text-gray-500 hover:text-white hover:bg-[#111] transition-colors duration-[0.4s]">
            <Globe className="w-5 h-5 flex-shrink-0" />
            <span className="hidden lg:block text-sm uppercase tracking-widest font-semibold">Ver Site</span>
          </a>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 sm:ml-[260px] overflow-y-auto bg-[#050505]">
        {/* GLOBAL CRITICAL ALARM */}
        {isCritical && (
          <div className="sticky top-0 z-[100] w-full bg-red-600/90 backdrop-blur text-white px-4 py-2 flex items-center justify-center gap-3 border-b-2 border-red-500 shadow-[0_0_20px_rgba(239,68,68,0.5)] animate-pulse cursor-pointer" onClick={() => setActiveTab('financeiro')}>
            <Zap className="w-4 h-4 animate-bounce" />
            <span className="text-[10px] md:text-xs font-black uppercase tracking-widest">
              Alerta Global: Burn Rate Crítico de Suprimentos! ({criticalItems.length} itens)
            </span>
          </div>
        )}

        {/* Mobile Header (fallback) */}
        <div className="sm:hidden flex items-center justify-between p-4 border-b border-[#111] bg-[#050505]">
          <div className="flex space-x-4">
             <button onClick={() => setActiveTab('inicio')} className={activeTab === 'inicio' ? 'text-[#adff2f]' : 'text-gray-500'}><Home/></button>
             <button onClick={() => setActiveTab('agenda')} className={activeTab === 'agenda' ? 'text-[#adff2f]' : 'text-gray-500'}><CalendarDays/></button>
             <button onClick={() => setActiveTab('financeiro')} className={activeTab === 'financeiro' ? 'text-[#adff2f]' : 'text-gray-500'}><DollarSign/></button>
             <button onClick={() => setActiveTab('notas')} className={activeTab === 'notas' ? 'text-[#adff2f]' : 'text-gray-500'}><StickyNote/></button>
          </div>
          <a href="#/"><Globe className="text-gray-500"/></a>
        </div>

        <div className="p-4 lg:p-10 max-w-6xl mx-auto space-y-8">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            {activeTab === 'inicio' && <DashboardInicio state={state} updateState={updateState} setActiveTab={setActiveTab} />}
            {activeTab === 'agenda' && <DashboardAgenda state={state} updateState={updateState} />}
            {activeTab === 'financeiro' && <DashboardFinanceiro state={state} updateState={updateState} />}
            {activeTab === 'notas' && <DashboardNotas state={state} updateState={updateState} />}
          </motion.div>
        </div>
      </main>
    </div>
  );
}

// -- Subcomponents --

function DashboardInicio({ state, updateState, setActiveTab }: any) {
  const [lightboxImg, setLightboxImg] = useState<string | null>(null);
  
  const todayStr = new Date().toISOString().split('T')[0];
  const upcomingAppointments = state.appointments
    .filter((a: any) => a.date >= todayStr)
    .sort((a: any, b: any) => a.date.localeCompare(b.date) || a.time.localeCompare(b.time));
    
  const pastAppointments = state.appointments
    .filter((a: any) => a.date <= todayStr && (a.status === 'Concluído' || a.status === 'Finalizado'))
    .sort((a: any, b: any) => b.date.localeCompare(a.date));

  const percentGoal = Math.min(100, Math.round((state.revenue / state.monthlyGoal) * 100)) || 0;

  const KANBAN_COLS = ['Pendente', 'Confirmado', 'Concluído'];

  const [usagePromptAppId, setUsagePromptAppId] = useState<string | null>(null);
  const [usageQuantities, setUsageQuantities] = useState<Record<string, number>>({});



  const finishAppAndDeduct = () => {
    if (!usagePromptAppId) return;
    const app = state.appointments.find((a:any) => a.id === usagePromptAppId);
    if (!app) return;
    
    updateState((s:any) => {
       const revAdd = (app.status !== 'Concluído' && app.status !== 'Finalizado') ? (app.estimatedPrice || 0) : 0;
       return {
         ...s,
         appointments: s.appointments.map((a:any) => a.id === usagePromptAppId ? {...a, status: 'Concluído'} : a),
         revenue: s.revenue + revAdd,
         inventory: (s.inventory || []).map((inv:any) => {
           const used = usageQuantities[inv.id] || 0;
           return { ...inv, quantity: Math.max(0, inv.quantity - used) };
         })
       };
    });
    setUsagePromptAppId(null);
    setUsageQuantities({});
  };

  const moveAppStatus = (id: string, newStatus: string) => {
    if (newStatus === 'Concluído') {
      setUsagePromptAppId(id);
      return;
    }
    const app = state.appointments.find((a:any) => a.id === id);
    if (!app) return;
    
    updateState((s:any) => {
       const revAdd = (newStatus === 'Concluído' && app.status !== 'Concluído' && app.status !== 'Finalizado') ? (app.estimatedPrice || 0) : 0;
       return {
         ...s,
         appointments: s.appointments.map((a:any) => a.id === id ? {...a, status: newStatus} : a),
         revenue: s.revenue + revAdd
       };
    });
  };

  const clearCompleted = () => {
    updateState((s:any) => {
      const updatedAppointments = s.appointments.map((a:any) => a.status === 'Concluído' ? {...a, status: 'Finalizado'} : a);
      return {
        ...s,
        appointments: updatedAppointments
      };
    });
    // Add success feedback so they know it worked
    alert('Sessões concluídas foram salvas no Histórico (Arquivos & Notas)!');
  };

  return (
    <div className="space-y-6 flex flex-col">
      {/* Usage Modal */}
      {usagePromptAppId && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/90 p-4">
          <div className="bg-[#111] border border-[#adff2f]/30 p-6 rounded-2xl max-w-sm w-full">
             <h3 className="text-xl font-black uppercase tracking-tighter text-[#adff2f] mb-4">Gasto de Material</h3>
             <p className="text-xs text-gray-400 mb-6">Quanto material foi usado nessa sessão? Isso será abatido do estoque automaticamente.</p>
             
             <div className="space-y-4 max-h-[40vh] overflow-y-auto pr-2 mb-6">
               {(state.inventory || []).map((inv: any) => (
                 <div key={inv.id} className="flex justify-between items-center">
                    <div>
                      <div className="font-bold text-white text-sm uppercase">{inv.name}</div>
                      <div className="text-[10px] text-gray-500">Estoque atual: {inv.quantity} {inv.unit}</div>
                    </div>
                    <input 
                      type="number"
                      min="0"
                      max={inv.quantity}
                      placeholder="0"
                      className="w-20 bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-white font-mono focus:border-[#adff2f] focus:outline-none"
                      value={usageQuantities[inv.id] || ''}
                      onChange={(e) => setUsageQuantities({...usageQuantities, [inv.id]: parseInt(e.target.value) || 0})}
                    />
                 </div>
               ))}
             </div>
             
             <div className="flex gap-3">
               <button onClick={() => {setUsagePromptAppId(null); setUsageQuantities({});}} className="flex-1 py-3 text-xs bg-white/5 text-white uppercase font-bold rounded-xl hover:bg-white/10">Cancelar</button>
               <button onClick={finishAppAndDeduct} className="flex-1 py-3 text-xs bg-[#adff2f] text-black uppercase font-black rounded-xl hover:bg-white">Concluir Sessão</button>
             </div>
          </div>
        </div>
      )}


      {/* Lightbox Modal */}
      {lightboxImg && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/90 p-4" onClick={() => setLightboxImg(null)}>
          <img src={lightboxImg} alt="Reference" className="max-w-full max-h-[90vh] rounded-xl neon-border-lime object-contain" />
          <button className="absolute top-6 right-6 p-2 bg-black/50 text-white rounded-full"><X className="w-6 h-6"/></button>
        </div>
      )}

      {/* Quote Banner */}
      <div className="flex justify-between items-end mb-2">
        <div className="max-w-xl">
          <p className="text-xs uppercase tracking-widest text-zinc-500 mb-1 font-bold">Manifesto de Rua</p>
          <h2 className="text-2xl font-serif italic text-zinc-200">"A arte é a única forma de fugir sem sair de casa. Domine a rua."</h2>
        </div>
        <div className="text-right hidden sm:block">
          <p className="text-[10px] uppercase text-zinc-500">Data de Hoje</p>
          <p className="text-xl font-mono font-bold">{new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' }).replace(/ de /g, ' ').toUpperCase()}</p>
        </div>
      </div>

      {/* Guia do CEO */}
      <div className="bg-[#9333ea]/10 border border-[#9333ea]/30 rounded-2xl p-4 flex gap-4 items-start">
        <div className="bg-[#9333ea] text-white p-2 rounded-xl mt-1">
          <Zap className="w-5 h-5"/>
        </div>
        <div>
          <h3 className="text-sm font-black uppercase text-[#9333ea] mb-1">Guia Tático do CEO</h3>
          <p className="text-xs text-gray-400">1. O cliente agenda no app e cai na aba <b>Pendente</b>.<br/>2. Você clica em <b>ZAP</b> para confirmar, e avança o card para <b>Confirmado</b>.<br/>3. Após a sessão, mova para <b>Concluído</b> (o valor já cai na Meta!).<br/>4. No fim do dia, limpe o board e envie a <b>Esteira de Aftercare</b> na seção inferior.</p>
        </div>
      </div>

      {/* Kanban Board */}
      <div className="bg-[#111111] border border-white/5 shadow-[0_0_20px_rgba(173,255,47,0.05)] rounded-2xl p-5 overflow-hidden flex flex-col">
         <div className="flex justify-between items-center mb-6">
           <h3 className="text-sm font-black uppercase tracking-tighter flex items-center gap-2">Pipeline de Sessões</h3>
           <button onClick={() => setActiveTab('notas' as any)} className="text-[10px] bg-white/5 px-3 py-1.5 rounded uppercase font-bold text-gray-400 hover:text-white transition-colors">Ver Finalizados</button>
         </div>
         
         <div className="flex gap-4 overflow-x-auto pb-4 snap-x">
           {KANBAN_COLS.map((col, colIdx) => {
             const colApps = state.appointments.filter((a:any) => (a.status || 'Pendente') === col);
             return (
               <div 
                 key={col} 
                 className="bg-[#050505] border border-white/5 rounded-xl p-4 flex-none w-[320px] sm:w-[350px] snap-center shrink-0 flex flex-col max-h-[500px] transition-colors"
                 onDragOver={(e) => e.preventDefault()}
                 onDrop={(e) => {
                   e.preventDefault();
                   const appId = e.dataTransfer.getData('appId');
                   if (appId) moveAppStatus(appId, col);
                 }}
               >
                 <div className="flex justify-between items-center mb-4 pb-2 border-b border-white/10">
                    <h4 className={`text-xs font-black uppercase tracking-widest ${col === 'Pendente' ? 'text-[#9333ea]' : col === 'Confirmado' ? 'text-blue-400' : 'text-[#adff2f]'}`}>{col}</h4>
                    <span className="text-[10px] bg-white/10 text-gray-300 px-2 py-0.5 rounded font-bold">{colApps.length}</span>
                 </div>
                 
                 <div className="space-y-3 overflow-y-auto flex-1 pr-1">
                   {colApps.length === 0 ? (
                     <div className="text-center py-6 text-gray-600 text-[10px] border border-dashed border-white/5 rounded-lg font-bold uppercase tracking-widest pointer-events-none">Vazio</div>
                   ) : (
                     colApps.map((app:any) => (
                       <div 
                          key={app.id} 
                          draggable
                          onDragStart={(e) => e.dataTransfer.setData('appId', app.id)}
                          className="bg-[#111] p-4 rounded-lg border border-white/5 hover:border-white/20 transition-all flex flex-col gap-3 cursor-grab active:cursor-grabbing"
                       >
                          <div className="flex justify-between items-start pointer-events-none">
                             <div>
                                <div className="font-bold text-sm text-white">{app.clientName}</div>
                                <div className="text-[10px] text-zinc-500 font-mono mt-0.5">{app.phone}</div>
                             </div>
                             <div className="flex flex-col items-end">
                               <div className="font-mono text-lime-400 text-[10px] font-bold">{app.date.split('-').reverse().join('/')}</div>
                               <div className="font-mono text-white text-xs font-bold">{app.time}</div>
                             </div>
                          </div>
                          
                          <div className="flex justify-between items-center">
                             <div className="text-[9px] text-zinc-400 uppercase font-bold tracking-widest">
                               {app.tattooStyle} {app.bodyPart && `• ${app.bodyPart}`}
                             </div>
                             {app.estimatedPrice && <span className="text-[10px] text-purple-400 font-bold font-mono">R$ {app.estimatedPrice}</span>}
                          </div>

                          {(app.anamnesis || app.referenceImage) && (
                            <div className="flex gap-2 mb-1">
                              {app.referenceImage && (
                                <button onClick={() => setLightboxImg(app.referenceImage)} className="text-[9px] bg-white/10 px-2 py-1 rounded text-white hover:bg-white/20">Ref 🖼️</button>
                              )}
                              {app.anamnesis && app.anamnesis.allergies !== 'Nenhuma' && (
                                <span className="text-[9px] bg-red-500/20 text-red-400 px-2 py-1 rounded font-bold">Alérgico</span>
                              )}
                            </div>
                          )}
                          
                          <div className="flex gap-2 justify-between mt-2 pt-3 border-t border-white/10">
                             {colIdx > 0 ? (
                                <button onClick={() => moveAppStatus(app.id, KANBAN_COLS[colIdx-1])} className="px-2 py-1.5 text-gray-400 bg-white/5 hover:bg-white/10 rounded text-[9px] font-bold uppercase">&larr; Voltar</button>
                             ) : <div/>}

                             <div className="flex gap-2">
                               <a 
                                  href={`https://wa.me/${app.phone.replace(/\D/g,'')}?text=Salve%20${encodeURIComponent(app.clientName)},%20passando%20pra%20falar%20da%20sua%20sessão%20agendada%20pro%20dia%20${app.date.split('-').reverse().join('/')}%20às%20${app.time}!`}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="px-2.5 py-1.5 bg-[#25D366]/20 text-[#25D366] text-[9px] font-black uppercase rounded hover:bg-[#25D366] hover:text-black transition-colors flex items-center gap-1"
                               >
                                  <MessageCircle className="w-3 h-3"/> Zap
                               </a>
                               {colIdx < 2 && (
                                  <button onClick={() => moveAppStatus(app.id, KANBAN_COLS[colIdx+1])} className="px-3 py-1.5 text-black font-black uppercase bg-[#adff2f] rounded text-[9px] drop-shadow-[0_0_5px_rgba(173,255,47,0.5)]">
                                    {col === 'Pendente' ? 'Confirmar' : 'Concluir'} &rarr;
                                  </button>
                               )}
                             </div>
                          </div>
                          
                          {/* MAGIC AFTERCARE BUTTON */}
                          {col === 'Concluído' && (
                            <a 
                              href={`https://wa.me/${app.phone ? app.phone.replace(/\D/g,'') : ''}?text=${encodeURIComponent(`Fala ${app.clientName}! Passando aqui pra te mandar os CUIDADOS PÓS-TATTOO (Aftercare) 🌿:\n\n1. Lave suavemente com sabonete neutro (2x ao dia)\n2. Hidrate com pomada cicatrizante\n3. Não arranque as casquinhas!\n4. Evite sol, praia e carne de porco por 15 dias.\n\nQualquer dúvida me chama!`)}`}
                              target="_blank"
                              rel="noreferrer"
                              className="w-full mt-2 py-2 bg-[#25D366]/10 border border-[#25D366]/20 text-[#25D366] hover:bg-[#25D366] hover:text-black transition-colors flex justify-center items-center gap-2 rounded text-[10px] font-black uppercase shadow-[0_0_15px_rgba(37,211,102,0.15)]"
                            >
                              <MessageCircle className="w-3 h-3"/>
                              Botão Mágico: Aftercare
                            </a>
                          )}
                       </div>
                     ))
                   )}
                 </div>

                 {col === 'Concluído' && colApps.length > 0 && (
                   <button onClick={clearCompleted} className="mt-3 w-full py-2.5 bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white font-bold text-[10px] uppercase rounded-lg border border-red-500/20 transition-colors">
                     Limpar Dia &rarr; Aba Finalizados
                   </button>
                 )}
               </div>
             );
           })}
         </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
         <div className="bg-[#111111] border border-white/5 shadow-[0_0_20px_rgba(147,51,234,0.1)] rounded-2xl p-5">
            <h3 className="text-sm font-black uppercase tracking-tighter flex items-center gap-2 mb-4 text-[#9333ea]"><TrendingUp className="w-4 h-4"/> Esteira de Aftercare</h3>
            <p className="text-[10px] text-gray-500 mb-4 uppercase tracking-widest font-bold">Envie os cuidados pós-sessão</p>
            {pastAppointments.length === 0 ? (
              <div className="text-center py-4 text-gray-600 text-[10px] font-bold uppercase tracking-widest border border-dashed border-gray-800 rounded-lg">
                Nenhum cliente recente.
              </div>
            ) : (
              <div className="space-y-3">
                {pastAppointments.slice(0,4).map((app: any) => (
                  <div key={`after-${app.id}`} className="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/5">
                     <div className="text-xs">
                       <p className="font-bold text-white">{app.clientName}</p>
                       <p className="text-[10px] text-gray-500 mt-0.5 font-mono">{app.phone} • Há alguns dias</p>
                     </div>
                     <a 
                        href={`https://wa.me/${app.phone.replace(/\D/g,'')}?text=Salve%20${encodeURIComponent(app.clientName)},%20aqui%20é%20do%20Estúdio%20Ortiz%20Tattoo.%20Como%20tá%20a%20cicatrização%20da%20tattoo?%20Lembre-se%20de%20lavar%20com%20sabonete%20neutro%20e%20hidratar!`}
                        target="_blank"
                        rel="noreferrer"
                        className="px-3 py-2 bg-[#9333ea] hover:bg-white text-white hover:text-black text-[9px] font-black uppercase tracking-widest rounded transition-colors shadow-[0_0_10px_rgba(147,51,234,0.3)]"
                     >
                        Verificar Status
                     </a>
                  </div>
                ))}
              </div>
            )}
         </div>

         <div className="bg-[#111111] border border-[#adff2f]/20 shadow-[0_0_20px_rgba(173,255,47,0.05)] rounded-2xl p-5 flex flex-col justify-between transition-all duration-[0.4s]">
            <div>
               <h3 className="text-sm font-black uppercase tracking-tighter text-[#adff2f] mb-1">Meta Financeira Mensal</h3>
               <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">Faturamento de {new Date().toLocaleString('pt-BR', { month: 'long' })}</p>
            </div>
            
            <div className="mt-6 text-center">
              <p className="text-4xl font-black neon-text-lime mb-2">R$ {state.revenue.toLocaleString('pt-BR')}</p>
              <p className="text-xs text-zinc-400 font-mono">Arrecadado de R$ {state.monthlyGoal.toLocaleString('pt-BR')}</p>
            </div>
            
            <div className="w-full bg-neutral-800 h-4 rounded-full mt-6 overflow-hidden shadow-inner p-0.5 border border-white/5">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${percentGoal}%` }}
                transition={{ duration: 1, delay: 0.5 }}
                className="bg-gradient-to-r from-green-600 to-[#adff2f] h-full rounded-full shadow-[0_0_10px_rgba(173,255,47,0.5)]"
              />
            </div>
            <div className="mt-3 text-center text-xs font-black text-[#adff2f] tracking-widest uppercase">{percentGoal}% Alcançado</div>
         </div>
      </div>
    </div>
  );
}

function DashboardAgenda({ state, updateState }: any) {
  const today = new Date();
  const [calMonth, setCalMonth] = useState(today.getMonth());
  const [calYear, setCalYear] = useState(today.getFullYear());
  const days = getDaysInMonth(calYear, calMonth);

  const toggleDayState = (dateStr: string) => {
    updateState((prev: any) => {
      const current = prev.scheduleDays[dateStr];
      const next = current === 'Liberado' ? 'Trancado' : 'Liberado';
      return {
        ...prev,
        scheduleDays: {
          ...prev.scheduleDays,
          [dateStr]: next
        }
      };
    });
  };

  const hasAppointments = (dateStr: string) => {
    return state.appointments.filter((a: any) => a.date === dateStr).length;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-gray-800 pb-4">
        <div>
           <h2 className="text-2xl font-black uppercase text-white tracking-widest"><span className="text-[#adff2f]">Gestão</span> de Calendário</h2>
           <p className="text-gray-500 text-sm">Controle de contenção e liberação de dias. Clique para alterar o status.</p>
        </div>
      </div>

      <div className="bg-[#111111] border border-[#9333ea]/30 shadow-[0_0_20px_rgba(147,51,234,0.1)] rounded-2xl p-5 transition-all duration-[0.4s]">
        <div className="flex justify-between items-center mb-6">
          <button onClick={() => setCalMonth(m => m - 1)} className="p-2 bg-[#050505] border border-white/5 hover:border-white/20 rounded text-gray-400 transition-all duration-[0.4s]">«</button>
          <h3 className="text-xl font-bold uppercase tracking-widest text-[#adff2f]">{MONTH_NAMES[calMonth]} {calYear}</h3>
          <button onClick={() => setCalMonth(m => m + 1)} className="p-2 bg-[#050505] border border-white/5 hover:border-white/20 rounded text-gray-400 transition-all duration-[0.4s]">»</button>
        </div>

        <div className="grid grid-cols-7 gap-2 sm:gap-4 flex-1">
          {days.map((day, i) => {
            if (!day) return <div key={`empty-${i}`} />;
            
            const isLiberado = state.scheduleDays[day] === 'Liberado';
            const dayNum = parseInt(day.slice(-2), 10);
            const count = hasAppointments(day);

            return (
              <button
                key={day}
                onClick={() => toggleDayState(day)}
                className={`relative aspect-square sm:aspect-[4/3] flex flex-col items-center justify-center rounded-lg border transition-all duration-[0.4s] ${
                  isLiberado 
                    ? 'bg-[#adff2f]/10 border-[#adff2f]/50 hover:bg-[#adff2f]/20 text-[#adff2f]' 
                    : 'bg-[#050505] border-white/5 hover:bg-[#111] text-zinc-500'
                }`}
              >
                <div className={`text-lg sm:text-lg font-bold ${isLiberado ? 'text-lime-400' : 'text-zinc-500'}`}>
                  {dayNum}
                </div>
                {count > 0 && (
                  <div className="absolute top-1 sm:top-2 right-1 sm:right-2 bg-red-500 text-white text-[10px] w-4 h-4 sm:w-5 sm:h-5 flex items-center justify-center rounded-full font-bold shadow-[0_0_8px_rgba(239,68,68,0.6)]">
                    {count}
                  </div>
                )}
                <div className={`hidden sm:block text-[9px] uppercase font-bold tracking-tighter mt-1 ${isLiberado ? 'text-lime-400/60' : 'text-zinc-700'}`}>
                  {isLiberado ? 'Liberado' : 'Trancado'}
                </div>
              </button>
            )
          })}
        </div>
      </div>

      <div className="bg-[#111111] border border-[#adff2f]/30 shadow-[0_0_20px_rgba(173,255,47,0.1)] rounded-2xl p-5 transition-all duration-[0.4s]">
        <h3 className="text-sm font-black uppercase tracking-tighter mb-4 flex items-center gap-2"><Clock className="w-4 h-4 text-[#adff2f]"/> Horários Operacionais (Turnos)</h3>
        <p className="text-xs text-gray-500 mb-4">Adicione os horários que o cliente pode escolher na hora de agendar uma sessão pelo site.</p>
        <div className="flex flex-wrap gap-2">
          {state.availableHours.map((hour: string) => (
            <div key={hour} className="flex items-center gap-2 bg-neutral-900 border border-white/10 px-3 py-2 rounded-lg text-sm font-bold text-white">
              <Clock className="w-3 h-3 text-lime-400"/> {hour}
              <button 
                onClick={() => updateState((s:any) => ({ ...s, availableHours: s.availableHours.filter((h:string) => h !== hour) }))} 
                className="ml-2 text-zinc-500 hover:text-red-500 transition-colors"
                title="Remover Horário"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ))}
          <form 
            onSubmit={(e) => {
              e.preventDefault();
              const fd = new FormData(e.currentTarget);
              const nh = fd.get('newHour') as string;
              if (nh && !state.availableHours.includes(nh)) {
                updateState((s:any) => ({ ...s, availableHours: [...s.availableHours, nh].sort() }));
              }
              (e.target as HTMLFormElement).reset();
            }}
            className="flex gap-2 items-center ml-2"
          >
            <input type="time" name="newHour" required className="bg-black/40 border border-white/10 rounded-lg px-2 py-1 text-white text-sm focus:outline-none focus:border-lime-500" />
            <button type="submit" className="bg-lime-400 text-black px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-lime-300">Add</button>
          </form>
        </div>
      </div>

      <div className="bg-[#111111] border border-[#9333ea]/30 shadow-[0_0_20px_rgba(147,51,234,0.1)] rounded-2xl p-5 transition-all duration-[0.4s]">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-sm font-black uppercase tracking-tighter flex items-center gap-2 text-[#9333ea]">Fila VIP (Waitlist)</h3>
          <span className="text-[10px] px-2 py-1 bg-purple-500/20 text-purple-400 rounded-md font-bold">{(state.waitlist || []).length} AGUARDANDO</span>
        </div>
        
        {(!state.waitlist || state.waitlist.length === 0) ? (
          <div className="text-center py-6 text-gray-600 text-[10px] font-bold uppercase tracking-widest border border-dashed border-gray-800 rounded-lg">
            Nenhum cliente na fila de espera.
          </div>
        ) : (
          <div className="space-y-3 overflow-y-auto" style={{ maxHeight: '300px' }}>
            {state.waitlist.map((wait: any) => (
              <div key={wait.id} className="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/5">
                <div>
                  <p className="font-bold text-sm text-white">{wait.clientName}</p>
                  <p className="text-[10px] text-gray-500 font-mono mt-1">{wait.phone} • Estilo: {wait.style}</p>
                </div>
                <a 
                   href={`https://wa.me/${wait.phone.replace(/\D/g,'')}?text=Salve%20${encodeURIComponent(wait.clientName)},%20aqui%20é%20do%20Estúdio%20Ortiz%20Tattoo.%20Apareceu%20uma%20vaga%20na%20agenda!`}
                   target="_blank"
                   rel="noreferrer"
                   className="px-3 py-2 bg-[#9333ea] text-white text-[10px] font-black uppercase tracking-widest rounded-lg hover:bg-white hover:text-[#9333ea] transition-all"
                >
                   Notificar Vaga
                </a>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function DashboardFinanceiro({ state, updateState }: any) {
  const [tattooValue, setTattooValue] = useState('');
  const [isOrganizingInventory, setIsOrganizingInventory] = useState(false);
  const [organizeItems, setOrganizeItems] = useState<any[]>([]);
  
  const [newItemName, setNewItemName] = useState('');
  const [newItemUnit, setNewItemUnit] = useState('un');
  const [newItemQuantity, setNewItemQuantity] = useState('');
  
  const percentageStudio = 50;
  
  const val = parseFloat(tattooValue) || 0;
  const valStudio = val * (percentageStudio / 100);
  const valArtist = val - valStudio;

  // Analytics de Demanda
  const styleDemand = (state.appointments || []).reduce((acc: any, curr: any) => {
    if(curr.style) {
       acc[curr.style] = (acc[curr.style] || 0) + 1;
    }
    return acc;
  }, {});

  const sortedStyles = Object.entries(styleDemand).sort((a: any, b: any) => b[1] - a[1]);
  const totalAppointments = state.appointments?.length || 1;

  const handleFinish = (e: React.FormEvent) => {
    e.preventDefault();
    if (val <= 0) return;

    updateState((prev: any) => ({
      ...prev,
      revenue: prev.revenue + val
    }));
    
    setTattooValue('');
    alert(`R$ ${val.toFixed(2)} injetado no faturamento global do estúdio.`);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
      {/* Organize Inventory Modal */}
      {isOrganizingInventory && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/90 p-4 overflow-y-auto">
          <div className="bg-[#111] border border-red-500/30 p-6 rounded-2xl max-w-md w-full my-auto">
            <h3 className="text-xl font-black uppercase tracking-tighter text-red-500 mb-2">Auditoria de Estoque</h3>
            <p className="text-xs text-gray-400 mb-6">Atualize suas contagens reais. As alterações substituirão o saldo atual.</p>
            
            <div className="space-y-4 max-h-[50vh] overflow-y-auto pr-2 mb-6">
               {organizeItems.map((item, idx) => (
                 <div key={item.id} className="flex flex-col sm:flex-row sm:items-center justify-between bg-black/40 p-3 rounded-xl border border-white/5 gap-2">
                    <div className="flex-1">
                      <div className="font-bold text-white text-sm uppercase">{item.name}</div>
                      <div className="text-[10px] text-gray-500">Unidade: {item.unit} | Limite: {item.threshold}</div>
                    </div>
                    <input 
                      type="number"
                      min="0"
                      className="w-24 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white font-mono focus:border-red-500 focus:outline-none"
                      value={item.quantity}
                      onChange={(e) => {
                         const copy = [...organizeItems];
                         copy[idx].quantity = parseInt(e.target.value) || 0;
                         setOrganizeItems(copy);
                      }}
                    />
                 </div>
               ))}
               
               {organizeItems.length === 0 && <div className="text-center text-xs text-zinc-500 p-4">Nenhum item cadastrado no estoque.</div>}
            </div>
            
            <div className="mb-6 p-4 border border-white/10 rounded-xl bg-black/40">
               <h4 className="text-xs font-bold uppercase text-gray-300 mb-3">Adicionar Novo Item</h4>
               <div className="flex flex-col gap-2">
                  <input type="text" placeholder="Nome (Ex: Agulha 3RL)" className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-xs text-white placeholder-gray-600 focus:border-red-500 focus:outline-none" value={newItemName} onChange={e => setNewItemName(e.target.value)} />
                  <div className="flex gap-2">
                    <input type="text" placeholder="Unidade (ex: un, ml)" className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-xs text-white placeholder-gray-600 focus:border-red-500 focus:outline-none" value={newItemUnit} onChange={e => setNewItemUnit(e.target.value)} />
                    <input type="number" placeholder="Estoque Inicial" className="w-1/3 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-xs text-white placeholder-gray-600 focus:border-red-500 focus:outline-none" value={newItemQuantity} onChange={e => setNewItemQuantity(e.target.value)} />
                  </div>
                  <button onClick={() => {
                     if(!newItemName) return;
                     setOrganizeItems([...organizeItems, { id: crypto.randomUUID(), name: newItemName, unit: newItemUnit || 'un', quantity: parseInt(newItemQuantity) || 0, threshold: 10 }]);
                     setNewItemName('');
                     setNewItemQuantity('');
                  }} className="mt-2 text-[10px] uppercase font-bold bg-[#adff2f]/10 text-[#adff2f] py-2 rounded-lg hover:bg-[#adff2f]/20 transition-colors">Adicionar à Lista</button>
               </div>
            </div>

            <div className="flex gap-3">
               <button onClick={() => setIsOrganizingInventory(false)} className="flex-1 py-3 text-xs bg-white/5 text-white uppercase font-bold rounded-xl hover:bg-white/10">Cancelar</button>
               <button onClick={() => {
                  updateState((s:any) => ({...s, inventory: organizeItems}));
                  setIsOrganizingInventory(false);
               }} className="flex-1 py-3 text-xs bg-red-500 text-white uppercase font-black rounded-xl hover:bg-red-400">Salvar Estoque</button>
            </div>
          </div>
        </div>
      )}

      <div className="lg:col-span-6 glass neon-border-lime rounded-2xl p-5">
        <div className="mb-8">
          <h2 className="text-2xl font-black uppercase text-white tracking-widest flex items-center gap-2"><DollarSign className="text-[#9333ea]"/> Fechar Sessão</h2>
          <p className="text-gray-500 text-sm">Calculadora de split e injeção de capital no cofre.</p>
        </div>

        <form onSubmit={handleFinish} className="space-y-6">
          <div>
            <label className="block text-xs uppercase tracking-widest text-gray-500 mb-2">Valor Total do Trampo (R$)</label>
            <input 
              type="number" 
              required 
              min="1"
              value={tattooValue}
              onChange={(e) => setTattooValue(e.target.value)}
              className="w-full p-4 rounded-lg bg-black/40 font-mono text-2xl text-[#adff2f] text-center neon-border-green focus:outline-none" 
              placeholder="0.00"
            />
          </div>

          <div className="grid grid-cols-2 gap-4 bg-white/5 border border-white/5 p-4 rounded-lg">
            <div className="text-center border-r border-white/10">
              <div className="text-[10px] uppercase font-bold text-gray-500 mb-1">Corte Estúdio ({percentageStudio}%)</div>
              <div className="text-xl font-mono text-[#9333ea] font-bold">R$ {valStudio.toFixed(2)}</div>
            </div>
            <div className="text-center">
              <div className="text-[10px] uppercase font-bold text-gray-500 mb-1">Corte Artista ({100 - percentageStudio}%)</div>
              <div className="text-xl font-mono text-white font-bold">R$ {valArtist.toFixed(2)}</div>
            </div>
          </div>

          <button type="submit" className="w-full py-4 bg-[#9333ea] text-white font-black uppercase tracking-widest rounded-lg hover:bg-white hover:text-[#9333ea] hover:shadow-[0_0_20px_#9333ea] transition-all">
            CONCLUIR ARTE & INJETAR
          </button>
        </form>
      </div>

      <div className="lg:col-span-6 glass neon-border-purple rounded-2xl p-5 relative overflow-hidden flex flex-col justify-center text-center items-center">
        <div className="absolute top-0 right-0 opacity-5 w-full h-full pointer-events-none flex items-center justify-center">
          <DollarSign className="w-64 h-64 text-[#adff2f]" />
        </div>
        <div className="relative z-10 text-center">
          <div className="text-[10px] uppercase font-bold tracking-widest text-zinc-500 mb-2">Caixa Forte Global</div>
          <div className="text-4xl md:text-5xl font-black neon-text-lime break-all">
            R$ {state.revenue.toLocaleString('pt-BR')}
          </div>
          <div className="mt-8 pt-6 border-t border-white/10">
            <div className="text-xs uppercase font-bold text-gray-600 mb-2">Meta do mês</div>
            <input 
              type="number"
              value={state.monthlyGoal}
              onChange={(e) => updateState((s:any) => ({...s, monthlyGoal: Number(e.target.value)}))}
              className="bg-transparent border-b border-gray-700 text-gray-400 font-mono text-center focus:outline-none focus:border-[#adff2f] w-32 pb-1 transition-colors"
            />
          </div>
        </div>
      </div>

      <div className="lg:col-span-12 glass border-t border-b sm:border border-white/5 sm:rounded-2xl p-5 mt-4">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-sm font-black uppercase tracking-tighter flex items-center gap-2 text-[#adff2f]"><TrendingUp className="w-4 h-4"/> Radar de Demanda (Analytics de Estilos)</h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {sortedStyles.length === 0 ? (
            <div className="col-span-full text-center text-xs text-gray-600 py-6">Nenhum dado para analisar ainda.</div>
          ) : (
            sortedStyles.map(([style, count]: any, idx: number) => {
              const percentage = ((count / totalAppointments) * 100).toFixed(0);
              return (
                <div key={style} className="bg-black/40 border border-white/5 rounded-xl p-4 flex items-center justify-between">
                   <div className="flex items-center gap-3">
                      <div className="text-xl font-black text-gray-700">#{idx + 1}</div>
                      <div>
                         <div className="text-sm font-bold text-white uppercase">{style}</div>
                         <div className="text-[10px] text-gray-500 uppercase font-mono">{count} sessões agendadas</div>
                      </div>
                   </div>
                   <div className="text-lg font-black text-[#adff2f]">{percentage}%</div>
                </div>
              );
            })
          )}
        </div>
      </div>

      <div className="lg:col-span-12 bg-[#111111] border border-red-500/30 shadow-[0_0_20px_rgba(239,68,68,0.1)] rounded-2xl p-5 mt-4 transition-all duration-[0.4s]">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-sm font-black uppercase tracking-tighter flex items-center gap-2 text-red-500"><Zap className="w-4 h-4"/> Burn Rate & Suprimentos</h3>
          <button 
             onClick={() => {
                setOrganizeItems(JSON.parse(JSON.stringify(state.inventory || [])));
                setIsOrganizingInventory(true);
             }}
             className="text-[10px] px-3 py-1.5 bg-red-500 hover:bg-red-600 text-white rounded-md font-bold uppercase tracking-widest transition-colors flex items-center gap-1">
            Organizar Estoque
          </button>
        </div>

        {/* ALARME DE BURN RATE CRÍTICO */}
        {(() => {
          const criticalItems = (state.inventory || []).filter((item: any) => item.quantity <= item.threshold);
          if (criticalItems.length > 0) {
            return (
              <div className="mb-6 p-4 rounded-xl bg-red-500/20 border-2 border-red-500 shadow-[0_0_20px_rgba(239,68,68,0.4)] animate-pulse flex items-center gap-4">
                <div className="bg-red-500 text-black p-3 rounded-full flex-shrink-0">
                   <Zap className="w-6 h-6 animate-bounce" />
                </div>
                <div>
                   <h4 className="text-red-500 font-black uppercase text-sm mb-1 tracking-widest">Alarme: Burn Rate Crítico!</h4>
                   <p className="text-xs text-red-200 uppercase font-bold">
                     Nível de ameaça: Alto. Suprimentos em esgotamento: {criticalItems.map((i: any) => i.name).join(', ')}.
                   </p>
                </div>
              </div>
            );
          }
          return null;
        })()}
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {(state.inventory || []).map((item: any) => {
            const isLow = item.quantity <= item.threshold;
            return (
              <div key={item.id} className={`p-4 rounded-xl border transition-colors ${isLow ? 'bg-red-500/10 border-red-500/50' : 'bg-white/5 border-white/10'}`}>
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-bold text-white text-sm uppercase">{item.name}</h4>
                  {isLow && <span className="text-[9px] bg-red-500 text-white px-1.5 py-0.5 rounded font-bold uppercase animate-pulse">Comprar</span>}
                </div>
                <div className="flex justify-between items-end">
                  <div className={`flex items-baseline gap-1 font-mono text-xl ${isLow ? 'text-red-400 font-black' : 'text-[#adff2f]'}`}>
                    <input 
                      type="number"
                      min="0"
                      value={item.quantity === 0 ? '' : item.quantity}
                      placeholder="0"
                      onChange={(e) => {
                        const newQ = parseInt(e.target.value) || 0;
                        updateState((s:any) => ({
                          ...s, inventory: s.inventory.map((inv:any) => inv.id === item.id ? {...inv, quantity: newQ} : inv)
                        }))
                      }}
                      className={`w-14 sm:w-20 bg-black/30 border ${isLow ? 'border-red-500/50 focus:border-red-500' : 'border-[#adff2f]/30 focus:border-[#adff2f]'} rounded-lg focus:outline-none transition-colors text-center py-1 px-1 -ml-2 mr-1`}
                    />
                    <span className="text-[10px] text-gray-500 uppercase">{item.unit}</span>
                  </div>
                  <div className="flex gap-1">
                    <button onClick={() => {
                        updateState((s:any) => ({
                          ...s, inventory: s.inventory.map((inv:any) => inv.id === item.id ? {...inv, quantity: Math.max(0, inv.quantity - 1)} : inv)
                        }))
                      }} className="w-8 h-8 flex items-center justify-center bg-black/40 text-white rounded hover:bg-white border border-white/10 hover:text-black font-bold transition-colors">-</button>
                    <button onClick={() => {
                        updateState((s:any) => ({
                          ...s, inventory: s.inventory.map((inv:any) => inv.id === item.id ? {...inv, quantity: inv.quantity + 1} : inv)
                        }))
                      }} className="w-8 h-8 flex items-center justify-center bg-black/40 text-white rounded hover:bg-white border border-white/10 hover:text-black font-bold transition-colors">+</button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function DashboardNotas({ state, updateState }: any) {
  const finalized = state.appointments.filter((a: any) => a.status === 'Finalizado').sort((a: any, b: any) => b.date.localeCompare(a.date));

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 h-full">
      <div className="glass neon-border-lime rounded-2xl p-5 flex flex-col">
        <div className="mb-6">
          <h2 className="text-xl font-black uppercase text-white tracking-widest flex items-center gap-2"><StickyNote className="text-[#adff2f]"/> Anotações Gerais</h2>
          <p className="text-gray-500 text-[10px] uppercase font-bold">Anotações persistentes locais. Salva automaticamente.</p>
        </div>
        
        <textarea 
          value={state.notes}
          onChange={(e) => updateState((s:any) => ({...s, notes: e.target.value}))}
          placeholder="O que está faltando? Tintas, agulhas, ideias? Anote aqui..."
          className="flex-1 w-full bg-black/40 border border-white/10 rounded-xl p-6 text-gray-300 font-mono focus:outline-none focus:border-[#adff2f]/50 transition-colors resize-none"
        />
      </div>

      <div className="glass neon-border-purple rounded-2xl p-5 flex flex-col">
        <div className="mb-6 flex justify-between items-end border-b border-white/10 pb-4">
          <div>
            <h2 className="text-xl font-black uppercase text-white tracking-widest flex items-center gap-2"><Home className="text-[#9333ea] w-5 h-5"/> Histórico</h2>
            <p className="text-gray-500 text-[10px] uppercase font-bold text-left mt-1">Clientes Finalizados e Limpos do Board</p>
          </div>
          <span className="text-[10px] bg-purple-500/20 text-purple-400 font-bold px-2 py-1 rounded">{finalized.length} SESSÕES</span>
        </div>
        
        <div className="flex-1 overflow-y-auto space-y-3 pr-2">
          {finalized.length === 0 ? (
            <div className="flex items-center justify-center h-full text-zinc-600 text-[10px] uppercase font-bold tracking-widest border border-dashed border-white/5 rounded-xl">Nenhum histórico ainda.</div>
          ) : (
            finalized.map((app: any) => (
              <div key={app.id} className="bg-black/40 border border-white/5 p-4 rounded-xl flex items-center justify-between">
                <div>
                  <div className="font-bold text-white text-sm">{app.clientName}</div>
                  <div className="text-[10px] text-zinc-500 font-mono uppercase tracking-widest mt-1">
                    {app.date.split('-').reverse().join('/')} • R$ {app.estimatedPrice || 0}
                  </div>
                </div>
                <div className="text-[9px] bg-white/5 text-gray-400 px-2 py-1 rounded font-bold uppercase">
                  {app.tattooStyle}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
