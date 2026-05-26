import React, { useState, useEffect } from 'react';
import { db, auth } from '../lib/firebase';
import { useAuthState } from 'react-firebase-hooks/auth';
import { collection, query, onSnapshot, where, limit, orderBy } from 'firebase/firestore';
import { useUserRole } from '../hooks/useUserRole';
import { Briefcase, Building2, Users, CheckCircle, TrendingUp, Sparkles, MapPin, DollarSign, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Job } from '../types';

import { Logo } from '../components/Logo';

export const Dashboard = () => {
  const [user] = useAuthState(auth);
  const { isAdmin, isCandidate } = useUserRole();
  const [stats, setStats] = useState({
    candidates: 0,
    jobs: 0,
    selected: 0,
    history: 0
  });
  const [recentJobs, setRecentJobs] = useState<Job[]>([]);

  useEffect(() => {
    if (!user) return;

    if (isAdmin) {
      const unsubCandidates = onSnapshot(collection(db, 'candidates'), (s) => setStats(prev => ({ ...prev, candidates: s.size })));
      const unsubJobs = onSnapshot(collection(db, 'jobs'), (s) => setStats(prev => ({ ...prev, jobs: s.size })));
      const unsubApps = onSnapshot(query(collection(db, 'applications'), where('status', '==', 'Selected')), (s) => setStats(prev => ({ ...prev, selected: s.size })));
      const unsubHistory = onSnapshot(collection(db, 'history'), (s) => setStats(prev => ({ ...prev, history: s.size })));

      return () => {
        unsubCandidates();
        unsubJobs();
        unsubApps();
        unsubHistory();
      };
    } else {
      const q = query(collection(db, 'jobs'), where('status', '==', 'Open'), limit(3), orderBy('createdAt', 'desc'));
      const unsubJobs = onSnapshot(q, (s) => {
        setRecentJobs(s.docs.map(doc => ({ id: doc.id, ...doc.data() } as Job)));
      });
      return unsubJobs;
    }
  }, [user, isAdmin]);

  if (isCandidate) {
    return (
      <div className="p-8 max-w-6xl mx-auto">
        <header className="mb-12 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3">
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-eon-teal">Candidate Success Portal</span>
              <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-500 text-[8px] font-black uppercase tracking-tighter border border-slate-200">Candidate Role</span>
            </div>
            <h1 className="text-4xl font-bold tracking-tight mt-2 text-slate-900 font-sans">
              Welcome, <span className="font-serif italic font-normal text-slate-500">{user?.displayName?.split(' ')[0]}</span>
            </h1>
          </div>
          <div className="hidden md:flex items-center gap-2 px-4 py-2 bg-eon-teal/5 rounded-full border border-eon-teal/10">
             <div className="w-2 h-2 bg-eon-teal rounded-full animate-pulse"></div>
             <span className="text-[10px] font-bold uppercase text-eon-teal">Online Career Status</span>
          </div>
        </header>

        <div className="mb-12 rounded-[40px] overflow-hidden h-64 relative group border border-slate-200 shadow-sm">
          <img 
            src="https://images.unsplash.com/photo-1521737711867-e3b97375f902?q=80&w=2000&auto=format&fit=crop" 
            className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105" 
            alt="Office Team" 
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/30 to-transparent flex flex-col justify-end p-10">
            <h2 className="text-white text-3xl font-black italic tracking-tighter">Your career journey starts with EON.</h2>
            <p className="text-slate-300 text-sm max-w-lg mt-2 font-medium">Connect with premium employment opportunities across various sectors.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <section>
               <h2 className="text-sm font-bold uppercase tracking-widest text-slate-400 mb-6 border-b border-slate-100 pb-2 flex items-center gap-2">
                 <Briefcase className="w-4 h-4" /> Latest Job Openings
               </h2>
               <div className="grid grid-cols-1 gap-4">
                 {recentJobs.map(job => (
                   <div key={job.id} className="card p-6 bg-white border-slate-100 shadow-sm hover:shadow-xl hover:translate-x-1 transition-all group">
                     <div className="flex justify-between items-start">
                        <div className="flex gap-4">
                           <div className="w-14 h-14 bg-slate-50 rounded-xl flex items-center justify-center border border-slate-100 group-hover:bg-eon-teal group-hover:text-white transition-colors">
                              <Building2 className="w-6 h-6" />
                           </div>
                           <div>
                              <h3 className="font-bold text-slate-900 leading-tight">{job.title}</h3>
                              <p className="text-xs text-slate-500 mt-1">{job.clientName}</p>
                              <div className="flex items-center gap-4 mt-3">
                                 <div className="flex items-center gap-1 text-[10px] text-slate-400 font-bold uppercase">
                                    <MapPin className="w-3 h-3" /> {job.location}
                                 </div>
                                 <div className="flex items-center gap-1 text-[10px] text-eon-teal font-bold uppercase">
                                    <DollarSign className="w-3 h-3" /> {job.salary}
                                 </div>
                              </div>
                           </div>
                        </div>
                        <Link to="/jobs" className="p-3 bg-slate-50 rounded-full hover:bg-eon-teal hover:text-white transition-all">
                           <ArrowRight className="w-4 h-4" />
                        </Link>
                     </div>
                   </div>
                 ))}
                 <Link to="/jobs" className="block text-center p-4 border-2 border-dashed border-slate-200 rounded-2xl text-slate-400 hover:border-eon-teal hover:text-eon-teal transition-all font-bold text-xs uppercase tracking-widest">
                   Browse All Jobs
                 </Link>
               </div>
            </section>

            <section className="bg-slate-900 rounded-[32px] p-8 text-white relative overflow-hidden">
               <div className="absolute top-0 right-0 w-32 h-32 bg-eon-teal opacity-20 blur-[60px]"></div>
               <div className="relative z-10">
                  <Sparkles className="text-eon-accent w-8 h-8 mb-4" />
                  <h3 className="text-2xl font-bold tracking-tight italic">Boost your profile visibility</h3>
                  <p className="text-slate-400 text-sm mt-2 max-w-md">Our AI matching engine suggests your profile to recruiters when you have a 90%+ skill match.</p>
                  <Link to="/profile" className="inline-block mt-6 px-6 py-3 bg-eon-teal text-white rounded-xl font-bold uppercase text-[10px] tracking-widest hover:bg-opacity-90 transition-all">
                    Complete My Profile
                  </Link>
               </div>
            </section>
          </div>

          <div className="space-y-8">
            <div className="card p-8 bg-white border-slate-100 shadow-sm">
               <h4 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-6">Application Tracker</h4>
               <div className="space-y-6">
                  <div className="flex items-center gap-4">
                     <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center font-bold">0</div>
                     <p className="text-sm font-semibold text-slate-700">Applied Jobs</p>
                  </div>
                  <div className="flex items-center gap-4 opacity-40">
                     <div className="w-10 h-10 bg-amber-50 text-amber-600 rounded-lg flex items-center justify-center font-bold">0</div>
                     <p className="text-sm font-semibold text-slate-700">In Review</p>
                  </div>
                  <div className="flex items-center gap-4 opacity-40">
                     <div className="w-10 h-10 bg-green-50 text-green-600 rounded-lg flex items-center justify-center font-bold">0</div>
                     <p className="text-sm font-semibold text-slate-700">Interview Invites</p>
                  </div>
               </div>
            </div>

            <div className="card p-8 bg-slate-50 border-slate-200">
               <h4 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-4">Quick Links</h4>
               <div className="grid grid-cols-1 gap-2">
                  <Link to="/profile" className="text-sm text-slate-600 hover:text-eon-teal py-2 flex items-center justify-between border-b border-slate-200">
                    Update Resume <ArrowRight className="w-3 h-3" />
                  </Link>
                  <Link to="/chats" className="text-sm text-slate-600 hover:text-eon-teal py-2 flex items-center justify-between border-b border-slate-200">
                    Contact Support <ArrowRight className="w-3 h-3" />
                  </Link>
               </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <header className="mb-12 flex items-center justify-between">
        <div className="flex items-center gap-6">
           <div className="w-16 h-16 bg-white rounded-2xl overflow-hidden border border-slate-200 shadow-sm hidden sm:flex items-center justify-center p-1">
             <Logo showText={false} className="h-full w-full" />
           </div>
           <div>
              <div className="flex items-center gap-3">
                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-eon-teal">Platform Control Center</span>
                <span className="px-2 py-0.5 rounded-full bg-eon-teal text-white text-[8px] font-black uppercase tracking-tighter shadow-lg shadow-eon-teal/20">System Admin</span>
              </div>
              <h1 className="text-4xl font-bold tracking-tight text-slate-900 mt-2 font-sans underline decoration-eon-accent/30 decoration-4 underline-offset-8 leading-tight">
                Operations <span className="font-serif italic font-normal text-slate-500 underline-none">Overview</span>
              </h1>
           </div>
        </div>
        <div className="hidden lg:flex bg-white p-3 rounded-2xl border border-slate-200 shadow-sm items-center gap-4">
           <div className="flex -space-x-2">
              {[1,2,3].map(i => <div key={i} className={`w-8 h-8 rounded-full border-2 border-white bg-slate-${200 + i*100}`}></div>)}
           </div>
           <p className="text-[10px] font-bold uppercase text-slate-400 tracking-tighter">Recruiters Online</p>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Platform Candidates', value: stats.candidates, icon: Users, color: 'text-blue-500', bg: 'bg-blue-50' },
          { label: 'Active Job Orders', value: stats.jobs, icon: Briefcase, color: 'text-eon-teal', bg: 'bg-eon-teal/10' },
          { label: 'Successful Placements', value: stats.selected, icon: CheckCircle, color: 'text-green-500', bg: 'bg-green-50' },
          { label: 'Growth Index', value: '+12%', icon: TrendingUp, color: 'text-amber-500', bg: 'bg-amber-50' },
        ].map((stat, i) => (
          <div key={i} className="card p-8 bg-white border-slate-100 shadow-sm hover:shadow-2xl hover:translate-y-[-4px] transition-all duration-500 group">
            <div className="flex justify-between items-start mb-6">
                <div className={`${stat.bg} p-3 rounded-2xl ${stat.color} transition-transform group-hover:scale-110`}>
                   <stat.icon className="w-5 h-5" />
                </div>
                <div className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">MTD</div>
            </div>
            <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest mb-1">{stat.label}</p>
            <p className="text-4xl font-black text-slate-900 tracking-tighter">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="mt-12 grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 card p-8 bg-white border-slate-100 shadow-sm min-h-[400px]">
          <div className="flex items-center justify-between mb-8">
             <h3 className="font-bold text-slate-900 text-lg flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-eon-teal" /> Hiring Performance
             </h3>
             <select className="text-[10px] font-bold uppercase bg-slate-50 border-none rounded-lg px-3 py-2 outline-none">
                <option>Last 30 Days</option>
                <option>Last Quarter</option>
             </select>
          </div>
          <div className="flex-1 flex flex-col justify-center items-center text-slate-200 border-dashed border-2 border-slate-100 rounded-[32px]">
            <p className="font-serif italic text-lg text-slate-300">Analytical Visualization Feed</p>
            <p className="text-[10px] uppercase tracking-[0.3em] mt-2 font-bold">Telemetry Connected</p>
          </div>
        </div>

        <div className="card p-8 bg-slate-950 text-white relative overflow-hidden flex flex-col">
          <div className="absolute top-0 left-0 w-full h-full opacity-10 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-eon-teal via-transparent to-transparent"></div>
          <div className="relative z-10 flex-1">
            <h3 className="text-2xl font-bold tracking-tight mb-8">EON Insights</h3>
            <div className="space-y-6">
               <div className="p-5 bg-white/5 rounded-[24px] border border-white/10 backdrop-blur-sm transition-all hover:bg-white/10">
                  <p className="text-[10px] text-slate-400 uppercase tracking-[0.2em] font-black mb-2">Demand Surge</p>
                  <div className="text-lg font-bold text-eon-accent">Technical Assistants</div>
                  <p className="text-xs text-slate-500 mt-1">High conversion potential detected.</p>
               </div>
               <div className="p-5 bg-white/5 rounded-[24px] border border-white/10 backdrop-blur-sm transition-all hover:bg-white/10">
                  <p className="text-[10px] text-slate-400 uppercase tracking-[0.2em] font-black mb-2">Efficiency Rating</p>
                  <div className="text-lg font-bold">98.4%</div>
                  <div className="w-full bg-white/10 h-1 rounded-full mt-3 overflow-hidden">
                     <div className="bg-eon-teal w-[98%] h-full"></div>
                  </div>
               </div>
            </div>
          </div>
          <div className="relative z-10 pt-8 mt-auto border-t border-white/5">
            <button className="w-full py-5 bg-white text-slate-950 rounded-[20px] font-black uppercase tracking-widest text-[10px] shadow-2xl hover:scale-[1.02] active:scale-95 transition-all">
              Executive Report (AI)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
