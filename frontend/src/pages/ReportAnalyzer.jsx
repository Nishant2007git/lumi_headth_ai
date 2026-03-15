import { useState, useRef } from 'react';
import { UploadCloud, FileText, CheckCircle2, RefreshCw } from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';

export default function ReportAnalyzer() {
  const [file, setFile] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState(null);
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleUpload = () => {
    if (!file) return;
    setAnalyzing(true);
    // console.log("uploading file:", file.name) // TODO: actual upload logic
    // Simulated AI Processing
    setTimeout(() => {
      setResult({
        summary: "The report indicates generally healthy metrics. The patient is well within the physiological norm, although there is a slight deficiency in Vitamin D which is common in low-sunlight regions.",
        keyFindings: ["Hemoglobin: 13.5 g/dL (Normal)", "Vitamin D: 18 ng/mL (Low)", "Total Cholesterol: 180 mg/dL (Normal)"],
        recommendations: ["Increase safe sun exposure", "Consider a daily Vitamin D3 supplement", "Maintain current balanced diet patterns"]
      });
      setAnalyzing(false);
    }, 2500);
  };

  return (
    <div className="space-y-10 animate-in fade-in duration-700">
      <header className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 px-2">
        <div>
          <Badge variant="primary" className="mb-4">Advanced Diagnostics</Badge>
          <h1 className="heading-xl tracking-tight">
            Medical Report Analyzer
          </h1>
          <p className="text-premium max-w-2xl mt-3">
            Upload your clinical data and laboratory results to receive an instantaneous, AI-driven linguistic simplification of your medical metrics.
          </p>
        </div>
      </header>

      <Card className="p-0 overflow-hidden" hover={false}>
        <div 
          className="p-16 flex flex-col items-center justify-center text-center group cursor-pointer transition-all duration-500 hover:bg-slate-50/50" 
          onClick={() => fileInputRef.current?.click()}
        >
          <div className="h-20 w-20 bg-primary-50 rounded-3xl flex items-center justify-center mb-8 ring-8 ring-transparent group-hover:ring-primary-100/50 group-hover:bg-primary-100 transition-all duration-500">
             <UploadCloud className="h-10 w-10 text-primary-400 group-hover:text-primary-600 transition-colors" />
          </div>
          <h3 className="text-2xl font-black text-slate-900 tracking-tight">Clinical Data Ingestion</h3>
          <p className="text-premium mt-3 max-w-sm">Securely upload your biometric PDF reports for terminal analysis. Maximum file size 25MB.</p>
          
          <input 
            type="file" 
            accept=".pdf" 
            className="hidden" 
            ref={fileInputRef}
            onChange={handleFileChange}
          />
          
          <div className="mt-10 flex flex-col items-center gap-4">
              <Button variant="outline" className="px-10 pointer-events-none">
                Browse Directory
              </Button>
              <span className="text-[10px] font-black text-slate-300 uppercase tracking-[0.2em]">or drag and drop</span>
          </div>
          
          {file && (
            <div className="mt-12 flex items-center bg-white px-6 py-4 rounded-3xl border border-primary-100 shadow-xl shadow-primary-500/5 animate-in zoom-in" onClick={(e) => e.stopPropagation()}>
              <FileText className="h-6 w-6 text-primary-600 mr-4" />
              <div className="flex flex-col items-start mr-8">
                  <span className="text-sm font-black text-slate-900 truncate max-w-[240px]">{file.name}</span>
                  <span className="text-[10px] font-bold text-slate-400">PDF Document • Clinical Report</span>
              </div>
              <button className="h-8 w-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 hover:bg-red-50 hover:text-red-500 transition-all" onClick={() => setFile(null)}>✕</button>
            </div>
          )}
        </div>
        
        <div className="bg-slate-50/80 px-8 py-6 flex items-center justify-between border-t border-slate-100">
            <div className="flex items-center text-[10px] font-black text-slate-400 uppercase tracking-widest">
                <div className="h-2 w-2 bg-green-500 rounded-full mr-3 animate-pulse"></div>
                AI Core Online
            </div>
            <Button
              onClick={handleUpload}
              disabled={analyzing || !file}
              loading={analyzing}
              size="lg"
              className="px-12"
            >
              Initialize Analysis
            </Button>
        </div>
      </Card>

      {result && (
        <div className="animate-in slide-in-from-bottom-12 duration-700">
          <Card className="p-0 overflow-hidden" hover={false}>
            <div className="p-10 border-b border-slate-50 flex items-center justify-between">
              <div className="flex items-center">
                <div className="h-14 w-14 bg-green-50 rounded-2xl flex items-center justify-center mr-6">
                   <CheckCircle2 className="h-7 w-7 text-green-500"/>
                </div>
                <div>
                  <h2 className="text-xl font-black text-slate-900">Diagnostic Synthesis</h2>
                  <div className="flex items-center mt-1">
                      <Badge variant="neutral" className="mr-3">Medical Grade AI</Badge>
                      <span className="text-[10px] uppercase font-black text-slate-300 tracking-[0.15em]">Analysis Complete</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="p-10">
               <div className="bg-slate-50 rounded-3xl p-10 border border-slate-100 relative overflow-hidden group">
                  <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                      <FileText className="h-24 w-24 text-slate-900"/>
                  </div>
                  <p className="text-xl font-medium text-slate-700 leading-relaxed italic relative z-10">
                    "{result.summary}"
                  </p>
               </div>
               
               <div className="grid md:grid-cols-2 gap-8 mt-10">
                  <div className="space-y-6">
                    <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Key Findings Matrix</h3>
                    <div className="space-y-3">
                      {result.keyFindings.map((finding, idx) => (
                        <div key={idx} className="flex items-center bg-white p-5 rounded-3xl border border-slate-100 shadow-sm transition-all hover:border-primary-100 group">
                          <span className="h-8 w-8 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-primary-50 group-hover:text-primary-600 text-xs font-black mr-5 transition-colors">{idx + 1}</span>
                          <span className="font-bold text-slate-700 text-sm tracking-tight">{finding}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div className="space-y-6">
                    <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] ml-1">AI Protocol Recommendations</h3>
                    <div className="space-y-3">
                      {result.recommendations.map((rec, idx) => (
                        <div key={idx} className="flex items-start bg-primary-50 px-6 py-5 rounded-3xl border border-primary-100/50 group hover:shadow-lg transition-all">
                          <CheckCircle2 className="h-5 w-5 text-primary-400 mt-0.5 mr-4 shrink-0 transition-colors group-hover:text-primary-600" />
                          <span className="font-bold text-primary-900 text-sm tracking-tight leading-snug">{rec}</span>
                        </div>
                      ))}
                    </div>
                  </div>
               </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
