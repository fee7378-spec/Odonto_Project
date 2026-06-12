export type PermissionLevel = 'none' | 'view' | 'edit';

export interface AccessProfile {
  id: string;
  name: string;
  description?: string;
  permissions: Record<string, PermissionLevel>;
}

export interface SystemUser {
  id: string;
  name: string;
  email: string;
  profileId: string;
  status: 'pending' | 'active';
  createdAt: string;
  customPermissions?: Record<string, PermissionLevel>;
}

export interface DocumentTemplate {
  id: string;
  name: string;
  content: string;
  category: string;
}

export interface Patient {
  id: string;
  code: string;
  name: string;
  photoUrl?: string;
  cpf: string;
  phone: string;
  email: string;
  lastVisit?: string;
  nextVisit?: string;
  status: 'active' | 'inactive';
  alergies: string[];
  medications: string[];
  history: string[];
}

export interface AppointmentProcedure {
  id: string;
  category: string;
  name: string;
  baseValue: number;
  appliedValue: number;
}

export interface Appointment {
  id: string;
  patientId: string;
  patientName?: string;
  dentistId: string;
  dentistName?: string;
  date: string; // ISO string
  duration: number; // minutes
  status: 'scheduled' | 'confirmed' | 'ongoing' | 'finished' | 'cancelled' | 'no_show' | 'evaluation';
  treatmentType: string; // Will store the procedure name
  procedures?: AppointmentProcedure[]; // Added multiple procedures
  notes?: string;
  paymentMethod?: 'PIX' | 'Crédito' | 'Débito' | 'Outros';
  customPaymentMethod?: string;
  payments?: { method: 'PIX' | 'Crédito' | 'Débito' | 'Outros'; customMethod?: string; amount: number }[];
  procedureValue?: number;
  procedureName?: string;
}

export interface Procedure {
  id: string;
  name: string;
  category: string;
  value: number;
}


export interface Dentist {
  id: string;
  name: string;
  specialty: string;
  photoUrl?: string;
  active: boolean;
  color?: string;
}

export interface Transaction {
  id: string;
  type: 'income' | 'expense';
  category: string;
  amount: number;
  date: string;
  status: 'paid' | 'pending';
  patientId?: string;
  description: string;
}

export const mockPatients: Patient[] = [
  {
    id: '1',
    code: '000001',
    name: 'João Silva',
    photoUrl: 'https://images.unsplash.com/photo-1599566150163-29194dcaad36?w=150&h=150&fit=crop',
    cpf: '123.456.789-00',
    phone: '(11) 98888-7777',
    email: 'joao@email.com',
    lastVisit: '2024-05-10',
    nextVisit: '2024-06-15',
    status: 'active',
    alergies: ['Penicilina'],
    medications: [],
    history: ['Limpeza - 10/05', 'Restauração - 12/04'],
  },
  {
    id: '2',
    code: '000002',
    name: 'Ana Oliveira',
    photoUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop',
    cpf: '234.567.890-11',
    phone: '(11) 97777-6666',
    email: 'ana@email.com',
    lastVisit: '2024-04-20',
    nextVisit: '2024-05-20',
    status: 'active',
    alergies: [],
    medications: ['Anti-hipertensivo'],
    history: ['Extração - 20/04'],
  }
];

export const mockAppointments: Appointment[] = [
  {
    id: '1',
    patientId: '1',
    dentistId: 'd1',
    date: new Date().toISOString(),
    duration: 60,
    status: 'scheduled',
    treatmentType: 'Limpeza',
  },
  {
    id: '2',
    patientId: '2',
    dentistId: 'd1',
    date: new Date(new Date().getTime() + 2 * 60 * 60 * 1000).toISOString(),
    duration: 30,
    status: 'confirmed',
    treatmentType: 'Consulta de rotina',
  }
];

export const mockDentists: Dentist[] = [
  {
    id: 'd1',
    name: 'Dr. Roberto Santos',
    specialty: 'Implantodontia',
    photoUrl: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=150&h=150&fit=crop',
    active: true,
  }
];
