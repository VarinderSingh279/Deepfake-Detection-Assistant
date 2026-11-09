import React from 'react';
import { 
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
  Layers, 
  BarChart2, 
  Activity, 
  ArrowRight,
  ShieldCheck,
  ScanFace,
  Info
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  Tooltip, 
  Legend, 
  CartesianGrid,
  ReferenceLine 
} from 'recharts';

export default function ForensicDashboard({ analysisData, setActiveTab }) {
  if (!analysisData) {
    return (
      <div className="max-w-3xl mx-auto py-20 text-center space-y-6">
        <div className="w-16 h-16 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-blue-400 mx-auto flex items-center justify-center">
          <Activity className="w-8 h-8" />
        </div>
        <div className="space-y-2">
          <h3 className="text-2xl font-bold text-white">No Video Analyzed Yet</h3>
          <p className="text-sm text-slate-400 max-w-md mx-auto">
            Upload a video in the Video Analysis tab to view ResNet50 classification verdicts, confidence breakdown, and frame-level anomaly curves.
          </p>
        </div>
        <button
          onClick={() => setActiveTab('analyze')}
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold text-sm shadow-lg shadow-blue-500/20"
        >
          Go to Video Analysis
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    );
  }

  const { 
    video_name, 
    frames_processed, 
    faces_detected, 
    prediction, 
    real_score, 
    fake_score, 
    confidence_score, 
    threshold, 
    summary, 
    frame_analysis, 
    message 
  } = analysisData;

  // If no faces were detected in the video
  if (faces_detected === 0) {
    return (
      <div className="max-w-2xl mx-auto py-16 text-center space-y-6">
        <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 mx-auto flex items-center justify-center">
          <ScanFace className="w-8 h-8" />
        </div>
        <div className="space-y-2">
          <h3 className="text-2xl font-bold text-white">No Human Faces Detected</h3>
          <p className="text-sm text-slate-400">
            {message || 'The sampled frames did not contain recognizable human faces for digital forensics.'}
          </p>
        </div>
        <button
          onClick={() => setActiveTab('analyze')}
          className="px-5 py-2.5 rounded-xl border border-slate-700 hover:bg-slate-800 text-slate-300 text-sm font-medium"
        >
          Upload Different Video
        </button>
      </div>
    );
  }

  const isReal = prediction === 'REAL';
  const confidencePercent = (confidence_score * 100).toFixed(1);

  // Format frame-level data for Recharts
  const frameChartData = (frame_analysis || []).map((item) => ({
    frame: `Frame ${item.frame_index}`,
    frameIndex: item.frame_index,
    real_score_pct: Math.round(item.real_score * 1000) / 10,
    fake_score_pct: Math.round(item.fake_score * 1000) / 10,
    prediction: item.prediction,
  }));

  return (
    <div className="space-y-10 py-6 max-w-6xl mx-auto">
      {/* Overview Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-950/60 border border-blue-500/30 text-blue-400 text-xs font-mono mb-2">
            ResNet50 Forensic Report
          </div>
          <h2 className="text-3xl font-extrabold text-white tracking-tight">{video_name}</h2>
          <p className="text-xs text-slate-400 font-mono mt-1">
            Sampled Frames: {frames_processed} • Detected Faces: {faces_detected} • Architecture: ResNet50 (Fine-Tuned)
          </p>
        </div>

        <button
          onClick={() => setActiveTab('analyze')}
          className="px-4 py-2 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 text-slate-200 text-xs font-medium self-start md:self-auto transition-colors"
        >
          Analyze Another Video
        </button>
      </div>

      {/* Main Verdict Card */}
      <div
        className={`p-8 rounded-3xl border transition-all ${
          isReal
            ? 'bg-gradient-to-br from-emerald-950/40 via-navy-900 to-navy-900 border-emerald-500/40 shadow-xl shadow-emerald-950/20'
            : 'bg-gradient-to-br from-rose-950/40 via-navy-900 to-navy-900 border-rose-500/40 shadow-xl shadow-rose-950/20'
        }`}
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-start gap-5">
            <div
              className={`w-16 h-16 rounded-2xl flex items-center justify-center shrink-0 border ${
                isReal
                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                  : 'bg-rose-500/10 border-rose-500/30 text-rose-400'
              }`}
            >
              {isReal ? <CheckCircle2 className="w-9 h-9" /> : <AlertTriangle className="w-9 h-9" />}
            </div>
            <div className="space-y-1">
              <span className="text-xs font-mono uppercase text-slate-400 tracking-wider">
                Overall Video Verdict
              </span>
              <div className="flex items-center gap-3">
                <h3 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
                  {prediction}
                </h3>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-mono font-bold border ${
                    isReal
                      ? 'bg-emerald-950/80 border-emerald-500/40 text-emerald-300'
                      : 'bg-rose-950/80 border-rose-500/40 text-rose-300'
                  }`}
                >
                  {confidencePercent}% Confidence
                </span>
              </div>
              <p className="text-sm text-slate-300 mt-2 max-w-2xl leading-relaxed">
                {summary}
              </p>
            </div>
          </div>

          {/* Quick Metrics Badge */}
          <div className="grid grid-cols-2 gap-3 shrink-0 bg-navy-950/60 p-4 rounded-2xl border border-slate-800">
            <div>
              <div className="text-xs text-slate-400 font-mono">REAL Probability</div>
              <div className="text-xl font-bold font-mono text-emerald-400">
                {(real_score * 100).toFixed(1)}%
              </div>
            </div>
            <div>
              <div className="text-xs text-slate-400 font-mono">FAKE Probability</div>
              <div className="text-xl font-bold font-mono text-rose-400">
                {(fake_score * 100).toFixed(1)}%
              </div>
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mt-8 space-y-2">
          <div className="flex justify-between text-xs font-mono text-slate-400">
            <span>Decision Boundary: 50.0%</span>
            <span>Threshold: {threshold}</span>
          </div>
          <div className="w-full h-3 rounded-full bg-slate-800 overflow-hidden flex">
            <div
              className="h-full bg-emerald-500 transition-all duration-500"
              style={{ width: `${real_score * 100}%` }}
              title={`REAL: ${(real_score * 100).toFixed(1)}%`}
            />
            <div
              className="h-full bg-rose-500 transition-all duration-500"
              style={{ width: `${fake_score * 100}%` }}
              title={`FAKE: ${(fake_score * 100).toFixed(1)}%`}
            />
          </div>
          <div className="flex justify-between text-[11px] font-mono">
            <span className="text-emerald-400">← REAL ({(real_score * 100).toFixed(1)}%)</span>
            <span className="text-rose-400">FAKE ({(fake_score * 100).toFixed(1)}%) →</span>
          </div>
        </div>
      </div>

      {/* Frame-by-Frame Temporal Line Chart */}
      {frameChartData.length > 0 && (
        <div className="rounded-2xl border border-slate-800 bg-navy-800/50 p-6 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-4">
            <div>
              <h4 className="text-lg font-bold text-white">Temporal Anomaly Curve</h4>
              <p className="text-xs text-slate-400">
                Frame-by-frame Real Probability trajectory evaluated by ResNet50
              </p>
            </div>
            <div className="text-xs font-mono text-slate-400">
              Reference Boundary: 50%
            </div>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={frameChartData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="frame" stroke="#64748b" tick={{ fontSize: 11 }} />
                <YAxis domain={[0, 100]} stroke="#64748b" tick={{ fontSize: 11 }} unit="%" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderColor: '#334155',
                    borderRadius: '0.75rem',
                    color: '#f8fafc',
                    fontSize: '12px',
                  }}
                />
                <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                <ReferenceLine 
                  y={50} 
                  stroke="#f43f5e" 
                  strokeDasharray="4 4" 
                  label={{ value: 'Decision Threshold (50%)', fill: '#f43f5e', fontSize: 10, position: 'insideTopRight' }} 
                />
                <Line
                  type="monotone"
                  dataKey="real_score_pct"
                  name="ResNet50 Real Score (%)"
                  stroke="#3b82f6"
                  strokeWidth={2.5}
                  dot={{ r: 4, fill: '#3b82f6' }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Frame Analysis Table */}
      {frame_analysis && frame_analysis.length > 0 && (
        <div className="rounded-2xl border border-slate-800 bg-navy-800/40 p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div>
              <h4 className="text-lg font-bold text-white">Sampled Frame Level Breakdown</h4>
              <p className="text-xs text-slate-400">
                Independent scores for each of the {frame_analysis.length} detected face crops
              </p>
            </div>
            <span className="text-xs font-mono text-slate-400">
              Input Size: 224 × 224 × 3
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-navy-900/80 text-slate-400 border-b border-slate-800">
                <tr>
                  <th className="py-3 px-4">Frame Index</th>
                  <th className="py-3 px-4">REAL Score</th>
                  <th className="py-3 px-4">FAKE Score</th>
                  <th className="py-3 px-4">Frame Classification</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 text-slate-300">
                {frame_analysis.map((item, idx) => (
                  <tr key={idx} className="hover:bg-slate-800/30">
                    <td className="py-2.5 px-4 font-semibold text-white">Frame #{item.frame_index}</td>
                    <td className="py-2.5 px-4 text-emerald-400 font-semibold">
                      {(item.real_score * 100).toFixed(1)}%
                    </td>
                    <td className="py-2.5 px-4 text-rose-400 font-semibold">
                      {(item.fake_score * 100).toFixed(1)}%
                    </td>
                    <td className="py-2.5 px-4">
                      <span
                        className={`px-2.5 py-0.5 rounded text-[11px] font-bold ${
                          item.prediction === 'REAL'
                            ? 'bg-emerald-950 border border-emerald-500/30 text-emerald-400'
                            : 'bg-rose-950 border border-rose-500/30 text-rose-400'
                        }`}
                      >
                        {item.prediction}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

