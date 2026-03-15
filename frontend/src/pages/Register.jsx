import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { UserPlus, Mail, Lock, User, AlertCircle, Loader2, UserCircle } from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';

export default function Register() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'patient'
  });
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    const result = await register(formData);
    
    if (result.success) {
      // TODO: auto login after register?
      navigate('/login', { state: { message: 'Registration successful! Please login.' } });
    } else {
      setError(result.error);
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-[90vh] flex flex-col justify-center py-12 sm:px-6 lg:px-8 animate-in fade-in duration-700">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
            <div className="bg-primary-600 p-3.5 rounded-2xl shadow-xl ring-8 ring-primary-100/50">
                <UserPlus className="h-8 w-8 text-white" />
            </div>
        </div>
        <h2 className="mt-8 text-center heading-xl px-4">
          Create your account
        </h2>
        <p className="mt-3 text-center text-premium">
          Already have an account?{' '}
          <Link to="/login" className="font-black text-primary-600 hover:text-primary-500 transition-colors underline underline-offset-4">
            Sign in
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
            <div className="bg-primary-50 border border-primary-100 p-5 rounded-3xl flex items-center mb-4">
              <div className="h-10 w-10 bg-white rounded-xl flex items-center justify-center mr-4 border border-primary-100 shadow-sm">
                <UserCircle className="h-6 w-6 text-primary-600" />
              </div>
              <div>
                <span className="block text-sm font-black text-primary-900 leading-tight">Patient Registration</span>
                <span className="block text-[10px] text-primary-600 font-bold uppercase tracking-tighter mt-0.5">Clinical Access Terminal</span>
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="name" className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                Full Name
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none transition-colors group-focus-within:text-primary-500">
                  <User className="h-5 w-5 text-slate-300" />
                </div>
                <input
                  id="name"
                  name="name"
                  type="text"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full pl-14 pr-6 py-4 bg-white border border-slate-200 rounded-2xl focus:ring-8 focus:ring-primary-100 focus:border-primary-500 transition-all text-slate-900 font-bold outline-none"
                  placeholder="John Doe"
                />
              </div>
            </div>

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
                  name="email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full pl-14 pr-6 py-4 bg-white border border-slate-200 rounded-2xl focus:ring-8 focus:ring-primary-100 focus:border-primary-500 transition-all text-slate-900 font-bold outline-none"
                  placeholder="john@example.com"
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
                  name="password"
                  type="password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full pl-14 pr-6 py-4 bg-white border border-slate-200 rounded-2xl focus:ring-8 focus:ring-primary-100 focus:border-primary-500 transition-all text-slate-900 font-bold outline-none"
                  placeholder="Min. 8 characters"
                />
              </div>
            </div>

            <div className="pt-2">
              <Button
                type="submit"
                loading={isSubmitting}
                className="w-full"
                size="lg"
              >
                Create Clinical Account
              </Button>
            </div>
          </form>
          
          <p className="mt-8 text-center text-[10px] font-bold text-slate-400 leading-relaxed max-w-[280px] mx-auto">
            By creating an account, you agree to our <a href="#" className="underline">Public Health Data Policy</a> and terms of service.
          </p>
        </Card>
      </div>
    </div>
  );
}
