import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useAppContext } from '../context/AppContext';
import { Appointment, WaitlistEntry } from '../store';
import { getDaysInMonth, MONTH_NAMES } from '../lib/calendar';
import { 
  Calendar as CalIcon, Clock, User, Phone, X, Zap, 
  MapPin, Star, ShieldCheck, CheckCircle2, ChevronDown, Instagram, AlertTriangle
} from 'lucide-react';

const CAROUSEL_IMAGES = [
  'https://images.unsplash.com/photo-1598371839696-5d5d2d0b501d?auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1568515045052-f9a854d70bfd?auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1611501275019-9b5cda994e8d?auto=format&fit=crop&q=80'
];

const GALLERY = [
  { id: 1, src: 'https://images.unsplash.com/photo-1562962230-16e4623d36e6?auto=format&fit=crop&q=80&w=800', style: 'Blackwork' },
  { id: 2, src: 'https://images.unsplash.com/photo-1605648916361-9bc12ad6a282?auto=format&fit=crop&q=80&w=800', style: 'Realismo' },
  { id: 3, src: 'https://images.unsplash.com/photo-1599839619722-39751411ea63?auto=format&fit=crop&q=80&w=800', style: 'Cyberpunk' },
  { id: 4, src: 'https://images.unsplash.com/photo-1615594951473-b8d99c4bd9cc?auto=format&fit=crop&q=80&w=800', style: 'Blackwork' },
  { id: 5, src: 'https://images.unsplash.com/photo-1588724128522-392da27ea59f?auto=format&fit=crop&q=80&w=800', style: 'Tradicional' },
  { id: 6, src: 'https://images.unsplash.com/photo-1612459284970-e8f0275cd17a?auto=format&fit=crop&q=80&w=800', style: 'Neon' },
  { id: 7, src: 'https://images.unsplash.com/photo-1590246814883-578ae10df6ed?auto=format&fit=crop&q=80&w=800', style: 'Realismo' },
  { id: 8, src: 'https://images.unsplash.com/photo-1550537687-c91072c4792d?auto=format&fit=crop&q=80&w=800', style: 'Fine Line' },
  { id: 9, src: 'https://images.unsplash.com/photo-1611501275019-9b5cda994e8d?auto=format&fit=crop&q=80&w=800', style: 'Cyberpunk' },
];

const REVIEWS = [
  { name: "Lucas R.", text: "Melhor traço da cidade. Estúdio impecável, biossegurança 100%. Recomendo de olhos fechados.", rating: 5 },
  { name: "Marina Silva", text: "Minha primeira tattoo e me deixaram super à vontade. O desenho ficou exatamente como imaginei, arte exclusiva mesmo.", rating: 5 },
  { name: "Thiago 'Caveira'", text: "Fechei o braço todo. Os caras são monstros no estilo Cyberpunk e Blackwork. Qualidade absurda.", rating: 5 },
];

const FAQS = [
  { q: "A tatuagem dói muito?", a: "O nível de dor varia de acordo com a área do corpo e tolerância pessoal, mas nossos profissionais utilizam técnicas modernas que reduzem consideravelmente o desconforto e o tempo de sessão." },
  { q: "Vocês criam desenhos exclusivos?", a: "Sim! Não fazemos cópias. Após o agendamento, nossa equipe cria uma arte 100% personalizada baseada nas suas referências e estilo." },
  { q: "Quais são as formas de pagamento?", a: "Aceitamos PIX, cartões de crédito (parcelamos em até 12x) e débito. Um sinal é necessário para garantir seu horário na agenda." },
  { q: "Quais os cuidados pós-tatuagem?", a: "Você receberá um guia completo em PDF após a sessão. Trabalhamos apenas com plásticos curativos de alta tecnologia (tipo dermalize) que facilitam muito a cicatrização inicial." }
];

export function ClientView() {
  const { state, updateState } = useAppContext();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [filter, setFilter] = useState('Todos');
  const [lightboxImg, setLightboxImg] = useState<string | null>(null);
  const [scrolled, setScrolled] = useState(false);
  const [faqOpen, setFaqOpen] = useState<number | null>(null);
  const [referenceImage, setReferenceImage] = useState<string | null>(null);
  
  // Pricing Engine logic
  const [tattooStyle, setTattooStyle] = useState('Fine Line');
  const [tattooSize, setTattooSize] = useState(10);
  const [tattooComplexity, setTattooComplexity] = useState('Só Traço');
  const [tattooBodyPart, setTattooBodyPart] = useState('Braço/Antebraço');
  
  const STYLE_WEIGHTS: Record<string, number> = {
    'Blackwork': 1.0,
    'Fine Line': 1.2,
    'Floral': 1.1,
    'Realismo': 2.0,
    'Old School': 1.1,
    'Cyberpunk': 1.5,
    'Neon': 1.5,
    'Tradicional': 1.0
  };
  const COMPLEXITY_WEIGHTS: Record<string, number> = {
    'Só Traço': 1.0,
    'Sombreada': 1.5,
    'Colorida': 2.0
  };
  const BODY_WEIGHTS: Record<string, number> = {
    'Braço/Antebraço': 1.0,
    'Perna/Panturrilha': 1.0,
    'Costas': 1.2,
    'Costela': 1.3, // Pain/Difficulty factor
    'Pescoço': 1.4,
    'Mãos/Dedos': 1.3,
    'Peito': 1.2
  };
  
  const estimatedPrice = (tattooSize * 15) * (STYLE_WEIGHTS[tattooStyle] || 1) * (COMPLEXITY_WEIGHTS[tattooComplexity] || 1) * (BODY_WEIGHTS[tattooBodyPart] || 1);

  // Date logic
  const today = new Date();
  const [calMonth, setCalMonth] = useState(today.getMonth());
  const [calYear, setCalYear] = useState(today.getFullYear());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % CAROUSEL_IMAGES.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) { // limit 2MB
         alert('A imagem é muito grande. Escolha uma imagem de até 2MB.');
         e.target.value = '';
         return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setReferenceImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const days = getDaysInMonth(calYear, calMonth);
  const filteredGallery = filter === 'Todos' ? GALLERY : GALLERY.filter(img => img.style === filter);
  const categories = ['Todos', ...Array.from(new Set(GALLERY.map(item => item.style)))];

  const handleBooking = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const time = formData.get('time') as string;
    
    // Check if slot is taken
    const isTaken = state.appointments.some(a => a.date === selectedDate && a.time === time);
    if (isTaken) {
      alert('Este horário já está ocupado!');
      return;
    }

    const newAppointment: Appointment = {
      id: Math.random().toString(36).substring(7),
      date: selectedDate!,
      time,
      clientName: formData.get('name') as string,
      phone: formData.get('phone') as string,
      referenceImage: referenceImage || undefined,
      tattooStyle,
      tattooSizeCm: tattooSize,
      tattooComplexity,
      bodyPart: tattooBodyPart,
      estimatedPrice,
      status: 'Pendente',
      anamnesis: {
        allergies: formData.get('allergies') as string || 'Nenhuma',
        medicalConditions: formData.get('medicalConditions') as string || 'Nenhuma',
        consent: formData.get('consent') === 'on'
      }
    };
    
    updateState(s => ({
      ...s,
      appointments: [...s.appointments, newAppointment]
    }));
    
    alert('Sessão solicitada com sucesso! Entraremos em contato via WhatsApp para confirmar o sinal.');
    setSelectedDate(null);
    setReferenceImage(null);
  };

  const handleWaitlist = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const newEntry: WaitlistEntry = {
      id: Math.random().toString(36).substring(7),
      clientName: formData.get('waitlist_name') as string,
      phone: formData.get('waitlist_phone') as string,
      style: tattooStyle,
      addedAt: new Date().toISOString()
    };
    
    updateState(s => ({
      ...s,
      waitlist: [...(s.waitlist || []), newEntry]
    }));
    alert('Você entrou para a Fila VIP! Se um horário vagar, você será o primeiro a saber.');
    const form = e.target as HTMLFormElement;
    form.reset();
  };

  const handleNextMonth = () => {
    if (calMonth === 11) {
      setCalMonth(0);
      setCalYear(y => y + 1);
    } else {
      setCalMonth(m => m + 1);
    }
  };

  const handlePrevMonth = () => {
    if (calMonth === 0) {
      setCalMonth(11);
      setCalYear(y => y - 1);
    } else {
      setCalMonth(m => m - 1);
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white font-sans scroll-smooth overflow-x-hidden">
      
      {/* Header PRO */}
      <nav className={`fixed top-0 w-full z-50 transition-all duration-300 ${scrolled ? 'glass border-b border-light/5 py-4 bg-black/80 backdrop-blur-md border-b border-white/5' : 'bg-transparent py-6'}`}>
        <div className="max-w-7xl mx-auto px-6 flex justify-between items-center">
          <div className="text-2xl font-black tracking-tighter text-white italic flex items-center gap-2">
            ORTIZ<span className="text-[#adff2f]">TATTOO</span>
          </div>
          
          <div className="hidden md:flex items-center gap-8 text-sm uppercase tracking-widest font-bold text-gray-400">
            <a href="#sobre" className="hover:text-white transition-colors">Sobre</a>
            <a href="#galeria" className="hover:text-white transition-colors">Galeria</a>
            <a href="#avaliacoes" className="hover:text-white transition-colors">Avaliações</a>
            <a href="#faq" className="hover:text-white transition-colors">Dúvidas</a>
            <a href="#/dashboard" className="text-zinc-600 hover:text-zinc-300 transition-colors flex items-center gap-1" title="Acesso Interno CEO"><Zap className="w-4 h-4"/> Admin</a>
          </div>

          <a href="#agendamento" className="hidden sm:inline-block px-6 py-2.5 bg-[#adff2f] text-black font-black uppercase text-sm rounded-full hover:scale-105 transition-transform shadow-[0_0_15px_rgba(173,255,47,0.3)]">
            Agendar Sessão
          </a>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="relative min-h-screen w-full flex flex-col justify-center pt-32 pb-20">
        <div className="absolute inset-0 z-0">
          <AnimatePresence mode="wait">
            <motion.img
              key={currentImageIndex}
              src={CAROUSEL_IMAGES[currentImageIndex]}
              initial={{ opacity: 0, scale: 1.05 }}
              animate={{ opacity: 0.4, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1.5 }}
              className="w-full h-full object-cover"
            />
          </AnimatePresence>
          <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-[#050505]/40 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#050505] via-transparent to-transparent" />
        </div>
        
        <div className="relative z-10 max-w-7xl mx-auto px-6 w-full mt-6 sm:mt-12">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-3xl"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/5 border border-white/10 rounded-full mb-6 text-xs font-bold uppercase tracking-widest text-[#adff2f]">
              <Star className="w-4 h-4 fill-current" />
              Estúdio Conceito de Alto Padrão
            </div>
            
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-black uppercase tracking-tighter mb-6 leading-none pt-4">
              Transforme <br/>
              Sua Ideia <br/>
              Em <span className="neon-text-lime italic text-[#adff2f]">Tradição.</span>
            </h1>
            
            <p className="text-gray-400 text-lg md:text-xl font-medium max-w-xl mb-10 border-l-4 border-[#9333ea] pl-4">
              Referência em traços finos e florais delicados. Artes 100% exclusivas, materiais premium e biossegurança máxima para eternizar sua arte na pele.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <a href="#agendamento" className="px-8 py-4 bg-[#adff2f] text-black font-black uppercase tracking-widest text-center rounded-lg hover:bg-white hover:shadow-[0_0_30px_rgba(173,255,47,0.5)] transition-all flex items-center justify-center gap-2">
                <CalIcon className="w-5 h-5"/>
                Garantir meu horário
              </a>
              <a href="#galeria" className="px-8 py-4 glass border border-white/10 text-white font-bold uppercase tracking-widest text-center rounded-lg hover:bg-white/10 transition-all bg-black/40 backdrop-blur-md">
                Ver Trabalhos
              </a>
            </div>

            <div className="mt-12 flex items-center gap-6">
               <div className="flex -space-x-4">
                 <img className="w-10 h-10 rounded-full border-2 border-black object-cover" src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=100"/>
                 <img className="w-10 h-10 rounded-full border-2 border-black object-cover" src="https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80&w=100"/>
                 <img className="w-10 h-10 rounded-full border-2 border-black object-cover" src="https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&q=80&w=100"/>
                 <div className="w-10 h-10 rounded-full border-2 border-black bg-[#9333ea] flex items-center justify-center text-xs font-bold">+5k</div>
               </div>
               <div className="text-sm">
                 <div className="flex gap-1 text-[#adff2f] mb-1">
                   <Star className="w-4 h-4 fill-current"/><Star className="w-4 h-4 fill-current"/><Star className="w-4 h-4 fill-current"/><Star className="w-4 h-4 fill-current"/><Star className="w-4 h-4 fill-current"/>
                 </div>
                 <span className="text-gray-400 font-bold uppercase tracking-wider text-[10px]">Peles Marcadas no Último Ano</span>
               </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* About & Trust Indicators */}
      <motion.section 
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.8 }}
        id="sobre" 
        className="py-24 px-6 bg-[#080808] border-y border-white/5 relative overflow-hidden"
      >
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-[0.02] pointer-events-none">
          <Zap className="w-[800px] h-[800px] text-[#adff2f]" />
        </div>
        
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="glass neon-border-purple rounded-2xl p-8 transform hover:-translate-y-3 transition-all duration-[0.4s] bg-black/40 shadow-xl hover:shadow-[0_0_30px_rgba(147,51,234,0.2)] hover:border-[#9333ea]/50">
              <ShieldCheck className="w-12 h-12 text-[#9333ea] mb-6 drop-shadow-[0_0_15px_rgba(147,51,234,0.5)]" />
              <h3 className="text-xl font-bold uppercase tracking-widest mb-3">Biossegurança</h3>
              <p className="text-gray-400 text-sm leading-relaxed group-hover:text-gray-300 transition-colors">Materiais 100% descartáveis e esterilizados. Cumprimos todas as rigorosas normas da Anvisa para garantir sua saúde.</p>
            </div>
            <div className="glass border border-white/10 rounded-2xl p-8 transform hover:-translate-y-3 transition-all duration-[0.4s] bg-black/40 shadow-xl border-l-[1px] border-l-[#adff2f] hover:shadow-[0_0_30px_rgba(173,255,47,0.15)] hover:border-[#adff2f]/50">
              <Star className="w-12 h-12 text-[#adff2f] mb-6 drop-shadow-[0_0_15px_rgba(173,255,47,0.5)]" />
              <h3 className="text-xl font-bold uppercase tracking-widest mb-3 text-[#adff2f]">Arte Exclusiva</h3>
              <p className="text-gray-400 text-sm leading-relaxed group-hover:text-gray-300 transition-colors">Sua pele não é caderno de rascunho de Pinterest. Desenvolvemos designs únicos focados na anatomia do seu corpo.</p>
            </div>
            <div className="glass border border-white/10 rounded-2xl p-8 transform hover:-translate-y-3 transition-all duration-[0.4s] bg-black/40 shadow-xl hover:shadow-[0_0_30px_rgba(147,51,234,0.2)] hover:border-[#9333ea]/50">
              <Zap className="w-12 h-12 text-[#9333ea] mb-6 drop-shadow-[0_0_15px_rgba(147,51,234,0.5)]" />
              <h3 className="text-xl font-bold uppercase tracking-widest mb-3">Traços & Flores</h3>
              <p className="text-gray-400 text-sm leading-relaxed group-hover:text-gray-300 transition-colors">Especialidade máxima em traços ultra finos (Fine Line) e florais realistas ou minimalistas, criados sob medida para cada cliente.</p>
            </div>
          </div>
        </div>
      </motion.section>

      {/* Flash Arts Drop Section */}
      <motion.section 
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.8 }}
        id="drops" 
        className="py-24 px-6 max-w-7xl mx-auto"
      >
        <div className="flex flex-col md:flex-row justify-between items-end mb-12 border-b border-white/10 pb-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-red-500/10 border border-red-500/20 text-red-500 rounded-full mb-4 text-[10px] font-bold uppercase tracking-widest fill-current animate-pulse">
              <Zap className="w-3 h-3" /> Drop Exclusivo
            </div>
            <h2 className="text-4xl md:text-5xl font-black uppercase text-white tracking-tighter">
              Flash <span className="text-[#9333ea]">Arts</span>
            </h2>
          </div>
          <p className="text-sm font-bold uppercase tracking-widest text-gray-500 max-w-xs text-right mt-4 md:mt-0">Desenhos únicos. Quem pegar primeiro, levou. Não repetimos essas artes.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
          {(state.flashArts || []).map((art: any) => (
            <div key={art.id} className="group relative overflow-hidden rounded-2xl bg-[#080808] border border-white/5 hover:border-[#9333ea]/50 transition-colors">
              <div className="aspect-square w-full overflow-hidden">
                <img src={art.src} alt={art.name} className={`w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 ${!art.available ? 'grayscale opacity-50' : ''}`} />
              </div>
              <div className="p-5 relative z-10 bg-black/80 backdrop-blur-md">
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-bold text-white uppercase tracking-widest text-sm">{art.name}</h4>
                  <span className="text-[#adff2f] font-mono text-sm font-bold">R${art.price}</span>
                </div>
                {art.available ? (
                  <button 
                    onClick={() => window.open(`https://wa.me/5511999999999?text=Salve!%20Quero%20reivindicar%20o%20Drop%20Flash%20Art:%20${encodeURIComponent(art.name)}`, '_blank')}
                    className="w-full mt-4 py-2 border border-[#adff2f] text-[#adff2f] text-[10px] font-black uppercase tracking-widest hover:bg-[#adff2f] hover:text-black transition-colors rounded-lg"
                  >
                    Reivindicar Arte
                  </button>
                ) : (
                  <button disabled className="w-full mt-4 py-2 bg-white/5 text-gray-600 text-[10px] font-black uppercase tracking-widest cursor-not-allowed rounded-lg">
                    Esgotado
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </motion.section>

      {/* Gallery Section */}
      <motion.section 
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.8 }}
        id="galeria" 
        className="py-24 px-6 max-w-7xl mx-auto"
      >
        <div className="text-center mb-16">
          <p className="text-sm font-bold uppercase tracking-widest text-[#9333ea] mb-2 pl-4 border-l-2 border-[#9333ea] inline-block">Portfólio de Alta Qualidade</p>
          <h2 className="text-4xl md:text-5xl font-black uppercase text-white tracking-tighter">Nosso <span className="text-[#adff2f]">Trabalho</span></h2>
          <p className="text-gray-400 mt-4 max-w-2xl mx-auto leading-relaxed">Do rascunho até a última passada de máquina. Artes projetadas que não desbotam e que mantêm o seu extremo contraste ao longo dos anos.</p>
        </div>

        <div className="flex gap-2 overflow-x-auto pb-6 hide-scrollbar justify-center mb-8">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setFilter(cat)}
              className={`px-6 py-2 rounded-full text-xs uppercase tracking-widest font-bold transition-all whitespace-nowrap ${
                filter === cat 
                  ? 'bg-[#adff2f] text-black shadow-[0_0_15px_rgba(173,255,47,0.3)] border border-[#adff2f]' 
                  : 'glass border border-white/10 text-gray-400 hover:text-white bg-black/40' // Using bento class glass
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 auto-rows-min sm:auto-rows-[300px]">
          <AnimatePresence>
            {filteredGallery.map((item, i) => {
              // Creating a dynamic bento-like grid based on the index position
              let spanClasses = "col-span-1 row-span-1 aspect-[4/5] sm:aspect-auto";
              
              // Only apply bento variations if "Todos" filter is active or enough items
              if (filteredGallery.length > 3) {
                 if (i % 6 === 0) spanClasses = "sm:col-span-2 sm:row-span-2 aspect-square sm:aspect-auto"; // Big block
                 else if (i % 6 === 3) spanClasses = "sm:col-span-2 sm:row-span-1 aspect-video sm:aspect-auto"; // Wide block
              }

              return (
                <motion.div
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  key={item.id}
                  className={`group relative overflow-hidden rounded-2xl cursor-pointer neon-border-purple transition-all duration-[0.4s] ${spanClasses}`}
                  onClick={() => setLightboxImg(item.src)}
                >
                  <img src={item.src} alt={item.style} className="w-full h-full object-cover group-hover:scale-110 group-hover:opacity-50 transition-all duration-[0.8s]" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-[0.4s]"></div>
                  <div className="absolute bottom-6 left-6 translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-[0.4s]">
                    <span className="text-white font-black tracking-widest uppercase text-sm border-l-4 border-[#adff2f] pl-3">
                      {item.style}
                    </span>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      </motion.section>

      {/* Testimonials */}
      <motion.section 
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.8 }}
        id="avaliacoes" 
        className="py-24 px-6 bg-[#080808] border-y border-white/5 relative bg-grid"
      >
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
             <h2 className="text-4xl md:text-5xl font-black uppercase text-white tracking-tighter">Ouvindo as <span className="text-[#9333ea]">Ruas</span></h2>
             <p className="text-gray-400 mt-4 max-w-2xl mx-auto leading-relaxed">Não acredite apenas na nossa palavra. Veja o que quem realmente deitou na nossa maca tem a dizer sobre os resultados.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {REVIEWS.map((review, i) => (
              <div key={i} className="glass border border-white/10 rounded-2xl p-8 relative bg-black/60 backdrop-blur-xl hover:-translate-y-3 hover:border-[#adff2f]/50 hover:shadow-[0_0_30px_rgba(173,255,47,0.15)] transition-all duration-[0.4s] group">
                <div className="absolute -top-4 -left-4 text-6xl text-[#adff2f] opacity-20 font-serif group-hover:opacity-40 transition-opacity duration-[0.4s]">"</div>
                <div className="flex gap-1 mb-4">
                  {[...Array(review.rating)].map((_, j) => <Star key={j} className="w-4 h-4 text-[#adff2f] fill-current drop-shadow-[0_0_5px_rgba(173,255,47,0.5)]"/>)}
                </div>
                <p className="text-gray-300 text-sm mb-6 relative z-10 italic leading-relaxed group-hover:text-white transition-colors duration-[0.4s]">"{review.text}"</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#9333ea] to-[#050505] flex items-center justify-center font-bold text-sm border border-white/10 group-hover:border-[#9333ea]/50 group-hover:shadow-[0_0_15px_rgba(147,51,234,0.3)] transition-all duration-[0.4s]">
                    {review.name.charAt(0)}
                  </div>
                  <div>
                    <p className="font-bold text-sm text-white">{review.name}</p>
                    <p className="text-[10px] text-[#adff2f] uppercase tracking-widest font-bold drop-shadow-[0_0_5px_rgba(173,255,47,0.3)]">Cliente Verificado</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* Scheduling Section (Conversion Focused) */}
      <motion.section 
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.8 }}
        id="agendamento" 
        className="py-24 px-6 bg-[#030303] relative border-t border-white/5"
      >
        <div className="absolute top-1/2 left-0 w-64 h-64 bg-[#adff2f] opacity-5 blur-[120px] rounded-full pointer-events-none"></div>

        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-red-500/10 border border-red-500/20 text-red-400 rounded-full mb-6 text-xs font-bold uppercase tracking-widest animate-pulse">
              <AlertTriangle className="w-4 h-4" />
              Vagas Limitadas Neste Mês
            </div>
            <h2 className="text-4xl md:text-5xl font-black uppercase text-white tracking-tighter leading-tight">
              Motor de <span className="text-[#adff2f] neon-text-lime italic">Orçamento</span> & Agenda
            </h2>
            <p className="text-gray-400 mt-4 max-w-2xl mx-auto text-sm leading-relaxed">
              Simule o valor no passo 1 e depois no passo 2 escolha o seu horário livre no calendário. Valores e turnos sujeitos à aprovação do estúdio.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start relative z-10">
            
            <div className="glass neon-border-purple rounded-2xl p-8 bg-black/60 shadow-2xl relative">
              <div className="flex items-center justify-between border-b border-white/10 pb-6 mb-6">
                 <h3 className="text-xl font-black uppercase text-white tracking-widest">1. Orçamento</h3>
                 <Zap className="w-6 h-6 text-[#9333ea]" />
              </div>
              
              <div className="space-y-6">
                <div>
                  <label className="block text-xs uppercase font-bold tracking-widest text-[#9333ea] mb-3">Estilo da Arte</label>
                  <div className="grid grid-cols-2 gap-2">
                    {Object.keys(STYLE_WEIGHTS).map(style => (
                       <button
                         key={style}
                         type="button"
                         onClick={() => setTattooStyle(style)}
                         className={`py-2 text-xs font-bold uppercase rounded-xl transition-all border ${tattooStyle === style ? 'bg-[#9333ea] text-white border-[#9333ea]' : 'bg-black/60 text-gray-500 border-white/10 hover:border-white/30'}`}
                       >
                         {style}
                       </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="flex justify-between items-center text-xs uppercase font-bold tracking-widest text-[#9333ea] mb-3">
                    <span>Tamanho em Centímetros</span>
                    <span className="text-white bg-white/10 px-2 py-1 rounded">{tattooSize} cm</span>
                  </label>
                  <input 
                    type="range" 
                    min="5" max="50" step="1"
                    value={tattooSize}
                    onChange={(e) => setTattooSize(Number(e.target.value))}
                    className="w-full accent-[#9333ea] bg-gray-800 rounded-lg appearance-none h-2 cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-gray-500 mt-2 font-bold font-mono">
                    <span>5cm</span><span>50cm</span>
                  </div>
                </div>

                <div>
                  <label className="block text-xs uppercase font-bold tracking-widest text-[#9333ea] mb-3">Preenchimento / Complexidade</label>
                  <div className="grid grid-cols-3 gap-2">
                    {Object.keys(COMPLEXITY_WEIGHTS).map(comp => (
                       <button
                         key={comp}
                         type="button"
                         onClick={() => setTattooComplexity(comp)}
                         className={`py-2 text-[10px] sm:text-xs font-bold uppercase rounded-xl transition-all border ${tattooComplexity === comp ? 'bg-[#9333ea] text-white border-[#9333ea]' : 'bg-black/60 text-gray-500 border-white/10 hover:border-white/30'}`}
                       >
                         {comp}
                       </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs uppercase font-bold tracking-widest text-[#adff2f] mb-3 text-center">Mapa Anatômico</label>
                  
                  <div className="flex flex-col items-center gap-1.5 p-4 bg-black/40 border border-white/5 rounded-2xl relative">
                    <div className="absolute top-2 left-3 text-[10px] text-gray-500 font-mono uppercase">Select Part</div>
                    <div className="absolute top-2 right-3 text-[10px] text-[#adff2f] font-mono uppercase">{tattooBodyPart}</div>
                    
                    {/* Head */}
                    <button 
                       type="button"
                       onClick={() => setTattooBodyPart('Pescoço')}
                       className={`w-12 h-14 rounded-full border-2 transition-all ${tattooBodyPart === 'Pescoço' ? 'bg-[#adff2f] border-[#adff2f] shadow-[0_0_15px_rgba(173,255,47,0.5)]' : 'bg-[#111] border-white/10 hover:border-[#adff2f]/50'}`}
                       title="Cabeça/Pescoço"
                    />

                    {/* Torso & Arms */}
                    <div className="flex gap-1.5 items-start">
                       {/* Left Arm */}
                       <div className="flex flex-col gap-1.5 pt-2">
                         <button 
                           type="button" 
                           onClick={() => setTattooBodyPart('Braço/Antebraço')} 
                           className={`w-8 h-20 rounded-full border-2 transition-all ${tattooBodyPart === 'Braço/Antebraço' ? 'bg-[#adff2f] border-[#adff2f] shadow-[0_0_15px_rgba(173,255,47,0.5)]' : 'bg-[#111] border-white/10 hover:border-[#adff2f]/50'}`}
                         />
                         <button 
                           type="button" 
                           onClick={() => setTattooBodyPart('Mãos/Dedos')} 
                           className={`w-8 h-10 rounded-full border-2 transition-all mx-auto ${tattooBodyPart === 'Mãos/Dedos' ? 'bg-[#adff2f] border-[#adff2f] shadow-[0_0_15px_rgba(173,255,47,0.5)]' : 'bg-[#111] border-white/10 hover:border-[#adff2f]/50'}`}
                         />
                       </div>

                       {/* Torso Area */}
                       <div className="flex flex-col gap-1.5 w-24">
                          <button 
                             type="button" 
                             onClick={() => setTattooBodyPart('Peito')} 
                             className={`w-full h-16 rounded-xl border-2 transition-all flex items-center justify-center text-[8px] uppercase font-bold ${tattooBodyPart === 'Peito' ? 'bg-[#adff2f] border-[#adff2f] text-black shadow-[0_0_15px_rgba(173,255,47,0.5)]' : 'bg-[#111] border-white/10 text-gray-600 hover:border-[#adff2f]/50'}`}
                          >Peito</button>
                          <div className="flex gap-1.5 h-16">
                             <button 
                               type="button" 
                               onClick={() => setTattooBodyPart('Costela')} 
                               className={`w-6 h-full rounded-l-xl border-2 transition-all flex items-center justify-center [writing-mode:vertical-rl] text-[8px] uppercase font-bold ${tattooBodyPart === 'Costela' ? 'bg-[#adff2f] border-[#adff2f] text-black shadow-[0_0_15px_rgba(173,255,47,0.5)]' : 'bg-[#111] border-white/10 text-gray-600 hover:border-[#adff2f]/50'}`}
                             >Cost</button>
                             <button 
                               type="button" 
                               onClick={() => setTattooBodyPart('Costas')} 
                               className={`flex-1 h-full rounded-sm border-2 transition-all flex items-center justify-center text-[8px] uppercase font-bold ${tattooBodyPart === 'Costas' ? 'bg-[#adff2f] border-[#adff2f] text-black shadow-[0_0_15px_rgba(173,255,47,0.5)]' : 'bg-[#111] border-white/10 text-gray-600 hover:border-[#adff2f]/50'}`}
                             >Costas</button>
                             <button 
                               type="button" 
                               onClick={() => setTattooBodyPart('Costela')} 
                               className={`w-6 h-full rounded-r-xl border-2 transition-all flex items-center justify-center [writing-mode:vertical-rl] text-[8px] uppercase font-bold ${tattooBodyPart === 'Costela' ? 'bg-[#adff2f] border-[#adff2f] text-black shadow-[0_0_15px_rgba(173,255,47,0.5)]' : 'bg-[#111] border-white/10 text-gray-600 hover:border-[#adff2f]/50'}`}
                             >Cost</button>
                          </div>
                          <button 
                               type="button" 
                               onClick={() => setTattooBodyPart('Costas')} 
                               className={`w-full h-8 rounded-b-xl border-2 transition-all flex items-center justify-center text-[7px] uppercase font-bold ${tattooBodyPart === 'Costas' ? 'bg-[#adff2f] border-[#adff2f] text-black shadow-[0_0_15px_rgba(173,255,47,0.5)]' : 'bg-[#111] border-white/10 hover:border-[#adff2f]/50 text-gray-700'}`}
                             >Abd</button>
                       </div>

                       {/* Right Arm */}
                       <div className="flex flex-col gap-1.5 pt-2">
                         <button 
                           type="button" 
                           onClick={() => setTattooBodyPart('Braço/Antebraço')} 
                           className={`w-8 h-20 rounded-full border-2 transition-all ${tattooBodyPart === 'Braço/Antebraço' ? 'bg-[#adff2f] border-[#adff2f] shadow-[0_0_15px_rgba(173,255,47,0.5)]' : 'bg-[#111] border-white/10 hover:border-[#adff2f]/50'}`}
                         />
                         <button 
                           type="button" 
                           onClick={() => setTattooBodyPart('Mãos/Dedos')} 
                           className={`w-8 h-10 rounded-full border-2 transition-all mx-auto ${tattooBodyPart === 'Mãos/Dedos' ? 'bg-[#adff2f] border-[#adff2f] shadow-[0_0_15px_rgba(173,255,47,0.5)]' : 'bg-[#111] border-white/10 hover:border-[#adff2f]/50'}`}
                         />
                       </div>
                    </div>

                    {/* Legs */}
                    <div className="flex gap-2 mt-1">
                       <button 
                         type="button" 
                         onClick={() => setTattooBodyPart('Perna/Panturrilha')} 
                         className={`w-11 h-28 rounded-xl border-2 transition-all ${tattooBodyPart === 'Perna/Panturrilha' ? 'bg-[#adff2f] border-[#adff2f] shadow-[0_0_15px_rgba(173,255,47,0.5)]' : 'bg-[#111] border-white/10 hover:border-[#adff2f]/50'}`}
                       />
                       <button 
                         type="button" 
                         onClick={() => setTattooBodyPart('Perna/Panturrilha')} 
                         className={`w-11 h-28 rounded-xl border-2 transition-all ${tattooBodyPart === 'Perna/Panturrilha' ? 'bg-[#adff2f] border-[#adff2f] shadow-[0_0_15px_rgba(173,255,47,0.5)]' : 'bg-[#111] border-white/10 hover:border-[#adff2f]/50'}`}
                       />
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-8 relative overflow-hidden bg-black/80 rounded-2xl border-2 border-[#adff2f]/30 p-6 shadow-[0_0_30px_rgba(173,255,47,0.1)] flex flex-col items-center transition-all hover:border-[#adff2f]/60 hover:shadow-[0_0_40px_rgba(173,255,47,0.2)]">
                 <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-[#adff2f] opacity-[0.05] blur-[50px] rounded-full pointer-events-none group-hover:opacity-20 animate-pulse"></div>
                 
                 <div className="flex items-center gap-2 mb-1 text-[#adff2f]">
                    <Zap className="w-5 h-5 animate-pulse"/>
                    <h3 className="text-sm font-black uppercase tracking-widest leading-none mt-1">O Oráculo</h3>
                 </div>
                 <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-6">Simulador em Tempo Real</p>

                 <div className="w-full grid grid-cols-2 gap-2 mb-4 relative z-10">
                    <div className="flex flex-col bg-black p-3 rounded-xl border border-white/5 text-[10px] font-mono uppercase text-center">
                       <span className="text-gray-600 mb-1">Dimensão</span>
                       <span className="text-white font-bold">{tattooSize}cm</span>
                    </div>
                    <div className="flex flex-col bg-black p-3 rounded-xl border border-white/5 text-[10px] font-mono uppercase text-center">
                       <span className="text-gray-600 mb-1">Nível</span>
                       <span className="text-white font-bold">{tattooComplexity}</span>
                    </div>
                 </div>
                 
                 <div className="text-4xl sm:text-5xl font-black text-[#adff2f] mt-2 mb-2 drop-shadow-[0_0_15px_rgba(173,255,47,0.5)] transition-all relative z-10">
                  R$ {estimatedPrice.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                 </div>
                 <p className="text-[9px] text-gray-600 uppercase tracking-widest font-bold text-center relative z-10 mt-2">*Orçamento volátil. Ajustes na etapa de decalque.</p>
              </div>
            </div>

            <div className="w-full">
              <div className="glass neon-border-lime rounded-2xl p-6 md:p-8 bg-black/60 backdrop-blur-xl shadow-2xl relative">
                <div className="absolute top-0 right-0 w-32 h-32 bg-[#adff2f] opacity-5 blur-[50px] rounded-full pointer-events-none"></div>

                <div className="flex justify-between items-center mb-8 relative z-10">
                  <h3 className="text-xl font-black uppercase text-white tracking-widest">2. Escolher Data</h3>
                  <div className="flex gap-2">
                    <button onClick={handlePrevMonth} className="p-2 bg-white/5 hover:bg-white/10 rounded-xl text-gray-400 hover:text-white transition-colors">«</button>
                    <button onClick={handleNextMonth} className="p-2 bg-white/5 hover:bg-white/10 rounded-xl text-gray-400 hover:text-white transition-colors">»</button>
                  </div>
                </div>
                <div className="text-center font-bold uppercase tracking-widest text-[#adff2f] mb-4 text-sm">
                  {MONTH_NAMES[calMonth]} {calYear}
                </div>

                <div className="grid grid-cols-7 gap-2 text-center text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-4 relative z-10">
                  <div>Dom</div><div>Seg</div><div>Ter</div><div>Qua</div><div>Qui</div><div>Sex</div><div>Sáb</div>
                </div>

                <div className="grid grid-cols-7 gap-2 relative z-10">
                  {days.map((day, i) => {
                    if (!day) return <div key={`empty-${i}`} className="aspect-square" />;
                    
                    const isLiberado = state.scheduleDays[day] === 'Liberado';
                    const dayNum = parseInt(day.slice(-2), 10);
                    
                    return (
                      <button
                        key={day}
                        disabled={!isLiberado}
                        onClick={() => setSelectedDate(day)}
                        className={`aspect-square flex items-center justify-center rounded-xl text-sm font-bold transition-all ${
                          isLiberado 
                            ? 'bg-[#adff2f] text-black hover:scale-110 hover:shadow-[0_0_15px_rgba(173,255,47,0.5)] cursor-pointer z-10' 
                            : 'bg-black/80 text-gray-700 border border-white/5 cursor-not-allowed'
                        }`}
                      >
                        {dayNum}
                      </button>
                    );
                  })}
                </div>
                
                <div className="mt-8 pt-6 border-t border-white/10 flex justify-center gap-6 text-[10px] sm:text-xs font-bold uppercase tracking-widest text-gray-400 relative z-10">
                  <div className="flex items-center gap-2"><div className="w-3 h-3 rounded bg-[#adff2f] shadow-[0_0_8px_#adff2f]"></div> Data Livre</div>
                  <div className="flex items-center gap-2"><div className="w-3 h-3 rounded bg-black border border-white/10"></div> Ocupado</div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </motion.section>

      {/* Waitlist Section */}
      <section id="fila-espera" className="py-24 px-6 relative bg-[#050505]">
        <div className="max-w-3xl mx-auto items-center text-center">
          <div className="glass neon-border-purple rounded-3xl p-10 bg-black/60 shadow-2xl relative overflow-hidden">
             <div className="absolute top-0 right-0 w-64 h-64 bg-[#9333ea] opacity-10 blur-[100px] rounded-full pointer-events-none"></div>
             
             <h2 className="text-3xl font-black uppercase text-white tracking-tighter mb-4 relative z-10">Agenda Fechada? <br/><span className="text-[#9333ea]">Fila VIP.</span></h2>
             <p className="text-gray-400 text-sm mb-8 max-w-md mx-auto relative z-10">
               Se o mês estourou e você precisa da tatuagem com o melhor, entre na nossa fila de espera VIP. Você será o primeiro a ser notificado em caso de desistências.
             </p>
             
             <form onSubmit={handleWaitlist} className="flex flex-col sm:flex-row gap-4 relative z-10 max-w-xl mx-auto">
                <input required name="waitlist_name" type="text" placeholder="Nome" className="flex-1 px-4 py-3 text-sm font-bold rounded-xl bg-white/5 border border-white/10 focus:border-[#9333ea] text-white focus:outline-none" />
                <input required name="waitlist_phone" type="tel" placeholder="WhatsApp" className="flex-1 px-4 py-3 text-sm font-bold rounded-xl bg-white/5 border border-white/10 focus:border-[#9333ea] text-white focus:outline-none" />
                <button type="submit" className="px-6 py-3 bg-[#9333ea] text-white font-black uppercase tracking-widest rounded-xl hover:bg-white hover:text-[#9333ea] transition-all whitespace-nowrap shadow-[0_0_20px_rgba(147,51,234,0.3)]">Entrar na Fila</button>
             </form>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="py-24 px-6 bg-[#080808] border-t border-white/5 relative bg-grid">
        
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-[#9333ea] opacity-5 blur-[100px] rounded-full pointer-events-none translate-y-1/2 -translate-x-1/2"></div>
        
        <div className="max-w-3xl mx-auto relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-black uppercase text-white tracking-tighter">Ainda com <span className="text-[#9333ea] neon-text-purple">Dúvidas?</span></h2>
            <p className="text-gray-400 mt-4 leading-relaxed">Respondemos às principais objeções para você deitar na maca de consciência limpa.</p>
          </div>
          
          <div className="space-y-4">
            {FAQS.map((faq, i) => (
              <div key={i} className="glass border border-white/10 rounded-2xl overflow-hidden bg-black/60 shadow-lg">
                <button 
                  onClick={() => setFaqOpen(faqOpen === i ? null : i)}
                  className="w-full px-8 py-6 flex justify-between items-center text-left hover:bg-white/5 transition-colors focus:outline-none"
                >
                  <span className="font-bold text-lg">{faq.q}</span>
                  <ChevronDown className={`w-5 h-5 text-[#adff2f] transition-transform flex-shrink-0 ${faqOpen === i ? 'rotate-180' : ''}`} />
                </button>
                <AnimatePresence>
                  {faqOpen === i && (
                    <motion.div 
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="px-8 pb-6 text-gray-400 text-sm leading-relaxed border-t border-white/5 pt-4">
                        {faq.a}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Detailed Footer */}
      <footer className="bg-[#050505] border-t border-[#9333ea]/30 pt-20 pb-8 px-6 relative z-10">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
          <div className="md:col-span-1">
            <div className="text-3xl font-black tracking-tighter text-white italic mb-4">ORTIZ<span className="text-[#adff2f]">TATTOO</span></div>
            <p className="text-sm text-gray-500 mb-8 leading-relaxed">Elevando o padrão das ruas. Tatuagens com atitude, biossegurança e qualidade irretocável em cada detalhe traçado no corpo.</p>
            <div className="flex gap-4">
              <a href="#" className="w-12 h-12 rounded-full glass border border-white/10 flex items-center justify-center hover:bg-[#9333ea] hover:border-[#9333ea] hover:shadow-[0_0_15px_rgba(147,51,234,0.5)] transition-all text-white"><Instagram className="w-6 h-6"/></a>
              <a href="#" className="w-12 h-12 rounded-full glass border border-white/10 flex items-center justify-center hover:bg-[#25D366] hover:border-[#25D366] hover:shadow-[0_0_15px_rgba(37,211,102,0.5)] transition-all text-white"><Phone className="w-6 h-6"/></a>
            </div>
          </div>
          
          <div>
            <h4 className="font-bold uppercase tracking-widest text-[#adff2f] mb-6 text-sm">Links Úteis</h4>
            <ul className="space-y-4 text-sm text-gray-400 font-medium">
              <li><a href="#sobre" className="hover:text-white transition-colors">Sobre o Estúdio</a></li>
              <li><a href="#galeria" className="hover:text-white transition-colors">Ver Portfólio</a></li>
              <li><a href="#avaliacoes" className="hover:text-white transition-colors">Ler Avaliações</a></li>
              <li><a href="#agendamento" className="hover:text-white transition-colors text-[#adff2f]">Agendar Minha Tattoo</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold uppercase tracking-widest text-[#adff2f] mb-6 text-sm">Atendimento VIP</h4>
            <ul className="space-y-4 text-sm text-gray-400 font-medium">
              <li className="flex gap-3 items-start"><MapPin className="w-5 h-5 text-white flex-shrink-0 mt-0.5"/> <div>Estúdio Privado & Exclusivo<br/>Atendimento com Horário Marcado<br/><br/><span className="text-xs uppercase text-[#9333ea] border border-[#9333ea]/30 px-2 py-1 rounded">Apenas com Agendamento</span></div></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold uppercase tracking-widest text-[#adff2f] mb-6 text-sm">Legal & Admin</h4>
            <ul className="space-y-4 text-sm text-gray-500 font-medium mb-6">
              <li>CNPJ: 45.421.848/0001-99</li>
              <li><a href="#" className="hover:text-white">Políticas de Privacidade</a></li>
            </ul>
            <a href="#/dashboard" className="inline-flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-xs font-bold uppercase hover:bg-[#9333ea]/20 hover:border-[#9333ea]/50 transition-colors text-white">
              <Zap className="w-3 h-3 text-[#9333ea]"/> Acesso Restrito (Painel)
            </a>
          </div>
        </div>
        
        <div className="max-w-7xl mx-auto border-t border-white/10 pt-8 text-center text-xs text-gray-600 uppercase tracking-widest font-bold">
          Ortiz Tattoo © {today.getFullYear()} - Todos os direitos reservados. Underground Culture.
        </div>
      </footer>

      {/* Lightbox Modal */}
      <AnimatePresence>
        {lightboxImg && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/95 backdrop-blur-xl"
          >
            <button 
              onClick={() => setLightboxImg(null)}
              className="absolute top-6 right-6 text-white hover:text-black hover:bg-[#adff2f] transition-colors p-3 border border-white/10 rounded-full z-[110]"
            >
              <X className="w-6 h-6" />
            </button>
            <motion.img 
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              src={lightboxImg} 
              className="max-w-full max-h-[90vh] object-contain rounded-xl neon-border-purple" 
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Booking Modal Form */}
      <AnimatePresence>
        {selectedDate && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md"
          >
            <motion.div 
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              className="glass neon-border-lime p-5 sm:p-6 rounded-3xl w-full max-w-md relative bg-[#0a0a0a] max-h-[90vh] overflow-y-auto"
              style={{
                scrollbarWidth: 'thin',
                scrollbarColor: 'rgba(255,255,255,0.1) transparent'
              }}
            >
              <div className="absolute top-0 right-0 opacity-10 pointer-events-none">
                <Zap className="w-48 h-48 text-[#adff2f] -translate-y-12 translate-x-12" />
              </div>

              <button 
                onClick={() => setSelectedDate(null)}
                className="absolute top-4 right-4 text-gray-500 hover:text-white transition-colors p-1 bg-black/40 rounded-full border border-white/5 hover:border-white/20 z-50"
              >
                <X className="w-5 h-5" />
              </button>
              
              <h3 className="text-2xl font-black uppercase text-white mb-0.5 relative z-10 leading-tight">Travar <br/><span className="text-[#adff2f]">Sessão</span></h3>
              <p className="text-[11px] text-gray-400 mb-4 uppercase tracking-widest relative z-10 font-bold border-b border-white/10 pb-2">
                Sua estimativa: <span className="text-[#adff2f]">R$ {estimatedPrice.toLocaleString('pt-BR', {minimumFractionDigits: 2})}</span>
              </p>
              
              <div className="bg-white/5 border border-white/10 p-3 rounded-xl mb-4 flex items-center gap-3 text-gray-300 relative z-10 shadow-inner">
                <div className="w-10 h-10 rounded-lg bg-[#adff2f]/10 flex items-center justify-center border border-[#adff2f]/30">
                  <CalIcon className="w-5 h-5 text-[#adff2f]" />
                </div>
                <div>
                  <div className="text-[8px] uppercase font-bold text-gray-500 tracking-widest">Data Reservada</div>
                  <span className="font-mono text-base font-bold text-white">{selectedDate.split('-').reverse().join('/')}</span>
                </div>
              </div>

              <form onSubmit={handleBooking} className="space-y-4 relative z-10">
                <div>
                  <label className="block text-[9px] uppercase font-bold tracking-widest text-[#adff2f] mb-1.5">Seu Nome de Guerra</label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                    <input required name="name" type="text" placeholder="Ex: Thiago Caveira" className="w-full pl-11 pr-4 py-2.5 text-xs font-bold rounded-xl bg-[#050505] border border-white/10 focus:border-[#adff2f] transition-colors focus:outline-none focus:ring-1 focus:ring-[#adff2f] text-white" />
                  </div>
                </div>
                
                <div>
                  <label className="block text-[9px] uppercase font-bold tracking-widest text-[#adff2f] mb-1.5">Canal de Contato (WhatsApp)</label>
                  <div className="relative">
                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                    <input required name="phone" type="tel" placeholder="(11) 99999-9999" className="w-full pl-11 pr-4 py-2.5 text-xs font-bold rounded-xl bg-[#050505] border border-white/10 focus:border-[#adff2f] transition-colors focus:outline-none focus:ring-1 focus:ring-[#adff2f] text-white" />
                  </div>
                </div>
                
                <div>
                  <label className="block text-[9px] uppercase font-bold tracking-widest text-[#adff2f] mb-1.5">Turno Desejado</label>
                  <div className="relative">
                    <Clock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                    <select required name="time" className="w-full pl-11 pr-4 py-2.5 text-xs font-bold rounded-xl bg-[#050505] border border-white/10 focus:border-[#adff2f] transition-colors focus:outline-none focus:ring-1 focus:ring-[#adff2f] appearance-none cursor-pointer text-white">
                      <option value="">Selecione o melhor horário...</option>
                      {state.availableHours.filter(t => !state.appointments.some(a => a.date === selectedDate && a.time === t)).map(time => (
                        <option key={time} value={time}>{time}</option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
                  </div>
                </div>

                <div className="pt-3 border-t border-white/10 mt-3">
                  <h4 className="text-[9px] uppercase font-bold tracking-widest text-red-500 mb-2.5">Anamnese & Termo de Consentimento</h4>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-[9px] uppercase font-bold text-gray-400 mb-1">Alergias (ex: látex, pomadas)?</label>
                      <input name="allergies" type="text" placeholder="Se não, deixe em branco" className="w-full px-3 py-2 text-xs rounded-xl bg-[#050505] border border-white/10 focus:border-[#adff2f] text-white" />
                    </div>
                    <div>
                      <label className="block text-[9px] uppercase font-bold text-gray-400 mb-1">Condições Médicas (ex: diabetes, hemofilia)?</label>
                      <input name="medicalConditions" type="text" placeholder="Se não, deixe em branco" className="w-full px-3 py-2 text-xs rounded-xl bg-[#050505] border border-white/10 focus:border-[#adff2f] text-white" />
                    </div>
                    <label className="flex items-start gap-2 cursor-pointer">
                      <input required name="consent" type="checkbox" className="mt-0.5 accent-[#adff2f] w-3.5 h-3.5 cursor-pointer" />
                      <span className="text-[9px] text-gray-400 leading-tight">
                        Confirmo que as informações médicas são verdadeiras e estou ciente dos riscos e cuidados do procedimento (Aftercare será enviado pós-sessão).
                      </span>
                    </label>
                  </div>
                </div>

                <div>
                  <label className="block text-[9px] uppercase font-bold tracking-widest text-[#adff2f] mb-1.5">Referência da Arte (Opcional)</label>
                  <div className="relative">
                    <input 
                      type="file" 
                      accept="image/*" 
                      onChange={handleImageUpload} 
                      className="w-full text-xs font-bold rounded-xl bg-[#050505] border border-white/10 file:mr-3 file:py-2 file:px-3 file:rounded-xl file:border-0 file:text-[10px] file:font-black file:bg-[#adff2f] file:text-black hover:file:bg-[#8aff1f] text-white focus:outline-none transition-colors" 
                    />
                  </div>
                  {referenceImage && (
                    <div className="mt-2 bg-white/5 p-1.5 rounded-xl inline-block border border-white/10">
                      <img src={referenceImage} alt="Referência" className="h-14 w-auto max-w-full object-contain rounded-lg shadow-sm" />
                    </div>
                  )}
                </div>
                
                <button type="submit" className="w-full mt-6 py-3.5 bg-gradient-to-r from-[#adff2f] to-[#8aff1f] text-black font-black uppercase tracking-widest rounded-xl hover:shadow-[0_0_20px_rgba(173,255,47,0.4)] transition-all flex items-center justify-center gap-2 transform hover:scale-[1.01] text-xs">
                  Travar Meus Dados <Zap className="w-4 h-4" />
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
