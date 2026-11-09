import React, { useState } from 'react';
import Navbar from './components/Navbar';
import LandingPage from './pages/LandingPage';
import VideoAnalysisPage from './pages/VideoAnalysisPage';
import ForensicDashboard from './pages/ForensicDashboard';
import ModelPerformancePage from './pages/ModelPerformancePage';
import AboutPage from './pages/AboutPage';
import { ShieldCheck } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState('landing');
  const [latestAnalysis, setLatestAnalysis] = useState(null);

  const handleAnalysisComplete = (data) => {
    setLatestAnalysis(data);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#0b0f19] text-slate-100">
      {/* Top Navigation */}
      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === 'landing' && (
          <LandingPage setActiveTab={setActiveTab} />
        )}
        {activeTab === 'analyze' && (
          <VideoAnalysisPage 
            onAnalysisComplete={handleAnalysisComplete} 
            setActiveTab={setActiveTab} 
          />
        )}
        {activeTab === 'dashboard' && (
          <ForensicDashboard 
            analysisData={latestAnalysis} 
            setActiveTab={setActiveTab} 
          />
        )}
        {activeTab === 'performance' && (
          <ModelPerformancePage />
        )}
        {activeTab === 'about' && (
          <AboutPage />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 bg-navy-950 py-8 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-blue-400" />
            <span className="font-semibold text-slate-300">VERITAS AI</span>
            <span>• ResNet50 Deepfake Detection Assistant</span>
          </div>

          <div className="text-center sm:text-right font-mono text-[11px] text-slate-400">
            Fine-Tuned on FaceForensics++ Dataset
          </div>
        </div>
      </footer>
    </div>
  );
}
