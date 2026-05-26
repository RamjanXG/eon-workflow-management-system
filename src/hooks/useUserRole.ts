import { useState, useEffect } from 'react';
import { auth, db } from '../lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { useAuthState } from 'react-firebase-hooks/auth';
import { UserRole } from '../types';

export function useUserRole() {
  const [user] = useAuthState(auth);
  const [role, setRole] = useState<UserRole | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function checkRole() {
      if (!user) {
        setRole(null);
        setLoading(false);
        return;
      }

      try {
        // PRIORITY: Check admins collection first (your manual entry)
        const adminDoc = await getDoc(doc(db, 'admins', user.uid));
        if (adminDoc.exists()) {
          setRole('admin');
        } else {
          // Then check users collection
          const userDoc = await getDoc(doc(db, 'users', user.uid));
          if (userDoc.exists()) {
            setRole(userDoc.data().role as UserRole);
          } else {
            setRole('candidate');
          }
        }
      } catch (error) {
        console.error("Error fetching user role:", error);
        setRole('candidate');
      } finally {
        setLoading(false);
      }
    }

    checkRole();
  }, [user]);

  return { role, loading, isAdmin: role === 'admin', isCandidate: role === 'candidate' };
}
