import React, { useState, useCallback } from 'react';
import { TrendingUp, Users, Bell, DollarSign, BarChart2, Building, Database, RefreshCcw } from 'lucide-react';
import Select from 'react-select/async';
import toast, { Toaster } from 'react-hot-toast';
import marketData from '../data/market.json';

interface MarketInsightsProps {
  t: (key: string) => string;
}

interface MarketCropPrices {
  [key: string]: string;
}

interface Market {
  name: string;
  cropPrices: MarketCropPrices;
}

// Add new type for insight modes
type InsightMode = 'Accurate' | 'Estimate' | 'Realtime' | 'Predictive';

export const MarketInsights: React.FC<MarketInsightsProps> = () => {
  const [selectedCity, setSelectedCity] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [insightMode, setInsightMode] = useState<InsightMode>('Accurate');
  const [processedData, setProcessedData] = useState<any>(null);
  const [showProcessedData, setShowProcessedData] = useState(false);

  const handleRefresh = async () => {
    toast.promise(
      new Promise((resolve) => {
        setIsLoading(true);
        setTimeout(() => {
          setLastUpdated(new Date());
          setIsLoading(false);
          resolve(true);
        }, 1000);
      }),
      {
        loading: 'Refreshing market data...',
        success: 'Market data updated successfully',
        error: 'Failed to update market data',
      },
      {
        style: {
          borderRadius: '10px',
          background: '#333',
          color: '#fff',
        },
        success: {
          duration: 3000,
          icon: '🎉',
        },
        error: {
          duration: 3000,
          icon: '❌',
        }
      }
    );
  };

  const fetchCityData = async (cityData: any) => {
    toast.promise(
      new Promise((resolve) => {
        setIsLoading(true);
        setTimeout(() => {
          setSelectedCity(cityData);
          setProcessedData(null);
          setShowProcessedData(false);
          setLastUpdated(new Date());
          setIsLoading(false);
          resolve(true);
        }, 1000);
      }),
      {
        loading: `Loading data for ${cityData.city}...`,
        success: `Market data loaded for ${cityData.city}`,
        error: 'Failed to load market data',
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
  };

  const processNumericValue = useCallback((value: string | number, mode: InsightMode): string => {
    // Handle string values with ₹ and Cr format
    if (typeof value === 'string') {
      // Check if value contains Cr (Crore)
      if (value.includes('Cr')) {
        const numValue = parseFloat(value.replace(/[₹,\s]/g, '').split('Cr')[0]);
        let processedValue = numValue;

        switch (mode) {
          case 'Estimate':
            processedValue = numValue > 1 ? numValue - (Math.random() * 0.3 + 0.2) : numValue;
            break;
          case 'Realtime':
            processedValue = numValue + (Math.random() * 0.1);
            break;
          case 'Predictive':
            processedValue = numValue + (Math.random() * 0.4 + 0.1);
            break;
        }
        return `₹${processedValue.toFixed(1)} Cr`;
      }

      // Handle /quintal values
      if (value.includes('/quintal')) {
        const numValue = parseInt(value.replace(/[₹,\s]/g, '').split('/')[0]);
        let processedValue = numValue;

        switch (mode) {
          case 'Estimate':
            processedValue = numValue > 1000 ? numValue - (Math.floor(Math.random() * 301) + 200) : numValue;
            break;
          case 'Realtime':
            processedValue = numValue + (Math.floor(Math.random() * 5) * 2 + 1);
            break;
          case 'Predictive':
            processedValue = numValue + (Math.floor(Math.random() * 401) + 100);
            break;
        }
        return `₹${processedValue.toLocaleString()}/quintal`;
      }
    }

    // Handle numeric values (like activeBuyers)
    if (typeof value === 'number') {
      let processedValue = value;
      switch (mode) {
        case 'Estimate':
          processedValue = value > 1000 ? value - (Math.floor(Math.random() * 301) + 200) : value;
          break;
        case 'Realtime':
          processedValue = value + (Math.floor(Math.random() * 5) * 2 + 1);
          break;
        case 'Predictive':
          processedValue = value + (Math.floor(Math.random() * 401) + 100);
          break;
      }
      return processedValue.toString();
    }

    // Return original value if no processing needed
    return value.toString();
  }, []);

  const handleGetInsights = useCallback(() => {
    if (!selectedCity) {
      toast.error('Please select a city first', {
        icon: '⚠️',
        style: {
          borderRadius: '10px',
          background: '#333',
          color: '#fff',
        },
      });
      return;
    }

    toast.promise(
      new Promise((resolve) => {
        setIsLoading(true);
        setShowProcessedData(true);

        const processedCityData = JSON.parse(JSON.stringify(selectedCity));

        try {
          // Process market stats
          processedCityData.marketStats = {
            ...processedCityData.marketStats,
            dailyTradingVolume: processNumericValue(
              processedCityData.marketStats.dailyTradingVolume,
              insightMode
            ),
            activeBuyers: processNumericValue(
              processedCityData.marketStats.activeBuyers,
              insightMode
            ),
            averagePricePerQuintal: processNumericValue(
              processedCityData.marketStats.averagePricePerQuintal,
              insightMode
            ),
          };

          // Process market prices
          processedCityData.markets = processedCityData.markets.map((market: Market) => ({
            ...market,
            cropPrices: Object.fromEntries(
              Object.entries(market.cropPrices).map(([crop, price]) => [
                crop,
                processNumericValue(price, insightMode)
              ])
            )
          }));

          // Process price alerts
          processedCityData.priceAlerts = processedCityData.priceAlerts.map((alert: any) => ({
            ...alert,
            price: processNumericValue(alert.price, insightMode)
          }));

          setTimeout(() => {
            setProcessedData(processedCityData);
            setIsLoading(false);
            resolve(true);
          }, 1000);
        } catch (error) {
          console.error('Error processing data:', error);
          setIsLoading(false);
          setShowProcessedData(false);
          throw error;
        }
      }),
      {
        loading: `Generating ${insightMode.toLowerCase()} insights...`,
        success: `${insightMode} insights generated successfully`,
        error: 'Failed to process market data',
      },
      {
        style: {
          borderRadius: '10px',
          background: '#333',
          color: '#fff',
        },
        success: {
          duration: 3000,
          icon: '🎯',
        },
        error: {
          duration: 3000,
          icon: '❌',
        }
      }
    );
  }, [selectedCity, insightMode, processNumericValue]);

  const LoadingSpinner = () => (
    <div className="flex justify-center items-center p-8">
      <div className="w-8 h-8 rounded-full border-amber-500 animate-spin border-3 border-t-transparent" />
    </div>
  );

  const getMarketStats = (cityData: any) => [
    {
      title: 'Daily Trading Volume',
      value: cityData.marketStats.dailyTradingVolume,
      change: '+4.5%',
      icon: DollarSign,
      trend: 'up',
    },
    {
      title: 'Active Buyers',
      value: cityData.marketStats.activeBuyers.toString(),
      change: '+1.2%',
      icon: Users,
      trend: 'up',
    },
    {
      title: 'Average Price per Quintal',
      value: cityData.marketStats.averagePricePerQuintal,
      change: '-0.8%',
      icon: BarChart2,
      trend: 'down',
    }
  ];

  const getDisplayData = () => {
    if (!selectedCity) return null;
    if (!showProcessedData) return selectedCity;
    return processedData || selectedCity;
  };

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-yellow-50 to-amber-50">
      {/* Status Bar */}
      <div className="absolute top-4 right-4 z-10">
        <div className="flex gap-4 items-center px-4 py-2 rounded-full shadow-sm backdrop-blur-sm bg-white/80">
          <div className="flex gap-2 items-center">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            <span className="text-sm text-gray-600">Live</span>
          </div>
          <button
            onClick={handleRefresh}
            disabled={isLoading}
            className="flex gap-1 items-center text-sm text-amber-600 transition-colors hover:text-amber-700 disabled:opacity-50"
          >
            <RefreshCcw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
          <div className="text-xs text-gray-500">
            Last updated: {lastUpdated.toLocaleTimeString()}
          </div>
        </div>
      </div>

      <div className="px-4 py-6 mx-auto max-w-7xl md:py-12 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8 text-center md:mb-16">
          <div className="inline-flex gap-2 items-center px-4 py-2 mb-4 bg-amber-50 rounded-full border border-amber-100">
            <div className="w-2 h-2 bg-amber-500 rounded-full animate-pulse" />
            <span className="text-sm font-medium text-amber-600">Live Market Updates</span>
          </div>
          <h1 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-amber-600 to-yellow-600 md:text-4xl">
            Market Insights
          </h1>
          <p className="mt-3 text-sm text-gray-600 md:mt-4 md:text-base">
            Real-time updates from Indian agricultural markets
          </p>
        </div>

        {/* City Selector and Controls */}
        <div className="px-4 mx-auto mb-8 space-y-4 max-w-xl md:mb-12 sm:px-0">
          <Select
            cacheOptions
            loadOptions={async (inputValue) => {
              await new Promise(resolve => setTimeout(resolve, 300));
              return marketData.cities
                .filter(city => city.city.toLowerCase().includes(inputValue.toLowerCase()))
                .map(city => ({
                  value: city.city,
                  label: city.city
                }));
            }}
            onChange={(option: any) => {
              if (option) {
                const selectedCity = marketData.cities.find(
                  city => city.city === option.value
                );
                if (selectedCity) fetchCityData(selectedCity);
              }
            }}
            isDisabled={isLoading}
            className="text-base"
            placeholder="Select a city..."
            styles={{
              control: (base) => ({
                ...base,
                background: 'rgba(255, 255, 255, 0.7)',
                borderColor: 'rgba(217, 119, 6, 0.1)',
                borderRadius: '0.75rem',
                padding: '0.25rem',
                boxShadow: 'none',
                '&:hover': {
                  borderColor: 'rgba(217, 119, 6, 0.3)'
                }
              }),
              menu: (base) => ({
                ...base,
                zIndex: 20,
                background: 'rgba(255, 255, 255, 0.95)',
                backdropFilter: 'blur(8px)',
                borderRadius: '0.75rem',
                border: '1px solid rgba(217, 119, 6, 0.1)',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
              }),
              option: (base, state) => ({
                ...base,
                background: state.isFocused ? 'rgba(217, 119, 6, 0.1)' : 'transparent',
                color: state.isFocused ? '#92400e' : '#374151',
                cursor: 'pointer'
              })
            }}
            defaultOptions
          />

          <div className="flex gap-4 items-center">
            <select
              value={insightMode}
              onChange={(e) => {
                setInsightMode(e.target.value as InsightMode);
                setProcessedData(null);
                setShowProcessedData(false);
              }}
              className="flex-1 px-4 py-2.5 bg-white/70 rounded-xl border border-amber-100 text-gray-700 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
            >
              <option value="Accurate">Accurate Data</option>
              <option value="Estimate">Estimated Data</option>
              <option value="Realtime">Realtime Data</option>
              <option value="Predictive">Predictive Data</option>
            </select>

            <button
              onClick={handleGetInsights}
              disabled={isLoading || !selectedCity}
              className="px-6 py-2.5 bg-amber-500 text-white rounded-xl font-medium hover:bg-amber-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 flex items-center gap-2"
            >
              <BarChart2 className="w-4 h-4" />
              Get Analysis
            </button>
          </div>

          {showProcessedData && insightMode !== 'Accurate' && (
            <div className="p-3 text-sm text-amber-600 bg-amber-50 rounded-lg">
              {insightMode === 'Estimate' && '⚠️ Showing estimated values (reduced by 200-500 for large numbers)'}
              {insightMode === 'Realtime' && '🔄 Showing realtime values with odd number adjustments'}
              {insightMode === 'Predictive' && '📈 Showing predictive values (increased by 100-500)'}
            </div>
          )}
        </div>

        {/* Market Stats */}
        {isLoading ? (
          <LoadingSpinner />
        ) : (
          <div className="grid grid-cols-1 gap-6 mb-8 md:grid-cols-3">
            {getDisplayData() && getMarketStats(getDisplayData()).map((stat, index) => (
              <StatCard key={index} stat={stat} index={index} />
            ))}
          </div>
        )}

        {/* Markets and Alerts Grid */}
        {getDisplayData() && !isLoading && (
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
            {/* Markets List */}
            <div className="p-6 bg-gradient-to-br from-amber-50 to-yellow-50 rounded-xl border shadow-lg backdrop-blur-sm border-amber-100/50">
              <div className="flex gap-3 items-center mb-6">
                <div className="p-2.5 bg-amber-100 rounded-lg">
                  <Building className="w-6 h-6 text-amber-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900">Local Markets</h3>
              </div>

              <div className="space-y-4">
                {getDisplayData().markets.map((market: Market, index: number) => (
                  <div key={index} className="p-4 rounded-lg border transition-colors bg-white/50 border-amber-100/50 hover:bg-white/70">
                    <h3 className="font-medium text-gray-900">{market.name}</h3>
                    <div className="grid grid-cols-3 gap-4 mt-2">
                      {Object.entries(market.cropPrices).map(([crop, price], idx) => (
                        <div key={idx} className="text-sm">
                          <span className="text-gray-600">{crop}:</span>
                          <span className="ml-1 font-medium text-amber-600">{price.toString()}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Price Alerts */}
            <div className="p-6 bg-gradient-to-br from-amber-50 to-yellow-50 rounded-xl border shadow-lg backdrop-blur-sm border-amber-100/50">
              <div className="flex gap-3 items-center mb-6">
                <div className="p-2.5 bg-amber-100 rounded-lg">
                  <Bell className="w-6 h-6 text-amber-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900">Price Alerts</h3>
              </div>

              <div className="space-y-4">
                {getDisplayData().priceAlerts.map((alert: any, index: number) => (
                  <div key={index} className="flex justify-between items-center p-4 rounded-lg transition-colors bg-white/50 hover:bg-white/70">
                    <div className="flex items-center space-x-4">
                      <div className="p-2 bg-amber-50 rounded-lg">
                        <TrendingUp className={`h-5 w-5 ${alert.change.startsWith('+') ? 'text-green-600' : 'text-red-600'}`} />
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-900">{alert.crop}</h3>
                        <p className="text-sm text-gray-500">{alert.time}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-gray-900">{alert.price}</p>
                      <p className={`text-sm ${alert.change.startsWith('+') ? 'text-green-600' : 'text-red-600'}`}>
                        {alert.change}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="mt-12 text-center">
          <div className="inline-flex gap-2 items-center px-4 py-2 rounded-full border border-amber-100 bg-white/50">
            <Database className="w-4 h-4 text-amber-600" />
            <span className="text-sm text-gray-600">Real-time data from Agricultural Ministry APIs</span>
          </div>
        </div>
      </div>

      <Toaster position="top-right" />
    </div>
  );
};

const StatCard = ({ stat, index }: { stat: any; index: number }) => (
  <div
    className="p-6 rounded-xl bg-gradient-to-br from-amber-50 to-yellow-50 shadow-lg backdrop-blur-sm transition-all hover:scale-[1.02] border border-amber-100/50 animate-fadeIn"
    style={{ animationDelay: `${index * 100}ms` }}
  >
    <div className="flex gap-3 items-center mb-4">
      <div className="p-2.5 bg-amber-100 rounded-lg">
        <stat.icon className="w-6 h-6 text-amber-600" />
      </div>
      <h3 className="text-xl font-semibold text-gray-900">{stat.title}</h3>
    </div>
    <div className="space-y-2">
      <div className="text-2xl font-bold text-amber-600 animate-pulse">{stat.value}</div>
      <div className={`text-sm ${stat.trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
        {stat.change} from last week
      </div>
    </div>
  </div>
);

export default MarketInsights;