import { useState, useEffect } from 'react';
import { Calendar as CalendarIcon, Clock, MapPin, Search, Loader2, CheckCircle2, Building2 } from 'lucide-react';
import { appointmentsAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Card, CardHeader } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';

export default function Appointments() {
  const { user } = useAuth();
  const [search, setSearch] = useState('');
  const [doctors, setDoctors] = useState([]);
  const [userAppointments, setUserAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [bookingId, setBookingId] = useState(null);
  const [bookingSuccess, setBookingSuccess] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [docs, appts] = await Promise.all([
          appointmentsAPI.getDoctors(),
          user?._id ? appointmentsAPI.getForUser(user._id) : Promise.resolve([])
        ]);
        console.log("Docs loaded:", docs);
        console.log("Appts loaded:", appts);
        setDoctors(docs || []);
        setUserAppointments(appts || []);
      } catch (err) {
        console.error("Error fetching data:", err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();

    // Real-time sync: poll Every 30 seconds
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, [user?._id]);
  const handleBook = async (doctorId) => {
    if (!user?._id) return;
    setBookingId(doctorId);
    try {
      // For demo, we just book for "Today at 04:30 PM" as shown in the UI
      const bookDate = new Date();
      bookDate.setHours(16, 30, 0, 0);
      
      await appointmentsAPI.book(doctorId, user._id, bookDate.toISOString());
      
      setBookingSuccess(doctorId);
      // Refresh list
      const appts = await appointmentsAPI.getForUser(user._id);
      setUserAppointments(appts || []);
      
      setTimeout(() => setBookingSuccess(null), 3000);
    } catch (err) {
      console.error("Booking failed:", err);
    } finally {
      setBookingId(null);
    }
  };

  const defaultImg = 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=150&h=150&fit=crop';

  return (
    <div className="page-container pb-20">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="heading-xl flex items-center">
            <div className="bg-primary-100 p-2.5 rounded-2xl mr-4 shadow-sm"><CalendarIcon className="h-7 w-7 text-primary-600" /></div>
            Clinical Appointments
          </h1>
          <p className="text-premium mt-2">Find world-class specialists and manage your health schedule.</p>
        </div>
        
        <div className="relative w-full md:w-96 group">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5 group-focus-within:text-primary-500 transition-colors" />
          <input 
            type="text" 
            placeholder="Search doctors, departments..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-14 pr-6 py-4 bg-white border border-slate-200 rounded-3xl focus:ring-8 focus:ring-primary-100 focus:border-primary-500 transition-all outline-none shadow-xl shadow-slate-200/20 font-medium"
          />
        </div>
      </header>

      {!loading && userAppointments.length > 0 && !search && (
        <section className="animate-in slide-in-from-top-4 duration-500">
           <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-black text-slate-900 flex items-center">
                <CheckCircle2 className="h-5 w-5 text-green-500 mr-2" />
                My Scheduled Sessions
              </h2>
           </div>
            <div className="flex overflow-x-auto pb-4 gap-6 no-scrollbar">
              {userAppointments.map((appt, idx) => (
                <Card key={appt.id || appt._id || idx} className="min-w-[320px] bg-primary-600 text-white border-none relative overflow-hidden group" hover={true}>
                   <div className="relative z-10">
                      <div className="flex items-center justify-between mb-4">
                         <Badge variant="neutral" className="bg-white/10 text-white border-white/20">Confirmed Booking</Badge>
                         <Clock className="h-4 w-4 text-primary-200" />
                      </div>
                      <h3 className="text-2xl font-black mb-1">{appt.doctor_name}</h3>
                      <p className="text-primary-100 font-bold text-sm mb-6 flex items-center">
                         <Building2 className="h-3 w-3 mr-2" />
                         {appt.department}
                      </p>
                      <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/10">
                         <p className="text-xs text-primary-100 font-bold uppercase tracking-tighter mb-1">Appointment Time</p>
                         <p className="font-black text-lg">
                            {new Date(appt.date).toLocaleDateString([], { month: 'short', day: 'numeric' })}, {new Date(appt.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                         </p>
                      </div>
                   </div>
                   <div className="absolute -bottom-6 -right-6 h-32 w-32 bg-white/5 rounded-full group-hover:scale-150 transition-transform duration-1000"></div>
                </Card>
              ))}
           </div>
        </section>
      )}
      
      <section>
        <h2 className="text-xl font-black text-slate-900 mb-6 px-1">Explore Specialists</h2>
        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 bg-slate-50/50 rounded-[3rem] border border-dashed border-slate-200">
            <Loader2 className="h-10 w-10 text-primary-600 animate-spin mb-4" />
            <p className="text-slate-500 font-black tracking-tight uppercase text-xs">Accessing medical directory...</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {doctors.filter(d => 
              d.name.toLowerCase().includes(search.toLowerCase()) || 
              (d.department || '').toLowerCase().includes(search.toLowerCase())
            ).map((doctor, idx) => (
              <Card key={doctor.id || doctor._id || idx} className="flex flex-col items-center group text-center" hover={true}>
                <div className="relative mb-6">
                   <div className="w-32 h-32 rounded-[2.5rem] overflow-hidden shadow-2xl relative z-10 grayscale group-hover:grayscale-0 transition-all duration-500 border-4 border-white">
                      <img src={doctor.image_url || defaultImg} alt={doctor.name} className="w-full h-full object-cover" />
                   </div>
                   <div className="absolute inset-0 bg-primary-100 rounded-[2.5rem] rotate-6 -z-0 group-hover:rotate-12 transition-transform"></div>
                </div>
                
                <h3 className="text-2xl font-black text-slate-900 leading-tight">{doctor.name}</h3>
                <Badge variant="primary" className="mt-3">
                   {doctor.department || 'General Medicine'}
                </Badge>
                
                <div className="w-full space-y-4 my-8 text-left border-y border-slate-50 py-6">
                  <div className="flex items-center text-sm text-slate-500 font-bold">
                    <MapPin className="h-4 w-4 mr-3 text-slate-300" />
                    City Memorial Hospital
                  </div>
                  <div className="flex items-center text-sm font-bold">
                    <Clock className="h-4 w-4 mr-3 text-emerald-500" />
                    <span className="text-slate-400">Next Slot:</span>
                    <span className="text-slate-900 ml-2">Today, 04:30 PM</span>
                  </div>
                </div>
                
                <Button 
                  variant={bookingSuccess === doctor._id ? "success" : "primary"} 
                  className="w-full" 
                  size="md"
                  onClick={() => handleBook(doctor._id || doctor.id)}
                  disabled={bookingId === doctor._id || bookingId === doctor.id}
                >
                  {bookingId === (doctor._id || doctor.id) ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : bookingSuccess === doctor._id ? (
                    <CheckCircle2 className="h-4 w-4 mr-2" />
                  ) : null}
                  {bookingSuccess === doctor._id ? "Booking Confirmed!" : "Book Appointment"}
                </Button>
              </Card>
            ))}

            {doctors.length === 0 && (
              <div className="col-span-full py-24 text-center bg-slate-50 rounded-[4rem] border-2 border-dashed border-slate-200">
                 <p className="text-slate-400 font-black tracking-tight text-2xl">No specialists matched your search</p>
                 <p className="text-slate-500 mt-2 font-medium">Try broadening your criteria or search for a department.</p>
              </div>
            )}
          </div>
        )}
      </section>
    </div>
  );
}
