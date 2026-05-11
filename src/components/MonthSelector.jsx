import { ChevronLeft, ChevronRight, Calendar } from 'lucide-react';
import { availableMonths } from '../data/sampleData';

export default function MonthSelector({ selectedMonth, setSelectedMonth }) {
  const idx = availableMonths.indexOf(selectedMonth);
  const canPrev = idx < availableMonths.length - 1;
  const canNext = idx > 0;
  const isCurrentMonth = idx === 0;

  const go = (dir) => {
    if (dir === 'prev' && canPrev) setSelectedMonth(availableMonths[idx + 1]);
    if (dir === 'next' && canNext) setSelectedMonth(availableMonths[idx - 1]);
  };

  return (
    <div className="flex items-center gap-1 bg-slate-100 rounded-xl p-1">
      <button
        onClick={() => go('prev')}
        disabled={!canPrev}
        title="Previous month"
        className="w-7 h-7 flex items-center justify-center rounded-lg text-slate-500 hover:bg-white hover:text-slate-800 hover:shadow-sm transition-all disabled:opacity-30 disabled:cursor-not-allowed"
      >
        <ChevronLeft className="w-4 h-4" />
      </button>

      <div className="relative">
        <select
          value={selectedMonth}
          onChange={e => setSelectedMonth(e.target.value)}
          className="appearance-none pl-7 pr-6 py-1.5 bg-white rounded-lg text-sm font-semibold text-slate-800 border-none shadow-sm cursor-pointer focus:outline-none focus:ring-2 focus:ring-indigo-400"
        >
          {availableMonths.map(m => (
            <option key={m} value={m}>{m}{m === availableMonths[0] ? ' (Current)' : ''}</option>
          ))}
        </select>
        <Calendar className="absolute left-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-indigo-500 pointer-events-none" />
      </div>

      <button
        onClick={() => go('next')}
        disabled={!canNext}
        title="Next month"
        className="w-7 h-7 flex items-center justify-center rounded-lg text-slate-500 hover:bg-white hover:text-slate-800 hover:shadow-sm transition-all disabled:opacity-30 disabled:cursor-not-allowed"
      >
        <ChevronRight className="w-4 h-4" />
      </button>

      {!isCurrentMonth && (
        <button
          onClick={() => setSelectedMonth(availableMonths[0])}
          className="ml-1 px-2.5 py-1.5 text-xs font-medium text-indigo-600 bg-indigo-50 rounded-lg hover:bg-indigo-100 transition-colors whitespace-nowrap"
        >
          Back to Current
        </button>
      )}
    </div>
  );
}
