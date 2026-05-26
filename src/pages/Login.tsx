import React, { useState } from 'react';
import { auth, db } from '../lib/firebase';
import { signInWithPopup, GoogleAuthProvider, signInWithEmailAndPassword } from 'firebase/auth';
import { LogIn, Mail, Lock } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { doc, getDoc, setDoc } from 'firebase/firestore';

import { Logo } from '../components/Logo';

export const Login = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleGoogleSignIn = async () => {
    setLoading(true);
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      // Sync user to users collection
      const userDoc = await getDoc(doc(db, 'users', result.user.uid));
      if (!userDoc.exists()) {
        await setDoc(doc(db, 'users', result.user.uid), {
          uid: result.user.uid,
          email: result.user.email,
          displayName: result.user.displayName,
          role: 'candidate', // Default to candidate
          createdAt: Date.now()
        });
      }
      navigate('/');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleEmailSignIn = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    const formData = new FormData(e.currentTarget);
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigate('/');
    } catch (err: any) {
      setError('Invalid email or password');
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
      
      {/* Decorative background elements */}
      <div className="absolute top-0 right-0 w-[50%] h-[50%] bg-eon-teal opacity-20 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2"></div>
      
      <div className="max-w-md w-full glass p-10 rounded-3xl space-y-8 bg-white shadow-2xl relative z-10">
        <div className="text-center space-y-6">
          <Logo className="h-24 w-full justify-center" showText={false} />
          <div className="space-y-1">
            <h1 className="text-2xl font-black tracking-tighter text-slate-900 font-sans uppercase">
              EON Workflow
            </h1>
            <p className="text-slate-500 text-[10px] uppercase tracking-[0.4em] font-black opacity-40">System Administration</p>
          </div>
        </div>

        {error && <div className="p-4 bg-red-50 text-red-600 rounded-xl text-sm border border-red-100">{error}</div>}

        <form onSubmit={handleEmailSignIn} className="space-y-4">
          <div className="space-y-1">
            <label className="text-[10px] font-bold uppercase text-slate-400 ml-1">Work Email</label>
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
            className="w-full bg-slate-900 text-white font-bold py-4 rounded-2xl hover:bg-slate-800 transition-all flex items-center justify-center gap-2 mt-4"
          >
            {loading ? <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin"></div> : <LogIn className="w-5 h-5" />}
            Sign In
          </button>
        </form>

        <div className="relative flex items-center gap-4 text-slate-300">
          <div className="flex-1 h-px bg-slate-200"></div>
          <span className="text-[10px] font-bold uppercase tracking-widest">or</span>
          <div className="flex-1 h-px bg-slate-200"></div>
        </div>

        <button 
          onClick={handleGoogleSignIn}
          disabled={loading}
          className="w-full flex items-center justify-center gap-3 bg-white text-slate-700 font-semibold py-4 px-6 rounded-2xl border border-slate-200 hover:bg-slate-50 transition-all shadow-sm"
        >
          <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" className="w-5 h-5" />
          Continue with Google
        </button>

        <div className="text-center text-sm text-slate-500 pt-4">
          Looking for a job? <Link to="/register" className="text-eon-teal font-bold hover:underline">Register as Candidate</Link>
        </div>

        <p className="text-[10px] text-slate-400 text-center uppercase tracking-tight">Authorized Personnel Only • EON Facility Management</p>
      </div>
    </div>
  );
};
