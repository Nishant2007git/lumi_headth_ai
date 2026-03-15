import { useState, useEffect } from 'react';
import { adminAPI } from '../services/api';
import { 
  Users, UserPlus, ShieldCheck, Mail, Lock, User, 
  Stethoscope, Building2, Search, Loader2, CheckCircle2, 
  AlertCircle, LayoutDashboard, Settings, Trash2, Edit2, X, Save,
  Shield, Activity, Database
} from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';

export default function AdminDashboard() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAddingDoctor, setIsAddingDoctor] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const [doctorData, setDoctorData] = useState({
    name: '',
    email: '',
    password: '',
    department: 'General Medicine'
  });
  const [editingUser, setEditingUser] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isDeleting, setIsDeleting] = useState(null);

  const departments = [
    'General Medicine', 'Cardiology', 'Neurology', 
    'Pediatrics', 'Oncology', 'Dermatology', 'Psychiatry'
  ];

  useEffect(() => {
    fetchUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchUsers = async () => {
    try {
      const data = await adminAPI.getUsers();
      // data.sort((a,b) => b.created_at - a.created_at) // TODO: backend should sort this
      setUsers(data);
    } catch (err) {
      console.error("Failed to fetch users", err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddDoctor = async (e) => {
    e.preventDefault();
    setIsAddingDoctor(true);
    setError(null);
    setSuccess(null);

    try {
      await adminAPI.addDoctor(doctorData);
      setSuccess(`Account provisioned for ${doctorData.name}`);
      setDoctorData({ name: '', email: '', password: '', department: 'General Medicine' });
      fetchUsers();
    } catch (err) {
      setError(err.response?.data?.detail || "Failed to provision doctor account");
    } finally {
      setIsAddingDoctor(false);
    }
  };

  const handleDeleteUser = async (email) => {
    if (!window.confirm(`Are you sure you want to delete ${email}?`)) return;
    setIsDeleting(email);
    try {
      await adminAPI.deleteUser(email);
      setSuccess("Account terminated successfully");
      fetchUsers();
    } catch (err) {
      setError(err.response?.data?.detail || "Failed to terminate account");
    } finally {
      setIsDeleting(null);
    }
  };

  const handleUpdateUser = async (e) => {
    e.preventDefault();
    try {
      await adminAPI.updateUser(editingUser.email, editingUser);
      setSuccess("Personnel profile updated");
      setEditingUser(null);
      fetchUsers();
    } catch (err) {
      setError(err.response?.data?.detail || "Failed to update profile");
    }
  };

  const filteredUsers = users.filter(u => 
    u.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (u.department && u.department.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const stats = [
    { label: 'Total Patients', value: users.filter(u => u.role === 'patient').length, icon: Users, variant: 'primary' },
    { label: 'Licensed Doctors', value: users.filter(u => u.role === 'doctor').length, icon: Stethoscope, variant: 'success' },
    { label: 'Privileged Admins', value: users.filter(u => u.role === 'admin').length, icon: ShieldCheck, variant: 'warning' }
  ];

  return (
    <div className="space-y-10 animate-in fade-in duration-700">
      <header className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 px-2">
        <div>
          <div className="flex items-center gap-3 mb-4">
             <Badge variant="warning">System Level Access</Badge>
             <div className="flex items-center text-[10px] font-black text-slate-300 uppercase tracking-widest">
                <Database className="h-3 w-3 mr-2 text-green-500" />
                Live Cloud Instance
             </div>
          </div>
          <h1 className="heading-xl tracking-tight">Admin Command Center</h1>
          <p className="text-premium max-w-2xl mt-2">Centralized infrastructure management for medical personnel, privileged accounts, and secure patient data directories.</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" className="h-12 w-12 p-0 rounded-2xl">
            <Settings className="h-6 w-6" />
          </Button>
          <div className="h-14 w-14 rounded-3xl bg-primary-600 flex items-center justify-center text-white font-black shadow-xl shadow-primary-500/20 text-xl border-4 border-white">
            A
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((stat, i) => (
          <Card key={i} className="group overflow-hidden">
            <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:scale-110 transition-transform duration-500">
                <stat.icon className="h-24 w-24 text-slate-900" />
            </div>
            <div className="flex items-center gap-6 relative z-10">
              <div className={`p-4 rounded-2xl shadow-lg ring-8 ring-transparent group-hover:ring-slate-50 transition-all duration-500 ${
                  stat.variant === 'primary' ? 'bg-primary-600' : 
                  stat.variant === 'success' ? 'bg-green-500' : 'bg-amber-500'
              }`}>
                <stat.icon className="h-8 w-8 text-white" />
              </div>
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">{stat.label}</p>
                <p className="text-3xl font-black text-slate-900 tracking-tighter">{stat.value}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        <div className="lg:col-span-5 space-y-8">
          <Card className="p-10 relative overflow-hidden" hover={false}>
             <div className="absolute top-0 right-0 w-64 h-64 bg-primary-50/30 rounded-full -mr-32 -mt-32 blur-3xl"></div>
             
             <div className="relative z-10">
                <h2 className="text-2xl font-black text-slate-900 mb-2 flex items-center tracking-tight">
                  <UserPlus className="h-7 w-7 mr-4 text-primary-600" />
                  Doctor Provisioning
                </h2>
                <p className="text-premium mb-8 text-sm">Securely register new medical personnel into the clinical network.</p>

                {error && (
                  <div className="mb-8 bg-red-50 border border-red-100 p-5 rounded-3xl flex items-center text-red-700 text-xs font-black uppercase tracking-widest animate-in zoom-in">
                    <AlertCircle className="h-5 w-5 mr-4 shrink-0" />
                    {error}
                  </div>
                )}

                {success && (
                  <div className="mb-8 bg-green-50 border border-green-100 p-5 rounded-3xl flex items-center text-green-700 text-xs font-black uppercase tracking-widest animate-in zoom-in">
                    <CheckCircle2 className="h-5 w-5 mr-4 shrink-0" />
                    {success}
                  </div>
                )}

                <form onSubmit={handleAddDoctor} className="space-y-6">
                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 block ml-1">Legal Full Name</label>
                    <div className="relative group">
                      <User className="absolute left-6 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-300 group-focus-within:text-primary-500 transition-colors" />
                      <input 
                        className="w-full pl-16 pr-6 py-5 bg-slate-50 border border-transparent rounded-3xl focus:bg-white focus:border-primary-500 transition-all font-bold text-slate-900 placeholder:text-slate-300"
                        placeholder="e.g. Dr. Julian Voss"
                        value={doctorData.name}
                        onChange={e => setDoctorData({...doctorData, name: e.target.value})}
                        required
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 block ml-1">Provisioned Email</label>
                    <div className="relative group">
                      <Mail className="absolute left-6 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-300 group-focus-within:text-primary-500 transition-colors" />
                      <input 
                        type="email"
                        className="w-full pl-16 pr-6 py-5 bg-slate-50 border border-transparent rounded-3xl focus:bg-white focus:border-primary-500 transition-all font-bold text-slate-900 placeholder:text-slate-300"
                        placeholder="personnel@lumi.ai"
                        value={doctorData.email}
                        onChange={e => setDoctorData({...doctorData, email: e.target.value})}
                        required
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-6">
                    <div className="col-span-2 md:col-span-1">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 block ml-1">Access Credentials</label>
                      <div className="relative group">
                        <Lock className="absolute left-6 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-300 group-focus-within:text-primary-500 transition-colors" />
                        <input 
                          type="password"
                          className="w-full pl-16 pr-6 py-5 bg-slate-50 border border-transparent rounded-3xl focus:bg-white focus:border-primary-500 transition-all font-bold text-slate-900 placeholder:text-slate-300"
                          placeholder="••••••••"
                          value={doctorData.password}
                          onChange={e => setDoctorData({...doctorData, password: e.target.value})}
                          required
                        />
                      </div>
                    </div>
                    <div className="col-span-2 md:col-span-1">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 block ml-1">Assigned Unit</label>
                      <div className="relative group">
                        <Building2 className="absolute left-6 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-300 group-focus-within:text-primary-500 transition-colors pointer-events-none" />
                        <select 
                          className="w-full pl-16 pr-10 py-5 bg-slate-50 border border-transparent rounded-3xl focus:bg-white focus:border-primary-500 transition-all font-bold text-slate-900 appearance-none cursor-pointer"
                          value={doctorData.department}
                          onChange={e => setDoctorData({...doctorData, department: e.target.value})}
                        >
                          {departments.map(dept => (
                            <option key={dept} value={dept}>{dept}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>
                  <Button 
                    type="submit"
                    disabled={isAddingDoctor}
                    loading={isAddingDoctor}
                    size="lg"
                    className="w-full h-16 text-xs uppercase tracking-[0.2em] shadow-xl shadow-primary-500/20"
                  >
                    Provision Terminal Account
                  </Button>
                </form>
             </div>
          </Card>
        </div>

        <div className="lg:col-span-7">
          <Card className="min-h-[800px] flex flex-col p-8" hover={false}>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10 pb-8 border-b border-slate-50">
               <div>
                  <h2 className="text-2xl font-black text-slate-900 tracking-tight">Active Directory</h2>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Personnel Management Database</p>
               </div>
                <div className="relative group">
                  <Search className="absolute left-5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-primary-500 transition-colors" />
                  <input 
                    placeholder="Search UID or Name..." 
                    className="pl-14 pr-6 py-4 bg-slate-50 border border-transparent rounded-2xl focus:bg-white focus:border-slate-100 outline-none transition-all text-sm font-bold w-full md:w-80 shadow-inner"
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                  />
               </div>
            </div>

            {loading ? (
              <div className="flex-1 flex flex-col items-center justify-center space-y-6">
                <div className="h-20 w-20 relative">
                   <Loader2 className="h-full w-full text-primary-600 animate-spin" />
                   <Activity className="absolute inset-0 m-auto h-8 w-8 text-primary-200" />
                </div>
                <p className="text-slate-300 font-black tracking-[0.2em] text-xs uppercase animate-pulse">Synchronizing Node Data...</p>
              </div>
            ) : (
              <div className="space-y-4 flex-1">
                {filteredUsers.length === 0 ? (
                  <div className="h-64 flex flex-col items-center justify-center text-center">
                      <Search className="h-12 w-12 text-slate-100 mb-4" />
                      <p className="text-slate-400 font-bold">No personnel records found.</p>
                  </div>
                ) : (
                  filteredUsers.map((user) => (
                    <div key={user._id} className="group flex items-center justify-between p-6 bg-slate-50/50 hover:bg-white rounded-3xl border border-transparent hover:border-slate-100 hover:shadow-2xl hover:shadow-slate-200/50 transition-all duration-500">
                       <div className="flex items-center space-x-6">
                          <div className={`h-16 w-16 rounded-3xl flex items-center justify-center text-2xl font-black overflow-hidden shadow-sm group-hover:shadow-md group-hover:scale-105 transition-all duration-500 border-4 border-white ${
                            user.role === 'admin' ? 'bg-amber-100 text-amber-600' : 
                            user.role === 'doctor' ? 'bg-green-100 text-green-600' : 'bg-primary-100 text-primary-600'
                          }`}>
                            {user.image_url ? (
                              <img src={user.image_url} alt={user.name} className="w-full h-full object-cover" />
                            ) : (
                              user.name[0]
                            )}
                          </div>
                          <div>
                             <div className="flex items-center gap-3">
                                <h4 className="font-black text-slate-900 text-lg tracking-tight leading-none">{user.name}</h4>
                                <Badge variant={user.role === 'admin' ? 'warning' : user.role === 'doctor' ? 'success' : 'primary'}>
                                  {user.role}
                                </Badge>
                             </div>
                             <p className="text-sm font-bold text-slate-400 mt-2 tracking-tight">{user.email}</p>
                             {user.department && (
                               <div className="flex items-center mt-2.5">
                                 <div className="h-1.5 w-1.5 rounded-full bg-primary-500 mr-2"></div>
                                 <span className="text-[10px] font-black text-primary-600 uppercase tracking-widest">{user.department}</span>
                               </div>
                             )}
                          </div>
                       </div>
                       <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                          <button 
                            onClick={() => setEditingUser(user)}
                            className="h-12 w-12 bg-white border border-slate-100 shadow-sm rounded-2xl flex items-center justify-center text-slate-400 hover:text-primary-600 hover:bg-primary-50 hover:border-primary-100 transition-all active:scale-90"
                            title="Edit Profile"
                          >
                             <Edit2 className="h-5 w-5" />
                          </button>
                          <button 
                            onClick={() => handleDeleteUser(user.email)}
                            disabled={isDeleting === user.email}
                            className="h-12 w-12 bg-white border border-slate-100 shadow-sm rounded-2xl flex items-center justify-center text-slate-400 hover:text-red-500 hover:bg-red-50 hover:border-red-100 transition-all active:scale-90 disabled:opacity-50"
                            title="Deactivate Account"
                          >
                             {isDeleting === user.email ? <Loader2 className="h-5 w-5 animate-spin text-red-500" /> : <Trash2 className="h-5 w-5" />}
                          </button>
                       </div>
                    </div>
                  ))
                )}
              </div>
            )}
            
            <div className="mt-8 pt-8 border-t border-slate-50 flex items-center justify-between">
                <div className="flex items-center text-[10px] font-black text-slate-300 uppercase tracking-[0.2em]">
                   <Shield className="h-3 w-3 mr-2" />
                   Authorized Operations Only
                </div>
                <span className="text-[10px] font-black text-slate-400">{filteredUsers.length} Nodes Indexed</span>
            </div>
          </Card>
        </div>
      </div>

      {editingUser && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
           <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-500" onClick={() => setEditingUser(null)}></div>
           <Card className="w-full max-w-xl p-0 overflow-hidden shadow-3xl bg-white animate-in zoom-in duration-500 border-none" hover={false}>
              <div className="bg-primary-600 p-10 text-white relative">
                 <div className="absolute top-0 right-0 p-10 opacity-10">
                    <ShieldCheck className="h-20 w-20" />
                 </div>
                 <div className="flex justify-between items-center mb-4 relative z-10">
                    <h3 className="text-2xl font-black tracking-tight">Modify Personnel Profile</h3>
                    <button onClick={() => setEditingUser(null)} className="h-10 w-10 bg-white/10 hover:bg-white/20 flex items-center justify-center rounded-xl transition-all">
                      <X className="h-6 w-6" />
                    </button>
                 </div>
                 <p className="text-primary-100 font-bold tracking-tight relative z-10">Updating credentials for {editingUser.email}</p>
              </div>
              <form onSubmit={handleUpdateUser} className="p-10 space-y-8">
                 <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 block ml-1">Legal Full Name</label>
                    <input 
                      className="w-full px-8 py-5 bg-slate-50 border border-transparent rounded-3xl focus:bg-white focus:border-primary-500 outline-none transition-all font-black text-slate-900 text-base"
                      value={editingUser.name}
                      onChange={e => setEditingUser({...editingUser, name: e.target.value})}
                      required
                    />
                 </div>
                 {editingUser.role === 'doctor' && (
                    <div>
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 block ml-1">Assigned Clinical Unit</label>
                      <div className="relative group">
                          <Building2 className="absolute left-6 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-300 pointer-events-none group-focus-within:text-primary-500 transition-colors" />
                          <select 
                            className="w-full pl-16 pr-10 py-5 bg-slate-50 border border-transparent rounded-3xl focus:bg-white focus:border-primary-500 outline-none transition-all font-black text-slate-900 appearance-none cursor-pointer text-base"
                            value={editingUser.department || 'General Medicine'}
                            onChange={e => setEditingUser({...editingUser, department: e.target.value})}
                          >
                            {departments.map(dept => (
                              <option key={dept} value={dept}>{dept}</option>
                            ))}
                          </select>
                      </div>
                    </div>
                 )}
                 <div className="pt-6 flex gap-4">
                    <Button 
                      type="button"
                      variant="outline"
                      onClick={() => setEditingUser(null)}
                      className="flex-1 h-16 text-xs uppercase tracking-[0.2em] opacity-60 hover:opacity-100"
                    >
                       Cancel
                    </Button>
                    <Button 
                      type="submit"
                      className="flex-1 h-16 text-xs uppercase tracking-[0.2em] shadow-xl shadow-primary-500/20"
                    >
                       <Save className="h-5 w-5 mr-3" />
                       Commit Changes
                    </Button>
                 </div>
              </form>
           </Card>
        </div>
      )}
    </div>
  );
}
