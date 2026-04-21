"use client";

import React, { useState, useEffect, Suspense } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Eye, EyeOff } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";

import { useTheme } from "next-themes";
import { Sun, Moon } from "lucide-react";

function LoginForm() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [role, setRole] = useState("User");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState(1);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();
  const searchParams = useSearchParams();
  const registered = searchParams.get("registered");

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const SERVER_URL =
        process.env.NEXT_PUBLIC_SOCKET_SERVER || "http://localhost:4000";
      const BACKEND_URL = `${SERVER_URL}/api/users`;
      await axios.post(`${BACKEND_URL}/send-otp`, { email, password });

      if (registered) {
        const params = new URLSearchParams(searchParams.toString());
        params.delete("registered");
        router.replace(`/login?${params.toString()}`, { scroll: false });
      }
      setStep(2);
    } catch (err: any) {
      setError(err.response?.data?.error || "Failed to authenticate");
      if (registered) {
        const params = new URLSearchParams(searchParams.toString());
        params.delete("registered");
        router.replace(`/login?${params.toString()}`, { scroll: false });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const res = await signIn("credentials", {
      email,
      password,
      role,
      otp,
      redirect: false,
    });

    if (res?.error) {
      setError(res.error);
      setLoading(false);
    } else {
      router.push("/");
      router.refresh();
    }
  };

  return (
    <div className="bg-mesh font-body text-on-surface min-h-screen flex items-center justify-center p-4 md:p-8 transition-colors duration-500">
      <main className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        {/* Left Column: Branding & Value Prop */}
        <section className="lg:col-span-5 hidden lg:flex flex-col gap-8">
          <div className="space-y-4">
            <Link href="/">
              <h1 className="font-headline font-extrabold text-6xl tracking-tighter text-primary">
                FreshCurator
              </h1>
            </Link>
            <p className="font-headline text-2xl font-semibold text-secondary leading-tight">
              The organic marketplace, <br />
              <span className="text-tertiary">expertly curated</span> for you.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-surface-container-lowest p-6 rounded-xl shadow-sm border border-outline-variant/10">
              <span className="material-symbols-outlined text-primary text-3xl mb-3">
                potted_plant
              </span>
              <h3 className="font-headline font-bold text-lg mb-1">
                Pesticide Free
              </h3>
              <p className="text-on-surface-variant text-sm text-left">
                Directly from curated local organic farms.
              </p>
            </div>
            <div className="bg-surface-container-lowest p-6 rounded-xl shadow-sm border border-outline-variant/10">
              <span className="material-symbols-outlined text-primary text-3xl mb-3">
                speed
              </span>
              <h3 className="font-headline font-bold text-lg mb-1">
                Fast Fleet
              </h3>
              <p className="text-on-surface-variant text-sm text-left">
                Smart routing for 30-minute deliveries.
              </p>
            </div>
          </div>
        </section>

        {/* Right Column: Auth Card */}
        <section className="lg:col-span-7 flex justify-center w-full relative">
          {/* Theme Toggle for Mobile/Tablet or focused view */}
          <div className="absolute top-4 right-4 z-10">
            <button
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="p-3 rounded-full bg-surface-container-low hover:bg-surface-container-high transition-all hover:scale-110 text-on-surface shadow-md"
              aria-label="Toggle theme"
            >
              {mounted &&
                (theme === "dark" ? <Sun size={20} /> : <Moon size={20} />)}
              {!mounted && <div className="w-5 h-5" />}
            </button>
          </div>

          <div className="bg-surface/70 backdrop-blur-xl w-full max-w-md p-8 md:p-10 rounded-3xl shadow-xl border border-outline-variant/10 relative overflow-hidden">
            <div className="mb-8 text-center">
              <h2 className="font-headline font-extrabold text-3xl mb-2 tracking-tight">
                Welcome back
              </h2>
              <p className="text-on-surface-variant">
                Choose your role and sign in
              </p>
            </div>

            {registered && (
              <div className="mb-6 p-4 bg-primary-container/20 text-primary rounded-xl text-sm font-medium flex items-center gap-2 border border-primary/20">
                <span className="material-symbols-outlined text-base">
                  check_circle
                </span>
                Registration successful! Please sign in.
              </div>
            )}

            {error && (
              <div className="mb-6 p-4 bg-error/10 text-error rounded-xl text-sm font-medium flex items-center gap-2 animate-shake border border-error/20">
                <span className="material-symbols-outlined text-base">
                  error
                </span>
                {error}
              </div>
            )}

            <div className="grid grid-cols-3 gap-3 mb-8">
              <button
                onClick={() => setRole("User")}
                type="button"
                className={`flex flex-col items-center gap-2 p-4 rounded-xl transition-all border-2 ${role === "User" ? "border-primary bg-primary text-on-primary shadow-lg ring-4 ring-primary/10" : "border-outline-variant/10 bg-surface-container-low text-on-surface-variant hover:bg-surface-container-high"}`}
              >
                <span className="material-symbols-outlined">person</span>
                <span className="font-label text-xs font-bold">Buyer</span>
              </button>
              <button
                onClick={() => setRole("Delivery Boy")}
                type="button"
                className={`flex flex-col items-center gap-2 p-4 rounded-xl transition-all border-2 ${role === "Delivery Boy" ? "border-primary bg-primary text-on-primary shadow-lg ring-4 ring-primary/10" : "border-outline-variant/10 bg-surface-container-low text-on-surface-variant hover:bg-surface-container-high"}`}
              >
                <span className="material-symbols-outlined">
                  local_shipping
                </span>
                <span className="font-label text-xs font-bold">Rider</span>
              </button>
              <button
                onClick={() => setRole("Admin")}
                type="button"
                className={`flex flex-col items-center gap-2 p-4 rounded-xl transition-all border-2 ${role === "Admin" ? "border-primary bg-primary text-on-primary shadow-lg ring-4 ring-primary/10" : "border-outline-variant/10 bg-surface-container-low text-on-surface-variant hover:bg-surface-container-high"}`}
              >
                <span className="material-symbols-outlined">
                  admin_panel_settings
                </span>
                <span className="font-label text-xs font-bold">Admin</span>
              </button>
            </div>

            <AnimatePresence mode="wait">
              {step === 1 ? (
                <motion.form
                  key="step1"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  onSubmit={handleSendOtp}
                  className="space-y-4"
                >
                  <input
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full px-4 py-3.5 bg-surface-container-low text-on-surface rounded-xl border-none ring-1 ring-outline-variant/20 focus:ring-2 focus:ring-primary focus:bg-surface transition-all text-sm"
                    placeholder="Email Address"
                    type="email"
                  />

                  <div className="relative">
                    <input
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      className="w-full pl-4 pr-12 py-3.5 bg-surface-container-low text-on-surface rounded-xl border-none ring-1 ring-outline-variant/20 focus:ring-2 focus:ring-primary focus:bg-surface transition-all text-sm"
                      placeholder="Password"
                      type={showPassword ? "text" : "password"}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-on-surface"
                    >
                      {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>

                  <button
                    disabled={loading}
                    className="w-full mt-4 bg-primary text-on-primary font-bold py-4 rounded-xl shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-70"
                    type="submit"
                  >
                    {loading ? "Authenticating..." : "Sign In & Get OTP"}
                  </button>

                  <div className="flex items-center gap-4 my-2">
                    <div className="h-px flex-1 bg-outline-variant/20"></div>
                    <span className="text-xs font-label text-on-surface-variant">
                      OR
                    </span>
                    <div className="h-px flex-1 bg-outline-variant/20"></div>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      document.cookie = `fc_oauth_role=${role}; path=/; max-age=3600; SameSite=Lax`;
                      const callbackUrl =
                        role === "Delivery Boy"
                          ? "/delivery/dashboard"
                          : role === "Admin"
                            ? "/admin"
                            : "/";
                      signIn("google", { callbackUrl });
                    }}
                    className="w-full bg-surface text-on-surface font-bold py-3.5 rounded-xl border border-outline-variant/30 shadow-sm hover:bg-surface-container-low transition-all flex items-center justify-center gap-3"
                  >
                    <img
                      src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
                      alt="Google"
                      className="w-5 h-5"
                    />
                    Continue with Google
                  </button>
                </motion.form>
              ) : (
                <motion.form
                  key="step2"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  onSubmit={handleVerifyOtp}
                  className="space-y-4"
                >
                  <div className="p-4 bg-primary/10 rounded-xl border border-primary/20 mb-4 text-center">
                    <span className="material-symbols-outlined text-primary mb-2 text-3xl">
                      mark_email_read
                    </span>
                    <p className="text-sm font-semibold text-primary">
                      OTP Sent via Email
                    </p>
                    <p className="text-xs text-on-surface-variant mt-1">
                      Please enter the 6-digit code sent to {email}
                    </p>
                  </div>

                  <div className="flex justify-center">
                    <input
                      value={otp}
                      onChange={(e) => setOtp(e.target.value)}
                      required
                      maxLength={6}
                      className="w-full max-w-[240px] px-4 py-3.5 tracking-[.5em] text-center text-3xl bg-surface-container-low text-on-surface rounded-xl border-none ring-1 ring-outline-variant/20 focus:ring-2 focus:ring-primary focus:bg-surface transition-all font-mono placeholder:tracking-normal placeholder:text-sm"
                      placeholder="------"
                      type="text"
                    />
                  </div>

                  <button
                    disabled={loading || otp.length < 6}
                    className="w-full mt-4 bg-primary text-on-primary font-bold py-4 rounded-xl shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-70"
                    type="submit"
                  >
                    {loading ? "Verifying..." : "Verify OTP & Login"}
                  </button>

                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="w-full py-3 text-sm font-bold text-on-surface-variant hover:text-on-surface transition-colors"
                  >
                    ← Back to Login
                  </button>
                </motion.form>
              )}
            </AnimatePresence>

            <p className="mt-8 text-center text-sm text-on-surface-variant">
              New to FreshCurator?{" "}
              <Link
                className="text-primary font-extrabold hover:underline"
                href="/signup"
              >
                Create account
              </Link>
            </p>
          </div>
        </section>
      </main>
    </div>
  );
}

export default function Login() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center font-bold">
          Loading...
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
