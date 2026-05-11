import { CheckCircle, XCircle, AlertCircle, X } from 'lucide-react';

const icons = {
  success: <CheckCircle className="w-5 h-5 text-green-500" />,
  error:   <XCircle className="w-5 h-5 text-red-500" />,
  warning: <AlertCircle className="w-5 h-5 text-amber-500" />,
};

const borders = {
  success: 'border-l-green-500',
  error:   'border-l-red-500',
  warning: 'border-l-amber-500',
};

export default function Toast({ message, type = 'success', onClose, action }) {
  return (
    <div className="fixed bottom-6 right-6 z-50 animate-fade-in">
      <div className={`flex items-center gap-3 bg-white rounded-xl shadow-2xl border border-slate-200 border-l-4 ${borders[type]} px-4 py-3.5 min-w-[280px] max-w-sm`}>
        {icons[type]}
        <p className="text-sm font-medium text-slate-700 flex-1">{message}</p>
        {action && (
          <button
            onClick={() => { action.onClick(); onClose(); }}
            className="text-xs font-bold text-indigo-600 hover:text-indigo-800 bg-indigo-50 hover:bg-indigo-100 px-2.5 py-1 rounded-lg transition-colors whitespace-nowrap ml-1"
          >
            {action.label}
          </button>
        )}
        <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors ml-1">
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
