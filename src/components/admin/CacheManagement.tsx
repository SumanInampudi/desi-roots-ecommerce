import React, { useState, useEffect } from 'react';
import { 
  Database, 
  Trash2, 
  RefreshCw, 
  Activity, 
  Clock, 
  HardDrive,
  Zap,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  BarChart3,
  Settings,
  Tag
} from 'lucide-react';
import { redisCache, CacheKeys, CacheTags } from '../../services/cacheService';

interface CacheManagementProps {
  onClose?: () => void;
}

const CacheManagement: React.FC<CacheManagementProps> = ({ onClose }) => {
  const [cacheInfo, setCacheInfo] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [selectedKeys, setSelectedKeys] = useState<string[]>([]);
  const [keyPattern, setKeyPattern] = useState('');
  const [availableKeys, setAvailableKeys] = useState<string[]>([]);

  const loadCacheInfo = async () => {
    setLoading(true);
    try {
      const info = redisCache.info();
      setCacheInfo(info);
      
      // Load available keys
      const keys = redisCache.keys();
      setAvailableKeys(keys);
    } catch (error) {
      console.error('Error loading cache info:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCacheInfo();
    
    // Auto-refresh every 5 seconds
    const interval = setInterval(loadCacheInfo, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleFlushAll = () => {
    if (confirm('Are you sure you want to clear all cache? This action cannot be undone.')) {
      redisCache.flushall();
      loadCacheInfo();
    }
  };

  const handleDeleteSelected = () => {
    if (selectedKeys.length === 0) return;
    
    if (confirm(`Are you sure you want to delete ${selectedKeys.length} cache entries?`)) {
      selectedKeys.forEach(key => redisCache.del(key));
      setSelectedKeys([]);
      loadCacheInfo();
    }
  };

  const handleInvalidateByTag = (tag: string) => {
    if (confirm(`Are you sure you want to invalidate all cache entries with tag "${tag}"?`)) {
      const deletedCount = redisCache.invalidateByTag(tag);
      alert(`Invalidated ${deletedCount} cache entries`);
      loadCacheInfo();
    }
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatPercentage = (value: number) => {
    return `${(value * 100).toFixed(1)}%`;
  };

  const getHealthStatus = () => {
    if (!cacheInfo) return { status: 'unknown', color: 'gray' };
    
    const hitRate = cacheInfo.hitRate;
    const memoryUsage = cacheInfo.totalMemoryUsage;
    const maxMemory = cacheInfo.config.maxMemoryMB * 1024 * 1024;
    const memoryPercent = memoryUsage / maxMemory;
    
    if (hitRate >= 0.8 && memoryPercent < 0.8) {
      return { status: 'excellent', color: 'green' };
    } else if (hitRate >= 0.6 && memoryPercent < 0.9) {
      return { status: 'good', color: 'blue' };
    } else if (hitRate >= 0.4 || memoryPercent < 0.95) {
      return { status: 'warning', color: 'yellow' };
    } else {
      return { status: 'critical', color: 'red' };
    }
  };

  const filteredKeys = availableKeys.filter(key => 
    keyPattern === '' || key.toLowerCase().includes(keyPattern.toLowerCase())
  );

  const health = getHealthStatus();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Database className="w-6 h-6 text-blue-600" />
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Cache Management</h2>
            <p className="text-sm text-gray-600">Monitor and manage Redis-like cache performance</p>
          </div>
        </div>
        <button
          onClick={loadCacheInfo}
          disabled={loading}
          className="flex items-center space-x-2 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm transition-colors duration-200"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh</span>
        </button>
      </div>

      {/* Cache Health Status */}
      {cacheInfo && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Cache Health</h3>
            <div className="flex items-center space-x-2">
              {health.status === 'excellent' && <CheckCircle className="w-5 h-5 text-green-600" />}
              {health.status === 'good' && <CheckCircle className="w-5 h-5 text-blue-600" />}
              {health.status === 'warning' && <AlertTriangle className="w-5 h-5 text-yellow-600" />}
              {health.status === 'critical' && <AlertTriangle className="w-5 h-5 text-red-600" />}
              <span className={`text-sm font-medium text-${health.color}-600 capitalize`}>
                {health.status}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {/* Hit Rate */}
            <div className="text-center">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                <TrendingUp className="w-6 h-6 text-green-600" />
              </div>
              <div className="text-2xl font-bold text-gray-900">
                {formatPercentage(cacheInfo.hitRate)}
              </div>
              <div className="text-sm text-gray-600">Hit Rate</div>
              <div className="text-xs text-gray-500 mt-1">
                {cacheInfo.totalHits} hits / {cacheInfo.totalMisses} misses
              </div>
            </div>

            {/* Memory Usage */}
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                <HardDrive className="w-6 h-6 text-blue-600" />
              </div>
              <div className="text-2xl font-bold text-gray-900">
                {formatBytes(cacheInfo.totalMemoryUsage)}
              </div>
              <div className="text-sm text-gray-600">Memory Used</div>
              <div className="text-xs text-gray-500 mt-1">
                Limit: {cacheInfo.config.maxMemoryMB}MB
              </div>
            </div>

            {/* Total Keys */}
            <div className="text-center">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                <Database className="w-6 h-6 text-purple-600" />
              </div>
              <div className="text-2xl font-bold text-gray-900">
                {cacheInfo.totalKeys}
              </div>
              <div className="text-sm text-gray-600">Total Keys</div>
              <div className="text-xs text-gray-500 mt-1">
                Max: {cacheInfo.config.maxKeys}
              </div>
            </div>

            {/* Evictions */}
            <div className="text-center">
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                <Activity className="w-6 h-6 text-orange-600" />
              </div>
              <div className="text-2xl font-bold text-gray-900">
                {cacheInfo.evictionCount}
              </div>
              <div className="text-sm text-gray-600">Evictions</div>
              <div className="text-xs text-gray-500 mt-1">
                Policy: {cacheInfo.config.evictionPolicy}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Cache Configuration */}
      {cacheInfo && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center space-x-2 mb-4">
            <Settings className="w-5 h-5 text-gray-600" />
            <h3 className="text-lg font-semibold text-gray-900">Configuration</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="text-sm font-medium text-gray-700">Max Memory</div>
              <div className="text-lg font-bold text-gray-900">{cacheInfo.config.maxMemoryMB}MB</div>
            </div>
            
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="text-sm font-medium text-gray-700">Default TTL</div>
              <div className="text-lg font-bold text-gray-900">{Math.round(cacheInfo.config.defaultTTL / 1000)}s</div>
            </div>
            
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="text-sm font-medium text-gray-700">Max Keys</div>
              <div className="text-lg font-bold text-gray-900">{cacheInfo.config.maxKeys}</div>
            </div>
            
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="text-sm font-medium text-gray-700">Eviction Policy</div>
              <div className="text-lg font-bold text-gray-900">{cacheInfo.config.evictionPolicy}</div>
            </div>
            
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="text-sm font-medium text-gray-700">Compression</div>
              <div className="text-lg font-bold text-gray-900">
                {cacheInfo.config.compressionEnabled ? 'Enabled' : 'Disabled'}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tag-based Invalidation */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center space-x-2 mb-4">
          <Tag className="w-5 h-5 text-gray-600" />
          <h3 className="text-lg font-semibold text-gray-900">Tag-based Cache Invalidation</h3>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {Object.values(CacheTags).map((tag) => (
            <button
              key={tag}
              onClick={() => handleInvalidateByTag(tag)}
              className="flex items-center justify-center space-x-2 px-3 py-2 bg-red-100 hover:bg-red-200 text-red-700 rounded-lg text-sm font-medium transition-colors duration-200"
            >
              <Tag className="w-4 h-4" />
              <span>{tag}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Cache Keys Management */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Cache Keys</h3>
          <div className="flex items-center space-x-3">
            <input
              type="text"
              placeholder="Filter keys..."
              value={keyPattern}
              onChange={(e) => setKeyPattern(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            {selectedKeys.length > 0 && (
              <button
                onClick={handleDeleteSelected}
                className="flex items-center space-x-2 px-3 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm transition-colors duration-200"
              >
                <Trash2 className="w-4 h-4" />
                <span>Delete ({selectedKeys.length})</span>
              </button>
            )}
          </div>
        </div>

        <div className="max-h-64 overflow-y-auto border border-gray-200 rounded-lg">
          {filteredKeys.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              {keyPattern ? 'No keys match the filter' : 'No cache keys found'}
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {filteredKeys.map((key) => {
                const ttl = redisCache.ttl(key);
                const isSelected = selectedKeys.includes(key);
                
                return (
                  <div
                    key={key}
                    className={`flex items-center justify-between p-3 hover:bg-gray-50 ${
                      isSelected ? 'bg-blue-50' : ''
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedKeys(prev => [...prev, key]);
                          } else {
                            setSelectedKeys(prev => prev.filter(k => k !== key));
                          }
                        }}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <div>
                        <div className="text-sm font-medium text-gray-900 font-mono">{key}</div>
                        <div className="text-xs text-gray-500">
                          TTL: {ttl > 0 ? `${Math.round(ttl / 1000)}s` : 'Expired'}
                        </div>
                      </div>
                    </div>
                    
                    <button
                      onClick={() => {
                        redisCache.del(key);
                        loadCacheInfo();
                      }}
                      className="text-red-600 hover:text-red-800 p-1 rounded"
                      title="Delete this key"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Danger Zone */}
      <div className="bg-white rounded-lg shadow-sm border border-red-200 p-6">
        <div className="flex items-center space-x-2 mb-4">
          <AlertTriangle className="w-5 h-5 text-red-600" />
          <h3 className="text-lg font-semibold text-red-900">Danger Zone</h3>
        </div>
        
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-start justify-between">
            <div>
              <h4 className="text-red-900 font-medium mb-2">Clear All Cache</h4>
              <p className="text-red-700 text-sm">
                This will permanently delete all cached data. This action cannot be undone.
              </p>
            </div>
            <button
              onClick={handleFlushAll}
              className="flex items-center space-x-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium transition-colors duration-200"
            >
              <Trash2 className="w-4 h-4" />
              <span>Flush All</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CacheManagement;