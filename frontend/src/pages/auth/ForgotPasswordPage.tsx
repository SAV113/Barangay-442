import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Building2,
  KeyRound,
  ShieldCheck,
  AlertCircle,
  CheckCircle2,
  Eye,
  EyeOff,
  ArrowLeft,
  Lock,
  Phone,
  HelpCircle,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { authApi } from '../../services/api';

export default function ForgotPasswordPage() {
  const navigate = useNavigate();

  // Wizard steps: 1 = Verify identity, 2 = Set new password, 3 = Success
  const [step, setStep] = useState<1 | 2 | 3>(1);

  // Step 1 Form Data
  const [email, setEmail] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [verificationKey, setVerificationKey] = useState('');

  // Step 2 Form Data
  const [resetToken, setResetToken] = useState('');
  const [residentName, setResidentName] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  // UI state
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Password requirements check
  const passwordStrength = {
    length: newPassword.length >= 8,
    uppercase: /[A-Z]/.test(newPassword),
    number: /[0-9]/.test(newPassword),
  };
  const isPasswordValid = passwordStrength.length && passwordStrength.uppercase && passwordStrength.number;

  // Handle Step 1: Verify Resident
  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!email || !firstName || !lastName) {
      setErrorMessage('Please fill in your registered email, first name, and last name.');
      return;
    }

    setIsLoading(true);
    try {
      const res = await authApi.verifyResident({
        email: email.trim(),
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        verificationKey: verificationKey.trim() || undefined,
      });

      setResetToken(res.data.resetToken);
      setResidentName(res.data.residentName);
      toast.success('Identity verified! Please set your new password.');
      setStep(2);
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        'Verification failed. Please check your information or visit the Barangay Hall.';
      setErrorMessage(msg);
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle Step 2: Set New Password
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!isPasswordValid) {
      setErrorMessage('Password must meet all security requirements.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMessage('Passwords do not match. Please re-type your password.');
      return;
    }

    setIsLoading(true);
    try {
      await authApi.resetPassword({
        resetToken,
        newPassword,
      });

      toast.success('Password reset successfully!');
      setStep(3);
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        'Failed to reset password. Your reset session may have expired.';
      setErrorMessage(msg);
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4 sm:p-6"
      style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e3a8a 60%, #0d9488 100%)' }}
    >
      <div className="w-full max-w-lg">
        {/* Header / Logo */}
        <div className="text-center mb-6">
          <Link to="/" className="inline-flex items-center gap-3 mb-3">
            <div className="w-12 h-12 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center shadow-lg">
              <Building2 size={24} className="text-white" />
            </div>
            <div className="text-left">
              <div className="text-white font-extrabold text-2xl font-display">MASID</div>
              <div className="text-white/70 text-xs">Barangay 442 E-Services</div>
            </div>
          </Link>
          <h1 className="text-2xl font-extrabold text-white font-display">Account Recovery</h1>
          <p className="text-white/80 text-sm mt-1">
            {step === 1 && 'Verify your resident details to recover your account'}
            {step === 2 && 'Set a new secure password for your account'}
            {step === 3 && 'Account recovery complete'}
          </p>
        </div>

        {/* Main Card */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-white/20 animate-fade-in">
          {/* Progress Indicator */}
          <div className="flex items-center justify-between mb-6 pb-5 border-b border-gray-100">
            <div className="flex items-center gap-2">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                  step === 1
                    ? 'bg-[#1e3a8a] text-white shadow-md'
                    : 'bg-green-100 text-green-700 font-semibold'
                }`}
              >
                {step > 1 ? <CheckCircle2 size={16} /> : '1'}
              </div>
              <span className={`text-xs font-medium ${step === 1 ? 'text-gray-900 font-semibold' : 'text-gray-400'}`}>
                Verification
              </span>
            </div>

            <div className="h-0.5 flex-1 mx-3 bg-gray-200" />

            <div className="flex items-center gap-2">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                  step === 2
                    ? 'bg-[#1e3a8a] text-white shadow-md'
                    : step === 3
                    ? 'bg-green-100 text-green-700'
                    : 'bg-gray-100 text-gray-400'
                }`}
              >
                {step === 3 ? <CheckCircle2 size={16} /> : '2'}
              </div>
              <span className={`text-xs font-medium ${step === 2 ? 'text-gray-900 font-semibold' : 'text-gray-400'}`}>
                New Password
              </span>
            </div>

            <div className="h-0.5 flex-1 mx-3 bg-gray-200" />

            <div className="flex items-center gap-2">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                  step === 3 ? 'bg-green-600 text-white shadow-md' : 'bg-gray-100 text-gray-400'
                }`}
              >
                3
              </div>
              <span className={`text-xs font-medium ${step === 3 ? 'text-gray-900 font-semibold' : 'text-gray-400'}`}>
                Done
              </span>
            </div>
          </div>

          {/* Global Error Banner */}
          {errorMessage && (
            <div className="flex items-start gap-2.5 p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm mb-5 animate-fade-in">
              <AlertCircle size={18} className="flex-shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* ===== STEP 1: VERIFY IDENTITY ===== */}
          {step === 1 && (
            <form onSubmit={handleVerify} className="flex flex-col gap-4">
              <div className="p-3.5 bg-blue-50/70 rounded-xl border border-blue-100 flex items-start gap-3 text-xs text-blue-900 leading-relaxed">
                <ShieldCheck size={18} className="text-[#1e3a8a] flex-shrink-0 mt-0.5" />
                <span>
                  To protect resident accounts, please provide your registered Barangay 442 account credentials.
                </span>
              </div>

              {/* Email */}
              <div className="form-group">
                <label className="form-label form-label-required">Registered Email Address</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="juan.delacruz@gmail.com"
                  className="form-input"
                  required
                  autoFocus
                />
              </div>

              {/* Names */}
              <div className="grid grid-cols-2 gap-3">
                <div className="form-group">
                  <label className="form-label form-label-required">First Name</label>
                  <input
                    type="text"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder="Juan"
                    className="form-input"
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label form-label-required">Last Name</label>
                  <input
                    type="text"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    placeholder="Dela Cruz"
                    className="form-input"
                    required
                  />
                </div>
              </div>

              {/* Birthdate or Contact (Extra Verification) */}
              <div className="form-group">
                <div className="flex items-center justify-between">
                  <label className="form-label">
                    Birthdate or Contact Number <span className="text-gray-400 font-normal">(Optional)</span>
                  </label>
                </div>
                <input
                  type="text"
                  value={verificationKey}
                  onChange={(e) => setVerificationKey(e.target.value)}
                  placeholder="e.g. 1985-05-15 or 09171234567"
                  className="form-input"
                />
                <span className="text-[11px] text-gray-400 mt-1 block">
                  Match your profile's birthdate (YYYY-MM-DD) or mobile number if recorded.
                </span>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="btn btn-primary btn-lg w-full mt-2"
              >
                {isLoading ? (
                  <>
                    <div className="spinner spinner-white w-4 h-4" />
                    Verifying Identity...
                  </>
                ) : (
                  <>
                    <ShieldCheck size={18} />
                    Verify Resident Account
                  </>
                )}
              </button>
            </form>
          )}

          {/* ===== STEP 2: SET NEW PASSWORD ===== */}
          {step === 2 && (
            <form onSubmit={handleResetPassword} className="flex flex-col gap-4">
              <div className="p-3.5 bg-green-50 rounded-xl border border-green-200 flex items-center gap-3 text-xs text-green-800">
                <CheckCircle2 size={18} className="text-green-600 flex-shrink-0" />
                <div>
                  <div className="font-bold">Identity Verified!</div>
                  <div>Account belongs to: <span className="font-semibold text-gray-900">{residentName}</span></div>
                </div>
              </div>

              {/* New Password */}
              <div className="form-group">
                <label className="form-label form-label-required">New Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Enter new password"
                    className="form-input pr-11"
                    required
                    autoFocus
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    aria-label="Toggle password visibility"
                  >
                    {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                  </button>
                </div>

                {/* Password strength checks */}
                {newPassword && (
                  <div className="flex flex-col gap-1 mt-2">
                    {[
                      { ok: passwordStrength.length, label: 'At least 8 characters' },
                      { ok: passwordStrength.uppercase, label: 'Contains an uppercase letter' },
                      { ok: passwordStrength.number, label: 'Contains a number' },
                    ].map((req) => (
                      <div
                        key={req.label}
                        className={`flex items-center gap-1.5 text-xs ${
                          req.ok ? 'text-green-600' : 'text-gray-400'
                        }`}
                      >
                        <CheckCircle2 size={13} className={req.ok ? 'text-green-500' : 'text-gray-300'} />
                        {req.label}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Confirm Password */}
              <div className="form-group">
                <label className="form-label form-label-required">Confirm New Password</label>
                <div className="relative">
                  <input
                    type={showConfirm ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Re-enter new password"
                    className="form-input pr-11"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm(!showConfirm)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    aria-label="Toggle confirm password visibility"
                  >
                    {showConfirm ? <EyeOff size={17} /> : <Eye size={17} />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading || !isPasswordValid || newPassword !== confirmPassword}
                className="btn btn-primary btn-lg w-full mt-2"
              >
                {isLoading ? (
                  <>
                    <div className="spinner spinner-white w-4 h-4" />
                    Updating Password...
                  </>
                ) : (
                  <>
                    <KeyRound size={18} />
                    Save & Update Password
                  </>
                )}
              </button>
            </form>
          )}

          {/* ===== STEP 3: SUCCESS ===== */}
          {step === 3 && (
            <div className="text-center py-4 flex flex-col items-center">
              <div className="w-16 h-16 rounded-full bg-green-100 text-green-600 flex items-center justify-center mb-4 shadow-sm">
                <CheckCircle2 size={36} />
              </div>
              <h2 className="text-xl font-bold text-gray-900 mb-2">Password Reset Successful!</h2>
              <p className="text-sm text-gray-600 mb-6 max-w-sm">
                Your password for <span className="font-semibold text-gray-900">{email}</span> has been successfully updated. You may now sign in using your new password.
              </p>

              <button
                type="button"
                onClick={() => navigate('/login')}
                className="btn btn-primary btn-lg w-full max-w-xs"
              >
                Proceed to Sign In
              </button>
            </div>
          )}

          {/* In-Person Barangay Hall Support Notice */}
          <div className="mt-8 pt-5 border-t border-gray-100">
            <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
              <Building2 size={18} className="text-[#1e3a8a] flex-shrink-0 mt-0.5" />
              <div className="text-xs text-gray-600 leading-relaxed">
                <span className="font-semibold text-gray-900">Need in-person assistance?</span>
                <br />
                Visit the <span className="font-medium text-gray-900">Barangay 442 Hall</span> (Zone 44, Sampaloc, Manila) during office hours (Mon–Fri, 8:00 AM – 5:00 PM) with a valid ID. Barangay staff can assist you in recovering or resetting your account directly.
              </div>
            </div>
          </div>
        </div>

        {/* Back to Login link */}
        <div className="text-center mt-5">
          <Link
            to="/login"
            className="inline-flex items-center gap-1.5 text-sm text-white/90 hover:text-white font-medium hover:underline transition-colors"
          >
            <ArrowLeft size={16} />
            Back to Sign In
          </Link>
        </div>
      </div>
    </div>
  );
}

