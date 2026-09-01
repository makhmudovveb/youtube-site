import { Navigate } from 'react-router-dom'; import { useAuth } from '../context/AuthContext'; import { PageLoader } from './PageLoader';
/** Обычный пользователь читает сайт; только роль admin получает доступ к CMS. */
export function ProtectedRoute({ children }: { children: React.ReactNode }) { const { user, isAdmin, loading } = useAuth(); if (loading) return <PageLoader />; if (!user) return <Navigate to="/login" replace/>; return isAdmin ? <>{children}</> : <Navigate to="/" replace/>; }
