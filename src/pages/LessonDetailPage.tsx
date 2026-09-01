import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import ReactPlayer from 'react-player';
import { Download, Heart } from 'lucide-react';
import type { Lesson } from '../types';
import { addView, getLessons } from '../lib/contentService';
import { Seo } from '../components/Seo';
import { useApp } from '../context/AppContext';
import { Comments } from '../components/Comments';

export default function LessonDetailPage() {
  const { id } = useParams(); const [lesson, setLesson] = useState<Lesson>(); const { lang, favorites, toggleFavorite } = useApp();
  useEffect(() => { getLessons().then(items => { const result = items.find(item => item.id === id); setLesson(result); if (result) addView(result.id); }); }, [id]);
  if (!lesson) return <div className="mx-auto max-w-6xl px-4 py-16">Loading…</div>;
  const favorite = favorites.includes(lesson.id);
  return <section className="mx-auto max-w-5xl px-4 py-12"><Seo title={lesson.title[lang]} description={lesson.description[lang]} /><Link to="/lessons" className="text-sm font-semibold text-brand-600">← {lang === 'ru' ? 'Все уроки' : 'Barcha darslar'}</Link><div className="mt-4 flex flex-wrap items-start justify-between gap-4"><div className="min-w-0"><span className="text-sm font-bold text-brand-600">{lesson.level}</span><h1 className="mt-1 break-words text-4xl font-black">{lesson.title[lang]}</h1></div><button onClick={() => toggleFavorite(lesson.id)} className="inline-flex shrink-0 items-center gap-2 rounded-xl border px-4 py-2 dark:border-slate-700"><Heart fill={favorite ? 'currentColor' : 'none'} className={favorite ? 'text-rose-500' : ''} />{lang === 'ru' ? 'В избранное' : 'Sevimlilarga'}</button></div><div className="mt-7 aspect-video overflow-hidden rounded-2xl bg-black"><ReactPlayer url={lesson.youtubeUrl} width="100%" height="100%" controls /></div><p className="mt-7 break-words text-lg text-slate-600 dark:text-slate-300">{lesson.description[lang]}</p>{lesson.detailImage && <div className="mt-7 flex max-h-[36rem] items-center justify-center rounded-2xl bg-slate-100 dark:bg-slate-800"><img src={lesson.detailImage} className="max-h-[36rem] w-full rounded-2xl object-contain" alt="" /></div>}{lesson.content?.[lang] && <div className="prose mt-7 max-w-none break-words dark:prose-invert" dangerouslySetInnerHTML={{ __html: lesson.content[lang] }} />}<div className="mt-8 rounded-2xl bg-white p-6 dark:bg-slate-900"><h2 className="text-xl font-bold">{lang === 'ru' ? 'Материалы к уроку' : 'Dars materiallari'}</h2>{lesson.materials.length ? lesson.materials.map(material => <a href={material.url} className="mt-3 flex items-center gap-2 text-brand-600" key={material.name}><Download size={18} />{material.name}</a>) : <p className="mt-3 text-slate-500">{lang === 'ru' ? 'Материалы скоро появятся.' : 'Materiallar tez orada qo‘shiladi.'}</p>}</div><Comments lessonId={lesson.id} /></section>;
}
