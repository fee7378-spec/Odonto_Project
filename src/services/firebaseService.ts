export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

const getStorage = () => JSON.parse(localStorage.getItem('clinicAppDB') || '{}');
const setStorage = (data: any) => {
  localStorage.setItem('clinicAppDB', JSON.stringify(data));
  window.dispatchEvent(new Event('db-change'));
};

const getPathData = (data: any, path: string) => {
  if (!path) return data;
  const parts = path.split('/').filter(Boolean);
  let current = data;
  for (const part of parts) {
    if (current[part] === undefined) return undefined;
    current = current[part];
  }
  return current;
};

const setPathData = (data: any, path: string, value: any) => {
  if (!path) return value;
  const parts = path.split('/').filter(Boolean);
  let current = data;
  for (let i = 0; i < parts.length - 1; i++) {
    const part = parts[i];
    if (current[part] === undefined) {
      current[part] = {};
    }
    current = current[part];
  }
  if (value === undefined) {
    delete current[parts[parts.length - 1]];
  } else {
    current[parts[parts.length - 1]] = value;
  }
  return data;
};

const generateId = () => Math.random().toString(36).substring(2, 15);

export const patientsCollection = 'patients';
export const appointmentsCollection = 'appointments';
export const dentistsCollection = 'dentists';
export const transactionsCollection = 'transactions';
export const profilesCollection = 'profiles';
export const usersCollection = 'system_users';
export const templatesCollection = 'templates';
export const proceduresCollection = 'procedures';

export async function getAllDocs<T>(path: string) {
  const db = getStorage();
  const data = getPathData(db, path);
  if (data && typeof data === 'object') {
    return Object.keys(data).map(key => ({ id: key, ...data[key] } as T));
  }
  return [];
}

export async function getOneDoc<T>(path: string, id: string) {
  const db = getStorage();
  const data = getPathData(db, `${path}/${id}`);
  if (data) {
    return { id, ...data } as T;
  }
  return null;
}

export async function createDoc<T>(path: string, data: any, id?: string) {
  const db = getStorage();
  const newId = id || generateId();
  setPathData(db, `${path}/${newId}`, data);
  setStorage(db);
  return { id: newId, ...data } as T;
}

export async function updateDoc(path: string, id: string, data: any) {
  const db = getStorage();
  const current = getPathData(db, `${path}/${id}`) || {};
  setPathData(db, `${path}/${id}`, { ...current, ...data });
  setStorage(db);
}

export async function deleteDoc(path: string, id: string) {
  const db = getStorage();
  setPathData(db, `${path}/${id}`, undefined);
  setStorage(db);
}

export function subscribeToCollection<T>(path: string, callback: (data: T[]) => void) {
  const checkData = () => {
    const db = getStorage();
    const data = getPathData(db, path);
    if (data && typeof data === 'object') {
      const result = Object.keys(data).map(key => ({ id: key, ...data[key] } as T));
      callback(result);
    } else {
      callback([]);
    }
  };
  
  checkData();
  
  window.addEventListener('db-change', checkData);
  return () => {
    window.removeEventListener('db-change', checkData);
  };
}

export async function checkUserByEmail(email: string) {
  const db = getStorage();
  const data = getPathData(db, usersCollection);
  if (data && typeof data === 'object') {
    const userId = Object.keys(data).find(key => data[key].email.toLowerCase() === email.toLowerCase());
    if (userId) {
      return { id: userId, ...data[userId] };
    }
  }
  return null;
}
