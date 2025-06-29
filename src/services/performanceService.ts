import { supabase } from '../lib/supabase';

export interface PerformanceMetrics {
  pageLoadTime: number;
  dbQueryTime: number;
  apiResponseTime: number;
  totalOrdersLoaded: number;
  errorRate: number;
  cacheHitRate: number;
  timestamp: string;
}

export interface PerformanceBenchmarks {
  current: PerformanceMetrics;
  target: PerformanceMetrics;
  status: 'excellent' | 'good' | 'needs_improvement' | 'critical';
}

export class PerformanceService {
  private static readonly CACHE_TTL = 5 * 60 * 1000; // 5 minutes
  private static readonly MAX_RETRIES = 3;
  private static readonly RETRY_DELAY = 1000; // 1 second
  
  private static cache = new Map<string, { data: any; timestamp: number }>();
  private static metrics: PerformanceMetrics[] = [];

  // Performance targets (in milliseconds)
  private static readonly TARGETS = {
    pageLoadTime: 2000,      // 2 seconds
    dbQueryTime: 500,        // 500ms
    apiResponseTime: 1000,   // 1 second
    errorRate: 0.01,         // 1%
    cacheHitRate: 0.8        // 80%
  };

  static startTimer(): number {
    return performance.now();
  }

  static endTimer(startTime: number): number {
    return performance.now() - startTime;
  }

  static async measureQuery<T>(
    queryFn: () => Promise<T>,
    queryName: string
  ): Promise<{ data: T; metrics: { queryTime: number; success: boolean } }> {
    const startTime = this.startTimer();
    let success = false;
    let data: T;

    try {
      console.log(`🔍 [PERF] Starting query: ${queryName}`);
      data = await queryFn();
      success = true;
      
      const queryTime = this.endTimer(startTime);
      console.log(`✅ [PERF] Query completed: ${queryName} in ${queryTime.toFixed(2)}ms`);
      
      return {
        data,
        metrics: { queryTime, success }
      };
    } catch (error) {
      const queryTime = this.endTimer(startTime);
      console.error(`❌ [PERF] Query failed: ${queryName} in ${queryTime.toFixed(2)}ms`, error);
      
      throw error;
    }
  }

  static async withRetry<T>(
    operation: () => Promise<T>,
    operationName: string,
    maxRetries: number = this.MAX_RETRIES
  ): Promise<T> {
    let lastError: Error;
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        console.log(`🔄 [RETRY] Attempt ${attempt}/${maxRetries} for ${operationName}`);
        return await operation();
      } catch (error) {
        lastError = error as Error;
        console.warn(`⚠️ [RETRY] Attempt ${attempt} failed for ${operationName}:`, error);
        
        if (attempt < maxRetries) {
          const delay = this.RETRY_DELAY * Math.pow(2, attempt - 1); // Exponential backoff
          console.log(`⏳ [RETRY] Waiting ${delay}ms before retry...`);
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    }
    
    console.error(`❌ [RETRY] All attempts failed for ${operationName}`);
    throw lastError!;
  }

  static getCacheKey(userId: string, filters?: any): string {
    const filterStr = filters ? JSON.stringify(filters) : '';
    return `orders_${userId}_${filterStr}`;
  }

  static getFromCache<T>(key: string): T | null {
    const cached = this.cache.get(key);
    if (!cached) return null;
    
    const isExpired = Date.now() - cached.timestamp > this.CACHE_TTL;
    if (isExpired) {
      this.cache.delete(key);
      return null;
    }
    
    console.log(`🎯 [CACHE] Cache hit for key: ${key}`);
    return cached.data;
  }

  static setCache<T>(key: string, data: T): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now()
    });
    console.log(`💾 [CACHE] Cached data for key: ${key}`);
  }

  static clearCache(pattern?: string): void {
    if (pattern) {
      for (const key of this.cache.keys()) {
        if (key.includes(pattern)) {
          this.cache.delete(key);
        }
      }
      console.log(`🗑️ [CACHE] Cleared cache entries matching: ${pattern}`);
    } else {
      this.cache.clear();
      console.log(`🗑️ [CACHE] Cleared all cache`);
    }
  }

  static recordMetrics(metrics: Partial<PerformanceMetrics>): void {
    const fullMetrics: PerformanceMetrics = {
      pageLoadTime: 0,
      dbQueryTime: 0,
      apiResponseTime: 0,
      totalOrdersLoaded: 0,
      errorRate: 0,
      cacheHitRate: 0,
      timestamp: new Date().toISOString(),
      ...metrics
    };

    this.metrics.push(fullMetrics);
    
    // Keep only last 100 metrics
    if (this.metrics.length > 100) {
      this.metrics = this.metrics.slice(-100);
    }

    console.log(`📊 [METRICS] Recorded:`, fullMetrics);
  }

  static getPerformanceBenchmarks(): PerformanceBenchmarks {
    const recent = this.metrics.slice(-10);
    if (recent.length === 0) {
      return {
        current: {
          pageLoadTime: 0,
          dbQueryTime: 0,
          apiResponseTime: 0,
          totalOrdersLoaded: 0,
          errorRate: 0,
          cacheHitRate: 0,
          timestamp: new Date().toISOString()
        },
        target: {
          pageLoadTime: this.TARGETS.pageLoadTime,
          dbQueryTime: this.TARGETS.dbQueryTime,
          apiResponseTime: this.TARGETS.apiResponseTime,
          totalOrdersLoaded: 50,
          errorRate: this.TARGETS.errorRate,
          cacheHitRate: this.TARGETS.cacheHitRate,
          timestamp: new Date().toISOString()
        },
        status: 'needs_improvement'
      };
    }

    const avg = (arr: number[]) => arr.reduce((a, b) => a + b, 0) / arr.length;

    const current: PerformanceMetrics = {
      pageLoadTime: avg(recent.map(m => m.pageLoadTime)),
      dbQueryTime: avg(recent.map(m => m.dbQueryTime)),
      apiResponseTime: avg(recent.map(m => m.apiResponseTime)),
      totalOrdersLoaded: avg(recent.map(m => m.totalOrdersLoaded)),
      errorRate: avg(recent.map(m => m.errorRate)),
      cacheHitRate: avg(recent.map(m => m.cacheHitRate)),
      timestamp: new Date().toISOString()
    };

    const target: PerformanceMetrics = {
      pageLoadTime: this.TARGETS.pageLoadTime,
      dbQueryTime: this.TARGETS.dbQueryTime,
      apiResponseTime: this.TARGETS.apiResponseTime,
      totalOrdersLoaded: 50,
      errorRate: this.TARGETS.errorRate,
      cacheHitRate: this.TARGETS.cacheHitRate,
      timestamp: new Date().toISOString()
    };

    // Determine status based on how many metrics meet targets
    const meetsTargets = [
      current.pageLoadTime <= target.pageLoadTime,
      current.dbQueryTime <= target.dbQueryTime,
      current.apiResponseTime <= target.apiResponseTime,
      current.errorRate <= target.errorRate,
      current.cacheHitRate >= target.cacheHitRate
    ].filter(Boolean).length;

    let status: PerformanceBenchmarks['status'];
    if (meetsTargets >= 5) status = 'excellent';
    else if (meetsTargets >= 4) status = 'good';
    else if (meetsTargets >= 2) status = 'needs_improvement';
    else status = 'critical';

    return { current, target, status };
  }

  static async analyzeBottlenecks(): Promise<{
    bottlenecks: Array<{
      area: string;
      severity: 'low' | 'medium' | 'high' | 'critical';
      description: string;
      recommendation: string;
    }>;
    summary: string;
  }> {
    const benchmarks = this.getPerformanceBenchmarks();
    const { current, target } = benchmarks;
    
    const bottlenecks = [];

    // Analyze page load time
    if (current.pageLoadTime > target.pageLoadTime * 1.5) {
      bottlenecks.push({
        area: 'Page Load Time',
        severity: 'high' as const,
        description: `Page loads in ${current.pageLoadTime.toFixed(0)}ms, target is ${target.pageLoadTime}ms`,
        recommendation: 'Implement code splitting, lazy loading, and reduce bundle size'
      });
    }

    // Analyze database query time
    if (current.dbQueryTime > target.dbQueryTime * 2) {
      bottlenecks.push({
        area: 'Database Queries',
        severity: 'critical' as const,
        description: `DB queries take ${current.dbQueryTime.toFixed(0)}ms, target is ${target.dbQueryTime}ms`,
        recommendation: 'Add database indexes, optimize queries, implement pagination'
      });
    }

    // Analyze API response time
    if (current.apiResponseTime > target.apiResponseTime * 1.5) {
      bottlenecks.push({
        area: 'API Response Time',
        severity: 'high' as const,
        description: `API responses take ${current.apiResponseTime.toFixed(0)}ms, target is ${target.apiResponseTime}ms`,
        recommendation: 'Implement response caching, optimize serialization, use CDN'
      });
    }

    // Analyze error rate
    if (current.errorRate > target.errorRate * 5) {
      bottlenecks.push({
        area: 'Error Rate',
        severity: 'critical' as const,
        description: `Error rate is ${(current.errorRate * 100).toFixed(1)}%, target is ${(target.errorRate * 100).toFixed(1)}%`,
        recommendation: 'Implement better error handling, retry logic, and connection pooling'
      });
    }

    // Analyze cache hit rate
    if (current.cacheHitRate < target.cacheHitRate * 0.7) {
      bottlenecks.push({
        area: 'Cache Performance',
        severity: 'medium' as const,
        description: `Cache hit rate is ${(current.cacheHitRate * 100).toFixed(1)}%, target is ${(target.cacheHitRate * 100).toFixed(1)}%`,
        recommendation: 'Optimize cache strategy, increase TTL for stable data, implement cache warming'
      });
    }

    const summary = bottlenecks.length === 0 
      ? 'System performance is within acceptable parameters'
      : `Found ${bottlenecks.length} performance issues requiring attention`;

    return { bottlenecks, summary };
  }

  static generateOptimizationReport(): {
    currentMetrics: PerformanceMetrics;
    targetMetrics: PerformanceMetrics;
    recommendations: Array<{
      priority: 'high' | 'medium' | 'low';
      category: string;
      action: string;
      expectedImprovement: string;
      effort: 'low' | 'medium' | 'high';
    }>;
  } {
    const benchmarks = this.getPerformanceBenchmarks();
    
    const recommendations = [
      {
        priority: 'high' as const,
        category: 'Database Optimization',
        action: 'Add composite indexes on orders table for user_id + created_at',
        expectedImprovement: '50-70% reduction in query time',
        effort: 'low' as const
      },
      {
        priority: 'high' as const,
        category: 'Caching Strategy',
        action: 'Implement Redis cache for frequently accessed order data',
        expectedImprovement: '80% reduction in API response time for cached data',
        effort: 'medium' as const
      },
      {
        priority: 'medium' as const,
        category: 'Query Optimization',
        action: 'Implement pagination with cursor-based navigation',
        expectedImprovement: '60% reduction in initial load time',
        effort: 'medium' as const
      },
      {
        priority: 'medium' as const,
        category: 'Error Handling',
        action: 'Add exponential backoff retry logic with circuit breaker',
        expectedImprovement: '90% reduction in timeout errors',
        effort: 'low' as const
      },
      {
        priority: 'low' as const,
        category: 'Frontend Optimization',
        action: 'Implement virtual scrolling for large order lists',
        expectedImprovement: '40% improvement in rendering performance',
        effort: 'high' as const
      }
    ];

    return {
      currentMetrics: benchmarks.current,
      targetMetrics: benchmarks.target,
      recommendations
    };
  }
}