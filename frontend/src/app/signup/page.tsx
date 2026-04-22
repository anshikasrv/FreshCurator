'use client';

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Eye, EyeOff } from 'lucide-react';
import { signIn } from 'next-auth/react';

import { useTheme } from 'next-themes';
import { Sun, Moon } from 'lucide-react';

export default function Signup() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [role, setRole] = useState('User');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [hasAdmin, setHasAdmin] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
    const checkAdmin = async () => {
      try {
        const SERVER_URL = process.env.NEXT_PUBLIC_SOCKET_SERVER || 'http://localhost:4000';
        const res = await axios.get(`${SERVER_URL}/api/users/check-admin`);
        if (res.data.hasAdmin) {
          setHasAdmin(true);
        }
      } catch (err) {
        console.error('Error checking admin:', err);
      }
    };
    checkAdmin();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    const SERVER_URL = process.env.NEXT_PUBLIC_SOCKET_SERVER || 'http://localhost:4000';
    try {
      await axios.post(`${SERVER_URL}/api/users/register`, { name, email, password, role });
      router.push('/login?registered=true');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-mesh font-body text-on-surface min-h-screen flex items-center justify-center p-4 transition-colors duration-500">
      <main className="w-full max-w-md relative">
        {/* Theme Toggle */}
        <div className="absolute top-4 right-4 z-10">
          <button
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="p-3 rounded-full bg-surface-container-low hover:bg-surface-container-high transition-all hover:scale-110 text-on-surface shadow-md"
            aria-label="Toggle theme"
          >
            {mounted && (theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />)}
            {!mounted && <div className="w-5 h-5" />}
          </button>
        </div>

        <div className="bg-surface/70 backdrop-blur-xl w-full p-8 md:p-10 rounded-3xl shadow-xl border border-outline-variant/10 text-center relative">
          <Link href="/" className="inline-block mb-6">
            <h1 className="font-headline font-extrabold text-3xl text-primary tracking-tighter">FreshCurator</h1>
          </Link>
          
          <div className="mb-8">
            <h2 className="font-headline font-extrabold text-2xl mb-1 tracking-tight text-on-surface">Create Account</h2>
            <p className="text-on-surface-variant text-sm">Join the organic movement today</p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-error/10 text-error rounded-xl text-sm font-medium flex items-center gap-2 animate-shake border border-error/20">
              <span className="material-symbols-outlined text-base text-left">error</span>
              {error}
            </div>
          )}

          {/* Role Selection */}
          <div className="grid grid-cols-3 gap-2 mb-8">
            <button onClick={() => setRole('User')} type="button" className={`flex flex-col items-center justify-center gap-1 p-2 rounded-xl transition-all border-2 ${role === 'User' ? 'border-primary bg-primary text-on-primary shadow-md' : 'border-outline-variant/10 bg-surface-container-low text-on-surface-variant hover:bg-surface-container-high'}`}>
              <span className="material-symbols-outlined text-sm">person</span>
              <span className="font-label text-[10px] font-bold uppercase tracking-tighter">Buyer</span>
            </button>
            <button onClick={() => setRole('Delivery Boy')} type="button" className={`flex flex-col items-center justify-center gap-1 p-2 rounded-xl transition-all border-2 ${role === 'Delivery Boy' ? 'border-primary bg-primary text-on-primary shadow-md' : 'border-outline-variant/10 bg-surface-container-low text-on-surface-variant hover:bg-surface-container-high'}`}>
              <span className="material-symbols-outlined text-sm">local_shipping</span>
              <span className="font-label text-[10px] font-bold uppercase tracking-tighter">Rider</span>
            </button>
            {!hasAdmin && (
              <button onClick={() => setRole('Admin')} type="button" className={`flex flex-col items-center justify-center gap-1 p-2 rounded-xl transition-all border-2 ${role === 'Admin' ? 'border-primary bg-primary text-on-primary shadow-md' : 'border-outline-variant/10 bg-surface-container-low text-on-surface-variant hover:bg-surface-container-high'}`}>
                <span className="material-symbols-outlined text-sm">shield_person</span>
                <span className="font-label text-[10px] font-bold uppercase tracking-tighter">Admin</span>
              </button>
            )}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <input value={name} onChange={e => setName(e.target.value)} required className="w-full px-4 py-3.5 bg-surface-container-low text-on-surface rounded-xl border-none ring-1 ring-outline-variant/20 focus:ring-2 focus:ring-primary focus:bg-surface transition-all text-sm" placeholder="Full Name" />
            <input value={email} onChange={e => setEmail(e.target.value)} required className="w-full px-4 py-3.5 bg-surface-container-low text-on-surface rounded-xl border-none ring-1 ring-outline-variant/20 focus:ring-2 focus:ring-primary focus:bg-surface transition-all text-sm" placeholder="Email Address" type="email" />
            
            <div className="relative">
              <input value={password} onChange={e => setPassword(e.target.value)} required className="w-full pl-4 pr-12 py-3.5 bg-surface-container-low text-on-surface rounded-xl border-none ring-1 ring-outline-variant/20 focus:ring-2 focus:ring-primary focus:bg-surface transition-all text-sm" placeholder="Password (min 6 chars)" type={showPassword ? 'text' : 'password'} minLength={6} />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-on-surface">
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
            
            <button disabled={loading} className="w-full mt-4 bg-primary text-on-primary font-bold py-4 rounded-xl shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-70" type="submit">
              {loading ? 'Creating Account...' : 'Sign Up'}
            </button>

            <div className="flex items-center gap-4 my-2">
              <div className="h-px flex-1 bg-outline-variant/20"></div>
              <span className="text-xs font-label text-on-surface-variant">OR</span>
              <div className="h-px flex-1 bg-outline-variant/20"></div>
            </div>

            <button type="button" onClick={() => signIn('google', { callbackUrl: '/' })} className="w-full bg-surface text-on-surface font-bold py-3.5 rounded-xl border border-outline-variant/30 shadow-sm hover:bg-surface-container-low transition-all flex items-center justify-center gap-3">
              <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" className="w-5 h-5" />
              Continue with Google
            </button>
          </form>

          <p className="mt-8 text-sm text-on-surface-variant">
            Already have an account? <Link href="/login" className="text-primary font-bold hover:underline">Sign In</Link>
          </p>
        </div>
      </main>
    </div>
  );
}
