import { Helmet } from 'react-helmet-async';
export function Seo({ title, description }: { title: string; description: string }) { return <Helmet><title>{title} | LinguaSpace</title><meta name="description" content={description}/><meta property="og:title" content={title}/><meta property="og:description" content={description}/></Helmet>; }
