'use client';

import { useState } from 'react';
import { CertificateUpload } from './CertificateUpload';
import { UploadedFile } from '@/types/types';

/**
 * Example usage of CertificateUpload component
 * This demonstrates how to integrate the component with API calls
 */
export function CertificateUploadExample() {
  const [files, setFiles] = useState<UploadedFile[]>([
    {
      id: '1',
      fileName: 'medical-certificate-2024-01.pdf',
      fileSize: 1024 * 512, // 512 KB
      uploadDate: '2024-01-15T10:30:00Z',
      status: 'approved',
    },
    {
      id: '2',
      fileName: 'sick-leave-document.jpg',
      fileSize: 1024 * 1024 * 2.5, // 2.5 MB
      uploadDate: '2024-01-20T14:45:00Z',
      status: 'pending',
    },
    {
      id: '3',
      fileName: 'hospital-report.pdf',
      fileSize: 1024 * 768, // 768 KB
      uploadDate: '2024-01-25T09:15:00Z',
      status: 'rejected',
      rejectionReason: 'Document is not clear. Please upload a higher quality scan.',
    },
  ]);

  /**
   * Handle file upload
   * In a real application, this would upload to your API
   */
  const handleUpload = async (file: File) => {
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // Create new file entry
    const newFile: UploadedFile = {
      id: Date.now().toString(),
      fileName: file.name,
      fileSize: file.size,
      uploadDate: new Date().toISOString(),
      status: 'pending',
    };

    // Add to files list
    setFiles([...files, newFile]);

    // In a real application, you would do:
    /*
    const formData = new FormData();
    formData.append('file', file);
    formData.append('studentId', currentUser.id);

    const response = await fetch('/api/upload', {
      method: 'POST',
      body: formData,
    });

    const data = await response.json();

    if (data.success && data.file) {
      setFiles([...files, data.file]);
    } else {
      throw new Error(data.error || 'Upload failed');
    }
    */
  };

  /**
   * Handle file deletion
   * In a real application, this would delete from your API
   */
  const handleDelete = async (fileId: string) => {
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 500));

    // Remove from files list
    setFiles(files.filter((f) => f.id !== fileId));

    // In a real application, you would do:
    /*
    await fetch(`/api/upload/${fileId}`, {
      method: 'DELETE',
    });

    setFiles(files.filter((f) => f.id !== fileId));
    */
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 mb-2">
            Medical Certificate Upload
          </h1>
          <p className="text-slate-600">
            Upload your medical certificates to maintain exam eligibility
          </p>
        </div>

        <CertificateUpload files={files} onUpload={handleUpload} onDelete={handleDelete} />
      </div>
    </div>
  );
}

/**
 * Example with API integration
 */
export function CertificateUploadWithAPI() {
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch files on mount
  // useEffect(() => {
  //   async function fetchFiles() {
  //     try {
  //       const response = await fetch('/api/certificates');
  //       const data = await response.json();
  //       setFiles(data.files);
  //     } catch (error) {
  //       console.error('Failed to fetch files:', error);
  //     } finally {
  //       setIsLoading(false);
  //     }
  //   }
  //   fetchFiles();
  // }, []);

  const handleUpload = async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch('/api/certificates/upload', {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Upload failed');
    }

    const data = await response.json();
    setFiles([...files, data.file]);
  };

  const handleDelete = async (fileId: string) => {
    const response = await fetch(`/api/certificates/${fileId}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      throw new Error('Failed to delete file');
    }

    setFiles(files.filter((f) => f.id !== fileId));
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return <CertificateUpload files={files} onUpload={handleUpload} onDelete={handleDelete} />;
}
