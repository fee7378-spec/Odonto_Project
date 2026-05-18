import { db } from './firebase';
import { ref, onValue, push, set, update, remove } from 'firebase/database';
import { Patient, Appointment, Dentist, Transaction } from '../types';

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
  }
};
