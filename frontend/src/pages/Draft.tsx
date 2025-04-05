import React, { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { Document, Packer, Paragraph, TextRun } from 'docx';
import { saveAs } from 'file-saver';
import { motion, AnimatePresence } from 'framer-motion';
import { FileText, File, Loader, AlertCircle, CheckCircle, Maximize2, Minimize2, RotateCcw, Download } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { INDIAN_LEGAL_REFERENCES, GROQ_MODELS } from '../ai/draftPrompt';
import { DraftService } from '../services/draftService';
import { DocumentType, FormInputs } from '../types/draft';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

// Add Indian states for state-specific requirements
const INDIAN_STATES = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
  'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka',
  'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram',
  'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu',
  'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal',
  'Delhi', 'Jammu and Kashmir', 'Ladakh', 'Puducherry'
] as const;

// Memoized function for getting document type specific help text
const getHelpText = (documentType: DocumentType) => {
  if (documentType === 'Other') return '';
  const refs = INDIAN_LEGAL_REFERENCES[documentType];
  return refs.acts.map(act => `${act.name}: ${act.sections.join(', ')}`).join('\n');
};

// Get placeholder text for document type
const getPlaceholderForDocumentType = (documentType: DocumentType | undefined): string => {
  switch (documentType) {
    case 'Rent Agreement':
      return 'Enter details such as property address, rent amount, lease term, security deposit...';
    case 'Employment Contract':
      return 'Enter details such as job title, salary, start date, working hours, benefits...';
    case 'Non-Disclosure Agreement':
      return 'Enter details such as confidential information definition, duration of agreement, permitted uses...';
    case 'Will':
      return 'Enter details such as beneficiaries, assets to be distributed, executor...';
    case 'Other':
    default:
      return 'Enter specific details relevant to this document type...';
  }
};

const LegalDocumentGenerator: React.FC = () => {
  // Main content states
  const [generatedContent, setGeneratedContent] = useState<string>('');
  const [isStreaming, setIsStreaming] = useState<boolean>(false);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);

  // UI states
  const [apiError, setApiError] = useState<string | null>(null);
  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  const [model, setModel] = useState<string>(GROQ_MODELS.PRIMARY);
  const [useStreaming, setUseStreaming] = useState<boolean>(true);

  // References
  const contentRef = useRef<HTMLDivElement>(null);
  const accumulatedContentRef = useRef<string>('');

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue
  } = useForm<FormInputs>({
    defaultValues: {
      documentType: undefined,
      partyA: '',
      partyB: '',
      additionalDetails: '',
      specificDetails: '',
      state: ''
    }
  });

  const selectedDocumentType = watch('documentType');

  // Memoize help text computation
  const helpText = useMemo(() =>
    selectedDocumentType ? getHelpText(selectedDocumentType as DocumentType) : '',
    [selectedDocumentType]
  );

  // Auto-scroll to bottom when streaming content updates
  useEffect(() => {
    if (isStreaming && contentRef.current) {
      contentRef.current.scrollTop = contentRef.current.scrollHeight;
    }
  }, [generatedContent, isStreaming]);

  // Handle streaming chunks from API
  const handleStreamChunk = useCallback((chunk: string, done: boolean) => {
    // Accumulate content in ref to avoid state update batching issues
    accumulatedContentRef.current += chunk;

    // Update the displayed content
    setGeneratedContent(accumulatedContentRef.current);

    // If streaming is done, update the state
    if (done) {
      // First update the final content
      setGeneratedContent(accumulatedContentRef.current);

      // Then update streaming and loading states
      setIsStreaming(false);
      setIsGenerating(false);
    }
  }, []);

  // Handle form submission
  const onSubmit: SubmitHandler<FormInputs> = useCallback(async (data) => {
    // Reset states
    setApiError(null);
    setIsGenerating(true);
    setGeneratedContent('');
    accumulatedContentRef.current = '';

    try {
      if (useStreaming) {
        // Start streaming mode
        setIsStreaming(true);
        await DraftService.streamDocument(data, handleStreamChunk);
      } else {
        // Use standard mode
        const document = await DraftService.generateDocument(data);
        setGeneratedContent(document);
        setIsGenerating(false);
      }
    } catch (error) {
      console.error("Document generation error:", error);
      const errorMessage = error instanceof Error ? error.message : "An error occurred while generating the document.";
      setApiError(errorMessage);
      setIsGenerating(false);
      setIsStreaming(false);

      // If we got a model error, switch to fallback model automatically
      if (errorMessage.includes('model') && model === GROQ_MODELS.PRIMARY) {
        setModel(GROQ_MODELS.FALLBACK);
        setTimeout(() => {
          handleSubmit(onSubmit)();
        }, 1000);
      }
    }
  }, [handleStreamChunk, handleSubmit, model, useStreaming]);

  // Handle PDF download
  const handleDownloadPDF = useCallback(async () => {
    if (!contentRef.current) {
      setApiError("Could not access document content. Please try again.");
      return;
    }

    try {
      setApiError(null);

      // Create loading state for PDF generation
      const loadingMessage = document.createElement('div');
      loadingMessage.className = 'flex fixed top-0 left-0 z-50 justify-center items-center w-full h-full text-white bg-black bg-opacity-50';
      loadingMessage.innerHTML = '<div class="text-center"><div class="inline-block mb-2 w-8 h-8 rounded-full border-4 border-white animate-spin border-t-transparent"></div><p>Generating PDF...</p></div>';
      document.body.appendChild(loadingMessage);

      // Small delay to ensure loading message is shown
      await new Promise(resolve => setTimeout(resolve, 100));

      // Create PDF
      const content = contentRef.current;
      const canvas = await html2canvas(content, {
        scale: 2, // Higher scale for better quality
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff'
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });

      // Calculate dimensions to fit page properly
      const imgWidth = 210; // A4 width in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      const pageHeight = 297; // A4 height in mm
      let heightLeft = imgHeight;
      let position = 0;

      // Add first page
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      // Add additional pages if content is longer than one page
      while (heightLeft > 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      // Save PDF
      pdf.save(`legal_document_${Date.now()}.pdf`);

      // Remove loading message
      document.body.removeChild(loadingMessage);

    } catch (error) {
      console.error("PDF generation error:", error);
      setApiError("Failed to generate PDF. Please try again.");
    }
  }, []);

  // Handle DOCX download
  const handleDownloadDocx = useCallback((): void => {
    if (!generatedContent) {
      setApiError("No content to generate DOCX. Please generate a document first.");
      return;
    }

    try {
      const doc = new Document({
        sections: [{
          properties: {},
          children: generatedContent.split("\n").map(line =>
            new Paragraph({
              children: [new TextRun({ text: line, size: 24 })]
            })
          ),
        }]
      });

      Packer.toBlob(doc).then(blob => {
        saveAs(blob, `legal_document_${Date.now()}.docx`);
      }).catch(error => {
        console.error("DOCX generation error:", error);
        setApiError("Failed to generate DOCX. Please try again.");
      });
    } catch (error) {
      console.error("DOCX creation error:", error);
      setApiError("Failed to create DOCX document. Please try again.");
    }
  }, [generatedContent]);

  // Reset all form and content states
  const resetForm = useCallback(() => {
    setGeneratedContent('');
    accumulatedContentRef.current = '';
    setApiError(null);
    setIsStreaming(false);
    setIsGenerating(false);
    setModel(GROQ_MODELS.PRIMARY);
  }, []);

  // Determine if we have content to show
  const hasContent = !!generatedContent;
  const isLoading = isGenerating && !isStreaming;

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
        <motion.div
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="flex justify-between items-center p-4 bg-gray-50 border-b border-gray-200"
        >
          <h2 className="flex items-center space-x-2 text-2xl font-bold text-primary">
            <FileText className="w-6 h-6 text-primary" />
            <span>AI Legal Document Generator</span>
            {model === GROQ_MODELS.FALLBACK && (
              <span className="px-2 py-1 ml-2 text-xs font-semibold text-amber-800 bg-amber-100 rounded-full">
                Using fallback model
              </span>
            )}
          </h2>
          <div className="flex space-x-2">
            <label className="flex items-center cursor-pointer">
              <span className="mr-2 text-sm text-gray-600">Streaming</span>
              <input
                type="checkbox"
                checked={useStreaming}
                onChange={(e) => setUseStreaming(e.target.checked)}
                className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary"
              />
            </label>
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
              onClick={resetForm}
              className="p-2 rounded-full transition-colors duration-200 hover:bg-gray-100"
            >
              <RotateCcw className="w-5 h-5 text-gray-600" />
            </motion.button>
          </div>
        </motion.div>

        <div className="flex flex-col h-[calc(100%-4rem)] overflow-y-auto">
          <div className="p-6">
            <motion.form
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              onSubmit={handleSubmit(onSubmit)}
              className="space-y-6"
            >
              <motion.div layout>
                <label htmlFor="documentType" className="block text-sm font-medium text-gray-700">
                  Document Type
                </label>
                <select
                  id="documentType"
                  {...register("documentType", { required: "Document type is required" })}
                  className="block px-3 py-2 mt-1 w-full rounded-lg border shadow-sm focus:ring-2 focus:ring-primary focus:border-primary"
                >
                  <option value="">Select Document Type</option>
                  {Object.keys(INDIAN_LEGAL_REFERENCES).map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                  <option value="Other">Other</option>
                </select>
                {errors.documentType && (
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="mt-2 text-sm text-red-600"
                  >
                    {errors.documentType.message}
                  </motion.p>
                )}
              </motion.div>

              <motion.div layout>
                <label htmlFor="partyA" className="block text-sm font-medium text-gray-700">
                  Party A (First Party)
                </label>
                <input
                  type="text"
                  id="partyA"
                  {...register("partyA", { required: "Party A is required" })}
                  className="block px-3 py-2 mt-1 w-full rounded-lg border shadow-sm focus:ring-2 focus:ring-primary focus:border-primary"
                />
                {errors.partyA && (
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="mt-2 text-sm text-red-600"
                  >
                    {errors.partyA.message}
                  </motion.p>
                )}
              </motion.div>

              <motion.div layout>
                <label htmlFor="partyB" className="block text-sm font-medium text-gray-700">
                  Party B (Second Party)
                </label>
                <input
                  type="text"
                  id="partyB"
                  {...register("partyB", { required: "Party B is required" })}
                  className="block px-3 py-2 mt-1 w-full rounded-lg border shadow-sm focus:ring-2 focus:ring-primary focus:border-primary"
                />
                {errors.partyB && (
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="mt-2 text-sm text-red-600"
                  >
                    {errors.partyB.message}
                  </motion.p>
                )}
              </motion.div>

              <motion.div layout>
                <label htmlFor="additionalDetails" className="block text-sm font-medium text-gray-700">
                  Additional Details
                </label>
                <textarea
                  id="additionalDetails"
                  {...register("additionalDetails", { required: "Additional details are required" })}
                  placeholder="Enter any additional terms, conditions, or relevant information for the document..."
                  className="block w-full px-3 py-2 mt-1 border rounded-lg shadow-sm focus:ring-2 focus:ring-primary focus:border-primary min-h-[100px]"
                />
                {errors.additionalDetails && (
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="mt-2 text-sm text-red-600"
                  >
                    {errors.additionalDetails.message}
                  </motion.p>
                )}
              </motion.div>

              <motion.div layout>
                <label htmlFor="specificDetails" className="block text-sm font-medium text-gray-700">
                  {selectedDocumentType ? `Specific Details for ${selectedDocumentType}` : 'Specific Details'}
                </label>
                <textarea
                  id="specificDetails"
                  {...register("specificDetails", { required: "Specific details are required" })}
                  placeholder={getPlaceholderForDocumentType(selectedDocumentType as DocumentType)}
                  className="block w-full px-3 py-2 mt-1 border rounded-lg shadow-sm focus:ring-2 focus:ring-primary focus:border-primary min-h-[100px]"
                />
                {errors.specificDetails && (
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="mt-2 text-sm text-red-600"
                  >
                    {errors.specificDetails.message}
                  </motion.p>
                )}
              </motion.div>

              {selectedDocumentType && selectedDocumentType !== 'Other' && (
                <motion.div layout>
                  <label htmlFor="state" className="block text-sm font-medium text-gray-700">
                    State (for state-specific requirements)
                  </label>
                  <select
                    id="state"
                    {...register("state")}
                    className="block px-3 py-2 mt-1 w-full rounded-lg border shadow-sm focus:ring-2 focus:ring-primary focus:border-primary"
                  >
                    <option value="">Select State</option>
                    {INDIAN_STATES.map(state => (
                      <option key={state} value={state}>{state}</option>
                    ))}
                  </select>
                </motion.div>
              )}

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                className="flex justify-center items-center px-4 py-2 w-full text-white rounded-lg transition-colors bg-primary hover:bg-primary/90"
                disabled={isGenerating}
              >
                {isGenerating ? (
                  <Loader className="mr-2 w-5 h-5 animate-spin" />
                ) : (
                  <FileText className="mr-2 w-5 h-5" />
                )}
                {isGenerating ? (isStreaming ? 'Generating...' : 'Processing...') : 'Generate Document'}
              </motion.button>
            </motion.form>

            <AnimatePresence>
              {apiError && (
                <motion.div
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="flex items-center p-4 mt-4 space-x-2 text-red-700 bg-red-100 rounded-lg border border-red-400"
                >
                  <AlertCircle className="flex-shrink-0 w-5 h-5" />
                  <span className="text-sm">{apiError}</span>
                  {model === GROQ_MODELS.FALLBACK && (
                    <button
                      onClick={() => {
                        setModel(GROQ_MODELS.PRIMARY);
                        setApiError(null);
                      }}
                      className="ml-auto text-xs font-medium text-red-700 underline"
                    >
                      Try primary model
                    </button>
                  )}
                </motion.div>
              )}
            </AnimatePresence>

            {isLoading && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="p-5 mt-6 space-y-4 rounded-lg border-2 border-gray-200"
              >
                <div className="w-full h-5 bg-gray-200 rounded-md animate-pulse"></div>
                <div className="w-3/4 h-5 bg-gray-200 rounded-md animate-pulse"></div>
                <div className="w-1/2 h-5 bg-gray-200 rounded-md animate-pulse"></div>
              </motion.div>
            )}

            <AnimatePresence>
              {(hasContent || isStreaming) && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 20 }}
                  className="mt-6"
                >
                  <div
                    ref={contentRef}
                    className="p-6 overflow-auto bg-white border-2 border-gray-200 rounded-lg shadow-lg max-h-[60vh] print:shadow-none print:max-h-none"
                    style={{
                      fontFamily: '"Times New Roman", Times, serif',
                      lineHeight: 1.6
                    }}
                  >
                    <ReactMarkdown
                      className="prose prose-headings:font-serif prose-headings:text-slate-800 prose-p:text-justify prose-p:text-slate-700"
                    >
                      {generatedContent}
                    </ReactMarkdown>
                    {isStreaming && (
                      <span className="inline-block ml-1 w-2 h-4 animate-pulse bg-primary" />
                    )}
                  </div>

                  <div className="flex gap-4 mt-4">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={handleDownloadDocx}
                      disabled={!hasContent || isGenerating}
                      className="flex flex-1 justify-center items-center px-4 py-2 text-white rounded-lg transition-colors bg-secondary hover:bg-secondary/90 disabled:bg-gray-300 disabled:cursor-not-allowed"
                    >
                      <File className="mr-2 w-5 h-5" />
                      Download DOCX
                    </motion.button>

                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={handleDownloadPDF}
                      disabled={!hasContent || isGenerating}
                      className="flex flex-1 justify-center items-center px-4 py-2 text-white rounded-lg transition-colors bg-primary hover:bg-primary/90 disabled:bg-gray-300 disabled:cursor-not-allowed"
                    >
                      <Download className="mr-2 w-5 h-5" />
                      Download PDF
                    </motion.button>
                  </div>

                  {hasContent && !isStreaming && (
                    <motion.div
                      initial={{ opacity: 0, y: -20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      className="flex justify-center items-center mt-4 space-x-2 text-green-600"
                    >
                      <CheckCircle className="w-5 h-5" />
                      <span>Document generated successfully!</span>
                    </motion.div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>

            {helpText && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="p-4 mt-4 text-sm text-gray-600 bg-gray-50 rounded-lg"
              >
                <h4 className="mb-2 font-medium">Relevant Legal References:</h4>
                <pre className="whitespace-pre-wrap">{helpText}</pre>
              </motion.div>
            )}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default React.memo(LegalDocumentGenerator);