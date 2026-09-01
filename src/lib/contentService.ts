import { addDoc, collection, deleteDoc, doc, getDocs, increment, orderBy, query, setDoc, updateDoc, where } from 'firebase/firestore';
import { db, useFirebase } from './firebase';
import { mockArticles, mockLessons } from '../data/mockData';
import type { Article, ChatMessage, ContactMessage, Lesson } from '../types';

// Единый слой данных: при подключении Firebase CRUD пишет в Firestore,
// а до этого интерфейс работает с копией локальных mock-данных.
let lessons = [...mockLessons]; let articles = [...mockArticles]; let messages: ContactMessage[] = []; const localChats = new Map<string, ChatMessage[]>();
export async function getLessons() { if (!useFirebase || !db) return lessons; const snap = await getDocs(collection(db, 'lessons')); return snap.docs.map(x => ({ id: x.id, ...x.data() } as Lesson)); }
export async function getArticles() { if (!useFirebase || !db) return articles; const snap = await getDocs(collection(db, 'articles')); return snap.docs.map(x => ({ id: x.id, ...x.data() } as Article)); }
// setDoc с merge создаёт новый документ и обновляет существующий. Это исправляет
// ошибку "No document to update" при первом сохранении урока или статьи.
export async function saveLesson(item: Lesson) { if (!useFirebase || !db) { lessons = lessons.some(x => x.id === item.id) ? lessons.map(x => x.id === item.id ? item : x) : [item, ...lessons]; return; } const { id, ...data } = item; await setDoc(doc(db, 'lessons', id), data, { merge: true }); }
export async function removeLesson(id: string) { if (!useFirebase || !db) { lessons = lessons.filter(x => x.id !== id); return; } await deleteDoc(doc(db, 'lessons', id)); }
/**
 * Контактное обращение авторизованного человека одновременно становится первым
 * сообщением его единственного чата. Ключ чата — Firebase UID, не id обращения.
 */
export async function sendMessage(message: Omit<ContactMessage, 'id' | 'createdAt' | 'read'>) {
  // Firestore не принимает undefined, поэтому для гостя поле userId не пишем вовсе.
  const { userId, ...contactData } = message;
  const item = { ...contactData, ...(userId ? { userId } : {}), createdAt: new Date().toISOString(), read: false };
  if (!useFirebase || !db) {
    const id = crypto.randomUUID();
    messages = [{ id, ...item }, ...messages];
    if (userId) {
      localChats.set(userId, [...(localChats.get(userId) || []), { id: crypto.randomUUID(), senderId: userId, senderName: message.name, text: message.message, createdAt: item.createdAt, sourceContactId: id }]);
    }
    return;
  }
  // Сначала получаем ID обращения. Он не позволит продублировать его при миграции старых чатов.
  const contactRef = await addDoc(collection(db, 'messages'), item);
  if (userId) {
    await setDoc(doc(db, 'chats', userId), { userId, participantName: message.name, participantEmail: message.email, updatedAt: item.createdAt }, { merge: true });
    await addDoc(collection(db, 'chats', userId, 'messages'), { senderId: userId, senderName: message.name, text: message.message, createdAt: item.createdAt, sourceContactId: contactRef.id });
  }
}
export async function getMessages() { if (!useFirebase || !db) return messages; const snap = await getDocs(collection(db, 'messages')); return snap.docs.map(x => ({ id: x.id, ...x.data() } as ContactMessage)); }
/** Удаление обращения доступно только администратору — это дополнительно защищено Firestore Rules. */
export async function removeMessage(id: string) { if (!useFirebase || !db) { messages = messages.filter(x => x.id !== id); return; } await deleteDoc(doc(db, 'messages', id)); }
export async function markMessageRead(id: string) { if (!useFirebase || !db) { messages = messages.map(x => x.id === id ? { ...x, read: true } : x); return; } await updateDoc(doc(db, 'messages', id), { read: true }); }

/** Читаем сообщения отдельно: polling устойчивее realtime-слушателя в SPA/Vercel. */
export async function getChatMessages(userId: string): Promise<ChatMessage[]> {
  if (!useFirebase || !db) return localChats.get(userId) || [];
  const messagesRef = collection(db, 'chats', userId, 'messages');
  const snapshot = await getDocs(query(messagesRef, orderBy('createdAt', 'asc')));
  return snapshot.docs.map(x => ({ id: x.id, ...x.data() } as ChatMessage));
}

/**
 * Переносит старые обращения авторизованного ученика в его один чат.
 * Вызывается только админом перед открытием диалога. ID обращения хранится
 * в sourceContactId, поэтому повторное открытие чата ничего не дублирует.
 */
export async function syncContactMessagesToChat(userId: string) {
  if (!useFirebase || !db) return;
  const contacts = await getDocs(query(collection(db, 'messages'), where('userId', '==', userId)));
  if (contacts.empty) return;
  const existing = await getChatMessages(userId);
  const imported = new Set(existing.map(item => item.sourceContactId).filter(Boolean));
  const first = contacts.docs[0].data() as Omit<ContactMessage, 'id'>;
  await setDoc(doc(db, 'chats', userId), { userId, participantName: first.name, participantEmail: first.email, updatedAt: new Date().toISOString() }, { merge: true });
  for (const contact of contacts.docs) {
    if (imported.has(contact.id)) continue;
    const data = contact.data() as Omit<ContactMessage, 'id'>;
    await addDoc(collection(db, 'chats', userId, 'messages'), { senderId: userId, senderName: data.name, text: data.message, createdAt: data.createdAt, sourceContactId: contact.id });
  }
}
export async function sendChatMessage(userId: string, message: Omit<ChatMessage, 'id' | 'createdAt'>) {
  if (!useFirebase || !db) { localChats.set(userId, [...(localChats.get(userId) || []), { id: crypto.randomUUID(), ...message, createdAt: new Date().toISOString() }]); return; }
  await setDoc(doc(db, 'chats', userId), { userId, updatedAt: new Date().toISOString() }, { merge: true });
  await addDoc(collection(db, 'chats', userId, 'messages'), { ...message, createdAt: new Date().toISOString() });
}
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
