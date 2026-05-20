import { useState, useEffect } from 'react';
import { auth } from '../lib/firebase';
import { subscribeToCollection, usersCollection, profilesCollection } from '../services/firebaseService';
import { SystemUser, AccessProfile, PermissionLevel } from '../types';

export function usePermissions() {
  const [user, setUser] = useState<SystemUser | null>(null);
  const [profile, setProfile] = useState<AccessProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const MASTER_EMAIL = 'fee7378@gmail.com';

  useEffect(() => {
    const unsubAuth = auth.onAuthStateChanged((authUser) => {
      if (!authUser) {
        setUser(null);
        setProfile(null);
        setLoading(false);
        return;
      }

      const unsubUsers = subscribeToCollection<SystemUser>(usersCollection, (users) => {
        const currentUser = users.find(u => u.email.toLowerCase() === authUser.email?.toLowerCase());
        if (currentUser) {
          setUser(currentUser);
          
          const unsubProfiles = subscribeToCollection<AccessProfile>(profilesCollection, (profiles) => {
            const currentProfile = profiles.find(p => p.id === currentUser.profileId);
            if (currentProfile) {
              setProfile(currentProfile);
            }
            setLoading(false);
          });
          
          return () => unsubProfiles();
        } else {
          // If user not in system_users but authenticated, check if it's master
          if (authUser.email === MASTER_EMAIL) {
             setUser({
               id: 'master',
               name: 'Felipe Nascimento',
               email: MASTER_EMAIL,
               profileId: 'master',
               status: 'active',
               createdAt: new Date().toISOString()
             });
             setProfile({
               id: 'master',
               name: 'Master',
               permissions: {}
             });
          }
          setLoading(false);
        }
      });

      return () => unsubUsers();
    });

    return () => unsubAuth();
  }, []);

  const hasPermission = (module: string, level: PermissionLevel = 'view'): boolean => {
    if (user?.email === MASTER_EMAIL) return true;
    
    const userPerm = user?.customPermissions?.[module];
    const profilePerm = profile?.permissions?.[module];
    
    const effectivePerm = userPerm || profilePerm || 'none';
    
    if (level === 'edit') return effectivePerm === 'edit';
    if (level === 'view') return effectivePerm === 'view' || effectivePerm === 'edit';
    return true;
  };

  return {
    user,
    profile,
    loading,
    hasPermission,
    isMaster: user?.email === MASTER_EMAIL
  };
}
