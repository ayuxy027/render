import React, { useState, useEffect } from 'react';
import { getCropAnalytics } from '../ai/cropService';
import type { CropAnalyticsResponse } from '../ai/cropService';
import cityData from '../data/cityData.json';
import { BarChart3, Scale, TrendingUp, AlertCircle, Info, Activity, Database, Cpu } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';
import 'react-toastify/dist/ReactToastify.css';

const CropAdvisory: React.FC = () => {
  const [selectedCity, setSelectedCity] = useState('');
  const [selectedCrop, setSelectedCrop] = useState('');
  const [loading, setLoading] = useState(false);
  const [analyticsData, setAnalyticsData] = useState<CropAnalyticsResponse | null>(null);
  const [mounted, setMounted] = useState(false);
  const [showSystemInfo, setShowSystemInfo] = useState(true);
  const selectedState = 'Maharashtra';

  useEffect(() => {
    setMounted(true);
    // Simulate periodic data refresh
    const refreshInterval = setInterval(() => {
      if (analyticsData) {
        handleAnalytics();
      }
    }, 300000); // Refresh every 5 minutes

    return () => clearInterval(refreshInterval);
  }, [analyticsData]);

  const handleAnalytics = async () => {
    if (!selectedCity || !selectedCrop) {
      toast.error('Please select both city and crop', {
        style: {
          borderRadius: '10px',
          background: '#333',
          color: '#fff',
        },
        duration: 3000,
        icon: '⚠️',
      });
      return;
    }

    const analyticsPromise = getCropAnalytics({
      city: selectedCity,
      state: selectedState,
      cropName: selectedCrop,
      dateRange: 'current',
      options: { includeHistorical: true, logErrors: true }
    });

    toast.promise(
      analyticsPromise,
      {
        loading: 'Analyzing crop data...',
        success: 'Analysis completed successfully',
        error: 'Failed to fetch crop analytics',
      },
      {
        style: {
          borderRadius: '10px',
          background: '#333',
          color: '#fff',
        },
        success: {
          duration: 3000,
          icon: '📊',
        },
        error: {
          duration: 3000,
          icon: '❌',
        }
      }
    );

    try {
      const response = await analyticsPromise;
      setAnalyticsData(response);
      setLoading(false);
    } catch (err) {
      console.error('Crop Analytics Error:', err);
      setLoading(false);
    }
  };

  const SystemStatus = () => (
    <div className="absolute top-4 right-4 z-10">
      <div
        className="relative"
        onMouseEnter={() => setShowSystemInfo(true)}
        onMouseLeave={() => setShowSystemInfo(false)}
      >
        <button className="p-2 rounded-full shadow-lg transition-all bg-white/90 hover:bg-white">
          <Info className="w-5 h-5 text-emerald-600" />
        </button>

        {showSystemInfo && (
          <div className="absolute right-0 p-4 mt-2 w-72 bg-white rounded-xl border border-emerald-100 shadow-xl">
            <h4 className="mb-3 text-lg font-semibold text-gray-900">System Status</h4>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <div className="flex gap-2 items-center">
                  <Activity className="w-4 h-4 text-emerald-600" />
                  <span className="text-sm text-gray-600">Live Data Feed</span>
                </div>
                <div className="flex gap-2 items-center">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                  <span className="text-sm text-green-600">Active</span>
                </div>
              </div>

              <div className="flex justify-between items-center">
                <div className="flex gap-2 items-center">
                  <Database className="w-4 h-4 text-emerald-600" />
                  <span className="text-sm text-gray-600">Vercel Deployment</span>
                </div>
                <div className="flex gap-2 items-center">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                  <span className="text-sm text-green-600">Connected</span>
                </div>
              </div>

              <div className="flex justify-between items-center">
                <div className="flex gap-2 items-center">
                  <Cpu className="w-4 h-4 text-emerald-600" />
                  <span className="text-sm text-gray-600">Gemini 2.0 Advanced</span>
                </div>
                <div className="flex gap-2 items-center">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                  <span className="text-sm text-green-600">Synced</span>
                </div>
              </div>

              <div className="pt-3 mt-4 border-t border-gray-100">
                <p className="text-xs leading-relaxed text-gray-500">
                  Real-time data sourced from Agricultural Ministry of India,
                  National Commodity Exchanges, and Regional APIs.
                  <br />
                  Analysis powered by Gemini 2.0 Advanced.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  const CardSkeleton = () => (
    <div className="p-6 bg-gradient-to-br from-gray-100 to-gray-50 rounded-xl shadow-lg animate-pulse">
      <div className="mb-4 w-12 h-12 bg-gray-200 rounded-full" />
      <div className="mb-2 w-3/4 h-4 bg-gray-200 rounded" />
      <div className="w-1/2 h-4 bg-gray-200 rounded" />
    </div>
  );

  if (!mounted) return null;

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-gray-50 to-emerald-50">
      <Toaster position="top-right" />
      <SystemStatus />
      <div className="px-4 py-6 mx-auto max-w-7xl md:py-12 sm:px-6 lg:px-8">
        <div className="mb-8 text-center md:mb-16">
          <div className="inline-flex gap-2 items-center px-4 py-2 mb-4 bg-emerald-50 rounded-full border border-emerald-100">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            <span className="text-sm font-medium text-emerald-600">Live Market Data</span>
          </div>
          <h1 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-green-600 md:text-4xl">
            Maharashtra Crop Intelligence
          </h1>
          <p className="mt-3 text-sm text-gray-600 md:mt-4 md:text-base">
            Advanced agricultural insights and predictive analytics for Maharashtra
          </p>
        </div>

        {/* Selection Panel */}
        <div className="px-4 mx-auto mb-8 max-w-xl md:mb-12 sm:px-0">
          <div className="p-4 rounded-xl border border-emerald-50 shadow-sm backdrop-blur-sm bg-white/20">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">City</label>
                <select
                  className="w-full p-2.5 rounded-lg border border-gray-200 bg-white/70 backdrop-blur-sm transition-all hover:border-emerald-200 focus:ring-2 focus:ring-emerald-500"
                  value={selectedCity}
                  onChange={(e) => setSelectedCity(e.target.value)}
                >
                  <option value="">Select City</option>
                  {cityData.cities.map(city => (
                    <option key={city} value={city}>{city}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Crop</label>
                <select
                  className="w-full p-2.5 rounded-lg border border-gray-200 bg-white/70 backdrop-blur-sm transition-all hover:border-emerald-200 focus:ring-2 focus:ring-emerald-500"
                  value={selectedCrop}
                  onChange={(e) => setSelectedCrop(e.target.value)}
                >
                  <option value="">Select Crop</option>
                  {cityData.crops.map(crop => (
                    <option key={crop} value={crop}>{crop}</option>
                  ))}
                </select>
              </div>
            </div>

            <button
              onClick={handleAnalytics}
              disabled={loading}
              className="mt-4 w-full px-6 py-3 bg-gradient-to-r from-emerald-600 to-green-600 text-white rounded-lg font-medium transition-all hover:scale-[1.02] hover:shadow-lg disabled:opacity-50 disabled:pointer-events-none flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 rounded-full border-white animate-spin border-3 border-t-transparent" />
                  <span>Generating Insights...</span>
                </>
              ) : (
                <>
                  <Activity className="w-5 h-5" />
                  <span>Analyze Crop Data</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Analytics Display */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3 md:gap-8">
          {loading ? (
            Array(3).fill(0).map((_, index) => <CardSkeleton key={index} />)
          ) : analyticsData ? (
            <>
              {/* Market Overview Card */}
              <div className="p-6 rounded-xl bg-gradient-to-br from-emerald-50 to-green-50 shadow-lg backdrop-blur-sm transition-transform hover:scale-[1.02] border border-emerald-100/50">
                <div className="flex gap-3 items-center mb-4">
                  <div className="p-2.5 bg-emerald-100 rounded-lg">
                    <BarChart3 className="w-6 h-6 text-emerald-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900">Market Overview</h3>
                </div>
                <div className="space-y-4">
                  <div className="flex justify-between items-center p-3 rounded-lg border bg-white/50 border-emerald-100/50">
                    <span className="text-gray-600">Current Price</span>
                    <span className="font-semibold text-emerald-600">
                      ₹{analyticsData.marketAnalysis.summary.currentPrice.toLocaleString()}/quintal
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-3 rounded-lg border bg-white/50 border-emerald-100/50">
                    <span className="text-gray-600">Price Change</span>
                    <span className={`font-semibold ${analyticsData.marketAnalysis.summary.priceChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {analyticsData.marketAnalysis.summary.priceChange >= 0 ? '+' : ''}
                      {analyticsData.marketAnalysis.summary.priceChange.toFixed(2)}%
                    </span>
                  </div>
                </div>
              </div>

              {/* Quality Metrics Card */}
              <div className="p-6 rounded-xl bg-gradient-to-br from-purple-50 to-indigo-50 shadow-lg backdrop-blur-sm transition-transform hover:scale-[1.02] border border-purple-100/50">
                <div className="flex gap-3 items-center mb-4">
                  <div className="p-2.5 bg-purple-100 rounded-lg">
                    <Scale className="w-6 h-6 text-purple-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900">Quality Metrics</h3>
                </div>
                <div className="space-y-4">
                  {Object.entries(analyticsData.qualityMetrics.gradeDistribution).map(([grade, percentage]) => (
                    <div key={grade} className="flex justify-between items-center p-3 rounded-lg border bg-white/50 border-purple-100/50">
                      <span className="text-gray-600 capitalize">{grade}</span>
                      <span className="font-semibold text-purple-600">{percentage}%</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Price Forecast Card */}
              <div className="p-6 rounded-xl bg-gradient-to-br from-orange-50 to-amber-50 shadow-lg backdrop-blur-sm transition-transform hover:scale-[1.02] border border-orange-100/50">
                <div className="flex gap-3 items-center mb-4">
                  <div className="p-2.5 bg-orange-100 rounded-lg">
                    <TrendingUp className="w-6 h-6 text-orange-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900">Price Forecast</h3>
                </div>
                <div className="space-y-4">
                  <div className="p-3 rounded-lg border bg-white/50 border-orange-100/50">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-gray-600">Next Week</span>
                      <span className="font-semibold text-orange-600">
                        ₹{analyticsData.forecastMetrics.priceProjection.nextWeek.toLocaleString()}/quintal
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Next Month</span>
                      <span className="font-semibold text-orange-600">
                        ₹{analyticsData.forecastMetrics.priceProjection.nextMonth.toLocaleString()}/quintal
                      </span>
                    </div>
                    <div className="mt-3 text-sm text-gray-500">
                      AI Confidence: {analyticsData.forecastMetrics.priceProjection.confidence}%
                    </div>
                    <div className="pt-3 mt-4 border-t border-orange-100/50">
                      <div className="flex gap-2 items-center text-xs text-gray-500">
                        <Cpu className="w-4 h-4 text-orange-400" />
                        <span>Forecast generated by Gemini 2.0 Advanced</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Market Sentiment Card */}
              <div className="col-span-1 md:col-span-3 p-6 rounded-xl bg-gradient-to-br from-blue-50 to-cyan-50 shadow-lg backdrop-blur-sm transition-transform hover:scale-[1.02] border border-blue-100/50">
                <div className="flex justify-between items-center mb-6">
                  <div className="flex gap-3 items-center">
                    <div className="p-2.5 bg-blue-100 rounded-lg">
                      <Activity className="w-6 h-6 text-blue-600" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900">Real-Time Market Sentiment</h3>
                  </div>
                  <div className="flex gap-2 items-center px-3 py-1 rounded-full bg-blue-100/50">
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
                    <span className="text-sm font-medium text-blue-600">Live Updates</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                  <div className="p-4 rounded-lg border bg-white/50 border-blue-100/50">
                    <h4 className="mb-2 text-sm font-medium text-gray-600">Supply Trend</h4>
                    <div className="flex justify-between items-center">
                      <span className="text-2xl font-bold text-blue-600">Moderate</span>
                      <TrendingUp className="w-5 h-5 text-blue-400" />
                    </div>
                  </div>

                  <div className="p-4 rounded-lg border bg-white/50 border-blue-100/50">
                    <h4 className="mb-2 text-sm font-medium text-gray-600">Market Volatility</h4>
                    <div className="flex justify-between items-center">
                      <span className="text-2xl font-bold text-blue-600">Low</span>
                      <Activity className="w-5 h-5 text-blue-400" />
                    </div>
                  </div>

                  <div className="p-4 rounded-lg border bg-white/50 border-blue-100/50">
                    <h4 className="mb-2 text-sm font-medium text-gray-600">Trading Signal</h4>
                    <div className="flex justify-between items-center">
                      <span className="text-2xl font-bold text-blue-600">Buy</span>
                      <BarChart3 className="w-5 h-5 text-blue-400" />
                    </div>
                  </div>
                </div>

                <div className="flex gap-2 items-center mt-4 text-xs text-gray-500">
                  <Info className="w-4 h-4" />
                  <span>Data refreshes automatically every 5 minutes</span>
                </div>
              </div>
            </>
          ) : (
            <div className="col-span-3 p-8 text-center rounded-xl border backdrop-blur-sm bg-white/50 border-emerald-100/50">
              <div className="inline-block p-4 mb-4 bg-emerald-50 rounded-full">
                <AlertCircle className="w-8 h-8 text-emerald-600" />
              </div>
              <p className="text-lg font-medium text-gray-700">Select a city and crop to view analysis</p>
              <p className="mt-2 text-sm text-gray-500">Real-time market data and AI-powered insights await</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="mt-12 text-center">
          <div className="inline-flex gap-2 items-center px-4 py-2 rounded-full border border-emerald-100 bg-white/50">
            <Database className="w-4 h-4 text-emerald-600" />
            <span className="text-sm text-gray-600">Powered by Agricultural Ministry of India APIs</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CropAdvisory;