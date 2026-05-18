import { db } from './firebase';
import { ref, onValue, push, set, update, remove } from 'firebase/database';
import { Patient, Appointment, Dentist, Transaction, SystemUser, PermissionTemplate } from '../types';

export const dataService = {
  // Patients
  subscribePatients: (callback: (patients: Patient[]) => void) => {
    const patientsRef = ref(db, 'patients');
    return onValue(patientsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const list = Object.keys(data).map(key => ({
          ...data[key],
          id: key
        })) as Patient[];
        callback(list);
      } else {
        callback([]);
      }
    });
  },

  addPatient: async (patient: Omit<Patient, 'id'>) => {
    const patientsRef = ref(db, 'patients');
    const newRef = push(patientsRef);
    await set(newRef, patient);
    return newRef.key;
  },

  // Staff (Dentists)
  subscribeDentists: (callback: (dentists: Dentist[]) => void) => {
    const staffRef = ref(db, 'staff');
    return onValue(staffRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const list = Object.keys(data).map(key => ({
          ...data[key],
          id: key
        })) as Dentist[];
        callback(list);
      } else {
        callback([]);
      }
    });
  },

  addDentist: async (dentist: Omit<Dentist, 'id'>) => {
    const staffRef = ref(db, 'staff');
    const newRef = push(staffRef);
    await set(newRef, dentist);
    return newRef.key;
  },

  // Appointments
  subscribeAppointments: (callback: (appointments: Appointment[]) => void) => {
    const apptsRef = ref(db, 'appointments');
    return onValue(apptsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const list = Object.keys(data).map(key => ({
          ...data[key],
          id: key
        })) as Appointment[];
        callback(list);
      } else {
        callback([]);
      }
    });
  },

  addAppointment: async (appointment: Omit<Appointment, 'id'>) => {
    const apptsRef = ref(db, 'appointments');
    const newRef = push(apptsRef);
    await set(newRef, appointment);
    return newRef.key;
  },

  // Transactions
  subscribeTransactions: (callback: (transactions: Transaction[]) => void) => {
    const transRef = ref(db, 'transactions');
    return onValue(transRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const list = Object.keys(data).map(key => ({
          ...data[key],
          id: key
        })) as Transaction[];
        callback(list);
      } else {
        callback([]);
      }
    });
  },

  addTransaction: async (transaction: Omit<Transaction, 'id'>) => {
    const transRef = ref(db, 'transactions');
    const newRef = push(transRef);
    await set(newRef, transaction);
    return newRef.key;
  },

  // System Users
  subscribeUsers: (callback: (users: SystemUser[]) => void) => {
    const usersRef = ref(db, 'system_users');
    return onValue(usersRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const list = Object.keys(data).map(key => ({
          ...data[key],
          id: key
        })) as SystemUser[];
        callback(list);
      } else {
        callback([]);
      }
    });
  },

  addUser: async (user: Omit<SystemUser, 'id'>) => {
    const usersRef = ref(db, 'system_users');
    const newRef = push(usersRef);
    await set(newRef, user);
    return newRef.key;
  },

  deleteUser: async (id: string) => {
    const userRef = ref(db, `system_users/${id}`);
    await remove(userRef);
  },

  // Permission Templates
  subscribeTemplates: (callback: (templates: PermissionTemplate[]) => void) => {
    const templatesRef = ref(db, 'permission_templates');
    return onValue(templatesRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const list = Object.keys(data).map(key => ({
          ...data[key],
          id: key
        })) as PermissionTemplate[];
        callback(list);
      } else {
        callback([]);
      }
    });
  },

  addTemplate: async (template: Omit<PermissionTemplate, 'id'>) => {
    const templatesRef = ref(db, 'permission_templates');
    const newRef = push(templatesRef);
    await set(newRef, template);
    return newRef.key;
  },

  deleteTemplate: async (id: string) => {
    const templateRef = ref(db, `permission_templates/${id}`);
    await remove(templateRef);
  }
};
