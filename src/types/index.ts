export type Lang = 'ru' | 'uz';
export type Level = 'A1' | 'A2' | 'B1' | 'B2' | 'C1';
export interface Lesson { id: string; title: Record<Lang, string>; description: Record<Lang, string>; content?: Record<Lang, string>; youtubeUrl: string; image: string; tags: string[]; level: Level; materials: { name: string; url: string }[]; views: number; createdAt: string; }
export interface Article { id: string; title: Record<Lang, string>; excerpt: Record<Lang, string>; content: Record<Lang, string>; image: string; tags: string[]; createdAt: string; }
export interface Comment { id: string; lessonId: string; author: string; text: string; createdAt: string; }
export interface ContactMessage { id: string; name: string; email: string; message: string; createdAt: string; read: boolean; userId?: string; }
export interface ChatMessage { id: string; senderId: string; senderName: string; text: string; createdAt: string; }
