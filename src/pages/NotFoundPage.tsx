import { Link } from 'react-router-dom';
import { Home } from 'lucide-react';
import { Seo } from '../components/Seo';

/** Отдельная страница для ошибочных и устаревших ссылок. */
export default function NotFoundPage() {
  return <section className="mx-auto max-w-xl px-4 py-24 text-center"><Seo title="Страница не найдена" description="Запрошенная страница не существует."/><p className="text-7xl font-black text-brand-600">404</p><h1 className="mt-4 text-3xl font-black">Страница не найдена</h1><p className="mt-3 text-slate-500">Возможно, ссылка устарела или в адресе есть ошибка.</p><Link to="/" className="mt-7 inline-flex items-center gap-2 rounded-xl bg-brand-600 px-5 py-3 font-bold text-white"><Home size={18}/>На главную</Link></section>;
}
