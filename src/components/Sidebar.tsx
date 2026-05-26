import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  Building2, 
  Briefcase, 
  ClipboardList, 
  History, 
  LogOut,
  UserCircle,
  MessageSquare,
  Search
} from 'lucide-react';
import { cn } from '../lib/utils';
import { auth } from '../lib/firebase';
import { useUserRole } from '../hooks/useUserRole';

import { Logo } from './Logo';

export const Sidebar = () => {
  const { role, isAdmin } = useUserRole();

  const adminItems = [
    { icon: LayoutDashboard, label: 'Control Center', path: '/' },
    { icon: Users, label: 'Candidates', path: '/candidates' },
    { icon: Building2, label: 'Clients', path: '/clients' },
    { icon: Briefcase, label: 'Job Orders', path: '/jobs' },
    { icon: ClipboardList, label: 'Hiring Pipeline', path: '/applications' },
    { icon: History, label: 'Employee Lifecycle', path: '/history' },
  ];

  const candidateItems = [
    { icon: LayoutDashboard, label: 'Career Dashboard', path: '/' },
    { icon: Search, label: 'Find Jobs', path: '/jobs' },
    { icon: ClipboardList, label: 'My Applications', path: '/applications' },
    { icon: UserCircle, label: 'My Profile', path: '/profile' },
  ];

  const navItems = isAdmin ? adminItems : candidateItems;

  return (
    <aside className="w-64 h-screen bg-slate-950 text-slate-400 flex flex-col border-r border-slate-800 shadow-2xl z-20">
      <div className="p-6">
        <Logo showText={false} className="h-20 w-full mb-2" />
        <p className="text-[10px] font-black uppercase tracking-[0.4em] text-eon-accent text-center">Workflow Management</p>
      </div>

      <nav className="flex-1 px-4 py-4 space-y-2">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) => cn(
              "flex items-center gap-3 px-4 py-3.5 rounded-2xl transition-all duration-300 group text-sm font-bold",
              isActive 
                ? "bg-slate-900 text-white shadow-xl border border-white/5" 
                : "hover:bg-slate-900 hover:text-slate-200"
            )}
          >
            {({ isActive }) => (
              <>
                <item.icon className={cn("w-4 h-4 transition-all group-hover:scale-110", isActive ? "text-eon-accent" : "text-slate-500")} />
                {item.label}
                {isActive && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-eon-accent animate-pulse shadow-[0_0_8px_rgba(245,166,35,0.8)]"></div>}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      <div className="p-6 border-t border-slate-900">
        <div className="bg-slate-900/50 p-4 rounded-2xl mb-4 border border-slate-800/50">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center">
              <UserCircle className="w-5 h-5" />
            </div>
            <div className="overflow-hidden">
               <p className="text-xs font-bold text-white truncate">{auth.currentUser?.displayName || 'User'}</p>
               <p className="text-[10px] uppercase font-bold text-eon-teal tracking-tighter">{role}</p>
            </div>
          </div>
        </div>
        <button 
          onClick={() => auth.signOut()}
          className="flex items-center gap-3 px-4 py-3 w-full rounded-2xl hover:bg-red-500/10 hover:text-red-400 transition-all text-sm font-bold active:scale-95"
        >
          <LogOut className="w-4 h-4" />
          Sign Out
        </button>
      </div>
    </aside>
  );
};
