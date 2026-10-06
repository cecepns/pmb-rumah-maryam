import React from 'react';

export default function StatCard({
  title,
  value,
  subtext,
  icon: Icon,
  trend,
  color = 'brand',
  onClick,
}) {
  const colorMap = {
    brand: {
      bg: 'bg-brand-50/70',
      border: 'border-brand-100',
      text: 'text-brand-600',
      valColor: 'text-brand-800',
      pill: 'bg-brand-100 text-brand-700'
    },
    emerald: {
      bg: 'bg-emerald-50/70',
      border: 'border-emerald-100',
      text: 'text-emerald-600',
      valColor: 'text-emerald-800',
      pill: 'bg-emerald-100 text-emerald-700'
    },
    amber: {
      bg: 'bg-amber-50/70',
      border: 'border-amber-100',
      text: 'text-amber-600',
      valColor: 'text-amber-800',
      pill: 'bg-amber-100 text-amber-700'
    },
    purple: {
      bg: 'bg-purple-50/70',
      border: 'border-purple-100',
      text: 'text-purple-600',
      valColor: 'text-purple-800',
      pill: 'bg-purple-100 text-purple-700'
    },
    blue: {
      bg: 'bg-blue-50/70',
      border: 'border-blue-100',
      text: 'text-blue-600',
      valColor: 'text-blue-800',
      pill: 'bg-blue-100 text-blue-700'
    },
  };

  const scheme = colorMap[color] || colorMap.brand;

  return (
    <div
      onClick={onClick}
      className={`rounded-2xl border border-slate-100 bg-white p-5 shadow-card hover:shadow-soft transition-all duration-200 relative overflow-hidden group ${
        onClick ? 'cursor-pointer hover:-translate-y-0.5' : ''
      }`}
    >
      {/* Top right subtle background blur orb */}
      <div className={`absolute -right-4 -top-4 w-20 h-20 rounded-full ${scheme.bg} opacity-60 pointer-events-none blur-xl`}></div>

      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <p className="text-xs font-semibold tracking-wider uppercase text-slate-500">{title}</p>
          <h3 className={`text-2xl sm:text-3xl font-bold font-display ${scheme.valColor} tracking-tight`}>
            {value}
          </h3>
        </div>
        {Icon && (
          <div className={`w-12 h-12 rounded-2xl ${scheme.bg} ${scheme.border} border flex items-center justify-center ${scheme.text} shadow-sm group-hover:scale-105 transition-transform shrink-0`}>
            <Icon className="w-6 h-6" />
          </div>
        )}
      </div>

      {(subtext || trend) && (
        <div className="mt-3 flex items-center gap-2 pt-2 border-t border-slate-50 text-xs text-slate-500">
          {trend && (
            <span className={`px-1.5 py-0.5 rounded font-semibold text-[11px] ${scheme.pill}`}>
              {trend}
            </span>
          )}
          <span>{subtext}</span>
        </div>
      )}
    </div>
  );
}
