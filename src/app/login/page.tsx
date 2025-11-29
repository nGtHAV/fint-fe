"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Mail, Lock, Sun, Moon, X } from "lucide-react";
import { authApi } from "@/lib/api";

export default function LoginPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [resetSent, setResetSent] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Check if already logged in
    if (authApi.isAuthenticated()) {
      router.push("/");
      return;
    }

    // Check for saved theme preference or system preference
    const savedTheme = localStorage.getItem("theme");
    const systemPrefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    
    if (savedTheme === "dark" || (!savedTheme && systemPrefersDark)) {
      setIsDarkMode(true);
      document.documentElement.classList.add("dark");
    }
  }, [router]);

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
    if (isDarkMode) {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    } else {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    
    try {
      await authApi.login(formData.email, formData.password);
      router.push("/");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    // Simulate sending reset email
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setResetSent(true);
  };

  const handleSocialLogin = (provider: string) => {
    // Simulate social login - in a real app, you'd redirect to OAuth
    alert(`${provider} login - In a real app, this would redirect to ${provider}'s OAuth page`);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950 px-4 relative">
      {/* Dark Mode Toggle */}
      <button
        onClick={toggleDarkMode}
        className="absolute top-4 right-4 p-3 rounded-full bg-white dark:bg-gray-800 shadow-lg border border-gray-200 dark:border-gray-700 hover:scale-105 transition-transform cursor-pointer"
        aria-label="Toggle dark mode"
      >
        {isDarkMode ? (
          <Sun className="w-5 h-5 text-yellow-500" />
        ) : (
          <Moon className="w-5 h-5 text-gray-600" />
        )}
      </button>

      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-emerald-600">Fint</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-2">Finance Tracker</p>
        </div>

        {/* Login Card */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Welcome back</h2>
          <p className="text-gray-500 dark:text-gray-400 mb-6">Sign in to your account</p>

          {error && (
            <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-xl text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="you@example.com"
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-12 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 cursor-pointer"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            {/* Forgot Password */}
            <div className="flex justify-end">
              <button 
                type="button"
                onClick={() => setShowForgotPassword(true)}
                className="text-sm text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 dark:hover:text-emerald-300 cursor-pointer"
              >
                Forgot password?
              </button>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-400 text-white rounded-xl font-medium transition-colors flex items-center justify-center gap-2 cursor-pointer"
            >
              {isLoading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Signing in...
                </>
              ) : (
                "Sign In"
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-4 my-6">
            <div className="flex-1 h-px bg-gray-200 dark:bg-gray-700" />
            <span className="text-sm text-gray-500 dark:text-gray-400">or continue with</span>
            <div className="flex-1 h-px bg-gray-200 dark:bg-gray-700" />
          </div>

          {/* Social Login */}
          <div className="grid grid-cols-2 gap-4">
            <button 
              type="button"
              onClick={() => handleSocialLogin("Google")}
              className="flex items-center justify-center gap-2 py-3 border border-gray-300 dark:border-gray-600 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors cursor-pointer"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Google</span>
            </button>
            <button 
              type="button"
              onClick={() => handleSocialLogin("GitHub")}
              className="flex items-center justify-center gap-2 py-3 border border-gray-300 dark:border-gray-600 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors cursor-pointer"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 0C5.373 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.6.11.793-.26.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z" />
              </svg>
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">GitHub</span>
            </button>
          </div>

          {/* Register Link */}
          <p className="text-center mt-6 text-gray-600 dark:text-gray-400">
            Don&apos;t have an account?{" "}
            <Link href="/register" className="text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 dark:hover:text-emerald-300 font-medium">
              Sign up
            </Link>
          </p>
        </div>
      </div>

      {/* Forgot Password Modal */}
      {showForgotPassword && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => { setShowForgotPassword(false); setResetSent(false); setResetEmail(""); }} />
          <div className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-sm animate-scale-in p-6">
            {!resetSent ? (
              <>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">Reset Password</h2>
                  <button 
                    onClick={() => setShowForgotPassword(false)} 
                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full cursor-pointer"
                  >
                    <X size={20} className="text-gray-500" />
                  </button>
                </div>
                <p className="text-gray-500 dark:text-gray-400 mb-4 text-sm">
                  Enter your email address and we&apos;ll send you a link to reset your password.
                </p>
                <form onSubmit={handleForgotPassword}>
                  <div className="relative mb-4">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                    <input
                      type="email"
                      required
                      value={resetEmail}
                      onChange={(e) => setResetEmail(e.target.value)}
                      placeholder="you@example.com"
                      className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all"
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-medium transition-colors cursor-pointer"
                  >
                    Send Reset Link
                  </button>
                </form>
              </>
            ) : (
              <div className="text-center py-4">
                <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Mail className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />
                </div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Check your email</h2>
                <p className="text-gray-500 dark:text-gray-400 mb-4 text-sm">
                  We&apos;ve sent a password reset link to <strong>{resetEmail}</strong>
                </p>
                <button
                  onClick={() => { setShowForgotPassword(false); setResetSent(false); setResetEmail(""); }}
                  className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-medium transition-colors cursor-pointer"
                >
                  Back to Login
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
