import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, onAuthStateChanged } from 'firebase/auth';
import { auth, db } from '../services/firebase';
import { ref, get, set } from 'firebase/database';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  userData: any | null;
}

const AuthContext = createContext<AuthContextType>({ user: null, loading: true, userData: null });

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [userData, setUserData] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    return onAuthStateChanged(auth, async (user) => {
      setUser(user);
      if (user) {
        // Fetch matching system user record
        const systemUsersRef = ref(db, 'system_users');
        const systemSnapshot = await get(systemUsersRef);
        const systemUsers = systemSnapshot.val();
        
        let systemProfile = null;
        if (systemUsers) {
          systemProfile = Object.values(systemUsers).find((u: any) => u.email.toLowerCase() === user.email?.toLowerCase());
        }

        const userRef = ref(db, `users/${user.uid}`);
        const snapshot = await get(userRef);
        
        if (!snapshot.exists()) {
          const isAdmin = user.email?.toLowerCase() === 'fee7378@gmail.com';
          const newData = {
            name: user.displayName || systemProfile?.name || 'Usuário',
            email: user.email,
            role: isAdmin ? 'admin' : (systemProfile?.profile?.toLowerCase() || 'user'),
            clinicId: 'demo-clinic',
            createdAt: new Date().toISOString()
          };
          await set(userRef, newData);
          setUserData(newData);
        } else {
          const currentData = snapshot.val();
          let needsUpdate = false;
          const updated = { ...currentData };

          // Update role if system profile exists and differs
          if (systemProfile && currentData.role !== systemProfile.profile.toLowerCase()) {
            updated.role = systemProfile.profile.toLowerCase();
            needsUpdate = true;
          }

          // Update name if it's default and we have a system profile name
          if (systemProfile?.name && (currentData.name === 'Usuário' || !currentData.name)) {
            updated.name = systemProfile.name;
            needsUpdate = true;
          }

          if (needsUpdate) {
            await set(userRef, updated);
            setUserData(updated);
          } else {
            setUserData(currentData);
          }
        }
      } else {
        setUserData(null);
      }
      setLoading(false);
    });
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, userData }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
