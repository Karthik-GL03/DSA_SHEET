'use client';

import React, { useState } from 'react';
import { 
  CheckCircle2, 
  Circle, 
  ExternalLink, 
  Search, 
  Filter, 
  BookOpen, 
  ChevronDown, 
  ChevronRight, 
  PenTool, 
  Sparkles,
  Layers,
  Flame,
  AlertTriangle
} from 'lucide-react';
import { CurriculumProblem, Difficulty } from '@/lib/types';
import { NeetCodeIcon, StriverIcon } from './BrandIcons';

interface CurriculumTrackerProps {
  neetcodeData: any[];
  striverData: any[];
  solvedSlugs: Set<string>;
  onToggleSolve: (slug: string, solved: boolean) => void;
  onOpenNoteModal: (problem: CurriculumProblem) => void;
}

export const CurriculumTracker: React.FC<CurriculumTrackerProps> = ({
  neetcodeData,
  striverData,
  solvedSlugs,
  onToggleSolve,
  onOpenNoteModal
}) => {
  const [selectedSheet, setSelectedSheet] = useState<'neetcode' | 'striver'>('neetcode');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDifficulty, setSelectedDifficulty] = useState<'All' | Difficulty>('All');
  const [selectedStatus, setSelectedStatus] = useState<'All' | 'Solved' | 'Unsolved'>('All');
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({
    'Arrays & Hashing': true,
    'Two Pointers': true,
    'Step 1: Learn the Basics': true,
    'Step 2: Learn Important Sorting Techniques': true,
    'Step 3: Solve Problems on Arrays': true,
  });

  const toggleCategory = (catName: string) => {
    setExpandedCategories(prev => ({
      ...prev,
      [catName]: !prev[catName]
    }));
  };

  // Helper to check if problem matches filters
  const filterProblem = (p: CurriculumProblem) => {
    const isSolved = solvedSlugs.has(p.leetcodeSlug?.toLowerCase() || '') ||
                     solvedSlugs.has(p.gfgSlug?.toLowerCase() || '') ||
                     solvedSlugs.has(p.title.toLowerCase().replace(/[^a-z0-9]/g, '-'));

    if (selectedDifficulty !== 'All' && p.difficulty !== selectedDifficulty) return false;
    if (selectedStatus === 'Solved' && !isSolved) return false;
    if (selectedStatus === 'Unsolved' && isSolved) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = p.title.toLowerCase().includes(q);
      const matchPattern = p.pattern?.toLowerCase().includes(q);
      const matchSlug = p.leetcodeSlug?.toLowerCase().includes(q);
      if (!matchTitle && !matchPattern && !matchSlug) return false;
    }
    return true;
  };

  // Total solves computation for the active sheet
  let totalProblems = 0;
  let totalSolved = 0;

  if (selectedSheet === 'neetcode') {
    neetcodeData.forEach(cat => {
      cat.problems.forEach((p: CurriculumProblem) => {
        totalProblems++;
        const isSolved = solvedSlugs.has(p.leetcodeSlug?.toLowerCase() || '') ||
                         solvedSlugs.has(p.title.toLowerCase().replace(/[^a-z0-9]/g, '-'));
        if (isSolved) totalSolved++;
      });
    });
  } else {
    striverData.forEach(step => {
      step.substeps.forEach((sub: any) => {
        sub.problems.forEach((p: CurriculumProblem) => {
          totalProblems++;
          const isSolved = solvedSlugs.has(p.leetcodeSlug?.toLowerCase() || '') ||
                           solvedSlugs.has(p.gfgSlug?.toLowerCase() || '') ||
                           solvedSlugs.has(p.title.toLowerCase().replace(/[^a-z0-9]/g, '-'));
          if (isSolved) totalSolved++;
        });
      });
    });
  }

  const overallPercent = totalProblems > 0 ? Math.round((totalSolved / totalProblems) * 100) : 0;

  return (
    <div className="space-y-6">
      
      {/* Framework Selector & Progress Header */}
      <div className="glass-panel rounded-2xl p-6 border border-dark-800">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-400">
              <BookOpen className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white tracking-tight">Pedagogical DSA Curriculum Hub</h2>
              <p className="text-xs text-slate-400">
                Cross-referenced with live API submissions to map topic mastery and highlight curriculum gaps
              </p>
            </div>
          </div>

          {/* Curriculum Switcher Tabs */}
          <div className="flex items-center p-1 rounded-xl bg-dark-900 border border-dark-800 self-start md:self-auto">
            <button
              onClick={() => setSelectedSheet('neetcode')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                selectedSheet === 'neetcode'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <NeetCodeIcon className="w-3.5 h-3.5 rounded" />
              <span>NeetCode 150</span>
            </button>

            <button
              onClick={() => setSelectedSheet('striver')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                selectedSheet === 'striver'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <StriverIcon className="w-3.5 h-3.5 rounded" />
              <span>Striver A2Z Sheet</span>
            </button>
          </div>

        </div>

        {/* Global Progress Bar */}
        <div className="mt-6 pt-5 border-t border-dark-800/80">
          <div className="flex items-center justify-between text-xs mb-2">
            <span className="text-slate-300 font-medium">
              Overall {selectedSheet === 'neetcode' ? 'NeetCode 150' : 'Striver A2Z'} Completion:
            </span>
            <span className="font-mono text-indigo-300 font-semibold">
              {totalSolved} / {totalProblems} ({overallPercent}%)
            </span>
          </div>

          <div className="w-full h-2.5 rounded-full bg-dark-900 overflow-hidden border border-dark-800">
            <div 
              className="h-full rounded-full bg-gradient-to-r from-indigo-500 via-purple-500 to-cyan-400 transition-all duration-500"
              style={{ width: `${overallPercent}%` }}
            />
          </div>
        </div>

      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search problems by name, pattern, or slug..."
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-dark-900 border border-dark-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500/60"
          />
        </div>

        {/* Difficulty Filter */}
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-dark-900 border border-dark-800 shrink-0">
          {(['All', 'Easy', 'Medium', 'Hard'] as const).map((diff) => (
            <button
              key={diff}
              onClick={() => setSelectedDifficulty(diff)}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                selectedDifficulty === diff 
                  ? 'bg-dark-800 text-white font-semibold' 
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {diff}
            </button>
          ))}
        </div>

        {/* Status Filter */}
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-dark-900 border border-dark-800 shrink-0">
          {(['All', 'Solved', 'Unsolved'] as const).map((status) => (
            <button
              key={status}
              onClick={() => setSelectedStatus(status)}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                selectedStatus === status 
                  ? 'bg-indigo-600/30 text-indigo-300 font-semibold border border-indigo-500/30' 
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {status}
            </button>
          ))}
        </div>

      </div>

      {/* Curricula Category Accordions */}
      <div className="space-y-4">
        
        {/* NEETCODE 150 VIEW */}
        {selectedSheet === 'neetcode' && (
          neetcodeData.map((cat: any) => {
            const filteredProblems = cat.problems.filter(filterProblem);
            if (filteredProblems.length === 0 && (searchQuery || selectedDifficulty !== 'All' || selectedStatus !== 'All')) {
              return null;
            }

            const isExpanded = expandedCategories[cat.category] ?? false;
            const solvedCount = cat.problems.filter((p: any) => 
              solvedSlugs.has(p.leetcodeSlug?.toLowerCase() || '') ||
              solvedSlugs.has(p.title.toLowerCase().replace(/[^a-z0-9]/g, '-'))
            ).length;
            const catPercent = Math.round((solvedCount / cat.problems.length) * 100);

            return (
              <div key={cat.category} className="glass-panel rounded-2xl border border-dark-800 overflow-hidden">
                {/* Category Header */}
                <div
                  onClick={() => toggleCategory(cat.category)}
                  className="p-4 sm:p-5 flex items-center justify-between cursor-pointer hover:bg-dark-900/60 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    {isExpanded ? (
                      <ChevronDown className="w-4 h-4 text-indigo-400" />
                    ) : (
                      <ChevronRight className="w-4 h-4 text-slate-400" />
                    )}
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-sm text-white">{cat.category}</h3>
                        <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-dark-800 text-slate-300 border border-dark-700">
                          {solvedCount} / {cat.problems.length}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Progress bar in header */}
                  <div className="flex items-center gap-3 w-40 sm:w-56">
                    <div className="w-full h-2 rounded-full bg-dark-900 overflow-hidden border border-dark-800">
                      <div 
                        className={`h-full rounded-full transition-all duration-300 ${
                          catPercent === 100 ? 'bg-emerald-500' : 'bg-indigo-500'
                        }`}
                        style={{ width: `${catPercent}%` }}
                      />
                    </div>
                    <span className="text-xs font-mono text-slate-400 w-9 text-right font-semibold">{catPercent}%</span>
                  </div>
                </div>

                {/* Problems Table */}
                {isExpanded && (
                  <div className="border-t border-dark-800/80 divide-y divide-dark-800/40">
                    {filteredProblems.map((p: any) => {
                      const isSolved = solvedSlugs.has(p.leetcodeSlug?.toLowerCase() || '') ||
                                       solvedSlugs.has(p.title.toLowerCase().replace(/[^a-z0-9]/g, '-'));

                      return (
                        <div 
                          key={p.id}
                          className="px-5 py-3 flex items-center justify-between hover:bg-dark-900/40 transition-colors group"
                        >
                          <div className="flex items-center gap-3.5 flex-1 min-w-0">
                            {/* Checkbox */}
                            <button
                              onClick={() => onToggleSolve(p.leetcodeSlug || p.title.toLowerCase().replace(/[^a-z0-9]/g, '-'), !isSolved)}
                              className="text-slate-500 hover:text-emerald-400 transition-colors shrink-0"
                            >
                              {isSolved ? (
                                <CheckCircle2 className="w-5 h-5 text-emerald-400 fill-emerald-400/20" />
                              ) : (
                                <Circle className="w-5 h-5 text-slate-600 hover:text-slate-400" />
                              )}
                            </button>

                            {/* Title & Pattern */}
                            <div className="min-w-0">
                              <div className="flex items-center gap-2 flex-wrap">
                                <a
                                  href={p.leetcodeUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className={`text-xs sm:text-sm font-medium hover:text-indigo-400 transition-colors flex items-center gap-1.5 ${
                                    isSolved ? 'text-slate-400 line-through' : 'text-slate-200'
                                  }`}
                                >
                                  <span>{p.title}</span>
                                  <ExternalLink className="w-3 h-3 text-slate-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                                </a>
                                {p.pattern && (
                                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-dark-900 text-indigo-300 border border-dark-800">
                                    {p.pattern}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* Difficulty and Action */}
                          <div className="flex items-center gap-3 shrink-0 ml-4">
                            <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                              p.difficulty === 'Easy' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                              p.difficulty === 'Medium' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' :
                              'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                            }`}>
                              {p.difficulty}
                            </span>

                            <button
                              onClick={() => onOpenNoteModal(p)}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-300 hover:bg-dark-800 transition-colors"
                              title="Add revision notes for this problem"
                            >
                              <PenTool className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })
        )}

        {/* STRIVER A2Z VIEW */}
        {selectedSheet === 'striver' && (
          striverData.map((step: any) => {
            const isExpanded = expandedCategories[step.title] ?? false;
            
            let stepProblemsCount = 0;
            let stepSolvedCount = 0;

            step.substeps.forEach((sub: any) => {
              sub.problems.forEach((p: any) => {
                stepProblemsCount++;
                const isSolved = (p.leetcodeSlug && solvedSlugs.has(p.leetcodeSlug.toLowerCase())) ||
                                 (p.gfgSlug && solvedSlugs.has(p.gfgSlug.toLowerCase())) ||
                                 solvedSlugs.has(p.title.toLowerCase().replace(/[^a-z0-9]/g, '-'));
                if (isSolved) stepSolvedCount++;
              });
            });

            const stepPercent = stepProblemsCount > 0 ? Math.round((stepSolvedCount / stepProblemsCount) * 100) : 0;

            return (
              <div key={step.step} className="glass-panel rounded-2xl border border-dark-800 overflow-hidden">
                <div
                  onClick={() => toggleCategory(step.title)}
                  className="p-4 sm:p-5 flex items-center justify-between cursor-pointer hover:bg-dark-900/60 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    {isExpanded ? (
                      <ChevronDown className="w-4 h-4 text-indigo-400" />
                    ) : (
                      <ChevronRight className="w-4 h-4 text-slate-400" />
                    )}
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-sm text-white">{step.title}</h3>
                        <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-dark-800 text-slate-300 border border-dark-700">
                          {stepSolvedCount} / {stepProblemsCount}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 w-40 sm:w-56">
                    <div className="w-full h-2 rounded-full bg-dark-900 overflow-hidden border border-dark-800">
                      <div 
                        className={`h-full rounded-full transition-all duration-300 ${
                          stepPercent === 100 ? 'bg-emerald-500' : 'bg-indigo-500'
                        }`}
                        style={{ width: `${stepPercent}%` }}
                      />
                    </div>
                    <span className="text-xs font-mono text-slate-400 w-9 text-right font-semibold">{stepPercent}%</span>
                  </div>
                </div>

                {isExpanded && (
                  <div className="border-t border-dark-800/80 divide-y divide-dark-800/40">
                    {step.substeps.map((sub: any) => (
                      <div key={sub.title} className="p-4 bg-dark-950/40">
                        <div className="text-xs font-semibold text-indigo-300 mb-2 uppercase tracking-wide">
                          {sub.title}
                        </div>
                        <div className="space-y-1.5">
                          {sub.problems.filter(filterProblem).map((p: any) => {
                            const isSolved = (p.leetcodeSlug && solvedSlugs.has(p.leetcodeSlug.toLowerCase())) ||
                                             (p.gfgSlug && solvedSlugs.has(p.gfgSlug.toLowerCase())) ||
                                             solvedSlugs.has(p.title.toLowerCase().replace(/[^a-z0-9]/g, '-'));

                            return (
                              <div
                                key={p.id}
                                className="p-2.5 rounded-xl flex items-center justify-between hover:bg-dark-900/60 transition-colors group"
                              >
                                <div className="flex items-center gap-3 min-w-0">
                                  <button
                                    onClick={() => onToggleSolve(p.leetcodeSlug || p.gfgSlug || p.title.toLowerCase().replace(/[^a-z0-9]/g, '-'), !isSolved)}
                                    className="text-slate-500 hover:text-emerald-400 transition-colors shrink-0"
                                  >
                                    {isSolved ? (
                                      <CheckCircle2 className="w-4 h-4 text-emerald-400 fill-emerald-400/20" />
                                    ) : (
                                      <Circle className="w-4 h-4 text-slate-600 hover:text-slate-400" />
                                    )}
                                  </button>

                                  <a
                                    href={p.url || (p.leetcodeSlug ? `https://leetcode.com/problems/${p.leetcodeSlug}/` : 'https://takeuforward.org')}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className={`text-xs sm:text-sm font-medium hover:text-indigo-400 transition-colors flex items-center gap-1.5 ${
                                      isSolved ? 'text-slate-400 line-through' : 'text-slate-200'
                                    }`}
                                  >
                                    <span>{p.title}</span>
                                    <ExternalLink className="w-3 h-3 text-slate-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                                  </a>
                                </div>

                                <div className="flex items-center gap-3 shrink-0">
                                  <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                                    p.difficulty === 'Easy' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                                    p.difficulty === 'Medium' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' :
                                    'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                                  }`}>
                                    {p.difficulty}
                                  </span>

                                  <button
                                    onClick={() => onOpenNoteModal(p)}
                                    className="p-1 rounded-lg text-slate-400 hover:text-indigo-300 hover:bg-dark-800 transition-colors"
                                    title="Add revision notes for this problem"
                                  >
                                    <PenTool className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })
        )}

      </div>

    </div>
  );
};
