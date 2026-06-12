export const auth: any = { currentUser: null };

export const initAuth = () => {
  const user = localStorage.getItem('currentUser');
  if (user) {
    auth.currentUser = JSON.parse(user);
  } else {
    auth.currentUser = null;
  }
};

initAuth();

export const onAuthStateChanged = (authObj: any, callback: (user: any) => void) => {
  const checkAuth = () => {
    const user = localStorage.getItem('currentUser');
    callback(user ? JSON.parse(user) : null);
  };
  checkAuth();
  
  // Custom event listener for local login/logout
  window.addEventListener('auth-change', checkAuth);
  
  return () => {
    window.removeEventListener('auth-change', checkAuth);
  };
};

// Mock authentication database
const getAuthUsers = () => JSON.parse(localStorage.getItem('auth_users') || '{}');
const setAuthUsers = (users: any) => localStorage.setItem('auth_users', JSON.stringify(users));

export const signInWithEmailAndPassword = async (authObj: any, email: string, pass: string) => {
  const authUsers = getAuthUsers();
  const userRecord = authUsers[email.toLowerCase()];
  
  // To allow the system bootstrap user 'fee7378@gmail.com'
  if (email.toLowerCase() === 'fee7378@gmail.com' && !userRecord) {
     const user = { uid: email, email };
     localStorage.setItem('currentUser', JSON.stringify(user));
     auth.currentUser = user;
     window.dispatchEvent(new Event('auth-change'));
     return { user };
  }
  
  if (!userRecord) {
    const error: any = new Error('User not found');
    error.code = 'auth/user-not-found';
    throw error;
  }
  
  if (userRecord.password !== pass) {
    const error: any = new Error('Wrong password');
    error.code = 'auth/wrong-password';
    throw error;
  }

  const user = { uid: email, email };
  localStorage.setItem('currentUser', JSON.stringify(user));
  auth.currentUser = user;
  window.dispatchEvent(new Event('auth-change'));
  return { user };
};

export const createUserWithEmailAndPassword = async (authObj: any, email: string, pass: string) => {
  const authUsers = getAuthUsers();
  
  if (authUsers[email.toLowerCase()]) {
    const error: any = new Error('Email already in use');
    error.code = 'auth/email-already-in-use';
    throw error;
  }

  authUsers[email.toLowerCase()] = { email: email.toLowerCase(), password: pass };
  setAuthUsers(authUsers);

  const user = { uid: email, email };
  localStorage.setItem('currentUser', JSON.stringify(user));
  auth.currentUser = user;
  window.dispatchEvent(new Event('auth-change'));
  return { user };
};

export const sendPasswordResetEmail = async (authObj: any, email: string) => {
  console.log('Password reset requested for', email);
};

export const signOut = async (authObj: any) => {
  localStorage.removeItem('currentUser');
  auth.currentUser = null;
  window.dispatchEvent(new Event('auth-change'));
};

export const db: any = {};
export const firestore: any = {};

export const doc = () => {};
export const getDocFromServer = async () => null;
