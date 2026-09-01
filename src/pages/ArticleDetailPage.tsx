import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import type { Article } from '../types';
import { getArticles } from '../lib/contentService';
import { tagsFor } from '../lib/tags';
import { Seo } from '../components/Seo';
import { useApp } from '../context/AppContext';

export default function ArticleDetailPage() {
  const { id } = useParams(); const [article, setArticle] = useState<Article>(); const { lang } = useApp();
  useEffect(() => { getArticles().then(items => setArticle(items.find(item => item.id === id))); }, [id]);
  if (!article) return <div className="p-12">Loading…</div>;
  const photo = article.detailImage || article.image;
  return <article className="mx-auto max-w-3xl px-4 py-12"><Seo title={article.title[lang]} description={article.excerpt[lang]} /><p className="font-bold text-brand-600">{tagsFor(article.tags, lang).join(' · ')}</p><h1 className="mt-2 break-words text-4xl font-black">{article.title[lang]}</h1><div className="mt-7 flex max-h-[36rem] items-center justify-center rounded-2xl bg-slate-100 dark:bg-slate-800"><img src={photo} className="max-h-[36rem] w-full rounded-2xl object-contain" alt="" /></div><div className="prose mt-8 max-w-none break-words dark:prose-invert" dangerouslySetInnerHTML={{ __html: article.content[lang] }} /></article>;
}
