import React from 'react';
import { Sparkles } from 'lucide-react';

const MatchScoreBadge = ({ score, size = 'md', showLabel = true }) => {
  const numericScore = typeof score === 'number' ? score : parseFloat(score) || 0;

  const getTheme = (val) => {
    if (val >= 85) {
      return {
        bg: 'bg-emerald-500/15',
        border: 'border-emerald-500/40',
        text: 'text-emerald-300',
        glow: 'shadow-emerald-500/20',
        label: 'High Match'
      };
    } else if (val >= 70) {
      return {
        bg: 'bg-indigo-500/15',
        border: 'border-indigo-500/40',
        text: 'text-indigo-300',
        glow: 'shadow-indigo-500/20',
        label: 'Good Match'
      };
    } else {
      return {
        bg: 'bg-amber-500/15',
        border: 'border-amber-500/40',
        text: 'text-amber-300',
        glow: 'shadow-amber-500/20',
        label: 'Moderate Match'
      };
    }
  };

  const theme = getTheme(numericScore);

  if (size === 'sm') {
    return (
      <span className={`inline-flex items-center space-x-1 px-2 py-0.5 rounded-md text-[11px] font-bold border ${theme.bg} ${theme.border} ${theme.text}`}>
        <Sparkles className="w-3 h-3 text-emerald-400" />
        <span>{Math.round(numericScore)}% Match</span>
      </span>
    );
  }

  if (size === 'lg') {
    return (
      <div className={`p-4 rounded-2xl glass-panel border ${theme.border} ${theme.bg} shadow-lg ${theme.glow} flex items-center justify-between`}>
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center">
            <Sparkles className="w-6 h-6 text-emerald-400" />
          </div>
          <div>
            <div className="text-xs font-semibold text-slate-400">7-Factor AI Match Engine</div>
            <div className="text-xl font-extrabold text-white">{Math.round(numericScore)}% Overall Compatibility</div>
          </div>
        </div>
        <div className="text-right">
          <span className={`px-2.5 py-1 rounded-full text-xs font-bold border ${theme.border} ${theme.text}`}>
            {theme.label}
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className={`inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-bold border ${theme.bg} ${theme.border} ${theme.text} shadow-sm ${theme.glow}`}>
      <Sparkles className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
      <span>{Math.round(numericScore)}% Skill Match</span>
    </div>
  );
};

export default MatchScoreBadge;
