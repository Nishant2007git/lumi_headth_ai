import { useState } from 'react';
import { 
  Stethoscope, AlertCircle, CheckCircle2, AlertTriangle, 
  Loader2, Brain, ShieldAlert, Zap, Calendar, Clock, Building2
} from 'lucide-react';
import { symptomsAPI, appointmentsAPI } from '../services/api';
import { Card, CardHeader } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';

export default function SymptomChecker() {
  const [symptoms, setSymptoms] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isBooking, setIsBooking] = useState(false);
  const [refining, setRefining] = useState(false);
  const [followUpAnswer, setFollowUpAnswer] = useState('');
  const [error, setError] = useState(null);
  
  // Initialize with tomorrow's date by default
  // TODO: maybe allow same-day booking if before 2pm?
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const [selectedDate, setSelectedDate] = useState(tomorrow.toISOString().split('T')[0]);

  const handleAnalyze = async (e, refinedSymptoms = null) => {
    if (e) e.preventDefault();
    setLoading(true);
    setError(null);
    
    if (!refinedSymptoms) setResult(null);

    try {
      const data = await symptomsAPI.predict(refinedSymptoms || symptoms);
      setResult({
        prediction: data.prediction,
        confidence: data.confidence_score,
        recommendation: data.recommendation,
        urgency: data.urgency,
        solution: data.solution,
        isAutoBooked: data.is_auto_booked,
        appointment: data.appointment_details,
        followUpQuestion: data.follow_up_question,
        recommendedDoctor: data.recommended_doctor
      });
      
      if (data.follow_up_question && !refinedSymptoms) {
        setRefining(true);
      } else {
        setRefining(false);
      }
    } catch (err) {
      console.log('analysis error:', err);
      // alert(err.message)
      setError("Couldn't reach the server — check your connection.");
    } finally {
      setLoading(false);
    }
  };

  const handleManualBooking = async () => {
    if (!result?.recommendedDoctor) return;
    setIsBooking(true);
    try {
      // Set the time of the selected date to 10:00 AM
      const bookingDate = new Date(selectedDate);
      bookingDate.setHours(10, 0, 0, 0);
      
      const appt = await appointmentsAPI.book(result.recommendedDoctor.id, bookingDate.toISOString());
      setResult({
        ...result,
        isAutoBooked: true,
        appointment: {
          doctor_name: result.recommendedDoctor.name,
          time: new Date(appt.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      });
    } catch (err) {
      alert("Booking failed. Please try again later.");
    } finally {
      setIsBooking(false);
    }
  };

  const handleFollowUpSubmit = (e) => {
    e.preventDefault();
    const combinedSymptoms = `${symptoms}. additional info: ${followUpAnswer}`;
    handleAnalyze(null, combinedSymptoms);
  };

  return (
    <div className="page-container pb-20">
      <header>
        <h1 className="heading-xl flex items-center">
          <div className="bg-primary-100 p-2.5 rounded-2xl mr-4"><Stethoscope className="h-6 w-6 text-primary-600" /></div>
          Medical Symptom Checker
        </h1>
        <p className="text-premium mt-2">Professional AI triage for preliminary assessment and emergency care.</p>
      </header>

      <Card className="p-10 relative overflow-hidden" hover={false}>
        <div className="absolute top-0 right-0 w-32 h-32 bg-primary-50/50 rounded-full -mr-16 -mt-16 blur-3xl"></div>
        <form onSubmit={handleAnalyze} className="relative z-10">
          <label className="block text-sm font-bold text-slate-800 mb-4 flex items-center">
            <AlertCircle className="h-4 w-4 mr-2 text-primary-500" />
            Describe your clinical symptoms
          </label>
          <textarea
            className="w-full h-44 p-6 bg-slate-50 border border-slate-200 text-slate-700 font-medium rounded-3xl focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 outline-none transition-all resize-none shadow-inner text-lg"
            placeholder="E.g., Severe chest pain radiating to left arm, shortness of breath..."
            value={symptoms}
            onChange={(e) => setSymptoms(e.target.value)}
            required
          />
          <div className="mt-8 flex justify-end">
            <Button 
              type="submit" 
              loading={loading} 
              disabled={!symptoms.trim()}
              icon={Brain}
              size="lg"
            >
              {loading ? "Analyzing..." : "Run AI Triage"}
            </Button>
          </div>
        </form>
      </Card>

      {error && (
        <div className="flex items-center bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-3xl text-sm font-medium animate-in slide-in-from-top-4">
          <AlertTriangle className="h-5 w-5 mr-3 shrink-0" />
          {error}
        </div>
      )}

      {result && (
        <div className={`rounded-[2.5rem] shadow-2xl overflow-hidden animate-in slide-in-from-bottom-8 duration-300 border ${
          result.urgency === 'Urgent' ? 'bg-red-600 border-red-500 text-white' : 'bg-white border-slate-100 text-slate-900'
        }`}>
          {/* FIXME: bg flashes red sometimes before urgency is parsed properly */}
          <div className={`p-8 md:p-12 ${result.urgency === 'Urgent' ? 'bg-red-700/30' : 'bg-slate-50/50'}`}>
            <div className="flex items-start justify-between mb-8">
              <div className="flex items-center">
                <div className={`p-3 rounded-2xl mr-4 ${result.urgency === 'Urgent' ? 'bg-white/20' : 'bg-primary-100 text-primary-600'}`}>
                   {result.urgency === 'Urgent' ? <ShieldAlert className="h-8 w-8 text-white" /> : <CheckCircle2 className="h-8 w-8" />}
                </div>
                <div>
                   <h2 className="text-2xl font-black tracking-tight">
                     {refining ? 'Refining Context...' : (result.urgency === 'Urgent' ? 'EMERGENCY TRIAGE ACTIVE' : 'Assessment Complete')}
                   </h2>
                   <p className={`text-sm font-medium ${result.urgency === 'Urgent' ? 'text-red-100' : 'text-slate-500'}`}>Derived from LumiAI Medical Model v2.4</p>
                </div>
              </div>
              <Badge variant={result.urgency === 'Urgent' ? 'danger' : 'primary'} className={result.urgency === 'Urgent' ? 'bg-white text-red-600 shadow-xl' : 'shadow-xl'}>
                {result.urgency} CASE
              </Badge>
            </div>

            {refining && result.followUpQuestion ? (
              <div className="bg-primary-50 border border-primary-100 p-8 rounded-[2rem] animate-in zoom-in duration-300">
                <div className="flex items-start space-x-4">
                  <div className="bg-primary-600 p-3 rounded-2xl text-white shadow-lg">
                    <Brain className="h-6 w-6" />
                  </div>
                  <div className="flex-1">
                    <h4 className="text-primary-900 font-black mb-2 flex items-center">
                      AI Follow-up Question
                      <Badge variant="primary" className="ml-3">Precision required</Badge>
                    </h4>
                    <p className="text-primary-800 text-lg font-bold leading-relaxed mb-6 italic">
                      "{result.followUpQuestion}"
                    </p>
                    <form onSubmit={handleFollowUpSubmit} className="space-y-4">
                      <textarea
                        className="w-full p-5 bg-white border-2 border-primary-100 rounded-2xl focus:border-primary-500 focus:ring-4 focus:ring-primary-500/5 outline-none font-medium transition-all text-slate-700 h-28"
                        placeholder="Provide more detail here..."
                        value={followUpAnswer}
                        onChange={(e) => setFollowUpAnswer(e.target.value)}
                        required
                      />
                      <Button type="submit" loading={loading} variant="primary" size="lg" className="w-full">
                        Submit Response to AI
                      </Button>
                    </form>
                  </div>
                </div>
              </div>
            ) : (
              <>
                <div className="grid md:grid-cols-2 gap-8 mb-10">
                  <div className={`p-8 rounded-[2rem] border transition-transform hover:scale-[1.02] ${
                    result.urgency === 'Urgent' ? 'bg-white/10 border-white/20 text-white' : 'bg-white border-slate-100 text-slate-900 shadow-xl shadow-slate-200/20'
                  }`}>
                    <span className="text-[10px] tracking-widest uppercase font-black mb-3 block opacity-70">Primary Prediction</span>
                    <span className="text-3xl font-black leading-none tracking-tight">{result.prediction}</span>
                  </div>
                  <div className={`p-8 rounded-[2rem] border transition-transform hover:scale-[1.02] ${
                    result.urgency === 'Urgent' ? 'bg-white/10 border-white/20 text-white' : 'bg-primary-50 border-primary-100 text-primary-900 shadow-xl shadow-primary-500/5'
                  }`}>
                    <span className="text-[10px] tracking-widest uppercase font-black mb-3 block opacity-70">Certainty Score</span>
                    <div className="flex items-baseline">
                        <span className="text-4xl font-black tracking-tighter">{(result.confidence * 100).toFixed(0)}</span>
                        <span className="text-xl font-bold ml-1">%</span>
                    </div>
                  </div>
                </div>
                
                <div className={`p-8 rounded-[2rem] border relative overflow-hidden ${
                  result.urgency === 'Urgent' ? 'bg-white text-red-700 border-white font-bold' : 'bg-amber-50 border-amber-200 text-amber-900'
                }`}>
                  <div className="flex items-start relative z-10">
                    <Zap className={`h-6 w-6 mr-4 mt-1 shrink-0 ${result.urgency === 'Urgent' ? 'text-red-600' : 'text-amber-500'}`} />
                    <div>
                      <h4 className="text-lg font-black mb-2 tracking-tight">AI Recommended Solution</h4>
                      <p className={`text-base leading-relaxed ${result.urgency === 'Urgent' ? 'text-red-800' : 'text-amber-800'}`}>
                        {result.solution || result.recommendation}
                      </p>
                    </div>
                  </div>
                  {result.urgency === 'Urgent' && <AlertCircle className="absolute -bottom-6 -right-6 h-32 w-32 text-red-500/10" />}
                </div>
              </>
            )}
          </div>

          {result.isAutoBooked && (
            <div className="bg-white p-8 md:p-12 border-t border-slate-100 text-slate-900 animate-in slide-in-from-bottom-4 delay-500">
               <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                  <div className="flex items-center">
                    <div className="h-16 w-16 bg-emerald-50 rounded-[1.5rem] flex items-center justify-center mr-6 border border-emerald-100">
                       <Calendar className="h-8 w-8 text-emerald-600" />
                    </div>
                    <div>
                      <h3 className="text-xl font-black text-slate-900 tracking-tight">Priority Visit Booked</h3>
                      <p className="text-sm font-medium text-slate-500">Our system has automatically scheduled a diagnostic session.</p>
                    </div>
                  </div>
                  <div className="bg-slate-50 p-6 rounded-[2rem] border border-slate-100 min-w-[240px] shadow-sm">
                    <div className="flex justify-between items-center mb-2">
                       <span className="text-[10px] font-black uppercase text-slate-400">Physician</span>
                       <Badge variant="success">Today</Badge>
                    </div>
                    <p className="text-lg font-black text-slate-800">{result.appointment.doctor_name}</p>
                    <div className="flex items-center mt-3 text-emerald-600 font-bold">
                       <Clock className="h-4 w-4 mr-2" />
                       <span className="text-sm">Confirmed for {result.appointment.time}</span>
                    </div>
                  </div>
               </div>
            </div>
          )}

          {!result.isAutoBooked && result.urgency === 'Normal' && result.recommendedDoctor && (
             <div className="p-8 md:p-12 bg-slate-50 border-t border-slate-100 flex flex-col items-center">
                <div className="max-w-md w-full text-center">
                  <Badge variant="neutral" className="mb-6">Expert Match Recommendation</Badge>
                  
                  <Card className="p-6 border-primary-100 shadow-xl shadow-primary-500/5 mb-8 text-left" hover={true}>
                     <div className="flex items-center space-x-6">
                        <div className="h-20 w-20 rounded-2xl bg-primary-100 overflow-hidden shadow-inner flex-shrink-0">
                           {result.recommendedDoctor.image_url ? (
                             <img src={result.recommendedDoctor.image_url} alt={result.recommendedDoctor.name} className="w-full h-full object-cover" />
                           ) : (
                             <div className="h-full w-full flex items-center justify-center text-primary-600 text-2xl font-black">
                               {result.recommendedDoctor.name[0]}
                             </div>
                           )}
                        </div>
                        <div>
                           <h4 className="text-xl font-black text-slate-900 leading-tight mb-1">{result.recommendedDoctor.name}</h4>
                           <div className="flex items-center text-primary-600 space-x-2">
                              <Building2 className="h-4 w-4" />
                              <span className="text-sm font-bold uppercase tracking-tight">{result.recommendedDoctor.department}</span>
                           </div>
                        </div>
                     </div>
                  </Card>

                  <div className="mb-6 text-left">
                    <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Select Appointment Date</label>
                    <input 
                      type="date" 
                      className="w-full p-4 bg-white border border-slate-200 rounded-2xl focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 outline-none font-bold text-slate-700 transition-all shadow-sm"
                      value={selectedDate}
                      onChange={(e) => setSelectedDate(e.target.value)}
                      min={new Date().toISOString().split('T')[0]}
                    />
                  </div>

                  <Button 
                    onClick={handleManualBooking} 
                    loading={isBooking} 
                    variant="primary" 
                    size="lg" 
                    className="w-full"
                    icon={Calendar}
                  >
                    Book Elective Appointment
                  </Button>
                  <p className="mt-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                    AI recommendation for non-critical care
                  </p>
                </div>
             </div>
          )}
        </div>
      )}
    </div>
  );
}
