import { 
  ref, 
  get, 
  set, 
  push, 
  update, 
  remove, 
  onValue,
  query,
  off
} from 'firebase/database';
import { db, auth } from '../lib/firebase';

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface RTDBErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
  }
}

function handleRTDBError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: RTDBErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
    },
    operationType,
    path
  }
  console.error('Realtime Database Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

export const patientsCollection = 'patients';
export const appointmentsCollection = 'appointments';
export const dentistsCollection = 'dentists';
export const transactionsCollection = 'transactions';

export async function getAllDocs<T>(path: string) {
  try {
    const dbRef = ref(db, path);
    const snapshot = await get(dbRef);
    if (snapshot.exists()) {
      const data = snapshot.val();
      return Object.keys(data).map(key => ({ id: key, ...data[key] } as T));
    }
    return [];
  } catch (error) {
    handleRTDBError(error, OperationType.GET, path);
  }
}

export async function getOneDoc<T>(path: string, id: string) {
  try {
    const dbRef = ref(db, `${path}/${id}`);
    const snapshot = await get(dbRef);
    if (snapshot.exists()) {
      return { id: snapshot.key, ...snapshot.val() } as T;
    }
    return null;
  } catch (error) {
    handleRTDBError(error, OperationType.GET, `${path}/${id}`);
  }
}

export async function createDoc<T>(path: string, data: any, id?: string) {
  try {
    if (id) {
      const dbRef = ref(db, `${path}/${id}`);
      await set(dbRef, data);
      return { id, ...data } as T;
    } else {
      const dbRef = ref(db, path);
      const newDocRef = push(dbRef);
      await set(newDocRef, data);
      return { id: newDocRef.key, ...data } as T;
    }
  } catch (error) {
    handleRTDBError(error, OperationType.CREATE, path);
  }
}

export async function updateDoc(path: string, id: string, data: any) {
  try {
    const dbRef = ref(db, `${path}/${id}`);
    await update(dbRef, data);
  } catch (error) {
    handleRTDBError(error, OperationType.UPDATE, `${path}/${id}`);
  }
}

export async function deleteDoc(path: string, id: string) {
  try {
    const dbRef = ref(db, `${path}/${id}`);
    await remove(dbRef);
  } catch (error) {
    handleRTDBError(error, OperationType.DELETE, `${path}/${id}`);
  }
}

export function subscribeToCollection<T>(path: string, callback: (data: T[]) => void) {
  const dbRef = ref(db, path);
  const unsubscribe = onValue(dbRef, (snapshot) => {
    const data = snapshot.val();
    if (data) {
      const result = Object.keys(data).map(key => ({ id: key, ...data[key] } as T));
      callback(result);
    } else {
      callback([]);
    }
  }, (error) => {
    handleRTDBError(error, OperationType.LIST, path);
  });

  return () => off(dbRef, 'value', unsubscribe);
}
