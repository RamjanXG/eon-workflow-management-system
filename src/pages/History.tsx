import React, { useState, useEffect } from 'react';
import { db } from '../lib/firebase';
import { collection, query, onSnapshot, addDoc, where } from 'firebase/firestore';
import { History, User, Building2, Calendar, Star, AlertCircle, ShieldAlert, Plus } from 'lucide-react';
import { HistoryRecord, Candidate } from '../types';
import { useUserRole } from '../hooks/useUserRole';
import { Modal } from '../components/Modal';
import { cn, formatDate } from '../lib/utils';

export const CandidateHistory = () => {
  const [history, setHistory] = useState<HistoryRecord[]>([]);
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const { isAdmin } = useUserRole();
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    onSnapshot(query(collection(db, 'history')), (s) => setHistory(s.docs.map(d => ({ id: d.id, ...d.data() } as HistoryRecord))));
    onSnapshot(query(collection(db, 'candidates')), (s) => setCandidates(s.docs.map(d => ({ id: d.id, ...d.data() } as Candidate))));
  }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = {
      candidateId: formData.get('candidateId') as string,
      company: formData.get('company') as string,
      role: formData.get('role') as string,
      joiningDate: formData.get('joiningDate') as string,
      leavingDate: formData.get('leavingDate') as string,
      performanceRating: parseInt(formData.get('performanceRating') as string),
      exitReason: formData.get('exitReason') as string,
      eligibleForRehire: formData.get('eligibleForRehire') === 'on',
      confidentialNotes: isAdmin ? (formData.get('confidentialNotes') as string) : '',
      createdAt: Date.now(),
    };
    await addDoc(collection(db, 'history'), data);
    setIsModalOpen(false);
  };

  return (
    <div className="p-8">
      <header className="flex items-center justify-between mb-10">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-neutral-400">Lifecycle</span>
          <h1 className="text-4xl font-bold tracking-tight text-neutral-900 mt-1">Employment History</h1>
        </div>
        <button onClick={() => setIsModalOpen(true)} className="flex items-center gap-2 bg-neutral-950 text-white px-6 py-3 rounded-2xl font-semibold">
          <Plus className="w-5 h-5" />
          Log Exit/History
        </button>
      </header>

      <div className="space-y-6">
        {history.sort((a, b) => b.createdAt - a.createdAt).map(record => {
          const candidate = candidates.find(c => c.id === record.candidateId);
          return (
            <div key={record.id} className="card p-8 group relative overflow-hidden">
               {!record.eligibleForRehire && (
                <div className="absolute top-0 right-0 p-4">
                   <div className="bg-red-50 text-red-600 px-3 py-1 rounded-full flex items-center gap-2 text-[10px] font-bold uppercase ring-1 ring-red-100">
                    <AlertCircle className="w-3 h-3" /> Not Eligible for Rehire
                   </div>
                </div>
              )}
              
              <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                <div className="lg:col-span-1">
                  <div className="text-xs font-bold uppercase tracking-widest text-neutral-400 mb-2">Employee</div>
                  <h3 className="text-xl font-bold">{candidate?.name || 'Unknown'}</h3>
                  <p className="text-xs font-mono text-neutral-500 mt-1 uppercase tracking-tighter">{record.role}</p>
                </div>

                <div className="lg:col-span-1">
                  <div className="text-xs font-bold uppercase tracking-widest text-neutral-400 mb-2">Company</div>
                  <div className="flex items-center gap-2 font-medium">
                    <Building2 className="w-4 h-4 text-neutral-400" /> {record.company}
                  </div>
                  <div className="flex items-center gap-2 text-xs text-neutral-500 mt-2 font-mono italic">
                    <Calendar className="w-3 h-3" /> {record.joiningDate} — {record.leavingDate || 'Present'}
                  </div>
                </div>

                <div className="lg:col-span-1">
                   <div className="text-xs font-bold uppercase tracking-widest text-neutral-400 mb-2">Performance</div>
                   <div className="flex gap-1 mb-2">
                     {[1,2,3,4,5].map(i => (
                       <Star key={i} className={cn("w-4 h-4", i <= record.performanceRating ? "text-amber-400 fill-amber-400" : "text-neutral-200")} />
                     ))}
                   </div>
                   <p className="text-sm text-neutral-600 leading-relaxed italic">"{record.exitReason}"</p>
                </div>

                <div className="lg:col-span-1 border-l border-neutral-100 pl-8">
                  <div className="text-xs font-bold uppercase tracking-widest text-neutral-400 mb-2 flex items-center gap-2">
                    <ShieldAlert className="w-3 h-3" /> Confidential Notes
                  </div>
                  {isAdmin ? (
                    <p className="text-sm text-neutral-600 bg-neutral-50 p-4 rounded-xl border border-neutral-100 italic">
                      {record.confidentialNotes || 'No notes available'}
                    </p>
                  ) : (
                    <div className="h-12 bg-neutral-100/50 rounded-xl flex items-center justify-center border border-neutral-100 border-dashed">
                       <span className="text-[10px] uppercase font-bold text-neutral-300 tracking-widest">Admin Access Only</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Log Employment Record">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase text-neutral-500">Employee/Candidate</label>
            <select name="candidateId" required className="w-full px-4 py-3 rounded-xl border border-neutral-200 bg-white shadow-sm">
              <option value="">Select individual...</option>
              {candidates.map(c => <option key={c.id} value={c.id}>{c.name} ({c.phone})</option>)}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase text-neutral-500">Company Name</label>
              <input name="company" required className="w-full px-4 py-3 rounded-xl border border-neutral-200" />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase text-neutral-500">Designation / Role</label>
              <input name="role" required className="w-full px-4 py-3 rounded-xl border border-neutral-200" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase text-neutral-500">Joining Date</label>
              <input name="joiningDate" type="date" required className="w-full px-4 py-3 rounded-xl border border-neutral-200 shadow-sm" />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase text-neutral-500">Relieving Date</label>
              <input name="leavingDate" type="date" className="w-full px-4 py-3 rounded-xl border border-neutral-200 shadow-sm" />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold uppercase text-neutral-500">Performance Rating (1-5)</label>
            <div className="flex gap-4">
              {[1,2,3,4,5].map(i => (
                <label key={i} className="flex-1 text-center cursor-pointer group">
                  <input type="radio" name="performanceRating" value={i} className="sr-only peer" defaultChecked={i === 3} />
                  <div className="py-3 rounded-xl border border-neutral-200 peer-checked:border-neutral-950 peer-checked:bg-neutral-950 peer-checked:text-white transition-all text-sm font-bold">
                    {i}
                  </div>
                </label>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold uppercase text-neutral-500">Exit Summary / Reason</label>
            <textarea name="exitReason" className="w-full px-4 py-3 rounded-xl border border-neutral-200 h-24" />
          </div>

          <label className="flex items-center gap-3 cursor-pointer group">
            <input type="checkbox" name="eligibleForRehire" defaultChecked className="w-5 h-5 rounded-md border-neutral-300 text-neutral-950 focus:ring-neutral-950" />
            <span className="text-sm font-semibold text-neutral-700">Eligible for Rehire</span>
          </label>

          {isAdmin && (
             <div className="space-y-2 p-4 bg-amber-50 rounded-2xl border border-amber-100">
              <label className="text-xs font-bold uppercase text-amber-700 flex items-center gap-2">
                <ShieldAlert className="w-3 h-3" /> Confidential Admin Notes
              </label>
              <textarea name="confidentialNotes" placeholder="Hidden from recruiters..." className="w-full px-4 py-3 rounded-xl border border-amber-200 bg-white h-24 text-sm" />
            </div>
          )}

          <button type="submit" className="w-full bg-neutral-950 text-white py-4 rounded-2xl font-bold uppercase tracking-widest text-xs">
            Save Record
          </button>
        </form>
      </Modal>
    </div>
  );
};
