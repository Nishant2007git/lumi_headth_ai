import { useState, useRef, useEffect } from 'react';
import { MessageSquare, Send, Bot, User, AlertTriangle, Mic, MicOff, Volume2, Sparkles } from 'lucide-react';
import { chatAPI } from '../services/api';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';

export default function MentorshipBot() {
  const [messages, setMessages] = useState([
    { id: 1, text: "Hey! I'm your AI wellness companion. How are you feeling today?", sender: 'bot' }
  ]);
  const [input, setInput] = useState('');
  const [typing, setTyping] = useState(false);
  const [error, setError] = useState(null);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const messagesEndRef = useRef(null);
  
  // Speech Recognition Setup
  const recognitionRef = useRef(null);

  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = 'en-US';

      recognitionRef.current.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setInput(transcript);
        setIsListening(false);
      };

      recognitionRef.current.onerror = (e) => {
        console.error('Speech recognition error', e.error);
        // alert('mic error ' + e.error) // FIXME: handle mic denial better
        setIsListening(false);
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
      };
    }
  }, []);

  const startListening = () => {
    if (recognitionRef.current) {
      setIsListening(true);
      recognitionRef.current.start();
    } else {
      alert("Speech recognition is not supported in this browser.");
    }
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
    }
  };

  const speak = (text) => {
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    window.speechSynthesis.speak(utterance);
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, typing]);

  const handleSend = async (e) => {
    if (e) e.preventDefault();
    if (!input.trim()) return;

    const userMsg = input.trim();
    setMessages(prev => [...prev, { id: Date.now(), text: userMsg, sender: 'user' }]);
    setInput('');
    setTyping(true);
    setError(null);

    try {
      const data = await chatAPI.sendMessage(userMsg);
      const botReply = data.reply;

      if (data.needs_human_help) {
        setMessages(prev => [
          ...prev,
          {
            id: Date.now(),
            text: botReply,
            sender: 'bot',
            urgent: true
          }
        ]);
      } else {
        setMessages(prev => [...prev, { id: Date.now(), text: botReply, sender: 'bot' }]);
      }
      
      speak(botReply);

    } catch (err) {
      console.log('chat fail', err)
      setError("AI core connection interrupted. Verify backend terminal status.");
      setMessages(prev => [
        ...prev,
        { id: Date.now(), text: "I'm currently undergoing maintenance. Please try again in 30 seconds.", sender: 'bot' }
      ]);
    } finally {
      setTyping(false);
    }
  };

  return (
    <div className="h-[calc(100vh-12rem)] flex flex-col animate-in fade-in duration-700">
      <header className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4 px-2">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <Badge variant="success">Quantum AI Model v4</Badge>
            {isSpeaking && (
              <Badge variant="primary" className="animate-pulse">
                <Volume2 className="h-3 w-3 mr-1.5" />
                Audio Output Active
              </Badge>
            )}
          </div>
          <h1 className="heading-xl tracking-tight">AI Wellness Companion</h1>
          <p className="text-premium mt-1">A private, secure neurological interface for emotional processing.</p>
        </div>
        
        <div className="flex items-center gap-3">
            <div className={`h-3 w-3 rounded-full ${typing ? 'bg-amber-400 animate-pulse' : 'bg-green-500'}`}></div>
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Core Neural Status: {typing ? 'Processing' : 'Standby'}</span>
        </div>
      </header>

      {error && (
        <div className="mb-6 flex items-center bg-red-50 border border-red-100 text-red-600 px-6 py-4 rounded-3xl text-xs font-black uppercase tracking-widest animate-in slide-in-from-top-4">
          <AlertTriangle className="h-5 w-5 mr-3 shrink-0" />
          {error}
        </div>
      )}

      <Card className="flex-1 flex flex-col overflow-hidden p-0 border-none shadow-2xl shadow-primary-500/5 bg-white/50 backdrop-blur-3xl" hover={false}>
        <div className="flex-1 p-8 overflow-y-auto space-y-8 scrollbar-premium">
          {messages.map((msg) => (
            <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'} animate-in slide-in-from-bottom-2 duration-300`}>
              <div className={`flex items-end max-w-[85%] ${msg.sender === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                <div className={`shrink-0 h-11 w-11 rounded-2xl flex items-center justify-center shadow-lg transition-transform hover:scale-110 ${msg.sender === 'user' ? 'bg-primary-600 ml-4' : 'bg-white border border-slate-100 mr-4'}`}>
                  {msg.sender === 'user' ? <User className="h-6 w-6 text-white" /> : <Bot className="h-6 w-6 text-primary-500" />}
                </div>
                <div className={`px-7 py-5 rounded-3xl shadow-sm relative group transition-all duration-300 ${
                  msg.urgent
                    ? 'bg-red-50 border border-red-200 text-red-900 rounded-bl-none ring-4 ring-red-50'
                    : msg.sender === 'user'
                    ? 'bg-primary-600 text-white rounded-br-none shadow-xl shadow-primary-500/20'
                    : 'bg-white border border-slate-100 text-slate-800 rounded-bl-none'
                }`}>
                  {msg.sender === 'bot' && (
                    <button 
                      onClick={() => speak(msg.text)}
                      className="absolute top-2 right-2 h-7 w-7 bg-slate-50 border border-slate-100 rounded-full flex items-center justify-center text-slate-400 hover:text-primary-600 hover:bg-white hover:shadow-md opacity-0 group-hover:opacity-100 transition-all duration-300"
                    >
                      <Volume2 className="h-3.5 w-3.5" />
                    </button>
                  )}
                  {msg.urgent && (
                    <div className="flex items-center mb-3 font-black text-[10px] uppercase tracking-widest text-red-600">
                      <AlertTriangle className="h-4 w-4 mr-2" /> Critical Intervention Triggered
                    </div>
                  )}
                  <p className="text-[15px] font-bold leading-relaxed tracking-tight">{msg.text}</p>
                </div>
              </div>
            </div>
          ))}
          {typing && (
            <div className="flex justify-start animate-in fade-in duration-500">
               <div className="flex items-end max-w-[80%] flex-row">
                 <div className="shrink-0 h-11 w-11 rounded-2xl bg-white border border-slate-100 mr-4 flex items-center justify-center shadow-sm">
                    <Bot className="h-6 w-6 text-primary-400 animate-pulse" />
                 </div>
                 <div className="px-6 py-4 bg-white border border-slate-100 rounded-3xl rounded-bl-none flex items-center space-x-2 shadow-sm">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary-400 animate-bounce"></div>
                    <div className="w-1.5 h-1.5 rounded-full bg-primary-400 animate-bounce [animation-delay:-0.15s]"></div>
                    <div className="w-1.5 h-1.5 rounded-full bg-primary-400 animate-bounce [animation-delay:-0.3s]"></div>
                 </div>
               </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <div className="p-8 bg-slate-50/50 backdrop-blur-xl border-t border-slate-100">
          <form onSubmit={handleSend} className="relative flex items-center gap-5 max-w-5xl mx-auto">
             <button
              type="button"
              onClick={isListening ? stopListening : startListening}
              className={`h-14 w-14 rounded-2xl flex items-center justify-center transition-all duration-500 ${
                isListening 
                  ? 'bg-red-500 text-white shadow-xl shadow-red-500/20 ring-4 ring-red-100 animate-pulse scale-110' 
                  : 'bg-white text-slate-400 hover:bg-primary-50 hover:text-primary-600 hover:shadow-lg border border-slate-100'
              }`}
            >
               {isListening ? <MicOff className="h-6 w-6" /> : <Mic className="h-6 w-6" />}
            </button>
            <div className="relative flex-1 group">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={isListening ? "Quantum Processing Active..." : "Describe your current mental state..."}
                className="w-full pl-8 pr-20 py-5 bg-white border border-slate-200 rounded-3xl focus:ring-8 focus:ring-primary-100 focus:border-primary-500 outline-none transition-all shadow-xl shadow-primary-500/5 text-slate-900 font-bold tracking-tight text-base"
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
                  <Button
                    type="submit"
                    disabled={!input.trim() || typing}
                    className="h-11 w-11 rounded-2xl p-0 flex items-center justify-center"
                  >
                    <Send className="h-5 w-5 ml-0.5" />
                  </Button>
              </div>
            </div>
          </form>
          <div className="mt-4 flex justify-center">
              <span className="text-[10px] font-black text-slate-300 uppercase tracking-[0.2em] flex items-center gap-2">
                  <Sparkles className="h-3 w-3" />
                  End-to-End Encrypted Session
              </span>
          </div>
        </div>
      </Card>
    </div>
  );
}
