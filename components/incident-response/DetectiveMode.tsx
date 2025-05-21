import { useState, useEffect, useRef } from 'react';
import CodeMirror from '@uiw/react-codemirror';
import { oneDark } from '@codemirror/theme-one-dark';
import { markdown } from '@codemirror/lang-markdown';
import { javascript } from '@codemirror/lang-javascript';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useIncidentResponseState } from "@/lib/state/incidentResponseState/incidentResponseState";
import { extractIOCs } from "@/lib/services/iocExtractorService";
import { Search, Save, FileText, AlertTriangle, Trash2, Plus, Download, Star, StarOff, Archive, ArchiveRestore, Tag, Menu } from 'lucide-react';
import CryptoJS from 'crypto-js';
import JSZip from 'jszip';
import { useTriageCaseState } from '@/lib/state/triageCaseState';
import { PanelGroup, Panel, PanelResizeHandle } from 'react-resizable-panels';
import React from 'react';
import { EditorView } from '@codemirror/view';
import { lineNumbers } from '@codemirror/view';

interface NoteMeta {
  tags: string[];
  color: string;
  favorite: boolean;
  archived: boolean;
}

interface NoteImage {
  id: string;
  data: string; // base64 encoded image data
  name: string;
  type: string;
}

interface Note {
  id: string;
  title: string;
  content: string;
  created: number;
  updated: number;
  meta: NoteMeta;
  images: NoteImage[];
}

// Define Case interface
interface Case {
  id: string;
  title: string;
  notes: string[];
}

const NOTES_KEY = 'triage_notes_v1';
const ENCRYPTION_KEY = 'triage-mode-demo-key-123'; // For demo, can be user-provided

function encryptNotes(notes: Note[]): string {
  const data = JSON.stringify(notes);
  return CryptoJS.AES.encrypt(data, ENCRYPTION_KEY).toString();
}

function decryptNotes(cipher: string): Note[] {
  try {
    const bytes = CryptoJS.AES.decrypt(cipher, ENCRYPTION_KEY);
    const decrypted = bytes.toString(CryptoJS.enc.Utf8);
    return JSON.parse(decrypted);
  } catch {
    return [];
  }
}

function loadNotes(): Note[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(NOTES_KEY);
    if (!raw) return [];
    return decryptNotes(raw);
  } catch {
    return [];
  }
}

function saveNotes(notes: Note[]) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(NOTES_KEY, encryptNotes(notes));
}

// Add prop types for DetectiveMode
interface DetectiveModeProps {
  addNoteToCase: (noteId: string) => void;
}

// Utility to trim image names and show tooltip for full name
function TrimmedNameWithTooltip({ name, maxLen = 20 }: { name: string; maxLen?: number }) {
  const [show, setShow] = useState(false);
  if (name.length <= maxLen) return <span>{name}</span>;
  const ext = name.includes('.') ? '.' + name.split('.').pop() : '';
  const trimmed = name.slice(0, maxLen - ext.length - 3) + '...' + ext;
  return (
    <span
      className="relative cursor-pointer underline text-blue-400"
      onMouseEnter={() => setShow(true)}
      onMouseLeave={() => setShow(false)}
      onTouchStart={() => setShow(v => !v)}
      onTouchEnd={() => setTimeout(() => setShow(false), 1500)}
    >
      {trimmed}
      {show && (
        <span className="absolute z-50 left-1/2 -translate-x-1/2 top-6 bg-black border border-gray-700 rounded shadow-lg p-1 text-xs text-white whitespace-nowrap">
          {name}
        </span>
      )}
    </span>
  );
}

// Tooltip for image preview
function ImageTooltip({ src, alt, fullName }: { src: string; alt: string; fullName: string }) {
  const [show, setShow] = useState(false);
  return (
    <span
      className="relative cursor-pointer"
      onMouseEnter={() => setShow(true)}
      onMouseLeave={() => setShow(false)}
      onTouchStart={() => setShow(v => !v)}
      onTouchEnd={() => setTimeout(() => setShow(false), 1500)}
    >
      <TrimmedNameWithTooltip name={fullName} />
      {show && (
        <span className="absolute z-50 left-1/2 -translate-x-1/2 top-6 bg-black border border-gray-700 rounded shadow-lg p-1">
          <img src={src} alt={alt} className="max-w-[120px] max-h-[120px] object-contain" style={{ pointerEvents: 'none' }} />
        </span>
      )}
    </span>
  );
}

// Parse markdown for images and render with tooltip
function renderMarkdownWithImageTooltips(text: string) {
  // Regex for ![alt](src)
  const imgRegex = /!\[([^\]]*)\]\(([^)]+)\)/g;
  const parts: React.ReactNode[] = [];
  let lastIndex = 0;
  let match;
  while ((match = imgRegex.exec(text)) !== null) {
    const [full, alt, src] = match;
    parts.push(text.slice(lastIndex, match.index));
    parts.push(<ImageTooltip key={match.index} src={src} alt={alt} fullName={alt} />);
    lastIndex = match.index + full.length;
  }
  parts.push(text.slice(lastIndex));
  return parts;
}

// Highlight search term in text
function highlightText(text: string, term: string) {
  if (!term) return text;
  const regex = new RegExp(`(${term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
  return text.split(regex).map((part, i) =>
    regex.test(part)
      ? <span key={i} className="bg-yellow-400/30 text-yellow-300 px-1 rounded transition-all animate-pulse">{part}</span>
      : part
  );
}

export function DetectiveMode({ addNoteToCase }: DetectiveModeProps) {
  const {
    cases,
    notes,
    activeCaseId,
    activeNoteId,
    loading,
    loadCases,
    createCase,
    deleteCase,
    selectCase,
    loadNotes,
    createNote,
    updateNote,
    deleteNote,
    selectNote,
    renameCase,
  } = useTriageCaseState();

  const [editorValue, setEditorValue] = useState('');
  const [titleValue, setTitleValue] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [iocResults, setIocResults] = useState<Record<string, string[]>>({});
  const [search, setSearch] = useState('');
  const [showArchived, setShowArchived] = useState(false);
  const { setIocResults: setGlobalIocResults } = useIncidentResponseState();
  const [tagInput, setTagInput] = useState('');
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const [editingCaseId, setEditingCaseId] = useState<string | null>(null);
  const [editingCaseTitle, setEditingCaseTitle] = useState('');
  const editorRef = useRef<HTMLDivElement>(null);
  const [isSidebarVisible, setIsSidebarVisible] = useState(true);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [commandPaletteSearch, setCommandPaletteSearch] = useState('');
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  // Load cases on mount
  useEffect(() => { loadCases(); }, []);
  // Load notes when case changes
  useEffect(() => { if (activeCaseId) loadNotes(activeCaseId); }, [activeCaseId]);
  // Set editor when note changes
  useEffect(() => {
    const note = notes.find(n => n.id === activeNoteId);
    if (note) {
      setEditorValue(note.content);
      setTitleValue(note.title);
    } else {
      setEditorValue('');
      setTitleValue('');
    }
  }, [activeNoteId, notes]);

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Save note (Ctrl/Cmd + S)
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        handleSaveNote();
      }
      // New note (Ctrl/Cmd + N)
      else if ((e.ctrlKey || e.metaKey) && e.key === 'n') {
        e.preventDefault();
        handleCreateNote();
      }
      // Toggle sidebar (Ctrl/Cmd + B)
      else if ((e.ctrlKey || e.metaKey) && e.key === 'b') {
        e.preventDefault();
        setIsSidebarVisible(v => !v);
      }
      // Command palette (Ctrl/Cmd + K)
      else if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setIsCommandPaletteOpen(true);
      }
      // Search (Ctrl/Cmd + F)
      else if ((e.ctrlKey || e.metaKey) && e.key === 'f') {
        e.preventDefault();
        const searchInput = document.querySelector('input[placeholder="Search..."]') as HTMLInputElement;
        if (searchInput) {
          searchInput.focus();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Create a new case
  const handleCreateCase = async () => {
    await createCase('New Case');
    await loadCases();
  };

  // Create a new note
  const handleCreateNote = async () => {
    if (!activeCaseId) return;
    const id = Date.now().toString();
    const newNote = {
      id,
      title: 'New Note',
      content: '',
      created: Date.now(),
      updated: Date.now(),
      meta: { tags: [], color: '#ff9800', favorite: false, archived: false },
      images: []
    };
    await createNote(newNote);
    selectNote(id);
  };

  // Save current note
  const handleSaveNote = async () => {
    if (!activeCaseId || !activeNoteId) return;
    const note = notes.find(n => n.id === activeNoteId);
    if (!note) return;
    await updateNote({ ...note, content: editorValue, title: titleValue, updated: Date.now() });
  };

  // Delete note
  const handleDeleteNote = async (id: string) => {
    await deleteNote(id);
  };

  // Add tag
  const addTag = async () => {
    if (!tagInput.trim() || !activeNoteId) return;
    const note = notes.find(n => n.id === activeNoteId);
    if (!note || note.meta.tags.includes(tagInput.trim())) return;
    await updateNote({ ...note, meta: { ...note.meta, tags: [...note.meta.tags, tagInput.trim()] } });
    setTagInput('');
  };

  // Remove tag
  const removeTag = async (tag: string) => {
    if (!activeNoteId) return;
    const note = notes.find(n => n.id === activeNoteId);
    if (!note) return;
    await updateNote({ ...note, meta: { ...note.meta, tags: note.meta.tags.filter(t => t !== tag) } });
  };

  // Change color
  const changeColor = async (color: string) => {
    if (!activeNoteId) return;
    const note = notes.find(n => n.id === activeNoteId);
    if (!note) return;
    await updateNote({ ...note, meta: { ...note.meta, color } });
  };

  // Toggle favorite
  const toggleFavorite = async (id: string) => {
    const note = notes.find(n => n.id === id);
    if (!note) return;
    await updateNote({ ...note, meta: { ...note.meta, favorite: !note.meta.favorite } });
  };

  // Toggle archive
  const toggleArchive = async (id: string) => {
    const note = notes.find(n => n.id === id);
    if (!note) return;
    await updateNote({ ...note, meta: { ...note.meta, archived: !note.meta.archived } });
    if (activeNoteId === id) selectNote('');
  };

  // Analyze IOCs in current note
  const analyzeIocs = async () => {
    setIsAnalyzing(true);
    try {
      const words = editorValue.match(/\b\w[\w\-\.:/@]+\b/g) || [];
      const textForAnalysis = words.join('\n');
      const { iocResults } = await extractIOCs(textForAnalysis);
      setIocResults(iocResults);
      setGlobalIocResults(iocResults);
    } catch (e) {
      setIocResults({});
    }
    setIsAnalyzing(false);
  };

  // Handle image paste
  const handlePaste = async (e: React.ClipboardEvent<HTMLDivElement>) => {
    const items = e.clipboardData?.items;
    if (!items) return;
    for (const item of items) {
      if (item.type.startsWith('image/')) {
        e.preventDefault();
        const file = item.getAsFile();
        if (!file) continue;
        const reader = new FileReader();
        reader.onload = async (ev) => {
          const base64Data = ev.target?.result as string;
          if (!base64Data) return;
          const activeNote = notes.find(n => n.id === activeNoteId);
          if (!activeNote) return;
          const newImage: NoteImage = {
            id: Date.now().toString(),
            data: base64Data,
            name: file.name,
            type: file.type
          };
          await updateNote({
            ...activeNote,
            images: [...(activeNote.images || []), newImage],
            updated: Date.now()
          });
        };
        reader.readAsDataURL(file);
      }
    }
  };

  // Handle drag and drop
  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    const files = e.dataTransfer.files;
    for (const file of files) {
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = async (ev) => {
          const base64Data = ev.target?.result as string;
          if (!base64Data) return;
          const activeNote = notes.find(n => n.id === activeNoteId);
          if (!activeNote) return;
          const newImage: NoteImage = {
            id: Date.now().toString(),
            data: base64Data,
            name: file.name,
            type: file.type
          };
          await updateNote({
            ...activeNote,
            images: [...(activeNote.images || []), newImage],
            updated: Date.now()
          });
        };
        reader.readAsDataURL(file);
      }
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  // Export note as .txt
  const exportNote = async () => {
    if (!activeNoteId) return;
    const note = notes.find(n => n.id === activeNoteId);
    if (!note) return;

    // Create a zip file
    const zip = new JSZip();
    
    // Add the note content
    const { iocResults } = await extractIOCs(note.content);
    let iocSection = '\n\n---\nDetected IOCs:\n';
    if (Object.keys(iocResults).length === 0) {
      iocSection += 'None';
    } else {
      for (const [type, values] of Object.entries(iocResults)) {
        iocSection += `- ${type}: ${values.join(', ')}\n`;
      }
    }
    
    const noteContent = `Title: ${note.title}\nCreated: ${new Date(note.created).toLocaleString()}\nUpdated: ${new Date(note.updated).toLocaleString()}\nTags: ${note.meta.tags.join(', ')}\nColor: ${note.meta.color}\n\n${note.content}${iocSection}`;
    zip.file('note.txt', noteContent);

    // Add images if any
    if (note.images && note.images.length > 0) {
      const imagesFolder = zip.folder('images');
      if (imagesFolder) {
        note.images.forEach((image: NoteImage) => {
          const base64Data = image.data.split(',')[1];
          imagesFolder.file(image.name, base64Data, { base64: true });
        });
      }
    }

    // Generate and download the zip
    zip.generateAsync({ type: 'blob' }).then((content: Blob) => {
      const url = URL.createObjectURL(content);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${note.title || 'note'}.zip`;
      a.click();
      URL.revokeObjectURL(url);
    });
  };

  // Export case as folder structure
  const handleExportCase = async () => {
    if (!activeCaseId) return;
    const caseItem = cases.find(c => c.id === activeCaseId);
    if (!caseItem) return;
    
    const folderName = caseItem.title.replace(/\s+/g, '_');
    const zip = new JSZip();
    const folder = zip.folder(folderName);
    if (!folder) return;

    for (const noteId of caseItem.notes) {
      const note = notes.find(n => n.id === noteId);
      if (note) {
        const noteFolder = folder.folder(note.title.replace(/\s+/g, '_'));
        if (!noteFolder) continue;

        // Add note content
        const { iocResults } = await extractIOCs(note.content);
        let iocSection = '\n\n---\nDetected IOCs:\n';
        if (Object.keys(iocResults).length === 0) {
          iocSection += 'None';
        } else {
          for (const [type, values] of Object.entries(iocResults)) {
            iocSection += `- ${type}: ${values.join(', ')}\n`;
          }
        }
        
        const noteContent = `Title: ${note.title}\nCreated: ${new Date(note.created).toLocaleString()}\nUpdated: ${new Date(note.updated).toLocaleString()}\nTags: ${note.meta.tags.join(', ')}\nColor: ${note.meta.color}\n\n${note.content}${iocSection}`;
        noteFolder.file('note.txt', noteContent);

        // Add images if any
        if (note.images && note.images.length > 0) {
          const imagesFolder = noteFolder.folder('images');
          if (imagesFolder) {
            note.images.forEach((image: NoteImage) => {
              const base64Data = image.data.split(',')[1];
              imagesFolder.file(image.name, base64Data, { base64: true });
            });
          }
        }
      }
    }

    zip.generateAsync({ type: 'blob' }).then((content: Blob) => {
      const url = URL.createObjectURL(content);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${folderName}.zip`;
      a.click();
      URL.revokeObjectURL(url);
    });
  };

  // Command palette actions
  const commandPaletteActions = [
    { name: 'New Note', action: handleCreateNote },
    { name: 'Save Note', action: handleSaveNote },
    { name: 'Export Note', action: exportNote },
    { name: 'Export Case', action: handleExportCase },
    { name: 'Toggle Sidebar', action: () => setIsSidebarVisible(v => !v) },
    { name: 'Toggle Archived', action: () => setShowArchived(v => !v) },
  ];

  const filteredCommands = commandPaletteActions.filter(cmd => 
    cmd.name.toLowerCase().includes(commandPaletteSearch.toLowerCase())
  );

  // UI: filter notes
  const filteredNotes = notes.filter(n => {
    if (!showArchived && n.meta.archived) return false;
    if (search && !n.title.toLowerCase().includes(search.toLowerCase()) && !n.content.toLowerCase().includes(search.toLowerCase()) && !n.meta.tags.some(t => t.toLowerCase().includes(search.toLowerCase()))) return false;
    return true;
  });

  // Compute search results for creative panel
  const searchResults = search
    ? notes
        .filter(n =>
          (n.title && n.title.toLowerCase().includes(search.toLowerCase())) ||
          (n.content && n.content.toLowerCase().includes(search.toLowerCase())) ||
          (n.meta.tags && n.meta.tags.some(t => t.toLowerCase().includes(search.toLowerCase())))
        )
        .map(note => {
          // Find all matching lines
          const lines = note.content.split('\n');
          const matches = lines
            .map((line, idx) => ({ line, idx }))
            .filter(({ line }) => line.toLowerCase().includes(search.toLowerCase()));
          return { note, matches };
        })
    : [];

  // Keyboard shortcut: Enter in search box jumps to first result
  const searchInputRef = useRef<HTMLInputElement>(null);
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (document.activeElement === searchInputRef.current && e.key === 'Enter' && searchResults.length > 0) {
        selectNote(searchResults[0].note.id);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [searchResults, selectNote]);

  // Responsive: show sidebar as drawer on mobile
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;

  // Add delete button for cases
  const handleDeleteCase = async (caseId: string) => {
    if (window.confirm('Are you sure you want to delete this case and all its notes?')) {
      await deleteCase(caseId);
    }
  };

  // Add image delete handler
  const handleDeleteImage = async (imageId: string) => {
    if (!activeNoteId) return;
    const note = notes.find(n => n.id === activeNoteId);
    if (!note) return;
    await updateNote({
      ...note,
      images: note.images.filter(img => img.id !== imageId),
      updated: Date.now()
    });
  };

  // After filteredNotes and searchResults
  const activeNote = notes.find(n => n.id === activeNoteId);

  return (
    <div className="w-full h-full flex flex-col md:flex-row">
      {/* Mobile menu button */}
      <div className="md:hidden flex items-center justify-between p-2 bg-[#20262b] border-b border-orange-900/30">
        <button onClick={() => setMobileSidebarOpen(v => !v)} className="p-2 rounded bg-orange-700 text-white">
          <Menu className="w-6 h-6" />
        </button>
        <span className="font-bold text-orange-400 text-lg">Detective Mode</span>
      </div>
      {/* Sidebar (Cases & Notes) */}
      <div className={`fixed inset-0 z-40 bg-black/60 transition-opacity md:static md:bg-transparent md:z-auto ${mobileSidebarOpen ? 'block' : 'hidden'} md:block`} onClick={() => setMobileSidebarOpen(false)} />
      <div className={`fixed top-0 left-0 bottom-0 w-4/5 max-w-xs bg-[#20262b] z-50 transform transition-transform md:static md:w-[15vw] md:max-w-none md:transform-none ${mobileSidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0`} style={{height: '100vh'}}>
        <div className="flex flex-col h-full">
          {/* Cases Sidebar */}
          <div className="flex-1 overflow-y-auto border-b border-orange-900/30">
            <div className="flex items-center justify-between p-4 border-b border-orange-900/20">
              <span className="font-bold text-orange-400 text-lg">Cases</span>
              <button onClick={handleCreateCase} className="p-1 rounded hover:bg-orange-700/20"><Plus className="w-5 h-5 text-orange-400" /></button>
            </div>
            <div className="flex-1 overflow-y-auto">
              {cases.length === 0 && <div className="text-orange-200 p-4 text-sm">No cases available.</div>}
              {cases.map(caseItem => (
                <div key={caseItem.id} className={`flex items-center px-4 py-2 cursor-pointer border-b border-orange-900/20 ${caseItem.id === activeCaseId ? 'bg-orange-900/10 font-bold' : 'hover:bg-orange-900/5'}`}
                  onClick={() => selectCase(caseItem.id)}>
                  {editingCaseId === caseItem.id ? (
                    <input
                      className="flex-1 truncate text-orange-200 font-semibold bg-[#181f22] border border-orange-700 px-2 py-1 rounded"
                      value={editingCaseTitle}
                      autoFocus
                      onChange={e => setEditingCaseTitle(e.target.value)}
                      onBlur={async () => {
                        if (editingCaseTitle.trim() && editingCaseTitle !== caseItem.title) {
                          await renameCase(caseItem.id, editingCaseTitle.trim());
                        }
                        setEditingCaseId(null);
                      }}
                      onKeyDown={async e => {
                        if (e.key === 'Enter') {
                          if (editingCaseTitle.trim() && editingCaseTitle !== caseItem.title) {
                            await renameCase(caseItem.id, editingCaseTitle.trim());
                          }
                          setEditingCaseId(null);
                        } else if (e.key === 'Escape') {
                          setEditingCaseId(null);
                        }
                      }}
                    />
                  ) : (
                    <span
                      className="flex-1 truncate text-orange-200 font-semibold"
                      onDoubleClick={e => {
                        e.stopPropagation();
                        setEditingCaseId(caseItem.id);
                        setEditingCaseTitle(caseItem.title);
                      }}
                    >
                      {caseItem.title}
                    </span>
                  )}
                  <span className="ml-2 text-xs text-orange-400">{caseItem.notes.length}</span>
                  <button
                    onClick={e => { e.stopPropagation(); handleDeleteCase(caseItem.id); }}
                    className="ml-2 p-1 rounded hover:bg-red-900/30"
                    title="Delete Case"
                  >
                    <Trash2 className="w-4 h-4 text-red-400" />
                  </button>
                </div>
              ))}
            </div>
          </div>
          {/* Notes Sidebar */}
          <div className="flex-1 overflow-y-auto">
            <div className="flex items-center justify-between p-4 border-b border-orange-900/30">
              <span className="font-bold text-orange-400 text-lg">Notes</span>
              <button onClick={handleCreateNote} className="p-1 rounded hover:bg-orange-700/20"><Plus className="w-5 h-5 text-orange-400" /></button>
            </div>
            <div className="p-2">
              <div className="relative">
                <input
                  ref={searchInputRef}
                  className="w-full rounded bg-[#181f22] border border-orange-900/30 px-2 py-1 text-orange-200 text-sm mb-2"
                  placeholder="Search..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                />
                {search && (
                  <div className="absolute left-0 right-0 top-full z-20 bg-[#23272e] border border-orange-900/30 rounded shadow-lg mt-1 max-h-64 overflow-y-auto animate-fade-in">
                    {searchResults.length === 0 ? (
                      <div className="flex flex-col items-center justify-center p-4 text-orange-300 text-sm">
                        <Search className="w-6 h-6 mb-2 animate-bounce" />
                        No results found!
                      </div>
                    ) : (
                      searchResults.map(({ note, matches }, i) => (
                        <div key={note.id} className="p-2 border-b border-orange-900/30 last:border-b-0 cursor-pointer hover:bg-orange-900/10 transition-all" onClick={() => selectNote(note.id)}>
                          <div className="font-bold text-orange-200 mb-1">{highlightText(note.title, search)}</div>
                          {matches.length > 0 && (
                            <div className="text-xs text-orange-100">
                              {matches.map(({ line, idx }) => (
                                <div key={idx} className="mb-1 pl-2 border-l-2 border-yellow-400">
                                  <span className="text-yellow-400 mr-2">{idx + 1}</span>
                                  {highlightText(line, search)}
                                </div>
                              ))}
                            </div>
                          )}
                          {i < searchResults.length - 1 && <div className="my-2 border-t border-dashed border-orange-700" />}
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>
              <div className="flex gap-2 mb-2">
                <button onClick={() => setShowArchived(a => !a)} className={`px-2 py-1 rounded text-xs font-semibold border ${showArchived ? 'bg-orange-700 text-white border-orange-700' : 'bg-gray-700 text-gray-200 border-gray-700'} transition`}>{showArchived ? 'View Active' : 'View Archived'}</button>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto">
              {filteredNotes.length === 0 && <div className="text-orange-200 p-4 text-sm">No notes available.</div>}
              {filteredNotes.map(note => (
                <div key={note.id} className={`flex items-center px-4 py-2 cursor-pointer border-b border-orange-900/20 ${note.id === activeNoteId ? 'bg-orange-900/10' : 'hover:bg-orange-900/5'}`}
                  style={{ borderLeft: `4px solid ${note.meta.color}` }}
                  onClick={() => selectNote(note.id)}>
                  <span className="flex-1 truncate text-orange-200 font-semibold">{note.title}</span>
                  {note.meta.favorite ? <Star className="w-4 h-4 text-yellow-400 mr-1" /> : null}
                  {note.meta.archived ? <Archive className="w-4 h-4 text-orange-400 mr-1" /> : null}
                  <button onClick={e => { e.stopPropagation(); toggleFavorite(note.id); }} className="ml-1 p-1 rounded hover:bg-yellow-900/30"><Star className={`w-4 h-4 ${note.meta.favorite ? 'text-yellow-400' : 'text-yellow-700'}`} /></button>
                  <button onClick={e => { e.stopPropagation(); toggleArchive(note.id); }} className="ml-1 p-1 rounded hover:bg-orange-900/30">{note.meta.archived ? <ArchiveRestore className="w-4 h-4 text-orange-400" /> : <Archive className="w-4 h-4 text-orange-400" />}</button>
                  <button onClick={e => { e.stopPropagation(); handleDeleteNote(note.id); }} className="ml-1 p-1 rounded hover:bg-red-900/30"><Trash2 className="w-4 h-4 text-red-400" /></button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      {/* Main Editor Panel */}
      <div className="flex-1 flex flex-col bg-[#181f22] min-h-0 w-full md:w-[85vw]">
        <div className="flex flex-col md:flex-row items-stretch md:items-center gap-2 p-2 md:p-4 border-b border-orange-900/30">
          <FileText className="w-5 h-5 text-orange-400 hidden md:block" />
          <input
            className="bg-transparent border-none outline-none text-xl md:text-2xl font-bold text-orange-400 flex-1 min-w-0"
            value={titleValue}
            onChange={e => setTitleValue(e.target.value)}
            onBlur={handleSaveNote}
            placeholder="Note Title..."
            maxLength={60}
          />
          <div className="flex flex-row flex-wrap gap-2 mt-2 md:mt-0">
            <Button onClick={handleSaveNote} className="bg-green-700 hover:bg-green-800 text-white px-3 py-1 text-sm md:text-base"><Save className="w-4 h-4 mr-1" />Save (Ctrl+S)</Button>
            <Button onClick={exportNote} className="bg-blue-700 hover:bg-blue-800 text-white px-3 py-1 text-sm md:text-base"><Download className="w-4 h-4 mr-1" />Export</Button>
            {activeCaseId && (
              <Button onClick={handleExportCase} className="bg-orange-700 hover:bg-orange-800 text-white px-3 py-1 text-sm md:text-base">Export Case</Button>
            )}
          </div>
        </div>
        {/* Meta management */}
        {activeNote && (
          <div className="flex flex-col md:flex-row items-start md:items-center gap-2 px-2 md:px-4 py-2 border-b border-orange-900/30 bg-[#20262b] text-xs md:text-sm">
            <div className="flex items-center gap-2">
              <span className="text-xs text-orange-300">Color:</span>
              <input type="color" value={activeNote.meta.color} onChange={e => changeColor(e.target.value)} className="w-6 h-6 p-0 border-none bg-transparent" />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-orange-300">Tags:</span>
              {activeNote.meta.tags.map(tag => (
                <span key={tag} className="bg-orange-700 text-white px-2 py-0.5 rounded text-xs font-semibold flex items-center gap-1">{tag} <button onClick={() => removeTag(tag)} className="ml-1"><Tag className="w-3 h-3 text-orange-200" /></button></span>
              ))}
              <input
                className="bg-[#181f22] border border-orange-900/30 px-1 py-0.5 rounded text-xs text-orange-200 w-20"
                value={tagInput}
                onChange={e => setTagInput(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') addTag(); }}
                placeholder="+tag"
                maxLength={20}
              />
              <Button onClick={addTag} className="bg-orange-700 hover:bg-orange-800 text-white px-2 py-1 text-xs ml-1"><Plus className="w-3 h-3" /></Button>
            </div>
            <div className="flex items-center gap-2 text-xs text-orange-300">
              <span>Created: {new Date(activeNote.created).toLocaleString()}</span>
              <span>Updated: {new Date(activeNote.updated).toLocaleString()}</span>
            </div>
          </div>
        )}
        <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
          <div 
            ref={editorRef}
            onPaste={handlePaste}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            className="flex-1 min-h-0 overflow-hidden"
            style={{ wordBreak: 'break-word', overflowWrap: 'anywhere' }}
          >
            <CodeMirror
              value={editorValue}
              height={isMobile ? '200px' : '300px'}
              theme={oneDark}
              extensions={[markdown(), javascript(), EditorView.lineWrapping, lineNumbers()]}
              onChange={(val) => setEditorValue(val)}
              onBlur={handleSaveNote}
              className="flex-1 text-base min-h-0 overflow-hidden"
              placeholder="Write your triage notes here... (Drag & drop or paste images)"
            />
            {/* Markdown preview with image tooltips */}
            <div className="mt-2 p-2 bg-[#23272e] rounded text-orange-100 text-sm whitespace-pre-wrap break-words overflow-x-auto">
              {renderMarkdownWithImageTooltips(editorValue)}
            </div>
          </div>
          <div className="flex flex-col md:flex-row gap-2 p-2 md:p-4 border-t border-orange-900/30">
            <Button
              onClick={analyzeIocs}
              className="bg-orange-500 hover:bg-orange-600 text-white font-semibold text-sm md:text-base"
              disabled={isAnalyzing || !editorValue.trim()}
            >
              <Search className="w-4 h-4 mr-2" />
              {isAnalyzing ? 'Analyzing...' : 'Analyze IOCs'}
            </Button>
            <span className="text-xs text-orange-300 self-center">{editorValue.length} characters</span>
          </div>
          {Object.keys(iocResults).length > 0 && (
            <div className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="w-4 h-4 text-orange-400" />
                <h3 className="text-sm font-semibold text-orange-400">Detected IOCs</h3>
              </div>
              <div className="p-4 bg-[#181f22] rounded-md border border-orange-900/30 text-orange-200 text-xs">
                {Object.entries(iocResults).map(([type, values]) => (
                  <div key={type} className="mb-2">
                    <span className="font-bold text-orange-400">{type}:</span> {values.join(', ')}
                  </div>
                ))}
              </div>
            </div>
          )}
          {activeNote && activeNote.images.length > 0 && (
            <div className="mt-2 p-2 bg-[#23272e] rounded text-orange-100 text-sm flex flex-wrap gap-4">
              {activeNote.images.map((img) => (
                <div key={img.id} className="flex flex-col items-center">
                  <span className="mb-1">
                    <ImageTooltip src={img.data} alt={img.name} fullName={img.name} />
                  </span>
                  <button
                    onClick={() => handleDeleteImage(img.id)}
                    className="text-xs text-red-400 hover:underline mt-1"
                  >
                    Delete
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
        {/* Toast notification */}
        {toastMsg && (
          <div style={{ position: 'fixed', bottom: 16, right: 16, left: 16, background: '#ff9800', color: 'white', padding: '12px 24px', borderRadius: 8, fontWeight: 'bold', zIndex: 9999, boxShadow: '0 2px 8px rgba(0,0,0,0.2)', maxWidth: 400, margin: 'auto' }}>{toastMsg}</div>
        )}
      </div>
      {/* Command Palette - full screen on mobile */}
      {isCommandPaletteOpen && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="bg-[#20262b] rounded-lg shadow-xl w-full max-w-2xl mx-2 md:mx-4">
            <div className="p-4 border-b border-orange-900/30">
              <input
                type="text"
                className="w-full bg-[#181f22] border border-orange-900/30 rounded px-3 py-2 text-orange-200"
                placeholder="Type a command or search..."
                value={commandPaletteSearch}
                onChange={e => setCommandPaletteSearch(e.target.value)}
                autoFocus
              />
            </div>
            <div className="max-h-96 overflow-y-auto">
              {filteredCommands.map((cmd, i) => (
                <button
                  key={i}
                  className="w-full px-4 py-2 text-left text-orange-200 hover:bg-orange-900/20 flex items-center gap-2"
                  onClick={() => {
                    cmd.action();
                    setIsCommandPaletteOpen(false);
                    setCommandPaletteSearch('');
                  }}
                >
                  {cmd.name}
                </button>
              ))}
            </div>
            <div className="p-4 border-t border-orange-900/30 text-xs text-orange-400">
              Press Esc to close
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 