import React, { useState } from 'react';
import { auth, db } from '../lib/firebase';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { Link, useNavigate } from 'react-router-dom';
import { UserPlus, Mail, Lock, User } from 'lucide-react';

import { Logo } from '../components/Logo';

export const Register = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleRegister = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const formData = new FormData(e.currentTarget);
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;
    const name = formData.get('name') as string;

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(userCredential.user, { displayName: name });

      // Create user profile in Firestore
      await setDoc(doc(db, 'users', userCredential.user.uid), {
        uid: userCredential.user.uid,
        email,
        displayName: name,
        role: 'candidate',
        createdAt: Date.now()
      });

      navigate('/');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 p-4 relative overflow-hidden">
      {/* Background Image Layer */}
      <div className="absolute inset-0 z-0">
        <img 
          src="https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=2000&auto=format&fit=crop" 
          className="w-full h-full object-cover opacity-60 scale-110 blur-sm"
          alt="Office Background"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-slate-950/90 via-slate-950/60 to-transparent"></div>
      </div>

      <div className="max-w-md w-full glass p-10 rounded-3xl space-y-8 bg-white shadow-2xl relative z-10">
        <div className="text-center space-y-4">
          <Logo className="h-24 w-full justify-center" showText={false} />
          <h1 className="text-3xl font-bold tracking-tighter text-slate-900 font-sans">
            Candidate <span className="font-serif italic font-normal text-eon-teal">Registration</span>
          </h1>
          <p className="text-slate-500 text-xs uppercase tracking-widest font-semibold">Join EON Workflow</p>
        </div>

        {error && <div className="p-4 bg-red-50 text-red-600 rounded-xl text-sm border border-red-100">{error}</div>}

        <form onSubmit={handleRegister} className="space-y-4">
          <div className="space-y-1">
            <label className="text-[10px] font-bold uppercase text-slate-400 ml-1">Full Name</label>
            <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input name="name" required placeholder="John Doe" className="w-full pl-11 pr-4 py-3 bg-slate-50 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-eon-teal/10 focus:border-eon-teal transition-all" />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-bold uppercase text-slate-400 ml-1">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input name="email" type="email" required placeholder="name@company.com" className="w-full pl-11 pr-4 py-3 bg-slate-50 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-eon-teal/10 focus:border-eon-teal transition-all" />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-bold uppercase text-slate-400 ml-1">Password</label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input name="password" type="password" required placeholder="••••••••" className="w-full pl-11 pr-4 py-3 bg-slate-50 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-eon-teal/10 focus:border-eon-teal transition-all" />
            </div>
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-eon-teal text-white font-bold py-4 rounded-2xl hover:bg-opacity-90 transition-all flex items-center justify-center gap-2 mt-4 shadow-lg active:scale-[0.98]"
          >
            {loading ? <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin"></div> : <UserPlus className="w-5 h-5" />}
            Register Account
          </button>
        </form>

        <div className="text-center text-sm text-slate-500">
          Already have an account? <Link to="/login" className="text-eon-teal font-bold hover:underline">Sign In</Link>
        </div>
      </div>
    </div>
  );
};
