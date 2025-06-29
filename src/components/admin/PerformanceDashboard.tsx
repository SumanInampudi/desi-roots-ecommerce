import React, { useState, useEffect } from 'react';
import { 
  Activity, 
  Clock, 
  Database, 
  Server, 
  AlertTriangle, 
  CheckCircle, 
  TrendingUp,
  TrendingDown,
  RefreshCw,
  BarChart3,
  Zap,
  Target,
  Lightbulb,
  ArrowRight
} from 'lucide-react';
import { PerformanceService } from '../../services/performanceService';
import AdminLayout from './AdminLayout';

const PerformanceDashboard: React.FC = () => {
  const [benchmarks, setBenchmarks] = useState<any>(null);
  const [bottlenecks, setBottlenecks] = useState<any>(null);
  const [optimizationReport, setOptimizationReport] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const loadPerformanceData = async () => {
    setLoading(true);
    try {
      const [benchmarksData, bottlenecksData, reportData] = await Promise.all([
        Promise.resolve(PerformanceService.getPerformanceBenchmarks()),
        PerformanceService.analyzeBottlenecks(),
        Promise.resolve(PerformanceService.generateOptimizationReport())
      ]);

      setBenchmarks(benchmarksData);
      setBottlenecks(bottlenecksData);
      setOptimizationReport(reportData);
    } catch (error) {
      console.error('Error loading performance data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPerformanceData();
    
    // Auto-refresh every 30 seconds
    const interval = setInterval(loadPerformanceData, 30000);
    return () => clearInterval(interval);
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'excellent': return 'text-green-600 bg-green-100';
      case 'good': return 'text-blue-600 bg-blue-100';
      case 'needs_improvement': return 'text-yellow-600 bg-yellow-100';
      case 'critical': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'low': return 'text-green-600 bg-green-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'high': return 'text-orange-600 bg-orange-100';
      case 'critical': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-500 text-white';
      case 'medium': return 'bg-yellow-500 text-white';
      case 'low': return 'bg-green-500 text-white';
      default: return 'bg-gray-500 text-white';
    }
  };

  const getEffortColor = (effort: string) => {
    switch (effort) {
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'high': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const formatTime = (ms: number) => {
    if (ms < 1000) return `${ms.toFixed(0)}ms`;
    return `${(ms / 1000).toFixed(1)}s`;
  };

  const formatPercentage = (value: number) => {
    return `${(value * 100).toFixed(1)}%`;
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading performance data...</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Performance Dashboard</h1>
            <p className="text-gray-600 mt-1">Monitor and optimize system performance</p>
          </div>
          <button
            onClick={loadPerformanceData}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors duration-200"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Refresh</span>
          </button>
        </div>

        {/* Overall Status */}
        {benchmarks && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900">System Status</h2>
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(benchmarks.status)}`}>
                {benchmarks.status === 'excellent' && <CheckCircle className="w-4 h-4 mr-1" />}
                {benchmarks.status === 'critical' && <AlertTriangle className="w-4 h-4 mr-1" />}
                {benchmarks.status.replace('_', ' ').toUpperCase()}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Page Load Time */}
              <div className="text-center">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                  <Clock className="w-6 h-6 text-blue-600" />
                </div>
                <h3 className="font-medium text-gray-900 mb-1">Page Load Time</h3>
                <div className="text-2xl font-bold text-gray-900">
                  {formatTime(benchmarks.current.pageLoadTime)}
                </div>
                <div className="text-sm text-gray-500">
                  Target: {formatTime(benchmarks.target.pageLoadTime)}
                </div>
                {benchmarks.current.pageLoadTime <= benchmarks.target.pageLoadTime ? (
                  <TrendingUp className="w-4 h-4 text-green-500 mx-auto mt-1" />
                ) : (
                  <TrendingDown className="w-4 h-4 text-red-500 mx-auto mt-1" />
                )}
              </div>

              {/* Database Query Time */}
              <div className="text-center">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                  <Database className="w-6 h-6 text-purple-600" />
                </div>
                <h3 className="font-medium text-gray-900 mb-1">DB Query Time</h3>
                <div className="text-2xl font-bold text-gray-900">
                  {formatTime(benchmarks.current.dbQueryTime)}
                </div>
                <div className="text-sm text-gray-500">
                  Target: {formatTime(benchmarks.target.dbQueryTime)}
                </div>
                {benchmarks.current.dbQueryTime <= benchmarks.target.dbQueryTime ? (
                  <TrendingUp className="w-4 h-4 text-green-500 mx-auto mt-1" />
                ) : (
                  <TrendingDown className="w-4 h-4 text-red-500 mx-auto mt-1" />
                )}
              </div>

              {/* API Response Time */}
              <div className="text-center">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                  <Server className="w-6 h-6 text-green-600" />
                </div>
                <h3 className="font-medium text-gray-900 mb-1">API Response</h3>
                <div className="text-2xl font-bold text-gray-900">
                  {formatTime(benchmarks.current.apiResponseTime)}
                </div>
                <div className="text-sm text-gray-500">
                  Target: {formatTime(benchmarks.target.apiResponseTime)}
                </div>
                {benchmarks.current.apiResponseTime <= benchmarks.target.apiResponseTime ? (
                  <TrendingUp className="w-4 h-4 text-green-500 mx-auto mt-1" />
                ) : (
                  <TrendingDown className="w-4 h-4 text-red-500 mx-auto mt-1" />
                )}
              </div>

              {/* Cache Hit Rate */}
              <div className="text-center">
                <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                  <Zap className="w-6 h-6 text-orange-600" />
                </div>
                <h3 className="font-medium text-gray-900 mb-1">Cache Hit Rate</h3>
                <div className="text-2xl font-bold text-gray-900">
                  {formatPercentage(benchmarks.current.cacheHitRate)}
                </div>
                <div className="text-sm text-gray-500">
                  Target: {formatPercentage(benchmarks.target.cacheHitRate)}
                </div>
                {benchmarks.current.cacheHitRate >= benchmarks.target.cacheHitRate ? (
                  <TrendingUp className="w-4 h-4 text-green-500 mx-auto mt-1" />
                ) : (
                  <TrendingDown className="w-4 h-4 text-red-500 mx-auto mt-1" />
                )}
              </div>
            </div>
          </div>
        )}

        {/* Bottlenecks Analysis */}
        {bottlenecks && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center space-x-2 mb-4">
              <Activity className="w-5 h-5 text-red-600" />
              <h2 className="text-xl font-semibold text-gray-900">Performance Bottlenecks</h2>
            </div>

            <p className="text-gray-600 mb-6">{bottlenecks.summary}</p>

            {bottlenecks.bottlenecks.length > 0 ? (
              <div className="space-y-4">
                {bottlenecks.bottlenecks.map((bottleneck: any, index: number) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-medium text-gray-900">{bottleneck.area}</h3>
                      <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${getSeverityColor(bottleneck.severity)}`}>
                        {bottleneck.severity.toUpperCase()}
                      </span>
                    </div>
                    <p className="text-gray-600 text-sm mb-2">{bottleneck.description}</p>
                    <div className="bg-blue-50 border border-blue-200 rounded p-3">
                      <p className="text-blue-800 text-sm">
                        <strong>Recommendation:</strong> {bottleneck.recommendation}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Critical Bottlenecks</h3>
                <p className="text-gray-600">System performance is within acceptable parameters</p>
              </div>
            )}
          </div>
        )}

        {/* Optimization Recommendations */}
        {optimizationReport && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center space-x-2 mb-6">
              <Lightbulb className="w-5 h-5 text-amber-500" />
              <h2 className="text-xl font-semibold text-gray-900">Optimization Recommendations</h2>
            </div>

            <div className="space-y-4">
              {optimizationReport.recommendations.map((rec: any, index: number) => (
                <div key={index} className="group relative overflow-hidden border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-all duration-300 hover:border-gray-300 bg-gradient-to-br from-white to-gray-50">
                  {/* Priority Badge */}
                  <div className="absolute top-4 right-4">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${getPriorityColor(rec.priority)} shadow-sm`}>
                      {rec.priority} Priority
                    </span>
                  </div>

                  {/* Category and Icon */}
                  <div className="flex items-start space-x-4 mb-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                      <Target className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">{rec.category}</h3>
                        <span className={`inline-flex items-center px-2 py-1 rounded-lg text-xs font-medium border ${getEffortColor(rec.effort)}`}>
                          {rec.effort.toUpperCase()} EFFORT
                        </span>
                      </div>
                      <p className="text-gray-700 leading-relaxed">{rec.action}</p>
                    </div>
                  </div>

                  {/* Expected Improvement */}
                  <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg p-4 mb-4">
                    <div className="flex items-center space-x-2">
                      <TrendingUp className="w-5 h-5 text-green-600" />
                      <span className="text-sm font-medium text-green-900">Expected Improvement</span>
                    </div>
                    <p className="text-green-800 font-semibold mt-1">{rec.expectedImprovement}</p>
                  </div>

                  {/* Action Button */}
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-gray-500">
                      Implementation effort: <span className="font-medium">{rec.effort}</span>
                    </div>
                    <button className="inline-flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-all duration-200 transform hover:scale-105 shadow-sm hover:shadow-md">
                      <span>Learn More</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Hover Effect Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none rounded-xl"></div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Performance Targets vs Current */}
        {optimizationReport && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Current vs Target Metrics</h2>
            
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Metric
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Current
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Target
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  <tr>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      Page Load Time
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatTime(optimizationReport.currentMetrics.pageLoadTime)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatTime(optimizationReport.targetMetrics.pageLoadTime)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {optimizationReport.currentMetrics.pageLoadTime <= optimizationReport.targetMetrics.pageLoadTime ? (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          <CheckCircle className="w-3 h-3 mr-1" />
                          On Target
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                          <AlertTriangle className="w-3 h-3 mr-1" />
                          Needs Improvement
                        </span>
                      )}
                    </td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      Database Query Time
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatTime(optimizationReport.currentMetrics.dbQueryTime)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatTime(optimizationReport.targetMetrics.dbQueryTime)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {optimizationReport.currentMetrics.dbQueryTime <= optimizationReport.targetMetrics.dbQueryTime ? (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          <CheckCircle className="w-3 h-3 mr-1" />
                          On Target
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                          <AlertTriangle className="w-3 h-3 mr-1" />
                          Needs Improvement
                        </span>
                      )}
                    </td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      API Response Time
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatTime(optimizationReport.currentMetrics.apiResponseTime)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatTime(optimizationReport.targetMetrics.apiResponseTime)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {optimizationReport.currentMetrics.apiResponseTime <= optimizationReport.targetMetrics.apiResponseTime ? (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          <CheckCircle className="w-3 h-3 mr-1" />
                          On Target
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                          <AlertTriangle className="w-3 h-3 mr-1" />
                          Needs Improvement
                        </span>
                      )}
                    </td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      Cache Hit Rate
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatPercentage(optimizationReport.currentMetrics.cacheHitRate)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatPercentage(optimizationReport.targetMetrics.cacheHitRate)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {optimizationReport.currentMetrics.cacheHitRate >= optimizationReport.targetMetrics.cacheHitRate ? (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          <CheckCircle className="w-3 h-3 mr-1" />
                          On Target
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                          <AlertTriangle className="w-3 h-3 mr-1" />
                          Needs Improvement
                        </span>
                      )}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default PerformanceDashboard;