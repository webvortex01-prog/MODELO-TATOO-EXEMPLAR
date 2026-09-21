export interface Anamnesis {
  allergies: string;
  medicalConditions: string;
  consent: boolean;
}

export interface Appointment {
  id: string;
  date: string; // YYYY-MM-DD
  time: string;
  clientName: string;
  phone: string;
  referenceImage?: string; // base64
  tattooStyle?: string;
  tattooSizeCm?: number;
  tattooComplexity?: string;
  bodyPart?: string;
  estimatedPrice?: number;
  anamnesis?: Anamnesis;
  status?: 'Pendente' | 'Confirmado' | 'Concluído' | 'Finalizado' | 'Cancelado';
}

export interface WaitlistEntry {
  id: string;
  clientName: string;
  phone: string;
  style: string;
  addedAt: string;
}

export interface FlashArt {
  id: string;
  src: string;
  name: string;
  price: number;
  available: boolean;
}

export interface InventoryItem {
  id: string;
  name: string;
  quantity: number;
  unit: string;
  threshold: number;
}

export interface AppState {
  scheduleDays: Record<string, 'Liberado' | 'Trancado'>;
  appointments: Appointment[];
  revenue: number;
  monthlyGoal: number;
  notes: string;
  availableHours: string[];
  waitlist: WaitlistEntry[];
  flashArts: FlashArt[];
  inventory: InventoryItem[];
}

const defaultState: AppState = {
  scheduleDays: {},
  appointments: [],
  revenue: 0,
  monthlyGoal: 5000,
  notes: 'Salves e lembretes para o Ortiz Tattoo Studio! Organização de materiais e orçamentos fechados na semana.',
  availableHours: ['10:00', '14:00', '17:00', '20:00'],
  waitlist: [],
  flashArts: [
    { id: '1', src: 'https://images.unsplash.com/photo-1542382257-201b72a21a96?auto=format&fit=crop&q=80&w=600', name: 'Floral Fine Line', price: 350, available: true },
    { id: '2', src: 'https://images.unsplash.com/photo-1560707303-4e980c876ad1?auto=format&fit=crop&q=80&w=600', name: 'Peônia Delicada', price: 420, available: true }
  ],
  inventory: [
    { id: '1', name: 'Agulhas 3RL', quantity: 50, unit: 'un', threshold: 20 },
    { id: '2', name: 'Tinta Preta 30ml', quantity: 2, unit: 'fr', threshold: 1 }
  ]
};

export function loadState(): AppState {
  try {
    const saved = localStorage.getItem('ortiz_tattoo_state') || localStorage.getItem('vortex_state');
    if (saved) {
      const parsed = JSON.parse(saved);
      if (!parsed.availableHours) {
        parsed.availableHours = ['10:00', '14:00', '17:00', '20:00'];
      }
      return parsed;
    }
    return defaultState;
  } catch (e) {
    return defaultState;
  }
}


export function saveState(state: AppState) {
  localStorage.setItem('ortiz_tattoo_state', JSON.stringify(state));
}
