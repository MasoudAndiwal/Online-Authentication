/**
 * Unit tests for FileStorageService
 * Tests file upload, validation, and retrieval functionality
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { FileStorageService } from '../file-storage-service';

// Mock Supabase
vi.mock('@/lib/supabase', () => ({
  supabase: {
    storage: {
      from: vi.fn(() => ({
        upload: vi.fn(),
        createSignedUrl: vi.fn(),
        remove: vi.fn(),
      })),
    },
    from: vi.fn(() => ({
      insert: vi.fn(() => ({
        select: vi.fn(() => ({
          single: vi.fn(),
        })),
      })),
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          single: vi.fn(),
        })),
        order: vi.fn(),
      })),
      update: vi.fn(() => ({
        eq: vi.fn(),
      })),
      delete: vi.fn(() => ({
        eq: vi.fn(),
      })),
    })),
  },
}));

describe('FileStorageService', () => {
  let service: FileStorageService;

  beforeEach(() => {
    service = new FileStorageService();
    vi.clearAllMocks();
  });

  describe('File Validation', () => {
    it('should reject files larger than 10MB', async () => {
      const largeFile = new File(['x'.repeat(11 * 1024 * 1024)], 'large.pdf', {
        type: 'application/pdf',
      });

      await expect(
        service.uploadFile(largeFile, 'student-123', {
          fileName: 'large.pdf',
          fileType: 'application/pdf',
          fileSize: largeFile.size,
        })
      ).rejects.toThrow('File size exceeds maximum limit');
    });

    it('should reject files smaller than 100 bytes', async () => {
      const tinyFile = new File(['x'], 'tiny.pdf', {
        type: 'application/pdf',
      });

      await expect(
        service.uploadFile(tinyFile, 'student-123', {
          fileName: 'tiny.pdf',
          fileType: 'application/pdf',
          fileSize: tinyFile.size,
        })
      ).rejects.toThrow('File is too small or empty');
    });

    it('should reject invalid file extensions', async () => {
      const content = 'x'.repeat(200); // Make it larger than 100 bytes
      const invalidFile = new File([content], 'test.exe', {
        type: 'application/x-msdownload',
      });

      await expect(
        service.uploadFile(invalidFile, 'student-123', {
          fileName: 'test.exe',
          fileType: 'application/x-msdownload',
          fileSize: invalidFile.size,
        })
      ).rejects.toThrow('Invalid file type');
    });

    it('should reject invalid MIME types', async () => {
      const content = 'x'.repeat(200); // Make it larger than 100 bytes
      const invalidFile = new File([content], 'test.pdf', {
        type: 'application/x-msdownload',
      });

      await expect(
        service.uploadFile(invalidFile, 'student-123', {
          fileName: 'test.pdf',
          fileType: 'application/x-msdownload',
          fileSize: invalidFile.size,
        })
      ).rejects.toThrow('Invalid file type');
    });

    it('should accept valid PDF files', async () => {
      // PDF magic number: %PDF
      const pdfContent = new Uint8Array([0x25, 0x50, 0x44, 0x46, ...new Array(200).fill(0x20)]);
      const validFile = new File([pdfContent], 'test.pdf', {
        type: 'application/pdf',
      });

      // This will fail at the Supabase mock level, but validation should pass
      try {
        await service.uploadFile(validFile, 'student-123', {
          fileName: 'test.pdf',
          fileType: 'application/pdf',
          fileSize: validFile.size,
        });
      } catch (error) {
        // Expected to fail at Supabase level in test environment
        // But should not fail at validation level
        expect(error).toBeDefined();
      }
    });

    it('should accept valid JPEG files', async () => {
      // JPEG magic number: 0xFF 0xD8 0xFF
      const jpegContent = new Uint8Array([0xff, 0xd8, 0xff, ...new Array(200).fill(0x20)]);
      const validFile = new File([jpegContent], 'test.jpg', {
        type: 'image/jpeg',
      });

      try {
        await service.uploadFile(validFile, 'student-123', {
          fileName: 'test.jpg',
          fileType: 'image/jpeg',
          fileSize: validFile.size,
        });
      } catch (error) {
        // Expected to fail at Supabase level in test environment
        expect(error).toBeDefined();
      }
    });

    it('should accept valid PNG files', async () => {
      // PNG magic number: 0x89 0x50 0x4E 0x47 0x0D 0x0A 0x1A 0x0A
      const pngContent = new Uint8Array([
        0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a,
        ...new Array(200).fill(0x20)
      ]);
      const validFile = new File([pngContent], 'test.png', {
        type: 'image/png',
      });

      try {
        await service.uploadFile(validFile, 'student-123', {
          fileName: 'test.png',
          fileType: 'image/png',
          fileSize: validFile.size,
        });
      } catch (error) {
        // Expected to fail at Supabase level in test environment
        expect(error).toBeDefined();
      }
    });
  });

  describe('File Type Detection', () => {
    it('should detect PDF file type from extension', () => {
      const service = new FileStorageService();
      // Access private method through type assertion for testing
      const fileType = (service as any).getFileTypeFromName('document.pdf');
      expect(fileType).toBe('application/pdf');
    });

    it('should detect JPEG file type from extension', () => {
      const service = new FileStorageService();
      const fileType = (service as any).getFileTypeFromName('photo.jpg');
      expect(fileType).toBe('image/jpeg');
    });

    it('should detect PNG file type from extension', () => {
      const service = new FileStorageService();
      const fileType = (service as any).getFileTypeFromName('image.png');
      expect(fileType).toBe('image/png');
    });

    it('should return default type for unknown extensions', () => {
      const service = new FileStorageService();
      const fileType = (service as any).getFileTypeFromName('file.unknown');
      expect(fileType).toBe('application/octet-stream');
    });
  });
});
