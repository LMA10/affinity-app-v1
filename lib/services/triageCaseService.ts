import { set, get, del, update, keys } from 'idb-keyval';
import CryptoJS from 'crypto-js';

const ENCRYPTION_KEY = 'TRIAGE_DEMO_KEY';

function encryptData(data: any): string {
  const json = JSON.stringify(data);
  return CryptoJS.AES.encrypt(json, ENCRYPTION_KEY).toString();
}

function decryptData(cipher: string): any {
  try {
    const bytes = CryptoJS.AES.decrypt(cipher, ENCRYPTION_KEY);
    const decrypted = bytes.toString(CryptoJS.enc.Utf8);
    return JSON.parse(decrypted);
  } catch {
    return null;
  }
}

export interface Note {
  id: string;
  title: string;
  content: string;
  created: number;
  updated: number;
  meta: {
    tags: string[];
    color: string;
    favorite: boolean;
    archived: boolean;
  };
  images: {
    id: string;
    data: string; // base64 encoded image data
    name: string;
    type: string;
  }[];
}

export interface Case {
  id: string;
  title: string;
  notes: string[]; // note ids
}

const CASES_KEY = 'triage_cases';

// Helper to get all cases
export async function getCases(): Promise<Case[]> {
  const cipher = await get(CASES_KEY);
  if (!cipher) return [];
  const data = decryptData(cipher);
  return data || [];
}

export async function saveCases(cases: Case[]): Promise<void> {
  await set(CASES_KEY, encryptData(cases));
}

export async function createCase(title: string): Promise<Case> {
  const cases = await getCases();
  const newCase: Case = { id: Date.now().toString(), title, notes: [] };
  await saveCases([newCase, ...cases]);
  return newCase;
}

export async function deleteCase(caseId: string): Promise<void> {
  const cases = await getCases();
  const filtered = cases.filter(c => c.id !== caseId);
  await saveCases(filtered);
  // Delete all notes for this case
  const noteKeys = (await keys()).filter(k => typeof k === 'string' && k.startsWith(`triage_case_${caseId}_note_`));
  await Promise.all(noteKeys.map(k => del(k)));
}

export async function getNotes(caseId: string): Promise<Note[]> {
  const noteKeys = (await keys()).filter(k => typeof k === 'string' && k.startsWith(`triage_case_${caseId}_note_`));
  const ciphers = await Promise.all(noteKeys.map(k => get(k)));
  const notes = ciphers.map(cipher => cipher ? decryptData(cipher) : null).filter(Boolean);
  return notes as Note[];
}

export async function createNote(caseId: string, note: Note): Promise<void> {
  await set(`triage_case_${caseId}_note_${note.id}`, encryptData(note));
  // Add note id to case
  const cases = await getCases();
  const idx = cases.findIndex(c => c.id === caseId);
  if (idx !== -1 && !cases[idx].notes.includes(note.id)) {
    cases[idx].notes.push(note.id);
    await saveCases(cases);
  }
}

export async function updateNote(caseId: string, note: Note): Promise<void> {
  await set(`triage_case_${caseId}_note_${note.id}`, encryptData(note));
}

export async function deleteNote(caseId: string, noteId: string): Promise<void> {
  await del(`triage_case_${caseId}_note_${noteId}`);
  // Remove note id from case
  const cases = await getCases();
  const idx = cases.findIndex(c => c.id === caseId);
  if (idx !== -1) {
    cases[idx].notes = cases[idx].notes.filter(id => id !== noteId);
    await saveCases(cases);
  }
}

export async function renameCase(caseId: string, newTitle: string): Promise<void> {
  const cases = await getCases();
  const idx = cases.findIndex(c => c.id === caseId);
  if (idx !== -1) {
    cases[idx].title = newTitle;
    await saveCases(cases);
  }
} 