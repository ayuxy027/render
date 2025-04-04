import React, { useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Microscope, Leaf, Shield, Upload, RefreshCcw, Check
} from 'lucide-react';
import clsx from 'clsx';
import { analyzePlantImage, DiseaseAnalysisResult } from '../ai/diseaseDetectionService';
import { DiseasePromptConfig } from '../ai/diseasePrompt';

interface DiseaseDetectionProps {
  t: (key: string) => string;
  onAnalysisComplete?: (result: DiseaseAnalysisResult) => void;
  maxImageSize?: number;
  cropType?: string;
  severityLevel?: 'mild' | 'medium' | 'severe';
}

const DEFAULT_MAX_IMAGE_SIZE = 10 * 1024 * 1024; // 10MB

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
  transition: { duration: 0.5 }
};

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.1
    }
  }
};

const itemVariant = {
  initial: { opacity: 0, x: -20 },
  animate: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.2 }
  }
};

const ambientPulse = {
  scale: [1, 1.01, 1],
  transition: {
    duration: 3,
    repeat: Infinity,
    ease: "easeInOut"
  }
};

const DiseaseDetection: React.FC<DiseaseDetectionProps> = ({
  t,
  onAnalysisComplete,
  maxImageSize = DEFAULT_MAX_IMAGE_SIZE,
  cropType,
  severityLevel
}) => {
  const [image, setImage] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isDragActive, _setIsDragActive] = useState(false);
  const [isResultsVisible, setIsResultsVisible] = useState(false);
  const [analysisProgress, setAnalysisProgress] = useState(0);
  const [analysisResult, setAnalysisResult] = useState<DiseaseAnalysisResult | null>(null);
  const [systemStatus, _setSystemStatus] = useState({
    modelLoaded: true,
    apiConnected: true,
    processingReady: true
  });
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [processingSteps, setProcessingSteps] = useState<string[]>([]);
  const [currentStep, setCurrentStep] = useState<number>(0);

  const addProcessingStep = (step: string) => {
    console.log(`Processing: ${step}`);
    setProcessingSteps(prev => [...prev, step]);
  };

  const processFile = async (file: File) => {
    try {
      setErrorMessage(null);
      setIsAnalyzing(true);
      setIsResultsVisible(false);
      setAnalysisProgress(0);
      setProcessingSteps([]);
      setCurrentStep(0);

      const reader = new FileReader();
      reader.onload = async () => {
        const imageData = reader.result as string;
        setImage(imageData);

        try {
          // Simulated processing steps with realistic timing
          const steps = [
            { message: "Initializing image processing pipeline...", duration: 1000 },
            { message: "Performing initial image analysis...", duration: 1500 },
            { message: "Detecting plant features...", duration: 2000 },
            { message: "Analyzing disease patterns...", duration: 2500 },
            { message: "Running AI model predictions...", duration: 2000 },
            { message: "Generating treatment recommendations...", duration: 1500 },
            { message: "Finalizing analysis report...", duration: 1000 }
          ];

          let progress = 0;
          const progressIncrement = 100 / steps.length;

          for (let i = 0; i < steps.length; i++) {
            const step = steps[i];
            setCurrentStep(i);
            addProcessingStep(step.message);

            // Increment progress smoothly
            const startProgress = progress;
            const endProgress = progress + progressIncrement;
            const duration = step.duration;
            const startTime = Date.now();

            while (progress < endProgress) {
              const elapsed = Date.now() - startTime;
              const percentage = Math.min(elapsed / duration, 1);
              progress = startProgress + (progressIncrement * percentage);
              setAnalysisProgress(Math.min(progress, 99)); // Keep at 99% until complete
              await new Promise(r => setTimeout(r, 50)); // Smooth updates
            }

            await new Promise(r => setTimeout(r, 200)); // Pause between steps
          }

          // Configure analysis parameters
          const config: DiseasePromptConfig = {
            cropType,
            severityLevel
          };

          // Perform actual analysis
          const result = await analyzePlantImage(imageData, config);

          // Show 100% only when we have results
          setAnalysisProgress(100);
          await new Promise(r => setTimeout(r, 500)); // Dramatic pause

          addProcessingStep("Analysis complete! Displaying results...");
          setAnalysisResult(result);
          setIsResultsVisible(true);
          onAnalysisComplete?.(result);

        } catch (error) {
          setErrorMessage(error instanceof Error ? error.message : 'Analysis failed');
        } finally {
          setIsAnalyzing(false);
        }
      };

      reader.readAsDataURL(file);
    } catch (error) {
      console.error('File processing failed:', error);
      setErrorMessage('File processing failed');
      setIsAnalyzing(false);
    }
  };

  const { getRootProps, getInputProps } = useDropzone({
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.webp']
    },
    maxSize: maxImageSize,
    onDrop: (acceptedFiles, rejectedFiles) => {
      if (rejectedFiles.length > 0) {
        const error = rejectedFiles[0].errors[0];
        setErrorMessage(
          error.code === 'file-too-large'
            ? `File is too large. Maximum size is ${maxImageSize / (1024 * 1024)}MB`
            : 'Invalid file type. Please upload a valid image.'
        );
        return;
      }
      if (acceptedFiles.length > 0) {
        setErrorMessage(null);
        processFile(acceptedFiles[0]);
      }
    }
  });

  const solutions = [
    {
      title: t('diseaseDetection.chemical'),
      icon: Microscope,
      solutions: analysisResult?.organicTreatments || ['Solution 1', 'Solution 2', 'Solution 3'],
      color: 'blue',
    },
    {
      title: t('diseaseDetection.organic'),
      icon: Leaf,
      solutions: analysisResult?.ipmStrategies || ['Solution 1', 'Solution 2', 'Solution 3'],
      color: 'green',
    },
    {
      title: t('diseaseDetection.preventive'),
      icon: Shield,
      solutions: analysisResult?.preventionPlan || ['Solution 1', 'Solution 2', 'Solution 3'],
      color: 'purple',
    },
  ];

  return (
    <motion.div
      initial="initial"
      animate="animate"
      className="container px-4 py-8 mx-auto max-w-7xl"
    >
      {/* Dashboard Header */}
      <motion.div
        variants={fadeInUp}
        className="mb-8"
      >
        <motion.h1
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="text-2xl font-bold tracking-tight text-gray-900 md:text-3xl lg:text-4xl"
        >
          Plant Disease Detection Dashboard
        </motion.h1>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="mt-2 text-sm text-gray-600 md:text-base"
        >
          Upload and analyze plant images for disease detection
        </motion.p>
      </motion.div>

      {/* System Status Panel */}
      <motion.div
        variants={fadeInUp}
        className="p-4 mb-8 bg-white rounded-xl border border-gray-200 shadow-lg md:p-6"
      >
        <motion.div
          variants={staggerContainer}
          className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 md:gap-6"
        >
          {Object.entries(systemStatus).map(([key, status], index) => (
            <motion.div
              key={key}
              custom={index}
              variants={itemVariant}
              className="p-4 bg-gray-50 rounded-lg transition-shadow hover:shadow-md"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="flex gap-3 items-center">
                {status ? (
                  <div className="p-2 bg-green-100 rounded-full">
                    <Check className="w-5 h-5 text-green-600" />
                  </div>
                ) : (
                  <div className="p-2 bg-amber-100 rounded-full">
                    <RefreshCcw className="w-5 h-5 text-amber-600 animate-spin" />
                  </div>
                )}
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                  </p>
                  <p className="text-xs text-gray-500">
                    {status ? 'Operational' : 'Initializing...'}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </motion.div>

      {/* Upload Section */}
      <motion.div variants={fadeInUp} className="mb-8">
        <div {...getRootProps()} className="relative">
          <motion.div
            initial={false}
            whileHover={{ scale: 1.02, boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1)" }}
            whileTap={{ scale: 0.98 }}
            animate={isDragActive ? {
              scale: 1.05,
              borderColor: "var(--color-primary-500)",
              backgroundColor: "var(--color-primary-50)"
            } : {
              scale: 1,
              borderColor: "var(--color-gray-300)",
              backgroundColor: "var(--color-white)"
            }}
            className={clsx(
              "relative p-4 rounded-xl border-dashed transition-all duration-300 md:p-8 border-3",
              "bg-gradient-to-r from-gray-50 to-white"
            )}
          >
            <input {...getInputProps()} />
            <div className="flex flex-col items-center">
              <motion.div
                className={clsx(
                  "p-4 mb-4 rounded-full transition-all duration-300",
                  isDragActive ? "bg-primary-100" : "bg-gray-100"
                )}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <Upload className="w-10 h-10 text-primary-600" />
              </motion.div>
              <motion.h3
                className="mb-2 text-xl font-semibold text-gray-900"
                animate={{ scale: isDragActive ? 1.1 : 1 }}
              >
                {t('diseaseDetection.dragDropText')}
              </motion.h3>
              <motion.p
                className="mb-4 text-sm text-gray-600"
                animate={{ opacity: isDragActive ? 0.7 : 1 }}
              >
                {t('diseaseDetection.uploadInstructions')}
              </motion.p>
              <motion.button
                className="px-6 py-2 text-sm font-medium text-white rounded-full bg-primary-600 hover:bg-primary-700"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Select File
              </motion.button>
            </div>
          </motion.div>
        </div>
      </motion.div>

      {/* Analysis Progress */}
      <AnimatePresence>
        {isAnalyzing && (
          <motion.div
            variants={fadeInUp}
            initial="initial"
            animate="animate"
            exit="exit"
            className="mb-8"
          >
            <motion.div
              className="p-6 bg-white rounded-xl border border-gray-200 shadow-lg"
              animate={ambientPulse}
            >
              <div className="flex justify-between items-center mb-6">
                <div className="flex gap-3 items-center">
                  <RefreshCcw className="w-6 h-6 animate-spin text-primary-600" />
                  <h3 className="text-xl font-semibold text-gray-800">Analysis in Progress</h3>
                </div>
                <motion.span
                  className="px-4 py-2 text-sm font-medium rounded-full text-primary-600 bg-primary-50"
                  animate={{ scale: analysisProgress === 100 ? [1, 1.1, 1] : 1 }}
                  transition={{ duration: 0.5 }}
                >
                  {analysisProgress.toFixed(1)}% Complete
                </motion.span>
              </div>

              {/* Processing Steps Log */}
              <div className="overflow-y-auto mb-6 max-h-40">
                <motion.div layout className="space-y-2">
                  {processingSteps.map((step, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className={clsx(
                        "flex items-center gap-2 p-2 rounded",
                        index === currentStep ? "bg-primary-50" : "bg-gray-50"
                      )}
                    >
                      {index === currentStep ? (
                        <RefreshCcw className="w-4 h-4 animate-spin text-primary-600" />
                      ) : (
                        <Check className="w-4 h-4 text-green-600" />
                      )}
                      <span className="text-sm text-gray-700">{step}</span>
                    </motion.div>
                  ))}
                </motion.div>
              </div>

              {/* Progress Bar */}
              <div className="overflow-hidden relative mb-4 w-full h-3 bg-gray-100 rounded-full">
                <motion.div
                  className="absolute top-0 left-0 h-full bg-primary-600"
                  style={{ width: `${analysisProgress}%` }}
                  animate={{
                    background: analysisProgress === 100
                      ? ['hsl(var(--primary-600))', 'hsl(var(--primary-400))', 'hsl(var(--primary-600))']
                      : 'hsl(var(--primary-600))'
                  }}
                  transition={{ duration: 1, repeat: analysisProgress === 100 ? Infinity : 0 }}
                />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Results Section - Only show when analysis is 100% complete */}
      <AnimatePresence>
        {isResultsVisible && analysisResult && analysisProgress === 100 && (
          <motion.div
            variants={staggerContainer}
            initial="initial"
            animate="animate"
            exit="exit"
            className="space-y-6 md:space-y-8"
          >
            {/* Primary Results Card */}
            <motion.div
              variants={fadeInUp}
              className="p-4 bg-white rounded-xl border border-gray-200 shadow-lg md:p-6"
              whileHover={{ scale: 1.01 }}
            >
              <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 md:gap-8">
                <div>
                  <h3 className="mb-6 text-2xl font-bold text-gray-900">Detection Results</h3>
                  <table className="w-full">
                    <tbody>
                      <tr className="border-b border-gray-100">
                        <td className="py-3 text-gray-600">Disease</td>
                        <td className="py-3 font-medium text-right text-gray-900">{analysisResult.diseaseName}</td>
                      </tr>
                      <tr className="border-b border-gray-100">
                        <td className="py-3 text-gray-600">Name of Crop</td>
                        <td className="py-3 font-medium text-right text-gray-900">{analysisResult.cropName}</td>
                      </tr>
                      <tr className="border-b border-gray-100">
                        <td className="py-3 text-gray-600">Confidence</td>
                        <td className="py-3 font-medium text-right text-primary-600">
                          {analysisResult.confidenceLevel.toFixed(2)}%
                        </td>
                      </tr>
                      <tr>
                        <td className="py-3 text-gray-600">Severity</td>
                        <td className="py-3 text-right">
                          <span className={clsx(
                            "px-3 py-1 text-sm font-medium rounded-full",
                            {
                              "bg-red-100 text-red-700": analysisResult.severityLevel === "severe",
                              "bg-yellow-100 text-yellow-700": analysisResult.severityLevel === "medium",
                              "bg-green-100 text-green-700": analysisResult.severityLevel === "mild",
                            }
                          )}>
                            {analysisResult.severityLevel.toUpperCase()}
                          </span>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* Image Preview */}
                {image && (
                  <div className="relative">
                    <img
                      src={image}
                      alt="Analyzed crop"
                      className="w-full h-full rounded-lg shadow-lg"
                    />
                  </div>
                )}
              </div>
            </motion.div>

            {/* Environmental Factors */}
            <motion.div
              variants={fadeInUp}
              className="p-4 bg-white rounded-xl border border-gray-200 shadow-lg md:p-6"
            >
              <h3 className="mb-4 text-lg font-semibold text-gray-900 md:mb-6 md:text-xl">
                Environmental Analysis
              </h3>
              <div className="overflow-x-auto -mx-4 md:mx-0">
                <div className="inline-block min-w-full align-middle">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="pb-3 text-sm font-medium text-left text-gray-500">Factor</th>
                        <th className="pb-3 text-sm font-medium text-left text-gray-500">Current Value</th>
                        <th className="pb-3 text-sm font-medium text-left text-gray-500">Optimal Range</th>
                        <th className="pb-3 text-sm font-medium text-left text-gray-500">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {analysisResult.environmentalFactors.map((factor, index) => (
                        <tr key={index} className="border-b border-gray-100">
                          <td className="py-3 text-sm text-gray-900 capitalize">
                            {factor.factor}
                          </td>
                          <td className="py-3 text-sm font-medium text-gray-900">{factor.currentValue}</td>
                          <td className="py-3 text-sm text-gray-600">{factor.optimalRange}</td>
                          <td className="py-3">
                            <span className={clsx(
                              "px-3 py-1 text-xs font-medium rounded-full",
                              {
                                "bg-green-100 text-green-700": factor.status === "optimal",
                                "bg-yellow-100 text-yellow-700": factor.status === "warning",
                                "bg-red-100 text-red-700": factor.status === "critical"
                              }
                            )}>
                              {factor.status.toUpperCase()}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </motion.div>

            {/* Treatment Timeline */}
            <motion.div
              variants={fadeInUp}
              className="p-4 bg-white rounded-xl border border-gray-200 shadow-lg md:p-6"
            >
              <h3 className="mb-4 text-lg font-semibold text-gray-900 md:mb-6 md:text-xl">
                Treatment Timeline
              </h3>
              <div className="flex flex-col justify-between items-stretch md:flex-row md:items-center">
                <div className="flex-1 p-4 text-center">
                  <p className="mb-2 text-sm text-gray-600">Time to Treat</p>
                  <p className="text-lg font-semibold text-primary-600">{analysisResult.timeToTreat}</p>
                </div>
                <div className="flex-1 p-4 text-center border-gray-200 border-x">
                  <p className="mb-2 text-sm text-gray-600">Estimated Recovery</p>
                  <p className="text-lg font-semibold text-green-600">{analysisResult.estimatedRecovery}</p>
                </div>
                <div className="flex-1 p-4 text-center">
                  <p className="mb-2 text-sm text-gray-600">Yield Impact</p>
                  <p className="text-lg font-semibold text-red-600">{analysisResult.yieldImpact}</p>
                </div>
              </div>
            </motion.div>

            {/* Solutions Grid */}
            <motion.div
              variants={staggerContainer}
              className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 md:gap-6"
            >
              {solutions.map((solution, index) => (
                <motion.div
                  key={solution.title}
                  variants={{
                    initial: { opacity: 0, y: 20 },
                    animate: {
                      opacity: 1,
                      y: 0,
                      transition: { delay: index * 0.2 }
                    },
                    exit: { opacity: 0, y: -20 }
                  }}
                  whileHover={{
                    scale: 1.05,
                    boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1)",
                    transition: { type: "spring", stiffness: 300 }
                  }}
                  whileTap={{ scale: 0.95 }}
                  className="p-4 bg-white rounded-xl border border-gray-200 shadow-lg md:p-6"
                >
                  <div className={clsx(
                    "p-3 w-fit rounded-full mb-4",
                    {
                      "bg-blue-100": solution.color === "blue",
                      "bg-green-100": solution.color === "green",
                      "bg-purple-100": solution.color === "purple",
                    }
                  )}>
                    <solution.icon
                      className={clsx("w-6 h-6", {
                        "text-blue-600": solution.color === "blue",
                        "text-green-600": solution.color === "green",
                        "text-purple-600": solution.color === "purple",
                      })}
                    />
                  </div>
                  <h3 className="mb-4 text-lg font-semibold text-gray-900">{solution.title}</h3>
                  <ul className="space-y-3">
                    {solution.solutions.map((item, index) => (
                      <li key={index} className="flex gap-3 items-center text-gray-700">
                        <Check className="w-5 h-5 text-green-500" />
                        <span className="text-sm">{item}</span>
                      </li>
                    ))}
                  </ul>
                </motion.div>
              ))}
            </motion.div>

            {/* Real-time Updates Section */}
            <motion.div
              variants={fadeInUp}
              className="p-4 bg-white rounded-xl border border-gray-200 shadow-lg md:p-6"
            >
              <motion.div
                className="flex justify-between items-center mb-4"
                animate={{
                  scale: [1, 1.02, 1],
                  transition: { duration: 2, repeat: Infinity }
                }}
              >
                <h3 className="text-lg font-semibold text-gray-900 md:text-xl">Real-time Monitoring</h3>
                <span className="flex gap-2 items-center text-green-600">
                  <span className="w-2 h-2 bg-green-600 rounded-full animate-pulse"></span>
                  Live
                </span>
              </motion.div>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                {/* Spread Risk */}
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-600">Spread Risk</p>
                  <div className="flex justify-between items-center mt-2">
                    <div>
                      <span className="text-xl font-semibold text-gray-900">{analysisResult.realTimeMetrics.spreadRisk.level}</span>
                      <span className="ml-2 text-sm text-gray-500">({analysisResult.realTimeMetrics.spreadRisk.value}%)</span>
                    </div>
                    <motion.div
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ repeat: Infinity, duration: 2 }}
                      className={clsx("w-3 h-3 rounded-full", {
                        "bg-red-500": analysisResult.realTimeMetrics.spreadRisk.trend === "increasing",
                        "bg-yellow-500": analysisResult.realTimeMetrics.spreadRisk.trend === "stable",
                        "bg-green-500": analysisResult.realTimeMetrics.spreadRisk.trend === "decreasing"
                      })}
                    />
                  </div>
                  <p className="mt-2 text-xs text-gray-500 capitalize">Trend: {analysisResult.realTimeMetrics.spreadRisk.trend}</p>
                </div>

                {/* Disease Progression */}
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-600">Disease Progression</p>
                  <div className="flex justify-between items-center mt-2">
                    <span className="text-xl font-semibold text-gray-900">{analysisResult.realTimeMetrics.diseaseProgression.stage}</span>
                    <span className="text-sm text-gray-500">{analysisResult.realTimeMetrics.diseaseProgression.rate}% / day</span>
                  </div>
                  <p className="mt-2 text-xs text-gray-500">Next Check: {analysisResult.realTimeMetrics.diseaseProgression.nextCheckDate}</p>
                </div>

                {/* Environmental Conditions */}
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-600">Environmental Conditions</p>
                  <div className="mt-2 space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500">Temperature</span>
                      <span className="text-sm font-medium">{analysisResult.realTimeMetrics.environmentalConditions.temperature}°C</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500">Humidity</span>
                      <span className="text-sm font-medium">{analysisResult.realTimeMetrics.environmentalConditions.humidity}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500">Soil Moisture</span>
                      <span className="text-sm font-medium">{analysisResult.realTimeMetrics.environmentalConditions.soilMoisture}%</span>
                    </div>
                  </div>
                  <p className="mt-2 text-xs text-gray-500">Last Updated: {analysisResult.realTimeMetrics.environmentalConditions.lastUpdated}</p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Error Handling */}
      <AnimatePresence>
        {errorMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="p-4 mb-4 text-red-700 bg-red-100 rounded-lg"
          >
            {errorMessage}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default DiseaseDetection;