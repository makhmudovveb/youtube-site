import { Navigate } from 'react-router-dom'; import { useAuth } from '../context/AuthContext';
/** Обычный пользователь читает сайт; только роль admin получает доступ к CMS. */
export function ProtectedRoute({ children }: { children: React.ReactNode }) { const { user, isAdmin, loading } = useAuth(); if (loading) return <div className="p-10">Loading…</div>; if (!user) return <Navigate to="/login" replace/>; return isAdmin ? <>{children}</> : <Navigate to="/" replace/>; }
