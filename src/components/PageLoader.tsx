import { LoaderCircle } from 'lucide-react';
/** Единый неблокирующий индикатор загрузки для маршрутов и операций Firebase. */
export function PageLoader({ label = 'Загрузка…' }: { label?: string }) { return <div className="flex min-h-[45vh] flex-col items-center justify-center gap-3 text-brand-600"><LoaderCircle className="animate-spin" size={34}/><p className="text-sm font-semibold text-slate-500 dark:text-slate-400">{label}</p></div>; }
