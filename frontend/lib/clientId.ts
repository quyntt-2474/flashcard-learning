import { v4 as uuidv4 } from 'uuid';

const CLIENT_ID_KEY = 'flashcard_client_id';

export function getOrCreateClientId(): string {
  if (typeof window === 'undefined') return '';
  const existing = localStorage.getItem(CLIENT_ID_KEY);

  if (existing) return existing;
  const id = uuidv4();
  localStorage.setItem(CLIENT_ID_KEY, id);
  return id;
}
