export type Lang = 'ru' | 'uz';
export type Level = 'A1' | 'A2' | 'B1' | 'B2' | 'C1';
export type LocalizedTags = Record<Lang, string[]>;
export interface Lesson { id: string; title: Record<Lang, string>; description: Record<Lang, string>; content?: Record<Lang, string>; youtubeUrl: string; /** Обложка для карточек. */ image: string; /** Необязательная фотография в полной странице урока. */ detailImage?: string; tags: LocalizedTags; level: Level; materials: { name: string; url: string }[]; views: number; createdAt: string; }
export interface Article { id: string; title: Record<Lang, string>; excerpt: Record<Lang, string>; content: Record<Lang, string>; /** Обложка для карточек. */ image: string; /** Необязательная фотография внутри статьи. */ detailImage?: string; tags: LocalizedTags; createdAt: string; }
export interface Comment { id: string; lessonId: string; author: string; text: string; createdAt: string; }
export interface ContactMessage { id: string; name: string; email: string; message: string; createdAt: string; read: boolean; userId?: string; }
/** sourceContactId связывает первое сообщение чата с конкретным обращением. */
export interface ChatMessage { id: string; senderId: string; senderName: string; text: string; createdAt: string; sourceContactId?: string; }
