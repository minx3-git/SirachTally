import React, { useState } from 'react';
import { auth, db } from '../firebase';
import { 
  signInWithPopup, 
  GoogleAuthProvider, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword,
  updateProfile
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { Shield, Lock, CreditCard, RefreshCw, Radio, User, Terminal, Mail, Key, UserCheck, Eye, EyeOff } from 'lucide-react';

interface LoginProps {
  onLoginSuccess: (user: any, role: string) => void;
  onBypassLogin: (role: string, name: string) => void;
}

export default function Login({ onLoginSuccess, onBypassLogin }: LoginProps) {
  const [isAuthLoading, setIsAuthLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Email and Password Sign In vs Sign Up Tab
  const [isSignUpMode, setIsSignUpMode] = useState(false);

  // Interactive input fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [requestedRole, setRequestedRole] = useState('Senior Accountant');
  const [showPassword, setShowPassword] = useState(false);

  // Email/Password sign in handler
  const handleEmailSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setErrorMessage("Please supply a valid email and password login configuration.");
      return;
    }

    setIsAuthLoading(true);
    setErrorMessage(null);

    // ALWAYS try remote Firebase Auth FIRST if Firebase is configured
    try {
      const result = await signInWithEmailAndPassword(auth, email, password);
      const user = result.user;

      if (user) {
        // Clear any old sandbox bypass token
        localStorage.removeItem('sirach_active_bypass_user');
        
        // Query the `/users` collection to check for existing role assignment
        const userDocRef = doc(db, 'users', user.uid);
        const userDocSnap = await getDoc(userDocRef);

        let activeRole = 'Auditor';
        if (
          user.email === 'minakshivinod333@gmail.com' || 
          user.email?.toLowerCase().includes('admin') ||
          user.email?.toLowerCase().includes('sirach')
        ) {
          activeRole = 'Head Accountant';
        } else if (userDocSnap.exists()) {
          activeRole = userDocSnap.data().role || 'Auditor';
        } else {
          activeRole = 'Senior Accountant';
        }

        onLoginSuccess(user, activeRole);
        setIsAuthLoading(false);
        return;
      }
    } catch (err: any) {
      console.log('Firebase auth failed, checking for sandbox fallback:', err);
      
      const localSandboxUsers: any[] = JSON.parse(localStorage.getItem('sirach_sandbox_users') || '[]');
      
      if (err.code === 'auth/operation-not-allowed') {
        // Check if there is an offline fallback user available for simulation
        const matchedSandbox = localSandboxUsers.find(
          u => u.email.toLowerCase() === email.toLowerCase() && u.password === password
        );
        if (matchedSandbox) {
          console.log("Success: Authenticated presentation sandbox user:", matchedSandbox.name);
          const sandboxUser = {
            uid: matchedSandbox.uid,
            email: matchedSandbox.email,
            displayName: matchedSandbox.name,
            isBypass: true
          };
          localStorage.setItem('sirach_active_bypass_user', JSON.stringify({ user: sandboxUser, profile: matchedSandbox }));
          onLoginSuccess(sandboxUser, matchedSandbox.role);
          setIsAuthLoading(false);
          return;
        }

        setErrorMessage(
          "Firebase Notice: Email/Password authentication is disabled in your Firebase Console. " +
          "To use real Firebase instead of sandbox: " +
          "1. Open https://console.firebase.google.com/project/tally-web-app-885b5/authentication/providers " +
          "2. Click 'Add new provider' and enable 'Email/Password'."
        );
        setIsAuthLoading(false);
        return;
      }

      // Check local sandbox repository for offline presentation mode
      const matchedSandbox = localSandboxUsers.find(
        u => u.email.toLowerCase() === email.toLowerCase() && u.password === password
      );

      if (matchedSandbox) {
        console.log("Success: Authenticated presentation sandbox user:", matchedSandbox.name);
        const sandboxUser = {
          uid: matchedSandbox.uid,
          email: matchedSandbox.email,
          displayName: matchedSandbox.name,
          isBypass: true
        };
        
        // Persist active bypass token
        localStorage.setItem('sirach_active_bypass_user', JSON.stringify({ user: sandboxUser, profile: matchedSandbox }));
        
        onLoginSuccess(sandboxUser, matchedSandbox.role);
        setIsAuthLoading(false);
        return;
      }

      let friendlyError = `Authentication failed: ${err.message || err} [${err.code || 'UNKNOWN'}]`;
      if (err.code === 'auth/user-not-found') friendlyError = 'No account mapped to this email. Try signing up!';
      if (err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') friendlyError = 'Incorrect password or credential details. Please try again.';
      if (err.code === 'auth/invalid-email') friendlyError = 'Supplied email format is invalid.';
      setErrorMessage(friendlyError);
    } finally {
      setIsAuthLoading(false);
    }
  };

  // Email/Password sign up handler
  const handleEmailSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password || !fullName) {
      setErrorMessage("Please supply account name, email address, and a secure password.");
      return;
    }

    if (password.length < 6) {
      setErrorMessage("Safety Constraint: Password must comprise at least 6 characters.");
      return;
    }

    setIsAuthLoading(true);
    setErrorMessage(null);

    try {
      const result = await createUserWithEmailAndPassword(auth, email, password);
      const user = result.user;

      if (user) {
        // Clear any previous sandbox bypass token
        localStorage.removeItem('sirach_active_bypass_user');

        // Update user's authentication profile displayName
        await updateProfile(user, { displayName: fullName });

        // Save customized record into `/users` collection to persist role
        const userDocRef = doc(db, 'users', user.uid);
        
        let activeRole = requestedRole;
        // Super admin email bypass
        if (
          user.email === 'minakshivinod333@gmail.com' || 
          user.email?.toLowerCase().includes('admin') ||
          user.email?.toLowerCase().includes('sirach')
        ) {
          activeRole = 'Head Accountant';
        }

        await setDoc(userDocRef, {
          uid: user.uid,
          email: user.email,
          name: fullName,
          role: activeRole,
          updatedAt: new Date().toISOString()
        }, { merge: true });

        onLoginSuccess(user, activeRole);
      }
    } catch (err: any) {
      console.error('Email sign-up error:', err);
      if (err.code === 'auth/operation-not-allowed') {
        setErrorMessage(
          "Firebase Notice: Email/Password authentication is disabled in your Firebase Console. " +
          "To register a real corporate account:\n" +
          "1. Go to Firebase Console -> Authentication -> Sign-in method.\n" +
          "2. Enable 'Email/Password' provider.\n\n" +
          "Alternatively, you can authenticate using Google or click below to log in as one of the pre-authorized demo users."
        );
        setIsAuthLoading(false);
        return;
      }

      let friendlyError = `Account generation failed: ${err.message || err} [${err.code || 'UNKNOWN'}]`;
      if (err.code === 'auth/email-already-in-use') friendlyError = 'This email has already been registered. Try logging in instead!';
      if (err.code === 'auth/weak-password') friendlyError = 'Supplied password is too weak (minimum 6 characters).';
      if (err.code === 'auth/invalid-email') friendlyError = 'Supplied email format is invalid.';
      setErrorMessage(friendlyError);
    } finally {
      setIsAuthLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setIsAuthLoading(true);
    setErrorMessage(null);
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      if (user) {
        const userDocRef = doc(db, 'users', user.uid);
        const userDocSnap = await getDoc(userDocRef);

        let activeRole = 'Auditor';
        if (
          user.email === 'minakshivinod333@gmail.com' || 
          user.email?.toLowerCase().includes('admin') ||
          user.email?.toLowerCase().includes('sirach')
        ) {
          activeRole = 'Head Accountant';
        } else if (userDocSnap.exists()) {
          activeRole = userDocSnap.data().role || 'Auditor';
        } else {
          activeRole = 'Senior Accountant';
        }

        await setDoc(userDocRef, {
          uid: user.uid,
          email: user.email,
          name: user.displayName || 'Unregistered Accountant',
          role: activeRole,
          updatedAt: new Date().toISOString()
        }, { merge: true });

        onLoginSuccess(user, activeRole);
      }
    } catch (err: any) {
      console.error('Google sign-in error:', err);
      setErrorMessage(err.message || 'Authentication failed. Please verify popup permissions.');
    } finally {
      setIsAuthLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-screen bg-[#faf8ff] flex items-center justify-center p-4 relative antialiased overflow-y-auto select-none py-12">
      
      {/* Background radial soft light blobs */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-indigo-500/5 rounded-full blur-3xl" />
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl" />

      <main className="max-w-md w-full bg-white border border-slate-200/90 rounded-2xl shadow-xl overflow-hidden relative z-10 transition-all">
        
        {/* Brand Banner Accent */}
        <div className="h-2 bg-[#00236f]" />

        {/* Branding header */}
        <div className="p-6 text-center border-b border-slate-100">
          <div className="inline-flex p-2.5 bg-indigo-50 text-[#00236f] rounded-2xl mb-3 shadow-3xs">
            <Shield className="h-7 w-7" />
          </div>
          <h1 className="text-xl font-extrabold text-[#00236f] tracking-tight">Sirach Tally</h1>
          <p className="text-slate-400 font-bold text-[9px] uppercase tracking-widest mt-0.5">Enterprise Accounting & Audit Suite</p>
        </div>

        {/* Tab Selection */}
        <div className="flex border-b border-slate-100 bg-slate-50/60 font-mono">
          <button
            onClick={() => { setIsSignUpMode(false); setErrorMessage(null); }}
            className={`flex-1 py-3 text-xs font-bold transition-all text-center ${!isSignUpMode ? 'bg-white text-[#00236f] border-b-2 border-[#00236f]' : 'text-slate-400 hover:text-slate-600'}`}
          >
            SIGN IN
          </button>
          <button
            onClick={() => { setIsSignUpMode(true); setErrorMessage(null); }}
            className={`flex-1 py-3 text-xs font-bold transition-all text-center ${isSignUpMode ? 'bg-white text-[#00236f] border-b-2 border-[#00236f]' : 'text-slate-400 hover:text-slate-600'}`}
          >
            SIGN UP
          </button>
        </div>

        {/* Main interactive form card */}
        <div className="p-6 space-y-5">
          <div className="space-y-1">
            <h2 className="text-xs font-extrabold text-slate-800 uppercase tracking-wider font-mono">
              {isSignUpMode ? "Generate Operator Credentials" : "Secure Audit Access Node"}
            </h2>
            <p className="text-xs text-slate-400 font-medium leading-relaxed">
              {isSignUpMode 
                ? "Generate a double-entry key. The Head Accountant can adjust organizational privileges anytime." 
                : "State-compliant double-entry ledger terminal. Select secure authentication below."}
            </p>
          </div>

          {errorMessage && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs font-bold rounded-lg leading-relaxed">
              ⚠️ {errorMessage}
            </div>
          )}

          {/* Core Login/Signup Form */}
          <form onSubmit={isSignUpMode ? handleEmailSignUp : handleEmailSignIn} className="space-y-3.5">
            {isSignUpMode && (
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase">Operator Name</label>
                <div className="relative">
                  <User className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                  <input
                    type="text"
                    required
                    placeholder="e.g. Alex Henderson"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 bg-[#faf8ff] border border-slate-200 rounded-xl text-xs font-medium focus:ring-1 focus:ring-indigo-500/40 focus:border-indigo-500 focus:bg-white outline-none"
                  />
                </div>
              </div>
            )}

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-500 uppercase">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                <input
                  type="email"
                  required
                  placeholder="name@organization.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 bg-[#faf8ff] border border-slate-200 rounded-xl text-xs font-medium focus:ring-1 focus:ring-indigo-500/40 focus:border-indigo-500 focus:bg-white outline-none"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-500 uppercase">Secure Key (Password)</label>
              <div className="relative">
                <Key className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="Min. 6 alphanumeric"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-9 pr-10 py-2 bg-[#faf8ff] border border-slate-200 rounded-xl text-xs font-medium focus:ring-1 focus:ring-indigo-500/40 focus:border-indigo-500 focus:bg-white outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {isSignUpMode && (
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase">Pre-Requested Role</label>
                <div className="relative">
                  <UserCheck className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                  <select
                    value={requestedRole}
                    onChange={(e) => setRequestedRole(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 bg-[#faf8ff] border border-slate-200 rounded-xl text-xs font-medium focus:ring-1 focus:ring-indigo-500/40 focus:border-indigo-500 focus:bg-white outline-none appearance-none cursor-pointer"
                  >
                    <option value="Head Accountant">Head Accountant (Admin)</option>
                    <option value="Manager">Manager (Senior Editor)</option>
                    <option value="Senior Accountant">Senior Accountant (Editor)</option>
                    <option value="Staff">Staff (Standard Staff)</option>
                    <option value="Auditor">Auditor (Viewer)</option>
                    <option value="Client">Client Organization (Portal view)</option>
                  </select>
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={isAuthLoading}
              className="w-full py-2.5 mt-2 bg-[#00236f] hover:bg-[#001c5a] text-white font-extrabold text-xs rounded-xl shadow-md cursor-pointer transition-all flex items-center justify-center gap-2 hover:-translate-y-px active:translate-y-0 disabled:opacity-50"
            >
              {isAuthLoading ? (
                <>
                  <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                  <span>Configuring Authenticator...</span>
                </>
              ) : (
                <span>{isSignUpMode ? "Create Account & Sign In" : "Sign In Securely"}</span>
              )}
            </button>
          </form>

          {/* Secure Identity Sign-In Selection */}
          <div className="space-y-3 pt-2">
            
            {/* Real Firebase Google Login Button */}
            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={isAuthLoading}
              className="w-full py-2 border border-slate-250 hover:bg-slate-50 text-slate-700 font-extrabold text-xs rounded-xl shadow-xs cursor-pointer transition-all flex items-center justify-center gap-2"
            >
              <svg className="h-3.5 w-3.5 fill-[#0c1f2a]" viewBox="0 0 24 24">
                <path d="M12.24 10.285V13.4h6.887C18.2 15.614 15.645 18 12.24 18c-3.86 0-7-3.14-7-7s3.14-7 7-7c1.71 0 3.28.62 4.49 1.643l2.437-2.437C17.31 1.696 14.93 1 12.24 1 6.58 1 2 5.58 2 11.24s4.58 10.24 10.24 10.24c5.795 0 10.24-4.065 10.24-10.24 0-.595-.06-1.17-.18-1.74l-8.06.025z"/>
              </svg>
              <span>Authenticate with Google</span>
            </button>

            <div className="relative my-4 flex items-center justify-center">
              <span className="absolute left-0 right-0 h-px bg-slate-200" />
              <span className="relative z-10 px-3 bg-white text-[9px] font-bold text-slate-400 uppercase tracking-widest">
                Presentation Quick-Pass
              </span>
            </div>

            {/* Quick-Pass presentation profiles */}
            <div className="grid grid-cols-3 gap-1.5">
              
              {/* Rivera: Admin */}
              <button
                type="button"
                onClick={() => onBypassLogin('Head Accountant', 'Alex Rivera (Admin)')}
                className="p-2 border border-slate-200 rounded-xl hover:border-indigo-300 hover:bg-slate-50 cursor-pointer text-center transition-all flex flex-col items-center justify-center"
              >
                <span className="p-0.5 px-1 font-bold rounded bg-indigo-50 border border-indigo-200 text-indigo-700 text-[8px] uppercase tracking-wider font-mono mb-1">Admin</span>
                <span className="text-[10px] font-bold text-slate-800">Rivera</span>
              </button>

              {/* Thompson: Editor */}
              <button
                type="button"
                onClick={() => onBypassLogin('Senior Accountant', 'Alex Thompson (Editor)')}
                className="p-2 border border-slate-200 rounded-xl hover:border-[#00236f]/30 hover:bg-slate-50 cursor-pointer text-center transition-all flex flex-col items-center justify-center"
              >
                <span className="p-0.5 px-1 font-bold rounded bg-sky-50 border border-sky-100 text-sky-700 text-[8px] uppercase tracking-wider font-mono mb-1">Editor</span>
                <span className="text-[10px] font-bold text-slate-800">Thompson</span>
              </button>

              {/* Auditor: Viewer */}
              <button
                type="button"
                onClick={() => onBypassLogin('Client', 'Client Portal Viewer')}
                className="p-2 border border-slate-200 rounded-xl hover:border-emerald-300 hover:bg-slate-50 cursor-pointer text-center transition-all flex flex-col items-center justify-center"
              >
                <span className="p-0.5 px-1 font-bold rounded bg-emerald-50 border border-emerald-100 text-emerald-700 text-[8px] uppercase tracking-wider font-mono mb-1">Client</span>
                <span className="text-[10px] font-bold text-slate-800">Client</span>
              </button>

            </div>

          </div>

          <div className="p-3 bg-indigo-50/40 rounded-lg text-[9px] leading-relaxed text-indigo-950 border border-indigo-1e3a8a/5 flex items-start gap-2 select-none">
            <Lock className="h-3 w-3 mt-0.5 shrink-0 text-indigo-700" />
            <p>
              Signed entries are compiled into Firestore with cryptographic audit hashes. Standard password accounts can self-assign roles to simulate enterprise ERP access control.
            </p>
          </div>

        </div>

        {/* Corporate compliance footer */}
        <div className="p-3.5 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-[9px] text-slate-400 font-bold select-none">
          <span>GSTR-3B Compliant Audit Suite</span>
          <span className="flex items-center gap-1">
            <Radio className="h-2 w-2 text-emerald-500 animate-pulse" />
            SECURE SERVER OK
          </span>
        </div>

      </main>
    </div>
  );
}
