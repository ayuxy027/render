"use client"

import type React from 'react';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Leaf,
  Fish,
  TrendingUp,
  AlertCircle,
  BarChart3,
  Cpu,
  Database,
  Info,
  Activity,
  TreePine,
  Settings2
} from "lucide-react"
import { getModernFarmingAnalysis, type ModernFarmingResponse, type ModernFarmingRequest } from "../ai/modernFarmingService"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import { toast, Toaster } from "react-hot-toast"

const techniques = [
  { id: "organic_farming", name: "Organic Farming", icon: Leaf },
  { id: "rainwater_farming", name: "Rainwater Farming", icon: TreePine },
  { id: "integrated_farming", name: "Fish Farming", icon: Fish },
  { id: "other_farming", name: "Other", icon: Settings2 },
] as const;

const budgetOptions = [
  { value: "low", label: "Small Scale (< ₹5L)" },
  { value: "medium", label: "Medium Scale (₹5L - ₹20L)" },
  { value: "high", label: "Large Scale (> ₹20L)" },
] as const

const SmartFarming: React.FC = () => {
  const [selectedTechnique, setSelectedTechnique] = useState<string>("")
  const [selectedBudget, setSelectedBudget] = useState<ModernFarmingRequest["budget"]>("medium")
  const [farmSize, setFarmSize] = useState<string>("")
  const [loading, setLoading] = useState<boolean>(false)
  const [analysisData, setAnalysisData] = useState<ModernFarmingResponse | null>(null)
  const [showSystemInfo, setShowSystemInfo] = useState<boolean>(true)
  const [customFarmingType, setCustomFarmingType] = useState<string>("")

  useEffect(() => {
    // Refresh data every 5 minutes if analysis exists
    const refreshInterval = setInterval(() => {
      if (analysisData) {
        handleAnalysis()
      }
    }, 300000)

    return () => clearInterval(refreshInterval)
  }, [analysisData])

  const handleAnalysis = async () => {
    if (!selectedTechnique || !farmSize) {
      toast.error("Please select technique and farm size", {
        style: {
          background: "#FF5757",
          color: "#fff",
          padding: "16px",
          borderRadius: "8px",
        },
      })
      return
    }

    if (selectedTechnique === "other_farming" && !customFarmingType.trim()) {
      toast.error("Please specify your farming technique", {
        style: {
          background: "#FF5757",
          color: "#fff",
          padding: "16px",
          borderRadius: "8px",
        },
      })
      return
    }

    setLoading(true)
    const analysisPromise = getModernFarmingAnalysis({
      technique: selectedTechnique === "other_farming" ? customFarmingType : selectedTechnique,
      farmSize,
      budget: selectedBudget,
    })

    toast.promise(
      analysisPromise,
      {
        loading: "Generating farming analysis...",
        success: "Analysis completed successfully",
        error: "Failed to generate analysis",
      },
      {
        style: {
          minWidth: "250px",
          padding: "16px",
          borderRadius: "8px",
        },
      },
    )

    try {
      const data = await analysisPromise
      setAnalysisData(data)
    } catch (err) {
      console.error("Analysis Error:", err)
    } finally {
      setLoading(false)
    }
  }

  const SystemStatus: React.FC = () => (
    <div className="absolute top-4 right-4 z-10">
      <div
        className="relative"
        onMouseEnter={() => setShowSystemInfo(true)}
        onMouseLeave={() => setShowSystemInfo(false)}
      >
        <button className="p-2 rounded-full shadow-lg transition-all bg-white/90 hover:bg-white">
          <Info className="w-5 h-5 text-blue-600" />
        </button>

        {showSystemInfo && (
          <div className="absolute right-0 p-4 mt-2 w-72 bg-white rounded-xl border border-blue-100 shadow-xl">
            <h4 className="mb-3 text-lg font-semibold text-gray-900">Smart Farming Status</h4>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <div className="flex gap-2 items-center">
                  <Activity className="w-4 h-4 text-blue-600" />
                  <span className="text-sm text-gray-600">Analysis Metrics</span>
                </div>
                <div className="flex gap-2 items-center">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                  <span className="text-sm text-green-600">Active</span>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <div className="flex gap-2 items-center">
                  <Database className="w-4 h-4 text-blue-600" />
                  <span className="text-sm text-gray-600">Database</span>
                </div>
                <div className="flex gap-2 items-center">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                  <span className="text-sm text-green-600">Connected</span>
                </div>
              </div>

              <div className="flex justify-between items-center">
                <div className="flex gap-2 items-center">
                  <Cpu className="w-4 h-4 text-blue-600" />
                  <span className="text-sm text-gray-600">ML Model</span>
                </div>
                <div className="flex gap-2 items-center">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                  <span className="text-sm text-green-600">Active</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      <Toaster position="top-right" />
      <SystemStatus />
      <div className="px-4 py-6 mx-auto max-w-7xl md:py-12 sm:px-6 lg:px-8">
        {/* Header Section */}
        <div className="mb-8 text-center md:mb-16">
          <div className="inline-flex gap-2 items-center px-4 py-2 mb-4 bg-blue-50 rounded-full border border-blue-100">
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
            <span className="text-sm font-medium text-blue-600">AI-Powered Analysis</span>
          </div>
          <h1 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-cyan-600 md:text-4xl">
            Smart Farming Techniques
          </h1>
          <p className="mt-3 text-sm text-gray-600 md:mt-4 md:text-base">
            Get AI-powered insights for modern farming implementation
          </p>
        </div>

        {/* Selection Panel */}
        <div className="px-4 mx-auto mb-8 max-w-2xl md:mb-12 sm:px-0">
          <div className="p-6 rounded-xl border border-blue-50 shadow-sm backdrop-blur-sm bg-white/20">
            <div className="space-y-6">
              {/* Technique Selection */}
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-2 md:grid-cols-4">
                {techniques.map((tech) => (
                  <button
                    key={tech.id}
                    onClick={() => {
                      setSelectedTechnique(tech.id)
                      if (tech.id !== "other_farming") {
                        setCustomFarmingType("")
                      }
                    }}
                    className={`p-4 rounded-lg border transition-all flex flex-col items-center justify-center ${selectedTechnique === tech.id
                      ? "border-blue-500 bg-blue-50 text-blue-600"
                      : "border-gray-200 hover:border-blue-200 hover:bg-blue-50/50"
                      }`}
                  >
                    <tech.icon className="mb-3 w-8 h-8" />
                    <span className="text-sm font-medium text-center">{tech.name}</span>
                  </button>
                ))}
              </div>

              {/* Custom Farming Type Input */}
              <AnimatePresence>
                {selectedTechnique === "other_farming" && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <input
                      type="text"
                      placeholder="Specify your farming technique"
                      value={customFarmingType}
                      onChange={(e) => setCustomFarmingType(e.target.value)}
                      className="block px-4 py-2.5 w-full rounded-lg border border-gray-200 bg-white/50 focus:border-blue-500 focus:ring-blue-500"
                    />
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Farm Size Input */}
              <input
                type="text"
                placeholder="Farm Size (in acres)"
                value={farmSize}
                onChange={(e) => setFarmSize(e.target.value)}
                className="block px-4 py-2.5 w-full rounded-lg border border-gray-200 bg-white/50 focus:border-blue-500 focus:ring-blue-500"
              />

              {/* Budget Selection */}
              <select
                value={selectedBudget}
                onChange={(e) => setSelectedBudget(e.target.value as ModernFarmingRequest["budget"])}
                className="block px-4 py-2.5 w-full rounded-lg border border-gray-200 bg-white/50 focus:border-blue-500 focus:ring-blue-500"
              >
                {budgetOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>

              {/* Analysis Button */}
              <button
                onClick={handleAnalysis}
                disabled={loading}
                className="flex justify-center items-center px-6 py-3 w-full text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <div className="mr-2 w-5 h-5 rounded-full border-white animate-spin border-3 border-t-transparent" />
                    <span>Analyzing...</span>
                  </>
                ) : (
                  <>
                    <Cpu className="mr-2 w-5 h-5" />
                    <span>Generate Analysis</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Analysis Display */}
        <AnimatePresence>
          {loading ? (
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3 md:grid-cols-2">
              {Array(3)
                .fill(0)
                .map((_, index) => (
                  <div
                    key={index}
                    className="p-6 bg-gradient-to-br from-gray-100 to-gray-50 rounded-xl shadow-lg animate-pulse"
                  >
                    <div className="mb-4 w-12 h-12 bg-gray-200 rounded-full" />
                    <div className="mb-2 w-3/4 h-4 bg-gray-200 rounded" />
                    <div className="w-1/2 h-4 bg-gray-200 rounded" />
                  </div>
                ))}
            </div>
          ) : analysisData ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="grid grid-cols-1 gap-6 lg:grid-cols-3 md:grid-cols-2"
            >
              {/* Overview Card */}
              <div className="p-6 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl shadow-lg">
                <div className="flex gap-3 items-center mb-4">
                  <div className="p-2.5 bg-blue-100 rounded-lg">
                    <TrendingUp className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      {analysisData.techniqueAnalysis.overview.name}
                    </h3>
                    <p className="text-sm text-gray-600">Implementation Overview</p>
                  </div>
                </div>
                <div className="mt-4 space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 rounded-lg bg-white/50">
                      <p className="text-sm text-gray-600">Success Rate</p>
                      <p className="text-xl font-bold text-gray-900">
                        {analysisData.techniqueAnalysis.overview.successRate}%
                      </p>
                    </div>
                    <div className="p-4 rounded-lg bg-white/50">
                      <p className="text-sm text-gray-600">Time to ROI</p>
                      <p className="text-xl font-bold text-gray-900">
                        {analysisData.techniqueAnalysis.overview.timeToRoi}
                      </p>
                    </div>
                  </div>
                  <div className="p-3 rounded-lg bg-white/50">
                    <p className="text-sm text-gray-600">Estimated Cost</p>
                    <p className="text-xl font-bold text-gray-900">
                      ₹{analysisData.techniqueAnalysis.overview.estimatedCost.toLocaleString()}
                    </p>
                  </div>
                  <div className="p-3 rounded-lg bg-white/50">
                    <p className="text-sm text-gray-600">ROI</p>
                    <p className="text-xl font-bold text-green-600">{analysisData.techniqueAnalysis.overview.roi}%</p>
                  </div>
                </div>
              </div>

              {/* Implementation Steps - Enhanced */}
              <div className="p-6 bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl shadow-lg">
                <div className="flex gap-3 items-center mb-6">
                  <div className="p-2.5 bg-purple-100 rounded-lg">
                    <Settings2 className="w-6 h-6 text-purple-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900">Implementation Plan</h3>
                </div>
                <div className="mt-4 space-y-4">
                  {analysisData.implementation.phases.map((phase, index) => (
                    <div key={index} className="relative pl-8">
                      <div className="absolute left-0 top-2 w-4 h-4 bg-purple-200 rounded-full">
                        <div className="absolute inset-1 bg-purple-500 rounded-full"></div>
                      </div>
                      <div className="p-4 rounded-lg bg-white/50">
                        <p className="text-sm font-medium text-purple-600">{phase.name}</p>
                        <p className="mt-1 text-xs text-gray-500">{phase.duration}</p>
                        <p className="mt-2 text-sm text-gray-600">{phase.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Metrics Card - Enhanced */}
              <div className="p-6 bg-gradient-to-br from-orange-50 to-amber-50 rounded-xl shadow-lg">
                <div className="flex gap-3 items-center mb-4">
                  <div className="p-2.5 bg-orange-100 rounded-lg">
                    <BarChart3 className="w-6 h-6 text-orange-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900">Performance Metrics</h3>
                </div>
                <div className="mt-6">
                  <div className="h-64 md:h-72">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart
                        data={[
                          { name: "Water", value: analysisData.metrics.resourceEfficiency.water },
                          { name: "Labor", value: analysisData.metrics.resourceEfficiency.labor },
                          { name: "Energy", value: analysisData.metrics.resourceEfficiency.energy },
                          { name: "Yield", value: analysisData.metrics.resourceEfficiency.yield },
                          { name: "Sustainability", value: analysisData.metrics.resourceEfficiency.sustainability }
                        ]}
                      >
                        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                        <XAxis dataKey="name" stroke="#666" />
                        <YAxis stroke="#666" />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "white",
                            border: "1px solid #f0f0f0",
                            borderRadius: "8px"
                          }}
                        />
                        <Line
                          type="monotone"
                          dataKey="value"
                          stroke="#f97316"
                          strokeWidth={2}
                          dot={{ fill: "#f97316" }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            </motion.div>
          ) : (
            <div className="p-8 text-center rounded-xl border backdrop-blur-sm bg-white/50 border-blue-100/50">
              <div className="inline-block p-4 mb-4 bg-blue-50 rounded-full">
                <AlertCircle className="w-8 h-8 text-blue-600" />
              </div>
              <p className="text-lg font-medium text-gray-700">Select a technique and farm size to begin analysis</p>
              <p className="mt-2 text-sm text-gray-500">Get AI-powered insights for implementation</p>
            </div>
          )}
        </AnimatePresence>

        {/* Footer */}
        <div className="mt-12 text-center">
          <div className="inline-flex gap-2 items-center px-4 py-2 rounded-full border border-blue-100 bg-white/50">
            <Database className="w-4 h-4 text-blue-600" />
            <span className="text-sm text-gray-600">Powered by Advanced AI Analytics</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SmartFarming

