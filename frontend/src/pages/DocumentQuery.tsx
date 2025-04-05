import { useState, useRef, ChangeEvent, FormEvent, FC, useEffect } from 'react';
import {
  Paperclip,
  X,
  Maximize2,
  Minimize2,
  RotateCcw,
  Send,
  FileText,
  AlertCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { initializeDocumentChat, sendChatMessage } from '../services/ragChatService';
import { getDocumentChatPrompt, getDocumentChatSystemPrompt } from '../prompts/documentChatPrompt';

// Enhanced type definitions with more specificity
type MessageType = 'user' | 'bot' | 'system';
type FileType = File & { preview?: string };

interface Message {
  id: string;
  type: MessageType;
  content: string;
  timestamp: number;
}

interface FileInfo {
  name: string;
  size: number;
  type: string;
}

// Utility function for generating unique IDs
const generateId = (): string =>
  `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

// Utility function for formatting file sizes
const formatFileSize = (bytes: number): string => {
  const units = ['B', 'KB', 'MB', 'GB'];
  let size = bytes;
  let unitIndex = 0;

  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex++;
  }

  return `${size.toFixed(1)} ${units[unitIndex]}`;
};

// Utility to determine document type from file name/type
const detectDocumentType = (fileName: string): string => {
  const lowerName = fileName.toLowerCase();

  if (lowerName.includes('contract') || lowerName.includes('agreement')) {
    return 'contract';
  } else if (lowerName.includes('brief') || lowerName.includes('motion') || lowerName.includes('petition')) {
    return 'legal_brief';
  } else if (lowerName.includes('statute') || lowerName.includes('act') || lowerName.includes('regulation')) {
    return 'legislation';
  } else if (lowerName.includes('memo') || lowerName.includes('opinion') || lowerName.includes('analysis')) {
    return 'legal_memo';
  }

  return '';
};

const DocumentQuery: FC = () => {
  // State for messages and chat
  const [messages, setMessages] = useState<Message[]>([]);
  const [chatHistory, setChatHistory] = useState<{ role: 'user' | 'model', content: string }[]>([]);
  const [inputValue, setInputValue] = useState<string>('');

  // State for file and document context
  const [file, setFile] = useState<FileType | null>(null);
  const [fileInfo, setFileInfo] = useState<FileInfo | null>(null);
  const [documentContext, setDocumentContext] = useState<string>('');
  const [isProcessingFile, setIsProcessingFile] = useState<boolean>(false);
  const [isProcessingMessage, setIsProcessingMessage] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // UI state
  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  const [isFilePreviewOpen, setIsFilePreviewOpen] = useState<boolean>(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Handle file upload
  const handleFileChange = async (e: ChangeEvent<HTMLInputElement>): Promise<void> => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setError(null);
      const typedFile = selectedFile as FileType;
      typedFile.preview = URL.createObjectURL(selectedFile);

      setFile(typedFile);
      setFileInfo({
        name: selectedFile.name,
        size: selectedFile.size,
        type: selectedFile.type
      });
      setIsFilePreviewOpen(true);

      // Process document with Gemini
      await processDocument(selectedFile);
    }
  };

  // Process document with Gemini
  const processDocument = async (documentFile: File): Promise<void> => {
    // Reset any previous chat
    setMessages([]);
    setChatHistory([]);
    setDocumentContext('');
    setIsProcessingFile(true);
    setError(null);

    try {
      // Detect document type from filename
      const docType = detectDocumentType(documentFile.name);

      // Get appropriate prompt for the document type
      const initialPrompt = getDocumentChatPrompt(docType);

      // Add loading message
      const loadingMsgId = generateId();
      setMessages([{
        id: loadingMsgId,
        type: 'system',
        content: 'Analyzing document...',
        timestamp: Date.now()
      }]);

      // Initialize document context with Gemini
      const context = await initializeDocumentChat(documentFile, initialPrompt);
      setDocumentContext(context);

      // Remove loading message and add welcome message
      setMessages(prev => {
        const filtered = prev.filter(msg => msg.id !== loadingMsgId);
        return [
          ...filtered,
          {
            id: generateId(),
            type: 'bot',
            content: 'I\'ve analyzed the document. What would you like to know about it?',
            timestamp: Date.now()
          }
        ];
      });
    } catch (error) {
      console.error("Error processing document", error);
      setError(error instanceof Error ? error.message : 'Failed to process document');

      // Remove loading message and add error message
      setMessages(prev => {
        const filtered = prev.filter(msg => msg.type !== 'system');
        return [
          ...filtered,
          {
            id: generateId(),
            type: 'system',
            content: 'Error: Failed to analyze document. Please try again.',
            timestamp: Date.now()
          }
        ];
      });
    } finally {
      setIsProcessingFile(false);
    }
  };

  // Handle chat message submission
  const handleSubmit = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();

    if (!inputValue.trim() || !documentContext) return;

    // Add user message to UI
    const userMessageId = generateId();
    const userMessage: Message = {
      id: userMessageId,
      type: 'user',
      content: inputValue,
      timestamp: Date.now()
    };

    setMessages(prevMessages => [...prevMessages, userMessage]);

    // Add to chat history for context
    setChatHistory(prev => [...prev, { role: 'user', content: inputValue }]);

    // Clear input
    setInputValue('');

    // Process with Gemini
    await processUserMessage(inputValue);
  };

  // Process user message with Gemini
  const processUserMessage = async (message: string): Promise<void> => {
    if (!documentContext) {
      setError('No document context available. Please upload a document first.');
      return;
    }

    setIsProcessingMessage(true);

    // Add loading indicator
    const loadingMsgId = generateId();
    setMessages(prev => [
      ...prev,
      {
        id: loadingMsgId,
        type: 'system',
        content: 'Thinking...',
        timestamp: Date.now()
      }
    ]);

    try {
      // Send message to Gemini
      const response = await sendChatMessage(message, chatHistory, documentContext);

      // Remove loading message
      setMessages(prev => prev.filter(msg => msg.id !== loadingMsgId));

      // Add response to UI
      const botMessage: Message = {
        id: generateId(),
        type: 'bot',
        content: response,
        timestamp: Date.now()
      };

      setMessages(prev => [...prev, botMessage]);

      // Add to chat history for context
      setChatHistory(prev => [...prev, { role: 'model', content: response }]);
    } catch (error) {
      console.error("Error processing message", error);

      // Remove loading message
      setMessages(prev => prev.filter(msg => msg.id !== loadingMsgId));

      // Add error message
      setMessages(prev => [
        ...prev,
        {
          id: generateId(),
          type: 'system',
          content: 'Error: Failed to process your message. Please try again.',
          timestamp: Date.now()
        }
      ]);
    } finally {
      setIsProcessingMessage(false);
    }
  };

  // Scroll to the bottom of the chat
  const scrollToBottom = (): void => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTo({
        top: chatContainerRef.current.scrollHeight,
        behavior: 'smooth'
      });
    }
  };

  // Remove file and reset state
  const removeFile = (): void => {
    if (file?.preview) {
      URL.revokeObjectURL(file.preview);
    }

    setFile(null);
    setFileInfo(null);
    setIsFilePreviewOpen(false);
    setDocumentContext('');
    setMessages([]);
    setChatHistory([]);

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Reset the entire chat
  const resetChat = (): void => {
    setMessages([]);
    setChatHistory([]);

    // Don't remove the document context, just start a fresh conversation
    if (documentContext) {
      setMessages([{
        id: generateId(),
        type: 'bot',
        content: 'I\'ve reset our conversation. What would you like to know about the document?',
        timestamp: Date.now()
      }]);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="flex items-center justify-center min-h-screen p-4 bg-gradient-to-b from-background to-secondary/10"
    >
      <motion.div
        layout
        className={`bg-white rounded-xl shadow-2xl overflow-hidden transition-all duration-300 ease-in-out 
          ${isExpanded ? 'w-full h-full' : 'w-[80%] h-[75vh]'}`}
      >
        <div className="flex flex-col h-full">
          <motion.div
            initial={{ y: -50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="flex items-center justify-between p-4 border-b border-gray-200 bg-gray-50"
          >
            <h2 className="flex items-center space-x-2 text-2xl font-bold text-primary">
              <FileText className="w-6 h-6 text-primary" />
              <span>Document Query</span>
            </h2>
            <div className="flex space-x-2">
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setIsExpanded(!isExpanded)}
                className="p-2 transition-colors duration-200 rounded-full hover:bg-gray-100"
              >
                {isExpanded ? <Minimize2 className="w-5 h-5 text-gray-600" /> : <Maximize2 className="w-5 h-5 text-gray-600" />}
              </motion.button>
              <motion.button
                whileHover={{ rotate: 180 }}
                onClick={resetChat}
                className="p-2 transition-colors duration-200 rounded-full hover:bg-gray-100"
              >
                <RotateCcw className="w-5 h-5 text-gray-600" />
              </motion.button>
            </div>
          </motion.div>

          <div
            ref={chatContainerRef}
            className="flex-1 p-4 space-y-4 overflow-y-auto"
          >
            {/* Welcome message when no document is loaded */}
            {messages.length === 0 && !file && (
              <div className="flex items-center justify-center h-full">
                <div className="text-center p-6 max-w-md">
                  <FileText className="mx-auto w-16 h-16 text-primary/40 mb-4" />
                  <h3 className="text-xl font-medium text-gray-800 mb-2">Upload a Document</h3>
                  <p className="text-gray-600 mb-4">
                    Upload a document and ask questions about its content. I'll analyze the document and help you understand it.
                  </p>
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
                  >
                    <Paperclip className="inline-block w-4 h-4 mr-2" />
                    Upload Document
                  </button>
                </div>
              </div>
            )}

            {/* Error message */}
            {error && (
              <div className="p-4 mb-4 bg-red-50 rounded-lg border border-red-200">
                <div className="flex items-start">
                  <AlertCircle className="w-5 h-5 text-red-500 mr-2 flex-shrink-0" />
                  <div>
                    <h3 className="font-medium text-red-800">Error</h3>
                    <p className="text-sm text-red-700">{error}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Chat messages */}
            <AnimatePresence>
              {messages.map((message) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, x: message.type === 'user' ? 50 : message.type === 'system' ? 0 : -50 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className={`flex ${message.type === 'user' ? 'justify-end' :
                    message.type === 'system' ? 'justify-center' : 'justify-start'
                    }`}
                >
                  {message.type === 'system' ? (
                    <div className="py-2 px-4 bg-gray-100 rounded-lg text-gray-600 text-sm">
                      {message.content}
                    </div>
                  ) : (
                    <div
                      className={`max-w-[70%] rounded-lg p-3 ${message.type === 'user'
                        ? 'bg-primary text-white'
                        : 'bg-gray-200 text-gray-800'
                        } shadow-sm`}
                    >
                      <div className="whitespace-pre-line">{message.content}</div>
                    </div>
                  )}
                </motion.div>
              ))}
            </AnimatePresence>

            {/* File processing indicator */}
            {isProcessingFile && (
              <div className="flex justify-center">
                <div className="flex items-center space-x-2 bg-primary/10 text-primary px-4 py-2 rounded-full">
                  <div className="w-4 h-4 rounded-full border-2 border-primary border-t-transparent animate-spin"></div>
                  <span>Analyzing document...</span>
                </div>
              </div>
            )}
          </div>

          <AnimatePresence>
            {isFilePreviewOpen && fileInfo && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="p-4 border-t border-gray-200 bg-gray-50"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Paperclip className="w-5 h-5 text-gray-500" />
                    <span className="text-sm font-medium text-gray-700">{fileInfo.name}</span>
                    <span className="text-xs text-gray-500">
                      ({formatFileSize(fileInfo.size)})
                    </span>
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={removeFile}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    <X className="w-5 h-5" />
                  </motion.button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="p-4 bg-white border-t border-gray-200">
            <form onSubmit={handleSubmit} className="flex flex-col space-y-2">
              <motion.div
                initial={{ y: 50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2, duration: 0.5 }}
                className="flex items-center space-x-2"
              >
                <input
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder={documentContext ? "Ask a question about the document..." : "Upload a document first..."}
                  disabled={!documentContext || isProcessingFile || isProcessingMessage}
                  className="flex-1 p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary disabled:bg-gray-100 disabled:text-gray-400"
                />
                <label>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".pdf,.doc,.docx,.txt"
                    onChange={handleFileChange}
                    disabled={isProcessingFile || isProcessingMessage}
                    className="hidden"
                  />
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    type="button"
                    disabled={isProcessingFile || isProcessingMessage}
                    onClick={() => fileInputRef.current?.click()}
                    className={`p-2 rounded-full transition-colors duration-200 ${isProcessingFile || isProcessingMessage
                      ? 'text-gray-400 bg-gray-100'
                      : 'text-gray-500 hover:bg-gray-100'
                      }`}
                  >
                    <Paperclip className="w-5 h-5" />
                  </motion.button>
                </label>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  type="submit"
                  disabled={!inputValue.trim() || !documentContext || isProcessingFile || isProcessingMessage}
                  className={`p-2 rounded-full ${!inputValue.trim() || !documentContext || isProcessingFile || isProcessingMessage
                    ? 'bg-gray-300'
                    : 'bg-primary hover:bg-primary/90'
                    } text-white transition-colors`}
                >
                  <Send className="w-5 h-5" />
                </motion.button>
              </motion.div>
            </form>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default DocumentQuery;
