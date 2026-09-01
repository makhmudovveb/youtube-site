import type { Lang, LocalizedTags } from '../types';

/** Позволяет без ошибок открыть и старые записи, где теги были одним массивом. */
export function tagsFor(tags: LocalizedTags | string[], lang: Lang) {
  return Array.isArray(tags) ? tags : tags[lang] || tags.ru || [];
}

export function splitTags(value: string) {
  return value.split(',').map(tag => tag.trim()).filter(Boolean);
}
