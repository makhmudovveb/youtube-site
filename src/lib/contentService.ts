import { addDoc, collection, deleteDoc, doc, getDocs, increment, setDoc, updateDoc } from 'firebase/firestore';
import { db, useFirebase } from './firebase';
import { mockArticles, mockLessons } from '../data/mockData';
import type { Article, ContactMessage, Lesson } from '../types';

// Единый слой данных: при подключении Firebase CRUD пишет в Firestore,
// а до этого интерфейс работает с копией локальных mock-данных.
let lessons = [...mockLessons]; let articles = [...mockArticles]; let messages: ContactMessage[] = [];
export async function getLessons() { if (!useFirebase || !db) return lessons; const snap = await getDocs(collection(db, 'lessons')); return snap.docs.map(x => ({ id: x.id, ...x.data() } as Lesson)); }
export async function getArticles() { if (!useFirebase || !db) return articles; const snap = await getDocs(collection(db, 'articles')); return snap.docs.map(x => ({ id: x.id, ...x.data() } as Article)); }
// setDoc с merge создаёт новый документ и обновляет существующий. Это исправляет
// ошибку "No document to update" при первом сохранении урока или статьи.
export async function saveLesson(item: Lesson) { if (!useFirebase || !db) { lessons = lessons.some(x => x.id === item.id) ? lessons.map(x => x.id === item.id ? item : x) : [item, ...lessons]; return; } const { id, ...data } = item; await setDoc(doc(db, 'lessons', id), data, { merge: true }); }
export async function removeLesson(id: string) { if (!useFirebase || !db) { lessons = lessons.filter(x => x.id !== id); return; } await deleteDoc(doc(db, 'lessons', id)); }
export async function sendMessage(message: Omit<ContactMessage, 'id' | 'createdAt' | 'read'>) { const item = { ...message, createdAt: new Date().toISOString(), read: false }; if (!useFirebase || !db) { messages = [{ id: crypto.randomUUID(), ...item }, ...messages]; return; } await addDoc(collection(db, 'messages'), item); }
export async function getMessages() { if (!useFirebase || !db) return messages; const snap = await getDocs(collection(db, 'messages')); return snap.docs.map(x => ({ id: x.id, ...x.data() } as ContactMessage)); }
/** Удаление обращения доступно только администратору — это дополнительно защищено Firestore Rules. */
export async function removeMessage(id: string) { if (!useFirebase || !db) { messages = messages.filter(x => x.id !== id); return; } await deleteDoc(doc(db, 'messages', id)); }
export async function addView(id: string) { if (!useFirebase || !db) { lessons = lessons.map(x => x.id === id ? { ...x, views: x.views + 1 } : x); return; } await updateDoc(doc(db, 'lessons', id), { views: increment(1) }); }
export async function saveArticle(item: Article) { if (!useFirebase || !db) { articles = articles.some(x => x.id === item.id) ? articles.map(x => x.id === item.id ? item : x) : [item, ...articles]; return; } const { id, ...data } = item; await setDoc(doc(db, 'articles', id), data, { merge: true }); }
export async function removeArticle(id: string) { if (!useFirebase || !db) { articles = articles.filter(x => x.id !== id); return; } await deleteDoc(doc(db, 'articles', id)); }

/**
 * Загружает изображение в Cloudinary и возвращает его CDN URL.
 * В браузер попадают только cloud name и unsigned preset; API secret никогда
 * не добавляется в .env Vite. В настройках preset ограничьте типы/размер файлов.
 */
export async function uploadImage(file: File, _folder: 'lesson-images' | 'article-images') {
  const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
  const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;
  if (!cloudName || !uploadPreset) throw new Error('Настройте VITE_CLOUDINARY_CLOUD_NAME и VITE_CLOUDINARY_UPLOAD_PRESET в .env.local.');
  const body = new FormData(); body.append('file', file); body.append('upload_preset', uploadPreset);
  const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, { method: 'POST', body });
  const payload = await response.json() as { secure_url?: string; error?: { message?: string } };
  if (!response.ok || !payload.secure_url) throw new Error(payload.error?.message || 'Cloudinary не принял изображение.');
  return payload.secure_url;
}
