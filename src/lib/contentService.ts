import { addDoc, collection, deleteDoc, doc, getDocs, increment, updateDoc } from 'firebase/firestore';
import { db, useFirebase } from './firebase';
import { mockArticles, mockLessons } from '../data/mockData';
import type { Article, ContactMessage, Lesson } from '../types';

// Единый слой данных: при подключении Firebase CRUD пишет в Firestore,
// а до этого интерфейс работает с копией локальных mock-данных.
let lessons = [...mockLessons]; let articles = [...mockArticles]; let messages: ContactMessage[] = [];
export async function getLessons() { if (!useFirebase || !db) return lessons; const snap = await getDocs(collection(db, 'lessons')); return snap.docs.map(x => ({ id: x.id, ...x.data() } as Lesson)); }
export async function getArticles() { if (!useFirebase || !db) return articles; const snap = await getDocs(collection(db, 'articles')); return snap.docs.map(x => ({ id: x.id, ...x.data() } as Article)); }
export async function saveLesson(item: Lesson) { if (!useFirebase || !db) { lessons = lessons.some(x => x.id === item.id) ? lessons.map(x => x.id === item.id ? item : x) : [item, ...lessons]; return; } const { id, ...data } = item; if (id) await updateDoc(doc(db, 'lessons', id), data); else await addDoc(collection(db, 'lessons'), data); }
export async function removeLesson(id: string) { if (!useFirebase || !db) { lessons = lessons.filter(x => x.id !== id); return; } await deleteDoc(doc(db, 'lessons', id)); }
export async function sendMessage(message: Omit<ContactMessage, 'id' | 'createdAt' | 'read'>) { const item = { ...message, createdAt: new Date().toISOString(), read: false }; if (!useFirebase || !db) { messages = [{ id: crypto.randomUUID(), ...item }, ...messages]; return; } await addDoc(collection(db, 'messages'), item); }
export async function getMessages() { if (!useFirebase || !db) return messages; const snap = await getDocs(collection(db, 'messages')); return snap.docs.map(x => ({ id: x.id, ...x.data() } as ContactMessage)); }
export async function addView(id: string) { if (!useFirebase || !db) { lessons = lessons.map(x => x.id === id ? { ...x, views: x.views + 1 } : x); return; } await updateDoc(doc(db, 'lessons', id), { views: increment(1) }); }
export async function saveArticle(item: Article) { if (!useFirebase || !db) { articles = articles.some(x => x.id === item.id) ? articles.map(x => x.id === item.id ? item : x) : [item, ...articles]; return; } const { id, ...data } = item; if (id) await updateDoc(doc(db, 'articles', id), data); else await addDoc(collection(db, 'articles'), data); }
