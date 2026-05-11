import {
  LayoutDashboard, Users, CreditCard, MessageCircle,
  Receipt, FileText, Bell, X, Building2, ChevronRight,
  Settings, HelpCircle
} from 'lucide-react';

const navItems = [
  { id: 'dashboard',     label: 'Dashboard',          icon: LayoutDashboard },
  { id: 'members',       label: 'Members',             icon: Users },
  { id: 'payments',      label: 'Payments',            icon: CreditCard },
  { id: 'whatsapp',      label: 'WhatsApp Reminders',  icon: MessageCircle },
  { id: 'expenses',      label: 'Expenses',            icon: Receipt },
  { id: 'receipts',      label: 'Receipts',            icon: FileText },
  { id: 'announcements', label: 'Announcements',       icon: Bell },
];

export default function Sidebar({ activeSection, setActiveSection, societyInfo, mobileMenuOpen, setMobileMenuOpen }) {
  const props = { activeSection, setActiveSection, societyInfo };
  return (
    <>
      <aside className="hidden lg:flex flex-col w-64 bg-slate-900 h-screen flex-shrink-0">
        <SidebarContent {...props} />
      </aside>
      <aside className={`fixed inset-y-0 left-0 z-30 flex flex-col w-72 bg-slate-900 transform transition-transform duration-300 ease-in-out lg:hidden ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="absolute top-4 right-4">
          <button onClick={() => setMobileMenuOpen(false)} className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>
        <SidebarContent {...props} />
      </aside>
    </>
  );
}

function SidebarContent({ activeSection, setActiveSection, societyInfo }) {
  return (
    <div className="flex flex-col h-full">
      {/* Logo & Society Name */}
      <div className="px-5 py-6 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-700 flex items-center justify-center flex-shrink-0 shadow-lg">
            <Building2 className="w-5 h-5 text-white" />
          </div>
          <div className="min-w-0">
            <h1 className="text-white font-bold text-sm leading-tight truncate">{societyInfo.name}</h1>
            <p className="text-slate-400 text-xs mt-0.5">{societyInfo.location}</p>
          </div>
        </div>
        <div className="mt-4 bg-slate-800 rounded-lg px-3 py-2">
          <p className="text-xs text-slate-400">Current Period</p>
          <p className="text-sm font-semibold text-indigo-400 mt-0.5">{societyInfo.currentMonth}</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        <p className="px-3 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Menu</p>
        {navItems.map(({ id, label, icon: Icon }) => {
          const isActive = activeSection === id;
          return (
            <button
              key={id}
              onClick={() => setActiveSection(id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 group
                ${isActive
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-900/40'
                  : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                }`}
            >
              <Icon className={`w-4.5 h-4.5 flex-shrink-0 ${isActive ? 'text-white' : 'text-slate-500 group-hover:text-slate-300'}`} size={18} />
              <span className="flex-1 text-left">{label}</span>
              {isActive && <ChevronRight className="w-3.5 h-3.5 text-indigo-300" />}
            </button>
          );
        })}
      </nav>

      {/* Bottom */}
      <div className="px-3 py-4 border-t border-slate-800 space-y-0.5">
        <button
          onClick={() => setActiveSection('settings')}
          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all
            ${activeSection === 'settings'
              ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-900/40'
              : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}
        >
          <Settings size={18} className={activeSection === 'settings' ? 'text-white' : 'text-slate-500'} />
          <span>Settings</span>
        </button>
        <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-400 hover:bg-slate-800 hover:text-white transition-colors">
          <HelpCircle size={18} className="text-slate-500" />
          <span>Help & Support</span>
        </button>
        <div className="px-3 pt-3">
          <p className="text-xs text-slate-600 text-center">v1.0 · Society Management</p>
        </div>
      </div>
    </div>
  );
}
