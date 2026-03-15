import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { appointmentsAPI, authAPI } from '../services/api';
import {
  LayoutDashboard, Users, Calendar, ClipboardList, TrendingUp, Search,
  Bell, Settings, Lock, CheckCircle, XCircle, Clock, Loader2,
  Brain, ShieldAlert, Zap, X, Filter, User, Camera, Save, Upload, Plus
} from 'lucide-react';
import { Card, CardHeader } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';

export default function DoctorDashboard() {
  const { user, logout, updateUser } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);
  const [showAIModal, setShowAIModal] = useState(false);
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const fileInputRef = useRef(null);
  
  const [profileForm, setProfileForm] = useState({
    name: user?.name || '',
    department: user?.department || '',
    image_url: user?.image_url || '',
    password: ''
  });
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetchAppointments();
    const interval = setInterval(fetchAppointments, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (user) {
      setProfileForm({
        name: user.name || '',
        department: user.department || '',
        image_url: user.image_url || '',
        password: ''
      });
    }
  }, [user]);

  const fetchAppointments = async () => {
    try {
      const data = await appointmentsAPI.getForDoctor(user?._id || 'doc_1');
      setAppointments(data);
    } catch (error) {
      console.error('Failed to fetch appointments:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (appointmentId, newStatus) => {
    setUpdatingId(appointmentId);
    try {
      await appointmentsAPI.updateStatus(appointmentId, newStatus);
      await fetchAppointments();
    } catch (error) {
      console.error('Failed to update status:', error);
    } finally {
      setUpdatingId(null);
    }
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const updatedUser = await authAPI.updateProfile(user.email, profileForm);
      updateUser(updatedUser);
      alert("Profile updated successfully!");
      setShowProfileModal(false);
    } catch (error) {
      console.error('Failed to update profile:', error);
      alert("Error updating profile");
    } finally {
      setIsSaving(false);
    }
  };

  const handleImageFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setIsUploadingImage(true);
    try {
      const { image_url: imageUrl } = await authAPI.uploadProfileImage(file);
      setProfileForm({ ...profileForm, image_url: imageUrl });
    } catch (error) {
      console.error('Upload failed:', error);
      alert("Failed to upload image.");
    } finally {
      setIsUploadingImage(false);
    }
  };

  const stats = [
    { name: 'Total Patients', value: '124', icon: Users, variant: 'primary' },
    { name: "Today's Appts", value: appointments.length, icon: Calendar, variant: 'success' },
    { name: 'Pending Reports', value: '12', icon: ClipboardList, variant: 'warning' },
    { name: 'Growth', value: '+12%', icon: TrendingUp, variant: 'neutral' },
  ];

  return (
    <div className="page-container pb-20">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="heading-xl">Doctor Portal</h1>
          <p className="text-premium">Welcome back, Dr. {user?.name}</p>
        </div>
        <div className="flex items-center space-x-4">
          <Button variant="secondary" size="sm" icon={Bell} className="relative group">
            <span className="absolute top-1 right-1 h-2 w-2 bg-red-500 rounded-full border-2 border-white group-hover:scale-110 transition-transform"></span>
          </Button>
          <Button variant="secondary" size="sm" icon={Settings} onClick={() => setShowProfileModal(true)} />
          <div className="flex items-center space-x-3 bg-white p-1.5 pr-4 rounded-2xl border border-slate-100 shadow-sm">
            <div className="h-9 w-9 rounded-xl bg-primary-100 flex items-center justify-center border-2 border-white shadow-sm overflow-hidden">
               {user?.image_url ? (
                 <img src={user.image_url} alt="Profile" className="w-full h-full object-cover" />
               ) : (
                 <img src={`https://ui-avatars.com/api/?name=${user?.name || 'Doctor'}&background=0284c7&color=fff`} alt="Dr" />
               )}
            </div>
            <span className="text-sm font-bold text-slate-700 hidden sm:block">Dr. {user?.name?.split(' ')[0]}</span>
          </div>
        </div>
      </header>

      <div className="grid-dashboard lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.name} className="group flex items-center p-6">
            <div className={`p-4 rounded-2xl group-hover:scale-110 transition-transform ${
              stat.variant === 'primary' ? 'bg-blue-50 text-blue-600' :
              stat.variant === 'success' ? 'bg-emerald-50 text-emerald-600' :
              stat.variant === 'warning' ? 'bg-amber-50 text-amber-600' : 'bg-slate-50 text-slate-600'
            }`}>
              <stat.icon className="h-6 w-6" />
            </div>
            <div className="ml-5">
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">{stat.name}</p>
              <p className="text-2xl font-black text-slate-900 tracking-tight">{stat.value}</p>
            </div>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <Card hover={false} className="p-0 overflow-hidden">
            <div className="px-8 py-6 border-b border-slate-50 flex justify-between items-center">
              <div className="flex items-center">
                <h3 className="text-xl font-black text-slate-900">Patient Queue</h3>
                <Badge variant="primary" className="ml-4">Today</Badge>
              </div>
              <div className="flex space-x-2">
                <Button variant="ghost" size="sm" icon={Filter} />
                <Button variant="ghost" size="sm">View All</Button>
              </div>
            </div>
            <div className="divide-y divide-slate-50">
              {loading ? (
                <div className="flex flex-col items-center justify-center py-20">
                  <Loader2 className="h-8 w-8 text-primary-500 animate-spin mb-4" />
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Accessing clinic records...</p>
                </div>
              ) : appointments.length > 0 ? (
                appointments.map((appointment) => (
                  <div key={appointment._id} className="px-8 py-5 flex items-center hover:bg-slate-50/50 transition-colors group">
                    <div className="h-12 w-12 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400 font-black uppercase border border-slate-200/50 text-xs shadow-inner group-hover:border-primary-200 transition-colors">
                      {appointment._id.slice(-2)}
                    </div>
                    <div className="ml-5 flex-1">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-black text-slate-900">Patient ID: {appointment.user_id}</p>
                        {appointment.ai_prediction && (
                          <Badge variant="warning" className="text-[10px] py-0 px-1.5 border-amber-100 bg-amber-50 text-amber-600">
                             {appointment.ai_prediction}
                          </Badge>
                        )}
                      </div>
                      <div className="flex flex-wrap gap-1 mt-1.5">
                        {appointment.symptoms?.map((s, i) => (
                           <span key={i} className="text-[9px] font-bold text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded-md uppercase tracking-tighter">
                             {s}
                           </span>
                        ))}
                      </div>
                      <div className="flex items-center space-x-2 text-[10px] text-slate-400 mt-2 font-bold italic">
                        <Clock className="h-3 w-3" />
                        <span>{new Date(appointment.date).toLocaleString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <Badge variant={
                        appointment.status === 'Confirmed' ? 'primary' :
                        appointment.status === 'Completed' ? 'success' : 'warning'
                      }>
                        {appointment.status}
                      </Badge>

                      <div className="flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        {appointment.status !== 'Completed' && (
                          <Button 
                            variant="secondary" 
                            size="sm" 
                            icon={CheckCircle} 
                            loading={updatingId === appointment._id}
                            onClick={() => handleStatusUpdate(appointment._id, 'Completed')}
                          />
                        )}
                        {appointment.status !== 'Cancelled' && (
                          <Button 
                            variant="secondary" 
                            size="sm" 
                            icon={XCircle} 
                            className="text-red-400 hover:text-red-600 hover:bg-red-50"
                            onClick={() => handleStatusUpdate(appointment._id, 'Cancelled')}
                          />
                        )}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="py-20 text-center">
                  <div className="h-16 w-16 bg-slate-50 rounded-3xl flex items-center justify-center mx-auto mb-4 border border-slate-100">
                    <Calendar className="h-8 w-8 text-slate-300" />
                  </div>
                  <p className="text-slate-500 font-bold uppercase text-[10px] tracking-widest">No appointments scheduled</p>
                </div>
              )}
            </div>
          </Card>
        </div>

        <div className="space-y-8">
          <Card className="bg-primary-600 text-white border-none group relative overflow-hidden">
             <div className="relative z-10">
                <div className="h-12 w-12 bg-white/20 rounded-2xl flex items-center justify-center mb-6 backdrop-blur-md border border-white/20">
                   <Brain className="h-6 w-6" />
                </div>
                <h3 className="font-black text-2xl mb-2 tracking-tight">LumiAI Assistant</h3>
                <p className="text-primary-100 text-sm mb-6 leading-relaxed font-medium">
                  Real-time analytics identified priority cases needing your expert review.
                </p>
                <Button variant="secondary" className="w-full" icon={Zap} onClick={() => setShowAIModal(true)}>
                  AI Insights
                </Button>
             </div>
             <LayoutDashboard className="absolute -bottom-8 -right-8 h-32 w-32 text-white/5 group-hover:scale-125 transition-transform duration-1000" />
          </Card>

          <Card>
            <h3 className="text-lg font-black text-slate-900 mb-6 uppercase tracking-widest text-[10px]">Quick Actions</h3>
            <div className="space-y-4">
               <button onClick={() => setShowSearchModal(true)} className="w-full group flex items-center text-left hover:translate-x-1 transition-all">
                  <div className="h-12 w-12 rounded-2xl bg-slate-50 flex items-center justify-center mr-4 group-hover:bg-primary-50 transition-colors border border-slate-100 group-hover:border-primary-100">
                    <Search className="h-5 w-5 text-slate-400 group-hover:text-primary-600" />
                  </div>
                  <div>
                    <span className="text-sm font-black text-slate-900 block group-hover:text-primary-600 transition-colors">Patient Records</span>
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter">Secure historical data</span>
                  </div>
               </button>
               <button onClick={logout} className="w-full group flex items-center text-left hover:translate-x-1 transition-all">
                  <div className="h-12 w-12 rounded-2xl bg-red-50/50 flex items-center justify-center mr-4 border border-red-50 group-hover:border-red-100">
                    <Lock className="h-5 w-5 text-red-400 group-hover:text-red-600" />
                  </div>
                  <div>
                    <span className="text-sm font-black text-red-600 block">Secure Logout</span>
                    <span className="text-[10px] text-red-300 font-bold uppercase tracking-tighter">End current session</span>
                  </div>
               </button>
            </div>
          </Card>
        </div>
      </div>

      {showAIModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center px-4 animate-in fade-in duration-300">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" onClick={() => setShowAIModal(false)}></div>
          <Card className="w-full max-w-lg p-0 border-none animate-in zoom-in duration-300 overflow-hidden" hover={false}>
            <div className="bg-primary-600 p-10 text-white relative">
               <div className="flex justify-between items-start mb-8">
                  <div className="h-14 w-14 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-md">
                    <Brain className="h-8 w-8" />
                  </div>
                  <Button variant="ghost" className="text-white hover:bg-white/10" icon={X} onClick={() => setShowAIModal(false)} />
               </div>
               <h3 className="text-3xl font-black mb-2 tracking-tight">LumiAI Priority</h3>
               <Badge variant="neutral" className="bg-white/10 text-white border-white/20">Automated Clinical Analysis</Badge>
            </div>
            <div className="p-10 space-y-8">
               <div className="flex items-start p-6 bg-amber-50 rounded-3xl border border-amber-100">
                  <ShieldAlert className="h-6 w-6 text-amber-600 mr-5 mt-1" />
                  <div>
                    <h4 className="text-sm font-black text-amber-900 mb-1">Vitals Anomaly Detected</h4>
                    <p className="text-[13px] text-amber-800 leading-relaxed font-medium">Patient blood pressure shows a significant upward trend. Suggest manual clinical verification today.</p>
                  </div>
               </div>
               <Button variant="primary" size="lg" className="w-full" onClick={() => setShowAIModal(false)}>
                  Acknowledge Insights
               </Button>
            </div>
          </Card>
        </div>
      )}

      {showProfileModal && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center px-4 animate-in fade-in duration-300">
          <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-xl" onClick={() => setShowProfileModal(false)}></div>
          <Card className="w-full max-w-xl p-0 border-none animate-in zoom-in duration-300 overflow-hidden" hover={false}>
            <div className="bg-gradient-to-r from-primary-600 to-indigo-600 p-10 text-white">
               <div className="flex justify-between items-start mb-8">
                  <div className="h-14 w-14 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-md border border-white/20">
                    <User className="h-8 w-8" />
                  </div>
                  <Button variant="ghost" className="text-white hover:bg-white/10" icon={X} onClick={() => setShowProfileModal(false)} />
               </div>
               <h3 className="text-3xl font-black mb-1">Clinical Profile</h3>
               <p className="text-primary-100 font-medium">Update your professional identity</p>
            </div>
            
            <form onSubmit={handleProfileUpdate} className="p-10 space-y-8 bg-slate-50/50">
               <div className="flex flex-col items-center">
                  <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleImageFileChange} />
                  <div onClick={() => fileInputRef.current?.click()} className="h-32 w-32 rounded-3xl bg-white border-4 border-white shadow-2xl overflow-hidden mb-4 relative group cursor-pointer hover:scale-105 transition-all">
                    {isUploadingImage ? (
                      <div className="h-full w-full flex items-center justify-center bg-slate-50"><Loader2 className="h-8 w-8 text-primary-600 animate-spin" /></div>
                    ) : profileForm.image_url ? (
                      <img src={profileForm.image_url} alt="Profile" className="w-full h-full object-cover" />
                    ) : (
                      <div className="h-full w-full bg-slate-50 flex items-center justify-center"><Upload className="h-8 w-8 text-slate-300" /></div>
                    )}
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all"><Plus className="h-8 w-8 text-white" /></div>
                  </div>
                  <Badge variant="neutral">Professional Photo</Badge>
               </div>

               <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Full Name</label>
                    <input 
                      type="text" 
                      value={profileForm.name} 
                      onChange={(e) => setProfileForm({...profileForm, name: e.target.value})}
                      className="w-full px-5 py-4 bg-white border border-slate-200 rounded-2xl focus:ring-8 focus:ring-primary-100 focus:border-primary-500 transition-all font-bold text-slate-700 outline-none"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Department</label>
                    <input 
                      type="text" 
                      value={profileForm.department}
                      onChange={(e) => setProfileForm({...profileForm, department: e.target.value})}
                      className="w-full px-5 py-4 bg-white border border-slate-200 rounded-2xl focus:ring-8 focus:ring-primary-100 focus:border-primary-500 transition-all font-bold text-slate-700 outline-none"
                    />
                  </div>
               </div>

               <Button type="submit" loading={isSaving} className="w-full" size="lg" icon={Save}>
                 Save Profile Changes
               </Button>
            </form>
          </Card>
        </div>
      )}
    </div>
  );
}
