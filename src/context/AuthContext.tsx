import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserProfile, UserRole } from '../types';
import { auth, db } from '../firebase';
import {
  signInWithPopup,
  GoogleAuthProvider,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  User as FirebaseUser,
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';

export const DEMO_PROFILES: Record<UserRole, UserProfile> = {
  student: {
    id: 'student_priya_sharma',
    displayName: 'Priya Sharma',
    email: 'priya.sharma@campus.edu',
    role: 'student',
    college: 'School of Computing & Engineering',
    department: 'Computer Science & AI',
    year: '3rd Year (Junior)',
    skills: ['AI/ML', 'Web Development', 'Python', 'React', 'UI/UX'],
    interests: 'Healthcare AI, Assistive Devices, Campus Accessibility',
    experienceLevel: 'Intermediate',
    preferredTechnologies: 'React, TypeScript, PyTorch, Tailwind CSS, Express',
    collaborationPreferences: 'Looking for embedded electronics and IoT sensor specialists',
    bio: 'Passionate student developer building accessible smart devices for university healthcare clinics.',
    avatarUrl: '/src/assets/images/avatar_student_lead_1791965170195.jpg',
    createdAt: '2026-09-01T10:00:00.000Z',
  },
  mentor: {
    id: 'mentor_arthur_bennett',
    displayName: 'Dr. Arthur Bennett',
    email: 'a.bennett@campus.edu',
    role: 'mentor',
    college: 'College of Engineering & Applied Sciences',
    department: 'Electrical Engineering & Robotics',
    year: 'Faculty Member',
    skills: ['Electronics', 'IoT Sensors', 'Research', 'Embedded Systems', 'Business Planning'],
    interests: 'Edge Computing, Autonomous Robotics, Patent Incubation',
    experienceLevel: 'Expert',
    preferredTechnologies: 'MicroPython, C++, ROS2, PCB Design, Hardware Prototyping',
    collaborationPreferences: 'Available for technical reviews, prototype debugging, and grant pitches',
    bio: 'Associate Professor in Robotics with 14 years advising collegiate hackathon teams and student tech spinouts.',
    avatarUrl: '/src/assets/images/avatar_mentor_advisor_1791965171456.jpg',
    createdAt: '2026-08-15T09:00:00.000Z',
  },
  admin: {
    id: 'admin_elena_rostova',
    displayName: 'Dean Elena Rostova',
    email: 'mallaramlokesh13@gmail.com',
    role: 'admin',
    college: 'University Innovation & Incubation Council',
    department: 'Office of Research & Entrepreneurship',
    year: 'Administration',
    skills: ['Project Evaluation', 'Seed Funding', 'Ethics & Compliance', 'Venture Mentorship'],
    interests: 'Campus Seed Grants, Tech Transfer, Student Venture Incubation',
    experienceLevel: 'Expert',
    preferredTechnologies: 'Grant Portals, Financial Ledger Systems, Innovation Dashboards',
    collaborationPreferences: 'Reviewing proposals, sanctioning funding, and assigning faculty mentors',
    bio: 'Director of the University Innovation Hub overseeing grant allocations, human proposal selection, and ethics reviews.',
    avatarUrl: '/src/assets/images/avatar_admin_dean_1791965171262.jpg',
    createdAt: '2026-08-01T08:00:00.000Z',
  },
};

interface AuthContextType {
  currentUser: UserProfile | null;
  firebaseUser: FirebaseUser | null;
  isLoading: boolean;
  activeRole: UserRole;
  switchDemoRole: (role: UserRole) => void;
  updateProfile: (updated: Partial<UserProfile>) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  loginCustom: (email: string, displayName: string, role: UserRole) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const LOCAL_STORAGE_KEY = 'innovateverse_active_user';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(() => {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return DEMO_PROFILES.student;
      }
    }
    return DEMO_PROFILES.student;
  });
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Sync to localStorage
  useEffect(() => {
    if (currentUser) {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(currentUser));
    } else {
      localStorage.removeItem(LOCAL_STORAGE_KEY);
    }
  }, [currentUser]);

  // Listen to Firebase Auth
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setFirebaseUser(user);
      if (user) {
        try {
          const userDocRef = doc(db, 'users', user.uid);
          const snap = await getDoc(userDocRef);
          if (snap.exists()) {
            setCurrentUser(snap.data() as UserProfile);
          } else {
            // Determine role: runtime user email gets admin, others default to student
            const isAdminEmail = user.email === 'mallaramlokesh13@gmail.com';
            const newProfile: UserProfile = {
              id: user.uid,
              email: user.email || 'user@campus.edu',
              displayName: user.displayName || 'Campus Innovator',
              role: isAdminEmail ? 'admin' : 'student',
              college: 'University Campus',
              department: 'Engineering & Computing',
              year: '3rd Year',
              skills: ['Programming', 'Web Development'],
              interests: 'Campus Innovation',
              avatarUrl: user.photoURL || undefined,
              createdAt: new Date().toISOString(),
            };
            await setDoc(userDocRef, newProfile);
            setCurrentUser(newProfile);
          }
        } catch (e) {
          console.warn('Error loading Firestore profile for auth user, falling back to local user:', e);
        }
      }
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const switchDemoRole = (role: UserRole) => {
    const selected = DEMO_PROFILES[role];
    setCurrentUser(selected);
  };

  const updateProfile = async (updated: Partial<UserProfile>) => {
    if (!currentUser) return;
    const merged: UserProfile = {
      ...currentUser,
      ...updated,
      updatedAt: new Date().toISOString(),
    };
    setCurrentUser(merged);

    // Save to Firestore if connected
    try {
      const userDocRef = doc(db, 'users', merged.id);
      await setDoc(userDocRef, merged, { merge: true });
    } catch (err) {
      console.warn('Could not sync profile to remote Firestore:', err);
    }
  };

  const signInWithGoogle = async () => {
    setIsLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error('Google Sign-In Error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const signOut = async () => {
    try {
      await firebaseSignOut(auth);
    } catch (e) {
      console.warn('Firebase signout error:', e);
    }
    setCurrentUser(null);
  };

  const loginCustom = (email: string, displayName: string, role: UserRole) => {
    const customUser: UserProfile = {
      id: `user_${Date.now()}`,
      email,
      displayName,
      role,
      college: 'University Campus',
      department: 'Engineering & Technology',
      year: role === 'mentor' ? 'Faculty' : role === 'admin' ? 'Staff' : '2nd Year',
      skills: role === 'student' ? ['Programming', 'Web Development'] : ['Research', 'Leadership'],
      createdAt: new Date().toISOString(),
    };
    setCurrentUser(customUser);
  };

  const activeRole: UserRole = currentUser?.role || 'student';

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        firebaseUser,
        isLoading,
        activeRole,
        switchDemoRole,
        updateProfile,
        signInWithGoogle,
        signOut,
        loginCustom,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
