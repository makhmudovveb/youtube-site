import { Navigate } from 'react-router-dom'; import { useAuth } from '../context/AuthContext';
// В production дополнительно используйте custom claim `admin` и Firestore Rules.
// Для учебного шаблона доступ даёт любая авторизованная учётная запись Firebase.
export function ProtectedRoute({children}:{children:React.ReactNode}){const {user,loading}=useAuth();if(loading)return <div className="p-10">Loading…</div>;return user?<>{children}</>:<Navigate to="/login" replace/>}
