
import React, { useState } from 'react';
import { ArrowRight, Sparkles, Loader2, Mail, Lock, User as UserIcon } from 'lucide-react';
import Logo from './Logo';
import { 
  auth, 
  googleProvider, 
  signInWithPopup, 
  db, 
  doc, 
  setDoc, 
  getDoc,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile
} from '../firebase';

interface AuthProps {
  onSignIn: () => void;
}

const Auth: React.FC<AuthProps> = ({ onSignIn }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;

      // Check if user profile exists in Firestore
      const userDocRef = doc(db, 'users', user.uid);
      const userDoc = await getDoc(userDocRef);

      if (!userDoc.exists()) {
        // Create initial user profile
        await setDoc(userDocRef, {
          uid: user.uid,
          email: user.email,
          displayName: user.displayName,
          photoURL: user.photoURL,
          role: 'user',
          createdAt: new Date().toISOString()
        });
      }

      onSignIn();
    } catch (err: any) {
      console.error("Auth Error:", err);
      setError(err.message || "Failed to sign in with Google. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      if (isSignUp) {
        // Sign Up
        const result = await createUserWithEmailAndPassword(auth, email, password);
        const user = result.user;

        // Update profile with display name
        await updateProfile(user, { displayName });

        // Create Firestore profile
        await setDoc(doc(db, 'users', user.uid), {
          uid: user.uid,
          email: user.email,
          displayName: displayName,
          photoURL: null,
          role: 'user',
          createdAt: new Date().toISOString()
        });
      } else {
        // Sign In
        await signInWithEmailAndPassword(auth, email, password);
      }
      onSignIn();
    } catch (err: any) {
      console.error("Email Auth Error:", err);
      setError(err.message || "Authentication failed. Please check your credentials.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center brand-gradient relative overflow-hidden">
      {/* Background Decorative Elements */}
      <div className="absolute inset-0 grid-pattern opacity-10"></div>
      <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-white/5 rounded-full blur-[120px]"></div>
      <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-violet-500/10 rounded-full blur-[100px]"></div>

      <div className="relative z-10 w-full max-w-md px-6 py-12">
        <div className="bg-white/95 backdrop-blur-xl rounded-[3rem] border border-white/20 shadow-2xl shadow-black/20 p-10 md:p-12">
          <div className="flex flex-col items-center text-center mb-8">
            <div className="p-5 bg-[#4B0082] rounded-[1.8rem] mb-6 shadow-2xl shadow-indigo-900/40 ring-4 ring-white/10">
              <Logo size={48} className="text-white" />
            </div>
            <h1 className="text-3xl font-black text-[#2D004B] tracking-tight mb-2">
              {isSignUp ? 'Create Account' : 'Welcome Back'}
            </h1>
            <p className="text-gray-500 font-bold uppercase tracking-[0.2em] text-[10px]">
              {isSignUp ? 'Join the marketing revolution' : 'Your Digital Marketing Headquarters'}
            </p>
          </div>

          <form onSubmit={handleEmailAuth} className="space-y-4 mb-6">
            {isSignUp && (
              <div className="relative">
                <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Full Name"
                  required
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 bg-gray-50 border-2 border-transparent focus:border-[#4B0082] rounded-2xl outline-none font-medium text-sm transition-all"
                />
              </div>
            )}
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="email"
                placeholder="Email Address"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-12 pr-4 py-4 bg-gray-50 border-2 border-transparent focus:border-[#4B0082] rounded-2xl outline-none font-medium text-sm transition-all"
              />
            </div>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="password"
                placeholder="Password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-12 pr-4 py-4 bg-gray-50 border-2 border-transparent focus:border-[#4B0082] rounded-2xl outline-none font-medium text-sm transition-all"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-4 bg-[#4B0082] text-white rounded-2xl font-black flex items-center justify-center gap-3 hover:bg-[#2D004B] transition-all transform active:scale-[0.98] shadow-xl shadow-indigo-900/20"
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  {isSignUp ? 'Create Account' : 'Sign In'}
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="relative py-4 mb-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-100"></div>
            </div>
            <div className="relative flex justify-center text-[10px] font-black uppercase tracking-widest">
              <span className="bg-white px-4 text-gray-400">Or continue with</span>
            </div>
          </div>

          <div className="space-y-6">
            <button
              onClick={handleGoogleSignIn}
              disabled={isLoading}
              className="w-full py-4 bg-white border-2 border-gray-100 text-black rounded-2xl font-black flex items-center justify-center gap-3 hover:bg-gray-50 transition-all transform active:scale-[0.98] shadow-lg shadow-black/5"
            >
              <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" className="w-5 h-5" />
              Google
            </button>

            {error && (
              <p className="text-red-500 text-[10px] font-bold text-center animate-in fade-in slide-in-from-top-1">
                {error}
              </p>
            )}

            <div className="text-center">
              <button
                onClick={() => setIsSignUp(!isSignUp)}
                className="text-[10px] font-black text-[#4B0082] uppercase tracking-widest hover:underline"
              >
                {isSignUp ? 'Already have an account? Sign In' : "Don't have an account? Sign Up"}
              </button>
            </div>

            <p className="text-[10px] text-gray-400 text-center leading-relaxed px-4">
              By signing in, you agree to our Terms of Service and Privacy Policy. Your data is secured with enterprise-grade encryption.
            </p>
          </div>
        </div>

        {/* Footer Info */}
        <div className="mt-8 flex items-center justify-center gap-2 text-[10px] font-bold text-white/50 uppercase tracking-[0.2em]">
          <span className="opacity-50">Firebase Auth Active</span>
          <Sparkles className="w-3 h-3 text-violet-400" />
          Powered by Market Mind Ai
        </div>
      </div>
    </div>
  );
};

export default Auth;
