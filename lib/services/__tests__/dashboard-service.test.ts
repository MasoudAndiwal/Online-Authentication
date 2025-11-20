import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { DashboardService } from '../dashboard-service';
import { CacheService } from '../cache-service';
import { supabase } from '../../supabase';

/**
 * Unit tests for DashboardService
 * Tests cache-first strategy, background refresh, and cache invalidation
 */

// Mock Supabase
vi.mock('../../supabase', () => ({
  supabase: {
    from: vi.fn(),
  },
}));

describe('DashboardService', () => {
  let dashboardService: DashboardService;
  let mockCache: Partial<CacheService>;

  beforeEach(() => {
    // Create mock cache service
    mockCache = {
      get: vi.fn(),
      set: vi.fn(),
      delete: vi.fn(),
      deletePattern: vi.fn(),
      ttl: vi.fn(),
      keys: vi.fn(),
    };

    // Create dashboard service with mock cache
    dashboardService = new DashboardService(mockCache as CacheService);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('getStudentMetrics', () => {
    it('should return cached metrics when available and fresh', async () => {
      const studentId = 'test-student-123';
      const cachedMetrics = {
        totalClasses: 100,
        attendanceRate: 85.5,
        presentDays: 85,
        absentDays: 10,
        sickDays: 3,
        leaveDays: 2,
        classAverage: 82.0,
        ranking: 5,
        trend: 'improving' as const,
        lastUpdated: new Date(),
      };

      // Mock cache hit with fresh data (TTL > 60)
      vi.mocked(mockCache.get).mockResolvedValue(cachedMetrics);
      vi.mocked(mockCache.ttl).mockResolvedValue(120);

      const result = await dashboardService.getStudentMetrics(studentId);

      expect(result).toEqual(cachedMetrics);
      expect(mockCache.get).toHaveBeenCalledWith(`metrics:student:${studentId}`);
      expect(mockCache.set).not.toHaveBeenCalled();
    });

    it('should serve stale data and trigger background refresh when TTL < 60', async () => {
      const studentId = 'test-student-456';
      const staleMetrics = {
        totalClasses: 100,
        attendanceRate: 85.5,
        presentDays: 85,
        absentDays: 10,
        sickDays: 3,
        leaveDays: 2,
        classAverage: 82.0,
        ranking: 5,
        trend: 'stable' as const,
        lastUpdated: new Date(),
      };

      // Mock cache hit with stale data (TTL < 60)
      vi.mocked(mockCache.get).mockResolvedValue(staleMetrics);
      vi.mocked(mockCache.ttl).mockResolvedValue(30);

      // Mock database query for background refresh
      const mockFrom = vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            order: vi.fn().mockResolvedValue({
              data: [],
              error: null,
            }),
          }),
        }),
      });
      vi.mocked(supabase.from).mockImplementation(mockFrom);

      const result = await dashboardService.getStudentMetrics(studentId);

      // Should return stale data immediately
      expect(result).toEqual(staleMetrics);
      expect(mockCache.get).toHaveBeenCalledWith(`metrics:student:${studentId}`);
      expect(mockCache.ttl).toHaveBeenCalledWith(`metrics:student:${studentId}`);

      // Background refresh should be triggered (but we can't easily test async fire-and-forget)
    });

    it('should fetch from database and cache on cache miss', async () => {
      const studentId = 'test-student-789';

      // Mock cache miss
      vi.mocked(mockCache.get).mockResolvedValue(null);

      // Mock database queries
      const mockAttendanceQuery = {
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            order: vi.fn().mockResolvedValue({
              data: [
                { status: 'PRESENT', date: '2024-01-01' },
                { status: 'PRESENT', date: '2024-01-02' },
                { status: 'ABSENT', date: '2024-01-03' },
              ],
              error: null,
            }),
          }),
        }),
      };

      const mockStudentQuery = {
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: { class_section: 'CS-101' },
              error: null,
            }),
          }),
        }),
      };

      const mockClassStatsQuery = {
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: null,
              error: { message: 'Not found' },
            }),
          }),
        }),
      };

      const mockClassStudentsQuery = {
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockResolvedValue({
            data: [{ id: studentId }],
            error: null,
          }),
        }),
      };

      const mockRankingAttendanceQuery = {
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockResolvedValue({
            data: [
              { status: 'PRESENT' },
              { status: 'PRESENT' },
            ],
            error: null,
          }),
        }),
      };

      let callCount = 0;
      vi.mocked(supabase.from).mockImplementation((table: string) => {
        if (table === 'attendance_records') {
          callCount++;
          // First call is for main metrics, subsequent calls are for ranking
          if (callCount === 1) return mockAttendanceQuery as any;
          return mockRankingAttendanceQuery as any;
        }
        if (table === 'students') {
          // Return different mocks for different queries
          return {
            select: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                single: vi.fn().mockResolvedValue({
                  data: { class_section: 'CS-101' },
                  error: null,
                }),
                data: [{ id: studentId }],
                error: null,
              }),
            }),
          } as any;
        }
        if (table === 'class_statistics') return mockClassStatsQuery as any;
        return mockClassStudentsQuery as unknown;
      });

      const result = await dashboardService.getStudentMetrics(studentId);

      expect(result).toBeDefined();
      expect(result.totalClasses).toBe(3);
      expect(result.presentDays).toBe(2);
      expect(result.absentDays).toBe(1);
      expect(mockCache.set).toHaveBeenCalled();
    });
  });

  describe('invalidateStudentCache', () => {
    it('should delete all student-related cache entries', async () => {
      const studentId = 'test-student-123';

      vi.mocked(mockCache.delete).mockResolvedValue(1);
      vi.mocked(mockCache.deletePattern).mockResolvedValue(3);

      await dashboardService.invalidateStudentCache(studentId);

      expect(mockCache.delete).toHaveBeenCalledWith(`metrics:student:${studentId}`);
      expect(mockCache.delete).toHaveBeenCalledWith(`attendance:student:${studentId}:history`);
      expect(mockCache.deletePattern).toHaveBeenCalledWith(`attendance:student:${studentId}:week:*`);
    });
  });

  describe('invalidateClassCache', () => {
    it('should delete all class-related cache entries', async () => {
      const classId = 'CS-101';

      vi.mocked(mockCache.delete).mockResolvedValue(1);
      vi.mocked(mockCache.deletePattern).mockResolvedValue(5);

      await dashboardService.invalidateClassCache(classId);

      expect(mockCache.delete).toHaveBeenCalledWith(`metrics:class:${classId}:average`);
      expect(mockCache.delete).toHaveBeenCalledWith(`metrics:class:${classId}:stats`);
      expect(mockCache.deletePattern).toHaveBeenCalledWith(`metrics:class:${classId}:rank:*`);
    });
  });

  describe('invalidateAttendanceUpdate', () => {
    it('should invalidate both student and class caches', async () => {
      const studentId = 'test-student-123';
      const classId = 'CS-101';

      vi.mocked(mockCache.delete).mockResolvedValue(1);
      vi.mocked(mockCache.deletePattern).mockResolvedValue(3);

      await dashboardService.invalidateAttendanceUpdate(studentId, classId);

      // Should call both invalidation methods
      expect(mockCache.delete).toHaveBeenCalledWith(`metrics:student:${studentId}`);
      expect(mockCache.delete).toHaveBeenCalledWith(`metrics:class:${classId}:average`);
    });
  });

  describe('isCacheStale', () => {
    it('should return isStale=true when TTL < threshold', async () => {
      const cacheKey = 'test-key';

      vi.mocked(mockCache.ttl).mockResolvedValue(30);

      const result = await dashboardService.isCacheStale(cacheKey, 60);

      expect(result.isStale).toBe(true);
      expect(result.ttl).toBe(30);
      expect(result.exists).toBe(true);
    });

    it('should return isStale=false when TTL > threshold', async () => {
      const cacheKey = 'test-key';

      vi.mocked(mockCache.ttl).mockResolvedValue(120);

      const result = await dashboardService.isCacheStale(cacheKey, 60);

      expect(result.isStale).toBe(false);
      expect(result.ttl).toBe(120);
      expect(result.exists).toBe(true);
    });

    it('should return exists=false when key does not exist', async () => {
      const cacheKey = 'test-key';

      vi.mocked(mockCache.ttl).mockResolvedValue(-2);

      const result = await dashboardService.isCacheStale(cacheKey, 60);

      expect(result.exists).toBe(false);
      expect(result.ttl).toBe(-2);
    });
  });
});
