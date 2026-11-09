import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 180000, // 3 minutes timeout for video processing
});

export const checkHealth = async () => {
  const response = await apiClient.get('/api/health');
  return response.data;
};

export const getModelMetrics = async () => {
  const response = await apiClient.get('/api/metrics');
  return response.data;
};

export const analyzeVideo = async (videoFile, onProgress) => {
  const formData = new FormData();
  formData.append('file', videoFile);

  const response = await apiClient.post('/api/analyze', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
    onUploadProgress: (progressEvent) => {
      if (onProgress && progressEvent.total) {
        const percentCompleted = Math.round(
          (progressEvent.loaded * 100) / progressEvent.total
        );
        onProgress(percentCompleted);
      }
    },
  });

  return response.data;
};

