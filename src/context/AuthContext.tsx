import { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged, signInWithEmailAndPassword, signOut, createUserWithEmailAndPassword, type User } from 'firebase/auth';
import { auth, useFirebase } from '../lib/firebase';
type Auth = { user: User | null; loading: boolean; login: (email: string, password: string) => Promise<void>; register: (email: string, password: string) => Promise<void>; logout: () => Promise<void>; };
const AuthContext = createContext<Auth | null>(null);
export function AuthProvider({ children }: { children: React.ReactNode }) { const [user, setUser] = useState<User | null>(null); const [loading, setLoading] = useState(true); useEffect(() => { if (!useFirebase || !auth) { setLoading(false); return; } return onAuthStateChanged(auth, u => { setUser(u); setLoading(false); }); }, []);
 const login = async (email: string, password: string) => { if (!auth) throw new Error('Firebase не настроен. Добавьте .env.local'); await signInWithEmailAndPassword(auth, email, password); }; const register = async (email: string, password: string) => { if (!auth) throw new Error('Firebase не настроен. Добавьте .env.local'); await createUserWithEmailAndPassword(auth, email, password); };
 return <AuthContext.Provider value={{ user, loading, login, register, logout: async () => { if (auth) await signOut(auth); } }}>{children}</AuthContext.Provider>; }
export const useAuth = () => { const value = useContext(AuthContext); if (!value) throw new Error('AuthProvider is required'); return value; };
