'use client';

import React from 'react';
import { AlertTriangle, TrendingDown, ArrowRight, Brain, Target, CheckCircle2 } from 'lucide-react';

interface WeakTopicItem {
  name: string;
  framework: string;
  percent: number;
  solved: number;
  total: number;
}

interface WeakTopicsAnalysisProps {
  weakTopics: WeakTopicItem[];
  onSelectTopic: (topicName: string) => void;
}

export const WeakTopicsAnalysis: React.FC<WeakTopicsAnalysisProps> = ({
  weakTopics,
  onSelectTopic
}) => {
  if (weakTopics.length === 0) {
    return (
      <div className="glass-panel rounded-2xl p-6 border border-emerald-500/20 bg-emerald-950/20 text-center">
        <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto mb-2" />
        <h3 className="text-base font-bold text-white">No Weak Topics Flagged</h3>
        <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto">
          All curriculum categories have achieved over 40% completion! Keep advancing your mastery across both curricula.
        </p>
      </div>
    );
  }

  return (
    <div className="glass-panel rounded-2xl p-6 border border-dark-800">
      
      <div className="flex items-center justify-between pb-4 border-b border-dark-800 mb-5">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-rose-500/10 text-rose-400">
            <Brain className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-base text-white">Algorithmic Weak Topics Radar</h3>
            <p className="text-xs text-slate-400">Topics flagged with low completion rate (&lt; 40%) requiring deliberate practice</p>
          </div>
        </div>

        <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-rose-500/10 text-rose-300 border border-rose-500/20">
          {weakTopics.length} Focus Areas Detected
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {weakTopics.slice(0, 6).map((topic, idx) => (
          <div 
            key={idx}
            className="p-4 rounded-xl bg-dark-900/60 border border-dark-800/80 hover:border-indigo-500/40 transition-all flex flex-col justify-between group"
          >
            <div>
              <div className="flex items-center justify-between text-xs mb-2">
                <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-semibold px-2 py-0.5 rounded bg-dark-800">
                  {topic.framework}
                </span>
                <span className="text-rose-400 font-bold font-mono text-xs">
                  {topic.percent}%
                </span>
              </div>

              <h4 className="font-bold text-sm text-slate-200 group-hover:text-indigo-300 transition-colors">
                {topic.name}
              </h4>

              <div className="w-full h-1.5 rounded-full bg-dark-950 overflow-hidden my-3 border border-dark-800">
                <div 
                  className="h-full rounded-full bg-gradient-to-r from-rose-500 to-amber-500" 
                  style={{ width: `${Math.max(topic.percent, 5)}%` }}
                />
              </div>

              <div className="text-[11px] text-slate-400 flex items-center justify-between">
                <span>Completed:</span>
                <span className="font-mono text-slate-300">{topic.solved} / {topic.total} problems</span>
              </div>
            </div>

            <button
              onClick={() => onSelectTopic(topic.name)}
              className="mt-4 w-full py-2 px-3 rounded-lg bg-dark-800 hover:bg-indigo-600/20 text-slate-300 hover:text-indigo-300 border border-dark-700 hover:border-indigo-500/30 text-xs font-semibold flex items-center justify-center gap-1.5 transition-all"
            >
              <span>Practice Category</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
      </div>

    </div>
  );
};
