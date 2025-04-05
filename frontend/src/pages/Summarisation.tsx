import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import {
  Scale,
  Upload,
  Download,
  AlertCircle,
  CheckCircle,
  ChevronRight,
  Maximize2,
  Minimize2,
  RotateCcw,
  FileText
} from 'lucide-react';
import { summarizeDocument } from '../services/geminiService';
import { getLegalDocumentSummaryPrompt } from '../prompts/legalSummarizationPrompt';

interface Step {
  title: string;
  description: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  icon: React.ComponentType<any>;
}

const steps: Step[] = [
  {
    title: "Upload Document",
    description: "Select or drag & drop your legal document",
    icon: Upload
  },
  {
    title: "AI Processing",
    description: "Our AI analyzes and extracts key information",
    icon: Scale
  },
  {
    title: "Review Summary",
    description: "Get a concise summary of your document",
    icon: FileText
  }
];

const DocumentSummarizer: React.FC = () => {
  const [activeStep, setActiveStep] = useState(0);
  const [file, setFile] = useState<File | null>(null);
  const [summary, setSummary] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setActiveStep(1);
      setError(null);
      await processDocument(selectedFile);
    }
  };

  const handleDrop = async (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    const droppedFile = event.dataTransfer.files?.[0];
    if (droppedFile) {
      setFile(droppedFile);
      setActiveStep(1);
      setError(null);
      await processDocument(droppedFile);
    }
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
  };

  const processDocument = async (selectedFile: File) => {
    setIsProcessing(true);
    setError(null);

    try {
      // Get the appropriate prompt based on file type
      let documentType = "unknown";
      if (selectedFile.name.endsWith('.pdf')) documentType = "document";
      if (selectedFile.name.includes('contract')) documentType = "contract";
      if (selectedFile.name.includes('complaint') || selectedFile.name.includes('lawsuit')) documentType = "lawsuit";
      if (selectedFile.name.includes('will') || selectedFile.name.includes('testament')) documentType = "will";

      const prompt = getLegalDocumentSummaryPrompt(documentType);

      // Call the Gemini API through our service
      const result = await summarizeDocument(selectedFile, prompt);

      setSummary(result);
      setActiveStep(2);
    } catch (error) {
      console.error('Error processing document:', error);
      setError(error instanceof Error ? error.message : 'An unexpected error occurred');
    } finally {
      setIsProcessing(false);
    }
  };

  const resetForm = () => {
    setFile(null);
    setSummary('');
    setActiveStep(0);
    setIsProcessing(false);
    setError(null);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="flex justify-center items-center p-4 min-h-screen bg-gradient-to-b from-background to-secondary/10"
    >
      <motion.div
        layout
        className={`bg-white rounded-xl shadow-2xl overflow-hidden transition-all duration-300 ease-in-out 
          ${isExpanded ? 'w-full h-full' : 'w-[90%] h-[85vh]'}`}
      >
        {/* Header */}
        <motion.div
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="flex justify-between items-center p-4 bg-gray-50 border-b border-gray-200"
        >
          <h2 className="flex items-center space-x-2 text-2xl font-bold text-primary">
            <Scale className="w-6 h-6 text-primary" />
            <span>Legal Document Summarizer</span>
          </h2>
          <div className="flex space-x-2">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-2 rounded-full transition-colors duration-200 hover:bg-gray-100"
            >
              {isExpanded ?
                <Minimize2 className="w-5 h-5 text-gray-600" /> :
                <Maximize2 className="w-5 h-5 text-gray-600" />
              }
            </motion.button>
            <motion.button
              whileHover={{ rotate: 180 }}
              transition={{ duration: 0.3 }}
              onClick={resetForm}
              className="p-2 rounded-full transition-colors duration-200 hover:bg-gray-100"
            >
              <RotateCcw className="w-5 h-5 text-gray-600" />
            </motion.button>
          </div>
        </motion.div>

        <div className="flex flex-col h-[calc(100%-4rem)] overflow-y-auto">
          <div className="p-6">
            {/* Steps */}
            <div className="grid gap-4 mb-8 md:grid-cols-3">
              <AnimatePresence>
                {steps.map((step, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className={`p-6 rounded-xl border-2 transition-all duration-300 ${activeStep === index
                      ? 'border-primary bg-primary/5'
                      : activeStep > index
                        ? 'border-green-500 bg-green-50'
                        : 'border-gray-200 bg-white'
                      }`}
                  >
                    <div className="flex justify-between items-center mb-4">
                      <div className="flex items-center space-x-3">
                        <step.icon className={`w-6 h-6 ${activeStep === index ? 'text-primary' :
                          activeStep > index ? 'text-green-500' : 'text-gray-400'
                          }`} />
                        <span className={`text-lg font-semibold ${activeStep === index ? 'text-primary' : 'text-gray-900'
                          }`}>
                          {step.title}
                        </span>
                      </div>
                      {activeStep > index && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ type: "spring", stiffness: 500, damping: 30 }}
                        >
                          <CheckCircle className="w-5 h-5 text-green-500" />
                        </motion.div>
                      )}
                    </div>
                    <p className="text-gray-600">{step.description}</p>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            {/* Main Content */}
            <div className="grid gap-8 md:grid-cols-2">
              {/* Left Panel - Upload */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="p-6 bg-white rounded-xl border border-gray-200 shadow-sm"
              >
                <h2 className="mb-4 text-xl font-semibold text-primary">Upload Document</h2>
                <motion.div
                  whileHover={{ scale: 1.01 }}
                  className="p-8 text-center rounded-lg border-2 border-dashed transition-colors cursor-pointer border-primary/30 hover:bg-gray-50"
                  onDrop={handleDrop}
                  onDragOver={handleDragOver}
                >
                  <Upload className="mx-auto mb-4 w-12 h-12 text-primary" />
                  <p className="mb-4 text-gray-600">Drag and drop your document here or</p>
                  <label className="px-4 py-2 text-white rounded-lg transition-colors cursor-pointer bg-primary hover:bg-primary/90">
                    Browse Files
                    <input
                      type="file"
                      className="hidden"
                      onChange={handleFileChange}
                      accept=".pdf,.doc,.docx,.txt"
                    />
                  </label>
                  <p className="mt-4 text-sm text-gray-500">Supported formats: PDF, DOC, DOCX, TXT</p>
                </motion.div>

                <AnimatePresence>
                  {file && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      className="flex justify-between items-center p-4 mt-4 rounded-lg bg-primary/5"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="p-2 rounded-full bg-primary/10">
                          <CheckCircle className="w-4 h-4 text-primary" />
                        </div>
                        <span className="font-medium text-gray-700">{file.name}</span>
                      </div>
                      <ChevronRight className="w-5 h-5 text-primary" />
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>

              {/* Right Panel - Summary */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="p-6 bg-white rounded-xl border border-gray-200 shadow-sm"
              >
                <h2 className="mb-4 text-xl font-semibold text-primary">Document Summary</h2>
                <AnimatePresence mode="wait">
                  {isProcessing ? (
                    <motion.div
                      key="processing"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="flex flex-col justify-center items-center h-64"
                    >
                      <div className="w-16 h-16 rounded-full border-4 animate-spin border-primary border-t-transparent" />
                      <p className="mt-4 text-gray-600">Analyzing document with Gemini AI...</p>
                    </motion.div>
                  ) : error ? (
                    <motion.div
                      key="error"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="p-4 bg-red-50 rounded-lg border border-red-300"
                    >
                      <div className="flex items-start">
                        <AlertCircle className="flex-shrink-0 mr-2 w-5 h-5 text-red-500" />
                        <div>
                          <h3 className="font-medium text-red-800">Error processing document</h3>
                          <p className="mt-1 text-sm text-red-700">{error}</p>
                        </div>
                      </div>
                      <button
                        onClick={resetForm}
                        className="px-3 py-1 mt-3 text-sm text-white rounded-md bg-primary"
                      >
                        Try Again
                      </button>
                    </motion.div>
                  ) : summary ? (
                    <motion.div
                      key="summary"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="space-y-4"
                    >
                      <motion.div
                        className="p-4 overflow-y-auto rounded-lg bg-gray-50 max-h-[500px] prose prose-sm prose-headings:mb-2 prose-headings:mt-4 prose-p:my-1 prose-ul:my-1 prose-li:my-0.5"
                        initial={{ y: 10 }}
                        animate={{ y: 0 }}
                      >
                        <ReactMarkdown>
                          {summary}
                        </ReactMarkdown>
                      </motion.div>
                      <div className="flex justify-between">
                        <a
                          href={`data:text/markdown;charset=utf-8,${encodeURIComponent(summary)}`}
                          download="legal_summary.md"
                          className="flex items-center space-x-2 text-primary hover:text-primary/90"
                        >
                          <Download className="w-5 h-5" />
                          <span>Download Summary</span>
                        </a>
                        <button
                          onClick={resetForm}
                          className="flex items-center text-sm text-gray-600 hover:text-gray-900"
                        >
                          <RotateCcw className="mr-1 w-4 h-4" />
                          <span>New Document</span>
                        </button>
                      </div>
                    </motion.div>
                  ) : (
                    <motion.div
                      key="no-summary"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="text-center text-gray-600"
                    >
                      <AlertCircle className="mx-auto w-12 h-12 text-gray-500" />
                      <p className="mt-4">No summary yet. Upload a document to get started.</p>
                      <p className="mt-2 text-sm text-gray-500">Our AI will analyze your document and provide a comprehensive legal summary.</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default DocumentSummarizer;
