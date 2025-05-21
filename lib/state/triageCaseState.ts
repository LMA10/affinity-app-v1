import { create } from 'zustand';
import * as service from '../services/triageCaseService';

export interface TriageCaseState {
  cases: service.Case[];
  notes: service.Note[];
  activeCaseId: string | null;
  activeNoteId: string | null;
  loading: boolean;
  loadCases: () => Promise<void>;
  createCase: (title: string) => Promise<void>;
  deleteCase: (caseId: string) => Promise<void>;
  selectCase: (caseId: string) => Promise<void>;
  loadNotes: (caseId: string) => Promise<void>;
  createNote: (note: service.Note) => Promise<void>;
  updateNote: (note: service.Note) => Promise<void>;
  deleteNote: (noteId: string) => Promise<void>;
  selectNote: (noteId: string) => void;
  renameCase: (caseId: string, newTitle: string) => Promise<void>;
}

export const useTriageCaseState = create<TriageCaseState>((set, get) => ({
  cases: [],
  notes: [],
  activeCaseId: null,
  activeNoteId: null,
  loading: false,
  loadCases: async () => {
    set({ loading: true });
    const cases = await service.getCases();
    set({ cases, loading: false });
  },
  createCase: async (title: string) => {
    set({ loading: true });
    await service.createCase(title);
    await get().loadCases();
    set({ loading: false });
  },
  deleteCase: async (caseId: string) => {
    set({ loading: true });
    await service.deleteCase(caseId);
    await get().loadCases();
    set({ loading: false, activeCaseId: null, notes: [], activeNoteId: null });
  },
  selectCase: async (caseId: string) => {
    set({ activeCaseId: caseId, loading: true });
    const notes = await service.getNotes(caseId);
    set({ notes, loading: false, activeNoteId: notes[0]?.id || null });
  },
  loadNotes: async (caseId: string) => {
    set({ loading: true });
    const notes = await service.getNotes(caseId);
    set({ notes, loading: false });
  },
  createNote: async (note: service.Note) => {
    const caseId = get().activeCaseId;
    if (!caseId) return;
    set({ loading: true });
    await service.createNote(caseId, note);
    await get().loadNotes(caseId);
    await get().loadCases();
    set({ loading: false });
  },
  updateNote: async (note: service.Note) => {
    const caseId = get().activeCaseId;
    if (!caseId) return;
    set({ loading: true });
    await service.updateNote(caseId, note);
    await get().loadNotes(caseId);
    set({ loading: false });
  },
  deleteNote: async (noteId: string) => {
    const caseId = get().activeCaseId;
    if (!caseId) return;
    set({ loading: true });
    await service.deleteNote(caseId, noteId);
    await get().loadNotes(caseId);
    await get().loadCases();
    set({ loading: false, activeNoteId: null });
  },
  selectNote: (noteId: string) => {
    set({ activeNoteId: noteId });
  },
  renameCase: async (caseId: string, newTitle: string) => {
    set({ loading: true });
    await service.renameCase(caseId, newTitle);
    await get().loadCases();
    set({ loading: false });
  },
})); 