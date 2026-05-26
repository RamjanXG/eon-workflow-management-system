import React, { useState, useEffect } from 'react';
import { db } from '../lib/firebase';
import { collection, query, onSnapshot, addDoc, doc, getDocs } from 'firebase/firestore';
import { Plus, Briefcase, Building2, MapPin, DollarSign, Users, Search } from 'lucide-react';
import { Job, Client, JobStatus } from '../types';
import { Modal } from '../components/Modal';
import { cn } from '../lib/utils';

export const Jobs = () => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const qJobs = query(collection(db, 'jobs'));
    const unsubJobs = onSnapshot(qJobs, (snapshot) => {
      setJobs(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Job)));
    });

    const getClients = async () => {
      const qClients = query(collection(db, 'clients'));
      const snapshot = await getDocs(qClients);
      setClients(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Client)));
    };
    getClients();

    return unsubJobs;
  }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const clientId = formData.get('clientId') as string;
    const client = clients.find(c => c.id === clientId);
    const imageFile = (formData.get('image') as File).size > 0 ? (formData.get('image') as File) : null;

    let imageUrl = '';
    if (imageFile) {
      const { uploadFile } = await import('../services/storageService');
      imageUrl = await uploadFile(imageFile, 'jobs') || '';
    }

    const data = {
      title: formData.get('title') as string,
      clientId: clientId,
      clientName: client?.companyName,
      category: formData.get('category') as any,
      description: formData.get('description') as string,
      location: formData.get('location') as string,
      salary: formData.get('salary') as string,
      openings: parseInt(formData.get('openings') as string),
      status: 'Open' as JobStatus,
      skillsRequired: (formData.get('skills') as string).split(',').map(s => s.trim()),
      imageUrl,
      createdAt: Date.now(),
    };

    await addDoc(collection(db, 'jobs'), data);
    setIsModalOpen(false);
  };

  return (
    <div className="p-8">
      <header className="flex items-center justify-between mb-10">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-neutral-400">Opportunities</span>
          <h1 className="text-4xl font-bold tracking-tight text-neutral-900 mt-1">Job Openings</h1>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 bg-neutral-950 text-white px-6 py-3 rounded-2xl font-semibold"
        >
          <Plus className="w-5 h-5" />
          Post New Job
        </button>
      </header>

      <div className="grid grid-cols-1 gap-4">
        {jobs.map(job => (
          <div key={job.id} className="card p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 hover:border-neutral-400 transition-all">
            <div className="flex items-center gap-6">
              <div className="w-14 h-14 bg-neutral-900 rounded-2xl flex items-center justify-center text-white">
                <Briefcase className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-neutral-900">{job.title}</h3>
                <div className="flex items-center gap-4 mt-2 text-sm text-neutral-500">
                  <div className="flex items-center gap-1.5"><Building2 className="w-3.5 h-3.5" /> {job.clientName}</div>
                  <div className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5" /> {job.location}</div>
                  <div className="flex items-center gap-1.5"><DollarSign className="w-3.5 h-3.5" /> {job.salary}</div>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-8 w-full md:w-auto pt-6 md:pt-0 border-t md:border-none border-neutral-100">
              <div className="flex flex-wrap gap-2 max-w-[200px]">
                {job.skillsRequired.slice(0, 3).map((skill, i) => (
                  <span key={i} className="px-2 py-0.5 bg-neutral-100 text-neutral-600 font-mono text-[10px] rounded uppercase">{skill}</span>
                ))}
              </div>
              <div className="text-center px-6 border-l border-neutral-100">
                <span className="text-[10px] font-bold text-neutral-400 uppercase block mb-1">Openings</span>
                <span className="text-lg font-mono font-bold">{job.openings}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className={cn(
                  "px-3 py-1 rounded-full text-[10px] font-bold uppercase",
                  job.status === 'Open' ? 'bg-green-100 text-green-700' : 'bg-neutral-200 text-neutral-500'
                )}>
                  {job.status}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Post New Job Opening">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase text-neutral-500">Job Title</label>
            <input name="title" placeholder="e.g. Senior Frontend Developer" required className="w-full px-4 py-3 rounded-xl border border-neutral-200 outline-none focus:border-neutral-900" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase text-neutral-500">Client Company</label>
              <select name="clientId" required className="w-full px-4 py-3 rounded-xl border border-neutral-200 outline-none bg-white">
                <option value="">Select a client...</option>
                {clients.map(c => <option key={c.id} value={c.id}>{c.companyName}</option>)}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase text-neutral-500">Category</label>
              <select name="category" required className="w-full px-4 py-3 rounded-xl border border-neutral-200 outline-none bg-white">
                {['Driver', 'Developer', 'Delivery Boy', 'Data Entry', 'Receptionist', 'Technical Assistant', 'Security', 'Housekeeping', 'Other'].map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold uppercase text-neutral-500">Job Description</label>
            <textarea name="description" placeholder="Describe the role and responsibilities..." className="w-full px-4 py-3 rounded-xl border border-neutral-200 h-24 outline-none"></textarea>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase text-neutral-500">Location</label>
              <input name="location" placeholder="e.g. Remote / Mumbai" required className="w-full px-4 py-3 rounded-xl border border-neutral-200 outline-none" />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase text-neutral-500">Job Banner Image</label>
              <input name="image" type="file" accept="image/*" className="w-full text-xs" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase text-neutral-500">Salary Range</label>
              <input name="salary" placeholder="e.g. 10 - 15 LPA" className="w-full px-4 py-3 rounded-xl border border-neutral-200 outline-none" />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase text-neutral-500">Openings</label>
              <input name="openings" type="number" defaultValue="1" className="w-full px-4 py-3 rounded-xl border border-neutral-200 outline-none" />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold uppercase text-neutral-500">Skills Required (comma separated)</label>
            <input name="skills" placeholder="React, Tailwind, Firebase" className="w-full px-4 py-3 rounded-xl border border-neutral-200 outline-none" />
          </div>

          <button type="submit" className="w-full bg-neutral-950 text-white py-4 rounded-2xl font-bold hover:shadow-xl transition-all uppercase tracking-widest text-xs">
            Create Job Listing
          </button>
        </form>
      </Modal>
    </div>
  );
};
