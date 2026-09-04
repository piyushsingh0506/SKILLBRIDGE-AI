import React from 'react';

const StatCard = ({ title, value, subtitle, icon: Icon, color = 'emerald', trend }) => {
  const colorMap = {
    emerald: {
      bg: 'from-emerald-500/10 to-teal-500/5',
      border: 'border-emerald-500/20 hover:border-emerald-500/40',
      iconBg: 'bg-emerald-500/20 text-emerald-400',
      text: 'text-emerald-400'
    },
    indigo: {
      bg: 'from-indigo-500/10 to-purple-500/5',
      border: 'border-indigo-500/20 hover:border-indigo-500/40',
      iconBg: 'bg-indigo-500/20 text-indigo-400',
      text: 'text-indigo-400'
    },
    amber: {
      bg: 'from-amber-500/10 to-orange-500/5',
      border: 'border-amber-500/20 hover:border-amber-500/40',
      iconBg: 'bg-amber-500/20 text-amber-400',
      text: 'text-amber-400'
    },
    cyan: {
      bg: 'from-cyan-500/10 to-blue-500/5',
      border: 'border-cyan-500/20 hover:border-cyan-500/40',
      iconBg: 'bg-cyan-500/20 text-cyan-400',
      text: 'text-cyan-400'
    },
    rose: {
      bg: 'from-rose-500/10 to-pink-500/5',
      border: 'border-rose-500/20 hover:border-rose-500/40',
      iconBg: 'bg-rose-500/20 text-rose-400',
      text: 'text-rose-400'
    }
  };

  const scheme = colorMap[color] || colorMap.emerald;

  return (
    <div className={`p-5 rounded-2xl bg-gradient-to-br ${scheme.bg} glass-panel border ${scheme.border} transition-all duration-300 hover:shadow-xl hover:shadow-${color}-500/10 group`}>
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-slate-400">{title}</span>
        {Icon && (
          <div className={`w-9 h-9 rounded-xl ${scheme.iconBg} flex items-center justify-center group-hover:scale-110 transition`}>
            <Icon className="w-5 h-5" />
          </div>
        )}
      </div>

      <div className="mt-3 flex items-baseline justify-between">
        <span className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          {value}
        </span>
        {trend && (
          <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            {trend}
          </span>
        )}
      </div>

      {subtitle && (
        <p className="text-[11px] text-slate-400 mt-1 font-medium">{subtitle}</p>
      )}
    </div>
  );
};

export default StatCard;
