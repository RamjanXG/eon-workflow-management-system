import React, { useState, useEffect } from 'react';
import { db } from '../lib/firebase';
import { collection, query, onSnapshot, addDoc, updateDoc, doc, getDocs } from 'firebase/firestore';
import { Plus, ClipboardList, User, Briefcase, Calendar, Zap } from 'lucide-react';
import { Application, Candidate, Job } from '../types';
import { Modal } from '../components/Modal';
import { cn, formatDate } from '../lib/utils';
import { matchCandidateToJob } from '../services/geminiService';

export const Applications = () => {
  const [applications, setApplications] = useState<Application[]>([]);
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState<{ score: number, justification: string } | null>(null);
  const [analyzing, setAnalyzing] = useState(false);

  useEffect(() => {
    onSnapshot(query(collection(db, 'applications')), (s) => setApplications(s.docs.map(d => ({ id: d.id, ...d.data() } as Application))));
    onSnapshot(query(collection(db, 'candidates')), (s) => setCandidates(s.docs.map(d => ({ id: d.id, ...d.data() } as Candidate))));
    onSnapshot(query(collection(db, 'jobs')), (s) => setJobs(s.docs.map(d => ({ id: d.id, ...d.data() } as Job))));
  }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = {
      candidateId: formData.get('candidateId') as string,
      jobId: formData.get('jobId') as string,
      status: 'Applied' as const,
      appliedAt: Date.now(),
      updatedAt: Date.now(),
    };
    await addDoc(collection(db, 'applications'), data);
    setIsModalOpen(false);
  };

  const updateStatus = async (id: string, status: Application['status']) => {
    await updateDoc(doc(db, 'applications', id), { status, updatedAt: Date.now() });
  };

  const handleAiMatch = async (candidateId: string, jobId: string) => {
    const candidate = candidates.find(c => c.id === candidateId);
    const job = jobs.find(j => j.id === jobId);
    if (!candidate || !job) return;

    setAnalyzing(true);
    const result = await matchCandidateToJob(
      `Name: ${candidate.name}, Skills: ${candidate.skills.join(', ')}, Exp: ${candidate.experience}`,
      `Title: ${job.title}, Requirements: ${job.skillsRequired.join(', ')}`
    );
    setAiAnalysis(result);
    setAnalyzing(false);
  };

  return (
    <div className="p-8">
      <header className="flex items-center justify-between mb-10">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-neutral-400">Pipeline</span>
          <h1 className="text-4xl font-bold tracking-tight text-neutral-900 mt-1">Hiring Pipeline</h1>
        </div>
        <button onClick={() => setIsModalOpen(true)} className="flex items-center gap-2 bg-neutral-950 text-white px-6 py-3 rounded-2xl font-semibold">
          <Plus className="w-5 h-5" />
          New Application
        </button>
      </header>

      <div className="space-y-4">
        {['Applied', 'Shortlisted', 'Interview', 'Selected', 'Rejected'].map(statusGroup => (
          <div key={statusGroup} className="space-y-4">
            <h2 className="text-xs font-bold uppercase tracking-widest text-neutral-400 flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-neutral-300"></div>
              {statusGroup}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {applications.filter(a => a.status === statusGroup).map(app => {
                const candidate = candidates.find(c => c.id === app.candidateId);
                const job = jobs.find(j => j.id === app.jobId);
                return (
                  <div key={app.id} className="card p-5 group hover:shadow-lg transition-all border-neutral-200">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h4 className="font-bold text-neutral-950">{candidate?.name || 'Unknown'}</h4>
                        <p className="text-[10px] uppercase font-mono text-neutral-500">{job?.title || 'Unknown Job'}</p>
                      </div>
                      <select 
                        value={app.status} 
                        onChange={(e) => updateStatus(app.id, e.target.value as any)}
                        className="text-[10px] font-bold border-none bg-neutral-100 rounded-lg px-2 py-1 outline-none"
                      >
                        <option value="Applied">Applied</option>
                        <option value="Shortlisted">Shortlisted</option>
                        <option value="Interview">Interview</option>
                        <option value="Selected">Selected</option>
                        <option value="Rejected">Rejected</option>
                      </select>
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t border-neutral-100">
                       <span className="text-[10px] text-neutral-400 font-mono italic">{formatDate(app.appliedAt)}</span>
                       <button 
                        onClick={() => handleAiMatch(app.candidateId, app.jobId)}
                        className="p-1.5 rounded-lg hover:bg-neutral-100 text-neutral-400 hover:text-neutral-950 transition-colors"
                        title="AI Analysis"
                       >
                         <Zap className="w-3.5 h-3.5" />
                       </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      <Modal isOpen={isModalOpen} onClose={() => { setIsModalOpen(false); setAiAnalysis(null); }} title="Register Application">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase text-neutral-500">Select Candidate</label>
            <select name="candidateId" required className="w-full px-4 py-3 rounded-xl border border-neutral-200 bg-white">
              <option value="">Select candidate...</option>
              {candidates.map(c => <option key={c.id} value={c.id}>{c.name} ({c.phone})</option>)}
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase text-neutral-500">Select Job Opening</label>
            <select name="jobId" required className="w-full px-4 py-3 rounded-xl border border-neutral-200 bg-white">
              <option value="">Select job...</option>
              {jobs.map(j => <option key={j.id} value={j.id}>{j.title} at {j.clientName}</option>)}
            </select>
          </div>
          <button type="submit" className="w-full bg-neutral-950 text-white py-4 rounded-2xl font-bold uppercase tracking-widest text-xs">
            Start Application
          </button>
        </form>
      </Modal>

      {/* AI Analysis Overlay */}
      {analyzing && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-white/50 backdrop-blur-sm">
          <div className="glass p-8 rounded-3xl flex items-center gap-4">
            <Zap className="w-6 h-6 animate-pulse text-neutral-900" />
            <span className="font-bold tracking-tight">AI performing match analysis...</span>
          </div>
        </div>
      )}

      {aiAnalysis && (
        <Modal isOpen={!!aiAnalysis} onClose={() => setAiAnalysis(null)} title="AI Match Verdict">
          <div className="space-y-6">
            <div className="text-center">
              <div className="text-6xl font-serif italic mb-2">{aiAnalysis.score}%</div>
              <div className="text-xs font-bold uppercase tracking-[.3em] text-neutral-400">Match Confidence</div>
            </div>
            <div className="p-6 bg-neutral-50 rounded-2xl border border-neutral-200">
              <p className="text-neutral-700 leading-relaxed italic">"{aiAnalysis.justification}"</p>
            </div>
            <button onClick={() => setAiAnalysis(null)} className="w-full bg-neutral-950 text-white py-4 rounded-2xl font-bold">
              Acknowledged
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
};
