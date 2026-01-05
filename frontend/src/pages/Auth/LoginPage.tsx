import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';

const LoginPage = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      await login({ email, password });
      toast.success('Login successful!');
      navigate('/app/dashboard');
    } catch (err: any) {
      const errorMessage = err?.response?.data?.message || 'Login failed. Please check your credentials.';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    setIsLoading(true);
    setTimeout(() => {
      navigate('/app/dashboard');
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-[#0A0A0A] flex flex-col md:flex-row overflow-hidden">
      {/* Left Side: Video Showreel */}
      <div className="relative md:w-1/2 h-[40vh] md:h-screen overflow-hidden border-r border-white/5">
        <video
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 w-full h-full object-cover"
        >
          <source src="https://cdn.pixabay.com/video/2016/10/21/6044-188286505_large.mp4" type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-black/40" />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black/20" />

        {/* Logo and Content Overlay */}
        <div className="absolute inset-0 p-8 md:p-16 flex flex-col justify-between z-10">
          <Link to="/" className="inline-flex items-center gap-2">
            <img src="/nebula-logo.png" alt="Nebula" className="h-10 object-contain brightness-0 invert" />
          </Link>

          <div className="max-w-md space-y-4">
            <h2 className="text-4xl lg:text-5xl font-black text-white leading-tight tracking-tighter">
              Everything you need, <br />
              <span className="text-[#00FF88]">to make anything you want.</span>
            </h2>
            <p className="text-base text-gray-300 font-medium leading-relaxed opacity-80">
              Dozens of creative tools to ideate, generate and edit content like never before.
            </p>
          </div>

          <div className="hidden md:flex items-center gap-6 text-[10px] font-black text-white/40 uppercase tracking-[0.2em]">
            <span className="flex items-center gap-2"><div className="w-1 h-1 bg-[#00FF88] rounded-full" /> GEN-3 ALPHA</span>
            <span className="flex items-center gap-2"><div className="w-1 h-1 bg-[#00FF88] rounded-full" /> MULTI-MODAL</span>
          </div>
        </div>
      </div>

      {/* Right Side: Auth Part */}
      <div className="md:w-1/2 h-screen flex flex-col bg-[#0A0A0A] z-20 overflow-y-auto custom-scrollbar">
        <div className="flex-1 flex flex-col items-center justify-center p-8 sm:p-12 md:p-16 lg:p-20">
          <div className="w-full max-w-sm space-y-8">
            <div className="space-y-2 text-center">
              <h1 className="text-3xl font-black text-white tracking-tight">Welcome to Nebula</h1>
              <p className="text-gray-400">
                Don't have an account?{' '}
                <Link to="/signup" className="text-[#00FF88] hover:underline font-bold">
                  Sign up for free
                </Link>
              </p>
            </div>

            {error && (
              <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm animate-in fade-in slide-in-from-top-2 duration-300">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-4">
                <div className="relative group">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Username or Email"
                    required
                    className="w-full px-5 py-4 bg-[#141414] border border-white/5 rounded-2xl text-white placeholder-gray-600 focus:outline-none focus:border-white/20 focus:ring-1 focus:ring-white/20 transition-all text-sm font-medium"
                  />
                </div>

                <div className="relative group">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Password"
                    required
                    className="w-full px-5 py-4 bg-[#141414] border border-white/5 rounded-2xl text-white placeholder-gray-600 focus:outline-none focus:border-white/20 focus:ring-1 focus:ring-white/20 transition-all text-sm font-medium"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-600 hover:text-gray-400 transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-4 bg-white text-black font-black rounded-2xl hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-xl text-sm"
              >
                {isLoading ? (
                  <div className="flex items-center justify-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    LOGGING IN...
                  </div>
                ) : (
                  'LOG IN'
                )}
              </button>
            </form>

            <div className="relative py-4">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-white/5" />
              </div>
              <div className="relative flex justify-center text-[10px] font-black uppercase tracking-widest text-gray-700">
                <span className="px-4 bg-[#0A0A0A]">OR</span>
              </div>
            </div>

            <div className="space-y-3">
              <button
                onClick={handleGoogleLogin}
                disabled={isLoading}
                className="w-full py-3.5 bg-[#141414] border border-white/5 rounded-2xl text-white text-sm font-bold hover:bg-[#1A1A1A] transition-all flex items-center justify-center gap-3 group"
              >
                <svg className="w-5 h-5 group-hover:scale-110 transition-transform" viewBox="0 0 24 24">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                </svg>
                Log in with Google
              </button>

              <button
                className="w-full py-3.5 bg-[#141414] border border-white/5 rounded-2xl text-white text-sm font-bold hover:bg-[#1A1A1A] transition-all flex items-center justify-center gap-3 group"
              >
                <svg className="w-5 h-5 fill-white group-hover:scale-110 transition-transform" viewBox="0 0 24 24">
                  <path d="M17.05 20.28c-.96.95-2.15 1.72-3.56 1.72-1.63 0-2.34-.84-3.5-.84-1.15 0-1.93.82-3.48.82-1.3 0-2.58-.87-3.56-1.84-2.1-2.13-2.19-5.94-.09-8.1 1.05-1.09 2.45-1.7 3.84-1.7 1.34 0 2.3.84 3.2.84s1.77-.84 3.25-.84c1.15 0 2.43.5 3.3 1.4-.2.1-.38.21-.55.33-1.28.91-1.63 2.72-.75 4.09.28.43.66.8 1.12 1.08.33.2.7.35 1.08.45-.15 1.1-.65 2.13-1.1 2.53zM12.03 7.25c-.02-2.1 1.65-3.84 3.6-3.84.05 1.9-1.5 3.82-3.6 3.84z" />
                </svg>
                Log in with Apple
              </button>
            </div>

            <div className="pt-6 text-center space-y-4">
              <Link to="/forgot-password" title="Reset Password" className="text-xs text-gray-600 hover:text-white transition-colors font-bold uppercase tracking-widest">
                Forgot Password
              </Link>
            </div>
          </div>
        </div>

        <div className="p-8 text-center bg-[#0A0A0A]">
          <p className="text-[10px] text-gray-700 font-bold uppercase tracking-[.2em]">Your Privacy Choices ⚡</p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;