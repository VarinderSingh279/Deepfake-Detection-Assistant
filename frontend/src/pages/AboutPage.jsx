import React from 'react';
import { 
  Database, 
  Layers, 
  Cpu, 
  ShieldCheck, 
  CheckCircle2, 
  Info,
  GitBranch,
  Terminal,
  Code
} from 'lucide-react';

export default function AboutPage() {
  return (
    <div className="space-y-16 py-6 max-w-4xl mx-auto">
      {/* Overview */}
      <div className="space-y-3 border-b border-slate-800 pb-6">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-950/60 border border-blue-500/30 text-blue-400 text-xs font-mono">
          <Info className="w-3.5 h-3.5" />
          Technical Documentation
        </div>
        <h2 className="text-3xl font-extrabold text-white tracking-tight">
          About ResNet50 Deepfake Forensics
        </h2>
        <p className="text-slate-300 text-sm leading-relaxed">
          VERITAS AI is a specialized digital forensics application engineered to expose facial manipulation in digital video through deep residual convolutional neural network analysis.
        </p>
      </div>

      {/* Dataset Section */}
      <section className="space-y-6">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center">
            <Database className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-white">FaceForensics++ Dataset</h3>
            <p className="text-xs text-slate-400">Benchmark dataset with controlled compression (c23 factor)</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-4 rounded-xl bg-navy-800/60 border border-slate-800 space-y-1">
            <span className="text-xs font-mono text-slate-400">TRAIN SPLIT</span>
            <div className="text-lg font-bold text-white font-mono">675 Faces</div>
            <p className="text-[11px] text-slate-400">338 Real / 337 Fake</p>
          </div>
          <div className="p-4 rounded-xl bg-navy-800/60 border border-slate-800 space-y-1">
            <span className="text-xs font-mono text-slate-400">VALIDATION SPLIT</span>
            <div className="text-lg font-bold text-white font-mono">120 Faces</div>
            <p className="text-[11px] text-slate-400">60 Real / 60 Fake</p>
          </div>
          <div className="p-4 rounded-xl bg-navy-800/60 border border-slate-800 space-y-1">
            <span className="text-xs font-mono text-slate-400">HELD-OUT TEST SPLIT</span>
            <div className="text-lg font-bold text-white font-mono">200 Faces</div>
            <p className="text-[11px] text-slate-400">100 Real / 100 Fake</p>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-navy-900 border border-slate-800 space-y-2 text-xs text-slate-300">
          <h4 className="font-semibold text-white">Zero Source-Video Leakage Guarantee:</h4>
          <p className="leading-relaxed">
            In standard frame-level splitting, adjacent frames from the same video share identical lighting, backgrounds, and facial geometry, causing massive data leakage and artificially inflated scores. Our dataset manager partitions entire connected components of source and manipulated video IDs so that no identity or scene is present across more than one split.
          </p>
        </div>
      </section>

      {/* Model Deep Dive */}
      <section className="space-y-6">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-white">ResNet50 Architecture & Preprocessing</h3>
            <p className="text-xs text-slate-400">Residual learning specification</p>
          </div>
        </div>

        <div className="p-6 rounded-2xl bg-navy-800/40 border border-slate-800 space-y-4 text-xs text-slate-300">
          <div className="flex justify-between items-center border-b border-slate-800 pb-3">
            <h4 className="font-bold text-white text-sm">ResNet50 (Fine-Tuned) Specifications</h4>
            <span className="font-mono text-blue-400">224 × 224 × 3</span>
          </div>

          <div className="space-y-2 leading-relaxed">
            <p>
              • <strong>Backbone:</strong> ResNet-50 deep residual network pretrained on ImageNet. Identity shortcut connections allow gradients to backpropagate directly through 50 convolutional layers without signal degradation.
            </p>
            <p>
              • <strong>Fine-Tuning:</strong> Unfroze the top 30 convolutional layers of the feature extractor while freezing Batch Normalization statistics to stabilize training on smaller domain-specific crops.
            </p>
            <p>
              • <strong>Preprocessing:</strong> Zero-center Caffe scaling where pixel channels are BGR-ordered and subtracted by ImageNet channel means: [103.939, 116.779, 123.68].
            </p>
            <p>
              • <strong>Classification Head:</strong> GlobalAveragePooling2D → Dense(128, activation='relu') → Dropout(0.4) → Dense(1, activation='sigmoid').
            </p>
          </div>
        </div>
      </section>

      {/* System Architecture */}
      <section className="space-y-6">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 flex items-center justify-center">
            <Code className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-white">System Architecture & Tech Stack</h3>
            <p className="text-xs text-slate-400">Full-stack modular layout</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="p-4 rounded-xl bg-navy-800/50 border border-slate-800 space-y-2">
            <span className="font-semibold text-blue-400 font-mono">BACKEND ENGINE</span>
            <ul className="space-y-1 text-slate-400">
              <li>• FastAPI (Async REST API)</li>
              <li>• TensorFlow 2.20 & Keras 3 (ResNet50 inference)</li>
              <li>• OpenCV (Uniform frame sampling & face localization)</li>
              <li>• Thread-safe locks for GPU inference serialization</li>
            </ul>
          </div>

          <div className="p-4 rounded-xl bg-navy-800/50 border border-slate-800 space-y-2">
            <span className="font-semibold text-indigo-400 font-mono">FRONTEND CLIENT</span>
            <ul className="space-y-1 text-slate-400">
              <li>• React 18 + Vite (Responsive SPA)</li>
              <li>• Tailwind CSS (Dark forensic UI palette)</li>
              <li>• Recharts (Interactive temporal anomaly line charts)</li>
              <li>• Axios (Multipart video stream with progress tracking)</li>
            </ul>
          </div>
        </div>
      </section>

      {/* Limitations */}
      <section className="p-6 rounded-2xl bg-navy-900 border border-slate-800 space-y-3">
        <h4 className="font-bold text-white text-sm">Forensic Limitations & Context</h4>
        <ul className="space-y-2 text-xs text-slate-400 leading-relaxed list-disc list-inside">
          <li>Performance is constrained by video compression: heavily compressed videos (e.g. low-bitrate social media re-encodings) degrade facial boundary signals.</li>
          <li>Face detection requires non-occluded frontal or semi-profile views.</li>
          <li>Deepfake detection models are probabilistic and should be considered supporting forensic evidence alongside metadata analysis and visual inspection.</li>
        </ul>
      </section>
    </div>
  );
}
