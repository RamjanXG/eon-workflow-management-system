import React, { useState, useEffect } from 'react';
import { db } from '../lib/firebase';
import { collection, query, onSnapshot, addDoc, updateDoc, doc, deleteDoc, where, getDocs } from 'firebase/firestore';
import { Search, Plus, MoreHorizontal, UserCheck, UserX, Clock, Phone, Mail, UserCircle, X, Image as ImageIcon, Upload, FileText, Fingerprint, CreditCard, BookOpen, Truck } from 'lucide-react';
import { Candidate, CandidateStatus } from '../types';
import { Modal } from '../components/Modal';
import { cn, formatDate } from '../lib/utils';

export const Candidates = () => {
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCandidate, setEditingCandidate] = useState<Candidate | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);

  useEffect(() => {
    if (editingCandidate?.photoUrl) {
      setPhotoPreview(editingCandidate.photoUrl);
    } else {
      setPhotoPreview(null);
    }
  }, [editingCandidate, isModalOpen]);

  useEffect(() => {
    const q = query(collection(db, 'candidates'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Candidate));
      setCandidates(data);
      setLoading(false);
    }, (error) => {
      console.error("Snapshot error:", error);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  const filteredCandidates = candidates.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.phone.includes(searchTerm)
  );

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert('File size exceeds 5MB limit');
        e.target.value = '';
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    const formData = new FormData(e.currentTarget);
    const resumeFile = (formData.get('resume') as File)?.size > 0 ? (formData.get('resume') as File) : null;
    const photoFile = (formData.get('photo') as File)?.size > 0 ? (formData.get('photo') as File) : null;

    let resumeUrl = editingCandidate?.resumeUrl || '';
    let photoUrl = photoPreview || '';

    const docFields = [
      { key: 'aadharCard', folder: 'identity_docs' },
      { key: 'panCard', folder: 'identity_docs' },
      { key: 'passport', folder: 'identity_docs' },
      { key: 'drivingLicence', folder: 'identity_docs' }
    ];

    const documents = { ...editingCandidate?.documents };

    try {
      const { uploadFile } = await import('../services/storageService');
      
      if (resumeFile) {
        const uploadedUrl = await uploadFile(resumeFile, 'resumes');
        if (uploadedUrl) resumeUrl = uploadedUrl;
      }
      if (photoFile) {
        const uploadedUrl = await uploadFile(photoFile, 'photos');
        if (uploadedUrl) photoUrl = uploadedUrl;
      }

      for (const docInfo of docFields) {
        const file = formData.get(docInfo.key) as File;
        if (file && file.size > 0) {
          const uploadedUrl = await uploadFile(file, docInfo.folder);
          if (uploadedUrl) {
            (documents as any)[`${docInfo.key}Url`] = uploadedUrl;
          }
        }
      }

      const data = {
        name: formData.get('name') as string,
        email: formData.get('email') as string,
        phone: formData.get('phone') as string,
        category: formData.get('category') as any,
        experience: formData.get('experience') as string,
        skills: (formData.get('skills') as string).split(',').map(s => s.trim()),
        status: (formData.get('status') as CandidateStatus) || 'New',
        resumeUrl,
        photoUrl,
        documents,
        updatedAt: Date.now(),
      };

      if (editingCandidate) {
        await updateDoc(doc(db, 'candidates', editingCandidate.id), data);
      } else {
        // Check for duplicates
        const q = query(collection(db, 'candidates'), where('phone', '==', data.phone));
        const dupes = await getDocs(q);
        if (!dupes.empty) {
          alert('Candidate with this phone number already exists!');
          setIsSubmitting(false);
          return;
        }
        await addDoc(collection(db, 'candidates'), { ...data, createdAt: Date.now() });
      }
      setIsModalOpen(false);
      setEditingCandidate(null);
    } catch (err) {
      console.error(err);
      alert('Error saving candidate record. Please check console for details.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusColor = (status: CandidateStatus) => {
    switch (status) {
      case 'Selected': return 'bg-green-100 text-green-700';
      case 'Rejected': return 'bg-red-100 text-red-700';
      case 'Interview': return 'bg-blue-100 text-blue-700';
      case 'Blacklisted': return 'bg-neutral-900 text-white';
      default: return 'bg-amber-100 text-amber-700';
    }
  };

  return (
    <div className="p-8">
      <header className="flex items-center justify-between mb-10">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-neutral-400">Database</span>
          <h1 className="text-4xl font-bold tracking-tight text-neutral-900 mt-1">Candidates</h1>
        </div>
        <button 
          onClick={() => { setEditingCandidate(null); setIsModalOpen(true); }}
          className="flex items-center gap-2 bg-neutral-950 text-white px-6 py-3 rounded-2xl hover:shadow-xl hover:shadow-neutral-950/20 transition-all font-semibold"
        >
          <Plus className="w-5 h-5" />
          Add Candidate
        </button>
      </header>

      <div className="card mb-8">
        <div className="p-4 border-b border-neutral-100 flex items-center gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
            <input 
              type="text" 
              placeholder="Search by name, email or phone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-11 pr-4 py-3 bg-neutral-50 rounded-xl border border-neutral-200 focus:ring-2 focus:ring-neutral-950/5 focus:border-neutral-950 outline-none transition-all text-sm"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-neutral-50 border-b border-neutral-200">
                <th className="px-6 py-4 col-header">Candidate</th>
                <th className="px-6 py-4 col-header">Contact</th>
                <th className="px-6 py-4 col-header">Status</th>
                <th className="px-6 py-4 col-header">Joined</th>
                <th className="px-6 py-4 col-header text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredCandidates.map((candidate) => (
                <tr key={candidate.id} className="group border-b border-neutral-100 hover:bg-neutral-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-slate-100 overflow-hidden flex-shrink-0 border border-slate-200">
                        {candidate.photoUrl ? (
                          <img src={candidate.photoUrl} className="w-full h-full object-cover" alt="" />
                        ) : (
                          <UserCircle className="w-full h-full text-slate-300" />
                        )}
                      </div>
                      <div>
                        <div className="font-bold text-slate-900 leading-tight">{candidate.name}</div>
                        <div className="text-[10px] text-eon-teal font-black uppercase tracking-tighter mt-1">{candidate.category}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-2 text-xs text-neutral-600">
                        <Mail className="w-3 h-3" /> {candidate.email}
                      </div>
                      <div className="flex items-center gap-2 text-xs text-neutral-600">
                        <Phone className="w-3 h-3" /> {candidate.phone}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={cn("px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider", getStatusColor(candidate.status))}>
                      {candidate.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-neutral-500 font-mono">
                    {formatDate(candidate.createdAt)}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button 
                      onClick={() => { setEditingCandidate(candidate); setIsModalOpen(true); }}
                      className="p-2 hover:bg-neutral-200 rounded-lg transition-colors"
                    >
                      <MoreHorizontal className="w-5 h-5 text-neutral-400" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        title={editingCandidate ? "Edit Candidate" : "New Registration"}
      >
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase text-neutral-500">Full Name</label>
              <input name="name" required defaultValue={editingCandidate?.name} className="w-full px-4 py-3 rounded-xl border border-neutral-200 outline-none focus:border-neutral-950 transition-all" />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase text-neutral-500">Email Address</label>
              <input name="email" type="email" required defaultValue={editingCandidate?.email} className="w-full px-4 py-3 rounded-xl border border-neutral-200 outline-none focus:border-neutral-950 transition-all" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase text-neutral-500">Phone Number</label>
              <input name="phone" required defaultValue={editingCandidate?.phone} className="w-full px-4 py-3 rounded-xl border border-neutral-200 outline-none focus:border-neutral-950 transition-all" />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase text-neutral-500">Job Category</label>
              <select name="category" defaultValue={editingCandidate?.category} className="w-full px-4 py-3 rounded-xl border border-neutral-200 bg-white outline-none focus:border-neutral-950 transition-all">
                {['Driver', 'Developer', 'Delivery Boy', 'Data Entry', 'Receptionist', 'Technical Assistant', 'Security', 'Housekeeping', 'Other'].map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
               <label className="text-xs font-bold uppercase text-neutral-500">Status</label>
               <select name="status" defaultValue={editingCandidate?.status || 'New'} className="w-full px-4 py-3 rounded-xl border border-neutral-200 outline-none focus:border-neutral-950 transition-all bg-white">
                 <option value="New">New</option>
                 <option value="Interview">Interview</option>
                 <option value="Selected">Selected</option>
                 <option value="Rejected">Rejected</option>
                 <option value="Blacklisted">Blacklisted</option>
               </select>
            </div>
            <div className="space-y-2">
               <label className="text-xs font-bold uppercase text-neutral-500">Profile Photo</label>
               <div className="flex items-center gap-4">
                 <div className="relative w-16 h-16 rounded-xl bg-neutral-100 border border-neutral-200 overflow-hidden flex items-center justify-center group">
                   {photoPreview ? (
                     <>
                       <img src={photoPreview} className="w-full h-full object-cover" alt="Preview" />
                       <button 
                         type="button"
                         onClick={() => setPhotoPreview(null)}
                         className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                       >
                         <X className="w-4 h-4 text-white" />
                       </button>
                     </>
                   ) : (
                     <ImageIcon className="w-6 h-6 text-neutral-300" />
                   )}
                 </div>
                 <label className="flex-1 cursor-pointer">
                   <div className="flex flex-col items-center justify-center py-2 px-4 border border-dashed border-neutral-200 rounded-xl hover:bg-neutral-50 hover:border-neutral-400 transition-all">
                     <span className="text-[10px] font-bold text-neutral-600">Click to upload photo</span>
                     <span className="text-[8px] text-neutral-400 mt-0.5">JPG, PNG up to 5MB</span>
                   </div>
                   <input 
                     name="photo" 
                     type="file" 
                     accept="image/*" 
                     className="hidden" 
                     onChange={handlePhotoChange} 
                   />
                 </label>
               </div>
            </div>
          </div>

          <div className="space-y-4">
            <label className="text-xs font-bold uppercase text-neutral-500">Identity Documents (Max 5MB each)</label>
            <div className="grid grid-cols-2 gap-3">
              {[
                { name: 'aadharCard', label: 'Aadhaar Card', icon: Fingerprint },
                { name: 'panCard', label: 'PAN Card', icon: CreditCard },
                { name: 'passport', label: 'Passport', icon: BookOpen },
                { name: 'drivingLicence', label: 'Driving Licence', icon: Truck },
              ].map((doc) => (
                <label key={doc.name} className="cursor-pointer group block">
                  <div className="flex items-center gap-3 px-4 py-3 rounded-xl border border-neutral-200 group-hover:bg-neutral-50 group-hover:border-neutral-400 transition-all bg-white relative overflow-hidden">
                    <doc.icon className="w-4 h-4 text-neutral-400 group-hover:text-black transition-colors" />
                    <div className="flex flex-col">
                      <span className="text-[10px] font-bold text-neutral-800">{doc.label}</span>
                      <span className="text-[8px] text-neutral-400">PDF, JPG, PNG</span>
                    </div>
                    {editingCandidate?.documents?.[`${doc.name}Url` as keyof typeof editingCandidate.documents] && (
                      <div className="absolute right-3 top-1/2 -translate-y-1/2">
                        <div className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]"></div>
                      </div>
                    )}
                  </div>
                  <input 
                    name={doc.name} 
                    type="file" 
                    accept=".pdf,image/*" 
                    className="hidden" 
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file && file.size > 5 * 1024 * 1024) {
                        alert('File size exceeds 5MB limit');
                        e.target.value = '';
                      }
                    }}
                  />
                </label>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold uppercase text-neutral-500">Resume Document (PDF)</label>
            <label className="cursor-pointer group block">
              <div className="flex items-center gap-3 px-4 py-3 rounded-xl border border-neutral-200 group-hover:bg-neutral-50 group-hover:border-neutral-400 transition-all bg-white">
                <Upload className="w-4 h-4 text-neutral-400 group-hover:text-black transition-colors" />
                <span className="text-xs text-neutral-500 font-medium">Select candidate resume (PDF)</span>
              </div>
              <input 
                name="resume" 
                type="file" 
                accept=".pdf" 
                className="hidden" 
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file && file.size > 5 * 1024 * 1024) {
                    alert('File size exceeds 5MB limit');
                    e.target.value = '';
                  }
                }}
              />
            </label>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold uppercase text-neutral-500">Experience Summary</label>
            <textarea name="experience" defaultValue={editingCandidate?.experience} className="w-full px-4 py-3 rounded-xl border border-neutral-200 outline-none focus:border-neutral-950 transition-all h-24" />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold uppercase text-neutral-500">Skills (comma separated)</label>
            <input name="skills" defaultValue={editingCandidate?.skills.join(', ')} placeholder="React, Node.js, TypeScript" className="w-full px-4 py-3 rounded-xl border border-neutral-200 outline-none focus:border-neutral-950 transition-all" />
          </div>

          <button 
            type="submit" 
            disabled={isSubmitting}
            className="w-full bg-neutral-950 text-white py-4 rounded-2xl font-bold hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isSubmitting && <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>}
            {editingCandidate ? "Update Records" : "Register Candidate"}
          </button>
        </form>
      </Modal>
    </div>
  );
};
