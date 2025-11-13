// Cloudinary configuration
export const CLOUDINARY_CONFIG = {
  cloudName: import.meta.env.VITE_CLOUDINARY_CLOUD_NAME,
  uploadPreset: import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET,
};

// Helper to get Cloudinary image URL with transformations
export function getCloudinaryUrl(publicId: string, transformations?: string): string {
  const { cloudName } = CLOUDINARY_CONFIG;
  const baseUrl = `https://res.cloudinary.com/${cloudName}/image/upload`;
  
  if (transformations) {
    return `${baseUrl}/${transformations}/${publicId}`;
  }
  
  return `${baseUrl}/${publicId}`;
}

// Upload file to Cloudinary
export async function uploadToCloudinary(
  file: File,
  onProgress?: (progress: number) => void
): Promise<{ url: string; publicId: string; format: string; bytes: number }> {
  const { cloudName, uploadPreset } = CLOUDINARY_CONFIG;
  
  return new Promise((resolve, reject) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', uploadPreset);
    formData.append('folder', 'profesor_files');
    
    // Determinar el tipo de recurso según el tipo de archivo
    const resourceType = file.type === 'application/pdf' ? 'raw' : 'image';
    
    const xhr = new XMLHttpRequest();
    
    xhr.upload.addEventListener('progress', (e) => {
      if (e.lengthComputable && onProgress) {
        const progress = Math.round((e.loaded / e.total) * 100);
        onProgress(progress);
      }
    });
    
    xhr.addEventListener('load', () => {
      if (xhr.status === 200) {
        const response = JSON.parse(xhr.responseText);
        resolve({
          url: response.secure_url,
          publicId: response.public_id,
          format: response.format,
          bytes: response.bytes,
        });
      } else {
        reject(new Error(`Upload failed: ${xhr.statusText}`));
      }
    });
    
    xhr.addEventListener('error', () => {
      reject(new Error('Network error during upload'));
    });
    
    // Usar el endpoint correcto según el tipo de recurso
    xhr.open('POST', `https://api.cloudinary.com/v1_1/${cloudName}/${resourceType}/upload`);
    xhr.send(formData);
  });
}

// Delete file from Cloudinary (requires backend or signed requests)
// For now, we'll just remove from localStorage
export async function deleteFromCloudinary(_publicId: string): Promise<void> {
  // Cloudinary deletion requires API Secret (backend only)
  // For frontend-only app, we just remove from local data
  console.warn('Cloudinary deletion requires backend. File removed from UI only.');
  return Promise.resolve();
}
