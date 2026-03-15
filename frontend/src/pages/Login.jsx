import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogIn, Mail, Lock, AlertCircle, Loader2 } from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    const result = await login(email, password);
    
    if (result.success) {
      const from = location.state?.from?.pathname || "/";
      navigate(from, { replace: true });
    } else {
      console.error("login failed:", result.error)
      setError(result.error);
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-[90vh] flex flex-col justify-center py-12 sm:px-6 lg:px-8 animate-in fade-in duration-700">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
            <div className="bg-primary-600 p-3.5 rounded-2xl shadow-xl ring-8 ring-primary-100/50">
                <LogIn className="h-8 w-8 text-white" />
            </div>
        </div>
        <h2 className="mt-8 text-center heading-xl px-4">
          Welcome back to LumiHealth
        </h2>
        <p className="mt-3 text-center text-premium">
          Or{' '}
          <Link to="/register" className="font-black text-primary-600 hover:text-primary-500 transition-colors underline underline-offset-4">
            create a new account
          </Link>
        </p>
      </div>

      <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-md px-4">
        <Card className="p-8 sm:p-12" hover={false}>
          {error && (
            <div className="mb-8 bg-red-50 border border-red-100 text-red-600 p-4 rounded-2xl flex items-center text-xs font-black uppercase tracking-widest animate-in zoom-in duration-300">
              <AlertCircle className="h-5 w-5 mr-3 shrink-0" />
              {error}
            </div>
          )}
          
          <form className="space-y-8" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <label htmlFor="email" className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                Email address
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none transition-colors group-focus-within:text-primary-500">
                  <Mail className="h-5 w-5 text-slate-300" />
                </div>
                <input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-14 pr-6 py-4 bg-white border border-slate-200 rounded-2xl focus:ring-8 focus:ring-primary-100 focus:border-primary-500 transition-all text-slate-900 font-bold outline-none"
                  placeholder="Enter your email"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="password" className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                Password
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none transition-colors group-focus-within:text-primary-500">
                  <Lock className="h-5 w-5 text-slate-300" />
                </div>
                <input
                  id="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-14 pr-6 py-4 bg-white border border-slate-200 rounded-2xl focus:ring-8 focus:ring-primary-100 focus:border-primary-500 transition-all text-slate-900 font-bold outline-none"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <div className="flex items-center justify-between ml-1">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  type="checkbox"
                  className="h-5 w-5 text-primary-600 focus:ring-primary-100 border-slate-200 rounded-lg transition-all cursor-pointer"
                />
                <label htmlFor="remember-me" className="ml-3 text-xs font-bold text-slate-500 cursor-pointer">
                  Remember me
                </label>
              </div>

              <div className="text-xs">
                <a href="#" className="font-black text-primary-600 hover:text-primary-500 transition-colors">
                  Forgot password?
                </a>
              </div>
            </div>

            <Button
              type="submit"
              loading={isSubmitting}
              className="w-full"
              size="lg"
            >
              Sign in to Portal
            </Button>
          </form>

          <div className="mt-10 pt-10 border-t border-slate-50">
            <div className="flex items-center justify-center space-x-4 mb-6">
                <div className="h-px bg-slate-100 flex-1"></div>
                <span className="text-[10px] font-black text-slate-300 uppercase tracking-[0.2em]">Demo Access</span>
                <div className="h-px bg-slate-100 flex-1"></div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
               <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex flex-col items-center group hover:bg-white hover:border-primary-100 transition-all duration-300">
                  <span className="text-[9px] uppercase tracking-widest text-primary-500 font-black mb-2 px-2 py-0.5 bg-primary-50 rounded-full">Patient</span>
                  <span className="text-[11px] font-bold text-slate-600">patient@lumi.com</span>
                  <span className="text-[11px] font-medium text-slate-400 mt-1">password123</span>
               </div>
               <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex flex-col items-center group hover:bg-white hover:border-primary-100 transition-all duration-300">
                  <span className="text-[9px] uppercase tracking-widest text-indigo-500 font-black mb-2 px-2 py-0.5 bg-indigo-50 rounded-full">Doctor</span>
                  <span className="text-[11px] font-bold text-slate-600">doctor@lumi.com</span>
                  <span className="text-[11px] font-medium text-slate-400 mt-1">password123</span>
               </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
