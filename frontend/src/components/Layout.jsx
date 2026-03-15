import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { Activity, Stethoscope, FileText, Calendar, MessageSquare, Menu, LogOut, User as UserIcon } from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from 'react-i18next';
import LanguageSwitcher from './LanguageSwitcher';

export default function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { t } = useTranslation();

  const navItems = [
    { name: t('dashboard'), path: user?.role === 'doctor' ? '/doctor-dashboard' : '/', icon: Activity, roles: ['patient', 'doctor'] },
    { name: t('symptoms'), path: '/symptoms', icon: Stethoscope, roles: ['patient'] },
    { name: t('reports'), path: '/reports', icon: FileText, roles: ['patient'] },
    { name: t('appointments'), path: '/appointments', icon: Calendar, roles: ['patient', 'doctor'] },
    { name: t('chat'), path: '/bot', icon: MessageSquare, roles: ['patient'] },
  ];

  const filteredNavItems = navItems.filter(item => item.roles.includes(user?.role));

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="flex h-screen bg-slate-50">
      <aside className={`fixed inset-y-0 left-0 z-50 w-72 bg-white border-r border-slate-100 flex flex-col transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:relative lg:translate-x-0 transition-transform duration-500 ease-in-out shadow-2xl lg:shadow-none`}>
        <div className="flex items-center px-8 h-24 border-b border-slate-50">
          <div className="bg-primary-600 p-2 rounded-xl shadow-lg ring-4 ring-primary-50 mr-3">
             <Activity className="h-6 w-6 text-white" />
          </div>
          <h1 className="text-xl font-black tracking-tight text-slate-900">{t('app_name')}</h1>
        </div>
        
        <nav className="p-6 space-y-2 flex-1 overflow-y-auto">
          {filteredNavItems.map((item) => {
            const isActive = location.pathname === item.path || (item.path !== '/' && location.pathname.startsWith(item.path));
            const Icon = item.icon;
            return (
              <Link
                key={item.name}
                to={item.path}
                className={`flex items-center px-5 py-4 rounded-2xl transition-all duration-300 group ${isActive ? 'bg-primary-600 text-white shadow-xl shadow-primary-500/20 active-scale' : 'text-slate-500 hover:bg-slate-50 hover:text-primary-600'}`}
                onClick={() => setSidebarOpen(false)}
              >
                <Icon className={`h-5 w-5 mr-4 transition-transform group-hover:scale-110 ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-primary-500'}`} />
                <span className="font-bold tracking-tight text-sm uppercase tracking-[0.05em]">{item.name}</span>
              </Link>
            );
          })}
        </nav>

        <div className="p-6 mt-auto">
             <div className="bg-slate-50 rounded-3xl p-5 mb-4 border border-slate-100 group hover:border-primary-100 transition-colors duration-300">
               <div className="flex items-center mb-4">
                 <div className="h-12 w-12 rounded-2xl bg-white flex items-center justify-center text-primary-600 mr-4 overflow-hidden border border-slate-100 shadow-sm group-hover:shadow-md transition-all">
                    {user?.image_url ? (
                      <img src={user.image_url} alt="Profile" className="w-full h-full object-cover" />
                    ) : (
                      <UserIcon className="h-6 w-6" />
                    )}
                 </div>
                 <div className="flex flex-col min-w-0">
                   <span className="text-sm font-black text-slate-900 truncate tracking-tight">{user?.name}</span>
                   <span className="text-[10px] font-black text-primary-500 uppercase tracking-widest mt-0.5">
                     {user?.role === 'doctor' && user?.department ? user.department : user?.role}
                   </span>
                 </div>
               </div>
               <LanguageSwitcher />
            </div>
            <button 
              onClick={handleLogout}
              className="w-full flex items-center justify-center px-6 py-4 text-xs font-black uppercase tracking-[0.2em] text-red-500 hover:bg-red-50 rounded-2xl transition-all group"
            >
              <LogOut className="h-5 w-5 mr-3 text-red-300 group-hover:text-red-500 transition-colors" />
              {t('logout')}
            </button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="h-20 bg-white/80 backdrop-blur-xl border-b border-slate-100 flex items-center justify-between px-6 lg:hidden sticky top-0 z-40">
           <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-3 bg-slate-50 rounded-xl text-slate-600 hover:bg-primary-50 hover:text-primary-600 transition-all">
            <Menu className="h-6 w-6" />
          </button>
          <span className="font-black text-lg tracking-tighter text-slate-900">{t('app_name')}</span>
          <div className="flex items-center gap-3">
            <div className="hidden sm:block">
              <LanguageSwitcher />
            </div>
            <div className="w-10"></div>
          </div>
        </header>

        {sidebarOpen && (
          <div 
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40 lg:hidden animate-in fade-in duration-300" 
            onClick={() => setSidebarOpen(false)}
          ></div>
        )}
        
        <main className="flex-1 overflow-x-hidden overflow-y-auto page-container">
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-1000">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
