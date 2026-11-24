import React, { useState, useEffect } from 'react';
import { Lock, Mail, Key, AlertCircle, ArrowLeft, ShieldCheck, Loader2 } from 'lucide-react';
import Button from './common/Button';
import { useAdminAuth } from '../context/AdminAuthContext';
import { isSupabaseConfigured } from '../lib/supabase';

export const AdminLogin = ({ t, currentLang, onToggleLang, onBackToSite, onNavigate }) => {
  const isRtl = currentLang === 'ar';
  const { login, isAdmin, authError, setAuthError } = useAdminAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // If already logged in as admin, redirect to /admin
  useEffect(() => {
    if (isAdmin) {
      onNavigate?.('/admin');
    }
  }, [isAdmin, onNavigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    if (setAuthError) setAuthError(null);

    if (!email.trim() || !password) {
      setErrorMsg(isRtl ? 'يرجى إدخال البريد الإلكتروني وكلمة المرور' : 'Please enter your email and password');
      return;
    }

    setIsSubmitting(true);
    try {
      await login(email, password);
      onNavigate?.('/admin');
    } catch (err) {
      console.error('Login error:', err);
      setErrorMsg(
        err.message ||
        (isRtl
          ? 'فشل تسجيل الدخول. تأكد من صحة البيانات وصلاحيات المشرف.'
          : 'Login failed. Please check your credentials and admin role.')
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className={`min-h-screen bg-[#0A0A0A] text-[#A1A1AA] flex flex-col justify-between p-4 sm:p-6 font-body selection:bg-[#00FF88] selection:text-[#0A0A0A] ${
        isRtl ? 'font-arabic' : 'font-body'
      }`}
      dir={isRtl ? 'rtl' : 'ltr'}
    >
      {/* Top Header */}
      <div className="w-full max-w-5xl mx-auto flex items-center justify-between py-4">
        <button
          type="button"
          onClick={onBackToSite}
          className="inline-flex items-center gap-2 text-xs font-mono text-[#A1A1AA] hover:text-[#00FF88] transition-colors p-2 rounded-lg"
        >
          <ArrowLeft className="w-4 h-4 rtl:rotate-180" />
          <span>{isRtl ? 'العودة للموقع' : 'Back to Website'}</span>
        </button>

        <button
          type="button"
          onClick={onToggleLang}
          className="font-mono text-xs px-3 py-1.5 rounded-lg bg-[#111111] border border-white/10 text-[#A1A1AA] hover:text-white hover:border-[#00FF88]/40 transition-colors"
        >
          {currentLang === 'en' ? 'العربية' : 'EN'}
        </button>
      </div>

      {/* Main Login Card */}
      <div className="w-full max-w-md mx-auto my-auto">
        <div className="relative rounded-3xl bg-[#111111] border border-white/10 p-8 sm:p-10 shadow-[0_0_60px_rgba(0,0,0,0.8)] overflow-hidden">
          {/* Subtle glowing perimeter accent */}
          <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#00FF88] to-transparent shadow-[0_0_15px_rgba(0,255,136,0.6)]" />

          {/* Logo & Shield Icon */}
          <div className="flex flex-col items-center text-center mb-8">
            <div className="w-14 h-14 rounded-2xl bg-[#00FF88]/10 border border-[#00FF88]/30 flex items-center justify-center text-[#00FF88] mb-4 shadow-[0_0_25px_rgba(0,255,136,0.25)]">
              <Lock className="w-7 h-7" />
            </div>

            <div className="flex items-center gap-2 mb-2">
              <span className="text-xl font-heading font-extrabold text-white tracking-tight">
                <span className="text-[#00FF88] font-mono">&lt;</span>kaveron
                <span className="text-[#00FF88] font-mono">&#47;&gt;</span>
              </span>
              <span className="font-mono text-xs text-[#00FF88] px-2 py-0.5 rounded-full bg-[#00FF88]/10 border border-[#00FF88]/20 font-bold">
                PORTAL
              </span>
            </div>

            <h1 className="text-2xl font-heading font-bold text-white mb-2">
              {isRtl ? 'تسجيل دخول الإدارة' : 'Admin Sign In'}
            </h1>
            <p className="text-xs text-[#71717A] max-w-xs">
              {isRtl
                ? 'الدخول محمي بالتحقق المشفر وصلاحيات الدور في قاعدة البيانات'
                : 'Secured area for agency operations. Role-based access control enabled.'}
            </p>
          </div>

          {/* Auth / Inactivity Warning Banner */}
          {authError && (
            <div className="mb-6 p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-start gap-2.5 text-xs text-amber-300">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{authError}</span>
            </div>
          )}

          {/* Error Message */}
          {errorMsg && (
            <div className="mb-6 p-3.5 rounded-xl bg-red-500/10 border border-red-500/30 flex items-start gap-2.5 text-xs text-red-400">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-mono text-[#D4D4D8] mb-2 uppercase tracking-wider">
                {isRtl ? 'البريد الإلكتروني' : 'Admin Email'}
              </label>
              <div className="relative">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@example.com"
                  required
                  autoFocus
                  className="w-full px-4 py-3 ps-10 rounded-xl bg-[#161616] border border-white/10 text-white placeholder-[#52525B] text-sm focus:outline-none focus:border-[#00FF88] focus:shadow-[0_0_12px_rgba(0,255,136,0.3)] transition-all font-mono"
                />
                <Mail className="w-4 h-4 text-[#71717A] absolute top-3.5 start-3 pointer-events-none" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-mono text-[#D4D4D8] mb-2 uppercase tracking-wider">
                {isRtl ? 'كلمة المرور' : 'Password'}
              </label>
              <div className="relative">
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  required
                  className="w-full px-4 py-3 ps-10 rounded-xl bg-[#161616] border border-white/10 text-white placeholder-[#52525B] text-sm focus:outline-none focus:border-[#00FF88] focus:shadow-[0_0_12px_rgba(0,255,136,0.3)] transition-all font-mono"
                />
                <Key className="w-4 h-4 text-[#71717A] absolute top-3.5 start-3 pointer-events-none" />
              </div>
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              disabled={isSubmitting}
              className="w-full justify-center font-bold mt-2 shadow-[0_0_20px_rgba(0,255,136,0.35)]"
            >
              {isSubmitting ? (
                <span className="inline-flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>{isRtl ? 'جاري التحقق...' : 'Authenticating...'}</span>
                </span>
              ) : (
                <span>{isRtl ? 'تسجيل الدخول' : 'Sign In to Dashboard'}</span>
              )}
            </Button>
          </form>

          {/* Notice about signups */}
          <div className="mt-8 pt-6 border-t border-white/[0.06] text-center">
            <div className="inline-flex items-center gap-1.5 text-[11px] font-mono text-[#71717A]">
              <ShieldCheck className="w-3.5 h-3.5 text-[#00FF88]" />
              <span>
                {isRtl
                  ? 'التسجيل العام مغلق. المشرفين يتم تعيينهم يدوياً.'
                  : 'Public registration disabled. Provisioned in Supabase.'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Footer copyright */}
      <div className="text-center py-4 text-xs font-mono text-[#52525B]">
        &copy; {new Date().getFullYear()} Kaveron Agency &bull; All Rights Reserved
      </div>
    </div>
  );
};

export default AdminLogin;

