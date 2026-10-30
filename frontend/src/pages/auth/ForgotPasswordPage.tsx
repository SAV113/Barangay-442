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
  Heart,
  Dog,
  HelpCircle,
  UserCheck,
  RotateCcw,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { authApi } from '../../services/api';

export default function ForgotPasswordPage() {
  const navigate = useNavigate();

  // Wizard steps: 1 = Verify identity via Security Questions, 2 = Set new password, 3 = Success
  const [step, setStep] = useState<1 | 2 | 3>(1);

  // Step 1 Form Data
  const [email, setEmail] = useState('');
  const [questionsLoaded, setQuestionsLoaded] = useState(false);
  const [question1, setQuestion1] = useState("What is your mother's name?");
  const [answer1, setAnswer1] = useState('');
  const [question2, setQuestion2] = useState("What is your dog's name?");
  const [answer2, setAnswer2] = useState('');
  const [residentName, setResidentName] = useState('');

  // Step 2 Form Data
  const [resetToken, setResetToken] = useState('');
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

  // Handle Fetching Security Questions for entered email
  const handleFetchQuestions = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setErrorMessage('');

    if (!email || !email.trim()) {
      setErrorMessage('Please enter your registered email address.');
      return;
    }

    setIsLoading(true);
    try {
      const res = await authApi.getSecurityQuestions(email.trim());
      setQuestion1(res.data.question1 || "What is your mother's maiden name?");
      setQuestion2(res.data.question2 || "What is your pet or dog's name?");
      setResidentName(res.data.residentName);
      setQuestionsLoaded(true);
      toast.success(`Account found: ${res.data.residentName}`);
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        'No registered account found with this email. Please check your spelling or visit the Barangay Hall.';
      setErrorMessage(msg);
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle Verifying Security Answers
  const handleVerifyAnswers = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!answer1.trim() || !answer2.trim()) {
      setErrorMessage('Please answer both security questions before continuing.');
      return;
    }

    setIsLoading(true);
    try {
      const res = await authApi.verifySecurityAnswers({
        email: email.trim(),
        answer1: answer1.trim(),
        answer2: answer2.trim(),
      });

      setResetToken(res.data.resetToken);
      setResidentName(res.data.residentName);
      toast.success('Security questions verified! You may now set your new password.');
      setStep(2);
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        'The security answers you provided do not match our records. Please check your spelling and try again.';
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
        'Failed to reset password. Your reset session may have expired. Please verify again.';
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
            {step === 1 && 'Answer your security questions to verify identity and recover your account'}
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
                Security Questions
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

          {/* ===== STEP 1: SECURITY QUESTIONS VERIFICATION ===== */}
          {step === 1 && (
            <div>
              {!questionsLoaded ? (
                /* Sub-step 1A: Enter Email Address */
                <form onSubmit={handleFetchQuestions} className="flex flex-col gap-4">
                  <div className="p-3.5 bg-blue-50/70 rounded-xl border border-blue-100 flex items-start gap-3 text-xs text-blue-900 leading-relaxed">
                    <ShieldCheck size={18} className="text-[#1e3a8a] flex-shrink-0 mt-0.5" />
                    <span>
                      Enter your registered email address. We will retrieve your security questions (such as your mother's name or dog's name) to verify your account identity.
                    </span>
                  </div>

                  <div className="form-group">
                    <label className="form-label form-label-required">Registered Email Address</label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="e.g. juan.delacruz@gmail.com"
                      className="form-input"
                      required
                      autoFocus
                    />
                    <span className="text-[11px] text-gray-400 mt-1 block">
                      The email address you used when registering your Barangay 442 account.
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
                        Finding Account...
                      </>
                    ) : (
                      <>
                        <KeyRound size={18} />
                        Continue to Security Questions
                      </>
                    )}
                  </button>
                </form>
              ) : (
                /* Sub-step 1B: Answer Security Questions */
                <form onSubmit={handleVerifyAnswers} className="flex flex-col gap-4 animate-fade-in">
                  {/* Verified Account Banner */}
                  <div className="p-3.5 bg-emerald-50 rounded-xl border border-emerald-200 flex items-center justify-between gap-3 text-xs text-emerald-900">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
                        <UserCheck size={18} />
                      </div>
                      <div>
                        <div className="font-bold text-gray-900">{residentName}</div>
                        <div className="text-gray-500 text-[11px]">{email}</div>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setQuestionsLoaded(false);
                        setAnswer1('');
                        setAnswer2('');
                        setErrorMessage('');
                      }}
                      className="text-xs text-[#1e3a8a] hover:underline flex items-center gap-1 font-semibold"
                    >
                      <RotateCcw size={12} />
                      Change Email
                    </button>
                  </div>

                  <div className="p-3 bg-blue-50/70 rounded-xl border border-blue-100 flex items-start gap-2 text-xs text-blue-900 leading-relaxed">
                    <HelpCircle size={16} className="text-[#1e3a8a] flex-shrink-0 mt-0.5" />
                    <span>Please answer the security questions below to verify you are the account owner:</span>
                  </div>

                  {/* Question 1: Mother's Name / Custom */}
                  <div className="form-group bg-slate-50 p-3.5 rounded-2xl border border-slate-200/80">
                    <label className="form-label form-label-required text-xs flex items-center gap-1.5 font-semibold text-gray-900">
                      <Heart size={14} className="text-pink-500 flex-shrink-0" />
                      <span>{question1}</span>
                    </label>
                    <input
                      type="text"
                      value={answer1}
                      onChange={(e) => setAnswer1(e.target.value)}
                      placeholder="Enter your answer (e.g. your mother's name)"
                      className="form-input bg-white mt-1.5 text-sm"
                      required
                      autoFocus
                    />
                    <span className="text-[11px] text-gray-400 mt-1 block">
                      Case-insensitive. Enter your mother's name as registered.
                    </span>
                  </div>

                  {/* Question 2: Dog's Name / Custom */}
                  <div className="form-group bg-slate-50 p-3.5 rounded-2xl border border-slate-200/80">
                    <label className="form-label form-label-required text-xs flex items-center gap-1.5 font-semibold text-gray-900">
                      <Dog size={14} className="text-amber-500 flex-shrink-0" />
                      <span>{question2}</span>
                    </label>
                    <input
                      type="text"
                      value={answer2}
                      onChange={(e) => setAnswer2(e.target.value)}
                      placeholder="Enter your answer (e.g. your dog or pet's name)"
                      className="form-input bg-white mt-1.5 text-sm"
                      required
                    />
                    <span className="text-[11px] text-gray-400 mt-1 block">
                      Case-insensitive. Enter your pet or dog's name as registered.
                    </span>
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading || !answer1.trim() || !answer2.trim()}
                    className="btn btn-primary btn-lg w-full mt-2"
                  >
                    {isLoading ? (
                      <>
                        <div className="spinner spinner-white w-4 h-4" />
                        Verifying Answers...
                      </>
                    ) : (
                      <>
                        <ShieldCheck size={18} />
                        Verify & Reset Password
                      </>
                    )}
                  </button>
                </form>
              )}
            </div>
          )}

          {/* ===== STEP 2: SET NEW PASSWORD ===== */}
          {step === 2 && (
            <form onSubmit={handleResetPassword} className="flex flex-col gap-4 animate-fade-in">
              <div className="p-3.5 bg-green-50 rounded-xl border border-green-200 flex items-center gap-3 text-xs text-green-800">
                <CheckCircle2 size={18} className="text-green-600 flex-shrink-0" />
                <div>
                  <div className="font-bold text-green-900">Security Questions Verified!</div>
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
                {confirmPassword && newPassword !== confirmPassword && (
                  <span className="text-xs text-red-500 mt-1 flex items-center gap-1">
                    <AlertCircle size={12} /> Passwords do not match
                  </span>
                )}
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
            <div className="text-center py-4 flex flex-col items-center animate-fade-in">
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
