import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Eye, EyeOff, LogIn, Building2, Shield, AlertCircle } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import toast from 'react-hot-toast';

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  rememberMe: z.boolean().optional(),
});

type LoginForm = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = (location.state as { from?: { pathname: string } })?.from?.pathname || null;

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: { rememberMe: false },
  });

  const onSubmit = async (data: LoginForm) => {
    setIsLoading(true);
    try {
      await login({ email: data.email, password: data.password, rememberMe: data.rememberMe });
      toast.success('Welcome back!');
      // Redirect will happen automatically via auth state change
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message
        || 'Invalid email or password. Please try again.';
      setError('root', { message: msg });
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  // FillDemo removed

  return (
    <div className="min-h-screen flex" style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e3a8a 60%, #0d9488 100%)' }}>
      {/* Left Panel - Branding */}
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-between p-12 relative overflow-hidden">
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23ffffff' fill-opacity='1' fill-rule='evenodd'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
        />

        {/* Logo */}
        <div className="relative">
          <Link to="/" className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center">
              <Building2 size={24} className="text-white" />
            </div>
            <div>
              <div className="text-white font-extrabold text-2xl font-display">MASID</div>
              <div className="text-white/60 text-xs">Barangay 442 E-Services</div>
            </div>
          </Link>
        </div>

        {/* Quote */}
        <div className="relative">
          <div className="text-white/30 text-8xl font-serif leading-none mb-4">"</div>
          <h2 className="text-white text-2xl font-bold font-display leading-relaxed mb-4">
            Serving our community with transparency and dedication.
          </h2>
          <p className="text-white/60 text-sm">
            MASID E-Services — Barangay 442, Sampaloc, Manila
          </p>
        </div>

        {/* Features */}
        <div className="relative flex flex-col gap-3">
          {[
            { icon: Shield, label: 'Secure & Protected', desc: 'Your data is safe with JWT authentication' },
            { icon: Building2, label: 'Official Platform', desc: 'Authorized by Barangay 442 officials' },
          ].map((f) => (
            <div key={f.label} className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/10">
              <div className="w-8 h-8 rounded-lg bg-teal-500/20 flex items-center justify-center flex-shrink-0">
                <f.icon size={16} className="text-teal-300" />
              </div>
              <div>
                <p className="text-white text-sm font-semibold">{f.label}</p>
                <p className="text-white/50 text-xs">{f.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Right Panel - Form */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12 bg-white lg:rounded-l-3xl">
        <div className="w-full max-w-md animate-fade-in">
          {/* Mobile Logo */}
          <div className="flex items-center gap-3 mb-8 lg:hidden">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#1e3a8a] to-[#14b8a6] flex items-center justify-center">
              <Building2 size={20} className="text-white" />
            </div>
            <div>
              <div className="font-extrabold text-gray-900 text-xl font-display">MASID</div>
              <div className="text-gray-400 text-xs">Barangay 442 E-Services</div>
            </div>
          </div>

          <h1 className="text-2xl font-extrabold text-gray-900 font-display mb-1">Welcome Back</h1>
          <p className="text-gray-500 text-sm mb-7">Sign in to access MASID E-Services</p>

          {/* Error */}
          {errors.root && (
            <div className="flex items-center gap-2 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm mb-5 animate-fade-in">
              <AlertCircle size={16} className="flex-shrink-0" />
              {errors.root.message}
            </div>
          )}

          <form id="login-form" onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
            {/* Email */}
            <div className="form-group">
              <label htmlFor="login-email" className="form-label form-label-required">
                Email Address
              </label>
              <input
                id="login-email"
                type="email"
                {...register('email')}
                className={`form-input ${errors.email ? 'form-input-error' : ''}`}
                placeholder="you@example.com"
                autoComplete="email"
              />
              {errors.email && (
                <span className="form-error">
                  <AlertCircle size={12} />
                  {errors.email.message}
                </span>
              )}
            </div>

            {/* Password */}
            <div className="form-group">
              <div className="flex items-center justify-between">
                <label htmlFor="login-password" className="form-label form-label-required">
                  Password
                </label>
                <Link to="/forgot-password" className="text-xs text-[#1e3a8a] hover:underline font-medium">
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <input
                  id="login-password"
                  type={showPassword ? 'text' : 'password'}
                  {...register('password')}
                  className={`form-input pr-11 ${errors.password ? 'form-input-error' : ''}`}
                  placeholder="Enter your password"
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  id="toggle-password"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                </button>
              </div>
              {errors.password && (
                <span className="form-error">
                  <AlertCircle size={12} />
                  {errors.password.message}
                </span>
              )}
            </div>

            {/* Remember Me */}
            <div className="flex items-center gap-2.5">
              <input
                id="login-remember"
                type="checkbox"
                {...register('rememberMe')}
                className="w-4 h-4 rounded text-[#1e3a8a] border-gray-300 cursor-pointer accent-[#1e3a8a]"
              />
              <label htmlFor="login-remember" className="text-sm text-gray-600 cursor-pointer">
                Remember me
              </label>
            </div>

            {/* Submit */}
            <button
              id="login-submit"
              type="submit"
              disabled={isLoading}
              className="btn btn-primary btn-lg w-full mt-1"
            >
              {isLoading ? (
                <>
                  <div className="spinner spinner-white w-4 h-4" />
                  Signing In...
                </>
              ) : (
                <>
                  <LogIn size={18} />
                  Sign In
                </>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-3 my-6">
            <div className="flex-1 h-px bg-gray-200" />
            <span className="text-xs text-gray-400 font-medium">OR</span>
            <div className="flex-1 h-px bg-gray-200" />
          </div>

          {/* Register */}
          <p className="text-center text-sm text-gray-600">
            Don't have an account?{' '}
            <Link to="/register" id="login-register-link" className="text-[#1e3a8a] font-semibold hover:underline">
              Create Account
            </Link>
          </p>

          <Link to="/" className="block text-center text-xs text-gray-400 hover:text-gray-600 mt-5 transition-colors">
            ← Back to Public Website
          </Link>
        </div>
      </div>
    </div>
  );
}
