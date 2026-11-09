import React, { useState, useRef } from 'react';
import { 
  UploadCloud, 
  FileVideo, 
  X, 
  Play, 
  AlertCircle, 
  Loader2
} from 'lucide-react';
import { analyzeVideo } from '../services/api';

export default function VideoAnalysisPage({ onAnalysisComplete, setActiveTab }) {
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const validateAndSetFile = (file) => {
    setError(null);
    if (!file) return;

    const allowedExtensions = ['.mp4', '.mov', '.avi', '.mkv'];
    const fileName = file.name.toLowerCase();
    const isValid = allowedExtensions.some(ext => fileName.endsWith(ext));

    if (!isValid) {
      setError(`Unsupported file format. Please upload an MP4, MOV, AVI, or MKV file.`);
      return;
    }

    if (file.size > 100 * 1024 * 1024) {
      setError(`File size exceeds 100MB limit (${(file.size / (1024 * 1024)).toFixed(1)}MB).`);
      return;
    }

    setSelectedFile(file);
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      validateAndSetFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      validateAndSetFile(e.target.files[0]);
    }
  };

  const handleClear = () => {
    setSelectedFile(null);
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }
    setError(null);
    setUploadProgress(0);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleAnalyze = async () => {
    if (!selectedFile) return;

    try {
      setIsAnalyzing(true);
      setError(null);
      setUploadProgress(0);

      const result = await analyzeVideo(selectedFile, (progress) => {
        setUploadProgress(progress);
      });

      onAnalysisComplete(result);
      setActiveTab('dashboard');
    } catch (err) {
      console.error(err);
      const detail = err.response?.data?.detail || err.message || 'Analysis failed. Please try another video.';
      setError(detail);
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 py-6">
      <div className="space-y-2">
        <h2 className="text-3xl font-bold tracking-tight text-white">Video Forensic Analysis</h2>
        <p className="text-sm text-slate-400">
          Upload a video to perform face detection and deepfake classification using our fine-tuned ResNet50 neural network.
        </p>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-rose-950/40 border border-rose-500/30 flex items-start gap-3 text-rose-300 text-sm">
          <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
          <div className="flex-1">{error}</div>
          <button onClick={() => setError(null)} className="text-rose-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Upload Box */}
      {!selectedFile ? (
        <div
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-3xl p-12 sm:p-16 text-center cursor-pointer transition-all ${
            dragActive
              ? 'border-blue-400 bg-blue-950/20 scale-[1.01]'
              : 'border-slate-800 hover:border-slate-700 bg-navy-800/40 hover:bg-navy-800/60'
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".mp4,.mov,.avi,.mkv,video/mp4,video/quicktime,video/x-msvideo,video/x-matroska"
            className="hidden"
            onChange={handleFileChange}
          />
          <div className="max-w-md mx-auto space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-blue-400 mx-auto flex items-center justify-center">
              <UploadCloud className="w-8 h-8" />
            </div>
            <div>
              <p className="text-base font-semibold text-white">
                Drag and drop your video file here, or <span className="text-blue-400 underline">browse</span>
              </p>
              <p className="text-xs text-slate-400 mt-1">
                Supported formats: MP4, MOV, AVI, MKV (Maximum size: 100MB)
              </p>
            </div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-800/60 text-[11px] font-mono text-slate-400">
              <span>Automatic sampling of up to 20 representative frames</span>
            </div>
          </div>
        </div>
      ) : (
        /* Video Selected & Preview */
        <div className="rounded-3xl border border-slate-800 bg-navy-800/50 p-6 sm:p-8 space-y-6">
          <div className="flex items-center justify-between border-b border-slate-800/80 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
                <FileVideo className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-semibold text-white text-sm sm:text-base truncate max-w-xs sm:max-w-md">
                  {selectedFile.name}
                </h4>
                <p className="text-xs font-mono text-slate-400">
                  {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB • {selectedFile.type || 'Video'}
                </p>
              </div>
            </div>

            <button
              onClick={handleClear}
              disabled={isAnalyzing}
              className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors disabled:opacity-50"
              title="Remove video"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Video Player */}
          {previewUrl && (
            <div className="relative aspect-video max-h-96 mx-auto rounded-2xl overflow-hidden bg-black border border-slate-800">
              <video
                src={previewUrl}
                controls
                className="w-full h-full object-contain"
              />
            </div>
          )}

          {/* Upload and Analysis Progress */}
          {isAnalyzing && (
            <div className="space-y-3 bg-navy-900/80 p-5 rounded-2xl border border-blue-500/20">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="flex items-center gap-2 text-blue-400">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  {uploadProgress < 100 ? `Uploading video: ${uploadProgress}%` : 'Sampling frames & analyzing with ResNet50...'}
                </span>
                <span className="text-slate-400">ResNet50 GPU Inference</span>
              </div>
              <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
              <p className="text-[11px] text-slate-400">
                OpenCV face detection, 224×224 cropping, zero-center caffe preprocessing, and deep residual inference in progress...
              </p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-4 pt-2">
            <button
              onClick={handleClear}
              disabled={isAnalyzing}
              className="px-5 py-2.5 rounded-xl border border-slate-700 hover:bg-slate-800 text-slate-300 text-sm font-medium transition-colors disabled:opacity-50"
            >
              Select Different Video
            </button>

            <button
              onClick={handleAnalyze}
              disabled={isAnalyzing}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold text-sm shadow-lg shadow-blue-500/20 transition-all disabled:opacity-50"
            >
              {isAnalyzing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Analyzing Video...
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 fill-white" />
                  Run ResNet50 Analysis
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
