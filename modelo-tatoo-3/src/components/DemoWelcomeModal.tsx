import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Sparkles, 
  Calendar, 
  LayoutDashboard, 
  Package, 
  Flame, 
  Clock, 
  CheckCircle2, 
  ArrowRight, 
  RotateCcw, 
  HelpCircle,
  Eye,
  Sliders,
  X
} from 'lucide-react';
import { useAppContext } from '../context/AppContext';

interface DemoWelcomeModalProps {
  currentHash: string;
}

export function DemoWelcomeModal({ currentHash }: DemoWelcomeModalProps) {
  const [isOpen, setIsOpen] = useState(true);
  const { updateState } = useAppContext();
  const [copiedLink, setCopiedLink] = useState(false);

  // Allow reopening modal whenever requested
  const handleOpenModal = () => setIsOpen(true);
  const handleCloseModal = () => setIsOpen(false);

  const handleGoToClient = (anchor?: string) => {
    setIsOpen(false);
    if (window.location.hash !== '#/' && window.location.hash !== '') {
      window.location.hash = '#/';
    }
    if (anchor) {
      setTimeout(() => {
        const el = document.getElementById(anchor);
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }, 150);
    }
  };

  const handleGoToAdmin = () => {
    setIsOpen(false);
    window.location.hash = '#/dashboard';
  };

  const handleSeedDemoData = () => {
    const today = new Date();
    const formattedToday = today.toISOString().split('T')[0];
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const formattedTomorrow = tomorrow.toISOString().split('T')[0];

    updateState(prev => ({
      ...prev,
      revenue: 3850,
      monthlyGoal: 6000,
      appointments: [
        {
          id: 'demo-1',
          clientName: 'Mariana Silva',
          phone: '(11) 98765-4321',
          date: formattedToday,
          time: '14:00',
          price: 450,
          style: 'Fine Line Floral',
          status: 'confirmed',
          allergies: 'Nenhuma',
          medicalConditions: 'Nenhuma',
          consentAccepted: true
        },
        {
          id: 'demo-2',
          clientName: 'Lucas Ferreira',
          phone: '(11) 97654-3210',
          date: formattedTomorrow,
          time: '17:00',
          price: 650,
          style: 'Blackwork Geométrico',
          status: 'pending',
          allergies: 'Látex (usar luva nitrílica)',
          medicalConditions: 'Nenhuma',
          consentAccepted: true
        }
      ],
      waitlist: [
        {
          id: 'wait-1',
          clientName: 'Carla Dias',
          phone: '(11) 99123-4567',
          style: 'Floral Delicado',
          dateAdded: formattedToday
        }
      ],
      inventory: [
        { id: '1', name: 'Agulhas 3RL (Fine Line)', quantity: 38, unit: 'un', threshold: 15 },
        { id: '2', name: 'Tinta Preta Tribal 30ml', quantity: 2, unit: 'fr', threshold: 1 },
        { id: '3', name: 'Papel Hectográfico', quantity: 4, unit: 'cx', threshold: 5 }, // triggers alert
        { id: '4', name: 'Luvas Nitrílicas M', quantity: 1, unit: 'cx', threshold: 2 }  // triggers alert
      ]
    }));
    setIsOpen(false);
  };

  return (
    <>
      {/* Persistent Floating Demo Floating Bar */}
      <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-[90] flex items-center gap-2 p-1.5 bg-[#0a0a0a]/95 border border-white/20 rounded-full shadow-[0_0_30px_rgba(0,0,0,0.8)] backdrop-blur-md max-w-[95vw]">
        <div className="flex items-center gap-1.5 pl-3 pr-2 text-xs font-bold text-white uppercase tracking-wider">
          <span className="w-2.5 h-2.5 rounded-full bg-[#adff2f] animate-ping inline-block mr-1" />
          <span className="text-[#adff2f] hidden sm:inline">Modo</span> Demonstração
        </div>

        <div className="h-4 w-[1px] bg-white/20 hidden xs:block" />

        <button
          onClick={() => handleGoToClient()}
          className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 ${
            currentHash !== '#/dashboard'
              ? 'bg-[#adff2f] text-black shadow-[0_0_15px_rgba(173,255,47,0.4)]'
              : 'text-gray-300 hover:text-white hover:bg-white/10'
          }`}
        >
          <Eye className="w-3.5 h-3.5" />
          <span>Visão Cliente</span>
        </button>

        <button
          onClick={() => handleGoToAdmin()}
          className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 ${
            currentHash === '#/dashboard'
              ? 'bg-[#9333ea] text-white shadow-[0_0_15px_rgba(147,51,234,0.4)]'
              : 'text-gray-300 hover:text-white hover:bg-white/10'
          }`}
        >
          <LayoutDashboard className="w-3.5 h-3.5" />
          <span>Painel Admin</span>
        </button>

        <button
          onClick={handleOpenModal}
          className="px-3 py-1.5 rounded-full text-xs font-bold bg-white/10 hover:bg-white/20 text-white transition-all flex items-center gap-1 border border-white/15"
          title="Ver Instruções de Demonstração"
        >
          <HelpCircle className="w-3.5 h-3.5 text-[#adff2f]" />
          <span className="hidden sm:inline">Como Testar</span>
        </button>
      </div>

      {/* Full-Screen Welcome / Demonstration Guide Modal */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[120] flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-lg overflow-y-auto"
          >
            <motion.div
              initial={{ scale: 0.92, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.92, y: 20 }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
              className="relative w-full max-w-3xl bg-[#0d0d0d] border border-[#adff2f]/40 rounded-3xl p-5 sm:p-8 shadow-[0_0_50px_rgba(173,255,47,0.15)] my-auto max-h-[92vh] overflow-y-auto"
              style={{
                scrollbarWidth: 'thin',
                scrollbarColor: 'rgba(173,255,47,0.2) transparent'
              }}
            >
              {/* Close Button */}
              <button
                onClick={handleCloseModal}
                className="absolute top-5 right-5 p-2 text-gray-400 hover:text-white bg-white/5 hover:bg-white/10 rounded-full transition-all border border-white/10"
                aria-label="Fechar Guia"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Header Badge & Title */}
              <div className="mb-6">
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#adff2f]/10 border border-[#adff2f]/30 rounded-full text-[11px] font-black uppercase tracking-widest text-[#adff2f] mb-3">
                  <Sparkles className="w-3.5 h-3.5" />
                  Modelo de Demonstração Interativo
                </div>
                <h2 className="text-2xl sm:text-4xl font-black uppercase text-white tracking-tight leading-tight">
                  Seja Bem-Vindo ao <br className="hidden sm:block" />
                  <span className="text-[#adff2f]">Sistema para Estúdio de Tatuagem</span>
                </h2>
                <p className="text-sm text-gray-300 mt-2 leading-relaxed">
                  Este é um protótipo <strong className="text-white">100% navegável e funcional</strong>. Você pode testar como cliente final ou como dono do estúdio (administrador). Sinta-se livre para simular orçamentos, criar agendamentos e explorar todas as ferramentas!
                </p>
              </div>

              {/* What you can test - 4 Cards Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 mb-6">
                {/* Feature 1 */}
                <div className="bg-white/5 border border-white/10 hover:border-[#adff2f]/40 transition-colors p-4 rounded-2xl flex flex-col justify-between group">
                  <div>
                    <div className="w-9 h-9 rounded-xl bg-[#adff2f]/10 border border-[#adff2f]/30 flex items-center justify-center text-[#adff2f] mb-3">
                      <Sliders className="w-5 h-5" />
                    </div>
                    <h3 className="text-sm font-bold uppercase tracking-wider text-white mb-1.5 flex items-center gap-2">
                      1. Simulador & Orçamento
                    </h3>
                    <p className="text-xs text-gray-400 leading-relaxed">
                      Calcule o valor da tattoo em tempo real alterando estilo (Fine Line, Floral, etc.), tamanho em cm e parte do corpo.
                    </p>
                  </div>
                  <button
                    onClick={() => handleGoToClient('agendamento')}
                    className="mt-3 text-[11px] font-bold text-[#adff2f] uppercase tracking-wider flex items-center gap-1 hover:underline"
                  >
                    Testar Calculadora <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Feature 2 */}
                <div className="bg-white/5 border border-white/10 hover:border-[#adff2f]/40 transition-colors p-4 rounded-2xl flex flex-col justify-between group">
                  <div>
                    <div className="w-9 h-9 rounded-xl bg-[#9333ea]/10 border border-[#9333ea]/30 flex items-center justify-center text-[#c084fc] mb-3">
                      <Calendar className="w-5 h-5" />
                    </div>
                    <h3 className="text-sm font-bold uppercase tracking-wider text-white mb-1.5 flex items-center gap-2">
                      2. Agendamento com Anamnese
                    </h3>
                    <p className="text-xs text-gray-400 leading-relaxed">
                      Clique em um dia no calendário, preencha os dados de teste com termo de consentimento médico e trave a sessão.
                    </p>
                  </div>
                  <button
                    onClick={() => handleGoToClient('agendamento')}
                    className="mt-3 text-[11px] font-bold text-[#adff2f] uppercase tracking-wider flex items-center gap-1 hover:underline"
                  >
                    Simular Agendamento <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Feature 3 */}
                <div className="bg-white/5 border border-white/10 hover:border-[#9333ea]/40 transition-colors p-4 rounded-2xl flex flex-col justify-between group">
                  <div>
                    <div className="w-9 h-9 rounded-xl bg-[#9333ea]/10 border border-[#9333ea]/30 flex items-center justify-center text-[#c084fc] mb-3">
                      <LayoutDashboard className="w-5 h-5" />
                    </div>
                    <h3 className="text-sm font-bold uppercase tracking-wider text-white mb-1.5 flex items-center gap-2">
                      3. Painel do Tatuador (Admin)
                    </h3>
                    <p className="text-xs text-gray-400 leading-relaxed">
                      Veja a agenda organizada, confirme ou cancele sessões, e envie mensagens de pós-venda (aftercare) direto no WhatsApp.
                    </p>
                  </div>
                  <button
                    onClick={handleGoToAdmin}
                    className="mt-3 text-[11px] font-bold text-[#c084fc] uppercase tracking-wider flex items-center gap-1 hover:underline"
                  >
                    Abrir Painel Admin <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Feature 4 */}
                <div className="bg-white/5 border border-white/10 hover:border-red-500/40 transition-colors p-4 rounded-2xl flex flex-col justify-between group">
                  <div>
                    <div className="w-9 h-9 rounded-xl bg-red-500/10 border border-red-500/30 flex items-center justify-center text-red-400 mb-3">
                      <Package className="w-5 h-5" />
                    </div>
                    <h3 className="text-sm font-bold uppercase tracking-wider text-white mb-1.5 flex items-center gap-2">
                      4. Controle de Insumos & Alarme
                    </h3>
                    <p className="text-xs text-gray-400 leading-relaxed">
                      Gerencie agulhas, tintas e luvas. Se o estoque cair abaixo do mínimo, o sistema ativa um alarme visual na tela!
                    </p>
                  </div>
                  <button
                    onClick={handleGoToAdmin}
                    className="mt-3 text-[11px] font-bold text-red-400 uppercase tracking-wider flex items-center gap-1 hover:underline"
                  >
                    Ver Estoque no Admin <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Bottom Quick Test Banner & Actions */}
              <div className="bg-[#141414] border border-white/10 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="text-center sm:text-left">
                  <div className="text-xs font-bold text-white uppercase tracking-wider flex items-center justify-center sm:justify-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#adff2f]" />
                    Pronto para começar o teste?
                  </div>
                  <p className="text-[11px] text-gray-400 mt-1">
                    Você pode alternar entre a visão de cliente e admin a qualquer momento.
                  </p>
                </div>

                <div className="flex flex-wrap items-center justify-center gap-2 w-full sm:w-auto">
                  <button
                    onClick={handleSeedDemoData}
                    className="px-3.5 py-2.5 bg-white/5 hover:bg-white/10 border border-white/15 text-gray-300 hover:text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5"
                    title="Preenche a agenda e estoque com dados de demonstração prontos"
                  >
                    <RotateCcw className="w-3.5 h-3.5 text-[#adff2f]" />
                    Carregar Dados Demo
                  </button>

                  <button
                    onClick={() => handleGoToClient()}
                    className="px-5 py-2.5 bg-[#adff2f] hover:bg-white text-black font-black uppercase tracking-wider rounded-xl text-xs transition-all shadow-[0_0_20px_rgba(173,255,47,0.4)] flex items-center gap-2"
                  >
                    Começar pelo Site <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Helpful footer reminder */}
              <div className="mt-4 text-center">
                <span className="text-[10px] uppercase font-bold tracking-widest text-gray-500">
                  Dica: Use o menu flutuante no rodapé para alternar entre Cliente e Administrador a qualquer instante.
                </span>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
