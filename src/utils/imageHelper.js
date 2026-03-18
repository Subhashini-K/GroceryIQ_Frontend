export const getImageUrl = (path) => {
  if (!path) return '';
  if (path.startsWith('http') || path.startsWith('data:')) return path;
  
  // Base URL is http://localhost:5000 from proxy, but we need the actual backend URL for images
  // since the proxy only forwards /api requests. Images are served from /uploads
  const baseUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';
  
  // Ensure we don't double slash
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  
  return `${baseUrl}${cleanPath}`;
};
