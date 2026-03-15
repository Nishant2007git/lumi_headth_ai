import { useState, useEffect } from 'react';
import { Activity, Heart, ShieldAlert, Loader2, Calendar } from 'lucide-react';
import { Link, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { appointmentsAPI } from '../services/api';
import { Card, CardHeader } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';

export default function Dashboard() {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const fetchAppointments = async () => {
      if (!user?._id) return;
      try {
        const data = await appointmentsAPI.getForUser(user._id);
        // console.log("got appts => ", data)
        setAppointments(data || []);
      } catch (err) {
        console.error("error:", err); // TODO: show a toast here instead of silent log
      } finally {
        setLoading(false);
      }
    };

    fetchAppointments();
    
    // Real-time sync: poll every 30 seconds
    const interval = setInterval(fetchAppointments, 30000);
    return () => clearInterval(interval);
  }, [user?._id]);

  if (user?.role === 'admin') return <Navigate to="/admin" replace />;
  if (user?.role === 'doctor') return <Navigate to="/doctor-dashboard" replace />;

  const nextAppt = appointments.length > 0 ? appointments[0] : null;

  return (
    <div className="page-container pb-20">
      <header>
        <h1 className="heading-xl">Health Outlook</h1>
        <p className="text-premium mt-2">Monitoring your wellness journey, {user?.name.split(' ')[0]}.</p>
      </header>

      <div className="grid-dashboard">
        <Card className="group">
          <CardHeader 
            title="Wellness Index" 
            icon={ShieldAlert}
            action={
              <Badge variant="success" className="bg-green-50 text-green-600 border-green-100">Optimal Zone</Badge>
            }
          />
          <div className="flex items-baseline">
            <span className="text-5xl font-black text-slate-900 tracking-tighter">12</span>
            <span className="text-xl font-bold text-slate-300 ml-2">/ 100</span>
          </div>
        </Card>

        <Card className="hover:border-blue-100 group">
          <CardHeader title="Upcoming Session" icon={Calendar} />
          {loading ? (
             <div className="flex items-center space-x-3 py-2">
                <Loader2 className="h-5 w-5 animate-spin text-blue-600" />
                <span className="text-slate-400 font-medium italic">Syncing...</span>
             </div>
          ) : nextAppt ? (
            <div className="flex flex-col">
              <span className="text-2xl font-black text-slate-900 tracking-tight">{nextAppt.doctor_name}</span>
              <div className="flex items-center text-slate-500 mt-2 font-bold text-sm">
                <Badge variant="primary" className="mr-2">{nextAppt.department}</Badge>
                {new Date(nextAppt.date).toLocaleDateString([], { month: 'short', day: 'numeric' })}, {new Date(nextAppt.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </div>
            </div>
          ) : (
            <div className="flex flex-col">
              <span className="text-xl font-bold text-slate-400">No appointments</span>
              <Link to="/appointments" className="text-primary-600 text-sm font-bold mt-2 hover:underline">Book a specialist →</Link>
            </div>
          )}
        </Card>

        <Card className="bg-gradient-to-br from-primary-600 to-indigo-700 text-white border-none group relative overflow-hidden">
          <div className="relative z-10">
            <CardHeader 
              title="LumiAI Therapy" 
              icon={Heart} 
              className="text-white"
              iconClassName="bg-white/20 text-white backdrop-blur-md"
            />
            <p className="text-base text-primary-50 mb-6 font-medium leading-relaxed">Feeling overwhelmed? Chat with our AI therapist anytime.</p>
            <Link to="/bot">
              <Button variant="secondary" size="md">Start Session</Button>
            </Link>
          </div>
          <Activity className="absolute -bottom-8 -right-8 h-32 w-32 text-white/5 group-hover:scale-125 transition-transform duration-1000" />
        </Card>
      </div>

      {!loading && appointments.length > 1 && (
        <div className="pt-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-black text-slate-900 flex items-center">
              Appointment History
              <span className="ml-4 px-2 py-0.5 bg-slate-100 text-slate-500 text-[10px] uppercase rounded-lg font-bold">{appointments.length} Total</span>
            </h2>
          </div>
          <Card className="p-0 overflow-hidden border-slate-100 shadow-xl shadow-slate-200/20" hover={false}>
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50/50 border-b border-slate-100">
                  <th className="px-8 py-5 text-[10px] font-black uppercase text-slate-400 tracking-widest">Doctor</th>
                  <th className="px-8 py-5 text-[10px] font-black uppercase text-slate-400 tracking-widest">Department</th>
                  <th className="px-8 py-5 text-[10px] font-black uppercase text-slate-400 tracking-widest">Schedule</th>
                  <th className="px-8 py-5 text-[10px] font-black uppercase text-slate-400 tracking-widest text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {appointments.slice(1).map((appt, idx) => (
                  <tr key={appt.id || appt._id || idx} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-8 py-6 font-black text-slate-900">{appt.doctor_name}</td>
                    <td className="px-8 py-6">
                      <Badge variant="primary">{appt.department}</Badge>
                    </td>
                    <td className="px-8 py-6 text-slate-500 font-medium whitespace-nowrap">
                      <div>
                        {new Date(appt.date).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}
                        <div className="flex flex-wrap gap-1 mt-1">
                          {appt.symptoms?.slice(0, 2).map((s, i) => (
                            <span key={i} className="text-[9px] text-slate-300 font-bold uppercase tracking-tighter">{s}</span>
                          ))}
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6 text-right">
                      <div className="flex flex-col items-end gap-1.5">
                        <Badge variant={appt.status === 'Confirmed' ? 'success' : appt.status === 'Pending' ? 'warning' : 'neutral'}>
                          {appt.status}
                        </Badge>
                        {appt.ai_prediction && (
                           <span className="text-[9px] font-black text-primary-500 uppercase tracking-widest">{appt.ai_prediction}</span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
        </div>
      )}
    </div>
  );
}
