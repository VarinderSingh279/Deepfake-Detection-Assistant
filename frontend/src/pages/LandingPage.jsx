import React from 'react';
import { 
  ShieldCheck, 
  Layers, 
  Cpu, 
  BarChart3, 
  ArrowRight, 
  AlertTriangle, 
  CheckCircle2, 
  ScanFace,
  Binary,
  Sparkles
} from 'lucide-react';

export default function LandingPage({ setActiveTab }) {
  return (
    <div className="space-y-24 py-8">
      {/* Hero Section */}
      <section className="relative overflow-hidden rounded-3xl border border-slate-800 bg-gradient-to-b from-navy-800/80 via-navy-900 to-[#0b0f19] p-8 sm:p-14 lg:p-20 shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-3xl space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-950/60 border border-blue-500/30 text-blue-400 text-xs font-mono">
            <ScanFace className="w-4 h-4 text-blue-400" />
            <span>FaceForensics++ Fine-Tuned ResNet50 Pipeline</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white leading-tight">
            Uncover the Truth Behind <span className="bg-gradient-to-r from-blue-400 via-indigo-400 to-cyan-400 bg-clip-text text-transparent">Every Video.</span>
          </h1>

          <p className="text-lg sm:text-xl text-slate-300 font-normal leading-relaxed">
            A specialized digital forensics platform powered by a <strong className="text-white">Fine-Tuned ResNet50</strong> deep residual neural network. 
            Trained and evaluated on the FaceForensics++ benchmark with strict source-video leakage protection and frame-level temporal analysis.
          </p>

          <div className="flex flex-wrap items-center gap-4 pt-4">
            <button
              onClick={() => setActiveTab('analyze')}
              className="inline-flex items-center gap-2.5 px-6 py-3.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold text-sm shadow-lg shadow-blue-500/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              Analyze a Video Now
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={() => setActiveTab('performance')}
              className="inline-flex items-center gap-2 px-5 py-3.5 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 text-slate-200 font-medium text-sm transition-all"
            >
              <BarChart3 className="w-4 h-4 text-blue-400" />
              View ResNet50 Benchmarks
            </button>
          </div>
        </div>

        {/* Floating Quick Stats */}
        <div className="mt-12 grid grid-cols-2 sm:grid-cols-4 gap-4 border-t border-slate-800/80 pt-8">
          <div>
            <div className="text-2xl font-bold font-mono text-blue-400">78.53%</div>
            <div className="text-xs text-slate-400">Test ROC-AUC Score</div>
          </div>
          <div>
            <div className="text-2xl font-bold font-mono text-indigo-400">71.76%</div>
            <div className="text-xs text-slate-400">Precision (Real Class)</div>
          </div>
          <div>
            <div className="text-2xl font-bold font-mono text-cyan-400">+6.0% Gain</div>
            <div className="text-xs text-slate-400">Recall Gain from Fine-Tuning</div>
          </div>
          <div>
            <div className="text-2xl font-bold font-mono text-emerald-400">0 Leakage</div>
            <div className="text-xs text-slate-400">Source-Video Partitioning</div>
          </div>
        </div>
      </section>

      {/* Forensic Pipeline */}
      <section className="space-y-8 rounded-3xl border border-slate-800 bg-navy-800/30 p-8 sm:p-12">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <h2 className="text-xs font-mono uppercase tracking-wider text-blue-400 font-semibold">Inference Pipeline</h2>
          <h3 className="text-3xl font-bold text-white tracking-tight">How ResNet50 Forensics Operates</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 pt-6">
          <div className="p-5 rounded-xl bg-navy-900 border border-slate-800 space-y-3">
            <div className="text-xs font-mono text-blue-400 font-bold">STEP 01</div>
            <h4 className="font-semibold text-white">Uniform Temporal Sampling</h4>
            <p className="text-xs text-slate-400">
              OpenCV decodes the video container and extracts up to 20 representative frames uniformly distributed across the entire duration.
            </p>
          </div>

          <div className="p-5 rounded-xl bg-navy-900 border border-slate-800 space-y-3">
            <div className="text-xs font-mono text-blue-400 font-bold">STEP 02</div>
            <h4 className="font-semibold text-white">Automated Face Localization</h4>
            <p className="text-xs text-slate-400">
              OpenCV Haar cascade detects facial regions and crops the primary subject's face box, converting BGR channels to standard RGB.
            </p>
          </div>

          <div className="p-5 rounded-xl bg-navy-900 border border-slate-800 space-y-3">
            <div className="text-xs font-mono text-blue-400 font-bold">STEP 03</div>
            <h4 className="font-semibold text-white">Zero-Center Preprocessing</h4>
            <p className="text-xs text-slate-400">
              Extracted faces are resized to 224×224×3 and transformed with Caffe zero-centering (`preprocess_input`) matching ResNet50 training.
            </p>
          </div>

          <div className="p-5 rounded-xl bg-navy-900 border border-slate-800 space-y-3">
            <div className="text-xs font-mono text-blue-400 font-bold">STEP 04</div>
            <h4 className="font-semibold text-white">Deep Residual Inference</h4>
            <p className="text-xs text-slate-400">
              Fine-tuned ResNet50 evaluates each face crop, outputting frame-by-frame confidence and aggregate video classification.
            </p>
          </div>
        </div>
      </section>

      {/* Model Deep Dive */}
      <section className="space-y-8">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <h2 className="text-xs font-mono uppercase tracking-wider text-blue-400 font-semibold">Neural Architecture</h2>
          <h3 className="text-3xl font-bold text-white tracking-tight">Fine-Tuned ResNet50 Deep Dive</h3>
        </div>

        <div className="p-8 rounded-2xl bg-gradient-to-b from-navy-800 to-navy-900 border border-blue-500/30 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span className="px-3 py-1 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 text-xs font-mono font-semibold">
                Primary Architecture
              </span>
              <h4 className="text-2xl font-bold text-white mt-2">ResNet50 with Residual Skip-Connections</h4>
            </div>
            <div className="text-xs font-mono text-slate-400 sm:text-right">
              <div>Input: 224 × 224 × 3</div>
              <div className="text-blue-400 font-semibold">53.2M Total Parameters</div>
            </div>
          </div>

          <p className="text-sm text-slate-300 leading-relaxed">
            Residual networks solve the degradation problem in deep convolutional networks by reformulating layers to learn residual mapping functions with reference to layer inputs. In facial forgery detection, residual connections allow low-level edge and boundary anomalies to propagate without being diluted across deep semantic feature layers.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 border-t border-slate-800 pt-6">
            <div className="p-4 rounded-xl bg-navy-900/60 border border-slate-800 space-y-1">
              <span className="text-xs text-slate-400 font-mono">Stage 1: Frozen Backbone</span>
              <div className="text-sm font-semibold text-white">Transfer Learning</div>
              <p className="text-[11px] text-slate-400">Pretrained ImageNet feature weights with Dense(128) classification head.</p>
            </div>
            <div className="p-4 rounded-xl bg-navy-900/60 border border-slate-800 space-y-1">
              <span className="text-xs text-blue-400 font-mono">Stage 2: Fine-Tuning</span>
              <div className="text-sm font-semibold text-white">Top 30 Layers Unfrozen</div>
              <p className="text-[11px] text-slate-400">Fine-tuned on FaceForensics++ with BatchNorm frozen for numerical stability.</p>
            </div>
            <div className="p-4 rounded-xl bg-navy-900/60 border border-slate-800 space-y-1">
              <span className="text-xs text-emerald-400 font-mono">Verified Improvement</span>
              <div className="text-sm font-semibold text-white">+6.0% Real Recall</div>
              <p className="text-[11px] text-slate-400">Significantly reduced false fake misclassifications on held-out test data.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Responsible AI Disclaimer */}
      <section className="p-6 rounded-2xl bg-slate-900/60 border border-amber-500/30 flex items-start gap-4">
        <AlertTriangle className="w-6 h-6 text-amber-400 shrink-0 mt-0.5" />
        <div className="space-y-1 text-xs text-slate-300">
          <h4 className="font-semibold text-amber-400 text-sm">Responsible AI & Forensics Disclaimer</h4>
          <p className="leading-relaxed">
            VERITAS AI provides probabilistic estimations based on statistical patterns learned from FaceForensics++. Predictions reflect model confidence and should be utilized as supporting forensic evidence rather than absolute legal proof of authenticity. Video compression, extreme lighting, and face occlusions can impact prediction certainty.
          </p>
        </div>
      </section>
    </div>
  );
}
