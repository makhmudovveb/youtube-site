import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import type { Article } from '../types';
import { getArticles } from '../lib/contentService';
import { tagsFor } from '../lib/tags';
import { Seo } from '../components/Seo';
import { useApp } from '../context/AppContext';

export default function ArticlesPage() {
  const [articles, setArticles] = useState<Article[]>([]); const { lang, t } = useApp();
  useEffect(() => { getArticles().then(setArticles); }, []);
  return <section className="mx-auto max-w-6xl px-4 py-12"><Seo title={t.articles} description="Полезные статьи об английском языке." /><h1 className="text-4xl font-black">{t.articles}</h1><div className="mt-8 grid gap-6 md:grid-cols-2">{articles.map(article => <article key={article.id} className="overflow-hidden rounded-2xl bg-white shadow-soft dark:bg-slate-900"><div className="flex h-56 items-center justify-center bg-slate-100 dark:bg-slate-800"><img loading="lazy" src={article.image} className="h-full w-full object-contain" alt="" /></div><div className="min-w-0 p-6"><div className="break-words text-xs font-bold text-brand-600">{tagsFor(article.tags, lang).join(' · ')}</div><h2 className="mt-2 break-words text-xl font-bold">{article.title[lang]}</h2><p className="mt-2 break-words text-slate-500">{article.excerpt[lang]}</p><Link to={`/articles/${article.id}`} className="mt-4 inline-block font-semibold text-brand-600">{lang === 'ru' ? 'Читать статью →' : 'O‘qish →'}</Link></div></article>)}</div></section>;
}
