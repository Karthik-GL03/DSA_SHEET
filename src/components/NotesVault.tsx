'use client';

import React, { useState } from 'react';
import { ProblemNote, Difficulty } from '@/lib/types';
import { 
  FileText, 
  Search, 
  Plus, 
  Tag, 
  Star, 
  Trash2, 
  Edit3, 
  Clock, 
  HardDrive, 
  BookMarked,
  X,
  ExternalLink
} from 'lucide-react';

interface NotesVaultProps {
  notes: ProblemNote[];
  onSaveNote: (note: ProblemNote) => void;
  onDeleteNote: (id: string) => void;
  activeNoteToEdit: ProblemNote | null;
  setActiveNoteToEdit: (note: ProblemNote | null) => void;
}

export const NotesVault: React.FC<NotesVaultProps> = ({
  notes,
  onSaveNote,
  onDeleteNote,
  activeNoteToEdit,
  setActiveNoteToEdit
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState<string>('All');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form states for creating / editing note
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [platform, setPlatform] = useState<'leetcode' | 'codeforces' | 'geeksforgeeks'>('leetcode');
  const [difficulty, setDifficulty] = useState<Difficulty>('Medium');
  const [approach, setApproach] = useState('');
  const [timeComplexity, setTimeComplexity] = useState('');
  const [spaceComplexity, setSpaceComplexity] = useState('');
  const [tagsInput, setTagsInput] = useState('');
  const [content, setContent] = useState('');
  const [isFavorite, setIsFavorite] = useState(false);

  // Collect all unique tags
  const allTags = new Set<string>();
  notes.forEach(n => n.tags.forEach(t => allTags.add(t)));

  const openNewNoteModal = () => {
    setTitle('');
    setSlug('');
    setPlatform('leetcode');
    setDifficulty('Medium');
    setApproach('');
    setTimeComplexity('O(N)');
    setSpaceComplexity('O(1)');
    setTagsInput('Must-Revise');
    setContent('');
    setIsFavorite(false);
    setActiveNoteToEdit(null);
    setIsModalOpen(true);
  };

  const openEditModal = (note: ProblemNote) => {
    setTitle(note.problemTitle);
    setSlug(note.problemSlug);
    setPlatform(note.platform);
    setDifficulty(note.difficulty);
    setApproach(note.approach || '');
    setTimeComplexity(note.timeComplexity || '');
    setSpaceComplexity(note.spaceComplexity || '');
    setTagsInput(note.tags.join(', '));
    setContent(note.content);
    setIsFavorite(note.isFavorite);
    setActiveNoteToEdit(note);
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const parsedTags = tagsInput
      .split(',')
      .map(t => t.trim())
      .filter(t => t.length > 0);

    const noteToSave: ProblemNote = {
      id: activeNoteToEdit ? activeNoteToEdit.id : `note-${Date.now()}`,
      problemTitle: title.trim(),
      problemSlug: slug.trim() || title.toLowerCase().replace(/[^a-z0-9]/g, '-'),
      platform,
      difficulty,
      approach: approach.trim(),
      timeComplexity: timeComplexity.trim(),
      spaceComplexity: spaceComplexity.trim(),
      tags: parsedTags,
      content: content.trim(),
      isFavorite,
      createdAt: activeNoteToEdit ? activeNoteToEdit.createdAt : new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    onSaveNote(noteToSave);
    setIsModalOpen(false);
  };

  const filteredNotes = notes.filter(n => {
    if (selectedTag !== 'All' && !n.tags.includes(selectedTag)) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = n.problemTitle.toLowerCase().includes(q);
      const matchContent = n.content.toLowerCase().includes(q);
      const matchTags = n.tags.some(t => t.toLowerCase().includes(q));
      if (!matchTitle && !matchContent && !matchTags) return false;
    }
    return true;
  });

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="glass-panel rounded-2xl p-6 border border-dark-800">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-purple-500/10 text-purple-400">
              <FileText className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white tracking-tight">DSA Problem Revision Vault</h2>
              <p className="text-xs text-slate-400">
                Maintain personal notes, edge case summaries, and time/space complexities for interview revision
              </p>
            </div>
          </div>

          <button
            onClick={openNewNoteModal}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-sm transition-all self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>Create Revision Note</span>
          </button>
        </div>
      </div>

      {/* Search & Tag Filter Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search notes by problem title, tags, or approach content..."
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-dark-900 border border-dark-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500/60"
          />
        </div>

        {/* Tags horizontal list */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          <button
            onClick={() => setSelectedTag('All')}
            className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all shrink-0 ${
              selectedTag === 'All'
                ? 'bg-indigo-600/30 text-indigo-300 font-semibold border border-indigo-500/30'
                : 'bg-dark-900 text-slate-400 hover:text-slate-200 border border-dark-800'
            }`}
          >
            All Tags ({notes.length})
          </button>
          {Array.from(allTags).map((tag) => (
            <button
              key={tag}
              onClick={() => setSelectedTag(tag)}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all shrink-0 ${
                selectedTag === tag
                  ? 'bg-indigo-600/30 text-indigo-300 font-semibold border border-indigo-500/30'
                  : 'bg-dark-900 text-slate-400 hover:text-slate-200 border border-dark-800'
              }`}
            >
              #{tag}
            </button>
          ))}
        </div>
      </div>

      {/* Notes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredNotes.map((note) => (
          <div
            key={note.id}
            className="glass-panel glass-panel-hover rounded-2xl p-5 border border-dark-800 flex flex-col justify-between"
          >
            <div>
              <div className="flex items-start justify-between gap-2">
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  note.difficulty === 'Easy' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                  note.difficulty === 'Medium' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' :
                  'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                }`}>
                  {note.difficulty}
                </span>

                <div className="flex items-center gap-1.5">
                  {note.isFavorite && (
                    <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                  )}
                  <button
                    onClick={() => openEditModal(note)}
                    className="p-1 rounded-lg text-slate-400 hover:text-indigo-300 transition-colors"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => onDeleteNote(note.id)}
                    className="p-1 rounded-lg text-slate-400 hover:text-rose-400 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <h3 className="font-bold text-base text-white mt-2.5">
                {note.problemTitle}
              </h3>

              {note.approach && (
                <div className="mt-2 text-xs font-semibold text-indigo-300 flex items-center gap-1">
                  <span>💡 {note.approach}</span>
                </div>
              )}

              {/* Complexity badges */}
              {(note.timeComplexity || note.spaceComplexity) && (
                <div className="flex items-center gap-2 mt-2 text-[11px] font-mono text-slate-400">
                  {note.timeComplexity && (
                    <span className="px-2 py-0.5 rounded bg-dark-900 border border-dark-800">
                      Time: {note.timeComplexity}
                    </span>
                  )}
                  {note.spaceComplexity && (
                    <span className="px-2 py-0.5 rounded bg-dark-900 border border-dark-800">
                      Space: {note.spaceComplexity}
                    </span>
                  )}
                </div>
              )}

              <p className="mt-3 text-xs text-slate-300 whitespace-pre-wrap line-clamp-4 bg-dark-950/40 p-2.5 rounded-xl border border-dark-900 font-sans leading-relaxed">
                {note.content}
              </p>
            </div>

            <div className="mt-4 pt-3 border-t border-dark-800/60 flex flex-wrap gap-1.5 items-center">
              {note.tags.map((t) => (
                <span
                  key={t}
                  className="text-[10px] font-mono px-2 py-0.5 rounded bg-dark-900 text-slate-400 border border-dark-800"
                >
                  #{t}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Note Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="glass-panel w-full max-w-lg rounded-2xl border border-dark-700 p-6 shadow-2xl overflow-y-auto max-h-[90vh]">
            <div className="flex items-center justify-between pb-4 border-b border-dark-800 mb-4">
              <h3 className="font-bold text-base text-white">
                {activeNoteToEdit ? 'Edit Revision Note' : 'Create New Revision Note'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Problem Title</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Trapping Rain Water"
                  className="w-full px-3 py-2 rounded-xl bg-dark-900 border border-dark-800 text-xs text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Difficulty</label>
                  <select
                    value={difficulty}
                    onChange={(e) => setDifficulty(e.target.value as Difficulty)}
                    className="w-full px-3 py-2 rounded-xl bg-dark-900 border border-dark-800 text-xs text-white focus:outline-none focus:border-indigo-500"
                  >
                    <option value="Easy">Easy</option>
                    <option value="Medium">Medium</option>
                    <option value="Hard">Hard</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Platform</label>
                  <select
                    value={platform}
                    onChange={(e) => setPlatform(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl bg-dark-900 border border-dark-800 text-xs text-white focus:outline-none focus:border-indigo-500"
                  >
                    <option value="leetcode">LeetCode</option>
                    <option value="codeforces">Codeforces</option>
                    <option value="geeksforgeeks">GeeksforGeeks</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Core Algorithmic Pattern / Approach</label>
                <input
                  type="text"
                  value={approach}
                  onChange={(e) => setApproach(e.target.value)}
                  placeholder="e.g. Two Pointers Converging, Monotonic Stack"
                  className="w-full px-3 py-2 rounded-xl bg-dark-900 border border-dark-800 text-xs text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Time Complexity</label>
                  <input
                    type="text"
                    value={timeComplexity}
                    onChange={(e) => setTimeComplexity(e.target.value)}
                    placeholder="e.g. O(N log N)"
                    className="w-full px-3 py-2 rounded-xl bg-dark-900 border border-dark-800 text-xs text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Space Complexity</label>
                  <input
                    type="text"
                    value={spaceComplexity}
                    onChange={(e) => setSpaceComplexity(e.target.value)}
                    placeholder="e.g. O(1)"
                    className="w-full px-3 py-2 rounded-xl bg-dark-900 border border-dark-800 text-xs text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Tags (comma separated)</label>
                <input
                  type="text"
                  value={tagsInput}
                  onChange={(e) => setTagsInput(e.target.value)}
                  placeholder="e.g. Dynamic-Programming, Must-Revise, Google-Asked"
                  className="w-full px-3 py-2 rounded-xl bg-dark-900 border border-dark-800 text-xs text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Revision Notes & Critical Insights</label>
                <textarea
                  rows={4}
                  required
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Explain why this approach works, the base cases, and common pitfalls..."
                  className="w-full px-3 py-2 rounded-xl bg-dark-900 border border-dark-800 text-xs text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="fav"
                  checked={isFavorite}
                  onChange={(e) => setIsFavorite(e.target.checked)}
                  className="rounded bg-dark-900 border-dark-700 text-indigo-600 focus:ring-0"
                />
                <label htmlFor="fav" className="text-xs text-slate-300 select-none">Mark as Favorite / High Priority</label>
              </div>

              <div className="flex items-center justify-end gap-2 pt-4 border-t border-dark-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-dark-800 text-slate-300 text-xs font-medium hover:bg-dark-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md"
                >
                  Save Note
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
