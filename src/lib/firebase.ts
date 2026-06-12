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

export const signInWithEmailAndPassword = async (authObj: any, email: string, pass: string) => {
  const user = { uid: email, email };
  localStorage.setItem('currentUser', JSON.stringify(user));
  auth.currentUser = user;
  window.dispatchEvent(new Event('auth-change'));
  return { user };
};

export const createUserWithEmailAndPassword = async (authObj: any, email: string, pass: string) => {
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
