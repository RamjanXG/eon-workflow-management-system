import React, { useState, useEffect } from 'react';
import { db, auth } from '../lib/firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { useAuthState } from 'react-firebase-hooks/auth';
import { User, Mail, Phone, Briefcase, FileText, Upload, Save, UserCircle } from 'lucide-react';
import { Candidate, JobCategory } from '../types';
import { uploadFile } from '../services/storageService';

const CATEGORIES: JobCategory[] = ['Driver', 'Developer', 'Delivery Boy', 'Data Entry', 'Receptionist', 'Technical Assistant', 'Security', 'Housekeeping', 'Other'];

export const Profile = () => {
  const [user] = useAuthState(auth);
  const [profile, setProfile] = useState<Partial<Candidate> | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function fetchProfile() {
      if (!user) return;
      // We store profile in candidates collection linked by uid or same ID as user.uid
      const profileDoc = await getDoc(doc(db, 'candidates', user.uid));
      if (profileDoc.exists()) {
        setProfile(profileDoc.data() as Candidate);
      } else {
        setProfile({
          name: user.displayName || '',
          email: user.email || '',
          status: 'New'
        });
      }
      setLoading(false);
    }
    fetchProfile();
  }, [user]);

  const handleUpdate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!user) return;
    setSaving(true);

    const formData = new FormData(e.currentTarget);
    const resumeFile = (formData.get('resume') as File).size > 0 ? (formData.get('resume') as File) : null;
    const photoFile = (formData.get('photo') as File).size > 0 ? (formData.get('photo') as File) : null;

    let resumeUrl = profile?.resumeUrl;
    let photoUrl = profile?.photoUrl;

    if (resumeFile) resumeUrl = await uploadFile(resumeFile, 'resumes') || resumeUrl;
    if (photoFile) photoUrl = await uploadFile(photoFile, 'photos') || photoUrl;

    const data = {
      name: formData.get('name') as string,
      email: formData.get('email') as string,
      phone: formData.get('phone') as string,
      category: formData.get('category') as JobCategory,
      experience: formData.get('experience') as string,
      skills: (formData.get('skills') as string).split(',').map(s => s.trim()),
      resumeUrl,
      photoUrl,
      uid: user.uid,
      updatedAt: Date.now()
    };

    try {
      // Use setDoc with merge for the first time or update
      await updateDoc(doc(db, 'candidates', user.uid), data).catch(async () => {
        const { setDoc } = await import('firebase/firestore');
        await setDoc(doc(db, 'candidates', user.uid), { ...data, status: 'New', createdAt: Date.now() });
      });
      setProfile(prev => ({ ...prev, ...data }));
      alert('Profile updated successfully!');
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-8">Loading Profile...</div>;

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <header className="mb-10">
        <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-eon-teal">Candidate Portal</span>
        <h1 className="text-4xl font-bold tracking-tight text-slate-900 mt-1 font-sans">My <span className="font-serif italic font-normal text-slate-500 underline decoration-eon-accent">Professional</span> Profile</h1>
      </header>

      <form onSubmit={handleUpdate} className="space-y-8">
        <div className="card p-8 space-y-8 bg-white border-slate-200 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8">
             <div className="w-24 h-24 rounded-2xl bg-slate-50 border-2 border-dashed border-slate-200 flex items-center justify-center overflow-hidden group">
               {profile?.photoUrl ? (
                 <img src={profile.photoUrl} className="w-full h-full object-cover" alt="Profile" />
               ) : (
                 <UserCircle className="w-10 h-10 text-slate-200" />
               )}
               <label className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 flex items-center justify-center cursor-pointer transition-all">
                 <Upload className="w-6 h-6 text-white" />
                 <input name="photo" type="file" accept="image/*" className="hidden" />
               </label>
             </div>
             <p className="text-[10px] uppercase font-bold text-slate-400 mt-2 text-center">Change Photo</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pr-32">
            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase text-slate-400">Full Name</label>
              <input name="name" defaultValue={profile?.name} required className="w-full px-4 py-3 rounded-xl border border-slate-200" />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase text-slate-400">Email</label>
              <input name="email" type="email" defaultValue={profile?.email} required className="w-full px-4 py-3 rounded-xl border border-slate-200" />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase text-slate-400">Phone</label>
              <input name="phone" defaultValue={profile?.phone} required className="w-full px-4 py-3 rounded-xl border border-slate-200" />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase text-slate-400">Job Category</label>
              <select name="category" defaultValue={profile?.category} className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white">
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-bold uppercase text-slate-400">Skills (comma separated)</label>
            <input name="skills" defaultValue={profile?.skills?.join(', ')} placeholder="e.g. Driving, Maintenance, React" className="w-full px-4 py-3 rounded-xl border border-slate-200" />
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-bold uppercase text-slate-400">Professional Summary / Experience</label>
            <textarea name="experience" defaultValue={profile?.experience} placeholder="Tell us about your past work..." className="w-full px-4 py-3 rounded-xl border border-slate-200 h-32" />
          </div>

          <div className="p-6 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center border border-slate-100 shadow-sm">
                  <FileText className="w-6 h-6 text-eon-teal" />
                </div>
                <div>
                   <h4 className="font-bold text-slate-900">Professional Resume</h4>
                   <p className="text-xs text-slate-500">PDF or Word document (Max 5MB)</p>
                </div>
              </div>
              <label className="bg-white text-slate-900 px-4 py-2 rounded-lg border border-slate-200 text-xs font-bold uppercase cursor-pointer hover:bg-slate-50 active:scale-95 transition-all">
                {profile?.resumeUrl ? 'Update Resume' : 'Upload File'}
                <input name="resume" type="file" accept=".pdf,.doc,.docx" className="hidden" />
              </label>
            </div>
            {profile?.resumeUrl && (
              <a href={profile.resumeUrl} target="_blank" rel="noreferrer" className="text-[10px] font-bold text-eon-teal mt-4 block hover:underline">
                View current resume document →
              </a>
            )}
          </div>
        </div>

        <button 
          disabled={saving}
          type="submit" 
          className="w-full py-5 bg-eon-teal text-white rounded-2xl font-black uppercase tracking-widest text-sm shadow-xl shadow-eon-teal/20 hover:scale-[1.01] active:scale-95 transition-all flex items-center justify-center gap-3"
        >
          {saving ? <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin"></div> : <Save className="w-5 h-5" />}
          Save Profile Information
        </button>
      </form>
    </div>
  );
};
